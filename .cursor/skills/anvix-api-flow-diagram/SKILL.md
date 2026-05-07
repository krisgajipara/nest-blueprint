---
name: anvix-api-flow-diagram
description: Generates frontend-oriented REST API flow documentation (HTTP contracts, envelopes, screen-to-API matrices, client state) plus ASCII diagrams, feature mapping, integration phases, templates, quality checks, and error flows for Anvix backend modules. Use when the user asks for API flow diagrams, frontend handoff docs, codegen/Swagger companion docs, or outputs matching the api-flow-diagram prompt in full detail.
---

# Anvix API flow diagram

## Use this skill when

- Documenting a module’s HTTP API for frontend or product teams.
- Producing user-journey flows (UI → API → response) with success and error paths.
- Defining integration order (core / enhancement / advanced) and dependencies.

## Required first step

Read the full prompt and templates from:

`libs/@anvix/documents/dev-guidelines/developer-guideline/api-flow-diagram-prompt.md`

Use that document as the authoritative structure, checklist, and examples. This skill is an execution guide that mirrors that prompt for consistent output quality.

## Mandatory structure (in this exact order)

0. **Frontend handoff bundle** (immediately after title/module metadata for frontend-facing docs):
   - HTTP basics: base URL pattern, global prefix, content type.
   - Headers: `Authorization`, tenant headers (`x-tenant`/`x-tenant-id`), optional `language_code`.
   - Success envelope (`AppResponse`: `message`, `data`, including `{}` behavior).
   - Error envelope (global filter shape: `message`, `developerErrors`).
   - Status/key-to-UI mapping (toast, inline error, relogin redirect).
   - Journey table: Screen | Action | HTTP | Auth | Persist on client | Next step.
   - Enum values in JSON exactly as backend expects (numeric vs string).
   - Optional machine-readable endpoint index JSON for automation.
1. **Complete API Flow Visualization**
2. **Feature-to-API Mapping**
3. **API Integration Priority**
4. **Template for Future API Additions**
5. **Error Handling Flow**

## Workflow

1. **Identify module and target output**
   - Replace `[MODULE_NAME]` with real module name.
   - If user gives a file path under `docs/`, update that file; otherwise return markdown in chat.
2. **Prepare context (required before drafting)**
   - Endpoints from `src/modules/{module}/*.controller.ts`.
   - DTOs and response DTOs from `libs/@anvix/business-core/modules/{module}/`.
   - Guards/decorators for auth and permissions.
   - Error keys/statuses from service and filter behavior.
   - Tenant/header expectations from `libs/@anvix/documents/TENANT_GUIDE.md`.
   - User stories/screens if supplied by user; otherwise infer from controller routes.
3. **Generate content using mandatory structure**
   - Keep section order fixed.
   - Include both success and error branches for each major journey.
4. **Run quality checklist before finalizing**
   - Do not finalize until all checklist items pass (or explicitly mark unknown items).
5. **Deliver output**
   - Markdown with clear headings.
   - ASCII diagrams in fenced blocks.
   - Reusable templates and optional TypeScript snippets where ambiguity exists.

## Detailed guidelines to mirror prompt

## Conventions

- Match repo terms (Nest controllers, `AppResponse`, guards, DTO names, interceptors/filters).
- Prefer actionable frontend language: exact JSON fields, storage decisions, state transitions.
- Keep diagrams readable and consistent (`/v1/...` normalization where applicable).
- Include real-world usage scenarios and integration dependencies.

### Guidelines for flow diagrams

- Use consistent ASCII box style and directional arrows.
- Cover all major journeys and edge cases.
- Ensure no dead-end branches; every path must terminate clearly.
- Group related flows by feature/screen.

### Guidelines for feature mapping

- Always break down: API call, UI components, state management, validation.
- Include concrete component/screen examples when known.
- Show data flow and state updates after each response.

### Guidelines for integration priority

- Phase 1: Core (must-have), Phase 2: Important (should-have), Phase 3: Enhanced (nice-to-have).
- Include timeline recommendations when user asks.
- Show explicit inter-endpoint dependencies.

### Guidelines for templates

- Provide reusable ASCII flow template.
- Provide reusable feature-map template.
- Provide API changelog/version template.
- Keep templates copy-paste ready.

### Technical requirements

- Use consistent formatting and terminology.
- Include code examples/snippets only when they improve clarity.
- Show integration order and maintenance guidance.

### Output format requirements

- Use clear markdown headers (`##`, `###`, `####` as needed).
- Use fenced code blocks for ASCII and TypeScript snippets.
- Prefer bullets/numbered lists over long prose for operational sections.

## Quality checklist (must run)

- [ ] All major user journeys are covered.
- [ ] Flow diagrams are clear, complete, and branch-safe.
- [ ] Feature mappings are detailed (API/UI/state/validation).
- [ ] Integration priorities are logical with dependencies.
- [ ] Templates are reusable and copy-paste ready.
- [ ] Error handling is comprehensive (network/auth/business/user-facing).
- [ ] Documentation is maintainable and version-ready.

## How to adapt for module-specific needs

Add module-specific requirements when relevant:
- Authentication/authorization specifics.
- Validation/business-rule constraints.
- Security/performance considerations.
- Compliance/industry needs (if user asks).

## Best practices

1. Keep diagrams updated whenever APIs change.
2. Use consistent formatting across modules.
3. Prefer real request/response examples over placeholders.
4. Validate docs with frontend integration needs.
5. Track versions/changelog in docs.
6. Use templates first for consistency.

## Optional inputs to ask for

- Global API prefix and auth scheme (Bearer, public routes).
- Priority user stories or screens to emphasize.
- Known error codes or keys from `error.json` if the doc should reference them.
