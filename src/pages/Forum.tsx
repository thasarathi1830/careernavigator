import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, User, Eye, Check, Plus, MessageSquareText } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface ExtendedForumPost extends Tables<'forum_posts'> {
  author: string;
  author_id: string;
  author_avatar?: string;
  date: string;
  replies: number;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  }[];
}

interface ExtendedForumReply extends Tables<'forum_replies'> {
  author: string;
  author_id: string;
  author_avatar?: string;
  date: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  }[];
}

const Forum = () => {
  const [posts, setPosts] = useState<ExtendedForumPost[]>([]);
  const [replies, setReplies] = useState<ExtendedForumReply[]>([]);
  const [selectedPost, setSelectedPost] = useState<ExtendedForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" });
  const [newReply, setNewReply] = useState("");
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:profile_id (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
        
      if (postsError) throw postsError;

      const { data: replyCounts, error: replyError } = await supabase
        .from('forum_replies')
        .select('post_id', { count: 'exact' });

      if (replyError) throw replyError;

      const processedPosts: ExtendedForumPost[] = postsData.map(post => {
        const replyCount = replyCounts.filter(r => r.post_id === post.id).length;
        
        return {
          ...post,
          author: post.profiles?.[0]?.full_name || 'Anonymous',
          author_id: post.profile_id,
          author_avatar: post.profiles?.[0]?.avatar_url,
          date: new Date(post.created_at).toISOString().split('T')[0],
          replies: replyCount,
          profiles: post.profiles
        };
      });
      
      setPosts(processedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load forum posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const tags = newPost.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { data, error } = await supabase
        .from('forum_posts')
        .insert([
          {
            title: newPost.title,
            content: newPost.content,
            tags,
            profile_id: (await supabase.auth.getUser()).data.user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully",
      });

      setNewPost({ title: "", content: "", tags: "" });
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const fetchReplies = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .select(`
          *,
          profiles:profile_id (full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;

      const processedReplies: ExtendedForumReply[] = data.map(reply => ({
        ...reply,
        author: reply.profiles?.[0]?.full_name || 'Anonymous',
        author_id: reply.profile_id,
        author_avatar: reply.profiles?.[0]?.avatar_url,
        date: new Date(reply.created_at).toISOString().split('T')[0],
        profiles: reply.profiles
      }));
      
      setReplies(processedReplies);
    } catch (error) {
      console.error('Error fetching replies:', error);
      toast({
        title: "Error",
        description: "Failed to load replies",
        variant: "destructive",
      });
    }
  };

  const createReply = async (postId: string) => {
    if (!newReply.trim()) {
      toast({
        title: "Error",
        description: "Reply content is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .insert([
          {
            content: newReply,
            post_id: postId,
            profile_id: (await supabase.auth.getUser()).data.user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reply created successfully",
      });

      setNewReply("");
      await fetchReplies(postId);
    } catch (error) {
      console.error('Error creating reply:', error);
      toast({
        title: "Error",
        description: "Failed to create reply",
        variant: "destructive",
      });
    }
  };

  const handlePostClick = async (post: ExtendedForumPost) => {
    setSelectedPost(post);
    await fetchReplies(post.id);

    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === post.id ? { ...p, views: p.views + 1 } : p
      )
    );

    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({ views: post.views + 1 })
        .eq('id', post.id);

      if (error) {
        console.error('Error updating views:', error);
        toast({
          title: "Error",
          description: "Failed to update views",
          variant: "destructive",
        });

        setPosts(prevPosts =>
          prevPosts.map(p => (p.id === post.id ? { ...p, views: p.views } : p))
        );
      }
    } catch (error) {
      console.error('Error updating views:', error);
      toast({
        title: "Error",
        description: "Failed to update views",
        variant: "destructive",
      });

      setPosts(prevPosts =>
        prevPosts.map(p => (p.id === post.id ? { ...p, views: p.views } : p))
      );
    }
  };

  const view = (num: number) => {
    if (num < 1000) {
      return num.toString();
    } else if (num < 1000000) {
      return (num / 1000).toFixed(1) + "K";
    } else {
      return (num / 1000000).toFixed(1) + "M";
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Forum</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a New Post</DialogTitle>
              <DialogDescription>
                Share your thoughts or ask a question to the community.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={newPost.tags}
                  onChange={(e) =>
                    setNewPost({ ...newPost, tags: e.target.value })
                  }
                  placeholder="react, javascript, help"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right mt-2">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <Button type="submit" onClick={createPost}>
              Create Post
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} onClick={() => handlePostClick(post)} className="cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {post.title}
                  <Badge variant="secondary">{post.tags?.join(", ")}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    {post.author_avatar ? (
                      <AvatarImage src={post.author_avatar} alt={post.author} />
                    ) : (
                      <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium">{post.author}</div>
                    <div className="text-sm text-gray-500">{post.date}</div>
                  </div>
                </div>
                <p className="mt-2">{post.content.substring(0, 100)}...</p>
                <div className="flex items-center mt-4 space-x-4">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.replies}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span>{view(post.views)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={selectedPost !== null} onOpenChange={() => setSelectedPost(null)}>
        {selectedPost && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                {selectedPost.title}
                <Badge variant="secondary">{selectedPost.tags?.join(", ")}</Badge>
              </DialogTitle>
              <DialogDescription>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    {selectedPost.author_avatar ? (
                      <AvatarImage src={selectedPost.author_avatar} alt={selectedPost.author} />
                    ) : (
                      <AvatarFallback>{selectedPost.author.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedPost.author}</div>
                    <div className="text-sm text-gray-500">{selectedPost.date}</div>
                  </div>
                </div>
                <p className="mt-2">{selectedPost.content}</p>
                <div className="flex items-center mt-4 space-x-4">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <MessageSquare className="h-4 w-4" />
                    <span>{selectedPost.replies}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span>{view(selectedPost.views)}</span>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <h3 className="text-xl font-bold mb-2">Replies</h3>
              {replies.map((reply) => (
                <Card key={reply.id} className="mb-4">
                  <CardContent>
                    <div className="flex items-center space-x-4 mb-2">
                      <Avatar>
                        {reply.author_avatar ? (
                          <AvatarImage src={reply.author_avatar} alt={reply.author} />
                        ) : (
                          <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-medium">{reply.author}</div>
                        <div className="text-sm text-gray-500">{reply.date}</div>
                      </div>
                    </div>
                    <p>{reply.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-4">
              <Textarea
                placeholder="Write your reply here..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
              />
              <Button className="mt-2" onClick={() => createReply(selectedPost.id)}>
                Submit Reply
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default Forum;
