import React, { useState } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  CheckSquare, 
  Video, 
  Clock, 
  Edit, 
  Trash2, 
  X, 
  Briefcase, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Language, translations } from '../translations';
import { Project, CompanyTask, Meeting, Employee, Client } from '../types';

interface CompanyPlannerProps {
  lang: Language;
  projects: Project[];
  tasks: CompanyTask[];
  meetings: Meeting[];
  employees: Employee[];
  clients: Client[];
  onAddProject: (proj: Omit<Project, 'id'>) => Promise<void>;
  onUpdateProject: (proj: Project) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onAddCompanyTask: (task: Omit<CompanyTask, 'id'>) => Promise<void>;
  onUpdateCompanyTask: (task: CompanyTask) => Promise<void>;
  onDeleteCompanyTask: (id: string) => Promise<void>;
  onAddMeeting: (meet: Omit<Meeting, 'id'>) => Promise<void>;
  onUpdateMeeting: (meet: Meeting) => Promise<void>;
  onDeleteMeeting: (id: string) => Promise<void>;
}

export default function CompanyPlanner({
  lang,
  projects,
  tasks,
  meetings,
  employees,
  clients,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddCompanyTask,
  onUpdateCompanyTask,
  onDeleteCompanyTask,
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting
}: CompanyPlannerProps) {
  const t = translations[lang];

  // Tab State inside planner (Tasks vs Projects vs Meetings)
  type PlannerSubTab = 'tasks' | 'projects' | 'meetings';
  const [subTab, setSubTab] = useState<PlannerSubTab>('tasks');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showProjModal, setShowProjModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMeetModal, setShowMeetModal] = useState(false);

  // Edit states
  const [editingProj, setEditingProj] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<CompanyTask | null>(null);
  const [editingMeet, setEditingMeet] = useState<Meeting | null>(null);

  // Project Form Fields
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projStatus, setProjStatus] = useState<Project['status']>('Not Started');
  const [projStart, setProjStart] = useState('');
  const [projEnd, setProjEnd] = useState('');

  // Task Form Fields
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskStatus, setTaskStatus] = useState<CompanyTask['status']>('Todo');
  const [taskPriority, setTaskPriority] = useState<CompanyTask['priority']>('Medium');
  const [taskAssignedId, setTaskAssignedId] = useState('');

  // Meeting Form Fields
  const [meetClientId, setMeetClientId] = useState('');
  const [meetTitle, setMeetTitle] = useState('');
  const [meetDesc, setMeetDesc] = useState('');
  const [meetSched, setMeetSched] = useState('');
  const [meetDuration, setMeetDuration] = useState(30);
  const [meetLink, setMeetLink] = useState('');
  const [meetStatus, setMeetStatus] = useState<'Scheduled' | 'Completed' | 'Cancelled'>('Scheduled');

  // Helpers to trigger modals
  const openProjModal = (p: Project | null = null) => {
    if (p) {
      setEditingProj(p);
      setProjName(p.name);
      setProjDesc(p.description || '');
      setProjStatus(p.status);
      setProjStart(p.start_date || '');
      setProjEnd(p.end_date || '');
    } else {
      setEditingProj(null);
      setProjName('');
      setProjDesc('');
      setProjStatus('Not Started');
      setProjStart('');
      setProjEnd('');
    }
    setShowProjModal(true);
  };

  const openTaskModal = (tk: CompanyTask | null = null) => {
    if (tk) {
      setEditingTask(tk);
      setTaskProjectId(tk.project_id || '');
      setTaskTitle(tk.title);
      setTaskDesc(tk.description || '');
      setTaskDueDate(tk.due_date ? tk.due_date.slice(0, 16) : '');
      setTaskStatus(tk.status);
      setTaskPriority(tk.priority);
      setTaskAssignedId(tk.assigned_employee_id || '');
    } else {
      setEditingTask(null);
      setTaskProjectId(projects[0]?.id || '');
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      setTaskStatus('Todo');
      setTaskPriority('Medium');
      setTaskAssignedId('');
    }
    setShowTaskModal(true);
  };

  const openMeetModal = (m: Meeting | null = null) => {
    if (m) {
      setEditingMeet(m);
      setMeetClientId(m.client_id || '');
      setMeetTitle(m.title);
      setMeetDesc(m.description || '');
      setMeetSched(m.scheduled_at ? m.scheduled_at.slice(0, 16) : '');
      setMeetDuration(m.duration_minutes);
      setMeetLink(m.meeting_link || '');
      setMeetStatus(m.status);
    } else {
      setEditingMeet(null);
      setMeetClientId('');
      setMeetTitle('');
      setMeetDesc('');
      setMeetSched('');
      setMeetDuration(30);
      setMeetLink('');
      setMeetStatus('Scheduled');
    }
    setShowMeetModal(true);
  };

  // Submissions
  const handleProjSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName) return;

    const payload = {
      name: projName,
      description: projDesc,
      status: projStatus,
      start_date: projStart || undefined,
      end_date: projEnd || undefined
    };

    if (editingProj) {
      await onUpdateProject({ ...payload, id: editingProj.id });
    } else {
      await onAddProject(payload);
    }
    setShowProjModal(false);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const payload = {
      project_id: taskProjectId || null,
      title: taskTitle,
      description: taskDesc,
      due_date: taskDueDate ? new Date(taskDueDate).toISOString() : null,
      status: taskStatus,
      priority: taskPriority,
      assigned_employee_id: taskAssignedId || null
    };

    if (editingTask) {
      await onUpdateCompanyTask({ ...payload, id: editingTask.id });
    } else {
      await onAddCompanyTask(payload);
    }
    setShowTaskModal(false);
  };

  const handleMeetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetTitle || !meetSched) return;

    const payload = {
      client_id: meetClientId || null,
      title: meetTitle,
      description: meetDesc,
      scheduled_at: new Date(meetSched).toISOString(),
      duration_minutes: Number(meetDuration),
      meeting_link: meetLink || null,
      status: meetStatus
    };

    if (editingMeet) {
      await onUpdateMeeting({ ...payload, id: editingMeet.id });
    } else {
      await onAddMeeting(payload);
    }
    setShowMeetModal(false);
  };

  // Drag and Drop rescheduling tasks
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleTaskDrop = async (e: React.DragEvent, targetStatus: CompanyTask['status']) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const tk = tasks.find(t => t.id === id);
    if (tk && tk.status !== targetStatus) {
      await onUpdateCompanyTask({
        ...tk,
        status: targetStatus
      });
    }
  };

  // Filters
  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredMeetings = meetings.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-orange-500" />
            <span>{t.plTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            {t.plSub}
          </p>
        </div>

        {/* Dynamic add button based on current sub-tab */}
        {subTab === 'tasks' ? (
          <button
            onClick={() => openTaskModal()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>{t.plAddTaskBtn}</span>
          </button>
        ) : subTab === 'projects' ? (
          <button
            onClick={() => openProjModal()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>{t.plAddProjectBtn}</span>
          </button>
        ) : (
          <button
            onClick={() => openMeetModal()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>{t.plAddMeetingBtn}</span>
          </button>
        )}
      </div>

      {/* Sub tabs navigators */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-neutral-900 pb-1">
        {(['tasks', 'projects', 'meetings'] as PlannerSubTab[]).map(st => (
          <button
            key={st}
            onClick={() => {
              setSubTab(st);
              setSearchTerm('');
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-1 transition-all capitalize cursor-pointer ${
              subTab === st
                ? 'border-orange-500 text-orange-500 dark:border-orange-400 dark:text-orange-400'
                : 'border-transparent text-slate-450 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-350'
            }`}
          >
            {st === 'tasks' ? (lang === 'ar' ? 'المهام والعمليات' : 'Sprint Tasks') :
             st === 'projects' ? (lang === 'ar' ? 'المشاريع الداخلية' : 'Operational Projects') :
             (lang === 'ar' ? 'الاجتماعات واللقاءات' : 'Corporate Meetings')}
          </button>
        ))}
      </div>

      {/* Shared Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none"
        />
      </div>

      {/* Sub Tab: SPRINT TASKS (Kanban drag & drop) */}
      {subTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['Todo', 'In Progress', 'Review', 'Done'] as CompanyTask['status'][]).map(st => {
            const stageTasks = filteredTasks.filter(tk => tk.status === st);
            return (
              <div
                key={st}
                onDragOver={handleDragOver}
                onDrop={(e) => handleTaskDrop(e, st)}
                className="bg-slate-50/50 dark:bg-neutral-900/40 rounded-2xl border border-slate-100 dark:border-neutral-850 p-3 flex flex-col min-h-[350px]"
              >
                {/* Column header */}
                <div className="flex justify-between items-center mb-3 px-1">
                  <span className="font-bold text-xs text-slate-800 dark:text-neutral-200">
                    {t[`taskStatus_${st}` as keyof typeof t] || st}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-200/60 dark:bg-neutral-800 rounded-full text-[10px] font-bold text-slate-600 dark:text-neutral-400 font-mono">
                    {stageTasks.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[450px]">
                  {stageTasks.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-[10px] text-slate-400 dark:text-neutral-500 border border-dashed border-slate-200 dark:border-neutral-850 rounded-xl">
                      {lang === 'ar' ? 'اسحب مهمة هنا' : 'Drag action here'}
                    </div>
                  ) : (
                    stageTasks.map(tk => {
                      const assignedEmp = employees.find(e => e.id === tk.assigned_employee_id)?.name || 'Unassigned';
                      return (
                        <div
                          key={tk.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, tk.id)}
                          onClick={() => openTaskModal(tk)}
                          className="p-3 bg-white dark:bg-neutral-950 rounded-xl border border-slate-200/65 dark:border-neutral-800/80 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-grab active:cursor-grabbing transition-all text-xs space-y-2 shadow-xs"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-bold text-slate-800 dark:text-neutral-200 leading-tight">
                              {tk.title}
                            </h4>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              tk.priority === 'High' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400' :
                              tk.priority === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' :
                              'bg-slate-100 text-slate-800 dark:bg-neutral-850 dark:text-slate-400'
                            }`}>
                              {tk.priority}
                            </span>
                          </div>

                          {tk.description && (
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                              {tk.description}
                            </p>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-neutral-900 text-[9px] text-slate-400 dark:text-neutral-500">
                            <span className="font-semibold flex items-center gap-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{tk.due_date ? new Date(tk.due_date).toLocaleDateString() : 'No date'}</span>
                            </span>
                            <span className="font-bold text-slate-600 dark:text-neutral-300">
                              {assignedEmp}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub Tab: INTERNAL PROJECTS */}
      {subTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="p-10 text-center glass-card rounded-2xl border border-slate-150 col-span-full">
              <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400 dark:text-neutral-500">
                {lang === 'ar' ? 'لا توجد مشاريع مضافة حالياً.' : 'No internal sprint projects logged.'}
              </p>
            </div>
          ) : (
            filteredProjects.map(proj => {
              const projTasks = tasks.filter(t => t.project_id === proj.id);
              const doneTasks = projTasks.filter(t => t.status === 'Done').length;
              const percentComplete = projTasks.length > 0 ? (doneTasks / projTasks.length) * 100 : 0;

              return (
                <div 
                  key={proj.id} 
                  className="glass-card rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-xs p-5 space-y-4 cursor-pointer hover:border-orange-500 transition-colors flex flex-col justify-between"
                  onClick={() => openProjModal(proj)}
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-neutral-100">
                        {proj.name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        proj.status === 'In Progress' ? 'bg-orange-500/10 text-orange-500 dark:bg-zinc-900 dark:text-orange-400 border border-orange-500/15' :
                        'bg-slate-100 text-slate-800 dark:bg-neutral-850 dark:text-slate-400'
                      }`}>
                        {t[`projectStatus_${proj.status.replace(/\s+/g, '_')}` as keyof typeof t] || proj.status}
                      </span>
                    </div>
                    {proj.description && (
                      <p className="text-slate-500 dark:text-neutral-400 leading-relaxed text-xs line-clamp-3">
                        {proj.description}
                      </p>
                    )}
                  </div>

                  {/* Tasks progress indicator */}
                  <div className="space-y-1 pt-2 border-t border-slate-50 dark:border-neutral-900">
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                      <span>{lang === 'ar' ? 'تقدم إنجاز المهام' : 'Tasks Progress'}</span>
                      <span>{doneTasks} / {projTasks.length}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentComplete}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-neutral-500 font-semibold font-mono mt-1">
                    <span>{proj.start_date || 'Start'}</span>
                    <span>-</span>
                    <span>{proj.end_date || 'Ongoing'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Sub Tab: TEAM MEETINGS */}
      {subTab === 'meetings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeetings.length === 0 ? (
            <div className="p-10 text-center glass-card rounded-2xl border border-slate-150 col-span-full">
              <Video className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400 dark:text-neutral-500">
                {lang === 'ar' ? 'لا توجد اجتماعات مجدولة.' : 'No active briefings scheduled.'}
              </p>
            </div>
          ) : (
            filteredMeetings.map(meet => {
              const clientComp = clients.find(c => c.id === meet.client_id)?.company || 'Internal Team Briefing';
              return (
                <div 
                  key={meet.id} 
                  className="glass-card rounded-2xl border border-slate-100 dark:border-neutral-800 p-4 shadow-xs flex justify-between items-center gap-3 cursor-pointer hover:border-orange-500 transition-colors"
                  onClick={() => openMeetModal(meet)}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[9px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/10">
                      {clientComp}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-neutral-100 truncate mt-1">
                      {meet.title}
                    </h4>
                    {meet.description && (
                      <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-1 italic">
                        "{meet.description}"
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 dark:text-neutral-500 flex items-center gap-1 font-semibold font-mono mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(meet.scheduled_at).toLocaleString(lang === 'ar' ? 'ar-AE' : 'en-US')}</span>
                      <span>({meet.duration_minutes} {lang === 'ar' ? 'دقيقة' : 'min'})</span>
                    </p>
                  </div>

                  {meet.meeting_link && (
                    <a 
                      href={meet.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer hover:bg-orange-600 transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'انضمام' : 'Join'}</span>
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Projects Modal */}
      {showProjModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-neutral-900">
              <h3 className="font-bold text-sm text-slate-800 dark:text-neutral-100">
                {editingProj ? (lang === 'ar' ? 'تعديل مشروع' : 'Edit Project') : t.plAddProjectBtn}
              </h3>
              <button onClick={() => setShowProjModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProjSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.plProjName} *</label>
                <input required type="text" value={projName} onChange={(e) => setProjName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.statusLabel}</label>
                <select value={projStatus} onChange={(e) => setProjStatus(e.target.value as Project['status'])} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl">
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.adsStartDate}</label>
                  <input type="date" value={projStart} onChange={(e) => setProjStart(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl cursor-pointer" />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.adsEndDate}</label>
                  <input type="date" value={projEnd} onChange={(e) => setProjEnd(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.plProjDesc}</label>
                <textarea rows={3} value={projDesc} onChange={(e) => setProjDesc(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl" />
              </div>

              {editingProj && (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المشروع بالكامل؟' : 'Are you sure you want to delete this project?')) {
                      await onDeleteProject(editingProj.id);
                      setShowProjModal(false);
                    }
                  }}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 text-rose-600 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.delete}</span>
                </button>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t dark:border-neutral-900">
                <button type="button" onClick={() => setShowProjModal(false)} className="px-4 py-2 bg-slate-150 rounded-xl font-bold">{t.cancel}</button>
                <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tasks Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-neutral-900">
              <h3 className="font-bold text-sm text-slate-800 dark:text-neutral-100">
                {editingTask ? (lang === 'ar' ? 'تعديل المهمة' : 'Edit Task') : t.plAddTaskBtn}
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.plTaskTitle} *</label>
                <input required type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl" />
              </div>

              {projects.length > 0 && (
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{lang === 'ar' ? 'المشروع المرتبط' : 'Link to Internal Project'}</label>
                  <select value={taskProjectId} onChange={(e) => setTaskProjectId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl">
                    <option value="">{lang === 'ar' ? 'بلا مشروع' : 'No Project'}</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.statusLabel}</label>
                  <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value as CompanyTask['status'])} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl">
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.plTaskPriority}</label>
                  <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as CompanyTask['priority'])} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.crmDueDate}</label>
                  <input type="datetime-local" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl cursor-pointer" />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.assignedTo}</label>
                  <select value={taskAssignedId} onChange={(e) => setTaskAssignedId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl">
                    <option value="">{lang === 'ar' ? 'غير معين' : 'Unassigned'}</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.plTaskDesc}</label>
                <textarea rows={3} value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl" />
              </div>

              {editingTask && (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(lang === 'ar' ? 'هل تريد حذف هذه المهمة نهائياً؟' : 'Are you sure you want to delete this task?')) {
                      await onDeleteCompanyTask(editingTask.id);
                      setShowTaskModal(false);
                    }
                  }}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.delete}</span>
                </button>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t dark:border-neutral-900">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 bg-slate-150 rounded-xl font-bold">{t.cancel}</button>
                <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meetings Modal */}
      {showMeetModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-neutral-900">
              <h3 className="font-bold text-sm text-slate-800 dark:text-neutral-100">
                {editingMeet ? (lang === 'ar' ? 'تعديل الاجتماع المجدول' : 'Edit Meeting') : t.plAddMeetingBtn}
              </h3>
              <button onClick={() => setShowMeetModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMeetSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.plMeetingTitle} *</label>
                <input required type="text" value={meetTitle} onChange={(e) => setMeetTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl" />
              </div>

              {clients.length > 0 && (
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{lang === 'ar' ? 'العميل المستضيف' : 'Hosting Client'}</label>
                  <select value={meetClientId} onChange={(e) => setMeetClientId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl">
                    <option value="">{lang === 'ar' ? 'اجتماع داخلي للفريق' : 'Internal Team briefing'}</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.plMeetingTime} *</label>
                  <input required type="datetime-local" value={meetSched} onChange={(e) => setMeetSched(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl cursor-pointer" />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.plMeetingDuration}</label>
                  <input type="number" value={meetDuration} onChange={(e) => setMeetDuration(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.statusLabel}</label>
                  <select value={meetStatus} onChange={(e) => setMeetStatus(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl">
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.plMeetingLink}</label>
                  <input type="text" placeholder="e.g. https://meet.google.com/..." value={meetLink} onChange={(e) => setMeetLink(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">{t.plMeetingDesc}</label>
                <textarea rows={3} value={meetDesc} onChange={(e) => setMeetDesc(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 rounded-xl" />
              </div>

              {editingMeet && (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(lang === 'ar' ? 'هل تريد إلغاء وحذف هذا الاجتماع بالكامل؟' : 'Are you sure you want to delete this meeting?')) {
                      await onDeleteMeeting(editingMeet.id);
                      setShowMeetModal(false);
                    }
                  }}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.delete}</span>
                </button>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t dark:border-neutral-900">
                <button type="button" onClick={() => setShowMeetModal(false)} className="px-4 py-2 bg-slate-150 rounded-xl font-bold">{t.cancel}</button>
                <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
