---
title: "Usage Is Not Value"
date: 2026-06-27
layout: post
categories: blog
tags: [AI, governance, AIGovernance, GenAI, LLMOps]
excerpt: "Token usage, tool adoption, and POC counts tell me whether people are using AI. They do not tell me whether the work got better."
---

Usage is not value.

I started paying more attention to this as AI tools moved from experiments into real workflows.

It is easy to measure activity:

- token usage
- active users
- number of POCs
- number of prompts or agent runs

Those numbers are useful. They tell me whether the system is being used.

They do not tell me whether the work improved.

For that I want a baseline and an outcome.

Did the task take less time?

Did quality improve?

Did error or rework go down?

Did the workflow become easier to support?

Did the cost of getting the result make sense?

Did the people doing the work actually keep using it after the novelty wore off?

The exact measure changes by use case.

For a document workflow I may care about cycle time, extraction accuracy, exception rate, and human review effort.

For a RAG assistant I may care about retrieval quality, grounded answers, access violations, latency, cost, and whether the questions are actually being resolved.

For an agent that changes something, I care even more about tool success, retries, approvals, failed actions, and whether the automation reduced work without creating a new support problem.

This is where governance becomes more practical to me.

Governance is not just an approval meeting before a POC.

It is the operating layer around the system:

```text
owner
  + measurable outcome
  + cost boundary
  + evaluation
  + observability
  + rollback
  + policy
```

If I cannot name the outcome or the owner, I treat the work as an experiment.

That is fine. Experiments are useful.

I just do not want an adoption metric to quietly become the proof that the experiment worked.

The question I want to keep asking is simpler:

**What changed because this system exists, and can I measure enough of that change to decide whether it is worth keeping?**
