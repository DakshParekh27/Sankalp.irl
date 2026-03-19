# Sankalp Project Overview

## Problem Statement
The **Sankalp** project aims to bridge the gap between local governance and citizens by providing a transparent, AI-driven platform for civic issue redressal and optimized welfare distribution. Traditional systems often suffer from:
- **Lack of Verification**: Difficulty in confirming if reported issues (e.g., potholes, waste) are actually resolved.
- **Fraudulent Submissions**: Risk of officers submitting AI-generated or recycled photos as "proof" of work.
- **Inaccurate Resource Allocation**: Generic welfare distribution that doesn't account for complex causal factors or budget constraints.

## Project Structure
The project is built with a modular architecture:

```text
Sankalp.irl/
├── Backend/          # Node.js & Express API (Auth, Complaints, Welfare)
├── Frontend/         # React + Vite + Tailwind CSS Web Application
├── Feature2/         # Welfare Allocation Optimizer (Python, Causal ML)
├── Feature3/         # Issue Verification AI Pipeline (FastAPI, Moondream2)
├── services/         # Shared infrastructure services
└── docker-compose.yml # Containerization for the entire ecosystem
```

## Core Features

### 1. AI-Powered Civic Issue Verification (Feature 3)
Located in `Feature3/`, this service ensures that civic repairs are bona fide.
- **Before & After Analysis**: Uses the `moondream2` Vision Language Model (VLM) to compare "before" and "after" images to verify if a reported issue is resolved.
- **Deepfake Detection**: Integrates an AI image detector to flag submissions that appear to be AI-generated/artificial, preventing fraud.
- **Automated Reporting**: Provides structured JSON feedback on resolution status and confidence.

### 2. Welfare Allocation Optimizer (Feature 2)
Located in `Feature2/`, this is a data science engine for efficient governance.
- **Causal Analysis**: Uses S-Learner models to estimate the "uplift" (positive impact) of specific welfare schemes on individual households.
- **Budget Optimization**: A `PolicyOptimizer` that takes a total budget and identifies the best households to receive specific treatments (Cash Transfer, Food Subsidy, etc.) to maximize ROI per rupee.
- **Counterfactual Reasoning**: Simulates "what-if" scenarios to predict outcomes of different policy decisions.

### 3. Integrated Governance Dashboard (Backend & Frontend)
- **Complaint Management**: A system for citizens to report issues and track their progress.
- **Welfare Portal**: Administrative tools to run the optimizer and view impact statistics.
- **Real-time Maps**: Integration with map services to visualize civic issues and welfare distribution across different wards.

## Tech Stack
- **Languages**: JavaScript (Node.js/React), Python 3.9+
- **Database**: PostgreSQL (with PostGIS support for geographic data)
- **AI/ML Frameworks**: PyTorch, Hugging Face Transformers, FastAPI
- **Frontend**: React (Vite), Tailwind CSS
- **Containerization**: Docker & Docker Compose
