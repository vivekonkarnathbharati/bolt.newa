import { useEffect, useState } from 'react';
import { Search, TrendingUp, Hash, Users } from 'lucide-react';
import type { PostWithProfile, Profile } from '../lib/db';
import { db } from '../lib/db';
import { Avatar } from '../components/Avatar';
import { Link } from '../lib/router';
import { formatCount } from '../lib/utils';

export function ExplorePage() {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [people, setPeople] = useState<Profile[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'discover' | 'people'>('discover');

  useEffect(() => {
    setPosts(db.getFeed());
    setPeople(db.getAllProfiles());
    setLoading(false);
  }, []);

  const filteredPosts = query
    ? posts.filter((p) => p.content.toLowerCase().includes(query.toLowerCase()))
    : [...posts].sort((a, b) => b.likes.length - a.likes.length);

  const filteredPeople = query ? db.searchPeople(query) : people;
  const trendingTags = extractTrending(posts);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <header className="hidden md:block mb-6">
        <h1 className="font-display text-2xl font-extrabold">Explore</h1>
        <p className="text-[var(--text-muted)] text-sm mt-0.5">Discover trending posts, people, and topics.</p>
      </header>

      <div className="relative mb-5 max-w-xl">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search posts and people…" className="input-field pl-10" />
      </div>

      {!query && trendingTags.length > 0 && (
        <div className="card p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-[var(--primary)]" />
            <h3 className="font-semibold">Trending topics</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((t) => (
              <button key={t.tag} onClick={() => setQuery(t.tag)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-sm font-medium hover:opacity-80 transition">
                <Hash size={14} /> {t.tag}
                <span className="opacity-60">· {formatCount(t.count)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-5 bg-[var(--surface-2)] p-1 rounded-full w-fit">
        {(['discover', 'people'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition ${tab === t ? 'bg-[var(--surface)] shadow-sm text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            {t === 'discover' ? <TrendingUp size={15} /> : <Users size={15} />}
            {t === 'discover' ? 'Discover' : 'People'}
          </button>
        ))}
      </div>

      {tab === 'discover' ? (
        loading ? <p className="text-[var(--text-muted)] text-sm text-center py-10">Loading posts…</p>
        : filteredPosts.length === 0 ? <p className="text-[var(--text-muted)] text-sm text-center py-10">No posts found.</p>
        : (
          <div className="masonry">
            {filteredPosts.map((p) => (
              <Link key={p.id} to={`/profile/${p.profile?.id}`} className="masonry-item block group relative overflow-hidden rounded-2xl">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.content} loading="lazy" className="w-full object-cover group-hover:scale-105 transition-transform duration-500 animate-fade-in" />
                ) : (
                  <div className="card p-6 min-h-[160px] flex items-center">
                    <p className="text-sm leading-relaxed line-clamp-4">{p.content}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="flex items-center gap-3 text-white text-sm">
                    <span className="flex items-center gap-1"><TrendingUp size={16} /> {formatCount(p.likes.length)}</span>
                    <span className="text-white/80 truncate max-w-[200px]">@{p.profile?.username}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPeople.map((p) => (
            <Link key={p.id} to={`/profile/${p.id}`} className="card p-4 flex items-center gap-3 hover:shadow-[var(--shadow-lg)] transition">
              <Avatar profile={p} size={52} />
              <div className="min-w-0">
                <p className="font-semibold truncate">{p.full_name || p.username}</p>
                <p className="text-sm text-[var(--text-muted)] truncate">@{p.username}</p>
                {p.bio && <p className="text-sm text-[var(--text-muted)] mt-0.5 truncate">{p.bio}</p>}
              </div>
            </Link>
          ))}
          {filteredPeople.length === 0 && <p className="text-[var(--text-muted)] text-sm text-center py-10 col-span-full">No people found.</p>}
        </div>
      )}
    </div>
  );
}

function extractTrending(posts: PostWithProfile[]) {
  const counts = new Map<string, number>();
  for (const p of posts) {
    const matches = p.content.match(/#[\w]+/g) || [];
    for (const m of matches) {
      const tag = m.slice(1).toLowerCase();
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 8);
}
