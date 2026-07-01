import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  UserX, 
  UserCheck, 
  Edit, 
  Trash2, 
  X,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { Language, translations } from '../translations';
import { Employee, UserRole } from '../types';

interface EmployeesProps {
  lang: Language;
  employees: Employee[];
  currentRole: UserRole; // for checking salary visibility
  onAddEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
  onUpdateEmployee: (emp: Employee) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
  currency: string;
}

export default function Employees({
  lang,
  employees,
  currentRole,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  currency
}: EmployeesProps) {
  const t = translations[lang];

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Sales');
  const [salary, setSalary] = useState(0);
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [status, setStatus] = useState<'Active' | 'Suspended'>('Active');

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

  // Restricting salary displays to Owner, Admin and Manager roles only
  const canSeeSalary = currentRole === 'Owner' || currentRole === 'Admin' || currentRole === 'Manager';

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setRole('Sales');
    setSalary(0);
    setDateOfJoining('');
    setAvatarUrl('');
    setStatus('Active');
  };

  const handleEditClick = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPhone(emp.phone || '');
    setRole(emp.role);
    setSalary(emp.salary || 0);
    setDateOfJoining(emp.date_of_joining || '');
    setAvatarUrl(emp.profile_photo || '');
    setStatus(emp.status);
    setShowAddModal(true);
  };

  const handleDeleteClick = async (emp: Employee) => {
    if (confirm(lang === 'ar' ? `هل أنت متأكد من حذف الموظف "${emp.name}"؟` : `Are you sure you want to delete employee "${emp.name}"?`)) {
      await onDeleteEmployee(emp.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const payload = {
      name,
      email,
      phone: phone || '',
      role,
      salary: Number(salary),
      date_of_joining: dateOfJoining || new Date().toISOString().split('T')[0],
      profile_photo: avatarUrl || null,
      department: 'Marketing',
      status
    };

    if (editingEmployee) {
      await onUpdateEmployee({ ...payload, id: editingEmployee.id });
    } else {
      await onAddEmployee(payload);
    }

    setShowAddModal(false);
    setEditingEmployee(null);
    resetForm();
  };

  // Filters
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <span>{t.empTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            {t.empSub}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingEmployee(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>{t.empAddBtn}</span>
        </button>
      </div>

      {/* Filter and Search */}
      {employees.length > 0 && (
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs font-medium text-slate-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="">{lang === 'ar' ? 'جميع الأدوار / الأقسام' : 'All Departments / Roles'}</option>
            {roles.map(r => (
              <option key={r} value={r}>
                {t[`role_${r.replace(/\s+/g, '_')}` as keyof typeof t] || r}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Grid rendering */}
      {filteredEmployees.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900 rounded-2xl border border-white/5 shadow-sm">
          <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-500/15">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-neutral-100 mb-2">
            {employees.length === 0 ? t.emptyStateTitle : (lang === 'ar' ? 'لم يتم العثور على نتائج' : 'No team members match your filters')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed mb-6">
            {employees.length === 0 
              ? (lang === 'ar' ? 'فيكتوريا للتسويق لا تدعم الموظفين الوهميين. يرجى البدء بإضافة الموظفين الفعليين للشركة لبدء تعيين المهام وعمليات التشغيل.' : 'Victoria Marketing ERP operates on active, real team roles. Add a team member or onboarding candidate to start assigning operational tasks.')
              : (lang === 'ar' ? 'جرب البحث باسم آخر أو دور مختلف.' : 'Try searching for another team member or role type.')}
          </p>
          {employees.length === 0 && (
            <button
              onClick={() => {
                setEditingEmployee(null);
                resetForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.empAddBtn}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => {
            const isTerminated = emp.status === 'Suspended';
            const roleKey = `role_${emp.role.replace(/\s+/g, '_')}` as keyof typeof t;
            
            return (
              <div 
                key={emp.id} 
                className={`glass-card rounded-2xl border p-5 space-y-4 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between
                  ${isTerminated ? 'border-rose-150 bg-rose-50/10 opacity-75' : 'border-slate-100 dark:border-neutral-800'}
                `}
              >
                {/* Upper Section */}
                <div className="space-y-4">
                  {/* Avatar & Role Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700/60 overflow-hidden shrink-0 flex items-center justify-center">
                      {emp.profile_photo ? (
                        <img 
                          src={emp.profile_photo} 
                          alt={emp.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Users className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-sm text-slate-800 dark:text-neutral-100 truncate">
                          {emp.name}
                        </h3>
                        {emp.role === 'Owner' && <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-orange-500 dark:text-orange-400 font-bold uppercase tracking-wider block mt-0.5">
                        {t[roleKey] || emp.role}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(emp)}
                        className="p-1 text-slate-400 hover:text-orange-500 bg-slate-50 dark:bg-neutral-900 rounded-md"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Core Details */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-neutral-300">
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono">{emp.email}</span>
                    </p>
                    {emp.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-mono">{emp.phone}</span>
                      </p>
                    )}
                    {emp.date_of_joining && (
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{lang === 'ar' ? 'تاريخ الانضمام: ' : 'Joined: '} <span className="font-semibold font-mono">{new Date(emp.date_of_joining).toLocaleDateString()}</span></span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Salary display (Secure role-gate) */}
                <div className="pt-3 border-t border-slate-100 dark:border-neutral-900 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                      {t.empSalary}
                    </span>
                    {canSeeSalary ? (
                      <span className="font-bold text-slate-800 dark:text-neutral-100 font-mono">
                        {(emp.salary || 0).toLocaleString()} {currency}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-neutral-500 italic text-[10px]">
                        🔒 {lang === 'ar' ? 'محجوب' : 'Hidden'}
                      </span>
                    )}
                  </div>

                  {/* Operational status marker */}
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    isTerminated 
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400' 
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}>
                    {isTerminated ? (lang === 'ar' ? 'موقوف' : 'Terminated') : (lang === 'ar' ? 'نشط' : 'Active')}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-neutral-900">
              <h3 className="font-bold text-sm text-slate-800 dark:text-neutral-100">
                {editingEmployee ? (lang === 'ar' ? 'تعديل موظف' : 'Edit Employee') : t.empAddBtn}
              </h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEmployee(null);
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
                    {t.empName} *
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
                    {t.empEmail} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.empPhone}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.empRole}
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  >
                    {roles.map(r => (
                      <option key={r} value={r}>
                        {t[`role_${r.replace(/\s+/g, '_')}` as keyof typeof t] || r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.empSalary} ({currency})
                  </label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.empDateOfJoining}
                  </label>
                  <input
                    type="date"
                    value={dateOfJoining}
                    onChange={(e) => setDateOfJoining(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {lang === 'ar' ? 'رابط الصورة الشخصية' : 'Avatar image URL'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {lang === 'ar' ? 'حالة الموظف' : 'Employment status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Terminated')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  >
                    <option value="Active">{lang === 'ar' ? 'نشط' : 'Active'}</option>
                    <option value="Terminated">{lang === 'ar' ? 'موقوف / مغادر' : 'Terminated'}</option>
                  </select>
                </div>
              </div>

              {editingEmployee && (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(lang === 'ar' ? 'هل تريد حذف هذا الموظف نهائياً؟' : 'Are you sure you want to delete this employee?')) {
                      await onDeleteEmployee(editingEmployee.id);
                      setShowAddModal(false);
                    }
                  }}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.delete}</span>
                </button>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-neutral-900">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEmployee(null);
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
