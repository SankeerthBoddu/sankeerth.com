---
title: "How to Select Use Cases When They're So Easy to Build"
date: 2026-08-08
layout: post
categories: blog
tags: [AI, EnterpriseAI, strategy, use-cases, architecture]
excerpt: "The bar to a working AI demo is so low now that discipline in use-case selection matters more than technical ability. Four systems, one heuristic, and the most important AI skill: knowing when not to use it. Second in a five-part series."
---

![Choosing the right system — humans, rules, traditional ML, or generative AI]({{ '/assets/images/ai-series-2-use-case-selection.png' | relative_url }})

The problem isn't that AI use cases are hard to build. It's that they're too easy to build.

You can prototype almost anything in an afternoon now. An API call, a prompt, a few examples, and you have a demo. That's the trap.

"Can I build this with AI?" is the wrong question. The right question is whether this should be AI at all — and if so, which kind.

Most problems in software and data systems can be solved one of four ways. They're not a ladder. You don't graduate from humans to agents. They're four distinct tools, each with a job.

**Humans.** Judgment, accountability, ethics, high-risk decisions. Hiring. Medical diagnosis. Legal interpretation. Large financial calls. High quality, expensive, slow, hard to scale. If accountability has to sit with a real person, keep it there.

**Rules or code.** Deterministic logic. Payment processing, input validation, data transformations, access control. Fast, cheap, reliable, interpretable. If the logic is "if X then Y," it rarely changes, and errors are unacceptable — you don't need a model. You need a rule.

**Machine learning.** Statistical pattern recognition. Fraud detection, churn prediction, demand forecasting, recommendations. Patterns exist in the data, but they're too complex to write as rules. Scales well, needs monitoring for drift.

**Generative AI.** Unstructured inputs, interpretation, generation, reasoning. RAG, summarization, code generation, multi-step agent workflows. Use it when flexibility matters more than precision and some error is tolerable. Fast time to value, non-deterministic, expensive at scale.

The heuristic is simple. Humans when you need judgment and accountability. Rules when the logic is defined and stable. ML when you want patterns from past data. GenAI when you need to interpret or generate over complex inputs and can tolerate some fuzz.

IBM puts it bluntly: most failures to reach production don't come from bad models. They come from choosing the wrong system in the first place. The most important AI skill is knowing when not to use it.

I'd extend that. It's knowing when to use a rule instead, when to use traditional ML instead, and when to keep a human in the loop.

Labels don't help much at 9am on a Tuesday, so here's what each one actually looks like inside a typical enterprise.

**Rules doing quiet work.** Expense auto-approval under a threshold with a receipt attached. Ticket routing by keyword. Access revocation when someone changes teams. Nobody calls this AI, and that's the point — it's fast, auditable, and never hallucinates.

**Traditional ML, still the workhorse.** Fraud scoring on transactions. Churn propensity. Demand forecasting. Anomaly detection on platform metrics. These have ground truth, measurable precision and recall, and they run for pennies at volumes that would hurt a per-token model.

**RAG — retrieval-augmented generation.** The job is "find and explain." An internal assistant that answers from runbooks, policies, and architecture docs, with citations. First drafts of status reports and release notes pulled from real project data. Contract and policy Q&A. RAG earns its keep when the answer already exists somewhere in your documents and the real cost is people searching for it.

**Agents — "decide and do."** The job isn't answering, it's acting. Ticket triage that reads the request, enriches it with asset data, sets priority, and drafts the response for a human to approve. A cloud ops agent that correlates an alert with the last three deployments and proposes a rollback. Onboarding workflows that provision accounts across five systems with approval gates. Agents need the strongest guardrails of the four types, because a wrong answer is annoying — a wrong action is an incident.

The boundary cases are where selection goes wrong. An LLM totaling a year of transactions is code's job, and it will eventually get the arithmetic wrong. An agent resetting passwords is a self-service rule with better marketing. GenAI summarizing two hundred pages of incident timeline is genuinely the right tool — unstructured input, and close-enough is fine.

And the systems that actually ship combine all four. That triage agent is routing rules, an ML priority model, an LLM writing the draft, and a human on approve. Four types, one workflow.

Even with the right technology, you can still pick the wrong use case. I've seen AI solutions sit on the shelf — not because they didn't work, but because they weren't connected to a real business need or a clear owner. So the selection process has to start with the business problem, not the model.

A sequence that's worked for me: check readiness first — is the blocker technical, like fragmented data, or cultural, like unclear ownership? Then pick a low-risk, high-impact use case that shows value quickly and builds trust. Define the value hypothesis. Identify the data assets that can actually deliver it. Then, and only then, decide whether AI is the right tool.

The best systems I've built use all four types together. I worked on an internal app that generates Terraform code with retrieval-based grounding. The temptation is to throw an LLM at the whole problem. The discipline is knowing which parts need the LLM — understanding the request, generating the code — and which parts need deterministic logic: validating the Terraform, running the pipeline, checking compliance.

An agent that analyzes your yearly spending shouldn't feed thousands of transactions into an LLM and hope the math comes out right. Code does the math. ML finds the trends. The LLM writes the narrative at the end.

The use cases I've seen work started with "what's the business problem?" and got to "can AI help?" second. The ones I've seen fail started with a model and went looking for a problem to glue it onto.

The hardest part of enterprise AI isn't building things. It's choosing what not to build.

#AI #EnterpriseAI #GenAI #Architecture
