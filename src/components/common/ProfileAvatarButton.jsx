import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProfileAvatarButton = ({ className = "" }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name || user?.username || 'User';
  const initial = (displayName.trim()?.[0] || 'S').toUpperCase();

  return (
    <button
      type="button"
      onClick={() => navigate('/profile')}
      className={`w-9 h-9 rounded-full bg-[#D6C7B2] text-[#1A1D1A] font-serif font-bold text-sm flex items-center justify-center cursor-pointer shadow-2xs hover:opacity-90 active:scale-95 transition-all select-none overflow-hidden border border-[#ECE8DF] shrink-0 ring-2 ring-transparent hover:ring-[#1E2E22]/20 ${className}`}
      title="View Profile"
      aria-label="View Profile"
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={displayName}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </button>
  );
};

export default ProfileAvatarButton;
