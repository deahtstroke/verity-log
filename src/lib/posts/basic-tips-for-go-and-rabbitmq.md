---
title: "Building Protheon, a Distributed Task Executor"
description: A deep-dive into the motivation and architecture behind my Protheon project
date: '2025-11-25'
thumbnailText: Go & RabbitMQ
categories: ['Go', 'RabbitMQ', 'gRPC']
published: true
colorStart: "200 100% 50%"
colorEnd: "190 100 40%"
---

## Overview

Protheon, This distributed programming is just an experimental project to distribute the
workload of handling and distributing file processing through several physical hosts.

## Architecture

The overall structure works as a master-worker program, in which we designate a
master node first that distributes work among workers that just listen for
incoming events.

## File-reading Dilemma

### Original Approach

The current strategy for reading files is to open a reader stream to the
current `.zstd` file that:

1. Opens the file using `os.Open`
2. Creates a buffered reader using `bufio`
3. Creates a zstd reader using `zstd`
4. Lastly, uses a scanner reader that reads line-by-line

In the workers' side, they query RabbitMQ for a task that has the file to process
as well as the start and end line for the file, essentially **batching** the
process (batches of 50k lines per RabbitMQ job). The downside of this however,
is that for each worker there's a physical `counter` variable that will
skip `n + startLine` lines before it reaches the target interval for
the specific job. This in total gives you `O(n!)` work which is *pretty
damn horrible* runtime, more so that each `.jsonl` file is ten-million
lines long.
