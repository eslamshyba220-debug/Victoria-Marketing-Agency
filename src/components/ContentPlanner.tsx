import React, { useState } from 'react';
import { 
  CalendarRange, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Calendar,
  Clock,
  Sparkles,
  Link
} from 'lucide-react';
import { Language, translations } from '../translations';
import { ContentPlannerItem, Client, Employee, ContentStatus } from '../types';
import UrlPreview from './UrlPreview';

interface ContentPlannerProps {
  lang: Language;
  contentItems: ContentPlannerItem[];
  clients: Client[];
  employees: Employee[];
  onAddContentItem: (item: Omit<ContentPlannerItem, 'id'>) => Promise<void>;
  onUpdateContentItem: (item: ContentPlannerItem) => Promise<void>;
  onDeleteContentItem: (id: string) => Promise<void>;
}

export default function ContentPlanner({
  lang,
  contentItems,
  clients,
  employees,
  onAddContentItem,
  onUpdateContentItem,
  onDeleteContentItem
}: ContentPlannerProps) {
  const t = translations[lang];

  // Calendar Views
  type CalendarView = 'Month' | 'Week' | 'Day';
  const [view, setView] = useState<CalendarView>('Month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal & Edit state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentPlannerItem | null>(null);

  // Form fields
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [status, setStatus] = useState<ContentStatus>('Draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [copywriterId, setCopywriterId] = useState('');
  const [designerId, setDesignerId] = useState('');

  const statuses: ContentStatus[] = ['Draft', 'Writing', 'Designing', 'Review', 'Scheduled', 'Published'];

  const resetForm = () => {
    setClientId('');
    setTitle('');
    setCaption('');
    setPlatform('Instagram');
    setStatus('Draft');
    setScheduledDate('');
    setMediaUrl('');
    setPostUrl('');
    setCopywriterId('');
    setDesignerId('');
  };

  const handleEditClick = (item: ContentPlannerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setClientId(item.client_id);
    setTitle(item.title);
    setCaption(item.caption || '');
    setPlatform(item.platform);
    setStatus(item.status);
    setScheduledDate(item.scheduled_date.slice(0, 16)); // format for local datetime-local
    setMediaUrl(item.media_url || '');
    setPostUrl(item.post_url || '');
    setCopywriterId(item.copywriter_id || '');
    setDesignerId(item.designer_id || '');
    setShowModal(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(lang === 'ar' ? 'هل تريد حذف هذا المنشور المجدول نهائياً؟' : 'Are you sure you want to permanently delete this scheduled post?')) {
      await onDeleteContentItem(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title || !scheduledDate) return;

    const payload = {
      client_id: clientId,
      title,
      caption,
      platform,
      status,
      scheduled_date: new Date(scheduledDate).toISOString(),
      media_url: mediaUrl || null,
      post_url: postUrl || null,
      copywriter_id: copywriterId || null,
      designer_id: designerId || null
    };

    if (editingItem) {
      await onUpdateContentItem({ ...payload, id: editingItem.id });
    } else {
      await onAddContentItem(payload);
    }

    setShowModal(false);
    setEditingItem(null);
    resetForm();
  };

  // Rescheduling Drag-and-drop helper
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDayDrop = async (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const item = contentItems.find(i => i.id === id);
    if (item) {
      // Keep same hours/minutes, replace date
      const oldTime = new Date(item.scheduled_date);
      const newDate = new Date(dateString);
      newDate.setHours(oldTime.getHours());
      newDate.setMinutes(oldTime.getMinutes());

      await onUpdateContentItem({
        ...item,
        scheduled_date: newDate.toISOString()
      });
    }
  };

  // Helper arrays for Months
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // pad previous days
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // pad next days
    const totalSlots = 42; // standard 6-row grid
    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  // Navigate calendar months
  const adjustMonth = (offset: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + offset);
    setCurrentDate(d);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-orange-500" />
            <span>{t.cpTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            {t.cpSub}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Calendar Views Selector */}
          <div className="inline-flex bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl border border-slate-200/60 dark:border-neutral-800/60">
            {(['Month', 'Week', 'Day'] as CalendarView[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  view === v 
                    ? 'bg-white dark:bg-neutral-800 text-slate-800 dark:text-neutral-100 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                {t[`cpView${v}` as keyof typeof t] || v}
              </button>
            ))}
          </div>

          {clients.length > 0 && (
            <button
              onClick={() => {
                setEditingItem(null);
                resetForm();
                setClientId(clients[0].id);
                // default scheduling date is today at 12:00 PM
                const today = new Date();
                today.setHours(12, 0, 0, 0);
                setScheduledDate(today.toISOString().slice(0, 16));
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>{t.cpAddBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      {contentItems.length === 0 && !showModal ? (
        <div className="p-12 text-center glass-card rounded-2xl border border-slate-150 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarRange className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-neutral-100 mb-2">
            {t.emptyStateTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed mb-6">
            {lang === 'ar' ? 'لا يوجد أي منشورات مجدولة حالياً. لجدولة محتوى تسويقي حقيقي، أضف عميلاً حقيقياً أولاً ثم اضغط جدولة منشور.' : 'Social calendar is currently unpopulated. Click below to schedule a real corporate post.'}
          </p>

          {clients.length === 0 ? (
            <div className="flex items-center gap-2 justify-center text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 p-3.5 rounded-xl max-w-md mx-auto">
              <span>⚠️ {lang === 'ar' ? 'يجب إضافة عميل واحد على الأقل في تبويب العملاء قبل البدء بجدولة المحتوى.' : 'You must add at least one client in the Clients directory before scheduling posts.'}</span>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditingItem(null);
                resetForm();
                setClientId(clients[0].id);
                const today = new Date();
                today.setHours(12, 0, 0, 0);
                setScheduledDate(today.toISOString().slice(0, 16));
                setShowModal(true);
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.cpAddBtn}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Month Navigator Controls */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => adjustMonth(-1)}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200 border border-slate-100 dark:border-neutral-800 rounded-lg cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-100 font-sans">
                {currentDate.toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button 
                onClick={() => adjustMonth(1)}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200 border border-slate-100 dark:border-neutral-800 rounded-lg cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold rounded-lg text-slate-600 dark:text-neutral-300 border border-slate-150 dark:border-neutral-800/80 cursor-pointer"
            >
              {lang === 'ar' ? 'اليوم' : 'Today'}
            </button>
          </div>

          {/* Monthly grid */}
          {view === 'Month' ? (
            <div className="bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-slate-100 dark:border-neutral-850 bg-slate-50/50 dark:bg-neutral-900/30 py-2.5 text-center text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider font-mono">
                {lang === 'ar' 
                  ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
                  : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-slate-100 dark:divide-neutral-900 border-l border-t border-slate-100 dark:border-neutral-900">
                {days.map((day, idx) => {
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = day.toDateString() === new Date().toDateString();
                  const dayString = day.toDateString();

                  // Find content posts scheduled on this day
                  const dayItems = contentItems.filter(item => 
                    new Date(item.scheduled_date).toDateString() === dayString
                  );

                  return (
                    <div
                      key={idx}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDayDrop(e, day.toISOString())}
                      className={`
                        min-h-[100px] p-2 flex flex-col justify-between transition-colors text-xs
                        ${isCurrentMonth ? 'bg-white dark:bg-neutral-950' : 'bg-slate-50/30 dark:bg-neutral-900/5 opacity-50'}
                        ${isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}
                      `}
                    >
                      {/* Day Number */}
                      <span className={`self-start text-[10px] font-bold rounded-md px-1.5 py-0.5 ${
                        isToday 
                          ? 'bg-indigo-600 text-white shadow-xs' 
                          : 'text-slate-400 dark:text-neutral-500'
                      }`}>
                        {day.getDate()}
                      </span>

                      {/* Scheduled Posts list inside this cell */}
                      <div className="mt-2 space-y-1.5 flex-1 overflow-y-auto max-h-[75px] pr-0.5">
                        {dayItems.map(item => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onClick={(e) => handleEditClick(item, e)}
                            className="p-1.5 bg-indigo-50/75 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-neutral-800 rounded-lg text-[9px] font-bold text-indigo-800 dark:text-indigo-300 cursor-grab active:cursor-grabbing truncate hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40 transition-colors flex items-center justify-between gap-1"
                            title={item.title}
                          >
                            <span className="truncate flex-1">{item.title}</span>
                            <span className="text-[8px] bg-white/80 dark:bg-neutral-900 px-1 rounded-sm text-slate-500 font-mono">
                              {item.platform.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Weekly / Daily List Alternate
            <div className="space-y-3">
              {contentItems
                .filter(item => {
                  const itemDate = new Date(item.scheduled_date);
                  if (view === 'Day') {
                    return itemDate.toDateString() === currentDate.toDateString();
                  } else {
                    // within same week (7 days range)
                    const diffTime = Math.abs(itemDate.getTime() - currentDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 7;
                  }
                })
                .map(item => {
                  const clientComp = clients.find(c => c.id === item.client_id)?.company || 'Corporate Client';
                  const copywriter = employees.find(e => e.id === item.copywriter_id)?.name || 'N/A';
                  const designer = employees.find(e => e.id === item.designer_id)?.name || 'N/A';

                  return (
                    <div 
                      key={item.id} 
                      onClick={(e) => handleEditClick(item, e)}
                      className="p-4 bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-850 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-indigo-400 transition-colors text-xs"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold rounded text-[9px] uppercase tracking-wider">
                            {item.platform}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            item.status === 'Published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                            item.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300' :
                            'bg-slate-100 text-slate-800 dark:bg-neutral-800 dark:text-neutral-400'
                          }`}>
                            {t[`contentStatus_${item.status}` as keyof typeof t] || item.status}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-neutral-100 truncate">
                          {item.title}
                        </h4>
                        <p className="text-slate-500 dark:text-neutral-400 text-xs">
                          {lang === 'ar' ? 'العميل: ' : 'Client: '} <span className="font-semibold">{clientComp}</span>
                        </p>
                        {item.caption && (
                          <p className="text-slate-500 dark:text-neutral-400 italic text-xs line-clamp-2">
                            "{item.caption}"
                          </p>
                        )}
                        {item.post_url && (
                          <div className="mt-2 max-w-md" onClick={(e) => e.stopPropagation()}>
                            <UrlPreview url={item.post_url} lang={lang} />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 dark:text-neutral-450 pr-4 md:border-r border-slate-100 dark:border-neutral-800">
                        <div>
                          <span className="block text-slate-400 font-bold uppercase tracking-widest text-[8px]">{lang === 'ar' ? 'كاتب المحتوى' : 'Copywriter'}</span>
                          <span className="font-semibold text-slate-700 dark:text-neutral-300">{copywriter}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-bold uppercase tracking-widest text-[8px]">{lang === 'ar' ? 'المصمم' : 'Designer'}</span>
                          <span className="font-semibold text-slate-700 dark:text-neutral-300">{designer}</span>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-2 shrink-0 md:pl-4">
                        <span className="flex items-center gap-1 text-[10px] text-orange-500 dark:text-orange-400 font-bold font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(item.scheduled_date).toLocaleString(lang === 'ar' ? 'ar-AE' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        <div className="flex gap-1.5">
                          <button 
                            onClick={(e) => handleEditClick(item, e)}
                            className="p-1.5 text-slate-400 hover:text-orange-500 bg-slate-50 dark:bg-neutral-800 rounded-lg"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-neutral-800 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Post Scheduling Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-neutral-900">
              <h3 className="font-bold text-sm text-slate-800 dark:text-neutral-100">
                {editingItem ? (lang === 'ar' ? 'تعديل المنشور المجدول' : 'Edit Scheduled Post') : t.cpAddBtn}
              </h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
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
                    {t.cpPostTitle} *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.cpPlatform}
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Snapchat">Snapchat</option>
                    <option value="Twitter/X">Twitter/X</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.statusLabel}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ContentStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>
                        {t[`contentStatus_${s}` as keyof typeof t] || s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.cpScheduledDate} *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.cpCopywriter}
                  </label>
                  <select
                    value={copywriterId}
                    onChange={(e) => setCopywriterId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  >
                    <option value="">{lang === 'ar' ? 'اختر كاتب المحتوى...' : 'Select copywriter...'}</option>
                    {employees.filter(e => e.role === 'Content Creator' || e.role === 'Owner' || e.role === 'Admin').map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.cpDesigner}
                  </label>
                  <select
                    value={designerId}
                    onChange={(e) => setDesignerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  >
                    <option value="">{lang === 'ar' ? 'اختر المصمم...' : 'Select designer...'}</option>
                    {employees.filter(e => e.role === 'Designer' || e.role === 'Owner' || e.role === 'Admin').map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {t.cpMediaUrl}
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://drive.google.com/file/..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {lang === 'ar' ? 'رابط المنشور (Post URL)' : 'Post URL'}
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://instagram.com/p/..."
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                />
                
                {/* Live rich preview card loaded dynamically */}
                {postUrl && (
                  <div className="mt-2.5">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 mb-1 uppercase tracking-wider">
                      {lang === 'ar' ? 'معاينة الرابط التلقائية' : 'Live URL Preview'}
                    </p>
                    <UrlPreview url={postUrl} lang={lang} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {t.cpCaption}
                </label>
                <textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-neutral-900">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300 font-bold rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md cursor-pointer"
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
