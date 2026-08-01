---
title: "How to Deploy Enterprise AI"
date: 2026-08-22
layout: post
categories: blog
tags: [AI, EnterpriseAI, Kubernetes, GPU, infrastructure, deployment]
excerpt: "Deployment is where most POCs die. The deployment layer is about 80% of the work and close to 0% of the POC budget. The impossible choice, the pragmatic hybrid, GPU economics, MIG, quantization, and the five-stage pipeline. Fourth in a five-part series."
---

![Deployment is where POCs die — the impossible choice, cost patterns, and the five-stage pipeline]({{ '/assets/images/ai-series-4-deployment.png' | relative_url }})

Deployment is where most POCs die.

The models work. The demos look great. What kills the project is everything production actually requires — infrastructure, compliance, cost controls, CI/CD. In my experience, the deployment layer is about 80% of the work. It's also close to 0% of what gets budgeted when someone approves the POC.

Every enterprise AI team eventually hits what I think of as the impossible choice.

Option A: cloud AI services. Up and running in days. Managed. Latest models. But your data leaves your control, customization has limits, and you're locked into a vendor.

Option B: build on-prem. Complete control. Every compliance requirement met. Data never leaves. But it's eighteen months or more to production, you build everything yourself, and you own all the maintenance.

Most organizations look at those two and feel stuck. Sacrifice control for speed, or speed for control.

The third way — the one I keep recommending — is pragmatic hybrid. Cloud where it makes sense, on-prem where it's required, and start small. The goal isn't the perfect platform in eighteen months. It's your first production model running in six.

Worth knowing: in MIT NANDA's 2025 data, companies that purchased AI tools from specialized vendors and partnered on integration succeeded about two-thirds of the time. Internal solo builds succeeded far less often. That's not an argument against building. It's an argument against building alone — and against rebuilding what already exists.

I've watched teams spend a year building infrastructure before deploying model number one. You learn more from one model in production than from twelve months of platform design.

Three questions cut through the debate. What are your non-negotiable constraints — compliance, latency, a hard cost ceiling? What's your risk tolerance on data sovereignty versus convenience, build versus buy? And what does success look like in six months — a model in production, or a platform still on the roadmap?

It helps to make "cloud AI services" concrete, because the label hides a lot. What Option A actually looks like in mid-2026:

**AWS.** Amazon Bedrock for managed foundation models, Knowledge Bases for managed RAG over your S3 documents, Agents and AgentCore for agent runtimes, SageMaker when you need custom training.

**Azure.** Azure AI Foundry as the platform layer, Azure OpenAI for the models, AI Search for retrieval, Copilot Studio when the agent belongs inside Power Platform workflows.

**GCP.** Vertex AI as the platform, Gemini models, Agent Engine for deploying agents, grounding over your own data stores.

**Self-managed, Option B in practice.** Kubernetes with KServe or Triton serving open-weight models on your own GPUs, your choice of vector database — pgvector, OpenSearch, Qdrant — and your data never leaves.

I've built on both sides of this line: an internal app on Azure AI Foundry, agent prototypes with Google's ADK and Gemini, and the self-managed platform work the rest of this post describes. The honest summary: managed services compress months into days and charge you per token forever. Self-managed compresses your cloud bill and vendor dependence into GPU capacity you have to plan for. Where most regulated shops land: managed for experimentation and bursty, low-sensitivity workloads; self-managed for the data you can't ship and the inference volumes where per-token pricing stops making sense.

Now the technical layer.

Kubernetes is the foundation for a reason. Your models, dependencies, and code get packaged the same way and deploy the same way everywhere — no more "works on my machine." It's an abstraction layer across AWS, Azure, GCP, and on-prem, which is your exit ramp from vendor lock-in. It's built for scale — autoscaling, self-healing, GPU and CPU resource management. And it's the industry standard, so the ML ecosystem plugs into it: Kubeflow for pipelines, KServe for serving, MLflow for tracking.

Then the expensive part: GPUs.

For training, GPUs are mandatory unless your models are tiny — CPUs take weeks where GPUs take hours. Production models typically need eight to thirty-two GPUs for reasonable training time.

For inference, it depends. GPU inference when the model is large, latency is tight, or throughput is high. CPU inference when the model is small, batch is acceptable, and cost is the priority.

The cost gap is real. At roughly a million requests a day, GPU inference runs about $36,000 a year. CPU inference runs about $3,600. The wrong choice wastes around $32,000 a year — per model. Multiply that across a fleet.

Three patterns actually save money in production, and none of them are theoretical.

One: hybrid cloud. Cloud for training, where you need burst capacity. On-prem for inference, where compliance, latency, and cost control live.

Two: GPU pooling with Multi-Instance GPU. MIG on the A100 divides one physical GPU into up to seven isolated instances. Utilization goes from around 20% to 75% — a 50 to 70% cost reduction on the same hardware. Teams share GPUs without stepping on each other.

Three: quantization. Converting a model from 32-bit floating point to 8-bit integer precision cuts inference cost 50 to 75% and runs about 4x faster, with minimal accuracy loss. Most models don't need full precision at inference time.

The end-to-end pipeline runs in five stages on the same cluster. Data prep — ETL, validation, feature engineering on CPU nodes. Training — distributed across GPUs with checkpointing. Validation — holdout testing, A/B against the current model. Deployment — serving through KServe with autoscaling, canary rollouts, versioning, rollback. Monitoring — latency, accuracy, drift, resource usage, with alerts feeding back into retraining. Same infrastructure, same tools, same process across all five.

Multi-tenancy is how you share all of this safely. Namespace isolation gives each team a virtual cluster. ResourceQuotas cap GPUs, CPUs, and memory per team. RBAC keeps teams in their own lanes. Network policies block cross-namespace traffic by default. Kubecost or OpenCost tracks spend per team for chargeback — teams that see their real costs tend to optimize them.

The deployment stack itself is mature. Kubeflow, Argo, or Airflow for pipelines. KServe for serving — the Kubernetes-native standard — or NVIDIA Triton for raw performance. MLflow or Weights & Biases for experiment tracking. Prometheus and Grafana for metrics, ELK for logs, Datadog if you want commercial.

Here's what surprises engineers new to this: KServe deploys a production-ready inference service in under twenty lines of YAML — autoscaling, canary rollouts, model versions, monitoring included. The platform underneath is complex. The user-facing surface is not.

I've spent a good part of the last few years on exactly this layer — DevSecOps pipelines with Terraform, Kubernetes, Veracode, Snyk, SonarQube, and SBOM generation. OpenTelemetry for traces, metrics, and logs. GCP project vending automation with IAM, tenant service agents, VPC Service Controls, networking, and centralized observability. The patterns are the same whether the workload is a microservice or a model. The difference is that AI workloads arrive with a POC that was approved on the assumption the deployment part would sort itself out.

It never does.

What separates the deployments that make it from the ones that join the 95%? Not the model. The team understood their constraints before the POC, and they planned for production from day one. The 95% let circumstances choose for them. The 5% chose — and deployment was one of the choices.

Next post in the series: evals — how to know your model is actually working, before and after you ship it.

#AI #EnterpriseAI #Kubernetes #MLOps #GPU
