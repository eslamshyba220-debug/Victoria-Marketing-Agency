import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Calendar, 
  ChevronRight, 
  Clock, 
  PlusCircle, 
  CheckCircle, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  User, 
  Activity, 
  Tag, 
  DollarSign, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Language, translations } from '../translations';
import { Lead, LeadActivity, Employee, Client } from '../types';

interface CRMProps {
  lang: Language;
  leads: Lead[];
  employees: Employee[];
  clients: Client[];
  onAddLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  onUpdateLead: (lead: Lead) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  onAddActivity: (activity: Omit<LeadActivity, 'id'>) => Promise<void>;
  onToggleActivity: (id: string, done: boolean) => Promise<void>;
  getActivities: (leadId: string) => Promise<LeadActivity[]>;
  currency: string;
}

export default function CRM({
  lang,
  leads,
  employees,
  clients,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  onAddActivity,
  onToggleActivity,
  getActivities,
  currency
}: CRMProps) {
  const t = translations[lang];

  // Pipeline stages
  const stages: Lead['status'][] = ['New', 'Contacted', 'In Progress', 'Proposal Sent', 'Won', 'Lost'];

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadActivities, setLeadActivities] = useState<LeadActivity[]>([]);

  // Add Lead Form
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState(0);
  const [status, setStatus] = useState<Lead['status']>('New');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
  const [clientId, setClientId] = useState('');

  // Add Activity Form
  const [actType, setActType] = useState<LeadActivity['type']>('Call');
  const [actContent, setActContent] = useState('');
  const [actDueDate, setActDueDate] = useState('');

  // Load activities for selected lead
  const loadActivities = async (lead: Lead) => {
    setSelectedLead(lead);
    const acts = await getActivities(lead.id);
    setLeadActivities(acts);
  };

  const resetForm = () => {
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setBudget(0);
    setStatus('New');
    setSource('');
    setNotes('');
    setAssignedEmployeeId('');
    setClientId('');
  };

  const handleEditClick = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLead(lead);
    setName(lead.name);
    setCompany(lead.company);
    setEmail(lead.email || '');
    setPhone(lead.phone || '');
    setBudget(lead.budget);
    setStatus(lead.status);
    setSource(lead.source || '');
    setNotes(lead.notes || '');
    setAssignedEmployeeId(lead.assigned_employee_id || '');
    setClientId(lead.client_id || '');
    setShowAddModal(true);
  };

  const handleDeleteClick = async (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(lang === 'ar' ? `هل أنت متأكد من حذف العميل المحتمل "${lead.name}"؟` : `Are you sure you want to delete lead "${lead.name}"?`)) {
      if (selectedLead?.id === lead.id) setSelectedLead(null);
      await onDeleteLead(lead.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company) return;

    const payload = {
      name,
      company,
      email,
      phone,
      status,
      budget: Number(budget),
      source,
      notes,
      assigned_employee_id: assignedEmployeeId || null,
      client_id: clientId || null
    };

    if (editingLead) {
      await onUpdateLead({ ...payload, id: editingLead.id });
    } else {
      await onAddLead(payload);
    }

    setShowAddModal(false);
    setEditingLead(null);
    resetForm();
  };

  const handleAddActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !actContent) return;

    await onAddActivity({
      lead_id: selectedLead.id,
      type: actType,
      content: actContent,
      done: false,
      due_date: actDueDate || null,
      created_by: employees[0]?.id || null // assign to Eslam by default
    });

    setActContent('');
    setActDueDate('');
    // reload activities
    loadActivities(selectedLead);
  };

  const handleToggleActivity = async (actId: string, done: boolean) => {
    await onToggleActivity(actId, done);
    if (selectedLead) {
      loadActivities(selectedLead);
    }
  };

  // HTML5 drag and drop handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Lead['status']) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    const leadToUpdate = leads.find(l => l.id === leadId);
    if (leadToUpdate && leadToUpdate.status !== targetStatus) {
      await onUpdateLead({
        ...leadToUpdate,
        status: targetStatus
      });
      // update details if currently open
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...leadToUpdate, status: targetStatus });
      }
    }
  };

  // Filter list
  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.source && l.source.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <span>{t.crmTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            {t.crmSub}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingLead(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>{t.crmAddBtn}</span>
        </button>
      </div>

      {/* CRM Search and Details View Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Lead Board Columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl text-xs focus:outline-none"
            />
          </div>

          {leads.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-2xl border border-slate-150 shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-neutral-100 mb-2">
                {t.emptyStateTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed mb-6">
                {lang === 'ar' ? 'لم يتم العثور على أي عملاء محتملين في قمع المبيعات. انقر أدناه للبدء بإضافة صفقة جديدة حقيقية.' : 'No sales prospects logged in pipeline. Click below to register a real sales lead.'}
              </p>
              <button
                onClick={() => {
                  setEditingLead(null);
                  resetForm();
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.crmAddBtn}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {stages.map(st => {
                const stageLeads = filteredLeads.filter(l => l.status === st);
                return (
                  <div
                    key={st}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, st)}
                    className="p-3 bg-slate-50/50 dark:bg-neutral-900/40 rounded-2xl border border-slate-100 dark:border-neutral-850 flex flex-col min-h-[300px] transition-colors duration-200"
                  >
                    {/* Stage Header */}
                    <div className="flex justify-between items-center mb-3 px-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-neutral-200">
                        {t[`leadStatus_${st.replace(/\s+/g, '_')}` as keyof typeof t] || st}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-200/60 dark:bg-neutral-800 rounded-full text-[10px] font-bold text-slate-600 dark:text-neutral-400">
                        {stageLeads.length}
                      </span>
                    </div>

                    {/* Draggable Cards */}
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px]">
                      {stageLeads.map(lead => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onClick={() => loadActivities(lead)}
                          className={`
                            p-3 bg-white dark:bg-neutral-950 rounded-xl border border-slate-200/65 dark:border-neutral-800/80 shadow-xs cursor-grab active:cursor-grabbing hover:border-indigo-300 dark:hover:border-indigo-500 transition-all text-xs space-y-2
                            ${selectedLead?.id === lead.id ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 border-transparent' : ''}
                          `}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-bold text-slate-800 dark:text-neutral-200 truncate">
                              {lead.name}
                            </h4>
                            <div className="flex gap-1">
                              <button 
                                onClick={(e) => handleEditClick(lead, e)}
                                className="text-slate-400 hover:text-indigo-600 rounded p-0.5"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteClick(lead, e)}
                                className="text-slate-400 hover:text-rose-600 rounded p-0.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
                            {lead.company}
                          </p>

                          {lead.budget > 0 && (
                            <p className="text-indigo-600 dark:text-indigo-400 font-bold font-mono text-[11px] flex items-center gap-0.5">
                              <span>{lead.budget.toLocaleString()}</span>
                              <span>{currency}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lead Profile Detail & Interaction timeline */}
        <div className="glass-card p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm min-h-[450px]">
          {selectedLead ? (
            <div className="space-y-5">
              {/* Profile Card Header */}
              <div className="border-b border-slate-100 dark:border-neutral-900 pb-4">
                <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-2">
                  <Activity className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'متابعة صفقة مبيعات' : 'Prospect Engagement details'}</span>
                </div>
                <h3 className="font-extrabold text-slate-800 dark:text-neutral-100 text-base">
                  {selectedLead.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  {selectedLead.company}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold text-[10px] rounded-md">
                    {t[`leadStatus_${selectedLead.status.replace(/\s+/g, '_')}` as keyof typeof t] || selectedLead.status}
                  </span>
                  {selectedLead.source && (
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 text-[10px] rounded-md font-medium">
                      {selectedLead.source}
                    </span>
                  )}
                </div>
              </div>

              {/* CRM Contact Details */}
              <div className="space-y-3 text-xs">
                {selectedLead.email && (
                  <p className="flex items-center gap-2 text-slate-600 dark:text-neutral-300">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="font-mono">{selectedLead.email}</span>
                  </p>
                )}
                {selectedLead.phone && (
                  <p className="flex items-center gap-2 text-slate-600 dark:text-neutral-300">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-mono">{selectedLead.phone}</span>
                  </p>
                )}
                {selectedLead.budget > 0 && (
                  <p className="flex items-center gap-2 text-slate-600 dark:text-neutral-300 font-bold font-mono text-[11px]">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span>{selectedLead.budget.toLocaleString()} {currency}</span>
                  </p>
                )}
                {selectedLead.notes && (
                  <div className="p-3 bg-slate-50/50 dark:bg-neutral-900/30 rounded-xl border border-slate-100/40 dark:border-neutral-850/40 mt-2">
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-wider block mb-1">
                      {t.notes}
                    </span>
                    <p className="text-slate-600 dark:text-neutral-300 leading-relaxed text-xs">
                      {selectedLead.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Log Activity Form */}
              <div className="pt-4 border-t border-slate-150 dark:border-neutral-900 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 dark:text-neutral-200">
                  {t.crmAddActivity}
                </h4>
                <form onSubmit={handleAddActivitySubmit} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={actType}
                      onChange={(e) => setActType(e.target.value as LeadActivity['type'])}
                      className="px-2 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs"
                    >
                      <option value="Call">📞 {lang === 'ar' ? 'مكالمة هاتفية' : 'Phone Call'}</option>
                      <option value="Email">📧 {lang === 'ar' ? 'بريد إلكتروني' : 'Email'}</option>
                      <option value="Meeting">🤝 {lang === 'ar' ? 'اجتماع عمل' : 'Meeting'}</option>
                      <option value="Note">📝 {lang === 'ar' ? 'ملاحظة خاصة' : 'Internal Note'}</option>
                      <option value="Task">🛠️ {lang === 'ar' ? 'متابعة مهمة' : 'Action Task'}</option>
                    </select>

                    <input
                      type="date"
                      value={actDueDate}
                      onChange={(e) => setActDueDate(e.target.value)}
                      className="px-2 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder={t.crmActivityContent}
                      value={actContent}
                      onChange={(e) => setActContent(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Activity Timeline List */}
              <div className="pt-4 border-t border-slate-150 dark:border-neutral-900 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 dark:text-neutral-200 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{t.crmTimeline}</span>
                </h4>

                {leadActivities.length === 0 ? (
                  <p className="text-[10px] text-slate-400 dark:text-neutral-500 py-2">
                    {lang === 'ar' ? 'لا توجد متابعات مسجلة لهذا العميل.' : 'No interactions logged yet.'}
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {leadActivities.map(act => (
                      <div 
                        key={act.id} 
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all
                          ${act.done 
                            ? 'bg-slate-50/50 dark:bg-neutral-900/10 border-slate-100 dark:border-neutral-900 opacity-60' 
                            : 'bg-indigo-50/20 dark:bg-indigo-950/5 border-indigo-100/30 dark:border-neutral-850'}
                        `}
                      >
                        <button
                          onClick={() => handleToggleActivity(act.id, !act.done)}
                          className={`p-1 rounded-md border flex-shrink-0 mt-0.5 cursor-pointer transition-colors
                            ${act.done 
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400' 
                              : 'bg-white dark:bg-neutral-900 border-slate-300 hover:border-indigo-400 text-transparent'}`}
                        >
                          <Check className="w-3 h-3" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${act.done ? 'line-through text-slate-450 dark:text-neutral-500' : 'text-slate-700 dark:text-neutral-200'}`}>
                            {act.content}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-400 dark:text-neutral-500 font-semibold font-mono">
                            <span className="px-1 py-0.5 bg-slate-100 dark:bg-neutral-800 rounded font-bold uppercase tracking-wider text-[8px]">
                              {act.type}
                            </span>
                            {act.due_date && (
                              <span className="flex items-center gap-0.5 text-indigo-500 dark:text-indigo-400">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(act.due_date).toLocaleDateString()}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-neutral-500">
              <Briefcase className="w-11 h-11 mb-3 stroke-1.5" />
              <p className="text-xs">
                {lang === 'ar' ? 'اختر أي عميل محتمل من اللوحة لعرض تفاصيله وتسجيل الأنشطة والمتابعات.' : 'Select a pipeline prospect from the board to view engagement history and log activities.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add & Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-neutral-900">
              <h3 className="font-bold text-sm text-slate-800 dark:text-neutral-100">
                {editingLead ? (lang === 'ar' ? 'تعديل صفقة مبيعات' : 'Edit CRM Lead') : t.crmAddBtn}
              </h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingLead(null);
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
                    {t.crmLeadName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.crmCompany} *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.crmEmail}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.crmPhone}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.crmBudget} ({currency})
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
                    {t.crmSource}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google Search, Instagram Ads, Referral"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.crmStatus}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Lead['status'])}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  >
                    {stages.map(st => (
                      <option key={st} value={st}>
                        {t[`leadStatus_${st.replace(/\s+/g, '_')}` as keyof typeof t] || st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.crmAssigned}
                  </label>
                  <select
                    value={assignedEmployeeId}
                    onChange={(e) => setAssignedEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  >
                    <option value="">{lang === 'ar' ? 'غير معين' : 'Unassigned'}</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({t[`role_${emp.role.replace(/\s+/g, '_')}` as keyof typeof t] || emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {clients.length > 0 && (
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {lang === 'ar' ? 'ربط بعميل متعاقد' : 'Link with Contracted Client'}
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  >
                    <option value="">{lang === 'ar' ? 'اختر عميلاً...' : 'Select client...'}</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {t.notes}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-neutral-900">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingLead(null);
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
