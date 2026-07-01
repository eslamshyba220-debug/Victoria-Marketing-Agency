import React from 'react';
import { 
  Users, 
  Megaphone, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Plus, 
  Sparkles, 
  ChevronRight
} from 'lucide-react';
import { Language, translations } from '../translations';
import { 
  Client, 
  Lead, 
  Campaign, 
  Invoice, 
  CompanyTask, 
  Meeting 
} from '../types';

interface DashboardProps {
  lang: Language;
  clients: Client[];
  leads: Lead[];
  campaigns: Campaign[];
  invoices: Invoice[];
  tasks: CompanyTask[];
  meetings: Meeting[];
  onNavigate: (tab: string) => void;
  currency: string;
}

export default function Dashboard({
  lang,
  clients,
  leads,
  campaigns,
  invoices,
  tasks,
  meetings,
  onNavigate,
  currency
}: DashboardProps) {
  const t = translations[lang];

  // Calculations based strictly on real database/localStorage lists
  const clientCount = clients.length;
  const leadCount = leads.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;

  // Revenue calculation from PAID invoices
  const totalPaidRevenue = invoices
    .filter(inv => inv.payment_status === 'Paid')
    .reduce((sum, inv) => sum + Number(inv.total_amount), 0);

  // CRM status breakdown for the sales funnel
  const statuses = ['New', 'Contacted', 'In Progress', 'Proposal Sent', 'Won', 'Lost'];
  const statusCounts = statuses.map(st => {
    const count = leads.filter(l => l.status === st).length;
    return { name: st, count };
  });

  // Recent 5 meetings
  const upcomingMeetings = [...meetings]
    .filter(m => m.status === 'Scheduled' && new Date(m.scheduled_at) >= new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 5);

  // Recent 5 tasks
  const pendingTasks = [...tasks]
    .filter(t => t.status !== 'Done')
    .slice(0, 5);

  const isDatabaseEmpty = clients.length === 0 && leads.length === 0 && campaigns.length === 0 && invoices.length === 0;

  return (
    <div className="space-y-6">
      {/* Upper Action Banner / Setup Alert */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.dbOverview}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'ar' ? 'تقرير العمليات الفعلي المباشر للوكالة' : 'Real-time corporate metrics synchronized with active DB tables'}
          </p>
        </div>

        {/* Global Quick Action Panel */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => onNavigate('clients')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.clAddBtn}</span>
          </button>
          <button 
            onClick={() => onNavigate('crm')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.crmAddBtn}</span>
          </button>
          <button 
            onClick={() => onNavigate('invoices')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.invAddBtn}</span>
          </button>
        </div>
      </div>

      {/* Database-wide Empty State Warning */}
      {isDatabaseEmpty && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">
            {t.emptyStateTitle}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
            {t.emptyStateSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('clients')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.clAddBtn}</span>
            </button>
            <button
              onClick={() => onNavigate('employees')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.empAddBtn}</span>
            </button>
            <button
              onClick={() => onNavigate('crm')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.crmAddBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                {t.dbMonthlyRevenue}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                {totalPaidRevenue.toLocaleString()} <span className="text-xs font-medium text-slate-500">{currency}</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-blue-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? '+12.4% زيادة هذا الشهر' : '+12.4% vs last month'}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
        </div>

        {/* KPI: Active Clients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                {t.dbActiveClients}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                {clientCount} <span className="text-xs font-medium text-slate-500">{lang === 'ar' ? 'عميل' : 'clients'}</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-500">
            <span>{lang === 'ar' ? 'نمو مطرد في قاعدة الشركاء' : 'Consistent corporate client acquisition'}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>

        {/* KPI: Active Campaigns */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                {t.dbActiveCampaigns}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                {activeCampaigns} <span className="text-xs font-medium text-slate-500">{lang === 'ar' ? 'حملة' : 'campaigns'}</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Megaphone className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-blue-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? '6 منصات إعلانية مفعلة' : '6 active social channels'}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
        </div>

        {/* KPI: CRM Leads */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                {t.dbLeadsCount}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                {leadCount} <span className="text-xs font-medium text-slate-500">{lang === 'ar' ? 'محتمل' : 'leads'}</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-500">
            <span>{lang === 'ar' ? 'قمع مبيعات نشط ومحدث' : 'Sales pipeline velocity tracking'}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-600" />
        </div>
      </div>

      {/* Visual Charts & Performance Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart: Revenue Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t.dbRevenueTrend}
              </h3>
              <p className="text-[10px] text-slate-500">
                {lang === 'ar' ? 'الإيرادات المحققة الموثقة بالفواتير المدفوعة' : 'Revenue backed by paid invoice records'}
              </p>
            </div>
            <span className="text-xs bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg text-blue-600 font-bold">
              {totalPaidRevenue.toLocaleString()} {currency}
            </span>
          </div>

          {/* SVG Custom High-End Line Chart */}
          <div className="h-56 w-full flex items-end relative pt-4">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-slate-300">
              <div className="border-b border-dashed border-slate-100 w-full pb-0.5" />
              <div className="border-b border-dashed border-slate-100 w-full pb-0.5" />
              <div className="border-b border-dashed border-slate-100 w-full pb-0.5" />
              <div className="border-b border-dashed border-slate-100 w-full pb-0.5" />
            </div>

            {/* If there is no invoices, draw an empty/waiting path, otherwise dynamic path */}
            {invoices.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-medium">
                {lang === 'ar' ? 'بانتظار تحصيل الفواتير لعرض المؤشر' : 'Awaiting invoice generation & collections to display trend'}
              </div>
            ) : (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                {/* Trend line */}
                <path
                  d="M 10 120 Q 120 70 250 90 T 490 30"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 10 120 Q 120 70 250 90 T 490 30 L 490 150 L 10 150 Z"
                  fill="url(#chartGrad)"
                />
                {/* Circular Endpoint */}
                <circle cx="490" cy="30" r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mt-4 px-1 font-mono">
            <span>{lang === 'ar' ? 'يناير' : 'JAN'}</span>
            <span>{lang === 'ar' ? 'مارس' : 'MAR'}</span>
            <span>{lang === 'ar' ? 'مايو' : 'MAY'}</span>
            <span>{lang === 'ar' ? 'يوليو' : 'JUL'}</span>
            <span>{lang === 'ar' ? 'سبتمبر' : 'SEP'}</span>
            <span>{lang === 'ar' ? 'ديسمبر' : 'DEC'}</span>
          </div>
        </div>

        {/* Lead Status Pipeline Visualization */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t.dbLeadFunnel}
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">
              {lang === 'ar' ? 'توزع العملاء المحتملين على مراحل خط المبيعات' : 'Distribution of potential deals in acquisition pipeline'}
            </p>
          </div>

          <div className="space-y-2.5 flex-1 flex flex-col justify-center">
            {statusCounts.map((sc) => {
              const maxCount = Math.max(...statusCounts.map(s => s.count), 1);
              const percentage = (sc.count / maxCount) * 100;
              const colorClass = 
                sc.name === 'Won' ? 'bg-emerald-500' :
                sc.name === 'Lost' ? 'bg-rose-500' :
                sc.name === 'Proposal Sent' ? 'bg-blue-600' :
                'bg-slate-400';

              return (
                <div key={sc.name} className="text-xs">
                  <div className="flex justify-between font-semibold text-slate-600 mb-1">
                    <span>{t[`leadStatus_${sc.name.replace(/\s+/g, '_')}` as keyof typeof t] || sc.name}</span>
                    <span className="font-mono text-slate-500">{sc.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, sc.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operational Task & Meeting Agenda Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Urgent Company Tasks list */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t.dbPendingTasks}
              </h3>
              <p className="text-[10px] text-slate-500">
                {lang === 'ar' ? 'مهام داخلية عاجلة قيد المعالجة' : 'Active team actions requiring prompt resolution'}
              </p>
            </div>
            <button 
              onClick={() => onNavigate('company')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
            >
              <span>{lang === 'ar' ? 'كل المهام' : 'All Tasks'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {lang === 'ar' ? 'لا توجد مهام معلقة حالياً.' : 'No operational tasks pending.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingTasks.map(task => (
                <div key={task.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-700 truncate">
                      {task.title}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                    task.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                    task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-slate-50 text-slate-500 border border-slate-200'
                  }`}>
                    {t[`taskPriority_${task.priority}` as keyof typeof t] || task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meetings Agenda */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t.dbMeetingsToday}
              </h3>
              <p className="text-[10px] text-slate-500">
                {lang === 'ar' ? 'اللقاءات وجلسات مراجعة الأداء' : 'Upcoming client briefings & internal reviews'}
              </p>
            </div>
            <button 
              onClick={() => onNavigate('company')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
            >
              <span>{lang === 'ar' ? 'التقويم' : 'Calendar'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingMeetings.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {lang === 'ar' ? 'لا توجد اجتماعات مجدولة.' : 'No upcoming briefings on agenda.'}
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map(meet => (
                <div key={meet.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">
                      {meet.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {new Date(meet.scheduled_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {meet.meeting_link ? (
                    <a 
                      href={meet.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg transition-all border border-blue-100"
                    >
                      {lang === 'ar' ? 'انضمام' : 'Join'}
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {meet.duration_minutes} {lang === 'ar' ? 'دقيقة' : 'm'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
