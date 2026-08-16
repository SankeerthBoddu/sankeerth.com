---
title: "Does This Really Need AI?"
date: 2026-08-08
layout: post
categories: blog
tags: [AI, EnterpriseAI, strategy, use-cases, architecture]
excerpt: "Building an AI demo is easy. Choosing when AI is actually the right tool is harder. I start with the business problem and use the least complicated system that can solve it."
---

![Choosing the right system — humans, rules, traditional ML, or generative AI]({{ '/assets/images/ai-series-2-use-case-selection.png' | relative_url }})

Building the demo is the easy part now.

A prompt, an API call, a few examples, and something that looks useful can appear in an afternoon.

That is exactly why I have become more careful about the question that comes before the demo:

**Does this really need AI?**

I usually think about four choices: a person, a rule, traditional machine learning, or generative AI.

They are not maturity levels. A rules engine is not a failed agent. A human decision is not unfinished automation. Traditional ML did not stop being useful because LLMs arrived.

A rule is still the right answer when the logic is known and the result has to be deterministic. Access control is a good example. If someone is not allowed to see a document, that decision should not depend on whether a model follows a prompt correctly.

Traditional ML is still a strong fit when the problem is prediction over structured data: fraud scoring, churn, forecasting, anomaly detection.

Generative AI becomes interesting when the input is messy, the answer needs language or reasoning, or the system has to work over unstructured documents. RAG is useful when the answer already exists somewhere and the hard part is finding the right evidence and explaining it. Agents make sense when the next step really has to be selected dynamically or the system needs tools.

Even then, I would not build a custom agent loop just to say I built one. For a general problem I would start with a mature harness and put the custom engineering at the boundaries that actually belong to the organization: identity, context, policy, tool access, approvals, observability, and evaluation.

And sometimes the right answer is still a person. High-risk decisions need judgment and accountability that should not be hidden behind automation.

The boundary matters because the systems that actually work are usually a mix.

I worked on an internal application that generates Terraform from approved patterns. The easy version would have been to let the LLM do everything.

That is not how I wanted it to work.

The model can understand the request and draft the Terraform. Retrieval can ground it in approved examples. But validation, policy checks, pipeline execution, and the decision to merge belong in deterministic tooling.

That is a pattern I keep coming back to:

**use the model where uncertainty is useful; use code where certainty matters.**

The same applies to an agent looking at yearly spending. Code should do the arithmetic. ML can find patterns. An LLM can explain the result. There is no reason to make one model responsible for every part of the workflow.

The business problem also has to come first.

I have seen technically good solutions sit unused because nobody owned the workflow, the data was not ready, or the value was never clear. The model worked. The system still failed.

So my order is simple now:

Start with the problem. Understand the constraints. Then choose the least complicated system that can solve it.

Sometimes that is GenAI.

Sometimes the best AI decision is not to use AI at all.

Next: the same AI idea can require very different architecture once enterprise constraints show up.
