create or replace function public.current_user_can_access_scope(
  target_campus_id bigint,
  target_institute_id bigint,
  target_department_id bigint
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and (
        profiles.role in ('admin', 'vice_chancellor', 'deputy_director')
        or (profiles.role = 'campus_coordinator' and profiles.campus_id = target_campus_id)
        or (profiles.role = 'institute_coordinator' and profiles.institute_id = target_institute_id)
        or (profiles.role = 'department_coordinator' and profiles.department_id = target_department_id)
      )
  );
$$;

create or replace function public.current_user_can_write_department(
  target_department_id bigint
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and (
        profiles.role = 'admin'
        or (profiles.role = 'department_coordinator' and profiles.department_id = target_department_id)
      )
  );
$$;

create or replace function public.current_user_can_delete_records()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'vice_chancellor')
  );
$$;

alter table public.collaborations enable row level security;
alter table public.faculty_stats enable row level security;
alter table public.student_stats enable row level security;
alter table public.consultancy_projects enable row level security;
alter table public.research_grants enable row level security;
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.institutes enable row level security;
alter table public.campuses enable row level security;
alter table public.universities enable row level security;
alter table public.industries enable row level security;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', policy_record.policyname);
  end loop;
end
$$;

create policy profiles_select_own_policy
on public.profiles
for select
using (
  auth.uid() = id
);

create policy profiles_update_own_policy
on public.profiles
for update
using (
  auth.uid() = id
)
with check (
  auth.uid() = id
);

drop policy if exists collaborations_select_policy on public.collaborations;
create policy collaborations_select_policy
on public.collaborations
for select
using (
  public.current_user_can_access_scope(campus_id, institute_id, department_id)
);

drop policy if exists collaborations_insert_policy on public.collaborations;
create policy collaborations_insert_policy
on public.collaborations
for insert
with check (
  public.current_user_can_write_department(department_id)
);

drop policy if exists collaborations_update_policy on public.collaborations;
create policy collaborations_update_policy
on public.collaborations
for update
using (
  public.current_user_can_access_scope(campus_id, institute_id, department_id)
)
with check (
  public.current_user_can_write_department(department_id)
);

drop policy if exists collaborations_delete_policy on public.collaborations;
create policy collaborations_delete_policy
on public.collaborations
for delete
using (
  public.current_user_can_delete_records()
);

drop policy if exists faculty_stats_select_policy on public.faculty_stats;
create policy faculty_stats_select_policy
on public.faculty_stats
for select
using (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = faculty_stats.collaboration_id
      and public.current_user_can_access_scope(
        collaborations.campus_id,
        collaborations.institute_id,
        collaborations.department_id
      )
  )
);

drop policy if exists faculty_stats_insert_policy on public.faculty_stats;
create policy faculty_stats_insert_policy
on public.faculty_stats
for insert
with check (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = faculty_stats.collaboration_id
      and public.current_user_can_write_department(collaborations.department_id)
  )
);

drop policy if exists faculty_stats_update_policy on public.faculty_stats;
create policy faculty_stats_update_policy
on public.faculty_stats
for update
using (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = faculty_stats.collaboration_id
      and public.current_user_can_access_scope(
        collaborations.campus_id,
        collaborations.institute_id,
        collaborations.department_id
      )
  )
)
with check (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = faculty_stats.collaboration_id
      and public.current_user_can_write_department(collaborations.department_id)
  )
);

drop policy if exists faculty_stats_delete_policy on public.faculty_stats;
create policy faculty_stats_delete_policy
on public.faculty_stats
for delete
using (
  public.current_user_can_delete_records()
);

drop policy if exists student_stats_select_policy on public.student_stats;
create policy student_stats_select_policy
on public.student_stats
for select
using (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = student_stats.collaboration_id
      and public.current_user_can_access_scope(
        collaborations.campus_id,
        collaborations.institute_id,
        collaborations.department_id
      )
  )
);

drop policy if exists student_stats_insert_policy on public.student_stats;
create policy student_stats_insert_policy
on public.student_stats
for insert
with check (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = student_stats.collaboration_id
      and public.current_user_can_write_department(collaborations.department_id)
  )
);

drop policy if exists student_stats_update_policy on public.student_stats;
create policy student_stats_update_policy
on public.student_stats
for update
using (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = student_stats.collaboration_id
      and public.current_user_can_access_scope(
        collaborations.campus_id,
        collaborations.institute_id,
        collaborations.department_id
      )
  )
)
with check (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = student_stats.collaboration_id
      and public.current_user_can_write_department(collaborations.department_id)
  )
);

drop policy if exists student_stats_delete_policy on public.student_stats;
create policy student_stats_delete_policy
on public.student_stats
for delete
using (
  public.current_user_can_delete_records()
);

drop policy if exists consultancy_projects_select_policy on public.consultancy_projects;
create policy consultancy_projects_select_policy
on public.consultancy_projects
for select
using (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = consultancy_projects.collaboration_id
      and public.current_user_can_access_scope(
        collaborations.campus_id,
        collaborations.institute_id,
        collaborations.department_id
      )
  )
);

drop policy if exists consultancy_projects_insert_policy on public.consultancy_projects;
create policy consultancy_projects_insert_policy
on public.consultancy_projects
for insert
with check (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = consultancy_projects.collaboration_id
      and public.current_user_can_write_department(collaborations.department_id)
  )
);

drop policy if exists consultancy_projects_update_policy on public.consultancy_projects;
create policy consultancy_projects_update_policy
on public.consultancy_projects
for update
using (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = consultancy_projects.collaboration_id
      and public.current_user_can_access_scope(
        collaborations.campus_id,
        collaborations.institute_id,
        collaborations.department_id
      )
  )
)
with check (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = consultancy_projects.collaboration_id
      and public.current_user_can_write_department(collaborations.department_id)
  )
);

drop policy if exists consultancy_projects_delete_policy on public.consultancy_projects;
create policy consultancy_projects_delete_policy
on public.consultancy_projects
for delete
using (
  public.current_user_can_delete_records()
);

drop policy if exists research_grants_select_policy on public.research_grants;
create policy research_grants_select_policy
on public.research_grants
for select
using (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = research_grants.collaboration_id
      and public.current_user_can_access_scope(
        collaborations.campus_id,
        collaborations.institute_id,
        collaborations.department_id
      )
  )
);

drop policy if exists research_grants_insert_policy on public.research_grants;
create policy research_grants_insert_policy
on public.research_grants
for insert
with check (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = research_grants.collaboration_id
      and public.current_user_can_write_department(collaborations.department_id)
  )
);

drop policy if exists research_grants_update_policy on public.research_grants;
create policy research_grants_update_policy
on public.research_grants
for update
using (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = research_grants.collaboration_id
      and public.current_user_can_access_scope(
        collaborations.campus_id,
        collaborations.institute_id,
        collaborations.department_id
      )
  )
)
with check (
  exists (
    select 1
    from public.collaborations
    where collaborations.id = research_grants.collaboration_id
      and public.current_user_can_write_department(collaborations.department_id)
  )
);

drop policy if exists research_grants_delete_policy on public.research_grants;
create policy research_grants_delete_policy
on public.research_grants
for delete
using (
  public.current_user_can_delete_records()
);

drop policy if exists departments_select_policy on public.departments;
create policy departments_select_policy
on public.departments
for select
using (
  exists (
    select 1
    from public.profiles
    join public.institutes on institutes.id = departments.institute_id
    where profiles.id = auth.uid()
      and (
        profiles.role in ('admin', 'vice_chancellor', 'deputy_director')
        or (profiles.role = 'campus_coordinator' and profiles.campus_id = institutes.campus_id)
        or (profiles.role = 'institute_coordinator' and profiles.institute_id = departments.institute_id)
        or (profiles.role = 'department_coordinator' and profiles.department_id = departments.id)
      )
  )
);

drop policy if exists institutes_select_policy on public.institutes;
create policy institutes_select_policy
on public.institutes
for select
using (
  exists (
    select 1
    from public.profiles
    join public.departments on departments.institute_id = institutes.id
    where profiles.id = auth.uid()
      and (
        profiles.role in ('admin', 'vice_chancellor', 'deputy_director')
        or (profiles.role = 'campus_coordinator' and profiles.campus_id = institutes.campus_id)
        or (profiles.role = 'institute_coordinator' and profiles.institute_id = institutes.id)
        or (profiles.role = 'department_coordinator' and profiles.department_id = departments.id)
      )
  )
);

drop policy if exists campuses_select_policy on public.campuses;
create policy campuses_select_policy
on public.campuses
for select
using (
  exists (
    select 1
    from public.profiles
    join public.institutes on institutes.campus_id = campuses.id
    join public.departments on departments.institute_id = institutes.id
    where profiles.id = auth.uid()
      and (
        profiles.role in ('admin', 'vice_chancellor', 'deputy_director')
        or (profiles.role = 'campus_coordinator' and profiles.campus_id = campuses.id)
        or (profiles.role = 'institute_coordinator' and profiles.institute_id = institutes.id)
        or (profiles.role = 'department_coordinator' and profiles.department_id = departments.id)
      )
  )
);

drop policy if exists universities_select_policy on public.universities;
create policy universities_select_policy
on public.universities
for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and (
        profiles.role in ('admin', 'vice_chancellor', 'deputy_director')
        or profiles.university_id = universities.id
      )
  )
);

drop policy if exists industries_select_policy on public.industries;
create policy industries_select_policy
on public.industries
for select
using (
  exists (
    select 1
    from public.collaborations
    where collaborations.industry_id = industries.id
      and public.current_user_can_access_scope(
        collaborations.campus_id,
        collaborations.institute_id,
        collaborations.department_id
      )
  )
);
