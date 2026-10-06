import React, { useEffect, useState } from 'react';
import {
  HeartHandshake,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Users,
  Copy,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  Edit2,
  Trash2,
  ShieldCheck,
  UserPlus,
  BookOpen,
} from 'lucide-react';
import { parentApi, studentApi } from '../../api/services';
import {
  ParentResponse,
  ParentCreateRequest,
  ParentUpdateRequest,
  StudentResponse,
  LinkedChildSummary,
} from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const ParentManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const { success, error: toastError } = useToast();

  const [parents, setParents] = useState<ParentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Students for selection
  const [availableStudents, setAvailableStudents] = useState<StudentResponse[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isManageChildrenOpen, setIsManageChildrenOpen] = useState(false);
  const [activeParent, setActiveParent] = useState<ParentResponse | null>(null);

  // Submitting states
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Unlink confirmation
  const [childToUnlink, setChildToUnlink] = useState<LinkedChildSummary | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);

  // Selected student to add in Manage Children modal
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState<number | ''>('');
  const [isLinkingChild, setIsLinkingChild] = useState(false);

  // Newly created credentials display
  const [createdCredentials, setCreatedCredentials] = useState<{
    fullName: string;
    email: string;
    temporaryPassword: string;
    linkedChildrenNames: string[];
  } | null>(null);

  // Create form state
  const [formData, setFormData] = useState<ParentCreateRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    relationship: 'FATHER',
    password: 'Password@123',
    nicNumber: '',
    occupation: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Colombo',
    district: 'Colombo',
    postalCode: '',
    studentIds: [],
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState<ParentUpdateRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    relationship: 'PARENT',
    nicNumber: '',
    occupation: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: '',
  });

  // Fetch parents list
  const fetchParents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await parentApi.list({
        search: search.trim() || undefined,
        status: status || undefined,
        page,
        size: 10,
      });
      if (res.data) {
        setParents(res.data);
      }
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setTotalElements(res.pagination.totalElements || 0);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve parents from backend.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available students for linking
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await studentApi.list({ size: 100, status: 'ACTIVE' });
      if (res.data) {
        setAvailableStudents(res.data);
      }
    } catch {
      // non-fatal
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, [page, status]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchParents();
  };

  const handleStatusToggle = async (parent: ParentResponse) => {
    const nextStatus = parent.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await parentApi.updateStatus(parent.id, nextStatus);
      success(`Updated status of ${parent.fullName} to ${nextStatus}`);
      fetchParents();
    } catch (err: any) {
      toastError(err?.message || 'Status update failed.');
    }
  };

  // Student selection in Create modal
  const toggleStudentSelection = (studentId: number) => {
    const currentIds = formData.studentIds || [];
    if (currentIds.includes(studentId)) {
      setFormData({
        ...formData,
        studentIds: currentIds.filter((id) => id !== studentId),
      });
    } else {
      setFormData({
        ...formData,
        studentIds: [...currentIds, studentId],
      });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toastError('Please fill in all required parent profile fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await parentApi.create(formData);
      const created = res.data;
      success('Parent account created successfully in MySQL with ROLE_PARENT!');
      setIsCreateOpen(false);

      // Resolve linked children names for success credential banner
      const linkedNames = (formData.studentIds || []).map((id) => {
        const found = availableStudents.find((s) => s.id === id);
        return found ? `${found.fullName} (${found.studentIdNumber})` : `Student #${id}`;
      });

      setCreatedCredentials({
        fullName: created?.fullName || `${formData.firstName} ${formData.lastName}`,
        email: created?.email || formData.email,
        temporaryPassword: formData.password || 'Password@123',
        linkedChildrenNames: linkedNames,
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        relationship: 'FATHER',
        password: 'Password@123',
        nicNumber: '',
        occupation: '',
        addressLine1: '',
        addressLine2: '',
        city: 'Colombo',
        district: 'Colombo',
        postalCode: '',
        studentIds: [],
      });
      setStudentSearchQuery('');
      fetchParents();
    } catch (err: any) {
      const msg = err?.message || 'Failed to create parent account.';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (parent: ParentResponse) => {
    setActiveParent(parent);
    setEditFormData({
      firstName: parent.firstName,
      lastName: parent.lastName,
      phone: parent.phone,
      relationship: parent.relationship || 'PARENT',
      nicNumber: parent.nicNumber || '',
      occupation: parent.occupation || '',
      addressLine1: parent.addressLine1 || '',
      addressLine2: parent.addressLine2 || '',
      city: parent.city || '',
      district: parent.district || '',
      postalCode: parent.postalCode || '',
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeParent) return;

    setSubmitting(true);
    try {
      await parentApi.update(activeParent.id, editFormData);
      success('Parent details updated successfully!');
      setIsEditOpen(false);
      setActiveParent(null);
      fetchParents();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update parent details.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Manage Children Modal
  const openManageChildrenModal = (parent: ParentResponse) => {
    setActiveParent(parent);
    setSelectedStudentToAdd('');
    setChildToUnlink(null);
    setIsManageChildrenOpen(true);
  };

  // Link Child
  const handleLinkChild = async () => {
    if (!activeParent || !selectedStudentToAdd) return;
    setIsLinkingChild(true);
    try {
      const res = await parentApi.linkChild(activeParent.id, Number(selectedStudentToAdd));
      success('Child linked to parent successfully!');
      if (res.data) {
        setActiveParent(res.data);
      }
      setSelectedStudentToAdd('');
      fetchParents();
    } catch (err: any) {
      toastError(err?.message || 'Failed to link child.');
    } finally {
      setIsLinkingChild(false);
    }
  };

  // Unlink Child Confirmation & Execution
  const handleUnlinkChildConfirm = async () => {
    if (!activeParent || !childToUnlink) return;
    setIsUnlinking(true);
    try {
      const res = await parentApi.unlinkChild(activeParent.id, childToUnlink.id);
      success(`Removed link to ${childToUnlink.fullName}. Student account remains safe.`);
      if (res.data) {
        setActiveParent(res.data);
      }
      setChildToUnlink(null);
      fetchParents();
    } catch (err: any) {
      toastError(err?.message || 'Failed to remove child link.');
    } finally {
      setIsUnlinking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2500);
  };

  // Filter available students for search box in modal
  const filteredStudents = availableStudents.filter((s) => {
    const q = studentSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.studentIdNumber.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Parent & Guardian Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Create real login accounts for parents, configure guardian profiles, and link enrolled student children
          </p>
        </div>

        {hasRole('ADMINISTRATOR') && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-md)', gap: '0.5rem' }}
          >
            <UserPlus size={18} />
            <span>Create Parent Account</span>
          </button>
        )}
      </div>

      {/* Success Banner: Newly Created Credentials */}
      {createdCredentials && (
        <div
          className="dash-glass-card"
          style={{
            padding: '1.5rem',
            borderLeft: '4px solid #10b981',
            background: 'rgba(16, 185, 129, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CheckCircle2 size={20} color="#10b981" />
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                Parent Account Created Successfully
              </span>
            </div>
            <button
              onClick={() => setCreatedCredentials(null)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.25rem 0.5rem' }}
            >
              <X size={14} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              background: 'var(--bg-card)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Parent Name</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{createdCredentials.fullName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Login Email</div>
              <div style={{ fontWeight: 600, color: '#38bdf8' }}>{createdCredentials.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Temporary Password</div>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                {createdCredentials.temporaryPassword}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Linked Children</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {createdCredentials.linkedChildrenNames.length > 0
                  ? createdCredentials.linkedChildrenNames.join(', ')
                  : 'None assigned yet'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() =>
                copyToClipboard(
                  `Bright Future Academy - Parent Portal Login\nParent: ${createdCredentials.fullName}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.temporaryPassword}\nLogin Portal: ${window.location.origin}`
                )
              }
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem', borderRadius: 'var(--radius-sm)' }}
            >
              {copiedCredentials ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copiedCredentials ? 'Copied to Clipboard!' : 'Copy Parent Credentials'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="dash-glass-card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search parent by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ padding: '0 1rem' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="form-control"
            style={{ width: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Parents Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Loader2 size={26} className="animate-spin" color="var(--primary-500)" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-text)' }}>
            <AlertCircle size={28} style={{ margin: '0 auto 0.5rem' }} />
            <div>{error}</div>
            <button onClick={fetchParents} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        ) : parents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
            <HeartHandshake size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <div>No parent accounts found matching your query.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Parent Name & Relationship</th>
                <th>Login Email & Phone</th>
                <th>Linked Children</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parents.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(236, 72, 153, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ec4899',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        {p.firstName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.fullName}</div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(236, 72, 153, 0.1)',
                              color: '#ec4899',
                              fontSize: '0.7rem',
                              padding: '0.15rem 0.45rem',
                            }}
                          >
                            {p.relationship || 'PARENT'}
                          </span>
                          {p.occupation && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              • {p.occupation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <Mail size={13} color="var(--text-muted)" />
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>{p.email}</span>
                      </div>
                      {p.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <Phone size={13} />
                          <span>{p.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {p.linkedChildren && p.linkedChildren.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {p.linkedChildren.map((child) => (
                          <div
                            key={child.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              padding: '0.25rem 0.55rem',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(16, 185, 129, 0.08)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              fontSize: '0.775rem',
                              maxWidth: 'fit-content',
                            }}
                          >
                            <Users size={12} color="#10b981" />
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{child.fullName}</span>
                            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              ({child.studentIdNumber})
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No children linked
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: p.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: p.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                        fontWeight: 600,
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => openManageChildrenModal(p)}
                        className="btn btn-secondary btn-sm"
                        title="Manage linked children"
                        style={{ gap: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                      >
                        <Users size={14} color="#10b981" />
                        <span>Children ({p.linkedChildrenCount})</span>
                      </button>

                      <button
                        onClick={() => openEditModal(p)}
                        className="btn btn-secondary btn-sm"
                        title="Edit parent details"
                        style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        onClick={() => handleStatusToggle(p)}
                        className={`btn ${p.status === 'ACTIVE' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                        title={p.status === 'ACTIVE' ? 'Deactivate parent' : 'Activate parent'}
                        style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                      >
                        {p.status === 'ACTIVE' ? <XCircle size={14} color="#ef4444" /> : <CheckCircle2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {parents.length} of {totalElements} parent profiles
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: CREATE PARENT MODAL WITH CHILD SELECTION
          ========================================================================= */}
      {isCreateOpen && (
        <div className="modal-backdrop">
          <div
            className="modal-container"
            style={{ maxWidth: '680px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(236, 72, 153, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ec4899',
                  }}
                >
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Register Parent Account
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Creates a real authenticated user account with ROLE_PARENT and links children
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Account Credentials */}
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <KeyRound size={16} color="#38bdf8" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    Login Credentials (MySQL User Account)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-label">
                      Login Email <span style={{ color: 'var(--danger-text)' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. parent@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Temporary Password <span style={{ color: 'var(--danger-text)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="form-control"
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label">
                    First Name <span style={{ color: 'var(--danger-text)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunil"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Last Name <span style={{ color: 'var(--danger-text)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bandara"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Phone Number <span style={{ color: 'var(--danger-text)' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+94 77 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div>
                  <label className="form-label">Relationship to Student(s)</label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="form-control"
                  >
                    <option value="FATHER">Father</option>
                    <option value="MOTHER">Mother</option>
                    <option value="GUARDIAN">Legal Guardian</option>
                    <option value="PARENT">Parent</option>
                  </select>
                </div>
              </div>

              {/* Optional Demographics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label">NIC / National ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 198012345678"
                    value={formData.nicNumber || ''}
                    onChange={(e) => setFormData({ ...formData, nicNumber: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div>
                  <label className="form-label">Occupation</label>
                  <input
                    type="text"
                    placeholder="e.g. Civil Engineer"
                    value={formData.occupation || ''}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Colombo"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Child Assignment Multi-Selector */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} color="#10b981" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      Assign Student Child / Children
                    </span>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: (formData.studentIds || []).length > 0 ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                      color: (formData.studentIds || []).length > 0 ? '#10b981' : 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {(formData.studentIds || []).length} child(ren) selected
                  </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Select one or more existing student records from the academy database to link with this parent account.
                </p>

                {/* Filter input */}
                <input
                  type="text"
                  placeholder="Filter available students by name or student ID..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}
                />

                {/* Scrollable Student Selection List */}
                <div
                  style={{
                    maxHeight: '180px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                  }}
                >
                  {loadingStudents ? (
                    <div style={{ padding: '1rem', textAlign: 'center' }}>
                      <Loader2 size={18} className="animate-spin" color="var(--primary-500)" />
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No matching students found in directory.
                    </div>
                  ) : (
                    filteredStudents.map((student) => {
                      const isSelected = (formData.studentIds || []).includes(student.id);
                      return (
                        <div
                          key={student.id}
                          onClick={() => toggleStudentSelection(student.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 0.85rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            transition: 'background var(--transition-fast)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by row click
                              style={{ cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                {student.fullName}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {student.studentIdNumber} • {student.email}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                              Selected ✓
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ minWidth: '160px', gap: '0.5rem' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Create Parent Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EDIT PARENT MODAL
          ========================================================================= */}
      {isEditOpen && activeParent && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: '580px', width: '90%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Edit Parent: {activeParent.fullName}
              </h3>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setActiveParent(null);
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div>
                  <label className="form-label">Relationship</label>
                  <select
                    value={editFormData.relationship}
                    onChange={(e) => setEditFormData({ ...editFormData, relationship: e.target.value })}
                    className="form-control"
                  >
                    <option value="FATHER">Father</option>
                    <option value="MOTHER">Mother</option>
                    <option value="GUARDIAN">Legal Guardian</option>
                    <option value="PARENT">Parent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label">NIC Number</label>
                  <input
                    type="text"
                    value={editFormData.nicNumber || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nicNumber: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div>
                  <label className="form-label">Occupation</label>
                  <input
                    type="text"
                    value={editFormData.occupation || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Address Line 1</label>
                <input
                  type="text"
                  value={editFormData.addressLine1 || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, addressLine1: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setActiveParent(null);
                  }}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: MANAGE CHILDREN MODAL (LINK / UNLINK)
          ========================================================================= */}
      {isManageChildrenOpen && activeParent && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: '620px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Linked Children: {activeParent.fullName}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Manage family student associations for {activeParent.email}
                </div>
              </div>
              <button
                onClick={() => {
                  setIsManageChildrenOpen(false);
                  setActiveParent(null);
                  setChildToUnlink(null);
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Unlink Confirmation Prompt */}
              {childToUnlink && (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 700 }}>
                    <AlertCircle size={18} />
                    <span>Confirm Child Unlinking</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
                    Are you sure you want to remove <strong>{childToUnlink.fullName}</strong> from {activeParent.fullName}?
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ✓ This removes <strong>ONLY the parent-student link</strong>. The student account, attendance, exams, and payment records remain completely safe.
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setChildToUnlink(null)}
                      className="btn btn-secondary btn-sm"
                      disabled={isUnlinking}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUnlinkChildConfirm}
                      className="btn btn-danger btn-sm"
                      disabled={isUnlinking}
                      style={{ gap: '0.35rem' }}
                    >
                      {isUnlinking ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      <span>Confirm Remove Link</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Current Linked Children List */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Currently Linked Children ({activeParent.linkedChildren?.length || 0})
                </h4>

                {(!activeParent.linkedChildren || activeParent.linkedChildren.length === 0) ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-muted)',
                      fontSize: '0.875rem',
                    }}
                  >
                    No children currently linked to this parent account.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {activeParent.linkedChildren.map((ch) => (
                      <div
                        key={ch.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          background: 'var(--bg-card)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Users size={16} color="#10b981" />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                              {ch.fullName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              ID: {ch.studentIdNumber} {ch.currentClass ? `• Class: ${ch.currentClass}` : ''}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setChildToUnlink(ch)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444', gap: '0.3rem', borderRadius: 'var(--radius-sm)' }}
                          title="Unlink child"
                        >
                          <Trash2 size={13} />
                          <span>Remove Link</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Another Child Section */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  + Link Another Student
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <select
                    value={selectedStudentToAdd}
                    onChange={(e) => setSelectedStudentToAdd(e.target.value ? Number(e.target.value) : '')}
                    className="form-control"
                    style={{ flex: 1, minWidth: '220px' }}
                  >
                    <option value="">Select an active student...</option>
                    {availableStudents
                      .filter(
                        (s) =>
                          !activeParent.linkedChildren?.some((linked) => linked.id === s.id)
                      )
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.studentIdNumber})
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={handleLinkChild}
                    disabled={!selectedStudentToAdd || isLinkingChild}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.4rem', borderRadius: 'var(--radius-md)' }}
                  >
                    {isLinkingChild ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    <span>Link Student</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
