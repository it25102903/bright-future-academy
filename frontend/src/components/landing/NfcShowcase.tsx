import React, { useState } from 'react';
import { Radio, CheckCircle2, AlertTriangle, Clock, ShieldAlert, Zap } from 'lucide-react';

export const NfcShowcase: React.FC = () => {
  const [tapState, setTapState] = useState<'idle' | 'detected' | 'duplicate' | 'late'>('idle');
  const [recentLogs, setRecentLogs] = useState([
    { id: 'BFA-2026-0001', name: 'Kamal Bandara', time: '08:02:14 AM', status: 'PRESENT', method: 'NFC_TAP' },
    { id: 'BFA-2026-0002', name: 'Nimali Rajapaksha', time: '08:04:45 AM', status: 'PRESENT', method: 'NFC_TAP' },
    { id: 'BFA-2026-0003', name: 'Ashan Gunasekara', time: '08:21:10 AM', status: 'LATE', method: 'NFC_TAP' },
  ]);

  const triggerDemoTap = (type: 'PRESENT' | 'DUPLICATE' | 'LATE') => {
    if (type === 'DUPLICATE') {
      setTapState('duplicate');
      setTimeout(() => setTapState('idle'), 2500);
      return;
    }

    if (type === 'LATE') {
      setTapState('late');
      const now = new Date().toLocaleTimeString();
      setRecentLogs((prev) => [
        { id: 'BFA-2026-0005', name: 'Tharaka Dissanayake', time: now, status: 'LATE', method: 'NFC_TAP' },
        ...prev.slice(0, 4),
      ]);
      setTimeout(() => setTapState('idle'), 2500);
      return;
    }

    setTapState('detected');
    const now = new Date().toLocaleTimeString();
    setRecentLogs((prev) => [
      { id: 'BFA-2026-0004', name: 'Sachini Weerasinghe', time: now, status: 'PRESENT', method: 'NFC_TAP' },
      ...prev.slice(0, 4),
    ]);
    setTimeout(() => setTapState('idle'), 2500);
  };

  return (
    <section
      id="nfc"
      style={{
        padding: '6rem 2rem',
        maxWidth: '1240px',
        margin: '0 auto',
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: 'clamp(2rem, 5vw, 4rem)',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="ambient-glow"
          style={{ top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)' }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left Column: Explanation */}
          <div>
            <div
              className="badge badge-info"
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                marginBottom: '1.25rem',
              }}
            >
              <Radio size={15} />
              <span>NFC Hardware Attendance Architecture</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '1rem',
                lineHeight: 1.2,
              }}
            >
              Contactless NFC Campus Verification
            </h2>

            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '1.05rem',
                lineHeight: 1.65,
                marginBottom: '2rem',
              }}
            >
              Bright Future Academy connects classroom attendance sessions with smart student NFC
              credentials. Each physical tap maps the card UID securely to active enrollments,
              enforcing duplicate tap rejection and real-time arrival logging.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <Zap size={20} color="var(--accent-cyan)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Instant Session Check-In</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Taps are recorded with millisecond-accurate timestamps against the active classroom session.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <ShieldAlert size={20} color="var(--warning-text)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Duplicate Tap Guard</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Multiple taps within the same class period are rejected to avoid duplicate attendance records.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <Clock size={20} color="var(--primary-400)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Punctuality & Late Flagging</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Students arriving past the session grace period are automatically marked as LATE.
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Simulation Controls */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Simulate NFC Terminal Tap:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  onClick={() => triggerDemoTap('PRESENT')}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: 'var(--radius-full)', gap: '0.4rem' }}
                >
                  <CheckCircle2 size={14} color="var(--success-text)" />
                  <span>Valid Tap (Present)</span>
                </button>
                <button
                  onClick={() => triggerDemoTap('LATE')}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: 'var(--radius-full)', gap: '0.4rem' }}
                >
                  <Clock size={14} color="var(--warning-text)" />
                  <span>Late Tap (Grace Exceeded)</span>
                </button>
                <button
                  onClick={() => triggerDemoTap('DUPLICATE')}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: 'var(--radius-full)', gap: '0.4rem' }}
                >
                  <AlertTriangle size={14} color="var(--danger-text)" />
                  <span>Duplicate Tap</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Terminal Visualizer */}
          <div
            className="glass-card"
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Terminal Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 10px #10b981',
                  }}
                />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  NFC Terminal #01 (Room 101)
                </span>
              </div>
              <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
                ONLINE
              </span>
            </div>

            {/* Card Tap Reader Surface */}
            <div
              style={{
                padding: '2rem 1.5rem',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                border: '2px dashed var(--border-medium)',
                marginBottom: '1.5rem',
                background:
                  tapState === 'detected'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : tapState === 'late'
                    ? 'rgba(245, 158, 11, 0.12)'
                    : tapState === 'duplicate'
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'var(--glass-bg)',
                transition: 'all 0.3s ease',
              }}
            >
              <Radio
                size={40}
                color={
                  tapState === 'detected'
                    ? 'var(--success-text)'
                    : tapState === 'late'
                    ? 'var(--warning-text)'
                    : tapState === 'duplicate'
                    ? 'var(--danger-text)'
                    : 'var(--accent-cyan)'
                }
                style={{ marginBottom: '0.75rem' }}
              />

              {tapState === 'idle' && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    Reader Ready — Tap Student Card
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    13.56 MHz ISO/IEC 14443 Type A
                  </div>
                </div>
              )}

              {tapState === 'detected' && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--success-text)' }}>
                    Attendance Recorded: PRESENT
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    Sachini Weerasinghe (BFA-2026-0004)
                  </div>
                </div>
              )}

              {tapState === 'late' && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--warning-text)' }}>
                    Late Check-in Recorded (+15m)
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    Tharaka Dissanayake (BFA-2026-0005)
                  </div>
                </div>
              )}

              {tapState === 'duplicate' && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--danger-text)' }}>
                    Duplicate Tap Rejected!
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Card already verified for this session
                  </div>
                </div>
              )}
            </div>

            {/* Live Terminal Log */}
            <div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  letterSpacing: '0.05em',
                }}
              >
                Recent Terminal Logs
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentLogs.map((log, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.825rem',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.name}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                        {log.id}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.time}</span>
                      <span
                        className={`badge ${
                          log.status === 'PRESENT' ? 'badge-success' : 'badge-warning'
                        }`}
                        style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}
                      >
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
