import { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, Volume2, VolumeX, Music2 } from 'lucide-react';
import type { ReelWithProfile } from '../lib/db';
import { db } from '../lib/db';
import { Link } from '../lib/router';
import { Avatar } from '../components/Avatar';
import { formatCount } from '../lib/utils';

export function ReelsPage() {
  const [reels, setReels] = useState<ReelWithProfile[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setReels(db.getReels()); }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll('[data-reel]')) as HTMLElement[];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio > 0.6) {
          setActiveIdx(Number((e.target as HTMLElement).dataset.index));
        }
      });
    }, { root: container, threshold: [0.6] });
    items.forEach((i) => obs.observe(i));
    return () => obs.disconnect();
  }, [reels]);

  const toggleLike = (id: string) => {
    const { liked, count } = db.toggleReelLike(id);
    setReels((prev) => prev.map((r) => (r.id === id ? { ...r, liked, likes: count } : r)));
  };

  if (reels.length === 0) return <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">Loading reels…</div>;

  return (
    <div ref={containerRef} className="reels-scroll h-screen overflow-y-auto bg-black">
      {reels.map((reel, idx) => (
        <ReelItem key={reel.id} reel={reel} index={idx} active={activeIdx === idx} muted={muted} onToggleMute={() => setMuted((m) => !m)} onLike={() => toggleLike(reel.id)} />
      ))}
    </div>
  );
}

function ReelItem({ reel, index, active, muted, onToggleMute, onLike }: {
  reel: ReelWithProfile; index: number; active: boolean; muted: boolean; onToggleMute: () => void; onLike: () => void;
}) {
  const [burst, setBurst] = useState(false);
  const [liked, setLiked] = useState(reel.liked);
  const [likeCount, setLikeCount] = useState(reel.likes);
  const lastTap = useRef(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) { onLike(); setLiked(true); setLikeCount((c) => c + 1); }
      setBurst(true);
      setTimeout(() => setBurst(false), 800);
    }
    lastTap.current = now;
  };

  const handleLike = () => {
    onLike();
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
  };

  return (
    <div data-reel data-index={index} className="reel-item relative h-full w-full flex items-center justify-center">
      <div className="relative w-full max-w-[460px] h-full md:h-[90vh] md:rounded-3xl overflow-hidden bg-black" onClick={handleDoubleTap}>
        <div className="absolute inset-0">
          <img src={reel.cover_url} alt={reel.caption} className={`w-full h-full object-cover transition-transform duration-[6000ms] ${active ? 'scale-110' : 'scale-100'}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          {active && <div className="absolute inset-0 opacity-30 mix-blend-overlay animate-fade-in" style={{ background: 'linear-gradient(135deg, #22d3ee33, #6366f133, #ec489933)' }} />}
        </div>

        {burst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart size={120} className="text-white fill-rose-500 drop-shadow-2xl animate-like-burst" />
          </div>
        )}

        <button onClick={onToggleMute} className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur text-white hover:bg-black/60 transition z-10">
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
          <button onClick={handleLike} className="flex flex-col items-center gap-1">
            <div className="p-2.5 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition">
              <Heart size={26} className={liked ? 'text-rose-500 fill-rose-500' : 'text-white'} fill={liked ? 'currentColor' : 'none'} />
            </div>
            <span className="text-white text-xs font-semibold">{formatCount(likeCount)}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <div className="p-2.5 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition"><MessageCircle size={26} className="text-white" /></div>
            <span className="text-white text-xs font-semibold">{formatCount(reel.comments)}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <div className="p-2.5 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition"><Send size={26} className="text-white" /></div>
            <span className="text-white text-xs font-semibold">{formatCount(reel.shares)}</span>
          </button>
          <button className="p-2.5 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition"><MoreHorizontal size={26} className="text-white" /></button>
        </div>

        <div className="absolute left-4 right-20 bottom-8 z-10">
          <Link to={`/profile/${reel.profile?.id}`} className="flex items-center gap-2.5 mb-3">
            <Avatar profile={reel.profile} size={36} ring />
            <span className="text-white font-semibold text-sm">{reel.profile?.username}</span>
            <span className="px-2.5 py-0.5 rounded-full border border-white/40 text-white text-xs font-semibold hover:bg-white/10 transition">Follow</span>
          </Link>
          <p className="text-white text-sm leading-relaxed mb-2 line-clamp-2">{reel.caption}</p>
          <div className="flex items-center gap-1.5 text-white/80 text-xs">
            <Music2 size={14} className="animate-pulse" />
            <span className="truncate">{reel.audio}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
