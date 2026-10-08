import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Plus,
  Receipt,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  X,
  Layers,
  GraduationCap,
  Edit2,
  Trash2,
  UserCheck,
  Eye,
  Filter,
} from 'lucide-react';
import { paymentApi, studentApi, academicApi } from '../../api/services';
import {
  PaymentResponse,
  PaymentCreateRequest,
  FeeStructureResponse,
  FeeStructureCreateRequest,
  StudentResponse,
  StudentFeeAssignmentResponse,
  ClassResponse,
} from '../../types';
import { useToast } from '../../context/ToastContext';

export const PaymentManagement: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'payments' | 'unpaid' | 'fee-structures'>('payments');

  // Data states
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructureResponse[]>([]);
  const [feeAssignments, setFeeAssignments] = useState<StudentFeeAssignmentResponse[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [paymentSearch, setPaymentSearch] = useState('');
  const [unpaidSearch, setUnpaidSearch] = useState('');
  const [unpaidStatusFilter, setUnpaidStatusFilter] = useState<string>('ALL');
  const [feeStructureSearch, setFeeStructureSearch] = useState('');
  const [feeStructureStatusFilter, setFeeStructureStatusFilter] = useState<string>('ACTIVE');

  // Modals
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isFeeCreateOpen, setIsFeeCreateOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeStructureResponse | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [receiptModal, setReceiptModal] = useState<PaymentResponse | null>(null);
  const [selectedFee, setSelectedFee] = useState<FeeStructureResponse | null>(null);

  // Student Details Modal
  const [studentDetailsModal, setStudentDetailsModal] = useState<Record<string, any> | null>(null);
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false);

  // Form states
  const [paymentForm, setPaymentForm] = useState<PaymentCreateRequest>({
    studentId: 0,
    amount: 15000,
    paymentMethod: 'CASH',
    referenceNumber: '',
    feeAssignmentId: undefined,
    notes: 'Tuition Fee Payment',
  });

  const [feeForm, setFeeForm] = useState<FeeStructureCreateRequest>({
    name: '',
    feeName: '',
    feeType: 'TUITION',
    amount: 45000,
    frequency: 'ANNUAL',
    academicYear: 2026,
    description: '',
    classId: undefined,
  });

  const [assignStudentId, setAssignStudentId] = useState<number | ''>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [assignDueDate, setAssignDueDate] = useState<string>('');
  const [assignNotes, setAssignNotes] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, fRes, faRes, sRes, cRes] = await Promise.all([
        paymentApi.listPayments({ size: 100 }).catch(() => ({ data: [] })),
        paymentApi.listFeeStructures().catch(() => ({ data: [] })),
        paymentApi.listFeeAssignments().catch(() => ({ data: [] })),
        studentApi.list({ size: 200 }).catch(() => ({ data: [] })),
        academicApi.listClasses({ size: 100 }).catch(() => ({ data: [] })),
      ]);
      if (pRes.data) setPayments(pRes.data);
      if (fRes.data) setFeeStructures(fRes.data);
      if (faRes.data) setFeeAssignments(faRes.data);
      if (sRes.data) setStudents(sRes.data);
      if (cRes.data) setClasses(cRes.data);
    } catch (err) {
      console.error("Error loading finance data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleOpenRecordModal = (studentId?: number, feeAssignmentId?: number, defaultAmount?: number) => {
    setPaymentForm({
      studentId: studentId || (students.length > 0 ? students[0].id : 0),
      amount: defaultAmount || 15000,
      paymentMethod: 'CASH',
      referenceNumber: `REF-${Date.now().toString().slice(-6)}`,
      feeAssignmentId: feeAssignmentId,
      notes: feeAssignmentId ? 'Fee Assignment Payment' : 'Tuition Payment',
    });
    setIsRecordOpen(true);
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.studentId || !paymentForm.amount || paymentForm.amount <= 0) {
      toastError('Please specify a valid student and positive payment amount.');
      return;
    }

    try {
      const res = await paymentApi.recordPayment({
        ...paymentForm,
        studentId: Number(paymentForm.studentId),
        amount: Number(paymentForm.amount),
        feeAssignmentId: paymentForm.feeAssignmentId ? Number(paymentForm.feeAssignmentId) : undefined,
        referenceNumber: paymentForm.referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
      });
      success('Payment recorded successfully!');
      setIsRecordOpen(false);
      loadData();
      if (res.data) {
        setReceiptModal(res.data);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to record payment.');
    }
  };

  const handleOpenCreateFeeModal = () => {
    setEditingFee(null);
    setFeeForm({
      name: '',
      feeName: '',
      feeType: 'TUITION',
      amount: 45000,
      frequency: 'ANNUAL',
      academicYear: 2026,
      description: '',
      classId: undefined,
    });
    setIsFeeCreateOpen(true);
  };

  const handleOpenEditFeeModal = (fee: FeeStructureResponse) => {
    setEditingFee(fee);
    const feeTitle = fee.name || fee.feeName || '';
    setFeeForm({
      name: feeTitle,
      feeName: feeTitle,
      feeType: fee.feeType || 'TUITION',
      amount: Number(fee.amount) || 0,
      frequency: fee.frequency || 'ANNUAL',
      academicYear: fee.academicYear || 2026,
      description: fee.description || '',
      classId: fee.classId,
    });
    setIsFeeCreateOpen(true);
  };

  const handleCreateOrUpdateFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const feeTitle = feeForm.name || feeForm.feeName;
    if (!feeTitle) {
      toastError('Fee name is required');
      return;
    }

    try {
      const payload: FeeStructureCreateRequest = {
        name: feeTitle,
        feeName: feeTitle,
        feeType: feeForm.feeType,
        amount: Number(feeForm.amount),
        frequency: feeForm.frequency || 'ANNUAL',
        academicYear: Number(feeForm.academicYear),
        description: feeForm.description,
        classId: feeForm.classId ? Number(feeForm.classId) : undefined,
      };

      if (editingFee) {
        await paymentApi.updateFeeStructure(editingFee.id, payload);
        success('Fee structure updated successfully!');
      } else {
        await paymentApi.createFeeStructure(payload);
        success('Fee structure created successfully!');
      }
      setIsFeeCreateOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to save fee structure.');
    }
  };

  const handleDeactivateFee = async (feeId: number) => {
    if (!window.confirm('Are you sure you want to deactivate this fee structure? Existing student assignments will remain intact.')) {
      return;
    }
    try {
      await paymentApi.deleteFeeStructure(feeId);
      success('Fee structure set to INACTIVE!');
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to deactivate fee structure.');
    }
  };

  const handleAssignFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee || !assignStudentId) {
      toastError('Please choose a student');
      return;
    }
    try {
      await paymentApi.assignFeeToStudent(selectedFee.id, {
        studentId: Number(assignStudentId),
        discountAmount: Number(discountAmount) || 0,
        discountReason: discountReason || undefined,
        dueDate: assignDueDate || undefined,
        notes: assignNotes || undefined,
      });
      success('Fee assigned to student successfully!');
      setIsAssignOpen(false);
      setDiscountAmount(0);
      setDiscountReason('');
      setAssignDueDate('');
      setAssignNotes('');
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Fee assignment failed.');
    }
  };

  const handleOpenStudentDetails = async (studentId: number) => {
    setLoadingStudentDetails(true);
    setStudentDetailsModal(null);
    try {
      const res = await paymentApi.getStudentBalance(studentId);
      if (res.data) {
        // Also fetch payments for this student
        const pRes = await paymentApi.listPayments({ studentId });
        setStudentDetailsModal({
          ...res.data,
          paymentsList: pRes.data || [],
        });
      }
    } catch (err: any) {
      toastError(err?.message || 'Could not retrieve student financial details.');
    } finally {
      setLoadingStudentDetails(false);
    }
  };

  // Filtered Lists
  const filteredPayments = payments.filter((p) => {
    if (!paymentSearch) return true;
    const q = paymentSearch.toLowerCase();
    return (
      p.paymentReference?.toLowerCase().includes(q) ||
      p.studentName?.toLowerCase().includes(q) ||
      p.studentIdNumber?.toLowerCase().includes(q)
    );
  });

  const filteredUnpaidAssignments = feeAssignments.filter((fa) => {
    const matchesSearch =
      !unpaidSearch ||
      fa.studentName?.toLowerCase().includes(unpaidSearch.toLowerCase()) ||
      fa.studentIdNumber?.toLowerCase().includes(unpaidSearch.toLowerCase()) ||
      fa.feeStructureName?.toLowerCase().includes(unpaidSearch.toLowerCase());

    const matchesStatus =
      unpaidStatusFilter === 'ALL'
        ? fa.feeStatus !== 'PAID' && fa.feeStatus !== 'WAIVED'
        : fa.feeStatus === unpaidStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredFeeStructures = feeStructures.filter((fee) => {
    const feeTitle = fee.name || fee.feeName || '';
    const matchesSearch =
      !feeStructureSearch ||
      feeTitle.toLowerCase().includes(feeStructureSearch.toLowerCase()) ||
      fee.feeType?.toLowerCase().includes(feeStructureSearch.toLowerCase());

    const matchesStatus =
      feeStructureStatusFilter === 'ALL' || fee.status === feeStructureStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="badge badge-success">PAID</span>;
      case 'PARTIALLY_PAID':
        return <span className="badge badge-warning">PARTIALLY PAID</span>;
      case 'OVERDUE':
        return <span className="badge badge-danger">OVERDUE</span>;
      case 'WAIVED':
        return <span className="badge badge-neutral">WAIVED</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Financial Operations & Fee Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Tuition ledgers, real-time student receivables, fee structure management & official receipts
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('payments')}
            className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <CreditCard size={14} />
            <span>Payments Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('unpaid')}
            className={`btn ${activeTab === 'unpaid' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <AlertCircle size={14} />
            <span>Unpaid & Outstanding Fees ({feeAssignments.filter(f => f.feeStatus !== 'PAID' && f.feeStatus !== 'WAIVED').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fee-structures')}
            className={`btn ${activeTab === 'fee-structures' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Layers size={14} />
            <span>Fee Structures</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PAYMENTS LEDGER */}
      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search receipts or student..."
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
              />
            </div>

            <button
              onClick={() => handleOpenRecordModal()}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-md)', gap: '0.4rem' }}
            >
              <Plus size={16} />
              <span>Record Offline Payment</span>
            </button>
          </div>

          <div className="table-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Loader2 size={24} className="animate-spin" color="var(--primary-500)" />
              </div>
            ) : filteredPayments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No payment transactions recorded yet. Click "Record Offline Payment".
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Receipt Ref</th>
                    <th>Student Name & ID</th>
                    <th>Payment Amount</th>
                    <th>Method</th>
                    <th>Date</th>
                    <th>Recorded By</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-400)' }}>
                        {p.paymentReference}
                      </td>
                      <td>
                        <button
                          onClick={() => handleOpenStudentDetails(p.studentId)}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--primary-400)', textDecoration: 'underline' }}>{p.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.studentIdNumber}</div>
                        </button>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--success-text)' }}>
                        LKR {Number(p.amount).toLocaleString()}
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{p.paymentDate}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.recordedByName || 'Finance'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setReceiptModal(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ gap: '0.35rem', padding: '0.35rem 0.65rem' }}
                          >
                            <Receipt size={14} />
                            <span>Receipt</span>
                          </button>
                          <button
                            onClick={() => handleOpenStudentDetails(p.studentId)}
                            className="btn btn-ghost btn-sm"
                            title="View Student Ledger"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: UNPAID & OUTSTANDING FEES */}
      {activeTab === 'unpaid' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Unpaid Filters & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search student or fee..."
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  value={unpaidSearch}
                  onChange={(e) => setUnpaidSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={15} color="var(--text-muted)" />
                <select
                  className="form-select"
                  value={unpaidStatusFilter}
                  onChange={(e) => setUnpaidStatusFilter(e.target.value)}
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Outstanding / Pending</option>
                  <option value="UNPAID">UNPAID Only</option>
                  <option value="PARTIALLY_PAID">PARTIALLY PAID Only</option>
                  <option value="OVERDUE">OVERDUE Only</option>
                </select>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Calculated Real Database Receivables
            </div>
          </div>

          <div className="table-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Loader2 size={24} className="animate-spin" color="var(--primary-500)" />
              </div>
            ) : filteredUnpaidAssignments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No pending or unpaid fee records match the selected filters.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name & ID</th>
                    <th>Fee Structure</th>
                    <th>Due Date</th>
                    <th>Assigned Amount</th>
                    <th>Discount</th>
                    <th>Total Paid</th>
                    <th>Outstanding Balance</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnpaidAssignments.map((fa) => (
                    <tr key={fa.id}>
                      <td>
                        <button
                          onClick={() => handleOpenStudentDetails(fa.studentId)}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--primary-400)', textDecoration: 'underline' }}>{fa.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fa.studentIdNumber} {fa.className ? `• ${fa.className}` : ''}</div>
                        </button>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{fa.feeStructureName}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{fa.feeType}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{fa.dueDate}</td>
                      <td style={{ fontWeight: 600 }}>LKR {Number(fa.assignedAmount).toLocaleString()}</td>
                      <td style={{ color: 'var(--text-muted)' }}>LKR {Number(fa.discountAmount || 0).toLocaleString()}</td>
                      <td style={{ color: 'var(--success-text)', fontWeight: 600 }}>LKR {Number(fa.totalPaid).toLocaleString()}</td>
                      <td style={{ fontWeight: 800, color: 'var(--danger-text)', fontSize: '0.95rem' }}>
                        LKR {Number(fa.outstandingBalance).toLocaleString()}
                      </td>
                      <td>{getStatusBadge(fa.feeStatus)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenRecordModal(fa.studentId, fa.id, fa.outstandingBalance)}
                            className="btn btn-primary btn-sm"
                            style={{ gap: '0.3rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            <CreditCard size={13} />
                            <span>Record Payment</span>
                          </button>
                          <button
                            onClick={() => handleOpenStudentDetails(fa.studentId)}
                            className="btn btn-secondary btn-sm"
                            title="Full Student Details"
                            style={{ padding: '0.3rem 0.5rem' }}
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FEE STRUCTURES MANAGEMENT */}
      {activeTab === 'fee-structures' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search fee structures..."
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  value={feeStructureSearch}
                  onChange={(e) => setFeeStructureSearch(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                value={feeStructureStatusFilter}
                onChange={(e) => setFeeStructureStatusFilter(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="ACTIVE">Active Fees Only</option>
                <option value="INACTIVE">Inactive Fees</option>
                <option value="ALL">All Fee Schedules</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreateFeeModal}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-md)', gap: '0.4rem' }}
            >
              <Plus size={16} />
              <span>Create Fee Structure</span>
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {filteredFeeStructures.map((fee) => {
              const title = fee.name || fee.feeName || 'Institutional Fee';
              const isActive = fee.status === 'ACTIVE';

              return (
                <div
                  key={fee.id}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.75rem',
                    opacity: isActive ? 1 : 0.65,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span className="badge badge-info">{fee.feeType}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fee.frequency || 'ANNUAL'}</span>
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                          {fee.status}
                        </span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                      {title}
                    </h3>

                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--success-text)', marginBottom: '0.5rem' }}>
                      LKR {Number(fee.amount).toLocaleString()}
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                      {fee.description || 'Standard institutional fee schedule for enrolled students.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {isActive && (
                      <button
                        onClick={() => {
                          setSelectedFee(fee);
                          setAssignStudentId('');
                          setDiscountAmount(0);
                          setDiscountReason('');
                          setIsAssignOpen(true);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', gap: '0.4rem' }}
                      >
                        <GraduationCap size={15} />
                        <span>Assign to Student</span>
                      </button>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEditFeeModal(fee)}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, gap: '0.35rem' }}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>

                      {isActive && (
                        <button
                          onClick={() => handleDeactivateFee(fee.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger-text)', gap: '0.35rem' }}
                          title="Deactivate Fee Structure"
                        >
                          <Trash2 size={13} />
                          <span>Deactivate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isRecordOpen && (
        <div className="modal-backdrop" onClick={() => setIsRecordOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Record Offline Student Payment</h3>
              <button onClick={() => setIsRecordOpen(false)} className="btn-ghost" style={{ border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit}>
              <div className="form-group">
                <label className="form-label">Select Student *</label>
                <select
                  required
                  className="form-select"
                  value={paymentForm.studentId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, studentId: Number(e.target.value) })}
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.studentIdNumber || `BFA-${s.id}`})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount (LKR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="form-input"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                  >
                    <option value="CASH">CASH</option>
                    <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                    <option value="CREDIT_CARD">CREDIT_CARD</option>
                    <option value="DEBIT_CARD">DEBIT_CARD</option>
                    <option value="CHEQUE">CHEQUE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Reference / Slip No.</label>
                  <input
                    type="text"
                    placeholder="e.g. TXN-98402"
                    className="form-input"
                    value={paymentForm.referenceNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes & Purpose</label>
                <input
                  type="text"
                  className="form-input"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsRecordOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Generate Official Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FEE STRUCTURE MODAL */}
      {isFeeCreateOpen && (
        <div className="modal-backdrop" onClick={() => setIsFeeCreateOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingFee ? 'Edit Fee Structure' : 'Create New Fee Structure'}
              </h3>
              <button onClick={() => setIsFeeCreateOpen(false)} className="btn-ghost" style={{ border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateFeeSubmit}>
              <div className="form-group">
                <label className="form-label">Fee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 1 Tuition Fee"
                  className="form-input"
                  value={feeForm.name || feeForm.feeName}
                  onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value, feeName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Fee Type</label>
                  <select
                    className="form-select"
                    value={feeForm.feeType}
                    onChange={(e) => setFeeForm({ ...feeForm, feeType: e.target.value })}
                  >
                    <option value="TUITION">TUITION</option>
                    <option value="REGISTRATION">REGISTRATION</option>
                    <option value="EXAM">EXAM</option>
                    <option value="LIBRARY">LIBRARY</option>
                    <option value="LAB">LAB</option>
                    <option value="TRANSPORT">TRANSPORT</option>
                    <option value="SPORTS">SPORTS</option>
                    <option value="UNIFORM">UNIFORM</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount (LKR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="form-input"
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({ ...feeForm, amount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-select"
                    value={feeForm.frequency || 'ANNUAL'}
                    onChange={(e) => setFeeForm({ ...feeForm, frequency: e.target.value })}
                  >
                    <option value="ONE_TIME">ONE_TIME</option>
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="QUARTERLY">QUARTERLY</option>
                    <option value="SEMI_ANNUAL">SEMI_ANNUAL</option>
                    <option value="ANNUAL">ANNUAL</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Year</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={feeForm.academicYear}
                    onChange={(e) => setFeeForm({ ...feeForm, academicYear: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Class (Optional)</label>
                <select
                  className="form-select"
                  value={feeForm.classId || ''}
                  onChange={(e) => setFeeForm({ ...feeForm, classId: e.target.value ? Number(e.target.value) : undefined })}
                >
                  <option value="">-- All Classes --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} ({c.gradeLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={feeForm.description}
                  onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsFeeCreateOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFee ? 'Update Fee Structure' : 'Save Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN FEE TO STUDENT MODAL */}
      {isAssignOpen && selectedFee && (
        <div className="modal-backdrop" onClick={() => setIsAssignOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Assign Fee to Student</h3>
              <button onClick={() => setIsAssignOpen(false)} className="btn-ghost" style={{ border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selected Fee Structure:</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-400)' }}>
                {selectedFee.name || selectedFee.feeName}
              </div>
              <div style={{ fontWeight: 800, color: 'var(--success-text)', marginTop: '0.2rem' }}>
                Standard Amount: LKR {Number(selectedFee.amount).toLocaleString()}
              </div>
            </div>

            <form onSubmit={handleAssignFeeSubmit}>
              <div className="form-group">
                <label className="form-label">Student *</label>
                <select
                  required
                  className="form-select"
                  value={assignStudentId}
                  onChange={(e) => setAssignStudentId(Number(e.target.value))}
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.studentIdNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Discount Amount (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="form-input"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date (Optional)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                  />
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="form-group">
                  <label className="form-label">Discount Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Merit Scholarship / Sibling Waiver"
                    className="form-input"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsAssignOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Fee Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT FINANCIAL DETAILS MODAL */}
      {(loadingStudentDetails || studentDetailsModal) && (
        <div className="modal-backdrop" onClick={() => setStudentDetailsModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', padding: '2rem' }}>
            {loadingStudentDetails ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Loader2 size={24} className="animate-spin" color="var(--primary-500)" />
              </div>
            ) : studentDetailsModal ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <span className="badge badge-info" style={{ marginBottom: '0.35rem' }}>Student Ledger Profile</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{studentDetailsModal.studentName}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Student ID: {studentDetailsModal.studentIdNumber}</p>
                  </div>
                  <button onClick={() => setStudentDetailsModal(null)} className="btn-ghost" style={{ border: 'none', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>

                {/* Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Assigned Fees</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>LKR {Number(studentDetailsModal.totalFees || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Paid</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success-text)' }}>LKR {Number(studentDetailsModal.totalPaid || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Balance</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger-text)' }}>LKR {Number(studentDetailsModal.outstandingBalance || 0).toLocaleString()}</div>
                  </div>
                </div>

                {/* Fee Assignments Breakdown */}
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Assigned Fee Structures</h4>
                <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                  <table className="data-table" style={{ fontSize: '0.825rem' }}>
                    <thead>
                      <tr>
                        <th>Fee Name</th>
                        <th>Assigned</th>
                        <th>Discount</th>
                        <th>Paid</th>
                        <th>Outstanding</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDetailsModal.feeDetails?.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center' }}>No fee structures assigned yet</td></tr>
                      ) : (
                        studentDetailsModal.feeDetails?.map((f: any) => (
                          <tr key={f.feeId}>
                            <td style={{ fontWeight: 600 }}>{f.feeName}</td>
                            <td>LKR {Number(f.assignedAmount).toLocaleString()}</td>
                            <td>LKR {Number(f.discount).toLocaleString()}</td>
                            <td style={{ color: 'var(--success-text)' }}>LKR {Number(f.paid).toLocaleString()}</td>
                            <td style={{ fontWeight: 700, color: 'var(--danger-text)' }}>LKR {Number(f.outstanding).toLocaleString()}</td>
                            <td>{getStatusBadge(f.status)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Payment History Receipts */}
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Recorded Payment Receipts</h4>
                <div className="table-container">
                  <table className="data-table" style={{ fontSize: '0.825rem' }}>
                    <thead>
                      <tr>
                        <th>Ref Number</th>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDetailsModal.paymentsList?.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center' }}>No payment receipts recorded yet</td></tr>
                      ) : (
                        studentDetailsModal.paymentsList?.map((p: PaymentResponse) => (
                          <tr key={p.id}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-400)' }}>{p.paymentReference}</td>
                            <td>{p.paymentDate}</td>
                            <td>{p.paymentMethod}</td>
                            <td style={{ fontWeight: 700, color: 'var(--success-text)' }}>LKR {Number(p.amount).toLocaleString()}</td>
                            <td>
                              <button
                                onClick={() => setReceiptModal(p)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                View Receipt
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL RECEIPT MODAL */}
      {receiptModal && (
        <div className="modal-backdrop" onClick={() => setReceiptModal(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', padding: '2.5rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '0.35rem' }}>Official Receipt</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>BRIGHT FUTURE ACADEMY</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Financial & Billing Audit System</div>
              </div>
              <button onClick={() => setReceiptModal(null)} className="btn-ghost" style={{ border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div
              id="printable-receipt-area"
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                lineHeight: 1.8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Receipt Reference:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>{receiptModal.paymentReference}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Date:</span>
                <span>{receiptModal.paymentDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Student Name:</span>
                <span style={{ fontWeight: 700 }}>{receiptModal.studentName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Student ID Number:</span>
                <span>{receiptModal.studentIdNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <span>{receiptModal.paymentMethod}</span>
              </div>
              {receiptModal.paymentReferenceNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Slip / Ref Number:</span>
                  <span>{receiptModal.paymentReferenceNumber}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recorded By Officer:</span>
                <span>{receiptModal.recordedByName || 'Administration'}</span>
              </div>
              {receiptModal.notes && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Notes:</span>
                  <span>{receiptModal.notes}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px dashed var(--border-medium)',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--success-text)',
                }}
              >
                <span>Total Amount Received:</span>
                <span>LKR {Number(receiptModal.amount).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Status: Verified & Stamped
              </span>
              <button
                onClick={() => window.print()}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem' }}
              >
                <Printer size={15} />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
