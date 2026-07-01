import React, { useState } from 'react';
import { Database, ShieldCheck, Key, HelpCircle, Check, Copy, AlertCircle, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '../supabaseClient';
import { Language, translations } from '../translations';

interface SupabaseGuideProps {
  lang: Language;
}

export default function SupabaseGuide({ lang }: SupabaseGuideProps) {
  const t = translations[lang];
  const isConfigured = isSupabaseConfigured();
  const [copied, setCopied] = useState(false);

  const copySQLCommand = () => {
    navigator.clipboard.writeText('database.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card mb-6 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-neutral-800 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isConfigured ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'}`}>
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-neutral-200">
                {isConfigured ? (lang === 'ar' ? 'متصل بقاعدة بيانات Supabase' : 'Supabase Database Connected') : (lang === 'ar' ? 'قاعدة البيانات في الوضع المحلي (أوفلاين)' : 'Database Running in Offline Sandbox Mode')}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isConfigured ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'}`}>
                {isConfigured ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'محلي' : 'Local Sandbox')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              {isConfigured 
                ? (lang === 'ar' ? 'النظام يقرأ ويكتب مباشرة من جداول Supabase السحابية مع تطبيق سياسات الحماية RLS.' : 'The enterprise ERP & CRM system is reading/writing directly from your cloud Supabase database with active RLS.')
                : (lang === 'ar' ? 'يتم حفظ البيانات في المتصفح تلقائياً. يمكنك الانتقال للوضع السحابي باتباع الدليل.' : 'Data persists inside secure browser state. Follow the steps below to integrate your live Supabase cloud database.')}
            </p>
          </div>
        </div>

        {/* Action Button to Expand Guide */}
        {!isConfigured && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 dark:text-neutral-500 hidden lg:inline">
              {lang === 'ar' ? 'أتريد تشغيل النسخة السحابية؟' : 'Want to connect live Supabase cloud?'}
            </span>
            <a 
              href="#supabase-setup-instructions" 
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 rounded-lg font-medium transition-all"
            >
              {lang === 'ar' ? 'عرض دليل الربط 🛠️' : 'View Setup Guide 🛠️'}
            </a>
          </div>
        )}
      </div>

      {/* Guide Details (Visible when offline) */}
      {!isConfigured && (
        <div id="supabase-setup-instructions" className="mt-4 pt-4 border-t border-slate-100 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50/50 dark:bg-neutral-900/30 p-3 rounded-lg border border-slate-100/50 dark:border-neutral-800/40">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-neutral-300 mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>1. {lang === 'ar' ? 'تهيئة الجداول والسياسات' : 'Create Supabase Tables'}</span>
            </div>
            <p className="text-slate-500 dark:text-neutral-400 leading-relaxed mb-2">
              {lang === 'ar' ? 'افتح SQL Editor في Supabase، وانسخ محتويات الملف' : 'Open SQL Editor in Supabase, copy the contents of the generated'} <code className="bg-slate-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-rose-500 font-mono text-[10px]">database.sql</code> {lang === 'ar' ? 'ثم اضغط Run.' : 'file, and click Run.'}
            </p>
            <button 
              onClick={copySQLCommand}
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? (lang === 'ar' ? 'تم نسخ اسم الملف!' : 'Filename copied!') : (lang === 'ar' ? 'نسخ اسم الملف' : 'Copy filename')}</span>
            </button>
          </div>

          <div className="bg-slate-50/50 dark:bg-neutral-900/30 p-3 rounded-lg border border-slate-100/50 dark:border-neutral-800/40">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-neutral-300 mb-1">
              <Key className="w-4 h-4 text-indigo-500" />
              <span>2. {lang === 'ar' ? 'الحصول على روابط الاتصال' : 'Get Connection Credentials'}</span>
            </div>
            <p className="text-slate-500 dark:text-neutral-400 leading-relaxed">
              {lang === 'ar' ? 'اذهب إلى Project Settings > API في Supabase، واحصل على Project URL و anon/public API Key.' : 'Go to Project Settings > API inside Supabase, and copy your Project URL and anon/public API Key.'}
            </p>
          </div>

          <div className="bg-slate-50/50 dark:bg-neutral-900/30 p-3 rounded-lg border border-slate-100/50 dark:border-neutral-800/40">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-neutral-300 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>3. {lang === 'ar' ? 'إدخال المتغيرات في AI Studio' : 'Configure Secrets in AI Studio'}</span>
            </div>
            <p className="text-slate-500 dark:text-neutral-400 leading-relaxed">
              {lang === 'ar' ? 'افتح شريط الإعدادات والرموز السرية (Secrets) في AI Studio، وأضف المفاتيح التالية:' : 'Open Secrets panel in AI Studio and assign the keys:'}
              <br />
              <code className="text-[10px] text-slate-600 dark:text-neutral-400 font-mono block mt-1">VITE_SUPABASE_URL</code>
              <code className="text-[10px] text-slate-600 dark:text-neutral-400 font-mono block">VITE_SUPABASE_ANON_KEY</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
