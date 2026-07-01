-- ====================================================================
-- Victoria Marketing Agency ERP & CRM - Complete Production Schema
-- ====================================================================
-- This SQL script establishes all structural tables, data integrity constraints,
-- row-level-security (RLS) policies, and handles seed data for production.
-- Execute this directly in the Supabase SQL Editor.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    logo_url TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    tax_number TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EGP',
    default_language TEXT NOT NULL DEFAULT 'en',
    default_theme TEXT NOT NULL DEFAULT 'light',
    invoice_prefix TEXT NOT NULL DEFAULT 'VMA-',
    invoice_next_number INTEGER NOT NULL DEFAULT 1001,
    vat_percent NUMERIC(5,2) DEFAULT 14.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID, -- Links directly to auth.users in Supabase
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'Owner' | 'Admin' | 'Manager' | 'Media Buyer' | 'Content Creator' | 'Designer' | 'Sales' | 'Account Manager' | 'Viewer'
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    department TEXT NOT NULL,
    profile_photo TEXT,
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active' | 'Suspended'
    salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    date_of_joining DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    website TEXT,
    industry TEXT NOT NULL,
    services TEXT[] DEFAULT '{}',
    notes TEXT DEFAULT '',
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CRM LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New', -- 'New' | 'Contacted' | 'In Progress' | 'Proposal Sent' | 'Won' | 'Lost'
    budget NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    source TEXT NOT NULL,
    notes TEXT DEFAULT '',
    assigned_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. LEAD ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'Call' | 'Email' | 'Meeting' | 'Note' | 'Task'
    content TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    due_date DATE,
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PAID AD CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'Facebook' | 'Instagram' | 'Google Ads' | 'TikTok' | 'LinkedIn' | 'Snapchat'
    budget NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    spent NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Draft', -- 'Draft' | 'Active' | 'Paused' | 'Completed'
    roas NUMERIC(5,2) DEFAULT 0.00,
    ctr NUMERIC(5,2) DEFAULT 0.00,
    cpc NUMERIC(10,2) DEFAULT 0.00,
    cpm NUMERIC(10,2) DEFAULT 0.00,
    conversions INTEGER DEFAULT 0,
    report_notes TEXT DEFAULT '',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SOCIAL CONTENT PLANNER TABLE
CREATE TABLE IF NOT EXISTS content_planner (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    caption TEXT DEFAULT '',
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft', -- 'Draft' | 'Writing' | 'Designing' | 'Review' | 'Scheduled' | 'Published'
    scheduled_date DATE NOT NULL,
    media_url TEXT,
    post_url TEXT,
    copywriter_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    designer_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Not Started', -- 'Not Started' | 'In Progress' | 'Completed' | 'On Hold'
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. COMPANY TASKS TABLE
CREATE TABLE IF NOT EXISTS company_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'Todo', -- 'Todo' | 'In Progress' | 'Review' | 'Done'
    priority TEXT NOT NULL DEFAULT 'Medium', -- 'Low' | 'Medium' | 'High'
    assigned_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. CLIENT MEETINGS TABLE
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'Scheduled', -- 'Scheduled' | 'Completed' | 'Cancelled'
    meeting_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of InvoiceItem
    tax_rate NUMERIC(5,2) DEFAULT 5.00,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL DEFAULT 'Unpaid', -- 'Unpaid' | 'Paid' | 'Partially Paid' | 'Overdue'
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. AUDIT LOGS / NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    message TEXT NOT NULL,
    message_ar TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Meeting' | 'Invoice' | 'CRM' | 'Task' | 'Employee'
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_planner ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create basic 'All authenticated users can do everything' policy 
-- (This acts as the default robust SaaS setup; you can refine permissions by employee roles as needed)

CREATE POLICY "Allow all access to authenticated users" ON company_settings 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to authenticated users" ON employees 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to authenticated users" ON clients 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to authenticated users" ON leads 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to authenticated users" ON lead_activities 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to authenticated users" ON campaigns 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to authenticated users" ON content_planner 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to authenticated users" ON projects 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to authenticated users" ON company_tasks 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to authenticated users" ON meetings 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to authenticated users" ON invoices 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to authenticated users" ON notifications 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ====================================================================
-- SEED DATA INITIALIZATION
-- ====================================================================

-- Seed initial Company Settings
INSERT INTO company_settings (
    id, company_name, email, phone, address, tax_number, currency, default_language, default_theme, invoice_prefix, invoice_next_number, vat_percent
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Victoria Marketing Agency',
    'eslamshyba220@gmail.com',
    '+20 2 2736 1234',
    'Zamalek, Cairo, Egypt',
    'Tax ID: 452-384-700',
    'EGP',
    'en',
    'light',
    'VMA-',
    1001,
    14.00
) ON CONFLICT (id) DO NOTHING;

-- Seed default Owner / Admin (Eslam Shyba)
INSERT INTO employees (
    id, name, role, email, phone, department, status, salary, date_of_joining
) VALUES (
    '99999999-9999-9999-9999-999999999999',
    'Eslam Shyba',
    'Owner',
    'eslamshyba220@gmail.com',
    '+20 100 123 4567',
    'Management',
    'Active',
    45000.00,
    '2026-01-01'
) ON CONFLICT (email) DO NOTHING;
