import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Plus, 
  Printer, 
  X, 
  Edit, 
  Trash2, 
  DollarSign, 
  FileText, 
  Calendar,
  Layers,
  Sparkles,
  Percent,
  Calculator
} from 'lucide-react';
import { Language, translations } from '../translations';
import { Invoice, InvoiceItem, Client } from '../types';

interface InvoicesProps {
  lang: Language;
  invoices: Invoice[];
  clients: Client[];
  onAddInvoice: (inv: Omit<Invoice, 'id'>) => Promise<void>;
  onUpdateInvoice: (inv: Invoice) => Promise<void>;
  onDeleteInvoice: (id: string) => Promise<void>;
  currency: string;
  taxNumber: string;
}

export default function Invoices({
  lang,
  invoices,
  clients,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  currency,
  taxNumber
}: InvoicesProps) {
  const t = translations[lang];

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Active / selected invoice states
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Form Fields
  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issuedDate, setIssuedDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [vatPercent, setVatPercent] = useState(5); // Default regional VAT 5%
  const [status, setStatus] = useState<Invoice['payment_status']>('Unpaid');
  const [notes, setNotes] = useState('');

  // Form line-items lists
  const [lineItems, setLineItems] = useState<Omit<InvoiceItem, 'total'>[]>([
    { description: '', qty: 1, price: 0 }
  ]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', qty: 1, price: 0 }]);
  };

  const handleRemoveLineItem = (idx: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const handleLineItemChange = (idx: number, field: keyof Omit<InvoiceItem, 'total'>, val: any) => {
    const updated = [...lineItems];
    if (field === 'qty') {
      updated[idx].qty = Number(val);
    } else if (field === 'price') {
      updated[idx].price = Number(val);
    } else {
      updated[idx].description = val;
    }
    setLineItems(updated);
  };

  const resetForm = () => {
    setClientId('');
    setInvoiceNumber(`VIC-${Date.now().toString().slice(-6)}`);
    const today = new Date();
    setIssuedDate(today.toISOString().slice(0, 10));
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setDueDate(nextMonth.toISOString().slice(0, 10));
    setDiscountPercent(0);
    setVatPercent(5);
    setStatus('Unpaid');
    setNotes('');
    setLineItems([{ description: '', qty: 1, price: 0 }]);
  };

  const handleViewInvoice = (inv: Invoice) => {
    setViewingInvoice(inv);
    setShowViewModal(true);
  };

  const handleEditClick = (inv: Invoice) => {
    setEditingInvoice(inv);
    setClientId(inv.client_id);
    setInvoiceNumber(inv.invoice_number);
    setIssuedDate(inv.issue_date);
    setDueDate(inv.due_date);
    setVatPercent(inv.tax_rate);
    // calculate back discount percentage if possible
    const sub = inv.items.reduce((s, item) => s + (item.qty * item.price), 0);
    const discPct = sub > 0 ? Math.round((inv.discount_amount / sub) * 100) : 0;
    setDiscountPercent(discPct);
    setStatus(inv.payment_status);
    setNotes(inv.notes || '');

    setLineItems(inv.items.map(it => ({
      description: it.description,
      qty: it.qty,
      price: it.price
    })));

    setShowFormModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه الفاتورة؟' : 'Are you sure you want to permanently delete this invoice?')) {
      await onDeleteInvoice(id);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !invoiceNumber || lineItems.some(it => !it.description)) return;

    // calculations
    const itemsWithTotals: InvoiceItem[] = lineItems.map(it => ({
      ...it,
      total: it.qty * it.price
    }));

    const subtotal = itemsWithTotals.reduce((sum, it) => sum + it.total, 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (vatPercent / 100);
    const total_amount = taxableAmount + taxAmount;

    const payload = {
      client_id: clientId,
      invoice_number: invoiceNumber,
      issue_date: issuedDate,
      due_date: dueDate,
      items: itemsWithTotals,
      tax_rate: vatPercent,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total_amount,
      payment_status: status,
      notes
    };

    if (editingInvoice) {
      await onUpdateInvoice({ ...payload, id: editingInvoice.id });
    } else {
      await onAddInvoice(payload);
    }

    setShowFormModal(false);
    setEditingInvoice(null);
    resetForm();
  };

  // Print triggered
  const handlePrint = () => {
    window.print();
  };

  // Filter
  const filteredInvoices = invoices.filter(inv => {
    const clientCompany = clients.find(c => c.id === inv.client_id)?.company || '';
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clientCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || inv.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-500" />
            <span>{t.invTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            {t.invSub}
          </p>
        </div>

        {clients.length > 0 && (
          <button
            onClick={() => {
              setEditingInvoice(null);
              resetForm();
              setClientId(clients[0].id); // default to first client
              setShowFormModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>{t.invAddBtn}</span>
          </button>
        )}
      </div>

      {/* Filter lists */}
      {invoices.length > 0 && (
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs font-medium text-slate-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="">{lang === 'ar' ? 'جميع الحالات الضريبية' : 'All Payment Statuses'}</option>
            <option value="Paid">🟢 {lang === 'ar' ? 'مدفوعة بالكامل' : 'Paid'}</option>
            <option value="Unpaid">🔴 {lang === 'ar' ? 'غير مدفوعة' : 'Unpaid'}</option>
            <option value="Overdue">⚠️ {lang === 'ar' ? 'متأخرة السداد' : 'Overdue'}</option>
            <option value="Partially Paid">🟡 {lang === 'ar' ? 'مدفوعة جزئياً' : 'Partially Paid'}</option>
          </select>
        </div>
      )}

      {/* Invoices List Display */}
      {filteredInvoices.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900 rounded-2xl border border-white/5 shadow-sm">
          <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-500/15">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-neutral-100 mb-2">
            {invoices.length === 0 ? t.emptyStateTitle : (lang === 'ar' ? 'لم يتم العثور على نتائج فواتير' : 'No invoices match your query')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed mb-6">
            {invoices.length === 0 
              ? (lang === 'ar' ? 'لم يتم إصدار فواتير ضريبية حقيقية بعد. أضف أولاً عميلاً حقيقياً متعاقداً معه لتمكين إصدار وتوليد الفواتير بنسب ضريبية دقيقة.' : 'No invoices registered. Ensure a client is present, then click Create Invoice to issue official regional VAT invoices.')
              : (lang === 'ar' ? 'جرب البحث برقم الفاتورة أو اختيار تصنيف سداد آخر.' : 'Try adjusting your search criteria or selecting another payment status.')}
          </p>

          {clients.length === 0 ? (
            <div className="flex items-center gap-2 justify-center text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 p-3.5 rounded-xl max-w-md mx-auto">
              <span>⚠️ {lang === 'ar' ? 'يجب إضافة عميل واحد على الأقل في تبويب العملاء قبل البدء بإصدار الفواتير.' : 'You must add at least one client in the Clients directory before generating billing invoices.'}</span>
            </div>
          ) : (
            invoices.length === 0 && (
              <button
                onClick={() => {
                  setEditingInvoice(null);
                  resetForm();
                  setClientId(clients[0].id);
                  setShowFormModal(true);
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.invAddBtn}</span>
              </button>
            )
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-slate-100 dark:border-neutral-800/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-neutral-400 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-neutral-850 bg-slate-50/50 dark:bg-neutral-900/30 text-slate-400 dark:text-neutral-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="p-4">{t.invNumber}</th>
                  <th className="p-4">{t.invClient}</th>
                  <th className="p-4">{t.invIssueDate}</th>
                  <th className="p-4">{t.invDueDate}</th>
                  <th className="p-4">{t.invGrandTotal}</th>
                  <th className="p-4">{t.statusLabel}</th>
                  <th className="p-4 text-center">{lang === 'ar' ? 'خيارات' : 'Options'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-900 font-medium">
                {filteredInvoices.map((inv) => {
                  const clientCompany = clients.find(c => c.id === inv.client_id)?.company || 'Corporate Client';
                  return (
                    <tr 
                      key={inv.id} 
                      onClick={() => handleViewInvoice(inv)}
                      className="hover:bg-orange-500/5 transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-bold text-slate-800 dark:text-neutral-100 font-mono">
                        {inv.invoice_number}
                      </td>
                      <td className="p-4 text-slate-800 dark:text-neutral-200">
                        {clientCompany}
                      </td>
                      <td className="p-4 font-mono text-slate-500 dark:text-neutral-450">
                        {new Date(inv.issue_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-mono text-slate-500 dark:text-neutral-450">
                        {new Date(inv.due_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-bold text-orange-500 dark:text-orange-400 font-mono">
                        {inv.total_amount.toLocaleString()} {currency}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          inv.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                          inv.payment_status === 'Unpaid' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400' :
                          inv.payment_status === 'Overdue' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' :
                          'bg-slate-100 text-slate-800 dark:bg-neutral-850 dark:text-neutral-400'
                        }`}>
                          {t[`invStatus_${inv.payment_status}` as keyof typeof t] || inv.payment_status}
                        </span>
                      </td>
                      <td className="p-4 text-center flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditClick(inv)}
                          className="p-1.5 text-slate-400 hover:text-orange-500 rounded-md bg-slate-50 dark:bg-neutral-900"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md bg-slate-50 dark:bg-neutral-900"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Printable Invoice Modal (Printable) */}
      {showViewModal && viewingInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 print:p-0 print:m-0 print:shadow-none print:border-0 print:absolute print:inset-0">
            
            {/* Modal Controls (hidden during print) */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-900 border-b border-slate-100 dark:border-neutral-800 print:hidden">
              <span className="font-bold text-xs text-slate-800 dark:text-neutral-200 flex items-center gap-1">
                <FileText className="w-4 h-4 text-orange-500" />
                <span>{lang === 'ar' ? 'عرض الفاتورة الضريبية ورقة رسمية' : 'Official VAT Tax Invoice View'}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingInvoice(null);
                  }} 
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Printable Area */}
            <div id="print-area" className="p-8 space-y-6 text-xs bg-white text-slate-900">
              
              {/* Regional Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    VICTORIA MARKETING AGENCY
                  </h1>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mt-1">
                    Tax Invoice / فاتورة ضريبية
                  </p>
                  {taxNumber && (
                    <p className="text-[10px] text-slate-600 mt-1 font-semibold font-mono">
                      TRN: {taxNumber}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-bold text-lg text-orange-500 font-mono">
                    {viewingInvoice.invoice_number}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Date: {new Date(viewingInvoice.issue_date).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Due: {new Date(viewingInvoice.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Bill To & From */}
              <div className="grid grid-cols-2 gap-8 py-2">
                <div>
                  <span className="font-extrabold text-slate-400 block text-[9px] uppercase tracking-wider mb-2">
                    Prepared By / أعدت بواسطة
                  </span>
                  <p className="font-bold text-slate-800">Victoria Marketing Ltd.</p>
                  <p className="text-slate-500 mt-1">Dubai Operations Hub, United Arab Emirates</p>
                  <p className="text-slate-500">accounts@victoriamarketing.ae</p>
                </div>

                <div>
                  <span className="font-extrabold text-slate-400 block text-[9px] uppercase tracking-wider mb-2">
                    Bill To / العميل المستلم
                  </span>
                  <p className="font-bold text-slate-800">
                    {clients.find(c => c.id === viewingInvoice.client_id)?.company || 'Corporate Client'}
                  </p>
                  <p className="text-slate-500 mt-1">
                    {clients.find(c => c.id === viewingInvoice.client_id)?.email}
                  </p>
                </div>
              </div>

              {/* Items Line Grid */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold text-[9px] uppercase tracking-wider">
                      <th className="p-3">Service / Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {viewingInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-slate-900 font-semibold">{item.description}</td>
                        <td className="p-3 text-center font-mono">{item.qty}</td>
                        <td className="p-3 text-right font-mono">{(item.price).toLocaleString()} {currency}</td>
                        <td className="p-3 text-right font-bold text-slate-900 font-mono">{(item.qty * item.price).toLocaleString()} {currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculations Block */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-2 text-xs border-t border-slate-150 pt-3">
                  <div className="flex justify-between font-semibold text-slate-500">
                    <span>Subtotal / المجموع الفرعي:</span>
                    <span className="font-mono">{(
                      viewingInvoice.items.reduce((s, it) => s + (it.qty * it.price), 0)
                    ).toLocaleString()} {currency}</span>
                  </div>

                  {viewingInvoice.discount_amount > 0 && (
                    <div className="flex justify-between font-semibold text-rose-600">
                      <span>Discount / الخصم:</span>
                      <span className="font-mono">-{viewingInvoice.discount_amount.toLocaleString()} {currency}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-semibold text-slate-500">
                    <span>VAT / ضريبة القيمة المضافة ({viewingInvoice.tax_rate}%):</span>
                    <span className="font-mono">{viewingInvoice.tax_amount.toLocaleString()} {currency}</span>
                  </div>

                  <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-2 text-sm">
                    <span>Grand Total / الإجمالي الكلي:</span>
                    <span className="font-mono text-orange-500">{viewingInvoice.total_amount.toLocaleString()} {currency}</span>
                  </div>
                </div>
              </div>

              {/* Print Declaration Terms */}
              <div className="pt-8 border-t border-slate-200 text-center text-[9px] text-slate-400 space-y-1">
                <p>This is a computer generated tax invoice and does not require a physical signature.</p>
                <p>شكراً لتعاملكم مع وكالة فيكتوريا للتسويق الرقمي</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Invoice Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-neutral-900">
              <h3 className="font-bold text-sm text-slate-800 dark:text-neutral-100">
                {editingInvoice ? (lang === 'ar' ? 'تعديل فاتورة ضريبية' : 'Edit Tax Invoice') : t.invAddBtn}
              </h3>
              <button 
                onClick={() => {
                  setShowFormModal(false);
                  setEditingInvoice(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {lang === 'ar' ? 'العميل المستلم' : 'Billed Client'} *
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
                    {t.invNumber} *
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.invIssueDate}
                  </label>
                  <input
                    type="date"
                    required
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.invDueDate}
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.invDiscount} %
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    VAT %
                  </label>
                  <input
                    type="number"
                    value={vatPercent}
                    onChange={(e) => setVatPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                    {t.statusLabel}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-300 font-semibold mb-1">
                  {t.notes}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl"
                />
              </div>

              {/* Dynamic Line-Items List */}
              <div className="pt-2 border-t border-slate-100 dark:border-neutral-900">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-neutral-200">
                    {lang === 'ar' ? 'بنود الخدمات والأسعار' : 'Invoice line items'}
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs text-orange-500 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'إضافة بند جديد' : 'Add Item'}</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 items-end">
                      <div className="flex-1">
                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">{lang === 'ar' ? 'وصف الخدمة' : 'Description'}</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Media Buying, Facebook Campaigns"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs"
                        />
                      </div>
                      <div className="w-16">
                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">{lang === 'ar' ? 'الكمية' : 'Qty'}</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={item.qty}
                          onChange={(e) => handleLineItemChange(idx, 'qty', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">{lang === 'ar' ? 'سعر الوحدة' : 'Unit Price'}</label>
                        <input
                          type="number"
                          required
                          value={item.price}
                          onChange={(e) => handleLineItemChange(idx, 'price', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-neutral-900 rounded-lg shrink-0 cursor-pointer"
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {editingInvoice && (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(lang === 'ar' ? 'هل تريد حذف هذه الفاتورة نهائياً؟' : 'Are you sure you want to delete this invoice?')) {
                      await onDeleteInvoice(editingInvoice.id);
                      setShowFormModal(false);
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
                    setShowFormModal(false);
                    setEditingInvoice(null);
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
