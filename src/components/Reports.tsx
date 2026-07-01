import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Megaphone, 
  Printer, 
  FileText, 
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import { Language, translations } from '../translations';
import { Invoice, Campaign, Client, Lead, Employee } from '../types';

interface ReportsProps {
  lang: Language;
  invoices: Invoice[];
  campaigns: Campaign[];
  clients: Client[];
  leads: Lead[];
  employees: Employee[];
  currency: string;
}

export default function Reports({
  lang,
  invoices,
  campaigns,
  clients,
  leads,
  employees,
  currency
}: ReportsProps) {
  const t = translations[lang];

  // Calculated high level financials
  const paidInvoices = invoices.filter(i => i.payment_status === 'Paid');
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total_amount, 0);

  const unpaidInvoices = invoices.filter(i => i.payment_status === 'Unpaid' || i.payment_status === 'Overdue');
  const outstandingReceivables = unpaidInvoices.reduce((sum, i) => sum + i.total_amount, 0);

  // Marketing metrics
  const activeCampaignsCount = campaigns.filter(c => c.status === 'Active').length;
  const totalAdSpent = campaigns.reduce((sum, c) => sum + Number(c.spent), 0);
  
  // Average ROAS across all campaigns
  const validRoasCampaigns = campaigns.filter(c => (c.roas || 0) > 0);
  const avgRoas = validRoasCampaigns.length
    ? (validRoasCampaigns.reduce((sum, c) => sum + (c.roas || 0), 0) / validRoasCampaigns.length).toFixed(2)
    : '0.00';

  // Lead Funnel counts
  const totalLeadsCount = leads.length;
  const wonLeadsCount = leads.filter(l => l.status === 'Won').length;
  const conversionRate = totalLeadsCount > 0 
    ? ((wonLeadsCount / totalLeadsCount) * 100).toFixed(1)
    : '0.0';

  // Channel ad split calculations
  const channels = ['Facebook', 'Instagram', 'Google Ads', 'TikTok', 'LinkedIn', 'Snapchat'];
  const channelData = channels.map(chan => {
    const chanCamps = campaigns.filter(c => c.platform === chan);
    const spent = chanCamps.reduce((sum, c) => sum + Number(c.spent), 0);
    const conversions = chanCamps.reduce((sum, c) => sum + (c.conversions || 0), 0);
    return { name: chan, spent, conversions };
  });

  const maxSpent = Math.max(...channelData.map(c => c.spent), 1);

  // Print summary report
  const handlePrintReport = () => {
    window.print();
  };

  const hasData = invoices.length > 0 || campaigns.length > 0 || leads.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            <span>{t.repTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            {t.repSub}
          </p>
        </div>

        {hasData && (
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all duration-200"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تصدير التقرير المالي الشامل' : 'Export Corporate Audit BI'}</span>
          </button>
        )}
      </div>

      {!hasData ? (
        <div className="p-12 text-center bg-zinc-900 rounded-2xl border border-white/5 shadow-sm">
          <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-500/15">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-neutral-100 mb-2">
            {t.emptyStateTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed mb-4">
            {lang === 'ar' 
              ? 'لم يتم تسجيل أي فواتير أو حملات تسويقية حقيقية بعد في النظام لتوليد التقارير والإحصائيات والرسوم البيانية.' 
              : 'Victoria Marketing BI cannot run reports on mock data. Please register real clients, billable invoices, and active media budgets to unlock corporate performance auditing.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6 print:p-0">
          {/* Audit Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-card p-4.5 rounded-xl border border-slate-100 dark:border-neutral-850 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-neutral-900 text-emerald-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                  {lang === 'ar' ? 'صافي الإيرادات الكلية المحصلة' : 'Net Corporate Revenue'}
                </span>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-neutral-100 mt-0.5 font-mono">
                  {totalRevenue.toLocaleString()} <span className="text-[10px] font-semibold text-slate-400">{currency}</span>
                </h4>
              </div>
            </div>

            <div className="glass-card p-4.5 rounded-xl border border-slate-100 dark:border-neutral-850 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 dark:bg-neutral-900 text-amber-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                  {lang === 'ar' ? 'المستحقات المعلقة' : 'Outstanding Balances'}
                </span>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-neutral-100 mt-0.5 font-mono">
                  {outstandingReceivables.toLocaleString()} <span className="text-[10px] font-semibold text-slate-400">{currency}</span>
                </h4>
              </div>
            </div>

            <div className="glass-card p-4.5 rounded-xl border border-slate-100 dark:border-neutral-850 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 dark:bg-zinc-900 text-orange-500 rounded-xl border border-orange-500/15">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                  {lang === 'ar' ? 'العائد التسويقي ROAS' : 'Consolidated ROAS Return'}
                </span>
                <h4 className="text-sm font-extrabold text-orange-500 mt-0.5 font-mono">
                  {avgRoas}x
                </h4>
              </div>
            </div>

            <div className="glass-card p-4.5 rounded-xl border border-slate-100 dark:border-neutral-850 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-purple-50 dark:bg-neutral-900 text-purple-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                  {lang === 'ar' ? 'معدل نجاح الصفقات' : 'Lead Conversion Rate'}
                </span>
                <h4 className="text-sm font-extrabold text-purple-600 mt-0.5 font-mono">
                  {conversionRate}%
                </h4>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Ad Spend & ROI Channel Split Bar Charts */}
            <div className="glass-card p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm lg:col-span-2 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-neutral-100 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-orange-500" />
                <span>{lang === 'ar' ? 'توزيع ميزانيات الحملات والمنصات' : 'Cross-Platform Ad Spend Audit'}</span>
              </h3>

              <div className="space-y-4 pt-2">
                {channelData.map(data => {
                  const pct = (data.spent / maxSpent) * 100;
                  return (
                    <div key={data.name} className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-slate-600 dark:text-neutral-350 font-medium">
                        <span>{data.name}</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-neutral-100">
                          {data.spent.toLocaleString()} {currency} ({data.conversions} conversions)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-neutral-900 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Audit Performance Summary */}
            <div className="glass-card p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-neutral-100 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span>{lang === 'ar' ? 'ملخص الأداء والمؤشرات' : 'Corporate Performance BI Index'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  {lang === 'ar' 
                    ? 'هذا التقرير يستخرج الأرقام الفعلية للحملات المسجلة للتحقق من العائد الاستثماري وحجم الإيرادات الكلية للشركة.' 
                    : 'Victoria analytics pulls real transaction logs and media outputs to evaluate net agency ROI metrics.'}
                </p>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex justify-between border-b dark:border-neutral-850 pb-2">
                    <span className="text-slate-500 font-semibold">{lang === 'ar' ? 'العملاء النشطون' : 'Contracted Clients'}</span>
                    <span className="font-bold text-slate-800 dark:text-neutral-100 font-mono">{clients.length}</span>
                  </div>
                  <div className="flex justify-between border-b dark:border-neutral-850 pb-2">
                    <span className="text-slate-500 font-semibold">{lang === 'ar' ? 'العملاء المحتملون (الشركات)' : 'CRM Sales Leads'}</span>
                    <span className="font-bold text-slate-800 dark:text-neutral-100 font-mono">{leads.length}</span>
                  </div>
                  <div className="flex justify-between border-b dark:border-neutral-850 pb-2">
                    <span className="text-slate-500 font-semibold">{lang === 'ar' ? 'حملات إعلانية فعالة' : 'Active Paid Campaigns'}</span>
                    <span className="font-bold text-slate-800 dark:text-neutral-100 font-mono">{activeCampaignsCount}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-500 font-semibold">{lang === 'ar' ? 'فريق العمل' : 'Agency Consultants'}</span>
                    <span className="font-bold text-slate-800 dark:text-neutral-100 font-mono">{employees.length}</span>
                  </div>
                </div>
              </div>

              {/* Print action bottom card */}
              <button
                onClick={handlePrintReport}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === 'ar' ? 'طباعة تقرير الإدارة المالي' : 'Print Management Audit'}</span>
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
