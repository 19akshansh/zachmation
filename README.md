<div align="center">

<img src="./public/logo.svg" width="140" alt="Zachmation Logo" />

# Zachmation

### Open-Source AI Workflow Automation Platform

Build powerful AI workflows visually using drag-and-drop nodes, AI models, triggers, APIs, and automations.

<p align="center">
  <a href="https://zachmation.com">Website</a>
  ·
  <a href="#">Documentation</a>
  ·
  <a href="https://github.com/19akshansh/zachmation/issues">Report Bug</a>
  ·
  <a href="https://github.com/19akshansh/zachmation/issues">Request Feature</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/19akshansh/zachmation?style=for-the-badge" />
  <img src="https://img.shields.io/github/forks/19akshansh/zachmation?style=for-the-badge" />
  <img src="https://img.shields.io/github/issues/19akshansh/zachmation?style=for-the-badge" />
  <img src="https://img.shields.io/github/license/19akshansh/zachmation?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square" />
  <img src="https://img.shields.io/badge/Inngest-Workflow%20Engine-purple?style=flat-square" />
  <img src="https://img.shields.io/badge/BetterAuth-Authentication-green?style=flat-square" />
</p>

</div>

---

# 🚀 What is Zachmation?

Zachmation is a visual AI automation platform that allows users to build powerful workflows using drag-and-drop nodes.

Connect triggers, AI models, APIs, and integrations into automated pipelines without writing repetitive boilerplate code.

Whether you're creating AI content generators, internal automations, lead-processing systems, or agentic workflows, Zachmation provides the infrastructure to build and deploy them visually.

---

# 📸 Product Preview

## Workflow Builder

![Workflow Builder](./assets/workflows.gif)

## Execution Logs

![Execution Logs](./assets/executions.gif)

## Credentials Vault

![Credentials](./assets/credentials.gif)

## Billing Dashboard

![Billing](./assets/billing.gif)

---

# ✨ Features

## Visual Workflow Builder

* Drag-and-drop workflow editor
* Interactive node graph
* Real-time workflow editing
* Connection validation
* Node configuration panels

## AI-Powered Automation

* OpenAI Integration
* Google Gemini Integration
* Anthropic Claude Integration
* AI Image Generation
* Multi-provider architecture

## Workflow Triggers

* Manual Trigger
* Google Forms Trigger
* Stripe Trigger

## Execution Nodes

* AI Text Generation
* AI Image Generation
* HTTP Requests
* Discord Messages
* Slack Messages

## Security & Credentials

* Encrypted credential storage
* OAuth authentication
* Provider-specific secrets management
* Secure workflow execution

## Monitoring

* Execution logs
* Workflow history
* Error tracking
* Node-level status visibility

## Authentication & Billing

* Better Auth
* Google OAuth
* GitHub OAuth
* Polar Billing Integration

---

# 🏗️ Architecture

```text
┌──────────────────────────┐
│    Triggers/Executions   │
└──────────────────────────┘
        │
        ▼
┌───────────────┐
│ Workflow Core │
└───────┬───────┘
        │
        ▼
┌─────────────────────────────┐
│ AI Providers + Credentials  │
└───────┬─b───────────────────┘
        │
        ▼
┌────────────────────────────────┐
│ Integrations + Execution Logs  │
└────────────────────────────────┘
```

---

# 🤖 Supported AI Providers

<div align="center">

<img src="./public/openai.svg" width="90" />
&nbsp;&nbsp;&nbsp;
<img src="./public/gemini.svg" width="90" />
&nbsp;&nbsp;&nbsp;
<img src="./public/anthropic.svg" width="90" />
&nbsp;&nbsp;&nbsp;
<img src="./public/blackforest.svg" width="90" />

</div>

### Current Providers

| Provider          | Status |
| ----------------- | ------ |
| OpenAI            | ✅      |
| Gemini            | ✅      |
| Claude            | ✅      |
| Black Forest Labs | ✅      |
| Hugging Face      | 🚧     |

---

# 🔌 Integrations

<div align="center">

<img src="./public/slack.svg" width="80" />
&nbsp;&nbsp;&nbsp;
<img src="./public/discord.svg" width="80" />
&nbsp;&nbsp;&nbsp;
<img src="./public/gforms.svg" width="80" />
&nbsp;&nbsp;&nbsp;
<img src="./public/stripe.svg" width="80" />

</div>

---

# 🧩 Available Nodes

| Category      | Nodes                                    |
| ------------- | ---------------------------------------- |
| Triggers      | Manual Trigger, Google Forms, Stripe     |
| AI            | OpenAI, Gemini, Claude, Image Generation |
| Communication | Slack, Discord                           |
| Utility       | HTTP Request                             |
| Logic         | Coming Soon                         |

---

# ⚡ Example Workflow

## AI Lead Qualification

```text
Google Form Submission
          │
          ▼
     Gemini AI
          │
          ▼
     HTTP Request
          │
          ▼
    Discord Alert
```

### Flow

1. User submits form
2. AI analyzes response
3. Lead data is sent to external API
4. Team receives notification

---

# 🛠️ Tech Stack

<table align="center">
<tr>
<th>Category</th>
<th>Technology</th>
</tr>

<tr>
<td><b>Frontend</b></td>
<td>
<img src="https://skillicons.dev/icons?i=nextjs" height="32" title="Next.js" alt="Next.js" />
&nbsp;
<img src="https://skillicons.dev/icons?i=react" height="32" title="React" alt="React" />
&nbsp;
<img src="https://skillicons.dev/icons?i=ts" height="32" title="TypeScript" alt="TypeScript" />
&nbsp;
<img src="https://skillicons.dev/icons?i=tailwind" height="32" title="Tailwind CSS" alt="Tailwind CSS" />
&nbsp;
<img src="https://reactflow.dev/img/logo.svg" height="32" title="React Flow" alt="React Flow" />
&nbsp;
<img src="https://ui.shadcn.com/apple-touch-icon.png" height="32" title="shadcn/ui" alt="shadcn/ui" />
</td>
</tr>

<tr>
<td><b>Backend</b></td>
<td>
<img src="https://trpc.io/img/logo.svg" height="32" title="tRPC" alt="tRPC" />
&nbsp;
<img src="https://cdn.worldvectorlogo.com/logos/prisma-2.svg" height="32" title="Prisma ORM" alt="Prisma ORM" />
&nbsp;
<img src="https://www.postgresql.org/media/img/about/press/elephant.png" height="32" title="PostgreSQL" alt="PostgreSQL" />
&nbsp;
<img src="https://www.inngest.com/favicon.ico" height="32" title="Inngest" alt="Inngest" />
</td>
</tr>

<tr>
<td><b>Authentication</b></td>
<td>
<svg xmlns="http://www.w3.org/2000/svg"
width="32"
height="32"
fill="currentColor"
viewBox="0 0 24 24"
title="Better Auth">
<path d="M12.1 10.36H15.149999999999999V13.68H12.1z" />
<path d="m3,3v18h18V3H3Zm15.48,10.68v3h-6.38v-3h-3.48v3h-3.13V7.36h3.13v3h3.48v-3h6.38v6.32Z" />
</svg>
&nbsp;
<img src="https://cdn.simpleicons.org/github" height="32" title="GitHub OAuth" alt="GitHub OAuth" />
&nbsp;
<img src="https://cdn.simpleicons.org/google" height="32" title="Google OAuth" alt="Google OAuth" />
</td>
</tr>

<tr>
<td><b>Billing</b></td>
<td>
<img src="https://polar.sh/favicon.ico" height="32" title="Polar" alt="Polar" />
</td>
</tr>

<tr>
<td><b>Monitoring</b></td>
<td>
<img src="https://cdn.worldvectorlogo.com/logos/sentry-3.svg" height="32" title="Sentry" alt="Sentry" />
</td>
</tr>

</table>

---

# 🚀 Quick Start

## Clone Repository

```bash
git clone https://github.com/19akshansh/zachmation.git
cd zachmation
```

## Install Dependencies

```bash
npm install --legacy-peer-deps
```

## Configure Environment Variables

Create a `.env` file and view `/.env.example` for reference.


## Generate Prisma Client

```bash
npx prisma generate
```

## Run Migrations

```bash
npx prisma migrate deploy
```

## Start Development Server

```bash
npm run dev:all
```

---

# 📂 Project Structure

```text
src
├── app
├── components
├── features
│   ├── editor
│   ├── credentials
│   ├── workflows
│   └── nodes
├── inngest
├── lib
├── server
└── trpc
```

---

# 🗺️ Roadmap

## Near Term

* [ ] Workflow Templates
* [ ] API Workflow Execution
* [ ] Webhook Trigger
* [ ] Conditional Logic
* [ ] Delay / Wait Nodes

## Future

* [ ] Agent Nodes
* [ ] Workflow Marketplace
* [ ] Team Workspaces
* [ ] Public APIs
* [ ] Community Templates

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Open a Pull Request

---

# ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=19akshansh/zachmation&type=Date)](https://star-history.com)


---

# 📜 License

Licensed under the MIT License.

---

<div align="center">

### Built with ❤️ using Next.js, Prisma, Inngest, and AI

If Zachmation helps you, consider giving the repository a ⭐

</div>
