import { uid } from './utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

export type Like = { id: string; post_id: string; user_id: string; created_at: string };
export type Comment = { id: string; post_id: string; user_id: string; content: string; created_at: string };
export type Follow = { id: string; follower_id: string; following_id: string; created_at: string };

export type PostWithProfile = Post & {
  profile: Profile | null;
  likes: Like[];
  comments: Comment[];
};

export type Reel = {
  id: string; user_id: string; caption: string; video_url: string; cover_url: string;
  audio: string; likes: number; comments: number; shares: number; created_at: string;
};
export type ReelWithProfile = Reel & { profile: Profile | null; liked: boolean };

export type Story = { id: string; user_id: string; image_url: string; seen: boolean; created_at: string };
export type StoryWithProfile = Story & { profile: Profile | null };

export type ChatMessage = { id: string; sender_id: string; content: string; created_at: string };
export type ChatThread = { id: string; user_id: string; messages: ChatMessage[]; updated_at: string };
export type ChatThreadWithProfile = ChatThread & { profile: Profile | null };

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                    */
/* ------------------------------------------------------------------ */

type StoredUser = Profile & { email: string; password: string };

const USERS_KEY = 'socialhub_users';
const POSTS_KEY = 'socialhub_posts';
const LIKES_KEY = 'socialhub_likes';
const COMMENTS_KEY = 'socialhub_comments';
const FOLLOWS_KEY = 'socialhub_follows';
const SESSION_KEY = 'socialhub_session';
const SEED_KEY = 'socialhub_seeded_v2';
const REELS_KEY = 'socialhub_reels';
const REEL_LIKES_KEY = 'socialhub_reel_likes';
const STORIES_KEY = 'socialhub_stories';
const CHATS_KEY = 'socialhub_chats';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function publicUser(u: StoredUser): Profile {
  return {
    id: u.id, username: u.username, full_name: u.full_name, bio: u.bio,
    avatar_url: u.avatar_url, created_at: u.created_at,
  };
}

/* ------------------------------------------------------------------ */
/*  Seed                                                               */
/* ------------------------------------------------------------------ */

function seedIfNeeded() {
  let seeded = false;
  try { seeded = localStorage.getItem(SEED_KEY) === '1'; } catch { /* ignore */ }
  if (seeded) return;

  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;

  const alex: StoredUser = {
    id: uid(), username: 'alex_rivera', full_name: 'Alex Rivera', email: 'alex@socialhub.demo', password: 'password',
    bio: 'Designer & coffee enthusiast ☕', avatar_url: 'https://picsum.photos/seed/alex/200/200',
    created_at: new Date(now - day * 120).toISOString(),
  };
  const maya: StoredUser = {
    id: uid(), username: 'maya_chen', full_name: 'Maya Chen', email: 'maya@socialhub.demo', password: 'password',
    bio: 'Frontend dev · neon dreams ✨', avatar_url: 'https://picsum.photos/seed/maya/200/200',
    created_at: new Date(now - day * 90).toISOString(),
  };
  const jordan: StoredUser = {
    id: uid(), username: 'jordan_lee', full_name: 'Jordan Lee', email: 'jordan@socialhub.demo', password: 'password',
    bio: 'Photographer chasing golden hour 📷', avatar_url: 'https://picsum.photos/seed/jordan/200/200',
    created_at: new Date(now - day * 60).toISOString(),
  };

  write(USERS_KEY, [alex, maya, jordan]);

  const posts: Post[] = [
    { id: uid(), user_id: alex.id, content: 'Just shipped a new design system. Spent way too long on the button states. 😅 #design #frontend', image_url: 'https://picsum.photos/seed/post1/800/600', created_at: new Date(now - 1000 * 60 * 30).toISOString() },
    { id: uid(), user_id: maya.id, content: '60fps animations are a love language. #webdev #css', image_url: 'https://picsum.photos/seed/post2/800/600', created_at: new Date(now - 1000 * 60 * 90).toISOString() },
    { id: uid(), user_id: jordan.id, content: 'Golden hour never misses. 🌅 #photography #sunset', image_url: 'https://picsum.photos/seed/post3/600/800', created_at: new Date(now - 1000 * 60 * 180).toISOString() },
    { id: uid(), user_id: alex.id, content: 'Morning routine: espresso, music, and a blank canvas. ☕️🎵 #coffee #creative', image_url: 'https://picsum.photos/seed/post4/700/700', created_at: new Date(now - 1000 * 60 * 300).toISOString() },
    { id: uid(), user_id: maya.id, content: 'TIL: CSS scroll-snap is incredibly satisfying. Try it on your next gallery. #frontend #ux', image_url: null, created_at: new Date(now - 1000 * 60 * 500).toISOString() },
    { id: uid(), user_id: jordan.id, content: 'Mountain top sunrise. Worth the 4am hike. ⛰️ #travel #hiking #adventure', image_url: 'https://picsum.photos/seed/post6/800/600', created_at: new Date(now - 1000 * 60 * 700).toISOString() },
    { id: uid(), user_id: alex.id, content: 'Soft launch of something I have been working on. More soon. 👀 #teaser', image_url: 'https://picsum.photos/seed/post7/600/750', created_at: new Date(now - 1000 * 60 * 900).toISOString() },
    { id: uid(), user_id: maya.id, content: 'Accessibility is not optional. It is the baseline. #a11y #webdev', image_url: null, created_at: new Date(now - 1000 * 60 * 1200).toISOString() },
    { id: uid(), user_id: jordan.id, content: 'City lights hit different at 2am. 🌃 #nightphotography #urban', image_url: 'https://picsum.photos/seed/post9/700/500', created_at: new Date(now - 1000 * 60 * 1500).toISOString() },
  ];
  write(POSTS_KEY, posts);

  const likes: Like[] = [
    { id: uid(), post_id: posts[0].id, user_id: maya.id, created_at: new Date(now - 1000 * 60 * 20).toISOString() },
    { id: uid(), post_id: posts[0].id, user_id: jordan.id, created_at: new Date(now - 1000 * 60 * 15).toISOString() },
    { id: uid(), post_id: posts[1].id, user_id: alex.id, created_at: new Date(now - 1000 * 60 * 60).toISOString() },
    { id: uid(), post_id: posts[2].id, user_id: alex.id, created_at: new Date(now - 1000 * 60 * 120).toISOString() },
    { id: uid(), post_id: posts[2].id, user_id: maya.id, created_at: new Date(now - 1000 * 60 * 100).toISOString() },
    { id: uid(), post_id: posts[4].id, user_id: jordan.id, created_at: new Date(now - 1000 * 60 * 400).toISOString() },
  ];
  write(LIKES_KEY, likes);

  const comments: Comment[] = [
    { id: uid(), post_id: posts[0].id, user_id: maya.id, content: 'The hover state is chef kiss 🤌', created_at: new Date(now - 1000 * 60 * 10).toISOString() },
    { id: uid(), post_id: posts[0].id, user_id: jordan.id, content: 'Looks clean! What framework?', created_at: new Date(now - 1000 * 60 * 8).toISOString() },
    { id: uid(), post_id: posts[2].id, user_id: alex.id, content: 'Unreal colors 🌅', created_at: new Date(now - 1000 * 60 * 90).toISOString() },
  ];
  write(COMMENTS_KEY, comments);

  const follows: Follow[] = [
    { id: uid(), follower_id: alex.id, following_id: maya.id, created_at: new Date(now - day * 10).toISOString() },
    { id: uid(), follower_id: maya.id, following_id: jordan.id, created_at: new Date(now - day * 8).toISOString() },
    { id: uid(), follower_id: jordan.id, following_id: alex.id, created_at: new Date(now - day * 5).toISOString() },
  ];
  write(FOLLOWS_KEY, follows);

  const reels: Reel[] = [
    { id: uid(), user_id: jordan.id, caption: 'Caught the perfect wave this morning 🌊 #ocean #sunset', video_url: 'https://picsum.photos/seed/reel1/720/1280', cover_url: 'https://picsum.photos/seed/reel1/720/1280', audio: 'Ocean Sounds · Lofi Mix', likes: 1240, comments: 38, shares: 12, created_at: new Date(now - 1000 * 60 * 30).toISOString() },
    { id: uid(), user_id: maya.id, caption: '60fps CSS animations hit different 🚀 #frontend #webdev', video_url: 'https://picsum.photos/seed/reel2/720/1280', cover_url: 'https://picsum.photos/seed/reel2/720/1280', audio: 'Synthwave Drive · Neon', likes: 890, comments: 24, shares: 8, created_at: new Date(now - 1000 * 60 * 120).toISOString() },
    { id: uid(), user_id: alex.id, caption: 'My morning coffee ritual ☕ #coffee #aesthetic', video_url: 'https://picsum.photos/seed/reel3/720/1280', cover_url: 'https://picsum.photos/seed/reel3/720/1280', audio: 'Warm Jazz · Morning', likes: 540, comments: 19, shares: 4, created_at: new Date(now - 1000 * 60 * 240).toISOString() },
    { id: uid(), user_id: jordan.id, caption: 'Mountain top sunrise. Worth the 4am hike. ⛰️ #travel #hiking', video_url: 'https://picsum.photos/seed/reel4/720/1280', cover_url: 'https://picsum.photos/seed/reel4/720/1280', audio: 'Ambient Peaks · Calm', likes: 2100, comments: 67, shares: 31, created_at: new Date(now - 1000 * 60 * 400).toISOString() },
  ];
  write(REELS_KEY, reels);
  write(REEL_LIKES_KEY, []);

  const stories: Story[] = [
    { id: uid(), user_id: alex.id, image_url: 'https://picsum.photos/seed/storyA/720/1280', seen: false, created_at: new Date(now - 1000 * 60 * 20).toISOString() },
    { id: uid(), user_id: maya.id, image_url: 'https://picsum.photos/seed/storyB/720/1280', seen: false, created_at: new Date(now - 1000 * 60 * 45).toISOString() },
    { id: uid(), user_id: jordan.id, image_url: 'https://picsum.photos/seed/storyC/720/1280', seen: false, created_at: new Date(now - 1000 * 60 * 90).toISOString() },
  ];
  write(STORIES_KEY, stories);

  const chats: ChatThread[] = [
    {
      id: uid(), user_id: maya.id, updated_at: new Date(now - 1000 * 60 * 10).toISOString(),
      messages: [
        { id: uid(), sender_id: maya.id, content: 'Hey! Did you see the new design tokens?', created_at: new Date(now - 1000 * 60 * 30).toISOString() },
        { id: uid(), sender_id: alex.id, content: 'Just opened them — the cyan accents are 🔥', created_at: new Date(now - 1000 * 60 * 12).toISOString() },
        { id: uid(), sender_id: maya.id, content: 'Right? Let me know what you think of the spacing scale.', created_at: new Date(now - 1000 * 60 * 10).toISOString() },
      ],
    },
    {
      id: uid(), user_id: jordan.id, updated_at: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      messages: [
        { id: uid(), sender_id: jordan.id, content: 'Sending over the golden hour shots now', created_at: new Date(now - 1000 * 60 * 60 * 3).toISOString() },
      ],
    },
  ];
  write(CHATS_KEY, chats);

  try { localStorage.setItem(SEED_KEY, '1'); } catch { /* ignore */ }
}

/* ------------------------------------------------------------------ */
/*  DB API                                                             */
/* ------------------------------------------------------------------ */

export const db = {
  /* ---------- Auth ---------- */
  signUp(email: string, password: string, username: string, fullName?: string): { ok: boolean; error?: string } {
    const users = read<StoredUser[]>(USERS_KEY, []);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, error: 'That username is taken.' };
    }
    const user: StoredUser = {
      id: uid(), username, full_name: fullName || null, email, password,
      bio: null, avatar_url: `https://picsum.photos/seed/${username}/200/200`,
      created_at: new Date().toISOString(),
    };
    write(USERS_KEY, [...users, user]);
    try { localStorage.setItem(SESSION_KEY, user.id); } catch { /* ignore */ }
    return { ok: true };
  },

  signIn(email: string, password: string): { ok: boolean; error?: string } {
    const users = read<StoredUser[]>(USERS_KEY, []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: 'Invalid email or password.' };
    try { localStorage.setItem(SESSION_KEY, user.id); } catch { /* ignore */ }
    return { ok: true };
  },

  signOut(): void {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  },

  getCurrentUser(): Profile | null {
    try {
      const id = localStorage.getItem(SESSION_KEY);
      if (!id) return null;
      const users = read<StoredUser[]>(USERS_KEY, []);
      const u = users.find((x) => x.id === id);
      return u ? publicUser(u) : null;
    } catch { return null; }
  },

  /* ---------- Profiles ---------- */
  getProfile(id: string): Profile | null {
    const users = read<StoredUser[]>(USERS_KEY, []);
    const u = users.find((x) => x.id === id);
    return u ? publicUser(u) : null;
  },

  getAllProfiles(): Profile[] {
    return read<StoredUser[]>(USERS_KEY, []).map(publicUser);
  },

  searchPeople(query: string): Profile[] {
    const q = query.toLowerCase();
    return read<StoredUser[]>(USERS_KEY, [])
      .map(publicUser)
      .filter((p) => p.username.toLowerCase().includes(q) || (p.full_name ?? '').toLowerCase().includes(q));
  },

  updateProfile(id: string, updates: Partial<Pick<StoredUser, 'full_name' | 'bio' | 'avatar_url'>>): Profile | null {
    const users = read<StoredUser[]>(USERS_KEY, []);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    Object.assign(users[idx], updates);
    write(USERS_KEY, users);
    return publicUser(users[idx]);
  },

  /* ---------- Posts ---------- */
  getFeed(): PostWithProfile[] {
    const posts = read<Post[]>(POSTS_KEY, []);
    const users = read<StoredUser[]>(USERS_KEY, []);
    const likes = read<Like[]>(LIKES_KEY, []);
    const comments = read<Comment[]>(COMMENTS_KEY, []);
    return posts
      .map((p) => {
        const u = users.find((x) => x.id === p.user_id);
        return {
          ...p,
          profile: u ? publicUser(u) : null,
          likes: likes.filter((l) => l.post_id === p.id),
          comments: comments.filter((c) => c.post_id === p.id),
        };
      })
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  },

  getPostsByUser(userId: string): PostWithProfile[] {
    return db.getFeed().filter((p) => p.user_id === userId);
  },

  createPost(input: { content: string; image_url?: string | null }): PostWithProfile | null {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const post: Post = {
      id: uid(), user_id: id, content: input.content,
      image_url: input.image_url ?? null, created_at: new Date().toISOString(),
    };
    const posts = read<Post[]>(POSTS_KEY, []);
    write(POSTS_KEY, [post, ...posts]);
    const u = db.getProfile(id);
    return { ...post, profile: u, likes: [], comments: [] };
  },

  deletePost(postId: string): void {
    const posts = read<Post[]>(POSTS_KEY, []).filter((p) => p.id !== postId);
    write(POSTS_KEY, posts);
    const likes = read<Like[]>(LIKES_KEY, []).filter((l) => l.post_id !== postId);
    write(LIKES_KEY, likes);
    const comments = read<Comment[]>(COMMENTS_KEY, []).filter((c) => c.post_id !== postId);
    write(COMMENTS_KEY, comments);
  },

  toggleLike(postId: string): { liked: boolean; count: number } {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return { liked: false, count: 0 };
    const likes = read<Like[]>(LIKES_KEY, []);
    const existing = likes.find((l) => l.post_id === postId && l.user_id === id);
    if (existing) {
      write(LIKES_KEY, likes.filter((l) => l.id !== existing.id));
    } else {
      write(LIKES_KEY, [...likes, { id: uid(), post_id: postId, user_id: id, created_at: new Date().toISOString() }]);
    }
    const count = read<Like[]>(LIKES_KEY, []).filter((l) => l.post_id === postId).length;
    return { liked: !existing, count };
  },

  addComment(postId: string, content: string): Comment | null {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id || !content.trim()) return null;
    const c: Comment = { id: uid(), post_id: postId, user_id: id, content: content.trim(), created_at: new Date().toISOString() };
    const comments = read<Comment[]>(COMMENTS_KEY, []);
    write(COMMENTS_KEY, [...comments, c]);
    return c;
  },

  /* ---------- Follows ---------- */
  getFollowers(userId: string): number {
    return read<Follow[]>(FOLLOWS_KEY, []).filter((f) => f.following_id === userId).length;
  },
  getFollowing(userId: string): number {
    return read<Follow[]>(FOLLOWS_KEY, []).filter((f) => f.follower_id === userId).length;
  },

  /* ---------- Reels ---------- */
  getReels(): ReelWithProfile[] {
    const reels = read<Reel[]>(REELS_KEY, []);
    const users = read<StoredUser[]>(USERS_KEY, []);
    const reelLikes = read<string[]>(REEL_LIKES_KEY, []);
    return reels.map((r) => {
      const u = users.find((x) => x.id === r.user_id);
      return { ...r, profile: u ? publicUser(u) : null, liked: reelLikes.includes(r.id) };
    });
  },

  toggleReelLike(reelId: string): { liked: boolean; count: number } {
    const reels = read<Reel[]>(REELS_KEY, []);
    const reelLikes = read<string[]>(REEL_LIKES_KEY, []);
    const idx = reels.findIndex((r) => r.id === reelId);
    if (idx === -1) return { liked: false, count: 0 };
    const wasLiked = reelLikes.includes(reelId);
    if (wasLiked) {
      write(REEL_LIKES_KEY, reelLikes.filter((id) => id !== reelId));
      reels[idx].likes = Math.max(0, reels[idx].likes - 1);
    } else {
      write(REEL_LIKES_KEY, [...reelLikes, reelId]);
      reels[idx].likes += 1;
    }
    write(REELS_KEY, reels);
    return { liked: !wasLiked, count: reels[idx].likes };
  },

  /* ---------- Stories ---------- */
  getStories(): StoryWithProfile[] {
    const stories = read<Story[]>(STORIES_KEY, []);
    const users = read<StoredUser[]>(USERS_KEY, []);
    return stories.map((s) => {
      const u = users.find((x) => x.id === s.user_id);
      return { ...s, profile: u ? publicUser(u) : null };
    });
  },

  markStorySeen(storyId: string): void {
    const stories = read<Story[]>(STORIES_KEY, []);
    const idx = stories.findIndex((s) => s.id === storyId);
    if (idx !== -1) { stories[idx].seen = true; write(STORIES_KEY, stories); }
  },

  /* ---------- Chats ---------- */
  getThreads(): ChatThreadWithProfile[] {
    const threads = read<ChatThread[]>(CHATS_KEY, []);
    const users = read<StoredUser[]>(USERS_KEY, []);
    return threads
      .map((t) => {
        const u = users.find((x) => x.id === t.user_id);
        return { ...t, profile: u ? publicUser(u) : null };
      })
      .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
  },

  sendMessage(threadId: string, content: string): ChatMessage | null {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id || !content.trim()) return null;
    const threads = read<ChatThread[]>(CHATS_KEY, []);
    const idx = threads.findIndex((t) => t.id === threadId);
    if (idx === -1) return null;
    const msg: ChatMessage = { id: uid(), sender_id: id, content: content.trim(), created_at: new Date().toISOString() };
    threads[idx].messages.push(msg);
    threads[idx].updated_at = msg.created_at;
    write(CHATS_KEY, threads);
    return msg;
  },

  /* ---------- AI Caption Generator (local) ---------- */
  generateCaptions(topic?: string): string[] {
    const t = (topic || '').trim();
    const pools = [
      [
        `Chasing sunsets and dreams ${t ? `at ${t}` : 'this week'} 🌅✨ Sometimes the best moments are the unplanned ones.`,
        `Soft mornings, slow coffee, big ideas ☕️ ${t ? `Thinking about ${t}.` : 'Ready for what comes next.'}`,
        `Little reminder: you're doing better than you think 💫 ${t ? `Especially when it comes to ${t}.` : ''}`,
        `This? Pure serotonin 🤍 ${t ? `Tag someone who'd love ${t}.` : 'Save this for later.'}`,
        `Romanticizing the small things ${t ? `— ${t} included` : '— one moment at a time'}. 🌿`,
      ],
      [
        `Plot twist: ${t || 'today'} went exactly as planned and I'm still processing it 😭🙌`,
        `Main character energy ${t ? `at ${t}` : 'activated'} 🔥 No notes.`,
        `Comment your favorite part of ${t || 'this'} 👇 I'll go first: all of it.`,
        `If you know, you know. ${t ? `And if you don't — welcome to ${t}.` : 'Welcome to the vibe.'} 🤫`,
        `This took 3 attempts and zero regrets ${t ? `— ${t} edition` : ''}. 💪`,
      ],
      [
        `Day ${Math.floor(Math.random() * 90) + 1} of falling in love with ${t || 'the process'}. No cap. 🤍`,
        `Not me being emotional over ${t || 'this'} again 😶‍🌫️ But also… look at it.`,
        `The way ${t || 'this'} just hits different at 2am 🌙 You feel it too, right?`,
        `Soft launch of my new obsession with ${t || 'quiet moments'}. Don't tell anyone. 🤫`,
        `Reminder that ${t || 'this'} exists and it's okay to want more of it. 🌿`,
      ],
    ];
    const pool = pools[Math.floor(Math.random() * pools.length)];
    const tags = ['#dailyvlog', '#aesthetic', '#fyp', '#explore', '#mood', '#vibes', '#instagood', '#reels', '#trending', '#moments'];
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 3).map((c, i) => `${c} ${tags.slice(i * 2, i * 2 + 2).join(' ')}`);
  },
};

seedIfNeeded();
