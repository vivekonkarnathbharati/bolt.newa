import type { Profile } from '../lib/db';

export function Avatar({
  profile,
  size = 40,
  ring = false,
}: {
  profile: Profile | null;
  size?: number;
  ring?: boolean;
}) {
  const initials = (profile?.full_name || profile?.username || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 ${ring ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg)]' : ''}`}
      style={{ width: size, height: size }}
    >
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-semibold text-white bg-gradient-to-br from-accent to-indigo-500"
          style={{ fontSize: size * 0.38 }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
