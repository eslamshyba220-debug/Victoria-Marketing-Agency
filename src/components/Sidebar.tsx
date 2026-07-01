import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Megaphone, 
  CalendarRange, 
  CalendarDays, 
  UserSquare2, 
  FileText, 
  TrendingUp, 
  Settings, 
  Languages, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck,
  User
} from 'lucide-react';
import { Language, translations } from '../translations';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  companyName: string;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  currentRole,
  setCurrentRole,
  onLogout,
  sidebarOpen,
  setSidebarOpen,
  companyName
}: SidebarProps) {
  const t = translations[lang];

  const menuItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'clients', label: t.navClients, icon: Users },
    { id: 'crm', label: t.navCRM, icon: Briefcase },
    { id: 'paidads', label: t.navPaidAds, icon: Megaphone },
    { id: 'contentplanner', label: t.navContent, icon: CalendarRange },
    { id: 'companyplanner', label: t.navCompany, icon: CalendarDays },
    { id: 'employees', label: t.navEmployees, icon: UserSquare2 },
    { id: 'invoices', label: t.navInvoices, icon: FileText },
    { id: 'reports', label: t.navReports, icon: TrendingUp },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  const roles: UserRole[] = [
    'Owner',
    'Admin',
    'Manager',
    'Media Buyer',
    'Content Creator',
    'Designer',
    'Sales',
    'Account Manager',
    'Viewer'
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-40 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm tracking-tighter">
            V
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900">
            {companyName}
          </span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 ${lang === 'ar' ? 'right-0' : 'left-0'} z-50 
        w-64 lg:w-72 p-5 bg-white border-r border-slate-200
        transform ${sidebarOpen ? 'translate-x-0' : lang === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-transform duration-300 ease-in-out lg:static lg:flex lg:flex-col lg:h-screen
        shadow-md lg:shadow-none
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-150">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              V
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-slate-900 tracking-tight">
                {companyName}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium font-mono uppercase tracking-widest mt-0.5">
                {t.erpCrm}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 group border
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 border-blue-100/50 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'}
                `}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110 text-blue-600' : 'group-hover:scale-110 text-slate-400 group-hover:text-slate-600'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Role & Permissions Configuration (SaaS Simulation Engine) */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-150">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'صلاحيات ومحاكاة الدور' : 'Active Role Impersonation'}</span>
          </div>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {t[`role_${r.replace(/\s+/g, '_')}` as keyof typeof t] || r}
              </option>
            ))}
          </select>
        </div>

        {/* User Info & Actions Section */}
        <div className="mt-4 pt-4 border-t border-slate-150 space-y-3">
          {/* User Row */}
          <div className="flex items-center gap-3 px-1.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-850 truncate">
                {lang === 'ar' ? 'إسلام شيبا' : 'Eslam Shyba'}
              </h4>
              <p className="text-[10px] text-slate-500 truncate">
                eslamshyba220@gmail.com
              </p>
            </div>
          </div>

          {/* Language Switcher Button */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-xs"
          >
            <Languages className="w-4 h-4 text-slate-500" />
            <span>{lang === 'en' ? 'العربية (RTL)' : 'English (LTR)'}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100/80 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs z-40 lg:hidden"
        />
      )}
    </>
  );
}
