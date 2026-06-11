# Loukik Naik - Outreach Context

Use this file as background when drafting LinkedIn reach-out messages. Do not include every detail in every message. Pick only the facts that make the message specific and relevant to the person, company, or role.

## Basic Profile

- Name: Loukik Naik
- Location: San Francisco, CA
- Email: loukiknaik@gmail.com
- LinkedIn: linkedin/loukiknaik
- Portfolio: portfolio.loukik.dev

## Positioning

I am a software engineer with strong backend, AI infrastructure, distributed systems, and machine learning infrastructure experience. I am strongest when building production systems around AI workflows: APIs, orchestration, data pipelines, model-serving systems, observability, reliability, and cloud deployment.

Good target roles include:

- Software Engineer, Backend Engineer, Platform Engineer, AI Infrastructure Engineer, ML Engineer, MLOps Engineer, Applied AI Engineer, and full-stack/backend-leaning roles at AI, infrastructure, developer tools, legal tech, healthcare, and B2B SaaS companies.
- Teams working on LLM products, AI agents, document intelligence, model serving, cloud infrastructure, workflow orchestration, data pipelines, distributed systems, or applied ML platforms.

## Education

- Master of Science in Computer Science, University of California, San Diego, December 2024. GPA: 3.97/4.0.
- Bachelor of Engineering in Computer Engineering, University of Mumbai, May 2023. GPA: 9.71/10.0.

## Recent Experience

### Software Engineer - Eudia, Legal AI Startup, Series A

Palo Alto, CA. September 2025 to January 2026.

Relevant points:

- Owned the Mergers and Acquisitions backend service end-to-end for a production agent-based AI system used for large-scale legal document analysis.
- Designed and shipped backend APIs that acted as the control plane for AI agent execution, including document ingestion, run orchestration, result persistence, and retrieval of structured tabular outputs.
- Partnered closely with lawyers and product managers to translate legal workflows into scalable platform capabilities.
- Migrated agent orchestration from Airflow to Temporal to support reliable long-running, stateful agents with retries, idempotency, and deterministic behavior.
- Built backend capabilities for flexible document analysis, configurable PII redaction, contract comparison, schema-based inference, cell-level operations, structured logging, workflow tracing, telemetry, and Kubernetes-native monitoring.
- Coordinated workflows across services, queues, and workers while handling duplicate execution, inconsistent retry state, and downstream dependency failures.
- Designed Postgres schemas and Alembic migrations for backward-compatible agent capability releases.
- Converted the service to a multi-tenant architecture with tenant-aware routing, strict isolation, and safe rollouts across live customers.
- Managed rollouts across staging, internal, and production environments using Kubernetes, Helm, and ArgoCD.

### Machine Learning Engineer - Plainsight Technologies, B2B Computer Vision Startup, Seed

San Francisco, CA. January 2025 to August 2025.

Relevant points:

- Built and deployed real-time image segmentation APIs for SAM and MobileSAM using FastAPI.
- Dockerized model serving and automated infrastructure and deployments using Terraform and CI/CD.
- Created a cron-triggered retraining pipeline that detects newly labeled data and launches Vertex AI training jobs.
- Designed an OCR model evaluation framework using edit distance, confidence scoring, and text similarity metrics for pre-deployment quality checks.
- Built integration tests to validate end-to-end model generation pipelines for segmentation, object detection, and keypoint detection.

### Machine Learning Engineer Intern - Plainsight Technologies

San Diego, CA. June 2024 to December 2024.

Relevant points:

- Automated video inference workflows with Google Cloud Functions triggered by Google Cloud Storage uploads.
- Deployed pipelines on Google Kubernetes Engine with CI/CD for scalable, reliable processing.

## Side Projects (things I build outside work)

Use these for the "outside work I'm always building" bullet. Pick the one most relevant to the recipient's domain, or the most impressive live one. Always include the link if there is one.

- PodClipper (podclipper.loukik.dev) - local-first tool that turns long podcasts and videos into short AI-generated clips and highlights automatically: transcription, AI clip selection, smart cropping, subtitles.
- DraftIn (github.com/LoukikNaik/DraftIn) - keyboard-driven LinkedIn reach-out drafter. Alt+L captures the page and drafts a personalized message via a local vision-LLM, routed through a ChatGPT subscription, no API key.
- reelforge (github.com/LoukikNaik/reelforge) - multi-agent AI video editor that turns long-form videos into viral short-form reels.
- Synapse (github.com/LoukikNaik/Synapse) - spaced repetition for decision-making; turns any book, video, or topic into scenario-based flashcards that test judgment.
- F1-Prediction-Engine (github.com/LoukikNaik/F1-Prediction-Engine) - ensemble models, Monte Carlo simulations, and live race tracking for F1 predictions.

## Project Highlights

### Surfstore - Distributed File Storage System

- Built a horizontally scalable file storage system in Go.
- Stored data across multiple block and metadata servers.
- Built a gRPC client-server architecture for communication between storage nodes.
- Implemented the Raft consensus algorithm for consistency and fault tolerance across metadata servers.

## Technical Skills

Languages and fundamentals:

- Python, C++, JavaScript, SQL, Bash, HTML/CSS.
- Data structures, object-oriented programming, system design, distributed systems, cloud computing, design patterns.

Backend and infrastructure:

- FastAPI, Git, Postgres, Alembic, Temporal, Kubernetes, Docker, Kubeflow, Terraform, CI/CD, Helm, ArgoCD.
- Grafana, Prometheus, Signoz, structured logging, tracing, telemetry, production monitoring.

Machine learning and AI:

- LLMs, NLP, PyTorch, TensorFlow, Pandas, Scikit-Learn, LangGraph, LangChain, TTS.
- Model serving, computer vision, segmentation, OCR evaluation, retraining pipelines, Vertex AI, GKE.

## Message Tone

Use a direct, concise, human tone. Avoid sounding like a template.

Good messages should:

- Be short enough for LinkedIn.
- Mention one or two specific details from the recipient's profile, post, company, or job opening.
- Connect those details to one relevant part of my background.
- Sound curious and practical, not desperate or overly formal.
- End with a lightweight ask such as whether they are the right person to connect with, whether the team is hiring, or whether they would be open to a brief chat.

Avoid:

- Generic praise like "I was impressed by your profile."
- Overstating experience or claiming facts not present in the page context.
- Mentioning GPA unless the recipient is clearly hiring for early-career/new-grad roles and it helps.
- Listing too many technologies in one message.
- Saying I am currently at a company unless the page context or user prompt confirms it.
- Making the message sound like a cover letter.

## Example Angles

For a recruiter:

- Emphasize production backend, AI systems, ML infrastructure, and startup experience.
- Ask whether their team is hiring for backend, platform, AI infrastructure, or ML engineering roles.

For an engineering manager:

- Mention a concrete technical overlap such as Temporal, Kubernetes, model serving, AI agents, document processing, distributed systems, or production ML pipelines.
- Ask whether the team has upcoming roles where that background would be useful.

For a founder or early startup employee:

- Emphasize ownership, end-to-end execution, production reliability, and ability to work across product, engineering, and domain experts.

For legal AI, document intelligence, or AI agent companies:

- Highlight Eudia experience with agent-based legal document analysis, orchestration, structured outputs, PII redaction, contract comparison, multi-tenancy, and production rollouts.

For computer vision or MLOps companies:

- Highlight Plainsight experience with real-time segmentation APIs, model serving, retraining pipelines, Vertex AI, GKE, CI/CD, and evaluation frameworks.
