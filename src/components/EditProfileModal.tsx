import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Profile } from '../lib/db';
import { db } from '../lib/db';
import { useAuth } from '../lib/auth';
import { Avatar } from './Avatar';

export function EditProfileModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: Profile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { refresh } = useAuth();
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = () => {
    setSaving(true);
    setError('');
    const updated = db.updateProfile(profile.id, {
      full_name: fullName.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    });
    setSaving(false);
    if (!updated) { setError('Could not save profile.'); return; }
    refresh();
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative card w-full max-w-md p-5 animate-pop max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg">Edit profile</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[var(--surface-2)]">
            <X size={20} />
          </button>
        </div>

        <div className="flex justify-center mb-5">
          <Avatar profile={{ ...profile, avatar_url: avatarUrl || null, full_name: fullName || profile.username }} size={88} ring />
        </div>

        <label className="block text-sm font-medium mb-1.5">Full name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field mb-4" placeholder="Your name" />

        <label className="block text-sm font-medium mb-1.5">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={200} className="input-field mb-1 resize-none" placeholder="Tell people about yourself" />
        <p className="text-xs text-[var(--text-muted)] -mt-2 mb-4 text-right">{bio.length}/200</p>

        <label className="block text-sm font-medium mb-1.5">Avatar URL</label>
        <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="input-field mb-4" placeholder="https://…" />

        {error && <p className="text-sm text-rose-500 mb-3">{error}</p>}

        <button onClick={save} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
