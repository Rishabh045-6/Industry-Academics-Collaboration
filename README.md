# Industry Academia Collaboration

This project requires Supabase environment variables to run locally.

Create a local env file from the example before starting:

- macOS / Linux: `cp .env.local.example .env.local`
- Windows: `type .env.local.example > .env.local`

Then replace the placeholders with your Supabase project URL and anonymous key.

Lean Next.js application scaffold for tracking industry-academia collaboration across the hierarchy:

Department Coordinator -> Institute Coordinator -> Campus Coordinator -> Deputy Director -> Vice Chancellor

## 1. Architecture

- Frontend: Next.js App Router + Tailwind CSS + Recharts
- Backend pattern: Next.js route handlers, ready to swap to Supabase or Node services
- Database: PostgreSQL schema in `db/schema.sql`
- Data flow: department-only entry, upward aggregation by scope-aware queries

### Modules

- Auth and role resolution
- Hierarchy and master data
- Collaboration CRUD
- Analytics and aggregation
- Profile and RBAC visibility

### Navigation

- `/login`
- `/dashboard`
- `/collaborations`
- `/collaborations/new`
- `/collaborations/[id]`
- `/analytics`
- `/profile`

## 2. Database schema

Core tables are:

- `roles`, `users`
- `universities`, `campuses`, `institutes`, `departments`
- `industries`
- `collaborations`
- `faculty_stats`
- `student_stats`
- `consultancy_projects`
- `research_grants`

### Relation model

- One university has many campuses
- One campus has many institutes
- One institute has many departments
- One department creates many collaborations
- One collaboration belongs to one industry
- One collaboration has one faculty stat row and one student stat row
- One collaboration has many consultancy projects and research grants

### Aggregation-ready fields

- `consultancy_count`, `consultancy_total_amount`
- `research_grant_count`, `research_grant_total_amount`
- denormalized hierarchy foreign keys on `collaborations`
- `mou_date`, `is_active`, `created_by`, timestamps

## 3. RBAC rules

- Department Coordinator: full CRUD on own department records, own dashboard, own analytics
- Institute Coordinator: view and analytics across departments in assigned institute
- Campus Coordinator: view and analytics across institutes in assigned campus
- Deputy Director: cross-campus review and comparison
- Vice Chancellor: university-wide analytics and progressive drill-down
- Admin: optional full access for setup and corrections

## 4. Dashboard breakdown by role

- Department Coordinator: quick stats, record list, create/edit entry, own trends
- Institute Coordinator: department comparison, active MoUs, consultancy and grant totals
- Campus Coordinator: institute comparison, trend analysis, top performing departments
- Deputy Director: cross-campus bar and trend views, high-level KPI review
- Vice Chancellor: global KPIs, campus comparison, thrust area distribution, full drill-down

Every dashboard includes:

- KPI cards
- global filters
- pie, bar, stacked, and line charts
- drill-down table

## 5. UI layout

### Shared layout

- Left navigation rail with role context
- Top content section with summary
- Filter bar near top
- KPI grid in first scroll viewport
- Chart grid next
- Drill-down table after charts

### Screen layout rules

- Important data placed top-left in summary and KPI sections
- Related metrics grouped in cards
- Consistent palette across charts
- Avoided crowded widget stacks

## 6. Minimal file structure

```text
app/
  api/
    collaborations/
      [id]/route.ts
      route.ts
    dashboard/route.ts
  analytics/page.tsx
  collaborations/
    [id]/page.tsx
    new/page.tsx
    page.tsx
  dashboard/page.tsx
  docs/page.tsx
  login/page.tsx
  profile/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  app-shell.tsx
  charts-panel.tsx
  collaboration-form.tsx
  drilldown-table.tsx
  filter-bar.tsx
  kpi-grid.tsx
  record-table.tsx
db/
  schema.sql
lib/
  aggregation.ts
  mock-data.ts
  rbac.ts
  types.ts
```

## 7. API routes

- `GET /api/dashboard?role=vice_chancellor`
- `GET /api/collaborations`
- `GET /api/collaborations/:id`

Recommended next routes when wiring the real backend:

- `POST /api/collaborations`
- `PATCH /api/collaborations/:id`
- `DELETE /api/collaborations/:id`
- `GET /api/master-data`
- `GET /api/analytics/drilldown`

## 8. Aggregation logic

1. Department coordinator creates or updates a collaboration record.
2. The record stores the full hierarchy foreign key chain.
3. Summary fields are refreshed on the `collaborations` row:
   - consultancy count and amount
   - research grant count and amount
4. Dashboard queries apply RBAC scope filters first.
5. Aggregations group by role-specific next child:
   - VC/Deputy Director -> campus
   - Campus Coordinator -> institute
   - Institute Coordinator -> department
   - Department Coordinator -> own records
6. Drill-down narrows filters progressively until record detail.

## 9. Build roadmap

1. Set up Next.js, Tailwind, base navigation, and role-aware routing.
2. Create PostgreSQL schema and seed master hierarchy data.
3. Add authentication and attach each user to a role plus scope node.
4. Build department-only CRUD forms with validation.
5. Save faculty, student, consultancy, and grant child rows transactionally.
6. Refresh collaboration summary fields after each write.
7. Expose scope-aware API routes for dashboards and tables.
8. Wire dashboard charts and drill-down filters to live queries.
9. Add exports, audits, and production hardening only after the core workflow is stable.

## Notes

- Current scaffold uses mock data in `lib/mock-data.ts` to demonstrate hierarchy propagation.
- The UI is intentionally simple and role-focused, without extra modules outside the requested scope.
- Dependency installation and runtime verification were not executed in this workspace.

Demo Login:
Email: demo@university.edu
Password: demo@123