import React, { useState, useEffect } from 'react';
import {
  Building,
  MapPin,
  Users,
  AirVent,
  Tv,
  Layers,
  Search,
  Loader2,
  RefreshCw,
  AlertCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { academicApi } from '../../api/services';
import { ClassroomResponse, TimetableResponse } from '../../types';
import { useToast } from '../../context/ToastContext';

interface StudentClassroomCard {
  classroom: ClassroomResponse;
  sessions: TimetableResponse[];
}

export const StudentClassroomsView: React.FC = () => {
  const { error: toastError } = useToast();

  const [rooms, setRooms] = useState<ClassroomResponse[]>([]);
  const [timetables, setTimetables] = useState<TimetableResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsRes, timeRes] = await Promise.all([
        academicApi.listClassrooms({ size: 50 }),
        academicApi.getMyTimetable(),
      ]);

      if (roomsRes.data) {
        setRooms(roomsRes.data);
      }
      if (timeRes.data) {
        setTimetables(timeRes.data);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to load classroom information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      (r.name && r.name.toLowerCase().includes(search.toLowerCase())) ||
      (r.building && r.building.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === 'ALL' || r.roomType === filterType;
    return matchesSearch && matchesType;
  });

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
            <Building size={24} color="var(--accent-cyan)" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Campus Classrooms & Facilities
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Explore assigned lecture halls, specialized science/computer laboratories, and seminar rooms.
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} /> Refresh Rooms
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search room number, building, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem 0.6rem 2.4rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Type:</span>
          {['ALL', 'GENERAL', 'LAB', 'SEMINAR_ROOM'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: filterType === t ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                background: filterType === t ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-surface)',
                color: filterType === t ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {t === 'ALL' ? 'All Types' : t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Classroom Cards Grid */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
          <Loader2 size={36} className="animate-spin" color="var(--accent-cyan)" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>Loading campus classrooms...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Building size={44} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            No Classrooms Matched
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            Try adjusting your search criteria or room type filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredRooms.map((room) => {
            const scheduledSessions = timetables.filter(
              (t) =>
                t.classroomId === room.id ||
                t.classroomName.toLowerCase().includes(room.roomNumber.toLowerCase())
            );

            return (
              <div
                key={room.id}
                className="glass-card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(6, 182, 212, 0.15)',
                        color: 'var(--accent-cyan)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                      }}
                    >
                      {room.roomNumber}
                    </span>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        background: room.status === 'AVAILABLE' ? 'var(--success-bg)' : 'rgba(255, 255, 255, 0.08)',
                        color: room.status === 'AVAILABLE' ? 'var(--success-text)' : 'var(--text-muted)',
                        border: `1px solid ${room.status === 'AVAILABLE' ? 'var(--success-border)' : 'var(--border-subtle)'}`,
                      }}
                    >
                      {room.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {room.name || `Room ${room.roomNumber}`}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} color="var(--primary-400)" />
                    <span>
                      {room.building || 'Main Campus'} • Floor {room.floor || 1}
                    </span>
                  </div>
                </div>

                {/* Facilities & Capacity */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={14} /> Seating Capacity
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {room.capacity} Students
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Room Classification</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {room.roomType.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Scheduled class session for student if any */}
                  {scheduledSessions.length > 0 && (
                    <div
                      style={{
                        marginTop: '0.35rem',
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Your Scheduled Lectures Here:
                      </div>
                      {scheduledSessions.map((s) => (
                        <div key={s.id} style={{ fontSize: '0.775rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{s.subjectName} ({s.dayOfWeek.slice(0, 3)})</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
