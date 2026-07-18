import { useEffect, useRef, useState } from 'react';
import { X, Send } from 'lucide-react';
import type { PostWithProfile } from '../lib/db';
import { db } from '../lib/db';
import { useAuth } from '../lib/auth';
import { Avatar } from './Avatar';
import { timeAgo } from '../lib/utils';

export function CommentSheet({ post, onClose }: { post: PostWithProfile; onClose: () => void }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(post.comments);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [comments.length]);

  const send = () => {
    const c = db.addComment(post.id, text);
    if (c) setComments((prev) => [...prev, c]);
    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-[var(--surface)] sm:rounded-2xl rounded-t-2xl h-[80vh] sm:h-[70vh] flex flex-col animate-slide-up sm:animate-fade-up shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-display font-bold">Comments</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[var(--surface-2)]">
            <X size={20} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {comments.length === 0 && (
            <p className="text-[var(--text-muted)] text-center py-10 text-sm">No comments yet. Start the conversation.</p>
          )}
          {comments.map((c) => {
            const author = db.getProfile(c.user_id);
            const mine = c.user_id === user?.id;
            return (
              <div key={c.id} className="flex gap-3 animate-fade-up">
                <Avatar profile={author} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{author?.username}</span>{' '}
                    <span className="text-[var(--text)]">{c.content}</span>
                  </p>
                  <span className="text-xs text-[var(--text-muted)]">{timeAgo(c.created_at)}</span>
                </div>
                {mine && <span className="text-xs text-[var(--primary)] self-center">You</span>}
              </div>
            );
          })}
        </div>

        <div className="border-t border-[var(--border)] p-4 flex items-center gap-2">
          <Avatar profile={user} size={32} />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Add a comment…"
            className="input-field flex-1"
          />
          <button onClick={send} disabled={!text.trim()} className="btn-primary !p-3 disabled:opacity-40" aria-label="Send">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
