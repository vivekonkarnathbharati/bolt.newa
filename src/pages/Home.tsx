import { useEffect, useState } from 'react';
import { ImagePlus, Sparkles, Loader2 } from 'lucide-react';
import type { PostWithProfile, StoryWithProfile } from '../lib/db';
import { db } from '../lib/db';
import { useAuth } from '../lib/auth';
import { Avatar } from '../components/Avatar';
import { PostCard } from '../components/PostCard';
import { StoriesBar, StoryModal } from '../components/Stories';

export function HomePage() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [stories, setStories] = useState<StoryWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImg, setShowImg] = useState(false);
  const [posting, setPosting] = useState(false);
  const [storyOpen, setStoryOpen] = useState<number | null>(null);

  useEffect(() => {
    setPosts(db.getFeed());
    setStories(db.getStories());
    setLoading(false);
  }, []);

  const submit = () => {
    if (!content.trim()) return;
    setPosting(true);
    const post = db.createPost({ content: content.trim(), image_url: imageUrl });
    if (post) setPosts((p) => [post, ...p]);
    setContent(''); setImageUrl(''); setShowImg(false); setPosting(false);
  };

  const removePost = (id: string) => setPosts((p) => p.filter((x) => x.id !== id));

  return (
    <div className="max-w-2xl mx-auto px-0 md:px-4 py-0 md:py-8">
      <div className="card md:rounded-2xl rounded-none border-x-0 md:border border-[var(--border)] mb-0 md:mb-5 overflow-hidden">
        <StoriesBar stories={stories} onOpen={(i) => setStoryOpen(i)} />
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-0">
        <div className="card p-4 mb-5">
          <div className="flex gap-3">
            <Avatar profile={profile} size={44} />
            <div className="flex-1">
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind?" rows={showImg ? 3 : 2} className="w-full resize-none bg-transparent outline-none text-[15px] placeholder:text-[var(--text-muted)] transition-all" />
              {showImg && <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Paste image URL (https://…)" className="input-field mt-2 text-sm" />}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
                <button onClick={() => setShowImg((v) => !v)} className="flex items-center gap-1.5 text-sm text-[var(--primary)] hover:bg-[var(--primary-soft)] px-3 py-1.5 rounded-full transition">
                  <ImagePlus size={18} /> Image
                </button>
                <button onClick={submit} disabled={posting || !content.trim()} className="btn-primary flex items-center gap-2 text-sm">
                  {posting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {posts.map((p) => <PostCard key={p.id} post={p} onDelete={removePost} />)}
          </div>
        )}
      </div>

      {storyOpen !== null && storyOpen >= 0 && (
        <StoryModal stories={stories} startIndex={storyOpen} onClose={() => setStoryOpen(null)} />
      )}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card p-5">
          <div className="flex gap-3">
            <div className="w-11 h-11 rounded-full skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded skeleton" />
              <div className="h-3 w-3/4 rounded skeleton" />
              <div className="h-3 w-1/2 rounded skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-accent to-indigo-500 flex items-center justify-center mb-4 glow-accent">
        <Sparkles size={26} className="text-white" />
      </div>
      <h3 className="font-display font-bold text-lg">Your feed is quiet</h3>
      <p className="text-[var(--text-muted)] text-sm mt-1">Be the first to share something with the world.</p>
    </div>
  );
}
