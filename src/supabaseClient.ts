/**
 * Supabase Client & Unified Data Service
 * Supports direct connection to Supabase OR local stateful fallback
 */

import { createClient } from '@supabase/supabase-js';
import {
  CompanySettings,
  Employee,
  Client,
  Lead,
  LeadActivity,
  Campaign,
  ContentPlannerItem,
  Project,
  CompanyTask,
  Meeting,
  Invoice,
  Notification
} from './types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseUrl.includes('YOUR_') &&
    !supabaseAnonKey.includes('YOUR_');
};

// Initialize Supabase Client if configured
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ====================================================================
// LOCAL STORAGE STATEFUL DATABASE (Fallback Engine)
// Mirroring the exact table schema and relationships from database.sql
// ====================================================================

const LS_KEYS = {
  SETTINGS: 'vma_settings',
  EMPLOYEES: 'vma_employees',
  CLIENTS: 'vma_clients',
  LEADS: 'vma_leads',
  LEAD_ACTIVITIES: 'vma_lead_activities',
  CAMPAIGNS: 'vma_campaigns',
  CONTENT: 'vma_content',
  PROJECTS: 'vma_projects',
  TASKS: 'vma_tasks',
  MEETINGS: 'vma_meetings',
  INVOICES: 'vma_invoices',
  NOTIFICATIONS: 'vma_notifications'
};

const getLS = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
};

const setLS = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Seed initial empty state array where appropriate, but strictly empty states for SaaS entries
const getInitialSettings = (): CompanySettings => ({
  id: '11111111-1111-1111-1111-111111111111',
  company_name: 'Victoria Marketing Agency',
  logo_url: null,
  email: 'eslamshyba220@gmail.com',
  phone: '+20 2 2736 1234',
  address: 'Zamalek, Cairo, Egypt',
  tax_number: 'Tax ID: 452-384-700',
  currency: 'EGP',
  default_language: 'en',
  default_theme: 'light',
  invoice_prefix: 'VMA-',
  invoice_next_number: 1001
});

// Seed exactly the requested administrator Eslam Shyba so they can log in offline
const getInitialEmployees = (): Employee[] => [
  {
    id: '99999999-9999-9999-9999-999999999999',
    name: 'Eslam Shyba',
    email: 'eslamshyba220@gmail.com',
    role: 'Owner',
    phone: '+20 100 123 4567',
    department: 'Management',
    profile_photo: null,
    status: 'Active',
    salary: 45000,
    date_of_joining: '2026-01-01'
  }
];

// Unified Data Service API
export const api = {
  // 1. Settings
  async getSettings(): Promise<CompanySettings> {
    if (supabase) {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();
      if (!error && data) return data as CompanySettings;
    }
    return getLS<CompanySettings>(LS_KEYS.SETTINGS, getInitialSettings());
  },

  async updateSettings(settings: CompanySettings): Promise<CompanySettings> {
    if (supabase) {
      const { data, error } = await supabase
        .from('company_settings')
        .upsert(settings)
        .select()
        .single();
      if (!error && data) return data as CompanySettings;
    }
    setLS(LS_KEYS.SETTINGS, settings);
    return settings;
  },

  // 2. Employees
  async getEmployees(): Promise<Employee[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      if (!error && data) return data as Employee[];
    }
    return getLS<Employee[]>(LS_KEYS.EMPLOYEES, getInitialEmployees());
  },

  async addEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    const newEmp: Employee = {
      ...employee,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase
        .from('employees')
        .insert(newEmp)
        .select()
        .single();
      if (!error && data) return data as Employee;
    }
    const current = await this.getEmployees();
    current.push(newEmp);
    setLS(LS_KEYS.EMPLOYEES, current);
    return newEmp;
  },

  async updateEmployee(employee: Employee): Promise<Employee> {
    if (supabase) {
      const { data, error } = await supabase
        .from('employees')
        .update(employee)
        .eq('id', employee.id)
        .select()
        .single();
      if (!error && data) return data as Employee;
    }
    const current = await this.getEmployees();
    const index = current.findIndex(e => e.id === employee.id);
    if (index !== -1) {
      current[index] = employee;
      setLS(LS_KEYS.EMPLOYEES, current);
    }
    return employee;
  },

  async deleteEmployee(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      if (!error) return true;
    }
    const current = await this.getEmployees();
    const filtered = current.filter(e => e.id !== id);
    setLS(LS_KEYS.EMPLOYEES, filtered);
    return true;
  },

  // 3. Clients
  async getClients(): Promise<Client[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (!error && data) return data as Client[];
    }
    return getLS<Client[]>(LS_KEYS.CLIENTS, []);
  },

  async addClient(client: Omit<Client, 'id'>): Promise<Client> {
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase
        .from('clients')
        .insert(newClient)
        .select()
        .single();
      if (!error && data) return data as Client;
    }
    const current = await this.getClients();
    current.push(newClient);
    setLS(LS_KEYS.CLIENTS, current);
    return newClient;
  },

  async updateClient(client: Client): Promise<Client> {
    if (supabase) {
      const { data, error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', client.id)
        .select()
        .single();
      if (!error && data) return data as Client;
    }
    const current = await this.getClients();
    const index = current.findIndex(c => c.id === client.id);
    if (index !== -1) {
      current[index] = client;
      setLS(LS_KEYS.CLIENTS, current);
    }
    return client;
  },

  async deleteClient(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      if (!error) return true;
    }
    const current = await this.getClients();
    const filtered = current.filter(c => c.id !== id);
    setLS(LS_KEYS.CLIENTS, filtered);
    return true;
  },

  // 4. CRM Leads
  async getLeads(): Promise<Lead[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Lead[];
    }
    return getLS<Lead[]>(LS_KEYS.LEADS, []);
  },

  async addLead(lead: Omit<Lead, 'id'>): Promise<Lead> {
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase
        .from('leads')
        .insert(newLead)
        .select()
        .single();
      if (!error && data) return data as Lead;
    }
    const current = await this.getLeads();
    current.push(newLead);
    setLS(LS_KEYS.LEADS, current);
    return newLead;
  },

  async updateLead(lead: Lead): Promise<Lead> {
    if (supabase) {
      const { data, error } = await supabase
        .from('leads')
        .update(lead)
        .eq('id', lead.id)
        .select()
        .single();
      if (!error && data) return data as Lead;
    }
    const current = await this.getLeads();
    const index = current.findIndex(l => l.id === lead.id);
    if (index !== -1) {
      current[index] = lead;
      setLS(LS_KEYS.LEADS, current);
    }
    return lead;
  },

  async deleteLead(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      if (!error) return true;
    }
    const current = await this.getLeads();
    const filtered = current.filter(l => l.id !== id);
    setLS(LS_KEYS.LEADS, filtered);
    return true;
  },

  // Lead Activities
  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as LeadActivity[];
    }
    const all = getLS<LeadActivity[]>(LS_KEYS.LEAD_ACTIVITIES, []);
    return all.filter(a => a.lead_id === leadId);
  },

  async addLeadActivity(activity: Omit<LeadActivity, 'id'>): Promise<LeadActivity> {
    const newAct: LeadActivity = {
      ...activity,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase
        .from('lead_activities')
        .insert(newAct)
        .select()
        .single();
      if (!error && data) return data as LeadActivity;
    }
    const all = getLS<LeadActivity[]>(LS_KEYS.LEAD_ACTIVITIES, []);
    all.unshift(newAct);
    setLS(LS_KEYS.LEAD_ACTIVITIES, all);
    return newAct;
  },

  async toggleLeadActivity(id: string, done: boolean): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('lead_activities')
        .update({ done })
        .eq('id', id);
      if (!error) return true;
    }
    const all = getLS<LeadActivity[]>(LS_KEYS.LEAD_ACTIVITIES, []);
    const index = all.findIndex(a => a.id === id);
    if (index !== -1) {
      all[index].done = done;
      setLS(LS_KEYS.LEAD_ACTIVITIES, all);
    }
    return true;
  },

  // 5. Campaigns (Paid Ads)
  async getCampaigns(): Promise<Campaign[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Campaign[];
    }
    return getLS<Campaign[]>(LS_KEYS.CAMPAIGNS, []);
  },

  async addCampaign(campaign: Omit<Campaign, 'id'>): Promise<Campaign> {
    const newCamp: Campaign = {
      ...campaign,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase
        .from('campaigns')
        .insert(newCamp)
        .select()
        .single();
      if (!error && data) return data as Campaign;
    }
    const current = await this.getCampaigns();
    current.push(newCamp);
    setLS(LS_KEYS.CAMPAIGNS, current);
    return newCamp;
  },

  async updateCampaign(campaign: Campaign): Promise<Campaign> {
    if (supabase) {
      const { data, error } = await supabase
        .from('campaigns')
        .update(campaign)
        .eq('id', campaign.id)
        .select()
        .single();
      if (!error && data) return data as Campaign;
    }
    const current = await this.getCampaigns();
    const index = current.findIndex(c => c.id === campaign.id);
    if (index !== -1) {
      current[index] = campaign;
      setLS(LS_KEYS.CAMPAIGNS, current);
    }
    return campaign;
  },

  async deleteCampaign(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      if (!error) return true;
    }
    const current = await this.getCampaigns();
    const filtered = current.filter(c => c.id !== id);
    setLS(LS_KEYS.CAMPAIGNS, filtered);
    return true;
  },

  // 6. Content Items
  async getContentItems(): Promise<ContentPlannerItem[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('content_planner')
        .select('*')
        .order('scheduled_date', { ascending: true });
      if (!error && data) return data as ContentPlannerItem[];
    }
    return getLS<ContentPlannerItem[]>(LS_KEYS.CONTENT, []);
  },

  async addContentItem(item: Omit<ContentPlannerItem, 'id'>): Promise<ContentPlannerItem> {
    const newItem: ContentPlannerItem = {
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase
        .from('content_planner')
        .insert(newItem)
        .select()
        .single();
      if (!error && data) return data as ContentPlannerItem;
    }
    const current = await this.getContentItems();
    current.push(newItem);
    setLS(LS_KEYS.CONTENT, current);
    return newItem;
  },

  async updateContentItem(item: ContentPlannerItem): Promise<ContentPlannerItem> {
    if (supabase) {
      const { data, error } = await supabase
        .from('content_planner')
        .update(item)
        .eq('id', item.id)
        .select()
        .single();
      if (!error && data) return data as ContentPlannerItem;
    }
    const current = await this.getContentItems();
    const index = current.findIndex(c => c.id === item.id);
    if (index !== -1) {
      current[index] = item;
      setLS(LS_KEYS.CONTENT, current);
    }
    return item;
  },

  async deleteContentItem(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('content_planner')
        .delete()
        .eq('id', id);
      if (!error) return true;
    }
    const current = await this.getContentItems();
    const filtered = current.filter(c => c.id !== id);
    setLS(LS_KEYS.CONTENT, filtered);
    return true;
  },

  // 7. Projects & Tasks
  async getProjects(): Promise<Project[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Project[];
    }
    return getLS<Project[]>(LS_KEYS.PROJECTS, []);
  },

  async addProject(project: Omit<Project, 'id'>): Promise<Project> {
    const newProj: Project = {
      ...project,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase
        .from('projects')
        .insert(newProj)
        .select()
        .single();
      if (!error && data) return data as Project;
    }
    const current = await this.getProjects();
    current.push(newProj);
    setLS(LS_KEYS.PROJECTS, current);
    return newProj;
  },

  async updateProject(project: Project): Promise<Project> {
    if (supabase) {
      const { data, error } = await supabase
        .from('projects')
        .update(project)
        .eq('id', project.id)
        .select()
        .single();
      if (!error && data) return data as Project;
    }
    const current = await this.getProjects();
    const index = current.findIndex(p => p.id === project.id);
    if (index !== -1) {
      current[index] = project;
      setLS(LS_KEYS.PROJECTS, current);
    }
    return project;
  },

  async deleteProject(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      if (!error) return true;
    }
    const current = await this.getProjects();
    const filtered = current.filter(p => p.id !== id);
    setLS(LS_KEYS.PROJECTS, filtered);
    return true;
  },

  async getCompanyTasks(): Promise<CompanyTask[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('company_tasks')
        .select('*')
        .order('due_date', { ascending: true });
      if (!error && data) return data as CompanyTask[];
    }
    return getLS<CompanyTask[]>(LS_KEYS.TASKS, []);
  },

  async addCompanyTask(task: Omit<CompanyTask, 'id'>): Promise<CompanyTask> {
    const newTask: CompanyTask = {
      ...task,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase
        .from('company_tasks')
        .insert(newTask)
        .select()
        .single();
      if (!error && data) return data as CompanyTask;
    }
    const current = await this.getCompanyTasks();
    current.push(newTask);
    setLS(LS_KEYS.TASKS, current);
    return newTask;
  },

  async updateCompanyTask(task: CompanyTask): Promise<CompanyTask> {
    if (supabase) {
      const { data, error } = await supabase
        .from('company_tasks')
        .update(task)
        .eq('id', task.id)
        .select()
        .single();
      if (!error && data) return data as CompanyTask;
    }
    const current = await this.getCompanyTasks();
    const index = current.findIndex(t => t.id === task.id);
    if (index !== -1) {
      current[index] = task;
      setLS(LS_KEYS.TASKS, current);
    }
    return task;
  },

  async deleteCompanyTask(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('company_tasks')
        .delete()
        .eq('id', id);
      if (!error) return true;
    }
    const current = await this.getCompanyTasks();
    const filtered = current.filter(t => t.id !== id);
    setLS(LS_KEYS.TASKS, filtered);
    return true;
  },

  // 8. Meetings
  async getMeetings(): Promise<Meeting[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('scheduled_at', { ascending: true });
      if (!error && data) return data as Meeting[];
    }
    return getLS<Meeting[]>(LS_KEYS.MEETINGS, []);
  },

  async addMeeting(meeting: Omit<Meeting, 'id'>): Promise<Meeting> {
    const newMeet: Meeting = {
      ...meeting,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase
        .from('meetings')
        .insert(newMeet)
        .select()
        .single();
      if (!error && data) return data as Meeting;
    }
    const current = await this.getMeetings();
    current.push(newMeet);
    setLS(LS_KEYS.MEETINGS, current);
    return newMeet;
  },

  async updateMeeting(meeting: Meeting): Promise<Meeting> {
    if (supabase) {
      const { data, error } = await supabase
        .from('meetings')
        .update(meeting)
        .eq('id', meeting.id)
        .select()
        .single();
      if (!error && data) return data as Meeting;
    }
    const current = await this.getMeetings();
    const index = current.findIndex(m => m.id === meeting.id);
    if (index !== -1) {
      current[index] = meeting;
      setLS(LS_KEYS.MEETINGS, current);
    }
    return meeting;
  },

  async deleteMeeting(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);
      if (!error) return true;
    }
    const current = await this.getMeetings();
    const filtered = current.filter(m => m.id !== id);
    setLS(LS_KEYS.MEETINGS, filtered);
    return true;
  },

  // 9. Invoices
  async getInvoices(): Promise<Invoice[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Invoice[];
    }
    return getLS<Invoice[]>(LS_KEYS.INVOICES, []);
  },

  async addInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    const newInv: Invoice = {
      ...invoice,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase
        .from('invoices')
        .insert(newInv)
        .select()
        .single();
      if (!error && data) return data as Invoice;
    }
    const current = await this.getInvoices();
    current.push(newInv);
    setLS(LS_KEYS.INVOICES, current);
    return newInv;
  },

  async updateInvoice(invoice: Invoice): Promise<Invoice> {
    if (supabase) {
      const { data, error } = await supabase
        .from('invoices')
        .update(invoice)
        .eq('id', invoice.id)
        .select()
        .single();
      if (!error && data) return data as Invoice;
    }
    const current = await this.getInvoices();
    const index = current.findIndex(i => i.id === invoice.id);
    if (index !== -1) {
      current[index] = invoice;
      setLS(LS_KEYS.INVOICES, current);
    }
    return invoice;
  },

  async deleteInvoice(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      if (!error) return true;
    }
    const current = await this.getInvoices();
    const filtered = current.filter(i => i.id !== id);
    setLS(LS_KEYS.INVOICES, filtered);
    return true;
  },

  // 10. Notifications
  async getNotifications(): Promise<Notification[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Notification[];
    }
    return getLS<Notification[]>(LS_KEYS.NOTIFICATIONS, []);
  },

  async addNotification(notif: Omit<Notification, 'id' | 'read' | 'created_at'>): Promise<Notification> {
    const newNotif: Notification = {
      ...notif,
      id: crypto.randomUUID(),
      read: false,
      created_at: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .insert(newNotif)
        .select()
        .single();
      if (!error && data) return data as Notification;
    }
    const current = await this.getNotifications();
    current.unshift(newNotif);
    setLS(LS_KEYS.NOTIFICATIONS, current);
    return newNotif;
  },

  async markNotificationRead(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (!error) return true;
    }
    const current = await this.getNotifications();
    const index = current.findIndex(n => n.id === id);
    if (index !== -1) {
      current[index].read = true;
      setLS(LS_KEYS.NOTIFICATIONS, current);
    }
    return true;
  },

  async markAllNotificationsRead(): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
      if (!error) return true;
    }
    const current = await this.getNotifications();
    const updated = current.map(n => ({ ...n, read: true }));
    setLS(LS_KEYS.NOTIFICATIONS, updated);
    return true;
  }
};
