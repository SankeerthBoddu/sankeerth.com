---
title: "Same AI, Different Constraints"
date: 2026-08-09
layout: post
categories: blog
tags: [AI, EnterpriseAI, use-cases, architecture, industry]
excerpt: "An HR assistant, a fraud system, and a factory-floor model can all be called enterprise AI. The architecture changes because the constraints change."
---

![Same AI, different constraints — HR, fraud, and factory-floor architecture tradeoffs]({{ '/assets/images/ai-series-3-industry-patterns.png' | relative_url }})

"Enterprise AI" is a useful label until you have to design the system.

Then the label stops helping.

An HR assistant, a fraud system, and a factory-floor vision model can all use AI. They do not have the same architecture because they do not have the same constraints.

That is the part I think gets lost when architecture starts with the model.

Take an internal HR assistant.

The model is not the first problem. Data access is. Policies may be available to everyone, while compensation or employee documents are not. Identity and authorization decide what context the system is allowed to use before generation.

A fraud system has a different shape. Latency, throughput, explainability, and cost per decision matter much more. A system that responds in a few seconds may be fine for document Q&A and completely useless in a transaction path.

A factory-floor system changes the boundary again. If a decision has to happen next to a machine, a cloud round trip may not be acceptable. Edge execution and local reliability become part of the design.

Same broad technology family. Different system.

For an agentic system I also find it useful to separate **model, context, and harness**.

The model may be identical in two applications. What changes is the context it receives and the harness around it: retrieval, tools, identity, policy, state, retries, approvals, and stopping conditions. Those are application and platform decisions, not properties of the model.

I have seen the same thing in platform work that was not AI at all.

When we built cloud project-vending and landing-zone patterns, the visible output was a new project or subscription. Most of the real work sat underneath it: identity, networking, policy, observability, security controls, cost boundaries, and a repeatable onboarding path.

AI does not make those problems disappear.

It adds another layer on top of them.

That is why I tend to start architecture conversations with a few constraints instead of a model name:

- What data is involved, and who is allowed to see it?
- What latency is acceptable?
- What happens when the system is wrong?
- Where can the workload run?
- What has to be logged or explained later?
- Who owns the cost and the production support?

The answers change the architecture quickly.

In a regulated environment, private networking and audit evidence may matter more than having the newest model. In a high-volume workload, per-token economics may decide whether a managed service still makes sense. In a low-risk internal workflow, a managed model can be exactly the right tradeoff because it gets the team to value faster.

There is no single "enterprise AI architecture" that wins everywhere.

The reusable part is the way we reason about it: identity, data, network, context, orchestration, cost, reliability, observability, and governance.

The model matters.

The constraints decide what the system has to become.

Next: what changes when the POC has to become a production service.
