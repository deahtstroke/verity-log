---
title: "Using the IPVlan Network Driver with Docker Swarm"
description: "Some discoveries and insights on the IPvlan driver that replaced host networking in my Docker Swarm stack"
date: "2026-07-27"
thumbnailText: "IPvlan"
categories: ["Docker", "Docker Swarm", "Linux", "Networks", "IPvlan"]
published: false
colorStart: "180 100% 50%"
colorEnd: "193 100% 50%"
timeToRead: "12 mins"
---

## Overview

While revisiting my [Rivenbot](https://github.com/riven-of-a-thousand-servers) project
I tried redeploying one of the services I had created a while ago: A Rotating-Reverse Proxy.
There are two major reasons as to why I needed a RR-proxy: First, my project
relied on having an up-to-date database of user activity, and my only
source of real-time data came from a REST API exposed by Bungie itself, and
second, Bungie's rate limits makes it impossible to stay in track with the
influx of generated data for players using a single IP address. Therefore,
using several IPv6 addresses would help me circumvent this issue, within the
"legal" confines of bypassing rate-limits set by developers of course.
Having talked and confirmed with the API developers that as long as
bandwidth is not abuse we are allowed to scrape with multiple IPs lightens up
worrying about legal issues!

The proxy itself is very simple: It attaches to one of the network interfaces
in the host, given that the interface has routable and valid IPs attached
to it, then it just simply round-robins through the provided IPs as
requests come in, whilst at the same time rate-limiting requests based
on the target URL path and the domain provided.

This all sounds pretty straight forward and even more so if I were to deploy
the proxy right on top of the host's network. However, I created Rivenbot using
containerization for all its services with the help of Docker Swarm for managing
machines across different locations. This puts complicates deploying the proxy
as a standalone program in a host machine. However, to understand
how IPvlan solved my issue, its good to understand the benefits of
the Routing Mesh provided by Docker Swarm.

## Primer on Docker Swarm's Routing Mesh

Docker Swarm handles host/node service discovery and load-balancing through
[overlay networks](https://docs.docker.com/engine/network/drivers/overlay/).
Overlay networks are networks that allow communication between two hosts on
different networks by using a technology called VXLan. This, combined with gateway
bridges created by Swarm on each node creates a behavior called
_Routing Mesh_. The routing mesh itself makes it easy for outside clients to
access Swarm services through their published ports without knowing specific IP
addresses and port combinations for any replicated services. It makes
it easy to access, for example, a web-server container replicated
three times across various hosts without the client knowing
a specific `[host:port]` combination. Additionally, Swarm offers embedded
DNS resolutions for services running in the Swarm through their service name.
Instead of referring to Nginx by their IP address, you could make a request to
`http://nginx` and the DNS would resolve to the appropriate Nginx container.

> [!Note]
> Docker services **are not** the same as containers.
> Services are declarations made about the desired state of the cluster, usually
> in the form of properties in a YAML file.

This is a big oversimpliciation of how the routing mesh works, but hopefully
the point across is made that this behavior simplifies a lot of headaches when
it comes to distributed networking and Docker containers. This same
behavior is something that I still wanted to utilize in my project, which
meant that my original approach for deploying my RR-proxy was wrong.

## The Problem with Host networking and Docker Swarm

My first instinct to solve my problem was to use Docker's [Host network driver](https://docs.docker.com/engine/network/drivers/host/)
so my proxy would have direct access to the host network stack and avoid any
container-networking shenaningans. However, there was a big
caveat to using this driver with Docker Swarm: Using it alongside
Docker Swarm bypasses the routing mesh that gives me natural port publishing,
load balancing and DNS resolution across my services and my nodes.
The biggest benefit of these three that I did not want to
give up was **DNS resolution**. I wanted to have
the convenience of calling my Swarm services by its service name and have
the cluster be able to resolve to the right container seamlessly, including
the proxy service. And even though I was able to configure it using
Docker Stack:

```yaml
# docker-stack.yaml

services:
  proxy-service:
    image: rivenbot/proxy-service:${PROXY_SERVICE_VERSION:-latest}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8081/healthcheck"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s
    networks:
      - outside
    deploy:
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
      placement:
        constraints:
          - node.hostname==proxy-service-droplet
          - node.role==worker

# This is how you reference the host network
# from within a compose file
networks:
  outside:
    external:
      name: "host"
```

I even opened a [pull request in Docker Docs](https://www.github.com/docker/docs/pulls/)
to see if this super niche compose configuration should be added to the Docker docs
(It was not approved by the way). This was my original setup from
months before I came back to continue the project. Even though the PR was
rejected, it did highlight something that one of the maintainers said in
response to this change: "This is not the intended use of Docker Swarm", which
made me realize that this was not the right approach to the problem. It was
the easy approach, but not the best one.

## IPvlan Driver to the rescue

Months later, after some thorough research, very well-crafted prompts (not really),
and reading the available network drivers that were available with Docker,
I stumbled upon both the [IPVlan](https://docs.docker.com/engine/network/drivers/ipvlan)
and [Macvlan](https://docs.docker.com/engine/network/drivers/macvlan) network drivers.
They seemed like an intriguing idea for solving my issue, however,
behind layers of Linux's abstractions and primitives I did not really understand
how they worked and how they would solve my problem for my proxy. It was
then that I sat and studied Linux IPvlan driver. As it
turns out, I had to backtrack a little before I fully understood IPvlan, since
there were a few gaps in my knowledge regarding networking in general. For this
I reviewed topics that were related such as the Link Layer (Layer 2) and MAC
addresses, Linux Namespaces, Linux bridges, and their parallel structure
to Layer 2 packet switches + ethernet. These topics were in tangent with IPvlan
and it led me to understand the exact problem that it was trying to solve, promptly
realizing that this was the solution to my problem with the proxy.

## What I discovered

The IPvlan Linux driver acts itself as a very lightweight middle-man
between the container, and the host network. In comparison to other networks drivers,
IPvlan and Macvlan kind of push the boundaries of network isolation in general.
Whereas the normal bridge driver completely isolates containers from the host,
due to it acting as a network switch and ethernet cables, the cables being
virtual ethernet pairs, and the switch being a Linux bridge.
The host driver, on the other hand, offers very minimal isolation since the
container would share the same network stack as the host. Both IPvlan and
Macvlan settle in a nice middle-ground in regards to how they work.
The big trade-off for this is that both of these drivers are what are known as
"locally scoped" drivers, something that I'll talk about later.

IPvlan requires three things: a interface on the running host
to attach, the host's subnet, and the host's gateway IP. Given these three
parameters, once you create and attach your container to the IPVlan network
two interesting things will happen:

1. When the container is spun up, it will have a routable IP address from within
   the same CIDR block as the one you specified by both the `gateway` and
   `subnet` parameters
2. The IPvlan construct will create a network interface with the same MAC address
   as the parent's interface MAC address, this is how you know which interface
   inside the container belongs to your IPvlan network. This one is super important
   on cloud environments since it shares the parent's MAC address, the OS just
   demultiplexes requests to the correct endpoint, which in this case is my container

There were some quirks as well from how I configured my proxy to use this new
network. First: my very simple proxy relied on attaching to a statically-defined
network interface. The proxy would attach to `eth0` by default since it
operated at the host's networking-level. Adding yet another network driver to
my solution means that there's an additional network interface that
I'm able to bind to. Here's an overview of how many network interfaces the
container would have if we were to inspect it:

1. An interface for the routing mesh's overlay network
2. Another interface that corresponds with the internal overlay network for
   cross-service communication
3. An interface for the gateway-bridge network

The answer is a little obvious once you realize that if my application previously
chose interface `eth0` on a whim. It still needs to choose an interface, however
now it has to do so dynamically. To know which interface my proxy has to attach
is pretty simple: Given a subnet that was previously declared for the IPvlan
network, find the network interface that has an IP that belongs to that subnet.
Remember that the IPvlan driver will assign a routable IP address to the
container based on the gateway and the subnet given at creation time.

Here's a snippet of code relevant to how I implemented dynamic interface discovery:

```go
  _, targetSubnet, err := net.ParseCIDR("<my_ipv6_gateway>")
  if err != nil {
      log.Fatalf("Unable to parse CIDR block: %v", err)
  }

  var ipv6interface string
Outer:
  for _, i := range interfaces {
      addresses, err := i.Addrs()
      if err != nil {
          log.Fatalf("Error reading addresses for interface %s: %v", i.Name, err)
      }
      for _, a := range addresses {
          ip, ok := a.(*net.IPNet)
          if !ok {
              log.Fatalf("Cannot assert type *net.IPNet from %T", ip)
          }

          if targetSubnet.Contains(ip.IP) {
              ipv6interface = i.Name
              break Outer
          }
      }
  }
```

Additionally, in order to make effective use of my IPv6 addresses I have
to bind them to the same interface we discovered using the above snippet.
This one is also pretty straight-forward, I decided to use the `ip` utility
for assigning them to my container's `eth` interface as such:

```go
for range *ipv6n {
  cmd := exec.Command("ip", "-6", "addr", "add", fmt.Sprintf("%s/64", addr.String()), "dev", ipv6interface)

  if output, err := cmd.CombinedOutput(); err != nil {
    if *verbose {
        log.Printf("Failed to add IP %s: %v | Output: %s", addr.String(), err, string(output))
    }
  } else if *verbose {
    log.Printf("Successfully plumbed %s onto %s", addr.String(), ipv6interface)
  }

  // ...
}
```

## About Locally-Scoped Networks in Swarm
