/**
 * Victoria Marketing Agency ERP & CRM Types
 */

export type UserRole =
  | 'Owner'
  | 'Admin'
  | 'Manager'
  | 'Media Buyer'
  | 'Content Creator'
  | 'Designer'
  | 'Sales'
  | 'Account Manager'
  | 'Viewer';

export type CampaignPlatform =
  | 'Facebook'
  | 'Instagram'
  | 'Google Ads'
  | 'TikTok'
  | 'LinkedIn'
  | 'Snapchat';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'In Progress'
  | 'Proposal Sent'
  | 'Won'
  | 'Lost';

export type CampaignStatus = 'Draft' | 'Active' | 'Paused' | 'Completed';

export type ContentStatus =
  | 'Draft'
  | 'Writing'
  | 'Designing'
  | 'Review'
  | 'Scheduled'
  | 'Published';

export type ProjectStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';

export type TaskStatus = 'Todo' | 'In Progress' | 'Review' | 'Done';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type PaymentStatus = 'Unpaid' | 'Paid' | 'Partially Paid' | 'Overdue';

export interface CompanySettings {
  id: string;
  company_name: string;
  logo_url: string | null;
  email: string;
  phone: string;
  address: string;
  tax_number: string;
  currency: string;
  default_language: string;
  default_theme: string;
  invoice_prefix: string;
  invoice_next_number: number;
  vat_percent?: number | null;
}

export interface Employee {
  id: string;
  auth_user_id?: string | null;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  department: string;
  profile_photo: string | null;
  status: 'Active' | 'Suspended';
  salary: number;
  date_of_joining: string;
  created_at?: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  website: string;
  industry: string;
  services: string[];
  notes: string;
  logo_url: string | null;
  created_at?: string;
}

export interface Lead {
  id: string;
  client_id?: string | null;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  budget: number;
  source: string;
  notes: string;
  assigned_employee_id?: string | null;
  created_at?: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Task';
  content: string;
  done: boolean;
  due_date?: string | null;
  created_by?: string | null;
  created_at?: string;
}

export interface Campaign {
  id: string;
  client_id: string;
  name: string;
  platform: CampaignPlatform;
  budget: number;
  spent: number;
  status: CampaignStatus;
  roas: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  report_notes: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export interface ContentPlannerItem {
  id: string;
  client_id: string;
  title: string;
  caption: string;
  platform: string;
  status: ContentStatus;
  scheduled_date: string;
  media_url: string | null;
  post_url?: string | null;
  copywriter_id?: string | null;
  designer_id?: string | null;
  created_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export interface CompanyTask {
  id: string;
  project_id?: string | null;
  title: string;
  description: string;
  due_date?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_employee_id?: string | null;
  created_at?: string;
}

export interface Meeting {
  id: string;
  client_id?: string | null;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  meeting_link: string;
  created_at?: string;
}

export interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  notes: string;
  created_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  title_ar: string;
  message: string;
  message_ar: string;
  type: 'Meeting' | 'Invoice' | 'CRM' | 'Task' | 'Employee';
  read: boolean;
  created_at: string;
}
