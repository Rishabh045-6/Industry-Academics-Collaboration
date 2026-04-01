-- Demo presentation seed for Industry Academia Collaboration
-- Safe intent: add a compact hierarchy plus 10 realistic collaboration records without changing auth, RBAC, RLS, or schema.
-- Assumption: live Supabase uses profiles.id / auth uid for collaborations.created_by.

create temporary table tmp_demo_record_keys (
  campus_code text,
  institute_code text,
  department_code text,
  industry_name text,
  thrust_area text,
  mou_date date,
  duration_months integer,
  is_active boolean,
  new_courses integer,
  case_studies integer,
  partial_delivery integer,
  academic_activities integer,
  consultancy_count integer,
  consultancy_total_amount numeric(14, 2),
  research_grant_count integer,
  research_grant_total_amount numeric(14, 2),
  csr_fund numeric(14, 2),
  centres_of_excellence integer,
  innovation_labs integer,
  student_projects integer,
  internships integer,
  placements integer,
  faculty_trainings integer,
  faculty_seminars integer,
  faculty_workshops integer,
  faculty_conferences integer,
  student_trainings integer,
  student_seminars integer,
  student_workshops integer,
  student_conferences integer
) on commit drop;

insert into tmp_demo_record_keys values
  ('BLR', 'MIT-BLR', 'SOCE', 'Google', 'AI and Responsible Systems', '2024-01-15', 36, true, 2, 4, 1, 12, 2, 950000, 2, 2200000, 600000, 1, 1, 14, 28, 9, 3, 2, 4, 1, 4, 3, 5, 2),
  ('BLR', 'MIT-BLR', 'ECE', 'Intel', 'VLSI Design and Semiconductor Packaging', '2023-08-10', 24, true, 1, 2, 1, 9, 1, 480000, 1, 1500000, 250000, 1, 1, 10, 18, 6, 2, 1, 3, 1, 3, 2, 4, 1),
  ('BLR', 'MIT-BLR', 'SOCE', 'Microsoft', 'Cloud Platforms and DevOps', '2024-05-20', 30, true, 2, 3, 0, 11, 2, 720000, 1, 900000, 300000, 0, 1, 12, 24, 8, 2, 2, 3, 1, 4, 2, 4, 1),
  ('BLR', 'MIT-BLR', 'SH', 'Siemens', 'Smart Manufacturing Analytics', '2022-11-05', 18, false, 1, 2, 1, 6, 1, 300000, 0, 0, 150000, 0, 0, 7, 10, 3, 1, 1, 2, 1, 2, 1, 2, 0),
  ('BLR', 'TAPMI-BLR', 'MBA', 'Deloitte', 'Business Analytics and ESG', '2024-02-12', 24, true, 1, 4, 0, 10, 2, 640000, 1, 700000, 200000, 0, 0, 9, 16, 7, 2, 2, 2, 1, 3, 3, 2, 1),
  ('BLR', 'DLHS-BLR', 'PH', 'Bosch', 'Digital Health Systems', '2023-04-18', 30, true, 1, 2, 1, 8, 1, 550000, 2, 1800000, 500000, 1, 1, 11, 14, 4, 2, 1, 2, 1, 2, 2, 3, 1),
  ('MPL', 'MIT-MPL', 'CSE', 'Amazon', 'AI Logistics and Automation', '2024-07-03', 36, true, 3, 3, 1, 13, 2, 1100000, 1, 1200000, 400000, 1, 1, 16, 30, 10, 3, 2, 4, 1, 5, 3, 5, 2),
  ('MPL', 'MIT-MPL', 'MECH', 'TCS', 'Connected Manufacturing and IoT', '2023-09-14', 24, true, 1, 2, 0, 7, 1, 420000, 1, 950000, 100000, 0, 1, 8, 12, 4, 1, 1, 2, 1, 2, 1, 3, 1),
  ('BLR', 'MIT-BLR', 'ECE', 'Wipro', 'Cybersecurity for Embedded Networks', '2022-06-21', 24, false, 1, 1, 1, 5, 1, 210000, 0, 0, 0, 0, 0, 6, 8, 2, 1, 1, 1, 0, 1, 1, 2, 0),
  ('MPL', 'MIT-MPL', 'CSE', 'Infosys', 'Data Engineering and FinTech Platforms', '2024-09-09', 24, true, 2, 3, 0, 12, 2, 860000, 2, 2100000, 350000, 1, 1, 15, 26, 11, 2, 2, 3, 1, 4, 3, 5, 1);

create temporary table tmp_demo_consultancy_rows (
  campus_code text,
  institute_code text,
  department_code text,
  industry_name text,
  thrust_area text,
  mou_date date,
  project_title text,
  amount numeric(14, 2)
) on commit drop;

insert into tmp_demo_consultancy_rows values
  ('BLR', 'MIT-BLR', 'SOCE', 'Google', 'AI and Responsible Systems', '2024-01-15', 'AI curriculum acceleration sprint', 450000),
  ('BLR', 'MIT-BLR', 'SOCE', 'Google', 'AI and Responsible Systems', '2024-01-15', 'MLOps deployment readiness audit', 500000),
  ('BLR', 'MIT-BLR', 'ECE', 'Intel', 'VLSI Design and Semiconductor Packaging', '2023-08-10', 'Packaging reliability validation study', 480000),
  ('BLR', 'MIT-BLR', 'SOCE', 'Microsoft', 'Cloud Platforms and DevOps', '2024-05-20', 'Azure migration lab setup', 320000),
  ('BLR', 'MIT-BLR', 'SOCE', 'Microsoft', 'Cloud Platforms and DevOps', '2024-05-20', 'DevSecOps capability benchmarking', 400000),
  ('BLR', 'MIT-BLR', 'SH', 'Siemens', 'Smart Manufacturing Analytics', '2022-11-05', 'Manufacturing KPI analytics pilot', 300000),
  ('BLR', 'TAPMI-BLR', 'MBA', 'Deloitte', 'Business Analytics and ESG', '2024-02-12', 'ESG reporting dashboard blueprint', 290000),
  ('BLR', 'TAPMI-BLR', 'MBA', 'Deloitte', 'Business Analytics and ESG', '2024-02-12', 'Business intelligence capstone mentoring', 350000),
  ('BLR', 'DLHS-BLR', 'PH', 'Bosch', 'Digital Health Systems', '2023-04-18', 'Remote monitoring pilot validation', 550000),
  ('MPL', 'MIT-MPL', 'CSE', 'Amazon', 'AI Logistics and Automation', '2024-07-03', 'Warehouse simulation and optimization', 500000),
  ('MPL', 'MIT-MPL', 'CSE', 'Amazon', 'AI Logistics and Automation', '2024-07-03', 'Computer vision picking workflow study', 600000),
  ('MPL', 'MIT-MPL', 'MECH', 'TCS', 'Connected Manufacturing and IoT', '2023-09-14', 'IIoT dashboard integration review', 420000),
  ('BLR', 'MIT-BLR', 'ECE', 'Wipro', 'Cybersecurity for Embedded Networks', '2022-06-21', 'Firmware security assessment', 210000),
  ('MPL', 'MIT-MPL', 'CSE', 'Infosys', 'Data Engineering and FinTech Platforms', '2024-09-09', 'Data pipeline maturity review', 410000),
  ('MPL', 'MIT-MPL', 'CSE', 'Infosys', 'Data Engineering and FinTech Platforms', '2024-09-09', 'FinTech sandbox integration support', 450000);

create temporary table tmp_demo_grant_rows (
  campus_code text,
  institute_code text,
  department_code text,
  industry_name text,
  thrust_area text,
  mou_date date,
  project_title text,
  funding_agency text,
  amount numeric(14, 2)
) on commit drop;

insert into tmp_demo_grant_rows values
  ('BLR', 'MIT-BLR', 'SOCE', 'Google', 'AI and Responsible Systems', '2024-01-15', 'Responsible AI curriculum research node', 'Google Research India', 1200000),
  ('BLR', 'MIT-BLR', 'SOCE', 'Google', 'AI and Responsible Systems', '2024-01-15', 'Explainable AI for campus operations', 'MeitY', 1000000),
  ('BLR', 'MIT-BLR', 'ECE', 'Intel', 'VLSI Design and Semiconductor Packaging', '2023-08-10', 'Low-power packaging innovation grant', 'Intel University Program', 1500000),
  ('BLR', 'MIT-BLR', 'SOCE', 'Microsoft', 'Cloud Platforms and DevOps', '2024-05-20', 'Cloud-native observability for higher education', 'Microsoft CSR', 900000),
  ('BLR', 'TAPMI-BLR', 'MBA', 'Deloitte', 'Business Analytics and ESG', '2024-02-12', 'ESG analytics for responsible campuses', 'Deloitte Impact Fund', 700000),
  ('BLR', 'DLHS-BLR', 'PH', 'Bosch', 'Digital Health Systems', '2023-04-18', 'Preventive screening analytics platform', 'Bosch Foundation', 900000),
  ('BLR', 'DLHS-BLR', 'PH', 'Bosch', 'Digital Health Systems', '2023-04-18', 'Connected diagnostics triage model', 'DBT', 900000),
  ('MPL', 'MIT-MPL', 'CSE', 'Amazon', 'AI Logistics and Automation', '2024-07-03', 'Autonomous last-mile planning engine', 'Amazon Academic Research Awards', 1200000),
  ('MPL', 'MIT-MPL', 'MECH', 'TCS', 'Connected Manufacturing and IoT', '2023-09-14', 'Predictive maintenance digital twin', 'TCS Research', 950000),
  ('MPL', 'MIT-MPL', 'CSE', 'Infosys', 'Data Engineering and FinTech Platforms', '2024-09-09', 'Scalable data products for digital banking', 'Infosys Foundation', 1100000),
  ('MPL', 'MIT-MPL', 'CSE', 'Infosys', 'Data Engineering and FinTech Platforms', '2024-09-09', 'Secure analytics pipelines for fintech compliance', 'DST', 1000000);

insert into public.universities (name, code)
values ('Manipal Academy of Higher Education', 'MAHE')
on conflict (code) do update set name = excluded.name;

insert into public.campuses (university_id, name, code)
select u.id, x.name, x.code
from public.universities u
cross join (values
  ('Bangalore', 'BLR'),
  ('Manipal', 'MPL')
) as x(name, code)
where u.code = 'MAHE'
on conflict (university_id, code) do update set name = excluded.name;

insert into public.institutes (campus_id, name, code)
select c.id, x.name, x.code
from public.campuses c
join (
  values
    ('BLR', 'Manipal Institute of Technology', 'MIT-BLR'),
    ('BLR', 'T. A. Pai Management Institute', 'TAPMI-BLR'),
    ('BLR', 'Department of Liberal and Health Sciences', 'DLHS-BLR'),
    ('MPL', 'Manipal Institute of Technology', 'MIT-MPL')
) as x(campus_code, name, code)
  on x.campus_code = c.code
on conflict (campus_id, code) do update set name = excluded.name;

insert into public.departments (institute_id, name, code)
select i.id, x.name, x.code
from public.institutes i
join (
  values
    ('MIT-BLR', 'School of Computer Engineering', 'SOCE'),
    ('MIT-BLR', 'Electronics and Communication Engineering', 'ECE'),
    ('MIT-BLR', 'Sciences and Humanities', 'SH'),
    ('TAPMI-BLR', 'MBA', 'MBA'),
    ('DLHS-BLR', 'Public Health', 'PH'),
    ('MIT-MPL', 'Computer Science and Engineering', 'CSE'),
    ('MIT-MPL', 'Mechanical Engineering', 'MECH')
) as x(institute_code, name, code)
  on x.institute_code = i.code
on conflict (institute_id, code) do update set name = excluded.name;

insert into public.industries (name, sector)
values
  ('Google', 'Technology'),
  ('Microsoft', 'Technology'),
  ('Infosys', 'IT Services'),
  ('TCS', 'IT Services'),
  ('Bosch', 'Engineering and Mobility'),
  ('Siemens', 'Industrial Technology'),
  ('Intel', 'Semiconductors'),
  ('Wipro', 'IT Services'),
  ('Deloitte', 'Consulting'),
  ('Amazon', 'Technology and Logistics')
on conflict (name) do update set sector = excluded.sector;

with canonical_scope as (
  select
    u.id as university_id,
    c.id as campus_id,
    i.id as institute_id,
    d.id as department_id
  from public.universities u
  join public.campuses c
    on c.university_id = u.id
   and c.code = 'BLR'
  join public.institutes i
    on i.campus_id = c.id
   and i.code = 'MIT-BLR'
  join public.departments d
    on d.institute_id = i.id
   and d.code = 'SOCE'
  where u.code = 'MAHE'
)
update public.profiles p
set
  university_id = canonical_scope.university_id,
  campus_id = canonical_scope.campus_id,
  institute_id = canonical_scope.institute_id,
  department_id = canonical_scope.department_id
from canonical_scope
where p.email = 'demo@university.edu';

with canonical_scope as (
  select
    u.id as university_id,
    c.id as campus_id,
    i.id as institute_id,
    d.id as department_id
  from public.universities u
  join public.campuses c
    on c.university_id = u.id
   and c.code = 'BLR'
  join public.institutes i
    on i.campus_id = c.id
   and i.code = 'MIT-BLR'
  join public.departments d
    on d.institute_id = i.id
   and d.code = 'SOCE'
  where u.code = 'MAHE'
)
update public.profiles p
set
  university_id = case
    when p.role in ('department_coordinator', 'institute_coordinator', 'campus_coordinator', 'deputy_director')
      and p.university_id is null
      then canonical_scope.university_id
    else p.university_id
  end,
  campus_id = case
    when p.role in ('department_coordinator', 'institute_coordinator', 'campus_coordinator')
      and p.campus_id is null
      then canonical_scope.campus_id
    else p.campus_id
  end,
  institute_id = case
    when p.role in ('department_coordinator', 'institute_coordinator')
      and p.institute_id is null
      then canonical_scope.institute_id
    else p.institute_id
  end,
  department_id = case
    when p.role = 'department_coordinator'
      and p.department_id is null
      then canonical_scope.department_id
    else p.department_id
  end
from canonical_scope
where p.role in ('department_coordinator', 'institute_coordinator', 'campus_coordinator', 'deputy_director');

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
)
insert into public.collaborations (
  university_id,
  campus_id,
  institute_id,
  department_id,
  industry_id,
  industry_name_snapshot,
  thrust_area,
  mou_date,
  duration_months,
  is_active,
  new_courses,
  case_studies,
  partial_delivery,
  academic_activities,
  consultancy_count,
  consultancy_total_amount,
  research_grant_count,
  research_grant_total_amount,
  csr_fund,
  centres_of_excellence,
  innovation_labs,
  student_projects,
  internships,
  placements,
  created_by
)
select
  u.id,
  c.id,
  i.id,
  d.id,
  ind.id,
  r.industry_name,
  r.thrust_area,
  r.mou_date,
  r.duration_months,
  r.is_active,
  r.new_courses,
  r.case_studies,
  r.partial_delivery,
  r.academic_activities,
  r.consultancy_count,
  r.consultancy_total_amount,
  r.research_grant_count,
  r.research_grant_total_amount,
  r.csr_fund,
  r.centres_of_excellence,
  r.innovation_labs,
  r.student_projects,
  r.internships,
  r.placements,
  owner.id
from tmp_demo_record_keys r
join public.campuses c on c.code = r.campus_code
join public.institutes i on i.code = r.institute_code and i.campus_id = c.id
join public.departments d on d.code = r.department_code and d.institute_id = i.id
join public.universities u on u.id = c.university_id
join public.industries ind on ind.name = r.industry_name
cross join seed_owner owner
where not exists (
  select 1
  from public.collaborations existing
  where existing.department_id = d.id
    and existing.industry_id = ind.id
    and existing.thrust_area = r.thrust_area
    and existing.mou_date = r.mou_date
    and existing.created_by = owner.id
);

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
),
seed_collaborations as (
  select c.id
  from public.collaborations c
  join seed_owner owner on owner.id = c.created_by
  join public.campuses campus on campus.id = c.campus_id
  join public.institutes institute on institute.id = c.institute_id
  join public.departments department on department.id = c.department_id
  join tmp_demo_record_keys r
    on r.campus_code = campus.code
   and r.institute_code = institute.code
   and r.department_code = department.code
   and r.industry_name = c.industry_name_snapshot
   and r.thrust_area = c.thrust_area
   and r.mou_date = c.mou_date
)
delete from public.faculty_stats
where collaboration_id in (select id from seed_collaborations);

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
)
insert into public.faculty_stats (collaboration_id, trainings, seminars, workshops, conferences)
select
  c.id,
  r.faculty_trainings,
  r.faculty_seminars,
  r.faculty_workshops,
  r.faculty_conferences
from public.collaborations c
join seed_owner owner on owner.id = c.created_by
join public.campuses campus on campus.id = c.campus_id
join public.institutes institute on institute.id = c.institute_id
join public.departments department on department.id = c.department_id
join tmp_demo_record_keys r
  on r.campus_code = campus.code
 and r.institute_code = institute.code
 and r.department_code = department.code
 and r.industry_name = c.industry_name_snapshot
 and r.thrust_area = c.thrust_area
 and r.mou_date = c.mou_date;

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
),
seed_collaborations as (
  select c.id
  from public.collaborations c
  join seed_owner owner on owner.id = c.created_by
  join public.campuses campus on campus.id = c.campus_id
  join public.institutes institute on institute.id = c.institute_id
  join public.departments department on department.id = c.department_id
  join tmp_demo_record_keys r
    on r.campus_code = campus.code
   and r.institute_code = institute.code
   and r.department_code = department.code
   and r.industry_name = c.industry_name_snapshot
   and r.thrust_area = c.thrust_area
   and r.mou_date = c.mou_date
)
delete from public.student_stats
where collaboration_id in (select id from seed_collaborations);

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
)
insert into public.student_stats (collaboration_id, trainings, seminars, workshops, conferences)
select
  c.id,
  r.student_trainings,
  r.student_seminars,
  r.student_workshops,
  r.student_conferences
from public.collaborations c
join seed_owner owner on owner.id = c.created_by
join public.campuses campus on campus.id = c.campus_id
join public.institutes institute on institute.id = c.institute_id
join public.departments department on department.id = c.department_id
join tmp_demo_record_keys r
  on r.campus_code = campus.code
 and r.institute_code = institute.code
 and r.department_code = department.code
 and r.industry_name = c.industry_name_snapshot
 and r.thrust_area = c.thrust_area
 and r.mou_date = c.mou_date;

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
),
seed_collaborations as (
  select c.id
  from public.collaborations c
  join seed_owner owner on owner.id = c.created_by
  join public.campuses campus on campus.id = c.campus_id
  join public.institutes institute on institute.id = c.institute_id
  join public.departments department on department.id = c.department_id
  join tmp_demo_record_keys r
    on r.campus_code = campus.code
   and r.institute_code = institute.code
   and r.department_code = department.code
   and r.industry_name = c.industry_name_snapshot
   and r.thrust_area = c.thrust_area
   and r.mou_date = c.mou_date
)
delete from public.consultancy_projects
where collaboration_id in (select id from seed_collaborations);

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
)
insert into public.consultancy_projects (collaboration_id, project_title, amount)
select
  c.id,
  rows.project_title,
  rows.amount
from tmp_demo_consultancy_rows rows
join public.campuses campus on campus.code = rows.campus_code
join public.institutes institute on institute.code = rows.institute_code and institute.campus_id = campus.id
join public.departments department on department.code = rows.department_code and department.institute_id = institute.id
join public.collaborations c
  on c.campus_id = campus.id
 and c.institute_id = institute.id
 and c.department_id = department.id
 and c.industry_name_snapshot = rows.industry_name
 and c.thrust_area = rows.thrust_area
 and c.mou_date = rows.mou_date
join seed_owner owner on owner.id = c.created_by;

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
),
seed_collaborations as (
  select c.id
  from public.collaborations c
  join seed_owner owner on owner.id = c.created_by
  join public.campuses campus on campus.id = c.campus_id
  join public.institutes institute on institute.id = c.institute_id
  join public.departments department on department.id = c.department_id
  join tmp_demo_record_keys r
    on r.campus_code = campus.code
   and r.institute_code = institute.code
   and r.department_code = department.code
   and r.industry_name = c.industry_name_snapshot
   and r.thrust_area = c.thrust_area
   and r.mou_date = c.mou_date
)
delete from public.research_grants
where collaboration_id in (select id from seed_collaborations);

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
)
insert into public.research_grants (collaboration_id, project_title, funding_agency, amount)
select
  c.id,
  rows.project_title,
  rows.funding_agency,
  rows.amount
from tmp_demo_grant_rows rows
join public.campuses campus on campus.code = rows.campus_code
join public.institutes institute on institute.code = rows.institute_code and institute.campus_id = campus.id
join public.departments department on department.code = rows.department_code and department.institute_id = institute.id
join public.collaborations c
  on c.campus_id = campus.id
 and c.institute_id = institute.id
 and c.department_id = department.id
 and c.industry_name_snapshot = rows.industry_name
 and c.thrust_area = rows.thrust_area
 and c.mou_date = rows.mou_date
join seed_owner owner on owner.id = c.created_by;

-- Additional demo density for fuller hierarchy views.

insert into public.industries (name, sector)
values
  ('Accenture', 'Consulting and Technology Services'),
  ('Capgemini', 'Consulting and Technology Services'),
  ('IBM', 'Technology and Research'),
  ('Cisco', 'Networking and Security'),
  ('SAP', 'Enterprise Software')
on conflict (name) do update set sector = excluded.sector;

create temporary table tmp_demo_record_keys_extra (
  campus_code text,
  institute_code text,
  department_code text,
  industry_name text,
  thrust_area text,
  mou_date date,
  duration_months integer,
  is_active boolean,
  new_courses integer,
  case_studies integer,
  partial_delivery integer,
  academic_activities integer,
  consultancy_count integer,
  consultancy_total_amount numeric(14, 2),
  research_grant_count integer,
  research_grant_total_amount numeric(14, 2),
  csr_fund numeric(14, 2),
  centres_of_excellence integer,
  innovation_labs integer,
  student_projects integer,
  internships integer,
  placements integer,
  faculty_trainings integer,
  faculty_seminars integer,
  faculty_workshops integer,
  faculty_conferences integer,
  student_trainings integer,
  student_seminars integer,
  student_workshops integer,
  student_conferences integer
) on commit drop;

insert into tmp_demo_record_keys_extra values
  ('BLR', 'MIT-BLR', 'SOCE', 'IBM', 'Applied AI for Enterprise Automation', '2023-03-11', 24, true, 1, 2, 0, 8, 1, 610000, 1, 1300000, 220000, 0, 1, 9, 20, 7, 2, 2, 2, 1, 3, 2, 3, 1),
  ('BLR', 'MIT-BLR', 'ECE', 'Cisco', 'Secure Networks and Edge Systems', '2024-10-07', 30, true, 2, 2, 1, 10, 2, 760000, 1, 1450000, 310000, 1, 1, 12, 19, 8, 2, 2, 3, 1, 4, 3, 4, 1),
  ('BLR', 'MIT-BLR', 'SH', 'Accenture', 'Digital Communication and Design Thinking', '2023-12-09', 18, true, 1, 3, 0, 6, 1, 330000, 0, 0, 120000, 0, 0, 8, 11, 4, 1, 2, 1, 1, 2, 3, 2, 1),
  ('BLR', 'TAPMI-BLR', 'MBA', 'Capgemini', 'Enterprise Transformation and ESG Strategy', '2023-11-17', 24, true, 2, 4, 0, 11, 2, 820000, 1, 960000, 280000, 1, 0, 10, 18, 7, 2, 2, 2, 1, 3, 3, 3, 1),
  ('BLR', 'DLHS-BLR', 'PH', 'SAP', 'Health Informatics and Clinical Data Platforms', '2024-06-25', 30, true, 2, 2, 0, 9, 1, 690000, 1, 1250000, 430000, 1, 1, 12, 16, 6, 2, 1, 2, 1, 2, 2, 3, 1),
  ('MPL', 'MIT-MPL', 'CSE', 'IBM', 'Cybersecurity and Cloud Governance', '2023-05-14', 24, false, 1, 2, 1, 7, 1, 390000, 1, 880000, 140000, 0, 1, 9, 15, 5, 1, 2, 2, 1, 2, 2, 3, 1),
  ('MPL', 'MIT-MPL', 'MECH', 'Bosch', 'Smart Mobility and EV Systems', '2024-08-19', 36, true, 2, 3, 0, 10, 2, 970000, 1, 1500000, 360000, 1, 1, 13, 22, 8, 2, 1, 3, 1, 3, 2, 4, 1),
  ('MPL', 'MIT-MPL', 'CSE', 'Cisco', 'Distributed Networks and Campus IoT', '2022-10-22', 18, false, 1, 1, 1, 5, 1, 250000, 0, 0, 0, 0, 0, 6, 9, 3, 1, 1, 1, 0, 1, 1, 2, 0),
  ('BLR', 'MIT-BLR', 'ECE', 'SAP', 'Embedded Analytics for Industry 4.0', '2024-03-28', 24, true, 1, 2, 0, 8, 1, 520000, 1, 1180000, 240000, 1, 0, 9, 17, 6, 2, 1, 2, 1, 3, 2, 3, 1),
  ('BLR', 'TAPMI-BLR', 'MBA', 'Accenture', 'Digital Business Transformation', '2025-01-10', 24, true, 2, 3, 0, 12, 2, 910000, 1, 1050000, 320000, 0, 1, 11, 21, 9, 2, 2, 3, 1, 3, 4, 3, 1),
  ('BLR', 'DLHS-BLR', 'PH', 'Deloitte', 'Public Health Policy Analytics', '2023-07-08', 24, true, 1, 2, 0, 7, 1, 470000, 1, 980000, 260000, 0, 0, 8, 13, 5, 1, 1, 2, 1, 2, 2, 2, 1),
  ('BLR', 'MIT-BLR', 'SOCE', 'Capgemini', 'Full Stack Platforms and Applied GenAI', '2025-02-14', 30, true, 2, 4, 0, 13, 2, 1040000, 2, 2400000, 410000, 1, 1, 14, 27, 11, 3, 2, 4, 1, 4, 3, 5, 2);

create temporary table tmp_demo_consultancy_rows_extra (
  campus_code text,
  institute_code text,
  department_code text,
  industry_name text,
  thrust_area text,
  mou_date date,
  project_title text,
  amount numeric(14, 2)
) on commit drop;

insert into tmp_demo_consultancy_rows_extra values
  ('BLR', 'MIT-BLR', 'SOCE', 'IBM', 'Applied AI for Enterprise Automation', '2023-03-11', 'AI workflow automation readiness study', 610000),
  ('BLR', 'MIT-BLR', 'ECE', 'Cisco', 'Secure Networks and Edge Systems', '2024-10-07', 'Campus edge security validation', 360000),
  ('BLR', 'MIT-BLR', 'ECE', 'Cisco', 'Secure Networks and Edge Systems', '2024-10-07', 'Industrial network resilience review', 400000),
  ('BLR', 'MIT-BLR', 'SH', 'Accenture', 'Digital Communication and Design Thinking', '2023-12-09', 'Design thinking immersion lab', 330000),
  ('BLR', 'TAPMI-BLR', 'MBA', 'Capgemini', 'Enterprise Transformation and ESG Strategy', '2023-11-17', 'Transformation operating model review', 410000),
  ('BLR', 'TAPMI-BLR', 'MBA', 'Capgemini', 'Enterprise Transformation and ESG Strategy', '2023-11-17', 'ESG analytics capability roadmap', 410000),
  ('BLR', 'DLHS-BLR', 'PH', 'SAP', 'Health Informatics and Clinical Data Platforms', '2024-06-25', 'Clinical data interoperability pilot', 690000),
  ('MPL', 'MIT-MPL', 'CSE', 'IBM', 'Cybersecurity and Cloud Governance', '2023-05-14', 'Cloud governance assessment workshop', 390000),
  ('MPL', 'MIT-MPL', 'MECH', 'Bosch', 'Smart Mobility and EV Systems', '2024-08-19', 'EV systems validation framework', 480000),
  ('MPL', 'MIT-MPL', 'MECH', 'Bosch', 'Smart Mobility and EV Systems', '2024-08-19', 'Mobility testbed integration review', 490000),
  ('MPL', 'MIT-MPL', 'CSE', 'Cisco', 'Distributed Networks and Campus IoT', '2022-10-22', 'Campus IoT traffic audit', 250000),
  ('BLR', 'MIT-BLR', 'ECE', 'SAP', 'Embedded Analytics for Industry 4.0', '2024-03-28', 'Factory analytics instrumentation pilot', 520000),
  ('BLR', 'TAPMI-BLR', 'MBA', 'Accenture', 'Digital Business Transformation', '2025-01-10', 'Digital operating model benchmark', 450000),
  ('BLR', 'TAPMI-BLR', 'MBA', 'Accenture', 'Digital Business Transformation', '2025-01-10', 'Business transformation sprint', 460000),
  ('BLR', 'DLHS-BLR', 'PH', 'Deloitte', 'Public Health Policy Analytics', '2023-07-08', 'Policy dashboard benchmarking', 470000),
  ('BLR', 'MIT-BLR', 'SOCE', 'Capgemini', 'Full Stack Platforms and Applied GenAI', '2025-02-14', 'GenAI accelerator platform review', 540000),
  ('BLR', 'MIT-BLR', 'SOCE', 'Capgemini', 'Full Stack Platforms and Applied GenAI', '2025-02-14', 'Full stack engineering guild program', 500000);

create temporary table tmp_demo_grant_rows_extra (
  campus_code text,
  institute_code text,
  department_code text,
  industry_name text,
  thrust_area text,
  mou_date date,
  project_title text,
  funding_agency text,
  amount numeric(14, 2)
) on commit drop;

insert into tmp_demo_grant_rows_extra values
  ('BLR', 'MIT-BLR', 'SOCE', 'IBM', 'Applied AI for Enterprise Automation', '2023-03-11', 'AI-led enterprise operations research cell', 'IBM Research', 1300000),
  ('BLR', 'MIT-BLR', 'ECE', 'Cisco', 'Secure Networks and Edge Systems', '2024-10-07', 'Secure edge infrastructure for smart labs', 'Cisco CSR', 1450000),
  ('BLR', 'TAPMI-BLR', 'MBA', 'Capgemini', 'Enterprise Transformation and ESG Strategy', '2023-11-17', 'Responsible transformation playbook lab', 'Capgemini Foundation', 960000),
  ('BLR', 'DLHS-BLR', 'PH', 'SAP', 'Health Informatics and Clinical Data Platforms', '2024-06-25', 'Population health data fabric initiative', 'SAP Social Impact', 1250000),
  ('MPL', 'MIT-MPL', 'CSE', 'IBM', 'Cybersecurity and Cloud Governance', '2023-05-14', 'Secure cloud governance framework', 'IBM SkillsBuild', 880000),
  ('MPL', 'MIT-MPL', 'MECH', 'Bosch', 'Smart Mobility and EV Systems', '2024-08-19', 'Smart mobility battery analytics lab', 'Bosch Mobility Solutions', 1500000),
  ('BLR', 'MIT-BLR', 'ECE', 'SAP', 'Embedded Analytics for Industry 4.0', '2024-03-28', 'Embedded analytics reference architecture', 'SAP University Alliances', 1180000),
  ('BLR', 'TAPMI-BLR', 'MBA', 'Accenture', 'Digital Business Transformation', '2025-01-10', 'Digital transformation leadership studio', 'Accenture CSR', 1050000),
  ('BLR', 'DLHS-BLR', 'PH', 'Deloitte', 'Public Health Policy Analytics', '2023-07-08', 'Health policy evidence platform', 'Deloitte Impact Fund', 980000),
  ('BLR', 'MIT-BLR', 'SOCE', 'Capgemini', 'Full Stack Platforms and Applied GenAI', '2025-02-14', 'Applied GenAI engineering sandbox', 'Capgemini Engineering', 1250000),
  ('BLR', 'MIT-BLR', 'SOCE', 'Capgemini', 'Full Stack Platforms and Applied GenAI', '2025-02-14', 'Full stack platform observability center', 'MeitY', 1150000);

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
)
insert into public.collaborations (
  university_id,
  campus_id,
  institute_id,
  department_id,
  industry_id,
  industry_name_snapshot,
  thrust_area,
  mou_date,
  duration_months,
  is_active,
  new_courses,
  case_studies,
  partial_delivery,
  academic_activities,
  consultancy_count,
  consultancy_total_amount,
  research_grant_count,
  research_grant_total_amount,
  csr_fund,
  centres_of_excellence,
  innovation_labs,
  student_projects,
  internships,
  placements,
  created_by
)
select
  u.id,
  c.id,
  i.id,
  d.id,
  ind.id,
  r.industry_name,
  r.thrust_area,
  r.mou_date,
  r.duration_months,
  r.is_active,
  r.new_courses,
  r.case_studies,
  r.partial_delivery,
  r.academic_activities,
  r.consultancy_count,
  r.consultancy_total_amount,
  r.research_grant_count,
  r.research_grant_total_amount,
  r.csr_fund,
  r.centres_of_excellence,
  r.innovation_labs,
  r.student_projects,
  r.internships,
  r.placements,
  owner.id
from tmp_demo_record_keys_extra r
join public.campuses c on c.code = r.campus_code
join public.institutes i on i.code = r.institute_code and i.campus_id = c.id
join public.departments d on d.code = r.department_code and d.institute_id = i.id
join public.universities u on u.id = c.university_id
join public.industries ind on ind.name = r.industry_name
cross join seed_owner owner
where not exists (
  select 1
  from public.collaborations existing
  where existing.department_id = d.id
    and existing.industry_id = ind.id
    and existing.thrust_area = r.thrust_area
    and existing.mou_date = r.mou_date
    and existing.created_by = owner.id
);

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
),
seed_collaborations as (
  select c.id
  from public.collaborations c
  join seed_owner owner on owner.id = c.created_by
  join public.campuses campus on campus.id = c.campus_id
  join public.institutes institute on institute.id = c.institute_id
  join public.departments department on department.id = c.department_id
  join tmp_demo_record_keys_extra r
    on r.campus_code = campus.code
   and r.institute_code = institute.code
   and r.department_code = department.code
   and r.industry_name = c.industry_name_snapshot
   and r.thrust_area = c.thrust_area
   and r.mou_date = c.mou_date
)
delete from public.faculty_stats
where collaboration_id in (select id from seed_collaborations);

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
)
insert into public.faculty_stats (collaboration_id, trainings, seminars, workshops, conferences)
select
  c.id,
  r.faculty_trainings,
  r.faculty_seminars,
  r.faculty_workshops,
  r.faculty_conferences
from public.collaborations c
join seed_owner owner on owner.id = c.created_by
join public.campuses campus on campus.id = c.campus_id
join public.institutes institute on institute.id = c.institute_id
join public.departments department on department.id = c.department_id
join tmp_demo_record_keys_extra r
  on r.campus_code = campus.code
 and r.institute_code = institute.code
 and r.department_code = department.code
 and r.industry_name = c.industry_name_snapshot
 and r.thrust_area = c.thrust_area
 and r.mou_date = c.mou_date;

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
),
seed_collaborations as (
  select c.id
  from public.collaborations c
  join seed_owner owner on owner.id = c.created_by
  join public.campuses campus on campus.id = c.campus_id
  join public.institutes institute on institute.id = c.institute_id
  join public.departments department on department.id = c.department_id
  join tmp_demo_record_keys_extra r
    on r.campus_code = campus.code
   and r.institute_code = institute.code
   and r.department_code = department.code
   and r.industry_name = c.industry_name_snapshot
   and r.thrust_area = c.thrust_area
   and r.mou_date = c.mou_date
)
delete from public.student_stats
where collaboration_id in (select id from seed_collaborations);

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
)
insert into public.student_stats (collaboration_id, trainings, seminars, workshops, conferences)
select
  c.id,
  r.student_trainings,
  r.student_seminars,
  r.student_workshops,
  r.student_conferences
from public.collaborations c
join seed_owner owner on owner.id = c.created_by
join public.campuses campus on campus.id = c.campus_id
join public.institutes institute on institute.id = c.institute_id
join public.departments department on department.id = c.department_id
join tmp_demo_record_keys_extra r
  on r.campus_code = campus.code
 and r.institute_code = institute.code
 and r.department_code = department.code
 and r.industry_name = c.industry_name_snapshot
 and r.thrust_area = c.thrust_area
 and r.mou_date = c.mou_date;

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
),
seed_collaborations as (
  select c.id
  from public.collaborations c
  join seed_owner owner on owner.id = c.created_by
  join public.campuses campus on campus.id = c.campus_id
  join public.institutes institute on institute.id = c.institute_id
  join public.departments department on department.id = c.department_id
  join tmp_demo_record_keys_extra r
    on r.campus_code = campus.code
   and r.institute_code = institute.code
   and r.department_code = department.code
   and r.industry_name = c.industry_name_snapshot
   and r.thrust_area = c.thrust_area
   and r.mou_date = c.mou_date
)
delete from public.consultancy_projects
where collaboration_id in (select id from seed_collaborations);

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
)
insert into public.consultancy_projects (collaboration_id, project_title, amount)
select
  c.id,
  rows.project_title,
  rows.amount
from tmp_demo_consultancy_rows_extra rows
join public.campuses campus on campus.code = rows.campus_code
join public.institutes institute on institute.code = rows.institute_code and institute.campus_id = campus.id
join public.departments department on department.code = rows.department_code and department.institute_id = institute.id
join public.collaborations c
  on c.campus_id = campus.id
 and c.institute_id = institute.id
 and c.department_id = department.id
 and c.industry_name_snapshot = rows.industry_name
 and c.thrust_area = rows.thrust_area
 and c.mou_date = rows.mou_date
join seed_owner owner on owner.id = c.created_by;

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
),
seed_collaborations as (
  select c.id
  from public.collaborations c
  join seed_owner owner on owner.id = c.created_by
  join public.campuses campus on campus.id = c.campus_id
  join public.institutes institute on institute.id = c.institute_id
  join public.departments department on department.id = c.department_id
  join tmp_demo_record_keys_extra r
    on r.campus_code = campus.code
   and r.institute_code = institute.code
   and r.department_code = department.code
   and r.industry_name = c.industry_name_snapshot
   and r.thrust_area = c.thrust_area
   and r.mou_date = c.mou_date
)
delete from public.research_grants
where collaboration_id in (select id from seed_collaborations);

with seed_owner as (
  select id
  from public.profiles
  where email = 'demo@university.edu'
  union all
  select id
  from public.profiles
  where role = 'admin'
    and not exists (select 1 from public.profiles where email = 'demo@university.edu')
  limit 1
)
insert into public.research_grants (collaboration_id, project_title, funding_agency, amount)
select
  c.id,
  rows.project_title,
  rows.funding_agency,
  rows.amount
from tmp_demo_grant_rows_extra rows
join public.campuses campus on campus.code = rows.campus_code
join public.institutes institute on institute.code = rows.institute_code and institute.campus_id = campus.id
join public.departments department on department.code = rows.department_code and department.institute_id = institute.id
join public.collaborations c
  on c.campus_id = campus.id
 and c.institute_id = institute.id
 and c.department_id = department.id
 and c.industry_name_snapshot = rows.industry_name
 and c.thrust_area = rows.thrust_area
 and c.mou_date = rows.mou_date
join seed_owner owner on owner.id = c.created_by;


