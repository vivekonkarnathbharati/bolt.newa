import { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { StoryWithProfile } from '../lib/db';
import { db } from '../lib/db';
import { Link } from '../lib/router';
import { Avatar } from './Avatar';
import { timeAgo } from '../lib/utils';

export function StoriesBar({ stories, onOpen }: { stories: StoryWithProfile[]; onOpen: (index: number) => void }) {
  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-4">
      {stories.map((s, i) => (
        <button key={s.id} onClick={() => onOpen(i)} className="flex flex-col items-center gap-1.5 shrink-0">
          <div className={`p-0.5 rounded-full ${s.seen ? 'story-ring-seen' : 'story-ring'}`}>
            <div className="p-0.5 rounded-full bg-[var(--surface)]">
              <Avatar profile={s.profile} size={64} />
            </div>
          </div>
          <span className="text-xs text-[var(--text-muted)] max-w-[64px] truncate">{s.profile?.username}</span>
        </button>
      ))}
    </div>
  );
}

export function StoryModal({
  stories,
  startIndex,
  onClose,
}: {
  stories: StoryWithProfile[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const DURATION = 5000;
  const current = stories[index];

  useEffect(() => {
    if (!current) return;
    db.markStorySeen(current.id);
    setProgress(0);
    const start = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / DURATION) * 100);
      setProgress(pct);
      if (pct >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (index < stories.length - 1) setIndex((i) => i + 1);
        else onClose();
      }
    }, 50);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!current) return null;

  const go = (dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0) return;
    if (next >= stories.length) onClose();
    else setIndex(next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in">
      <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
        <X size={24} />
      </button>
      {index > 0 && (
        <button onClick={() => go(-1)} className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
          <ChevronLeft size={24} />
        </button>
      )}
      {index < stories.length - 1 && (
        <button onClick={() => go(1)} className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
          <ChevronRight size={24} />
        </button>
      )}

      <div className="absolute top-4 inset-x-4 flex gap-1 z-10">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: i < index ? '100%' : i === index ? `${progress}%` : '0%' }} />
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-md h-full md:h-[90vh] md:rounded-2xl overflow-hidden">
        <img src={current.image_url} alt="story" className="w-full h-full object-cover animate-fade-in" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
        <div className="absolute top-10 left-4 flex items-center gap-2">
          <Avatar profile={current.profile} size={36} ring />
          <div className="text-white">
            <Link to={`/profile/${current.profile?.id}`} onClick={onClose} className="font-semibold text-sm hover:underline">
              {current.profile?.username}
            </Link>
            <p className="text-xs text-white/70">{timeAgo(current.created_at)}</p>
          </div>
        </div>
        <button onClick={() => go(-1)} className="absolute left-0 top-0 bottom-0 w-1/3" aria-label="Previous" />
        <button onClick={() => go(1)} className="absolute right-0 top-0 bottom-0 w-1/3" aria-label="Next" />
      </div>
    </div>
  );
}
