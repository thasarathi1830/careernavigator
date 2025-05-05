
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profile_id: string;
  tags: string[] | null;
  views: number;
  is_answered: boolean;
}

export interface ExtendedForumPost extends ForumPost {
  author?: string;
  author_id: string;
  author_avatar?: string;
  date: string;
  replies: number;
}

export interface ForumReply {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  profile_id: string;
  is_accepted_answer: boolean;
}

export interface ExtendedForumReply extends ForumReply {
  author?: string;
  author_id: string;
  author_avatar?: string;
  date: string;
}

export interface Profile {
  full_name?: string;
  avatar_url?: string;
}
