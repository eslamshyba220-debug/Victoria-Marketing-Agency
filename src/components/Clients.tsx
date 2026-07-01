import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Briefcase, 
  Edit, 
  Trash2, 
  MessageSquare,
  FileText,
  X,
  PlusCircle,
  FolderOpen
} from 'lucide-react';
import { Language, translations } from '../translations';
import { Client } from '../types';

interface ClientsProps {
  lang: Language;
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id'>) => Promise<void>;
  onUpdateClient: (client: Client) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
}

export default function Clients({
  lang,
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient
}: ClientsProps) {
  const t = translations[lang];

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  // Service tag input helper
  const [serviceInput, setServiceInput] = useState('');

  // Reset form
  const resetForm = () => {
    setName('');
    setCompany('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setAddress('');
    setWebsite('');
    setIndustry('');
    setServices([]);
    setNotes('');
    setLogoUrl('');
    setServiceInput('');
  };

  // Open Edit form
  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setCompany(client.company);
    setPhone(client.phone || '');
    setWhatsapp(client.whatsapp || '');
    setEmail(client.email || '');
    setAddress(client.address || '');
    setWebsite(client.website || '');
    setIndustry(client.industry || '');
    setServices(client.services || []);
    setNotes(client.notes || '');
    setLogoUrl(client.logo_url || '');
    setShowAddModal(true);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company) return;

    const payload = {
      name,
      company,
      phone,
      whatsapp,
      email,
      address,
      website,
      industry,
      services,
      notes,
      logo_url: logoUrl || null
    };

    if (editingClient) {
      await onUpdateClient({ ...payload, id: editingClient.id });
    } else {
      await onAddClient(payload);
    }
    
    setShowAddModal(false);
    setEditingClient(null);
    resetForm();
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا العميل نهائياً من قاعدة البيانات؟' : 'Are you sure you want to permanently delete this client from the database?')) {
      await onDeleteClient(id);
    }
  };

  // Filter clients
  const industries = Array.from(new Set(clients.map(c => c.industry).filter(Boolean)));
  
  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.industry && c.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.services && c.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesIndustry = !industryFilter || c.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>{t.clTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            {t.clSub}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingClient(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>{t.clAddBtn}</span>
        </button>
      </div>

      {/* Filters Area */}
      {clients.length > 0 && (
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>
          {industries.length > 0 && (
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs font-medium text-slate-700 dark:text-neutral-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">{lang === 'ar' ? 'كل قطاعات السوق' : 'All Industries'}</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Main Client Grid / Empty State */}
      {filteredClients.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-2xl border border-slate-150 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-neutral-900/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-neutral-100 mb-2">
            {clients.length === 0 ? t.emptyStateTitle : (lang === 'ar' ? 'لم يتم العثور على نتائج' : 'No clients match your filter')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed mb-6">
            {clients.length === 0 
              ? (lang === 'ar' ? 'فيكتوريا للتسويق لا تدرج أي عملاء وهميين. انقر على الزر بالأسفل للبدء بإضافة شريك حقيقي.' : 'Victoria Marketing does not list fake clients. Click the button below to register a real contracting client.')
              : (lang === 'ar' ? 'جرب تعديل مصطلح البحث أو فلتر قطاع الأعمال.' : 'Try adjusting your search terms or resetting the industry filter.')}
          </p>
          {clients.length === 0 && (
            <button
              onClick={() => {
                setEditingClient(null);
                resetForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.clAddBtn}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="glass-card rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
              {/* Card Header */}
              <div className="p-5 pb-4 border-b border-slate-50 dark:border-neutral-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {client.logo_url ? (
                      <img 
                        src={client.logo_url} 
                        alt={client.company}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-xl object-contain bg-slate-50 border border-slate-100"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-sm border border-indigo-100/30 dark:border-neutral-800">
                        {client.company.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-neutral-100 truncate">
                        {client.company}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 truncate mt-0.5 font-medium flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.name}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEditClick(client)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-neutral-900 dark:hover:text-indigo-400 rounded-lg cursor-pointer"
                      title={t.edit}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 rounded-lg cursor-pointer"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Industry Tag */}
                {client.industry && (
                  <span className="inline-block mt-3 px-2 py-0.5 bg-slate-100 dark:bg-neutral-800 text-[10px] text-slate-600 dark:text-neutral-400 font-bold rounded uppercase tracking-wider">
                    {client.industry}
                  </span>
                )}
              </div>

              {/* Card Body Contacts */}
              <div className="p-5 py-4 space-y-3 flex-1">
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-xs text-slate-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </a>
                )}
                {client.phone && (
                  <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-xs text-slate-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </a>
                )}
                {client.whatsapp && (
                  <a href={`https://wa.me/${client.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-slate-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium">
                    <MessageSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">{lang === 'ar' ? 'مراسلة عبر واتساب' : 'Message on WhatsApp'}</span>
                  </a>
                )}
                {client.website && (
                  <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-slate-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                    <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{client.website}</span>
                  </a>
                )}
                {client.address && (
                  <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-neutral-400">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{client.address}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Contracted Services */}
              <div className="p-5 pt-3 bg-slate-50/50 dark:bg-neutral-900/20 border-t border-slate-50 dark:border-neutral-900">
                <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-wider mb-2">
                  {t.clServices}
                </p>
                {client.services && client.services.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {client.services.map((serv, index) => (
                      <span key={index} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-[10px] font-bold rounded-md">
                        {serv}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500">
                    {lang === 'ar' ? 'لا توجد خدمات مضافة حالياً.' : 'No active services logged.'}
                  </span>
                )}

                {client.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-900">
                    <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{t.clNotes}</span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {client.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add & Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-neutral-900">
              <h3 className="font-bold text-sm text-slate-800 dark:text-neutral-100">
                {editingClient ? t.clEditTitle : t.clAddBtn}
              </h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingClient(null);
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
                    {t.clCompany} *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.clName} *
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
                    {t.clEmail}
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
                    {t.clPhone}
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
                    {t.clWhatsapp}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +971501234567"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.clWebsite}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. www.client.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.clIndustry}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Real Estate, F&B, Tech"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.clLogo}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {t.clServices}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={lang === 'ar' ? 'اضغط إضافة...' : 'Add contracted service...'}
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (serviceInput.trim()) {
                          setServices([...services, serviceInput.trim()]);
                          setServiceInput('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (serviceInput.trim()) {
                        setServices([...services, serviceInput.trim()]);
                        setServiceInput('');
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold"
                  >
                    {lang === 'ar' ? 'إضافة' : 'Add'}
                  </button>
                </div>
                {services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {services.map((srv, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold rounded-lg text-[10px]">
                        <span>{srv}</span>
                        <button
                          type="button"
                          onClick={() => setServices(services.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {t.clAddress}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {t.clNotes}
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
                    setEditingClient(null);
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
