import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  Globe, 
  Settings as SettingsIcon,
  CheckCircle,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Info,
  Menu,
  X
} from 'lucide-react';

import { api, isSupabaseConfigured, supabase } from './supabaseClient';
import { translations, Language } from './translations';
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

// Importing components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import CRM from './components/CRM';
import PaidAds from './components/PaidAds';
import ContentPlanner from './components/ContentPlanner';
import CompanyPlanner from './components/CompanyPlanner';
import Employees from './components/Employees';
import Invoices from './components/Invoices';
import Reports from './components/Reports';
import Settings from './components/Settings';
import SupabaseGuide from './components/SupabaseGuide';

export default function App() {
  // Localization & Theme Preferences
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Authenticated State
  const [user, setUser] = useState<{ email: string; role: Employee['role'] } | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // General App & Database State
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contentItems, setContentItems] = useState<ContentPlannerItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<CompanyTask[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Navigation Control
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global Search UI Control
  const [globalSearch, setGlobalSearch] = useState('');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // Notifications Popover Control
  const [showNotifications, setShowNotifications] = useState(false);

  // Initial Boot Loading
  const [appLoading, setAppLoading] = useState(true);

  // Translate wrapper
  const t = translations[lang];

  // Apply Theme class and Lang Direction
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    window.document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Handle Supabase auth state change if configured
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          setUser({
            email: session.user.email || '',
            role: 'Owner' // Default role for testing, gets resolved after settings boot
          });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          setUser({
            email: session.user.email || '',
            role: 'Owner'
          });
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Fetch corporate database states
  const fetchAllData = async () => {
    try {
      setAppLoading(true);
      const [
        settingsData,
        empList,
        clientList,
        leadList,
        campaignList,
        contentList,
        projectList,
        taskList,
        meetingList,
        invoiceList,
        notifList
      ] = await Promise.all([
        api.getSettings(),
        api.getEmployees(),
        api.getClients(),
        api.getLeads(),
        api.getCampaigns(),
        api.getContentItems(),
        api.getProjects(),
        api.getCompanyTasks(),
        api.getMeetings(),
        api.getInvoices(),
        api.getNotifications()
      ]);

      setCompanySettings(settingsData);
      setEmployees(empList);
      setClients(clientList);
      setLeads(leadList);
      setCampaigns(campaignList);
      setContentItems(contentList);
      setProjects(projectList);
      setTasks(taskList);
      setMeetings(meetingList);
      setInvoices(invoiceList);
      setNotifications(notifList);

      // sync regional settings to local state if saved
      if (settingsData) {
        setLang(settingsData.default_language as Language || 'en');
        setTheme(settingsData.default_theme as 'dark' | 'light' || 'dark');
      }

    } catch (err) {
      console.error("Database fetch exception:", err);
    } finally {
      setAppLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      setAppLoading(false);
    }
  }, [user]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const emailInput = authEmail.trim().toLowerCase();
    const passwordInput = authPassword;

    try {
      // 1. Check if Supabase live authentication is configured and active
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailInput,
          password: passwordInput
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.user) {
          setUser({
            email: data.user.email || '',
            role: 'Owner'
          });
          return;
        }
      }

      // 2. Fallback check for the specific requested offline credential
      if (emailInput === 'eslamshyba220@gmail.com' && passwordInput === 'admin123') {
        setUser({
          email: 'eslamshyba220@gmail.com',
          role: 'Owner'
        });
        setAuthError('');
      } else {
        setAuthError(lang === 'ar' ? 'بيانات الاعتماد غير صالحة. يرجى إدخال اسم المستخدم وكلمة المرور الصحيحة.' : 'Invalid credentials. Please use the default administrator credentials.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setAuthEmail('');
    setAuthPassword('');
  };

  // Push notifications log helper
  const addAppNotification = async (title: string, titleAr: string, message: string, messageAr: string, type: Notification['type']) => {
    const payload = { title, title_ar: titleAr, message, message_ar: messageAr, type };
    const newNotif = await api.addNotification(payload);
    setNotifications(prev => [newNotif, ...prev]);
  };

  // CRUD Mutations hooks to sync both API and locally managed states reactive views
  
  // Clients Mutations
  const handleAddClient = async (client: Omit<Client, 'id'>) => {
    const res = await api.addClient(client);
    setClients(prev => [...prev, res]);
    await addAppNotification(
      'New Client Onboarded',
      'تم تسجيل عميل جديد',
      `Client ${client.company} has been registered officially.`,
      `تم تسجيل حساب العميل ${client.company} في النظام.`,
      'CRM'
    );
  };

  const handleUpdateClient = async (client: Client) => {
    const res = await api.updateClient(client);
    setClients(prev => prev.map(c => c.id === client.id ? res : c));
  };

  const handleDeleteClient = async (id: string) => {
    const old = clients.find(c => c.id === id);
    await api.deleteClient(id);
    setClients(prev => prev.filter(c => c.id !== id));
    if (old) {
      await addAppNotification(
        'Client Removed',
        'تم حذف عميل من النظام',
        `Client ${old.company} profile was successfully deleted.`,
        `تم حذف ملف العميل ${old.company} نهائياً.`,
        'CRM'
      );
    }
  };

  // Leads CRM Mutations
  const handleAddLead = async (lead: Omit<Lead, 'id'>) => {
    const res = await api.addLead(lead);
    setLeads(prev => [...prev, res]);
    await addAppNotification(
      'New Lead Logged',
      'صفقة جديدة قيد المتابعة',
      `New sales lead ${lead.name} from ${lead.company} initialized.`,
      `تم تسجيل مهتم جديد من ${lead.company} بقيمة مقدرة.`,
      'CRM'
    );
  };

  const handleUpdateLead = async (lead: Lead) => {
    const res = await api.updateLead(lead);
    setLeads(prev => prev.map(l => l.id === lead.id ? res : l));
  };

  const handleDeleteLead = async (id: string) => {
    await api.deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const handleAddLeadActivity = async (activity: Omit<LeadActivity, 'id'>) => {
    await api.addLeadActivity(activity);
  };

  const handleToggleLeadActivity = async (id: string, done: boolean) => {
    await api.toggleLeadActivity(id, done);
  };

  const handleGetLeadActivities = async (leadId: string) => {
    return api.getLeadActivities(leadId);
  };

  // Paid Ads Media Buying Campaigns Mutations
  const handleAddCampaign = async (campaign: Omit<Campaign, 'id'>) => {
    const res = await api.addCampaign(campaign);
    setCampaigns(prev => [...prev, res]);
    await addAppNotification(
      'Marketing Campaign Launched',
      'حملة تسويقية جديدة',
      `Campaign ${campaign.name} deployed on ${campaign.platform}.`,
      `تم إطلاق الحملة الإعلانية ${campaign.name} على منصة ${campaign.platform}.`,
      'Task'
    );
  };

  const handleUpdateCampaign = async (campaign: Campaign) => {
    const res = await api.updateCampaign(campaign);
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? res : c));
  };

  const handleDeleteCampaign = async (id: string) => {
    await api.deleteCampaign(id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  // Content Planner Mutations
  const handleAddContentItem = async (item: Omit<ContentPlannerItem, 'id'>) => {
    const res = await api.addContentItem(item);
    setContentItems(prev => [...prev, res]);
    await addAppNotification(
      'Social Post Scheduled',
      'تم جدولة منشور اجتماعي',
      `Post "${item.title}" successfully scheduled on calendar.`,
      `تم جدولة منشور "${item.title}" في جدول المحتوى الاجتماعي.`,
      'Task'
    );
  };

  const handleUpdateContentItem = async (item: ContentPlannerItem) => {
    const res = await api.updateContentItem(item);
    setContentItems(prev => prev.map(c => c.id === item.id ? res : c));
  };

  const handleDeleteContentItem = async (id: string) => {
    await api.deleteContentItem(id);
    setContentItems(prev => prev.filter(c => c.id !== id));
  };

  // Projects & Tasks Mutations
  const handleAddProject = async (proj: Omit<Project, 'id'>) => {
    const res = await api.addProject(proj);
    setProjects(prev => [...prev, res]);
  };

  const handleUpdateProject = async (proj: Project) => {
    const res = await api.updateProject(proj);
    setProjects(prev => prev.map(p => p.id === proj.id ? res : p));
  };

  const handleDeleteProject = async (id: string) => {
    await api.deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleAddCompanyTask = async (task: Omit<CompanyTask, 'id'>) => {
    const res = await api.addCompanyTask(task);
    setTasks(prev => [...prev, res]);
    await addAppNotification(
      'Corporate Task Assigned',
      'تم إسناد مهمة جديدة',
      `Task "${task.title}" added to planner.`,
      `تم إضافة مهمة "${task.title}" وإسنادها بنجاح للقسم المختص.`,
      'Task'
    );
  };

  const handleUpdateCompanyTask = async (task: CompanyTask) => {
    const res = await api.updateCompanyTask(task);
    setTasks(prev => prev.map(t => t.id === task.id ? res : t));
  };

  const handleDeleteCompanyTask = async (id: string) => {
    await api.deleteCompanyTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Meetings Mutations
  const handleAddMeeting = async (meet: Omit<Meeting, 'id'>) => {
    const res = await api.addMeeting(meet);
    setMeetings(prev => [...prev, res]);
    await addAppNotification(
      'Corporate Meeting Set',
      'تم جدولة اجتماع مجلس إدارة',
      `Meeting "${meet.title}" set for executive departments.`,
      `تم جدولة اجتماع رسمي بعنوان "${meet.title}" مع العميل المعني.`,
      'Meeting'
    );
  };

  const handleUpdateMeeting = async (meet: Meeting) => {
    const res = await api.updateMeeting(meet);
    setMeetings(prev => prev.map(m => m.id === meet.id ? res : m));
  };

  const handleDeleteMeeting = async (id: string) => {
    await api.deleteMeeting(id);
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  // Employees Onboarding Mutations
  const handleAddEmployee = async (emp: Omit<Employee, 'id'>) => {
    const res = await api.addEmployee(emp);
    setEmployees(prev => [...prev, res]);
    await addAppNotification(
      'Employee Contract Registered',
      'تم تعيين موظف جديد',
      `Team consultant ${emp.name} joined as ${emp.role}.`,
      `تم تسجيل الموظف ${emp.name} في منصة فيكتوريا برتبة ${emp.role}.`,
      'Employee'
    );
  };

  const handleUpdateEmployee = async (emp: Employee) => {
    const res = await api.updateEmployee(emp);
    setEmployees(prev => prev.map(e => e.id === emp.id ? res : e));
  };

  const handleDeleteEmployee = async (id: string) => {
    await api.deleteEmployee(id);
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  // Invoices & Billing Mutations
  const handleAddInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    const res = await api.addInvoice(invoice);
    setInvoices(prev => [...prev, res]);
    await addAppNotification(
      'Invoice Issued',
      'تم إصدار فاتورة ضريبية',
      `Invoice ${invoice.invoice_number} generated successfully.`,
      `تم إنشاء الفاتورة الرسمية رقم ${invoice.invoice_number} بنجاح.`,
      'Invoice'
    );
  };

  const handleUpdateInvoice = async (invoice: Invoice) => {
    const res = await api.updateInvoice(invoice);
    setInvoices(prev => prev.map(i => i.id === invoice.id ? res : i));
  };

  const handleDeleteInvoice = async (id: string) => {
    await api.deleteInvoice(id);
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  // Settings Update
  const handleUpdateSettings = async (settings: CompanySettings) => {
    const res = await api.updateSettings(settings);
    setCompanySettings(res);
    setLang(res.default_language as Language);
    setTheme(res.default_theme as 'dark' | 'light');
  };

  // Global search filtering list results
  const getSearchResults = () => {
    if (!globalSearch.trim()) return [];
    const query = globalSearch.toLowerCase();
    const results: { type: string; title: string; tab: string; item: any }[] = [];

    // search clients
    clients.forEach(c => {
      if (c.name.toLowerCase().includes(query) || c.company.toLowerCase().includes(query)) {
        results.push({ type: 'Client', title: `${c.name} (${c.company})`, tab: 'clients', item: c });
      }
    });

    // search leads
    leads.forEach(l => {
      if (l.name.toLowerCase().includes(query) || l.company.toLowerCase().includes(query)) {
        results.push({ type: 'Sales Lead', title: `${l.name} - ${l.company}`, tab: 'crm', item: l });
      }
    });

    // search campaigns
    campaigns.forEach(camp => {
      if (camp.name.toLowerCase().includes(query) || camp.platform.toLowerCase().includes(query)) {
        results.push({ type: 'Ad Campaign', title: `${camp.name} [${camp.platform}]`, tab: 'paidads', item: camp });
      }
    });

    // search invoices
    invoices.forEach(inv => {
      if (inv.invoice_number.toLowerCase().includes(query)) {
        results.push({ type: 'Invoice', title: `${inv.invoice_number}`, tab: 'invoices', item: inv });
      }
    });

    // search tasks
    tasks.forEach(t => {
      if (t.title.toLowerCase().includes(query)) {
        results.push({ type: 'Task', title: t.title, tab: 'companyplanner', item: t });
      }
    });

    return results;
  };

  const searchResults = getSearchResults();

  // Loading screen
  if (appLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans select-none">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-20 h-20 border-4 border-blue-500/10 border-t-blue-600 rounded-full animate-spin" />
          <Building className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-sm font-bold text-slate-800 tracking-widest uppercase">
          Victoria Marketing
        </h2>
        <p className="text-[10px] text-slate-400 font-mono mt-1">
          Loading Unified ERP / CRM Engine...
        </p>
      </div>
    );
  }

  // Login View if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row font-sans relative overflow-hidden">
        {/* Branding Sidebar column */}
        <div className="flex-1 flex flex-col justify-between p-8 lg:p-12 z-10 bg-white border-b lg:border-b-0 lg:border-r border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xs tracking-wider text-slate-800 uppercase block font-mono">VICTORIA</span>
              <span className="font-semibold text-[9px] tracking-widest text-blue-600 uppercase block -mt-0.5">Marketing Ltd.</span>
            </div>
          </div>

          <div className="space-y-4 my-12 lg:my-auto max-w-md">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 font-mono uppercase tracking-wider">
              Enterprise Suite v2.0
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-slate-900">
              {lang === 'ar' ? 'التحكم الإداري والمالي الفعّال لوكالة فيكتوريا' : 'Unified Executive Business ERP & Client Intelligence System'}
            </h1>
            <p className="text-slate-500 text-xs leading-relaxed">
              {lang === 'ar' 
                ? 'إدارة متكاملة للمبيعات، حسابات العملاء، خطة المحتوى، وإصدار الفواتير الضريبية حسب قوانين وزارة المالية.' 
                : 'Manage contracted client billing, corporate calendars, team payrolls, social planning channels, and live media ROAS streams.'}
            </p>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-4 border-t border-slate-100">
            <span>Dubai, UAE Operations</span>
            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="text-blue-600 hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'English (LTR)' : 'العربية (RTL)'}</span>
            </button>
          </div>
        </div>

        {/* Credentials Form column */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 z-10 bg-slate-50">
          <div className="w-full max-w-sm space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[9px] font-bold uppercase tracking-wider font-mono">
                  Secure SSO
                </span>
              </div>

              <h2 className="text-base font-extrabold mb-1 text-slate-900">
                {lang === 'ar' ? 'تسجيل دخول الإدارة' : 'Agency Control Desk'}
              </h2>
              <p className="text-slate-400 text-xs mb-5">
                {lang === 'ar' ? 'الرجاء إدخال بيانات الاعتماد الخاصة بك للوصول إلى النظام.' : 'Please enter your administrative credentials to access.'}
              </p>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-150 text-red-600 rounded-xl text-xs font-bold mb-4 flex items-start gap-1.5 leading-snug">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    {lang === 'ar' ? 'البريد الإلكتروني للإدارة' : 'Corporate Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. eslamshyba220@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-600 font-semibold">
                      {lang === 'ar' ? 'كلمة المرور المشفرة' : 'Secure Passphrase'}
                    </label>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {authLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{lang === 'ar' ? 'دخول النظام الفوري' : 'Access Dashboard Gateway'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="text-center text-[10px] text-slate-400 font-mono">
              Victoria Agency Portal &copy; 2026. Certified UAE Audit Compliance.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active view router dispatcher
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            lang={lang}
            clients={clients}
            leads={leads}
            campaigns={campaigns}
            invoices={invoices}
            tasks={tasks}
            meetings={meetings}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo(0, 0);
            }}
            currency={companySettings?.currency || 'EGP'}
          />
        );
      case 'clients':
        return (
          <Clients
            lang={lang}
            clients={clients}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        );
      case 'crm':
        return (
          <CRM
            lang={lang}
            leads={leads}
            employees={employees}
            clients={clients}
            onAddLead={handleAddLead}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            onAddActivity={handleAddLeadActivity}
            onToggleActivity={handleToggleLeadActivity}
            getActivities={handleGetLeadActivities}
            currency={companySettings?.currency || 'EGP'}
          />
        );
      case 'paidads':
        return (
          <PaidAds
            lang={lang}
            campaigns={campaigns}
            clients={clients}
            onAddCampaign={handleAddCampaign}
            onUpdateCampaign={handleUpdateCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            currency={companySettings?.currency || 'EGP'}
          />
        );
      case 'contentplanner':
        return (
          <ContentPlanner
            lang={lang}
            contentItems={contentItems}
            clients={clients}
            employees={employees}
            onAddContentItem={handleAddContentItem}
            onUpdateContentItem={handleUpdateContentItem}
            onDeleteContentItem={handleDeleteContentItem}
          />
        );
      case 'companyplanner':
        return (
          <CompanyPlanner
            lang={lang}
            projects={projects}
            tasks={tasks}
            meetings={meetings}
            employees={employees}
            clients={clients}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onAddCompanyTask={handleAddCompanyTask}
            onUpdateCompanyTask={handleUpdateCompanyTask}
            onDeleteCompanyTask={handleDeleteCompanyTask}
            onAddMeeting={handleAddMeeting}
            onUpdateMeeting={handleUpdateMeeting}
            onDeleteMeeting={handleDeleteMeeting}
          />
        );
      case 'employees':
        return (
          <Employees
            lang={lang}
            employees={employees}
            currentRole={user?.role || 'Owner'}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            currency={companySettings?.currency || 'EGP'}
          />
        );
      case 'invoices':
        return (
          <Invoices
            lang={lang}
            invoices={invoices}
            clients={clients}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoice={handleUpdateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            currency={companySettings?.currency || 'EGP'}
            taxNumber={companySettings?.tax_number || 'TRN-100239450388432'}
          />
        );
      case 'reports':
        return (
          <Reports
            lang={lang}
            invoices={invoices}
            campaigns={campaigns}
            clients={clients}
            leads={leads}
            employees={employees}
            currency={companySettings?.currency || 'EGP'}
          />
        );
      case 'settings':
        return (
          <Settings
            lang={lang}
            settings={companySettings || {
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
              invoice_prefix: 'VIC-',
              invoice_next_number: 1001
            }}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      case 'supabase':
        return (
          <SupabaseGuide lang={lang} />
        );
      default:
        return <div className="text-xs text-slate-500">View not found</div>;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex transition-colors duration-200 font-sans print:bg-white print:text-black">
      
      {/* 1. Main Navigation Sidebar Component */}
      <div className="hidden lg:block">
        <Sidebar
          lang={lang}
          setLang={setLang}
          currentTab={activeTab}
          setCurrentTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo(0, 0);
          }}
          darkMode={false}
          setDarkMode={() => {}}
          currentRole={user?.role || 'Owner'}
          setCurrentRole={() => {}}
          onLogout={handleLogout}
          sidebarOpen={mobileSidebarOpen}
          setSidebarOpen={setMobileSidebarOpen}
          companyName={companySettings?.company_name || 'Victoria Marketing'}
        />
      </div>

      {/* Mobile Drawer Sidebar wrapper */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-64 max-w-xs h-full bg-white border-r border-slate-200 flex flex-col z-10 p-5">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span className="font-extrabold text-xs tracking-wider uppercase text-slate-800 font-mono">Victoria</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <Sidebar
              lang={lang}
              setLang={setLang}
              currentTab={activeTab}
              setCurrentTab={(tab) => {
                setActiveTab(tab);
                setMobileSidebarOpen(false);
                window.scrollTo(0, 0);
              }}
              darkMode={false}
              setDarkMode={() => {}}
              currentRole={user?.role || 'Owner'}
              setCurrentRole={() => {}}
              onLogout={handleLogout}
              sidebarOpen={mobileSidebarOpen}
              setSidebarOpen={setMobileSidebarOpen}
              companyName={companySettings?.company_name || 'Victoria Marketing'}
            />
          </div>
        </div>
      )}

      {/* 2. Primary Executive Container */}
      <div className="flex-1 flex flex-col min-w-0 print:p-0">
        
        {/* Top Consolidated Executive Header Panel */}
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-[#0c0c0e]/80 backdrop-blur-md border-b border-slate-150 dark:border-white/5 py-3 px-4 lg:px-6 flex items-center justify-between gap-4 print:hidden">
          
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick module indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400">
              <span>{companySettings?.company_name || 'Victoria Marketing'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-350" />
              <span className="text-slate-850 dark:text-neutral-200 capitalize font-bold">
                {t[`nav_${activeTab}` as keyof typeof t] || activeTab}
              </span>
            </div>
          </div>

          {/* Core Controls Row */}
          <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
            
            {/* Unified Search Console */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'بحث شامل في النظام...' : 'Smart ERP query...'}
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setShowSearchOverlay(true);
                }}
                onFocus={() => setShowSearchOverlay(true)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-colors placeholder:text-slate-400 font-medium"
              />

              {/* Instant Search Overlay */}
              {showSearchOverlay && globalSearch.trim().length > 0 && (
                <div className="absolute top-11 left-0 right-0 bg-white border border-slate-150 rounded-xl shadow-xl p-2 max-h-64 overflow-y-auto text-xs z-40">
                  <div className="flex justify-between items-center px-2 py-1 border-b text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                    <span>{lang === 'ar' ? 'نتائج المطابقة' : 'Indexed Matches'}</span>
                    <button 
                      onClick={() => {
                        setShowSearchOverlay(false);
                        setGlobalSearch('');
                      }} 
                      className="hover:text-rose-500 font-extrabold uppercase"
                    >
                      {lang === 'ar' ? 'إغلاق' : 'Clear'}
                    </button>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 font-medium italic">
                      {lang === 'ar' ? 'لا توجد نتائج مطابقة' : 'No corporate records match this query'}
                    </div>
                  ) : (
                    searchResults.map((res, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setActiveTab(res.tab);
                          setGlobalSearch('');
                          setShowSearchOverlay(false);
                        }}
                        className="w-full text-left p-2 hover:bg-slate-50 rounded-lg flex justify-between items-center gap-2 cursor-pointer transition-colors"
                      >
                        <div className="truncate">
                          <span className="font-bold text-slate-800 block truncate">{res.title}</span>
                          <span className="text-[9px] text-blue-600 font-extrabold uppercase font-mono block mt-0.5">{res.type}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              title={lang === 'ar' ? 'Switch to English' : 'تحويل للغة العربية'}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* Notification bell popover toggler */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    api.markAllNotificationsRead().then(() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    });
                  }
                }}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Real-time audit logs dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-150 rounded-2xl shadow-xl overflow-hidden z-40 text-xs">
                  <div className="p-3 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-blue-600" />
                      <span>{lang === 'ar' ? 'سجل التدقيق الحي' : 'Real-time Audit Logs'}</span>
                    </span>
                    <button 
                      onClick={() => {
                        api.markAllNotificationsRead();
                        setNotifications([]);
                        setShowNotifications(false);
                      }}
                      className="text-[10px] text-rose-500 font-extrabold hover:underline"
                    >
                      {lang === 'ar' ? 'مسح الكل' : 'Clear Logs'}
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-neutral-900">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 font-semibold italic">
                        {lang === 'ar' ? 'سجل التنبيهات فارغ تماماً' : 'Database event log empty'}
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-3 hover:bg-slate-50/50 dark:hover:bg-neutral-950/40 transition-colors">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-slate-800 dark:text-neutral-200">
                              {lang === 'ar' ? notif.title_ar : notif.title}
                            </span>
                            <span className="text-[8px] text-slate-400 font-mono">
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-neutral-450 mt-1 leading-normal">
                            {lang === 'ar' ? notif.message_ar : notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Logout session"
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>
        </header>

        {/* 3. Main Route Render Canvas Panel */}
        <main className="flex-1 p-4 lg:p-6 print:p-0">
          {renderTabContent()}
        </main>
      </div>

    </div>
  );
}
