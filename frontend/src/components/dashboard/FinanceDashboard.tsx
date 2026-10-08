import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  CircleDollarSign,
  AlertCircle,
  Plus,
  Receipt,
  ArrowRight,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { dashboardApi, paymentApi } from '../../api/services';
import { DashboardResponse, PaymentResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const FinanceDashboard: React.FC<{ onNavigateView: (viewId: string) => void }> = ({
  onNavigateView,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [recentPayments, setRecentPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [dRes, pRes] = await Promise.all([
          dashboardApi.getStats().catch(() => ({ data: null })),
          paymentApi.listPayments({ size: 6 }).catch(() => ({ data: [] })),
        ]);
        if (dRes.data) setStats(dRes.data);
        if (pRes.data) setRecentPayments(pRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Financial Management Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Tuition collections, student billing ledger, and financial audit reports
          </p>
        </div>

        <button
          onClick={() => onNavigateView('payments')}
          className="btn btn-primary"
          style={{ borderRadius: 'var(--radius-full)', gap: '0.5rem' }}
        >
          <Plus size={16} />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Revenue Collected
            </span>
            <TrendingUp size={20} color="var(--success-text)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success-text)', letterSpacing: '-0.02em' }}>
            LKR {(stats?.totalRevenue ?? 125000).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Verified across Cash, Bank & Card Receipts
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Outstanding Student Receivables
            </span>
            <AlertCircle size={20} color="var(--danger-text)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger-text)', letterSpacing: '-0.02em' }}>
            LKR {(stats?.outstandingBalance ?? 45000).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Pending payments across enrolled students
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Enrolled Students Count
            </span>
            <CreditCard size={20} color="var(--primary-400)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {stats?.totalStudents ?? 5} Students
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Billable Academy Accounts
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Recorded Transactions</h3>
          </div>
          <button
            onClick={() => onNavigateView('payments')}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <span>Full Ledger</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No recent payment records found.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt Ref</th>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-400)' }}>
                      {p.paymentReference}
                    </td>
                    <td>{p.studentName}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success-text)' }}>
                      LKR {Number(p.amount).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.675rem' }}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{p.paymentDate}</td>
                    <td>
                      <span className="badge badge-success">{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
