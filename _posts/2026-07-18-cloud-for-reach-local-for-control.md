---
title: "Cloud for Reach. Local for Control."
date: 2026-07-18
layout: post
categories: blog
tags: [AI, local-llm, LMStudio, Ollama, llama.cpp]
excerpt: "Local AI is useful as a lab bench and a control boundary. The tradeoff is that once you run the model yourself, memory, quantization, serving, upgrades, and capacity become your problem."
---

![Local AI workbench]({{ '/assets/images/post5.jpg' | relative_url }})

Cloud for reach.

Local for control.

I started testing local models because I wanted to understand the part that managed APIs hide.

The first useful lesson was not about which model was best.

It was about the serving boundary.

LM Studio made it easy to browse and compare models.

Ollama gave me a simple local API for application experiments.

llama.cpp forced me to learn more of the mechanics: GGUF, quantization, context size, GPU offload, and what happens when model size and context start competing for memory.

That changed how I think about self-managed inference.

Running locally gives me more control over where the model runs and what leaves the machine. It is also a useful fallback and lab environment.

But the infrastructure work comes back to me.

I have to think about:

- model artifacts and versions
- memory footprint
- quantization tradeoffs
- context length
- concurrency
- upgrades
- monitoring
- API security
- capacity

The practical approach for me has been to start with a model that comfortably fits the machine, make the full request path work, and then increase model size or context only when the quality improvement is worth the memory and latency tradeoff.

That is a better learning path than starting with the biggest model I can barely load.

For application-style serving, tools such as vLLM and SGLang are a different lane from desktop experimentation. They start to matter when I care about an API, concurrent requests, throughput, batching, and more production-like serving behavior.

I do not see this as cloud versus local.

Managed models are still the easiest path when I want frontier capability without owning the serving stack.

Self-managed inference gives me another option when control, data location, offline use, experimentation, or platform ownership matters enough to justify operating it.

The model can be the same kind of workload.

The operating responsibility is very different.
