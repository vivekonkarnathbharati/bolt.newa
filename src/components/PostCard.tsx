import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import type { PostWithProfile } from '../lib/db';
import { db } from '../lib/db';
import { useAuth } from '../lib/auth';
import { Link } from '../lib/router';
import { Avatar } from './Avatar';
import { CommentSheet } from './CommentSheet';
import { timeAgo, formatCount } from '../lib/utils';

export function PostCard({ post, onDelete }: { post: PostWithProfile; onDelete: (id: string) => void }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes.some((l) => l.user_id === user?.id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLike = () => {
    const res = db.toggleLike(post.id);
    setLiked(res.liked);
    setLikeCount(res.count);
  };

  const remove = () => {
    db.deletePost(post.id);
    onDelete(post.id);
  };

  const isMine = post.user_id === user?.id;

  return (
    <article className="card p-4 animate-fade-up">
      <header className="flex items-center gap-3 mb-3">
        <Link to={`/profile/${post.profile?.id}`}>
          <Avatar profile={post.profile} size={44} />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${post.profile?.id}`} className="font-semibold hover:underline">
            {post.profile?.full_name || post.profile?.username}
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)] text-sm">@{post.profile?.username}</span>
            <span className="text-[var(--text-muted)] opacity-50">·</span>
            <span className="text-[var(--text-muted)] text-sm">{timeAgo(post.created_at)}</span>
          </div>
        </div>
        {isMine && (
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="p-1.5 rounded-full hover:bg-[var(--surface-2)] transition">
              <MoreHorizontal size={20} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-20 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl py-1 w-40 animate-fade-in">
                  <button onClick={remove} className="w-full text-left px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 flex items-center gap-2">
                    <Trash2 size={15} /> Delete post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      <p className="text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.content}
          loading="lazy"
          className="w-full max-h-[520px] object-cover rounded-2xl border border-[var(--border)] animate-fade-in"
        />
      )}

      <div className="flex items-center gap-1 mt-3 text-[var(--text-muted)]">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm transition-all ${
            liked ? 'text-rose-500 bg-rose-500/10' : 'hover:bg-rose-500/10 hover:text-rose-500'
          }`}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} className={liked ? 'animate-like-burst' : ''} />
          {formatCount(likeCount)}
        </button>
        <button
          onClick={() => setShowComments(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm hover:bg-sky-500/10 hover:text-sky-500 transition-all"
        >
          <MessageCircle size={18} /> {formatCount(post.comments.length)}
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">
          <Share2 size={18} /> Share
        </button>
      </div>

      {showComments && <CommentSheet post={post} onClose={() => setShowComments(false)} />}
    </article>
  );
}
