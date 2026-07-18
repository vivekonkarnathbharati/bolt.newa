import { useState } from 'react';
import { X, ImagePlus, Sparkles, Loader2, Check, Send } from 'lucide-react';
import { db } from '../lib/db';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import { Avatar } from './Avatar';

export function CreatePostModal({ onClose }: { onClose: () => void }) {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImg, setShowImg] = useState(false);
  const [posting, setPosting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [showAi, setShowAi] = useState(false);

  const generate = () => {
    setAiLoading(true);
    setSuggestions([]);
    setTimeout(() => {
      setSuggestions(db.generateCaptions(topic));
      setAiLoading(false);
    }, 1500);
  };

  const submit = () => {
    if (!content.trim()) return;
    setPosting(true);
    db.createPost({ content: content.trim(), image_url: imageUrl });
    setPosting(false);
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative card w-full max-w-lg p-5 animate-pop max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg">Create post</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[var(--surface-2)]">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          <Avatar profile={profile} size={44} />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="w-full resize-none bg-transparent outline-none text-[15px] placeholder:text-[var(--text-muted)]"
            />
            {showImg && (
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Paste image URL (https://…)" className="input-field mt-2 text-sm" />
            )}
          </div>
        </div>

        {imageUrl.trim() && (
          <img src={imageUrl} alt="preview" className="w-full max-h-64 object-cover rounded-2xl mb-4 animate-fade-in" />
        )}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 mb-4">
          {!showAi ? (
            <button onClick={() => setShowAi(true)} className="w-full flex items-center justify-center gap-2 text-[var(--primary)] font-semibold text-sm hover:opacity-80 transition">
              <Sparkles size={18} /> AI Auto-Generate Captions
            </button>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-[var(--primary)]" />
                <span className="font-semibold text-sm">AI Caption Assistant</span>
                <button onClick={() => { setShowAi(false); setSuggestions([]); }} className="ml-auto p-1 rounded-full hover:bg-[var(--surface)]">
                  <X size={16} />
                </button>
              </div>
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Optional: topic (e.g. coffee, travel, coding)" className="input-field text-sm mb-3" />
              <button onClick={generate} disabled={aiLoading} className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                {aiLoading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><Sparkles size={16} /> Generate captions</>}
              </button>
              {aiLoading && (
                <div className="mt-3 space-y-2">
                  {[0, 1, 2].map((i) => <div key={i} className="h-10 rounded-lg skeleton" />)}
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="mt-3 space-y-2 animate-fade-up">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => setContent(s)} className="w-full text-left p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] transition group">
                      <div className="flex items-start gap-2">
                        <p className="text-sm flex-1">{s}</p>
                        <Check size={16} className="text-[var(--primary)] opacity-0 group-hover:opacity-100 transition shrink-0 mt-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <button onClick={() => setShowImg((v) => !v)} className="flex items-center gap-1.5 text-sm text-[var(--primary)] hover:bg-[var(--primary-soft)] px-3 py-1.5 rounded-full transition">
            <ImagePlus size={18} /> Image
          </button>
          <button onClick={submit} disabled={posting || !content.trim()} className="btn-primary flex items-center gap-2 text-sm">
            {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Post
          </button>
        </div>
      </div>
    </div>
  );
}
