---
title: "Same AI Stack, Different Enterprise Constraints"
date: 2026-08-09
layout: post
categories: blog
tags: [AI, EnterpriseAI, use-cases, architecture, industry]
excerpt: "An HR assistant, a fraud model, and a factory-floor vision system can all be called enterprise AI. The useful question is not the label — it is which constraints determine the architecture. Third in a five-part series."
---

![Same stack, different deployment — enterprise AI use cases by category and industry]({{ '/assets/images/ai-series-3-industry-patterns.png' | relative_url }})

An HR policy assistant, a fraud model, and a factory-floor vision system may all be called enterprise AI.

Architecturally, they have almost nothing in common.

The previous post was about choosing the right kind of system: humans, rules, traditional machine learning, or generative AI. Once AI is actually justified, the next question is not which model is most impressive.

It is which constraints decide where and how the system can run.

Same broad building blocks. Completely different deployments.

Data pipelines, model endpoints, identity, observability, and sometimes Kubernetes and GPUs show up repeatedly. What changes is the deployment shape, and that shape comes from the industry's constraints rather than the technology label.

At a high level, production use cases still fall into familiar categories: predictive, generative, analytical, and conversational. That taxonomy is useful. It tells you what the system does. It does not tell you how the system must be deployed.

For that, look at the environment around it.

**Financial services** runs fraud detection, credit risk scoring, trading algorithms, and anti-money-laundering monitoring. The common pattern is hybrid: cloud for training, where burst capacity helps, and tightly controlled infrastructure for inference. Compliance affects where data and models can run. Fraud detection needs very low latency. At millions of transactions a day, per-call pricing also matters.

**Healthcare** has a different constraint set: patient readmission risk, medical-image analysis, clinical decision support, and drug-interaction checking. Data sovereignty, explainability, and auditability dominate the architecture. Cloud can still be useful for research and de-identified workloads, but even apparently simple documentation automation has to survive privacy and clinical review.

**Manufacturing** is different again. Predictive maintenance, defect detection, supply-chain optimization, and energy optimization often require hybrid plus edge. A robotic arm cannot wait for a cloud round trip. Real-time inference belongs close to the equipment; cloud handles historical training and analytics that are not time-critical.

There is no perfect architecture across all three. Each industry chooses a different trade-off deliberately.

Financial services optimizes for latency, control, and regulatory evidence.

Healthcare optimizes for sovereignty, safety, explainability, and audit.

Manufacturing optimizes for real-time edge execution plus centralized training and fleet analytics.

Function-level differences matter just as much as industry differences.

**Operations.** Document processing, workflow automation, and predictive maintenance. Often the best first territory because the baseline is measurable and the operational value is visible.

**IT and engineering.** Code assistants, runbook assistants, and ticket triage. The team building AI is often its own first customer, which makes feedback and adoption easier.

**Customer service.** Conversational agents and agent-assist. High visibility, high volume, and very little tolerance for confident wrong answers.

**Finance and risk.** Forecasting, fraud scoring, and document review. Strong territory for traditional ML; much tighter tolerance for generative fuzz.

**HR.** Policy Q&A and onboarding support. The data is highly sensitive, so access control determines what is possible before model selection does.

**Legal and compliance.** Contract review and regulatory research. Retrieval with citations can work; unsourced answers do not survive review.

A detail from the MIT data in the first post is worth repeating: more than half of generative AI budgets went to sales and marketing tools, while the largest measured returns appeared in back-office automation. The visible front office attracts attention. The less glamorous operational workflow often produces the value.

A one-size AI strategy stamped across these functions does not survive contact with reality. HR data is more sensitive than inventory data. Fraud scoring has a different latency and error profile than document summarization. A factory-floor decision has a different network boundary than an internal knowledge assistant.

The use cases I have worked on lean generative and analytical: an internal application that generated Terraform with retrieval-based grounding, Snowflake Cortex for enrichment and summarization, Power Platform portals that categorized and prioritized IT requests, and agent workflow prototypes with Google's ADK and Gemini.

I have also worked on GCP project-vending automation that was not AI at all. It is still relevant because identity, networking, policy, observability, and self-service platform controls are the foundation every serious AI use case eventually needs.

That is the distinction I have learned not to lose in the label.

"Enterprise AI" tells you almost nothing about the architecture.

The data sensitivity, latency, accountability, operating environment, and cost model tell you what the system actually has to become.

Next in the series: deployment — the infrastructure, GPU, cost, and operating choices that turn those constraints into a production system.

#AI #EnterpriseAI #Architecture #Cloud
