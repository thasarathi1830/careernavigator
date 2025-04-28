import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profile_id: string;
  tags: string[] | null;
  views: number;
  is_answered: boolean;
}

interface ExtendedForumPost extends ForumPost {
  author?: string;
  author_id: string;
  author_avatar?: string;
  date: string;
  replies: number;
}

interface ForumReply {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  profile_id: string;
  is_accepted_answer: boolean;
}

interface ExtendedForumReply extends ForumReply {
  author?: string;
  author_id: string;
  author_avatar?: string;
  date: string;
}

interface Profile {
  full_name?: string;
  avatar_url?: string;
}

const Forum = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ExtendedForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ExtendedForumPost | null>(null);
  const [replies, setReplies] = useState<ExtendedForumReply[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);
  
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          if (user && user.id === userId) {
            await createUserProfile(userId);
            return { full_name: "New User", avatar_url: null };
          }
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

  const fetchPosts = async () => {
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
        (postsData || []).map(async (post) => {
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
  };

  const selectPost = async (post: ExtendedForumPost) => {
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
        (repliesData || []).map(async (reply) => {
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
  };

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
        const newPost = {
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

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Student Forum</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search discussions..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {user && (
            <Button onClick={() => setIsCreatingPost(true)} className="whitespace-nowrap">
              <PlusCircle className="h-4 w-4 mr-2" /> New Discussion
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Recent Discussions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4">Loading discussions...</div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-4 text-center">
                  {searchTerm ? "No discussions found matching your search" : "No discussions yet. Be the first to start one!"}
                </div>
              ) : (
                <ul className="divide-y">
                  {filteredPosts.map((post) => (
                    <li 
                      key={post.id}
                      className={`p-4 hover:bg-muted cursor-pointer ${selectedPost?.id === post.id ? 'bg-muted' : ''}`}
                      onClick={() => selectPost(post)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium line-clamp-2">{post.title}</h3>
                        {post.is_answered && (
                          <Badge variant="default" className="ml-2 shrink-0">Solved</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <span>{post.author} • {post.date}</span>
                        <span>{post.replies} replies • {post.views} views</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {isCreatingPost ? (
            <Card>
              <CardHeader>
                <CardTitle>Create New Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="postTitle" className="block text-sm font-medium mb-1">Title</label>
                    <Input 
                      id="postTitle"
                      value={newPostTitle} 
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Enter a descriptive title" 
                    />
                  </div>
                  <div>
                    <label htmlFor="postContent" className="block text-sm font-medium mb-1">Content</label>
                    <Textarea 
                      id="postContent"
                      value={newPostContent} 
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Describe your question or topic in detail" 
                      rows={8}
                    />
                  </div>
                  <div>
                    <label htmlFor="postTags" className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                    <Input 
                      id="postTags"
                      value={newPostTags} 
                      onChange={(e) => setNewPostTags(e.target.value)}
                      placeholder="e.g. java, programming, homework" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">Add relevant tags to help others find your post</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreatingPost(false)}>Cancel</Button>
                <Button onClick={createNewPost}>Post Discussion</Button>
              </CardFooter>
            </Card>
          ) : selectedPost ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedPost.title}</CardTitle>
                    <div className="flex items-center mt-2">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={selectedPost.author_avatar || ''} alt={selectedPost.author} />
                        <AvatarFallback>{selectedPost.author?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{selectedPost.author} • {selectedPost.date}</span>
                    </div>
                  </div>
                  {selectedPost.is_answered && (
                    <Badge variant="default">Solved</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>{selectedPost.content}</p>
                </div>
                
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {selectedPost.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                )}
                
                <div className="border-t mt-6 pt-6">
                  <h3 className="font-semibold mb-4">{replies.length} Replies</h3>
                  
                  {replies.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No replies yet. Be the first to respond!
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {replies.map((reply) => (
                        <div 
                          key={reply.id} 
                          className={`p-4 rounded-md ${reply.is_accepted_answer ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-900' : 'bg-muted/40'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={reply.author_avatar || ''} alt={reply.author} />
                                <AvatarFallback>{reply.author?.[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{reply.author}</span>
                              <span className="text-xs text-muted-foreground ml-2">{reply.date}</span>
                            </div>
                            
                            {reply.is_accepted_answer && (
                              <Badge variant="default" className="bg-green-600">Solution</Badge>
                            )}
                            
                            {user && user.id === selectedPost.author_id && !reply.is_accepted_answer && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-xs h-7"
                                onClick={() => markAsAnswer(reply.id)}
                              >
                                Mark as Solution
                              </Button>
                            )}
                          </div>
                          
                          <div className="mt-2 text-sm">
                            {reply.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {user ? (
                  <div className="w-full space-y-4">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={submitReply} disabled={!replyContent.trim()}>
                      Submit Reply
                    </Button>
                  </div>
                ) : (
                  <div className="w-full text-center py-4">
                    <p className="text-muted-foreground mb-2">You need to sign in to reply</p>
                    <Button variant="outline" onClick={() => navigate("/auth")}>Sign In</Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
              <div>
                <h3 className="font-medium text-lg mb-2">Select a discussion</h3>
                <p className="text-muted-foreground">Choose a topic from the list to view the discussion</p>
                {user && (
                  <Button 
                    onClick={() => setIsCreatingPost(true)} 
                    className="mt-4"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> 
                    Start a new discussion
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;
