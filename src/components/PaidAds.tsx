import React, { useState } from 'react';
import { 
  Megaphone, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  FileText, 
  X,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';
import { Language, translations } from '../translations';
import { Campaign, Client, CampaignPlatform, CampaignStatus } from '../types';

interface PaidAdsProps {
  lang: Language;
  campaigns: Campaign[];
  clients: Client[];
  onAddCampaign: (campaign: Omit<Campaign, 'id'>) => Promise<void>;
  onUpdateCampaign: (campaign: Campaign) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
  currency: string;
}

export default function PaidAds({
  lang,
  campaigns,
  clients,
  onAddCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  currency
}: PaidAdsProps) {
  const t = translations[lang];

  // Platforms and Status mappings
  const platforms: CampaignPlatform[] = ['Facebook', 'Instagram', 'Google Ads', 'TikTok', 'LinkedIn', 'Snapchat'];
  const statuses: CampaignStatus[] = ['Draft', 'Active', 'Paused', 'Completed'];

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Form states
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<CampaignPlatform>('Facebook');
  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);
  const [status, setStatus] = useState<CampaignStatus>('Draft');
  const [roas, setRoas] = useState(0);
  const [ctr, setCtr] = useState(0);
  const [cpc, setCpc] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [conversions, setConversions] = useState(0);
  const [reportNotes, setReportNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const resetForm = () => {
    setClientId('');
    setName('');
    setPlatform('Facebook');
    setBudget(0);
    setSpent(0);
    setStatus('Draft');
    setRoas(0);
    setCtr(0);
    setCpc(0);
    setCpm(0);
    setConversions(0);
    setReportNotes('');
    setStartDate('');
    setEndDate('');
  };

  const handleEditClick = (camp: Campaign) => {
    setEditingCampaign(camp);
    setClientId(camp.client_id);
    setName(camp.name);
    setPlatform(camp.platform);
    setBudget(camp.budget);
    setSpent(camp.spent);
    setStatus(camp.status);
    setRoas(camp.roas || 0);
    setCtr(camp.ctr || 0);
    setCpc(camp.cpc || 0);
    setCpm(camp.cpm || 0);
    setConversions(camp.conversions || 0);
    setReportNotes(camp.report_notes || '');
    setStartDate(camp.start_date || '');
    setEndDate(camp.end_date || '');
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه الحملة الإعلانية؟' : 'Are you sure you want to permanently delete this ad campaign?')) {
      await onDeleteCampaign(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !name) return;

    const payload = {
      client_id: clientId,
      name,
      platform,
      budget: Number(budget),
      spent: Number(spent),
      status,
      roas: Number(roas),
      ctr: Number(ctr),
      cpc: Number(cpc),
      cpm: Number(cpm),
      conversions: Number(conversions),
      report_notes: reportNotes,
      start_date: startDate || undefined,
      end_date: endDate || undefined
    };

    if (editingCampaign) {
      await onUpdateCampaign({ ...payload, id: editingCampaign.id });
    } else {
      await onAddCampaign(payload);
    }

    setShowAddModal(false);
    setEditingCampaign(null);
    resetForm();
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = !platformFilter || c.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  // Calculate high-level performance metrics based on active list
  const totalBudget = filteredCampaigns.reduce((sum, c) => sum + Number(c.budget), 0);
  const totalSpent = filteredCampaigns.reduce((sum, c) => sum + Number(c.spent), 0);
  const totalConversions = filteredCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
  const avgROAS = filteredCampaigns.length 
    ? (filteredCampaigns.reduce((sum, c) => sum + (c.roas || 0), 0) / filteredCampaigns.length).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-600" />
            <span>{t.adsTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            {t.adsSub}
          </p>
        </div>

        {clients.length > 0 && (
          <button
            onClick={() => {
              setEditingCampaign(null);
              resetForm();
              setClientId(clients[0].id); // default to first client
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>{t.adsAddBtn}</span>
          </button>
        )}
      </div>

      {campaigns.length > 0 && (
        <>
          {/* KPI Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4.5 rounded-xl border border-slate-100 dark:border-neutral-850 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                {lang === 'ar' ? 'الميزانية الكلية' : 'Consolidated Budget'}
              </span>
              <h4 className="text-base font-extrabold text-slate-800 dark:text-neutral-100 mt-1 font-mono">
                {totalBudget.toLocaleString()} <span className="text-xs font-semibold text-slate-400">{currency}</span>
              </h4>
            </div>

            <div className="glass-card p-4.5 rounded-xl border border-slate-100 dark:border-neutral-850 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                {lang === 'ar' ? 'إجمالي المنفق' : 'Consolidated Spend'}
              </span>
              <h4 className="text-base font-extrabold text-slate-800 dark:text-neutral-100 mt-1 font-mono">
                {totalSpent.toLocaleString()} <span className="text-xs font-semibold text-slate-400">{currency}</span>
              </h4>
            </div>

            <div className="glass-card p-4.5 rounded-xl border border-slate-100 dark:border-neutral-850 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                {lang === 'ar' ? 'متوسط العائد على الإنفاق ROAS' : 'Average ROAS Return'}
              </span>
              <h4 className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                {avgROAS}x
              </h4>
            </div>

            <div className="glass-card p-4.5 rounded-xl border border-slate-100 dark:border-neutral-850 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                {lang === 'ar' ? 'إجمالي التحويلات المحققة' : 'Total Conversions'}
              </span>
              <h4 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {totalConversions.toLocaleString()}
              </h4>
            </div>
          </div>

          {/* Filtering row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none"
              />
            </div>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs font-medium text-slate-700 dark:text-neutral-300 focus:outline-none"
            >
              <option value="">{lang === 'ar' ? 'جميع المنصات الإعلانية' : 'All Ad Channels'}</option>
              {platforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Main Campaign table / Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-2xl border border-slate-150 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-neutral-100 mb-2">
            {campaigns.length === 0 ? t.emptyStateTitle : (lang === 'ar' ? 'لم يتم العثور على نتائج' : 'No campaigns match your filters')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed mb-6">
            {campaigns.length === 0 
              ? (lang === 'ar' ? 'فيكتوريا للتسويق لا تنشئ حملات تسويقية وهمية. لربط وتتبع ميزانية إعلانية حقيقية، أضف أول عميل ثم أنشئ حملة إعلانية.' : 'Victoria Marketing does not create mock ad reports. To track real corporate budgets and ROAS, please add a client first, then click Create Campaign.')
              : (lang === 'ar' ? 'جرب تغيير كلمة البحث أو تصفية المنصة.' : 'Try adjusting your search query or choosing another channel filter.')}
          </p>

          {clients.length === 0 ? (
            <div className="flex items-center gap-2 justify-center text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 p-3.5 rounded-xl max-w-md mx-auto">
              <span>⚠️ {lang === 'ar' ? 'يجب إضافة عميل واحد على الأقل في تبويب العملاء قبل البدء بإطلاق الحملات.' : 'You must add at least one client in the Clients directory before launching campaigns.'}</span>
            </div>
          ) : (
            campaigns.length === 0 && (
              <button
                onClick={() => {
                  setEditingCampaign(null);
                  resetForm();
                  setClientId(clients[0].id);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.adsAddBtn}</span>
              </button>
            )
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredCampaigns.map((camp) => {
            const clientCompany = clients.find(c => c.id === camp.client_id)?.company || 'Corporate Client';
            const percentSpent = camp.budget > 0 ? (camp.spent / camp.budget) * 100 : 0;
            
            return (
              <div key={camp.id} className="glass-card rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden p-5 space-y-4 flex flex-col justify-between">
                
                {/* Header info */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">
                      {camp.platform}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-neutral-100 mt-2">
                      {camp.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-neutral-500 font-semibold mt-0.5">
                      {lang === 'ar' ? 'العميل: ' : 'Client: '} {clientCompany}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(camp)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-neutral-900 rounded-lg"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(camp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      camp.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                      camp.status === 'Paused' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' :
                      camp.status === 'Completed' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400' :
                      'bg-slate-100 text-slate-800 dark:bg-neutral-850 dark:text-neutral-400'
                    }`}>
                      {t[`campStatus_${camp.status}` as keyof typeof t] || camp.status}
                    </span>
                  </div>
                </div>

                {/* Progress of spend */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-neutral-450">
                    <span>{lang === 'ar' ? 'المبلغ المنفق' : 'Spent Out of Budget'}</span>
                    <span className="font-mono">{camp.spent.toLocaleString()} / {camp.budget.toLocaleString()} {currency}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${percentSpent > 90 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                      style={{ width: `${Math.min(percentSpent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Performance variables metrics */}
                <div className="grid grid-cols-3 gap-2 py-2 bg-slate-50/50 dark:bg-neutral-900/30 rounded-xl border border-slate-100/30 dark:border-neutral-850/40 p-3 text-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                      ROAS
                    </span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">
                      {camp.roas || 0}x
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                      Conversions
                    </span>
                    <span className="text-xs font-black text-slate-700 dark:text-neutral-200 font-mono mt-0.5 block">
                      {camp.conversions || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                      CTR %
                    </span>
                    <span className="text-xs font-black text-slate-700 dark:text-neutral-200 font-mono mt-0.5 block">
                      {camp.ctr || 0}%
                    </span>
                  </div>
                </div>

                {/* Ad unit parameters: CPC and CPM */}
                <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 dark:text-neutral-400">
                  <div className="flex justify-between border-r dark:border-neutral-800 pr-4">
                    <span>CPC:</span>
                    <span className="font-bold text-slate-700 dark:text-neutral-200 font-mono">{camp.cpc || 0} {currency}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>CPM:</span>
                    <span className="font-bold text-slate-700 dark:text-neutral-200 font-mono">{camp.cpm || 0} {currency}</span>
                  </div>
                </div>

                {/* Report note summary */}
                {camp.report_notes && (
                  <div className="pt-3 border-t border-slate-100 dark:border-neutral-900">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                      {t.adsReportNotes}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {camp.report_notes}
                    </p>
                  </div>
                )}

                {/* Schedule timeline */}
                {(camp.start_date || camp.end_date) && (
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-neutral-500 font-semibold font-mono pt-2 border-t border-slate-50 dark:border-neutral-900">
                    <Calendar className="w-3 h-3" />
                    <span>{camp.start_date || 'Start'}</span>
                    <span>-</span>
                    <span>{camp.end_date || 'Ongoing'}</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Campaign Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-neutral-900">
              <h3 className="font-bold text-sm text-slate-800 dark:text-neutral-100">
                {editingCampaign ? (lang === 'ar' ? 'تعديل حملة إعلانية' : 'Edit Ad Campaign') : t.adsAddBtn}
              </h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCampaign(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {lang === 'ar' ? 'العميل المتعاقد' : 'Billed Client'} *
                  </label>
                  <select
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.adsCampName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.adsPlatform}
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as CampaignPlatform)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  >
                    {platforms.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.adsStatus}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>
                        {t[`campStatus_${s}` as keyof typeof t] || s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.adsBudget} ({currency})
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.adsSpent} ({currency})
                  </label>
                  <input
                    type="number"
                    value={spent}
                    onChange={(e) => setSpent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.adsROAS}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={roas}
                    onChange={(e) => setRoas(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.adsConversions}
                  </label>
                  <input
                    type="number"
                    value={conversions}
                    onChange={(e) => setConversions(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.adsCTR} %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={ctr}
                    onChange={(e) => setCtr(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.adsCPC} ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cpc}
                    onChange={(e) => setCpc(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.adsCPM} ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cpm}
                    onChange={(e) => setCpm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.adsStartDate}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.adsEndDate}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {t.adsReportNotes}
                </label>
                <textarea
                  rows={3}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-neutral-900">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCampaign(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300 font-bold rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
