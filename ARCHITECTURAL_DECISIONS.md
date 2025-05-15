# Architectural Decisions – Jira Clone Phase 2

---

## ADR 001 – Migration to Serverless with Supabase

**Context:**
To simplify backend management and scale seamlessly.

**Decision:**
Use Supabase (PostgreSQL, Auth, Storage, RLS) to replace the Node/Express backend.

**Consequences:**
No need to manage servers. Limited backend logic unless Edge Functions are used.

**Status:**
Accepted

---

## ADR 002 – Schema Design Aligned with Supabase

**Context:**
Adapt the existing schema to be compatible with Supabase's PostgreSQL.

**Decision:**
Use normalized tables (`projects`, `tasks`, `comments`, `users`, `organizations`) with foreign keys.

**Consequences:**
Clean, relational design. Some Supabase limitations on advanced features.

**Status:**
Accepted

---

## ADR 003 – Use of Row-Level Security for Multi-Tenancy

**Context:**
Each organization/user should only access their own data and data related to projects they are involved in.

**Decision:**
Enforce RLS policies across all data tables using user IDs stored in the `users` table.

**Consequences:**
Enables multi-tenancy. Adds complexity in queries and RLS.

**Status:**
Accepted

---

## ADR 004 – Authentication and Authorization

**Context:**
Need secure login, roles, and session management.

**Decision:**
Use Supabase Auth with JWT and email/password login (OAuth optional). For this project specifically, a guest user is created to fetch all features.

**Consequences:**
Built-in session handling. Less flexibility than custom auth flows.

**Status:**
Accepted
