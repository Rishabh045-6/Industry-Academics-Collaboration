CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(80) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE universities (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE campuses (
  id BIGSERIAL PRIMARY KEY,
  university_id BIGINT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL,
  code VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (university_id, code)
);

CREATE TABLE institutes (
  id BIGSERIAL PRIMARY KEY,
  campus_id BIGINT NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL,
  code VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campus_id, code)
);

CREATE TABLE departments (
  id BIGSERIAL PRIMARY KEY,
  institute_id BIGINT NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL,
  code VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institute_id, code)
);

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES roles(id),
  university_id BIGINT REFERENCES universities(id),
  campus_id BIGINT REFERENCES campuses(id),
  institute_id BIGINT REFERENCES institutes(id),
  department_id BIGINT REFERENCES departments(id),
  full_name VARCHAR(180) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE industries (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(180) UNIQUE NOT NULL,
  sector VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE collaborations (
  id BIGSERIAL PRIMARY KEY,
  university_id BIGINT NOT NULL REFERENCES universities(id),
  campus_id BIGINT NOT NULL REFERENCES campuses(id),
  institute_id BIGINT NOT NULL REFERENCES institutes(id),
  department_id BIGINT NOT NULL REFERENCES departments(id),
  industry_id BIGINT NOT NULL REFERENCES industries(id),
  industry_name_snapshot VARCHAR(180) NOT NULL,
  thrust_area VARCHAR(180) NOT NULL,
  mou_date DATE NOT NULL,
  duration_months INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  new_courses INTEGER NOT NULL DEFAULT 0,
  case_studies INTEGER NOT NULL DEFAULT 0,
  partial_delivery INTEGER NOT NULL DEFAULT 0,
  academic_activities INTEGER NOT NULL DEFAULT 0,
  consultancy_count INTEGER NOT NULL DEFAULT 0,
  consultancy_total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  research_grant_count INTEGER NOT NULL DEFAULT 0,
  research_grant_total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  csr_fund NUMERIC(14, 2) NOT NULL DEFAULT 0,
  centres_of_excellence INTEGER NOT NULL DEFAULT 0,
  innovation_labs INTEGER NOT NULL DEFAULT 0,
  student_projects INTEGER NOT NULL DEFAULT 0,
  internships INTEGER NOT NULL DEFAULT 0,
  placements INTEGER NOT NULL DEFAULT 0,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE faculty_stats (
  id BIGSERIAL PRIMARY KEY,
  collaboration_id BIGINT NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  trainings INTEGER NOT NULL DEFAULT 0,
  seminars INTEGER NOT NULL DEFAULT 0,
  workshops INTEGER NOT NULL DEFAULT 0,
  conferences INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_stats (
  id BIGSERIAL PRIMARY KEY,
  collaboration_id BIGINT NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  trainings INTEGER NOT NULL DEFAULT 0,
  seminars INTEGER NOT NULL DEFAULT 0,
  workshops INTEGER NOT NULL DEFAULT 0,
  conferences INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE consultancy_projects (
  id BIGSERIAL PRIMARY KEY,
  collaboration_id BIGINT NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  project_title VARCHAR(220) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE research_grants (
  id BIGSERIAL PRIMARY KEY,
  collaboration_id BIGINT NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  project_title VARCHAR(220) NOT NULL,
  funding_agency VARCHAR(220) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_scope ON users (university_id, campus_id, institute_id, department_id);
CREATE INDEX idx_collaborations_scope ON collaborations (university_id, campus_id, institute_id, department_id);
CREATE INDEX idx_collaborations_mou_date ON collaborations (mou_date);
CREATE INDEX idx_collaborations_active ON collaborations (is_active);
