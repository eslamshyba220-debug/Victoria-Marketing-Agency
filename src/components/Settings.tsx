import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building, 
  DollarSign, 
  Languages, 
  Check, 
  Percent, 
  FileText, 
  Link, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Language, translations } from '../translations';
import { CompanySettings } from '../types';

interface SettingsProps {
  lang: Language;
  settings: CompanySettings;
  onUpdateSettings: (settings: CompanySettings) => Promise<void>;
}

export default function Settings({
  lang,
  settings,
  onUpdateSettings
}: SettingsProps) {
  const t = translations[lang];

  // UI state
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [companyName, setCompanyName] = useState(settings.company_name);
  const [taxNumber, setTaxNumber] = useState(settings.tax_number || '');
  const [currency, setCurrency] = useState(settings.currency || 'EGP');
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoice_prefix || 'VIC-');
  const [vatPercent, setVatPercent] = useState(settings.vat_percent || 14);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onUpdateSettings({
      ...settings,
      company_name: companyName,
      tax_number: taxNumber || null,
      currency,
      invoice_prefix: invoicePrefix,
      vat_percent: Number(vatPercent)
    });

    setSuccessMsg(lang === 'ar' ? 'تم حفظ التعديلات بنجاح!' : 'Corporate profile saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-orange-500" />
          <span>{t.setSettings}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
          {lang === 'ar' ? 'إعدادات الملف التجاري للشركة والخصائص الافتراضية للفواتير والضرائب.' : 'Configure agency identity, tax percentages, and financial default variables.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Core Settings Profile Form */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <h3 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 mb-2 border-b dark:border-neutral-900 pb-3">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{lang === 'ar' ? 'الملف القانوني للشركة' : 'Legal Corporate Identity'}</span>
            </h3>

            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-xl font-bold flex items-center gap-1.5 border border-emerald-100/30">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {lang === 'ar' ? 'الاسم الرسمي للشركة' : 'Official Corporate Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {lang === 'ar' ? 'الرقم الضريبي TRN / Tax Number' : 'VAT / Tax Registration Number'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100234567800003"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                />
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 pt-4 border-b dark:border-neutral-900 pb-3">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span>{lang === 'ar' ? 'التفضيلات المالية والضرائب' : 'Financial & Billing Configurations'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {lang === 'ar' ? 'عملة التداول' : 'Currency Symbol'}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="EGP">EGP ({lang === 'ar' ? 'جنيه مصري' : 'Egyptian Pound'})</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {lang === 'ar' ? 'مسبقة الفاتورة' : 'Billing Code Prefix'}
                </label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {lang === 'ar' ? 'نسبة الضريبة الافتراضية %' : 'VAT Percent %'}
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={vatPercent}
                  onChange={(e) => setVatPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-neutral-900">
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all duration-200"
              >
                {t.save}
              </button>
            </div>
          </form>
        </div>

        {/* Database Audit Information */}
        <div className="glass-card p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 border-b dark:border-neutral-900 pb-3">
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            <span>{lang === 'ar' ? 'تدقيق قواعد البيانات' : 'Relational DB Integrity'}</span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
            {lang === 'ar' 
              ? 'تعتمد منصة فيكتوريا للتسويق على تكامل مباشر مع Supabase. إذا كنت ترغب بتصدير الجداول والعلاقات يدوياً، يمكنك نسخ هيكلية PostgreSQL المرفقة في ملف database.sql بالمستودع.' 
              : 'Victoria Enterprise SaaS utilizes live transactional integrations with PostgreSQL via Supabase client wrappers.'}
          </p>

          <div className="p-3 bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-850 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-550 dark:text-neutral-400">
              <span>Client Sync Wrapper:</span>
              <span className="font-bold text-slate-800 dark:text-neutral-150 font-mono">Supabase-js</span>
            </div>
            <div className="flex justify-between items-center text-slate-550 dark:text-neutral-400">
              <span>Schemas Engine:</span>
              <span className="font-bold text-slate-800 dark:text-neutral-150 font-mono">Drizzle Postgres</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
