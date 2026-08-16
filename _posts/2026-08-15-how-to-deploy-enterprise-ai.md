---
title: "Getting AI Into Production"
date: 2026-08-15
layout: post
categories: blog
tags: [AI, EnterpriseAI, Kubernetes, infrastructure, deployment, MLOps]
excerpt: "The model is only one part of production. Identity, networking, cost, observability, rollback, security, and ownership decide whether the system actually ships."
---

![Getting AI into production — managed, self-managed, hybrid, and an evaluation gate before promotion]({{ '/assets/images/ai-series-4-deployment.png' | relative_url }})

The model is usually not the part that surprises teams in production.

Everything around it is.

A POC can run with one developer, one dataset, a permissive network, and a credit card. Production introduces identity, private connectivity, audit, support, rollback, cost ownership, uptime, and people who depend on the system every day.

That is when an AI project starts looking a lot like platform engineering.

I think about the deployment choice in three broad shapes.

**Managed cloud services** are the fastest path when the data and control requirements allow it. Bedrock, Azure AI services, and Vertex AI can remove a lot of infrastructure work. That is valuable. The tradeoff is less control over parts of the stack, provider-specific integration, and a cost model you have to understand at real usage volumes.

**Self-managed infrastructure** gives you more control over models, networking, data location, and serving. It also means you own more: Kubernetes, GPU capacity, upgrades, security, scaling, observability, and incident response.

**Hybrid** is where a lot of practical enterprise designs end up. Use managed services where speed matters and the risk is acceptable. Keep sensitive or latency-critical parts closer to the data or under tighter control.

The important part is not picking a side.

It is being clear about why each workload belongs where it does.

For agentic systems, the deployable unit is also bigger than the model.

The harness/orchestration code, prompt and context strategy, retrieval configuration, tools, policy, and model version can all change behavior. I want those changes treated as release inputs, not as invisible configuration around an otherwise stable service.

The same applies inside the delivery pipeline.

A production AI service still needs the things we already know how to build:

- infrastructure as code
- repeatable environments
- identity and secrets management
- security scanning and policy checks
- automated tests
- versioning and rollback
- logs, metrics, and traces
- cost and capacity visibility
- an owner when something breaks

I have spent a lot of time on that layer with Terraform, Kubernetes, DevSecOps pipelines, security gates, SBOMs, cloud landing zones, and centralized observability. The tools change around AI, but the production discipline is familiar.

There is one extra problem, though.

Traditional software gives us a fairly clear pass/fail signal. The code compiled. The tests passed. The API returned the expected result.

AI systems can deploy successfully and still get worse.

A prompt changes. A model changes. Chunking changes. New documents arrive. Retrieval starts pulling the wrong context. An agent gets a different tool description. Latency grows. Cost moves in the wrong direction.

The pipeline is green, but the behavior is not.

That is why I no longer think of deployment as the last step.

Deployment has to include a way to prove the AI behavior is still acceptable before the release moves forward.

The infrastructure gets the system into production.

Evals help decide whether it should be promoted there in the first place.

The last post in this series is about turning "looks good" into something repeatable enough to trust.
