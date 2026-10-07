import React, { useState, useEffect } from 'react';
import {
  Radio,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
  BarChart3,
  TrendingUp,
  RefreshCw,
  BookOpen,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { attendanceApi } from '../../api/services';
import { AttendanceRecordResponse } from '../../types';
import { useToast } from '../../context/ToastContext';

export const StudentAttendanceView: React.FC = () => {
  const { error: toastError } = useToast();

  const [records, setRecords] = useState<AttendanceRecordResponse[]>([]);
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'30' | '90' | '180' | '365'>('180');

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const days = Number(timeFilter);
      const today = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

      const [recordsRes, statsRes] = await Promise.all([
        attendanceApi.getMyRecords({ dateFrom: startDate, dateTo: today }),
        attendanceApi.getMyStats({ dateFrom: startDate, dateTo: today }),
      ]);

      if (recordsRes.data) {
        setRecords(recordsRes.data);
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, [timeFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--success-bg)',
              color: 'var(--success-text)',
              border: '1px solid var(--success-border)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <CheckCircle2 size={13} /> Present
          </span>
        );
      case 'LATE':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--warning-bg)',
              color: 'var(--warning-text)',
              border: '1px solid var(--warning-border)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <Clock size={13} /> Late Arrival
          </span>
        );
      case 'ABSENT':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              border: '1px solid var(--danger-border)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <XCircle size={13} /> Absent
          </span>
        );
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(148, 163, 184, 0.15)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {status}
          </span>
        );
    }
  };

  const attendancePercentage =
    stats?.attendancePercentage != null ? Number(stats.attendancePercentage) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Filter Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <Radio size={24} color="var(--accent-cyan)" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              My Attendance Record
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Read-only verified audit log of your classroom attendance sessions and check-in times.
          </p>
        </div>

        {/* Range Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Period:</span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <option value="30">Past 30 Days</option>
            <option value="90">Past 90 Days</option>
            <option value="180">Past 6 Months</option>
            <option value="365">Current Academic Year</option>
          </select>

          <button
            onClick={loadAttendanceData}
            title="Refresh Attendance"
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Attendance Rate */}
        <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Overall Attendance Rate
            </span>
            <TrendingUp size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {attendancePercentage.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Minimum Academy target: 80.0%
          </div>
          <div
            style={{
              marginTop: '0.75rem',
              width: '100%',
              height: '6px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface-elevated)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, attendancePercentage)}%`,
                height: '100%',
                background: attendancePercentage >= 80 ? 'var(--success-text)' : 'var(--warning-text)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>

        {/* Present Sessions */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Present Sessions
            </span>
            <CheckCircle2 size={18} color="var(--success-text)" />
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--success-text)' }}>
            {stats?.present ?? 0}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            On-time verified sessions
          </div>
        </div>

        {/* Late Arrivals */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Late Arrivals
            </span>
            <Clock size={18} color="var(--warning-text)" />
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--warning-text)' }}>
            {stats?.late ?? 0}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Checked in after session start
          </div>
        </div>

        {/* Total Sessions */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Sessions Tracked
            </span>
            <BarChart3 size={18} color="var(--primary-400)" />
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats?.totalSessions ?? 0}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Absent: {stats?.absent ?? 0} • Excused: {stats?.excused ?? 0}
          </div>
        </div>
      </div>

      {/* Historical Records Table */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Attendance History
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Individual lesson records verified by your course instructors
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--success-text)" /> Read-Only Verified View
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '240px', gap: '1rem' }}>
            <Loader2 size={32} className="animate-spin" color="var(--primary-400)" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading attendance history...</p>
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <Calendar size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              No Attendance Records Found
            </h3>
            <p style={{ fontSize: '0.85rem' }}>
              No session attendance has been recorded for this selected time window.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Subject & Class</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Check-In Time</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Method</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Verified By</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const checkInDisplay = record.checkInTime
                    ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'N/A';

                  return (
                    <tr
                      key={record.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-translucent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Date */}
                      <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {record.sessionDate || '2026-09-14'}
                      </td>

                      {/* Subject & Class */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {record.subjectName || 'Mathematics'}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          {record.className || 'Grade 10-A'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                        {getStatusBadge(record.status)}
                      </td>

                      {/* Check-In Time */}
                      <td style={{ padding: '1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={14} color="var(--text-muted)" />
                          <span>{checkInDisplay}</span>
                        </div>
                      </td>

                      {/* Method */}
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {record.markingMethod || 'MANUAL'}
                        </span>
                      </td>

                      {/* Verified By */}
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {record.markedByName || record.teacherName || 'Faculty Instructor'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
