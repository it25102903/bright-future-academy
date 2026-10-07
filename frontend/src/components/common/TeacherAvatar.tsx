import React, { useState } from 'react';
import { User } from 'lucide-react';

interface TeacherAvatarProps {
  photoUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  style?: React.CSSProperties;
  className?: string;
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  photoUrl,
  name,
  size = 'md',
  style,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  // Size mapping
  const sizeMap = {
    sm: { dimension: 32, fontSize: '0.75rem', iconSize: 16 },
    md: { dimension: 42, fontSize: '0.9rem', iconSize: 20 },
    lg: { dimension: 56, fontSize: '1.15rem', iconSize: 26 },
    xl: { dimension: 88, fontSize: '1.75rem', iconSize: 40 },
    '2xl': { dimension: 120, fontSize: '2.5rem', iconSize: 56 },
  };

  const { dimension, fontSize, iconSize } = sizeMap[size] || sizeMap.md;

  // Extract initials
  const getInitials = (str: string) => {
    if (!str) return 'T';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const hasValidPhoto = photoUrl && !imgError;

  return (
    <div
      className={`teacher-avatar ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        minWidth: `${dimension}px`,
        minHeight: `${dimension}px`,
        borderRadius: 'var(--radius-full, 9999px)',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hasValidPhoto
          ? 'transparent'
          : 'linear-gradient(135deg, var(--primary-600, #4f46e5) 0%, var(--accent-cyan, #06b6d4) 100%)',
        color: '#ffffff',
        fontWeight: 700,
        fontSize,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '2px solid rgba(255, 255, 255, 0.12)',
        position: 'relative',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
    >
      {hasValidPhoto ? (
        <img
          src={photoUrl}
          alt={name}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          loading="lazy"
        />
      ) : name ? (
        <span>{getInitials(name)}</span>
      ) : (
        <User size={iconSize} color="#ffffff" />
      )}
    </div>
  );
};
