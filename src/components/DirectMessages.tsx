import { useEffect, useState } from 'react';
import { X, Send, ArrowLeft, Search } from 'lucide-react';
import { db } from '../lib/db';
import { useAuth } from '../lib/auth';
import { Avatar } from './Avatar';
import { timeAgo } from '../lib/utils';
import type { ChatThreadWithProfile, ChatMessage } from '../lib/db';

export function DirectMessages({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThreadWithProfile[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThreadWithProfile | null>(null);
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => { setThreads(db.getThreads()); }, []);

  const openThread = (t: ChatThreadWithProfile) => setActiveThread({ ...t, messages: [...t.messages] });

  const send = () => {
    if (!text.trim() || !activeThread) return;
    const msg = db.sendMessage(activeThread.id, text);
    if (msg) {
      const newMsg: ChatMessage = msg;
      setActiveThread((t) => (t ? { ...t, messages: [...t.messages, newMsg] } : t));
      setThreads(db.getThreads());
    }
    setText('');
  };

  const filtered = query
    ? threads.filter((t) => t.profile?.username?.toLowerCase().includes(query.toLowerCase()))
    : threads;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--surface)] h-full shadow-2xl flex flex-col animate-slide-up md:animate-fade-in">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border)]">
          {activeThread ? (
            <button onClick={() => setActiveThread(null)} className="p-1.5 rounded-full hover:bg-[var(--surface-2)]">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[var(--surface-2)]">
              <X size={20} />
            </button>
          )}
          <h3 className="font-display font-bold text-lg flex-1">
            {activeThread ? activeThread.profile?.username : 'Direct Messages'}
          </h3>
        </div>

        {activeThread ? (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <div className="flex flex-col items-center gap-2 py-6">
                <Avatar profile={activeThread.profile} size={72} ring />
                <p className="font-semibold">{activeThread.profile?.full_name || activeThread.profile?.username}</p>
                <p className="text-xs text-[var(--text-muted)]">@{activeThread.profile?.username}</p>
              </div>
              {activeThread.messages.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[15px] ${mine ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white rounded-br-md' : 'bg-[var(--surface-2)] text-[var(--text)] rounded-bl-md'}`}>
                      {m.content}
                      <div className={`text-[10px] mt-1 ${mine ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>{timeAgo(m.created_at)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[var(--border)] p-3 flex items-center gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Message…" className="input-field flex-1" />
              <button onClick={send} disabled={!text.trim()} className="btn-primary !p-3 disabled:opacity-40" aria-label="Send">
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="px-4 py-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations…" className="input-field pl-9 text-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2">
              {filtered.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-10">No conversations found.</p>}
              {filtered.map((t) => {
                const last = t.messages[t.messages.length - 1];
                return (
                  <button key={t.id} onClick={() => openThread(t)} className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-[var(--surface-2)] transition text-left">
                    <Avatar profile={t.profile} size={52} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{t.profile?.full_name || t.profile?.username}</p>
                      <p className="text-sm text-[var(--text-muted)] truncate">
                        {last ? `${last.sender_id === user?.id ? 'You: ' : ''}${last.content}` : 'Say hi!'}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--text-muted)] shrink-0">{last ? timeAgo(last.created_at) : ''}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
