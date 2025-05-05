
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExtendedForumPost, ExtendedForumReply, ForumPost, ForumReply } from "@/types/Forum";

export const useForumData = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<ExtendedForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ExtendedForumPost | null>(null);
  const [replies, setReplies] = useState<ExtendedForumReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          return { full_name: "New User", avatar_url: null };
        }
        console.error("Error fetching profile:", error);
        return { full_name: "Unknown User", avatar_url: null };
      }
      
      return data || { full_name: "Unknown User", avatar_url: null };
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      return { full_name: "Unknown User", avatar_url: null };
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      await supabase.from("profiles").insert({
        id: userId,
        full_name: "New User",
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch forum posts
      const { data: postsData, error: postsError } = await supabase
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error fetching posts:", postsError);
        toast({
          title: "Error",
          description: "Failed to load discussions. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Fetch profile information and reply counts for each post
      const postsWithDetails = await Promise.all(
        (postsData || []).map(async (post: ForumPost) => {
          // Get profile information
          const profile = await fetchUserProfile(post.profile_id);
          
          // Get reply count
          const { count, error: countError } = await supabase
            .from("forum_replies")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);
            
          if (countError) console.error("Error counting replies:", countError);

          return {
            ...post,
            author: profile.full_name || "Unknown User",
            author_id: post.profile_id,
            author_avatar: profile.avatar_url,
            date: new Date(post.created_at).toLocaleDateString(),
            replies: count || 0
          };
        })
      );

      setPosts(postsWithDetails);
    } catch (error) {
      console.error("Error in fetchPosts:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const selectPost = useCallback(async (post: ExtendedForumPost) => {
    setSelectedPost(post);
    
    try {
      // Increment view count
      await supabase
        .from("forum_posts")
        .update({ views: post.views + 1 })
        .eq("id", post.id);
      
      // Fetch replies for the selected post
      const { data: repliesData, error: repliesError } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("post_id", post.id)
        .order("is_accepted_answer", { ascending: false })
        .order("created_at", { ascending: true });
      
      if (repliesError) {
        console.error("Error fetching replies:", repliesError);
        toast({
          title: "Error",
          description: "Failed to load replies. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Fetch profile information for each reply
      const formattedReplies = await Promise.all(
        (repliesData || []).map(async (reply: ForumReply) => {
          const profile = await fetchUserProfile(reply.profile_id);
          
          return {
            ...reply,
            author: profile.full_name || "Unknown User",
            author_id: reply.profile_id,
            author_avatar: profile.avatar_url,
            date: new Date(reply.created_at).toLocaleDateString()
          };
        })
      );
      
      setReplies(formattedReplies);
    } catch (error) {
      console.error("Error in selectPost:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    selectedPost,
    setSelectedPost,
    replies,
    isLoading,
    fetchPosts,
    selectPost,
    fetchUserProfile,
    createUserProfile,
    setReplies
  };
};
