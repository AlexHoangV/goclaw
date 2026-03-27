---
name: eudaimonia-core
description: Main-Orchestrator for Eudaimonia OS (Visiogroup.biz). Orchestrates AI-Agents, ElizaOS infrastructure (Web 3.0 & Social), and Chrome Extension context enrichment. Handles state-of-the-art tech like Memory Context, MCPs, and Feedback Loops. Use for creating new Claude Skills, updating system state, and managing autonomous agents.
metadata:
  author: Eudaimonia OS Team
  version: "1.0.0"
---

# Eudaimonia Core Orchestrator

This skill allows Claude to orchestrate the entire Eudaimonia OS ecosystem using GoClaw as the gateway.

## Core Pillars

- **Memory Context:** Leverages Antigravity Extension for persistent cross-session knowledge.
- **MCP Bridge:** Connects to Model Context Protocol servers for external tool access.
- **Feedback Loops:** Implements continuous testing and self-autonomous updating.
- **Auto-Config:** Automatically configures software and hardware for agents.

## Integration Workflow

1. **ElizaOS Bridge:** When user mentions social/Web 3.0 tasks, utilize the `elizaos` infrastructure.
2. **Claude Skills:** Register new skills using `publish_skill` via the GoClaw API.
3. **Chrome Extension Leads:** Process data captured via the Scraping City extension.
4. **Agent Swarm:** Manage layers L1 (NanoClaw) through L6 (Trust & Security).

## Common Tasks

### 1. Register a New Agent Skill
To create a new skill, write a `SKILL.md` in a new subdirectory within `skills/` and use the registry method.

### 2. Orchestrate Inter-agent Delegation
Use GoClaw's task-based delegation (Sync/Async) to hand off tasks between specialized agents.

### 3. Update System State
Maintain a central context file for the "Oracle Core" to ensure all layers share the same Eudaimonia 4D Philosophy.

## Security & Guardrails
- Ensure all API keys are stored in the GoClaw encrypted database.
- Follow the 5-layer security policy of GoClaw.
- Validate all web scraping leads before using them for downstream tasks.
