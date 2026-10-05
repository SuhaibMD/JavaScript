# Context: American Express MicroStrategy Self-Service Enablement Project

I am a senior Java/Spring developer and a new joiner on an American Express project. I need you to help me understand and work on this project from a **senior/principal-engineer perspective**, not just explain individual technologies.

## 1. How I want you to teach/explain

Use a first-principles, engineering-oriented approach.

Do NOT assume I know project-specific terminology unless it has already been established in this context.

For every important concept, explain:

1. What problem does it solve?
2. Why does the business need it?
3. How does the current/manual process work?
4. What is changing in the future-state system?
5. What does the system actually do?
6. What does the frontend do?
7. What does the backend do?
8. What external systems are involved?
9. What happens when things fail?
10. What are the security implications?
11. What are the production concerns?
12. What are the trade-offs?
13. What would a senior/principal engineer think about?
14. What questions should I ask the PO/SME/team?

Prefer realistic production/codebase reasoning over textbook definitions.

When something is unclear, explicitly say:

* **Confirmed by requirements**
* **Inferred**
* **TBD / needs clarification**

Do NOT invent MicroStrategy API endpoint names, authorization mappings, ServiceNow behavior, exact state names, or other project details that have not been established.

---

# 2. Overall project understanding

The initiative is broadly:

**MicroStrategy – Self-Service Enablement**

The goal is to reduce manual operational effort, improve productivity, and increase adoption of the Amex central BI platform.

There is already an existing production **EBI / Unified BI Portal**.

The team is NOT building MicroStrategy itself.

Instead, the team is building **governed self-service workflows/screens and API wrappers around MicroStrategy capabilities**.

The conceptual architecture is:

User
→ Existing Unified BI Portal / React UI
→ Java/Spring Boot backend
→ Authorization / validation / workflow orchestration
→ Change management / Slack where required
→ MicroStrategy wrapper/integration
→ MicroStrategy APIs / CMC / UMM
→ MicroStrategy platform

The portal and deployment infrastructure already exist.

The existing stack discussed in KT includes:

* React frontend
* Java/Spring Boot middle tier
* database/cache/backend infrastructure
* existing GitHub Actions CI/CD
* existing deployment infrastructure
* existing EBI/base platform

This is therefore primarily **new development/enhancement on an existing production platform**, not a completely greenfield application.

---

# 3. Broader Amex workstreams

The broader KT mentioned three related workstreams:

## A. MicroStrategy Self-Service

UI-driven workflows allowing authorized users to perform MicroStrategy administrative/platform operations through the Amex portal.

Examples discussed:

* project duplication
* user/group creation
* repository creation
* database connection creation
* release/deployment-related workflows
* other MicroStrategy administration workflows

The workflows should provide:

* authorization
* validation
* RBAC
* workflow/governance
* CRUD/operations where appropriate
* auditability
* status tracking
* notifications
* resiliency
* observability
* testing
* CI/CD

---

## B. Cross-BI API Wrapper Layer

This is related but should NOT automatically be treated as the same thing as the Self-Service UI.

It is an API-only abstraction layer intended to prevent consumers from directly calling vendor-specific BI APIs.

Target BI platforms discussed:

* Tableau
* Power BI
* MicroStrategy
* Looker

The purpose is to centralize Amex standards/governance/security concerns in the wrapper layer.

Tableau was mentioned as an initial focus.

Expected characteristics:

* OpenAPI specification
* Amex internal API standards
* vendor-specific adapters/wrappers
* unit tests
* Postman integration tests
* governance/compliance centralized in the wrapper

---

## C. xVision

Another existing application/workstream.

It is an internet-facing application used by co-brand partners external to Amex.

Areas discussed include:

* secure file sharing
* remote access
* quality/administration
* reporting access/RLS
* resiliency/quality
* vulnerability/compliance remediation

Anshul was mentioned as technical lead/SME.

This should be treated as a separate workstream unless requirements explicitly connect it to MicroStrategy Self-Service.

---

# 4. Important architecture principle

The Self-Service application should NOT be viewed as:

User → MicroStrategy

It is closer to:

User
→ Amex portal
→ Amex workflow
→ authorization
→ validation
→ governance
→ orchestration
→ MicroStrategy

The purpose is to expose complex administrative capabilities through a controlled Amex process.

The key engineering problem is therefore:

> How do we safely expose complex MicroStrategy administrative operations as governed, auditable, authorization-aware self-service workflows inside the existing Amex platform?

---

# 5. Current workflow being analyzed

The first detailed workflow shared is:

## WF-001 — Self-Service Project Duplication

Capability:

> Project creation by duplicating selected components from an existing MicroStrategy CMC project.

Primary persona:

> Authorized Project Duplication User / Migration Engineer

Business goal:

Create one or more new projects from one authorized source project across authorized instances and E1/E2/E3 targets, with independent tracking and E3 governance.

Priority:

P1

Wave:

MVP-1

Complexity:

Very High

---

# 6. Current/manual process

The previous process is described as involving:

* manual admin coordination
* approvals outside a unified workflow
* status tracking outside the unified workflow
* administrators manually performing operations

The future system moves this into the unified EBI portal.

---

# 7. WF-001 core business flow

The user:

1. Opens the duplication workflow.
2. System authorizes the user.
3. System displays only authorized source instances.
4. User selects one source instance/environment.
5. System loads eligible source projects.
6. User selects exactly one source project.
7. User selects one or more target instances/environments.
8. User specifies a target project name for each target.
9. User selects one common set of components.
10. User selects activation yes/no.
11. User provides a mandatory Slack group and optional comments.
12. If any target is E3, additional governance information is required.
13. System validates the complete request.
14. System creates a parent request plus independent child requests.
15. Each child is routed independently.
16. E3 children require RFC/change governance and Slack approval.
17. The system creates the target MicroStrategy project.
18. Selected components are copied.
19. Project is activated or remains disabled according to the user's choice.
20. User may terminate an eligible child.
21. Child results are persisted and parent status is aggregated.

---

# 8. Extremely important Parent/Child model

One source can produce multiple target children.

Example:

Source Project
→ Target A
→ Target B
→ Target C

This becomes:

Parent Request
├── Child A
├── Child B
└── Child C

Each child is independent.

Example:

Child A = Completed
Child B = Failed
Child C = Pending Approval

The system must NOT treat the entire operation as one database transaction.

There is explicitly:

> No cross-target rollback.

Failure or termination of one child must not roll back successful siblings.

The parent aggregates child outcomes.

Possible parent outcomes mentioned:

* Completed
* Partially Completed
* Failed
* Terminated

Exact final state taxonomy remains TBD.

This is an important orchestration/distributed-transaction problem.

---

# 9. E1 / E2 / E3 distinction

The workflow supports E1, E2 and E3.

E3 is special because it requires governance.

For an E3 child:

1. Create child.
2. Automatically create RFC/change record.
3. Request Slack approval.
4. Central EBI Core Team approves/rejects.
5. If approved, follow Standard/Normal change timing.
6. Execute only when governance permits execution.

Emergency Change is unsupported.

Standard Change executes immediately after approval.

Normal Change waits for an approved change window.

Exact change-window API is TBD.

E3 therefore is not simply another environment value. It changes the workflow/execution policy.

---

# 10. Personas / RBAC

## Authorized Project Duplication User

Can:

* view requests
* create duplication
* select authorized source
* select authorized targets
* perform cross-instance operations if authorized to both
* target E3 with governance
* terminate own child in eligible states

Cannot:

* approve E3
* execute E3
* administer configuration

---

## Central EBI Core Team

Can:

* view requests
* approve/reject E3
* approve through Slack
* any one approver is sufficient

Cannot:

* create duplication
* execute E3

---

## MSTR Admin

Can:

* view requests
* execute E3 after governance
* perform operational termination/support according to policy
* limited admin configuration

Exact admin capabilities remain TBD by Engineering/security.

---

## Engineering Team

Has:

* support/test access
* view access
* support/test execution capabilities

Production impersonation/elevation must follow enterprise controls.

---

# 11. Critical security principle

Authorization must be enforced at BOTH:

1. UI level
2. Backend/API level

Never rely only on hiding unauthorized options in React.

For example, even if the UI only shows:

Instance A
Instance B

the backend must reject a direct API request attempting:

Instance C

if the user is not authorized for C.

The requirement explicitly states:

> UI filtering alone is insufficient.

All operations must revalidate authorization server-side.

---

# 12. Main screens/components currently defined

## UI-001 — Project Duplication Form

Primary MVP form.

Captures:

* source
* targets
* names
* components
* activation
* Slack group
* comments

Authorization-filtered values.

CTAs:

* Validate / Continue
* Save Draft

---

## UI-002 — Source Selection

Select:

* source instance
* environment
* exactly one eligible project

Free-text project selection is not allowed.

---

## UI-003 — Target Selection Grid

Supports:

* multiple target rows
* target instance
* environment
* target project name
* activation
* name availability
* child preview
* add/remove target

---

## UI-004 — Component Selection

Available component categories:

* Schema Objects
* Application Objects
* Users
* User Groups
* Security Roles
* Object Permissions
* Schedules
* Subscriptions
* Caches

At least one must be selected.

Dependency behavior is TBD.

---

## UI-005 — E3 Governance

Shown conditionally when any target is E3.

Fields:

* Change Type
* Business Justification
* Approval Evidence

Also displays:

* RFC number
* RFC status
* RFC link
* approval status
* decision timestamp

---

## UI-006 — Review & Submit

Shows:

* source
* targets
* names
* component scope
* activation
* governance
* Slack
* comments

No sizing/impact preview in MVP-1.

---

## UI-007 — Parent / Child Status

Displays:

* parent request
* child requests
* target
* RFC
* approval
* project creation
* component copy
* activation
* termination
* final state

Operational analytics/dashboard is Phase 2.

---

## UI-008 — Terminate Child Dialog

Allows authorized user to terminate eligible child requests.

Captures:

* termination reason
* confirmation

Shows:

* current state
* impact warning

Termination semantics are still TBD.

---

# 13. API inventory currently known

## API-001 — Generate Duplication Draft

POST

`/duplication/requests`

Creates a draft/parent request.

User Delegated.

Idempotency key recommended.

---

## API-002 — Get Authorized Instances and Environments

GET

`/duplication/authorized-destinations`

Returns authorized instances/environments.

User Delegated.

---

## API-003 — Get Eligible Source Projects

GET

`/duplication/instances/{id}/environments/{env}/projects`

Uses WF-003 project eligibility/UMM criteria.

User Delegated.

---

## API-004 — Validate Target Project Name

POST

`/duplication/targets/validate-name`

Checks:

* target authorization
* name availability
* same-environment name collision

Must be rechecked immediately before project creation.

---

## API-005 — Validate Component Scope

POST

`/duplication/components/validate`

Checks selected component combinations.

Uses Service Account.

Dependency matrix is TBD.

---

## API-006 — Validate Complete Request

POST

`/duplication/requests/{id}/validate`

Returns:

* validation status
* child plan
* errors

---

## API-007 — Submit Parent and Create Children

POST

`/duplication/requests/{id}/submit`

Creates independent child requests.

Idempotency key required.

Partial child creation must be handled.

---

## API-008 — Create Empty Target Project and Copy Components

POST

`/duplication/children/{childId}/execute`

Conceptually performs:

Create target project
→ copy selected components
→ activate if required

May map to multiple native MicroStrategy APIs.

Auth:

Service Account / MSTR Admin for E3.

---

## API-009 — Auto Generate RFC

POST

Change Management API, endpoint TBD.

E3 only.

---

## API-010 — Create Slack Approval

POST

Slack approval integration, endpoint TBD.

Central EBI Core Team.

Any one approval is sufficient.

---

## API-011 — Get Parent and Child Status

GET

`/duplication/requests/{id}/status`

Supports independent child tracking.

---

## API-012 — Terminate Child Request

POST

`/duplication/children/{childId}/terminate`

Requires:

* child ID
* reason
* expected state

Idempotency required.

Safe-stop and cleanup semantics are TBD.

---

## API-013 — Send Slack Notification

POST

`/notifications/slack`

Used for lifecycle notifications.

This is distinct from the Slack approval integration.

---

# 14. Authentication model

Two broad models appear in the API contracts:

## User Delegated

Used for user-specific authorization-sensitive operations.

Examples:

* authorized destinations
* eligible projects
* target selection

## Service Account

Used for backend/system operations.

Examples:

* component validation
* orchestration
* RFC integration
* Slack
* MicroStrategy execution

Exact identity propagation and MicroStrategy entitlement mapping are still TBD.

---

# 15. Important NFR / validation requirements

## P0

### Authorization

Only authorized instances, environments and projects may be returned or selected.

Must validate both UI and direct API access.

### Target uniqueness

Target names must be checked during validation and again at creation time.

### Independent child execution

One child failing/terminating must not stop or roll back successful siblings.

### E3 governance

Every E3 child must:

RFC
→ Slack approval
→ Standard/Normal timing
→ execution

### Idempotency

Submit/create/execute/terminate operations need idempotency.

Goal:

Near-zero avoidable failures.

### Server-side security

All operations revalidate authorization.

### Audit

Capture:

* actor
* timestamp
* source
* destination
* project names
* selected scope
* comments
* RFC
* approval
* execution
* activation
* termination
* outcome
* system-generated events

---

## P1

* selected component copying
* activation behavior
* Slack lifecycle notifications
* authorization/project lookup performance
* independent child tracking

---

## Phase 2

Explicitly deferred:

* scope preview
* sizing
* analytics
* bulk source selection
* per-target component selection

Architecture should not block future extension.

---

# 16. Important production engineering concerns

The requirements strongly indicate that this is NOT a simple CRUD application.

Important concerns include:

### Distributed workflow

Your database transaction cannot automatically roll back MicroStrategy operations.

### Idempotency

Retries must not create duplicate projects.

### Partial failure

Example:

Target A → success
Target B → success
Target C → failure

A and B must remain successful.

### Concurrency

Target name can become unavailable between validation and execution.

Therefore runtime revalidation is mandatory.

### Restart recovery

The design should eventually answer what happens if the backend crashes during:

* project creation
* component copying
* RFC creation
* Slack approval
* activation

This is currently not fully specified.

### Timeout handling

External MicroStrategy/Slack/change-management calls may timeout without necessarily meaning the operation failed.

### Retry policy

Retryable vs non-retryable errors must eventually be distinguished.

### Audit

Business events need persistent audit history, not merely application logs.

### Observability

The eventual implementation should likely have:

* correlation IDs
* request IDs
* child IDs
* structured logs
* metrics
* external-call timing
* failure diagnostics

Exact observability requirements are not yet fully defined.

---

# 17. Important unresolved questions

Do not assume answers to these.

## MicroStrategy

* Exact native APIs?
* Is native project duplication available?
* Exact component-copy APIs?
* Component dependency matrix?
* Ordering requirements?
* Permission requirements?
* Can operations be cancelled?
* How is partial cleanup performed?

## Authorization

* Where is authorization data stored?
* What exactly is UMM?
* How is Amex entitlement mapped to MicroStrategy permissions?
* How frequently does authorization change?
* How does delegated identity work?

## E3 governance

* Exact Standard/Normal behavior?
* Where does change-window information come from?
* What happens if approval succeeds but the change window is missed?
* What happens if RFC succeeds but Slack approval creation fails?
* What happens if Slack approval is rejected?

## Orchestration

* Where is workflow state persisted?
* Is execution asynchronous?
* What owns retries?
* How is execution resumed after backend restart?
* How are duplicate requests detected?

## Termination

* What exactly does "terminate" mean?
* Can MicroStrategy cancel operations?
* Is cleanup mandatory?
* What happens if cleanup fails?
* Who owns cleanup?

## Audit

* Where is audit data stored?
* Retention period?
* Immutable?
* Business audit vs technical logging?

## UI

The requirements define UI-001 through UI-008, but do not definitively establish whether these are:

* separate routes/pages
* components in a wizard
* one form broken into sections

Do not assume this.

---

# 18. My current principal-engineer interpretation

Based on the information currently available:

> **This project is a governed workflow orchestration layer that exposes MicroStrategy administrative capabilities through the existing Amex BI portal.**

The hard engineering problems are:

Authorization
+
Workflow state
+
External-system orchestration
+
E3 governance
+
Partial failure
+
Idempotency
+
Concurrency
+
Auditability
+
MicroStrategy API limitations

The UI itself is not the hardest part.

The backend is not simply a collection of CRUD controllers.

The system is closer to a **workflow/orchestration platform with reusable infrastructure for multiple self-service capabilities**.

---

# 19. Reusable framework opportunity

The broader self-service program has multiple workflows.

Examples:

* project duplication
* user/group creation
* repository creation
* database connection creation
* deployment/release workflows
* other MicroStrategy administrative capabilities

These will repeatedly need:

Authorization
Validation
Request creation
RBAC
Audit
Governance
RFC
Approval
Notifications
Status
Retry
Error handling

Therefore a reusable self-service framework is likely important.

Conceptually:

Self-Service Framework
├── Authorization
├── Validation
├── Request Management
├── Workflow State
├── Audit
├── Notification
├── Approval/Governance
├── Error Handling
├── Retry/Idempotency
└── Observability

Then:

Workflow A
Workflow B
Workflow C
Workflow D

reuse those capabilities.

Do not prematurely design exact classes/packages until more requirements are available.

---

# 20. How to analyze future JSONs I provide

I may provide more Excel-derived JSON requirement sections.

For each new section:

1. Capture it.
2. Relate it to the existing requirements.
3. Identify contradictions or dependencies.
4. Identify new architectural implications.
5. Identify new TBD/open questions.
6. Do not invent missing information.
7. Preserve the source terminology.
8. Tell me whether something is:

   * Confirmed
   * Inferred
   * TBD
9. Do not give the final complete architecture assessment until I say **"all shared"**, unless I explicitly ask for it.

When I say **"all shared"**, produce a comprehensive project analysis.

---

# 21. When I eventually ask for the complete analysis

I want the final analysis to cover:

1. What this project is in simple language
2. Business problem
3. Current state
4. Future state
5. Overall architecture
6. Component-by-component responsibilities
7. End-to-end WF-001 walkthrough
8. Frontend responsibilities
9. Backend responsibilities
10. API responsibilities
11. MicroStrategy responsibilities
12. Authorization/RBAC
13. E1/E2/E3 behavior
14. RFC/change management
15. Slack approval/notifications
16. Parent/child orchestration
17. State machine
18. Data model
19. Idempotency
20. Retry
21. Partial failures
22. Termination
23. Concurrency
24. Audit
25. Observability
26. Security
27. Testing strategy
28. Unit testing
29. Postman integration testing
30. Playwright E2E testing
31. CI/CD
32. likely Spring Boot architecture
33. likely package/module structure
34. likely service/repository/client responsibilities
35. reusable framework design
36. what a Java/Spring developer is likely expected to implement
37. what I need to learn
38. questions I should ask the PO/SME
39. confirmed vs inferred vs TBD
40. MVP-1 vs Phase 2 boundaries
41. risks and technical debt
42. principal-engineer recommendations

Do not over-engineer the design beyond what the requirements justify.

---

# 22. My preferred answer style

Use concrete examples.

For example, instead of only saying:

> "The system needs idempotency."

Explain:

User submits:

`DUP-1001`

Target:

`MSTR-E3-PROJECT-A`

Request times out.

User retries.

Explain what happens if idempotency is NOT implemented and what should happen if it IS implemented.

Similarly, use concrete examples for:

* authorization
* parent/child
* E3 governance
* partial failure
* retry
* termination
* concurrency

I want to understand the **engineering reasoning**, not memorize terminology.

---

# 23. Important instruction

Do not confuse:

* MicroStrategy platform
* MicroStrategy Self-Service workflow
* Cross-BI API wrapper layer
* xVision
* existing EBI portal

They are related parts of the broader Amex context but are not automatically the same system.

Also do not assume that every API shown in the requirement JSON is already implemented. Many are explicitly placeholders/TBD and represent the intended contract/capability.

When discussing an API whose endpoint is marked TBD, refer to its capability name rather than inventing a real vendor endpoint.

# End of context
