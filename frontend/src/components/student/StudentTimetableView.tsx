import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Building,
  Layers,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { academicApi } from '../../api/services';
import { TimetableResponse } from '../../types';
import { useToast } from '../../context/ToastContext';

const DAYS_OF_WEEK = [
  'ALL',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export const StudentTimetableView: React.FC = () => {
  const { error: toastError } = useToast();

  const [timetables, setTimetables] = useState<TimetableResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>('ALL');

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const res = await academicApi.getMyTimetable();
      if (res.data) {
        setTimetables(res.data);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to load timetable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, []);

  const filteredTimetables =
    selectedDay === 'ALL'
      ? timetables
      : timetables.filter((t) => t.dayOfWeek.toUpperCase() === selectedDay);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      const parts = timeStr.split(':');
      const hour = parseInt(parts[0], 10);
      const min = parts[1] || '00';
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${min} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
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
            <Calendar size={24} color="var(--primary-400)" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              My Class Timetable
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Weekly scheduled lectures, faculty instructors, and assigned campus classrooms.
          </p>
        </div>

        <button
          onClick={loadTimetable}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} /> Refresh Schedule
        </button>
      </div>

      {/* Day Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {DAYS_OF_WEEK.map((day) => {
          const isActive = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: isActive ? 'var(--primary-500)' : 'var(--border-subtle)',
                background: isActive ? 'var(--primary-600)' : 'var(--bg-surface)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              {day === 'ALL' ? 'Full Week' : day.charAt(0) + day.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      {/* Schedule Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
          <Loader2 size={36} className="animate-spin" color="var(--primary-400)" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>Loading class schedule...</p>
        </div>
      ) : filteredTimetables.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={44} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            No Classes Scheduled
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            There are no timetable sessions recorded for {selectedDay === 'ALL' ? 'the selected academic calendar' : selectedDay.toLowerCase()}.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredTimetables.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                borderLeft: '4px solid var(--primary-500)',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              }}
            >
              <div>
                {/* Day & Time Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--primary-400)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.dayOfWeek}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <Clock size={14} color="var(--accent-cyan)" />
                    <span>
                      {formatTime(item.startTime)} – {formatTime(item.endTime)}
                    </span>
                  </div>
                </div>

                {/* Subject Title */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {item.subjectName}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Class: {item.className}
                </div>
              </div>

              {/* Faculty & Location Meta */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                  <User size={15} color="var(--primary-400)" style={{ marginTop: '0.15rem' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Teacher</div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.teacherName}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                  <Building size={15} color="var(--accent-cyan)" style={{ marginTop: '0.15rem' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Classroom</div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.classroomName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
