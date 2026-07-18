import { useEffect, useState } from 'react';
import { ArrowLeft, Grid3x3, Pencil } from 'lucide-react';
import type { PostWithProfile, Profile } from '../lib/db';
import { db } from '../lib/db';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import { Avatar } from '../components/Avatar';
import { PostCard } from '../components/PostCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { formatCount } from '../lib/utils';

export function ProfilePage({ userId }: { userId: string }) {
  const { user, refresh } = useAuth();
  const { navigate } = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [editing, setEditing] = useState(false);

  const isMe = userId === user?.id;

  useEffect(() => {
    const p = db.getProfile(userId);
    setProfile(p);
    setPosts(db.getPostsByUser(userId));
  }, [userId]);

  const followers = profile ? db.getFollowers(profile.id) : 0;
  const following = profile ? db.getFollowing(profile.id) : 0;

  const removePost = (id: string) => setPosts((arr) => arr.filter((x) => x.id !== id));

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] mb-6">
          <ArrowLeft size={20} /> Back
        </button>
        <p className="text-[var(--text-muted)]">This profile doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
      <div className="card overflow-hidden mb-5">
        <div className="relative h-40 md:h-52 bg-gradient-to-br from-accent via-indigo-500 to-pink-500">
          <button onClick={() => navigate('/')} className="md:hidden absolute top-3 left-3 p-2 rounded-full bg-white/30 backdrop-blur text-white hover:bg-white/40">
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="px-5 md:px-8 pb-6">
          <div className="flex items-end justify-between -mt-12 md:-mt-14">
            <div className="rounded-full ring-4 ring-[var(--bg)] bg-[var(--surface)]">
              <Avatar profile={profile} size={96} />
            </div>
            {isMe ? (
              <button onClick={() => setEditing(true)} className="btn-outline flex items-center gap-2 text-sm">
                <Pencil size={15} /> Edit profile
              </button>
            ) : (
              <button className="btn-primary text-sm">Follow</button>
            )}
          </div>

          <div className="mt-4">
            <h1 className="font-display text-xl font-extrabold">{profile.full_name || profile.username}</h1>
            <p className="text-[var(--text-muted)]">@{profile.username}</p>
            {profile.bio && <p className="mt-3 text-sm leading-relaxed">{profile.bio}</p>}
            <div className="mt-4 flex gap-6 text-sm">
              <span><b>{formatCount(following)}</b> <span className="text-[var(--text-muted)]">Following</span></span>
              <span><b>{formatCount(followers)}</b> <span className="text-[var(--text-muted)]">Followers</span></span>
              <span><b>{posts.length}</b> <span className="text-[var(--text-muted)]">Posts</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 px-2">
        <Grid3x3 size={18} className="text-[var(--primary)]" />
        <span className="font-semibold text-sm">Posts</span>
      </div>

      {posts.length === 0 ? (
        <div className="card p-10 text-center text-[var(--text-muted)] text-sm">
          {isMe ? 'You haven\'t posted yet. Share something!' : 'No posts yet.'}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => <PostCard key={p.id} post={p} onDelete={removePost} />)}
        </div>
      )}

      {isMe && editing && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSaved={() => { refresh(); setProfile(db.getProfile(userId)); setEditing(false); }}
        />
      )}
    </div>
  );
}
