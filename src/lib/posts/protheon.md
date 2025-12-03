---
title: "How I’m Designing a Distributed Task Processor"
description: A deep-dive into the motivation and architecture behind my Protheon project
date: '2025-11-25'
thumbnailText: Protheon 
categories: ['Go', 'RabbitMQ', 'gRPC']
published: true
colorStart: "300 100% 50%"
colorEnd: "180 100% 50%"
---

## Motivation

Protheon, is my personal attempt at distributing the processing of several big
files into different hosts to speed up their ingestion, processing and insertion
to my own database. The initial inspiration comes from my original <a href="https://www.github.com/deahtstroke/pgcr-batch-processor" target="_blank">pgcr batch processor</a>
written in Java using Spring Batch. What's weird about
this though is that while inspecting the Github repository you might ask yourself:
Didn't you already solve this problem using a single host? Yes, yes I did.
However, I was very disappointed with the performance at which were processed.
The thousands of files that I processed took around one-week and a half of
processing using only my MacBook Pro. So I asked myself: Can I make this any
faster? To which the answer is **yes**.

This time instead of serving and processing everything in only one host,
I used whatever hosts I had at my disposal: The same Macbook Pro I used earlier,
an Intel NUC miniPC, my own gaming PC, and an MSI Claw. However, distributing tasks
across several hosts comes with its own set of challenges, challenges I did
not face when I utilized a single host such as network latency, race-conditions,
fault tolerance, and load balancing.

## The Master Node

This part of Protheon is in charge of three important things:

1. Define clear `GRPC` endpoints for streaming file bytes to different worker
nodes.
2. Manage the **workspace** for the current file that's being processed, this
can be in the form of creating directories, opening/closing files, and putting
tasks in the work queue.
3. Relay telemetry data about the current state of the system, e.g., how many
files have been completed, average, max, and min throughput, etc...

Additionally, an indirect requirement is that **the host with the better hardware
profile should act as the master node**, because, as noted earler, the master node
handles most of the I/O operations. Keep in mind that, generally speaking,
I/O performance isn't constrained solely by compute power, it's also
affected by external factors like network latency external sources like the
network latency. Still, for the purposes of this modest distributed-computing
project is better for the coordinator to run on the host with the stronger specs.

### Why GRPC instead of HTTP?

Another major decision that I made with the Master Node was the use of [GRPC](https://grpc.io/)
instead of HTTP-based streaming. This was made because of several limitations
that are intrinsic to TCP-based connections:

1. In TCP, and transitively HTTP, there are no clear bounds on messages, its just
a continous stream of bytes that is relayed to the listener/client. GRPC does
not have this limitation, it has clear message bounds and schema through the
use of [Protobuf](https://protobuf.dev/).
2. Generally speaking, gRPC is favored over HTTP when all communication happens
in a controlled environment and there's no need to expose public-facing endpoints.
This makes node-to-node communication simpler.
3. Streaming Protobuf’s binary format is generally faster than streaming JSON
over HTTP. This shouldn't surprise anyone: Binary payloads tend to be
leaner and quicker to parse than JSON. It's also more conveninent
for me: If ever I need JSON, I can just generate it from the
Protobuf schema using Go's `protojson` package.

### What exactly is a "workspace"?

Earlier I wrote that the master node should be in charge of managing the "workspace"
for the currently processed file. In this context, this *workspace* is just a directory.
Nothing fancier than a build directory in a build tool such as Gradle, Node, or even
SvelteKit. However, this workspace instead of containing compiled files has file
chunks, more specifically, two-hundred files each containing fifty-thousand files.
Now you might say, those are oddly specific numbers to which I say: Yes, they are,
but for a good reason.

## Prototyping and "Failing Fast"

The early stages of this project I was prototyping my application in the form
of a very simple Go CLI program where I mixed both the master node and the
worker node functionality into the `main.go` file in my project. Zero unit tests,
zero integration tests, just prototyping as fast as I could given my own
requirements. <a href="https://github.com/deahtstroke/protheon/commit/51c6d686f05c8f0dbf24047592fc2d30fb729cd8" target="_blank" rel="noopener">Here's</a> an earlier commit in the the project if
you'd like to check it out.
