
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ForumPostList } from "@/components/forum/ForumPostList";
import { ForumPostDetail } from "@/components/forum/ForumPostDetail";
import { CreatePostForm } from "@/components/forum/CreatePostForm";
import { EmptyState } from "@/components/forum/EmptyState";
import { useForumData } from "@/hooks/useForumData";
import { ExtendedForumPost } from "@/types/Forum";

const Forum = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [replyContent, setReplyContent] = useState("");
  
  const { 
    posts, 
    selectedPost, 
    setSelectedPost, 
    replies, 
    isLoading, 
    fetchPosts, 
    selectPost, 
    fetchUserProfile,
    setReplies 
  } = useForumData();

  const submitReply = async () => {
    if (!user || !selectedPost || !replyContent.trim()) {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You need to sign in to post a reply.",
          variant: "destructive"
        });
      }
      return;
    }
    
    try {
      const { error } = await supabase
        .from("forum_replies")
        .insert({
          content: replyContent,
          post_id: selectedPost.id,
          profile_id: user.id,
          is_accepted_answer: false
        });
      
      if (error) {
        console.error("Error submitting reply:", error);
        toast({
          title: "Error",
          description: "Failed to submit reply. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Your reply has been posted.",
      });
      
      setReplyContent("");
      selectPost(selectedPost); // Refresh replies
    } catch (error) {
      console.error("Unexpected error submitting reply:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const markAsAnswer = async (replyId: string) => {
    if (!selectedPost || !user || user.id !== selectedPost.author_id) {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You need to sign in to mark an answer.",
          variant: "destructive"
        });
      } else if (user.id !== selectedPost?.author_id) {
        toast({
          title: "Permission Denied",
          description: "Only the post author can mark an answer as solution.",
          variant: "destructive"
        });
      }
      return;
    }
    
    try {
      // First, reset all replies for this post
      await supabase
        .from("forum_replies")
        .update({ is_accepted_answer: false })
        .eq("post_id", selectedPost.id);
      
      // Then mark the selected reply as the answer
      await supabase
        .from("forum_replies")
        .update({ is_accepted_answer: true })
        .eq("id", replyId);
      
      // Update the post to show it's been answered
      await supabase
        .from("forum_posts")
        .update({ is_answered: true })
        .eq("id", selectedPost.id);
      
      toast({
        title: "Success",
        description: "Answer marked as solution.",
      });
      
      selectPost(selectedPost); // Refresh replies
    } catch (error) {
      console.error("Error marking as answer:", error);
      toast({
        title: "Error",
        description: "Failed to mark solution. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createNewPost = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to sign in to create a post.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Post title and content are required.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Process tags into array
      const tagsArray = newPostTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      
      const { data, error } = await supabase
        .from("forum_posts")
        .insert({
          title: newPostTitle,
          content: newPostContent,
          tags: tagsArray.length > 0 ? tagsArray : null,
          profile_id: user.id
        })
        .select();
      
      if (error) {
        console.error("Error creating post:", error);
        toast({
          title: "Error",
          description: "Failed to create post. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Your post has been created.",
      });
      
      // Reset form and refresh posts
      setIsCreatingPost(false);
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostTags("");
      fetchPosts();
      
      // Select the newly created post if available
      if (data && data.length > 0) {
        const profile = await fetchUserProfile(user.id);
        const newPost: ExtendedForumPost = {
          ...data[0],
          author: profile.full_name || "Unknown User",
          author_id: user.id,
          author_avatar: profile.avatar_url,
          date: new Date(data[0].created_at).toLocaleDateString(),
          replies: 0
        };
        setSelectedPost(newPost);
        setReplies([]);
      }
    } catch (error) {
      console.error("Unexpected error creating post:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Student Forum</h1>
        <div className="flex gap-2">
          {user && (
            <Button onClick={() => setIsCreatingPost(true)} className="whitespace-nowrap">
              <PlusCircle className="h-4 w-4 mr-2" /> New Discussion
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ForumPostList
            posts={posts}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelectPost={selectPost}
            selectedPostId={selectedPost?.id}
          />
        </div>
        
        <div className="md:col-span-2">
          {isCreatingPost ? (
            <CreatePostForm
              title={newPostTitle}
              content={newPostContent}
              tags={newPostTags}
              onTitleChange={setNewPostTitle}
              onContentChange={setNewPostContent}
              onTagsChange={setNewPostTags}
              onSubmit={createNewPost}
              onCancel={() => setIsCreatingPost(false)}
            />
          ) : selectedPost ? (
            <ForumPostDetail
              post={selectedPost}
              replies={replies}
              replyContent={replyContent}
              onReplyContentChange={setReplyContent}
              onSubmitReply={submitReply}
              onMarkAsAnswer={markAsAnswer}
              isUserAuthenticated={!!user}
              isPostAuthor={user?.id === selectedPost.author_id}
            />
          ) : (
            <EmptyState 
              onStartNewDiscussion={() => setIsCreatingPost(true)} 
              isUserAuthenticated={!!user}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;
