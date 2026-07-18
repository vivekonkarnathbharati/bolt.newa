/*
# SocialHub Core Schema

1. Purpose
   Multi-user social media app with sign-in. Users have profiles, can post text/image posts,
   like and comment on posts, follow other users, and explore content.

2. New Tables
   - `profiles` — public user profile data linked to auth.users
     - id (uuid, PK, FK -> auth.users.id)
     - username (text, unique, not null)
     - full_name (text)
     - bio (text)
     - avatar_url (text)
     - created_at (timestamptz)
   - `posts` — user posts
     - id (uuid, PK)
     - user_id (uuid, FK -> auth.users.id, default auth.uid())
     - content (text, not null)
     - image_url (text)
     - created_at (timestamptz)
   - `likes` — likes on posts
     - id (uuid, PK)
     - user_id (uuid, FK -> auth.users.id, default auth.uid())
     - post_id (uuid, FK -> posts.id ON DELETE CASCADE)
     - created_at (timestamptz)
     - unique (user_id, post_id)
   - `comments` — comments on posts
     - id (uuid, PK)
     - user_id (uuid, FK -> auth.users.id, default auth.uid())
     - post_id (uuid, FK -> posts.id ON DELETE CASCADE)
     - content (text, not null)
     - created_at (timestamptz)
   - `follows` — follow relationships
     - id (uuid, PK)
     - follower_id (uuid, FK -> auth.users.id, default auth.uid())
     - following_id (uuid, FK -> auth.users.id, ON DELETE CASCADE)
     - created_at (timestamptz)
     - unique (follower_id, following_id)

3. Security
   - RLS enabled on all tables.
   - profiles: anyone authenticated can read; owners can update/insert their own.
   - posts: anyone authenticated can read; owners can insert/update/delete their own.
   - likes: anyone authenticated can read; authenticated can insert/delete their own.
   - comments: anyone authenticated can read; owners can insert/delete their own.
   - follows: anyone authenticated can read; authenticated can insert/delete their own follows.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select_all" ON posts;
CREATE POLICY "posts_select_all" ON posts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "posts_insert_own" ON posts;
CREATE POLICY "posts_insert_own" ON posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_update_own" ON posts;
CREATE POLICY "posts_update_own" ON posts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_delete_own" ON posts;
CREATE POLICY "posts_delete_own" ON posts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, post_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "likes_select_all" ON likes;
CREATE POLICY "likes_select_all" ON likes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "likes_insert_own" ON likes;
CREATE POLICY "likes_insert_own" ON likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "likes_delete_own" ON likes;
CREATE POLICY "likes_delete_own" ON likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select_all" ON comments;
CREATE POLICY "comments_select_all" ON comments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "comments_insert_own" ON comments;
CREATE POLICY "comments_insert_own" ON comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete_own" ON comments;
CREATE POLICY "comments_delete_own" ON comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follows_select_all" ON follows;
CREATE POLICY "follows_select_all" ON follows FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "follows_insert_own" ON follows;
CREATE POLICY "follows_insert_own" ON follows FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "follows_delete_own" ON follows;
CREATE POLICY "follows_delete_own" ON follows FOR DELETE
  TO authenticated USING (auth.uid() = follower_id);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows (following_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows (follower_id);

-- Auto-create a profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)),
    coalesce(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
