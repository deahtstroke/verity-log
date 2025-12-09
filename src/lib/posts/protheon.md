---
title: "How I’m Creating a Distributed Task System"
description: A deep-dive into the motivation and architecture behind my Protheon project
date: '2025-11-25'
thumbnailText: Protheon 
categories: ['Go', 'RabbitMQ', 'gRPC', 'PostgreSQL', 'Journal']
published: true
colorStart: "300 100% 50%"
colorEnd: "180 100% 50%"
---

<script>
    import Mermaid from '$lib/components/Mermaid.svelte';
    const architectureDiagram = `
    flowchart LR
	subgraph MasterNode[Master Node]
	    direction TB
	    M1[Scan & Organize Files] --> M2[Create Job Metadata] --> M3[Publish Jobs] --> M4[Track Progress and Telemetry]
	end
	subgraph Workers[Worker Nodes]
	    W1[Worker Instances]
	end
	RabbitMQ[(RabbitMQ)]
	Postgres[(Postgres DB)]
	Storage[(File Storage / Workspace)]
	%% Relationships
	MasterNode-->|Reads Files| Storage
	MasterNode-->|Publishes Jobs| RabbitMQ
	Workers-->|Fetch Jobs| RabbitMQ
	Workers<-->|Stream File Chunks| MasterNode
	Workers-->|Write Results| Postgres
	MasterNode-->|Store Metadata| Postgres
	Workers-->|Signal Done| MasterNode
    `

    const jobSequenceDiagram = `
    sequenceDiagram
	participant Master
	participant Worker
	participant RabbitMQ
	participant Postgres
	Master->>Master: Prepare workspace
	Master->>RabbitMQ: Push job
	Worker->>RabbitMQ: Request job
	RabbitMQ->>Worker: Deliver job
	Worker->>Master: Stream file chunks
	Worker->>Postgres: Save to DB
	Worker->>Master: Signal done
    `
</script>

## Context: What is this?
This project grew out of work I had started on a larger system, [RivenBot](https://www.github.com/Riven-of-a-Thousand-Servers),
which relied on a sizeable dataset that needed heavy preprocessing. The original
project stalled, partly because the game's state made it hard to stay motivated,
but the technical challenges around dataset processing stuck with me. Instead putting
everything on the back burner, I turned that specific problem into a focused learning
project on distributed systems. Protheon is the result of that
shift in scope: a chance to learn by building something real, even if the
original application is on pause.

The immediate challenge was simple: I needed a way to process a large dataset
quickly without babysitting long-running jobs or pushing everything through one
overloaded machine. I had already solved this problem once as part of the original
[Java-based project](https://www.github.com/deahtstroke/pgcr-batch-processor),
but it was slow and never really designed with distributed work in mind. It got
the job done, but it wasn't something I could scale or build upon meaningfully.
Rewriting it gave me a chance to rethink the design more
deliberately and use it as a hands-on introduction to distributed systems.

This article outlines the overall design of the system, why it's structured
the way it is, and the trade-offs behind each decision. I'll walk through
the architecture, how tasks move through the pipeline, how the master and
worker nodes communicate, and what I learned while turning a simple
batch processor into a distributed one.

## Architectural Overview

Before looking at the inner workings of the system, it helps to understand
the overrall structure and how the major components interact. Protheon was
designed as a master-worker distributed system, where the master node
orchestrates work, and worker nodes handle processing tasks concurrently.

The high-level flow is straight forward:

1. **Master Node**: Responsible for organizing work, managing and streaming
file chunks, and coordinating task creation and distribution.
2. **Worker Node**: Perform the actual processing of files chunks, including
transforming and storing data (ETL).
3. **Work Queue (RabbitMQ)**: Handles job distribution, ensures reliable
delivery, and decouples from worker nodes.
4. **Database (PostgreSQL)**: Stores the processed data.

Below is a diagram showing how these different components interact with
each other.

<Mermaid code={architectureDiagram} />

## Job Lifecycle

A single job represents a segment of one `.jsonl.zstd` file.
These files are zstd-compressed JSON-lines blobs; once decompressed,
each line is an independent JSON object that can be processed in isolation.
The master node splits the decompressed file into logical segments
and publishes a job definition for each one to RabbitMQ,
making them available for workers to claim.

The lifecycle below shows how one job moves through the system from the
moment the master node publishes it, to the worker pulling it,
streaming the required file chunks, processing them, and committing results to Postgres.

<Mermaid code={jobSequenceDiagram} />

## The Master Node

The master node is the coordinator of the system, the part that actually makes
distributed work possible. It’s responsible for:

- Defining clear `gRPC` methods for streaming file chunks to worker nodes and
file cleanups
- Managing the **workspace** for the current file that's being processed
(opening/closing files, and queueing tasks in the work queue).
- Relay telemetry data about the current state of the system (files completed,
throughput stats, etc).

An indirect but obvious requirement is that **the host with the better hardware
profile should act as the master node**. It handles most of the I/O operations
and while I/O is influenced by computer power, network latency, and storage speed,
giving this role to the beefiest machine still yields better throughput for a
small distributed setup like this.

### GRPC vs. HTTP

Another major decision that I made with the Master Node was the use of [gRPC](https://grpc.io/)
instead of HTTP-based streaming for relaying file chunks to worker. This
was made because of several limitations that are intrinsic to TCP-based protocols:

1. **Message Framing**: In TCP, and transitively HTTP, there are no clear bounds
on messages, its just a continous stream of bytes that is relayed
to the listener/client. gRPC does not have this limitation, it has clear message
bounds and schema through the use of [Protobuf](https://protobuf.dev/).
2. **Controlled Environment**: Generally speaking, gRPC is favored over HTTP
when all communication happens in a controlled environment and there's
no need to expose public-facing endpoints. This makes node-to-node
communication simpler.
3. **Binary Efficiency**: Streaming Protobuf’s binary format
is generally faster than streaming JSON
over HTTP. This shouldn't surprise anyone: Binary payloads tend to be
leaner and quicker to parse than JSON. It's also more conveninent
for me: If ever I need JSON, I can just generate it from the
Protobuf schema using Go's `protojson` package.

### What exactly is a "workspace"?

Earlier I wrote that the master node manages a "workspace". I'm simply talking
about a directory on disk. Nothing fancier than a build directory in a
build tool such as Gradle, Node, or SvelteKit. However, this workspace
instead of containing compiled files has file chunks, more specifically,
two-hundred files each containing fifty-thousand lines
due to each compressed file having static ten million lines to process. The Master
Node handles organizing and cleaning them up whenever a worker request or finish
tasks.

### What about Load Balancing?

This responsibility is offloaded to RabbitMQ entirely because of its
natural capability to act as a
[work-queue](https://www.rabbitmq.com/tutorials/tutorial-two-go).
Its acknowledgement system works similarly to TCP's ACK system giving me solid
delivery guarantees without reinventing reliability itself. The biggest downside
to using RabbitMQ however, is the it becomes another service to configure and
maintain. But the tradeoff is absolutely worth it, the reliability and
simplicity far outweighs the operational overhead. This is how the
master node achieves effective distribution of work across multiple workers.

## The Worker Node(s)

The worker nodes were designed to be lightweight in responsibility,
only doing specific tasks in an idempotent way. In this case, ingest some bytes
from a source, transform them, and subsequently save them to a SQL database, nothing
fancy. However, they still need to have to communicate with third-party services,
namely, the database, the work queue, and the `gRPC` server. Another important
consideration is being able to use PostgreSQL's [pipeline mode](https://www.postgresql.org/docs/current/libpq-pipeline-mode.html)
for better utilization of the network while performing round trips, which is
why I decided to use the [`pgx`](https://github.com/jackc/pgx)
Go database drivers due to their focused support for this feature.

The worker node's work loop is very simple:

- Fetch a job from the RabbitMQ work queue.
- Request a stream of file chunks via their built-in gRPC client.
- Run ETL logic to the PostgreSQL database.

Additionally, since the worker node process runs in different hosts
and the program itself is packaged as a CLI application, I made a `flag`
option to let me pick the number of goroutines to use for a given worker.
This let's me scale concurrency horizontally with the number of worker nodes.

``` go
package main

// ... imports and boring stuff here

var (
    rabbitUrl  = flag.String("rmq", "", "RabbitMQ connection URL")
    grpcUrl    = flag.String("grpc", "", "gRPC server URL")
    pgUrl      = flag.String("pg", "", "PostgreSQL connection url")
    numWorkers = flag.Int("n", 1, "Number of workers to spin up")
)

func main() {
    flag.Parse()

    ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
    defer stop()

    // ...
    // dependency injection and boring stuff ... 
    // ...

    consumer := consumer.NewPgcrTaskConsumer(*tui, client, rabbitSubscriber, processingService)
    for i := range *numWorkers {
	go func() {
	    if err := consumer.Consume(ctx); err != nil {
		log.Fatal(err)
	    }
	}()
    }

    <-ctx.Done()
    log.Printf("Shutting down worker gracefully")
}

```

## Service Distribution

Because this project involves distributing work among different hosts there
needs to be a clear strategy on how to *distribute* the worker and master services
to other machines.
The simplest and quickest way to distribute binaries was to compile for each specific
architecture and OS necessary. One of the big advantages with using Go is that
you can target specific operating systems and CPU architectures
when compiling a binary. In addition, binaries these binaries are hosted
in the GitHub repository where the source code lives using Github Packages.
However, the biggest downside to this is approach is that I have to manually
log into each computer either by physically logging in to the machine or using SSH
and pull the updated binary with each release. This is **obviously**
very inconvenient  and defeats the purpose of having CI/CD. Again,
for the purposes of this modest
setup it is good enough. In the future however, it would be best to containerize
the binaries using Docker, then each host machine only needs to pull the
correct Docker image for their correspoding CPU architecture. Perhaps even intertwine
the setup with Docker Swarm where you can manage different Docker hosts, at
the same time.

## Conclusion
