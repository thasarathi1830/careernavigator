import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Sheet,
  SheetContent,
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, User, Eye, Check, Plus, MessageSquareText } from "lucide-react";

interface ForumPost {
  id: string;
  title: string;
  author: string;
  author_id: string;
  author_avatar?: string;
  content: string;
  date: string;
  replies: number;
  views: number;
  tags: string[];
  is_answered: boolean;
}

interface ForumReply {
  id: string;
  post_id: string;
  author: string;
  author_id: string;
  author_avatar?: string;
  content: string;
  date: string;
  is_accepted_answer: boolean;
}

const Forum = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    tags: ""
  });

  const [newReply, setNewReply] = useState("");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data: postsData, error: postsError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            profiles:profile_id (
              full_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });
          
        if (postsError) throw postsError;
        
        const { data: replyCounts, error: replyCountError } = await supabase
          .from('forum_replies')
          .select('post_id, count', { count: 'exact' })
          .group('post_id');
          
        if (replyCountError) throw replyCountError;
        
        const processedPosts: ForumPost[] = postsData.map(post => {
          const replyCount = replyCounts.find(r => r.post_id === post.id)?.count || 0;
          
          return {
            id: post.id,
            title: post.title,
            author: post.profiles?.full_name || 'Anonymous',
            author_id: post.profile_id,
            author_avatar: post.profiles?.avatar_url,
            content: post.content,
            date: new Date(post.created_at).toISOString().split('T')[0],
            replies: replyCount,
            views: post.views || 0,
            tags: post.tags || [],
            is_answered: post.is_answered
          };
        });
        
        setDiscussions(processedPosts);
      } catch (error) {
        console.error("Error fetching forum posts:", error);
        toast({
          title: "Error",
          description: "Failed to load discussions",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
    
    const postsChannel = supabase
      .channel('public:forum_posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'forum_posts' }, 
        () => {
          fetchPosts();
        }
      )
      .subscribe();
      
    const repliesChannel = supabase
      .channel('public:forum_replies')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'forum_replies' }, 
        () => {
          if (selectedPost) {
            fetchReplies(selectedPost.id);
          }
          fetchPosts();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(repliesChannel);
    };
  }, [toast, selectedPost]);

  const fetchReplies = async (postId: string) => {
    if (!postId) return;
    
    try {
      setLoadingReplies(true);
      
      await supabase
        .from('forum_posts')
        .update({ views: discussions.find(d => d.id === postId)?.views + 1 || 1 })
        .eq('id', postId);
      
      const { data, error } = await supabase
        .from('forum_replies')
        .select(`
          *,
          profiles:profile_id (
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      const processedReplies: ForumReply[] = data.map(reply => ({
        id: reply.id,
        post_id: reply.post_id,
        author: reply.profiles?.full_name || 'Anonymous',
        author_id: reply.profile_id,
        author_avatar: reply.profiles?.avatar_url,
        content: reply.content,
        date: new Date(reply.created_at).toISOString().split('T')[0],
        is_accepted_answer: reply.is_accepted_answer
      }));
      
      setReplies(processedReplies);
    } catch (error) {
      console.error("Error fetching replies:", error);
      toast({
        title: "Error",
        description: "Failed to load discussion replies",
        variant: "destructive"
      });
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost({ ...newPost, [name]: value });
  };

  const handleAddPost = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const tags = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          profile_id: user.id,
          title: newPost.title,
          content: newPost.content,
          tags: tags,
          views: 0
        });
        
      if (error) throw error;
      
      setNewPost({
        title: "",
        content: "",
        tags: ""
      });
      
      setDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Discussion post created successfully"
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create discussion post",
        variant: "destructive"
      });
    }
  };
  
  const handleAddReply = async () => {
    if (!user || !selectedPost) {
      toast({
        title: "Error",
        description: "You must be logged in to reply",
        variant: "destructive"
      });
      return;
    }
    
    if (!newReply.trim()) {
      toast({
        title: "Error",
        description: "Reply content cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('forum_replies')
        .insert({
          post_id: selectedPost.id,
          profile_id: user.id,
          content: newReply
        });
        
      if (error) throw error;
      
      setNewReply("");
      
      toast({
        title: "Success",
        description: "Reply added successfully"
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive"
      });
    }
  };
  
  const handleAcceptAnswer = async (replyId: string) => {
    if (!user || !selectedPost) return;
    
    try {
      if (user.id !== selectedPost.author_id) {
        toast({
          title: "Error",
          description: "Only the post author can mark an answer as accepted",
          variant: "destructive"
        });
        return;
      }
      
      await supabase
        .from('forum_replies')
        .update({ is_accepted_answer: false })
        .eq('post_id', selectedPost.id);
      
      const { error } = await supabase
        .from('forum_replies')
        .update({ is_accepted_answer: true })
        .eq('id', replyId);
        
      if (error) throw error;
      
      await supabase
        .from('forum_posts')
        .update({ is_answered: true })
        .eq('id', selectedPost.id);
      
      setSelectedPost({
        ...selectedPost,
        is_answered: true
      });
      
      toast({
        title: "Success",
        description: "Answer marked as accepted"
      });
    } catch (error) {
      console.error("Error accepting answer:", error);
      toast({
        title: "Error",
        description: "Failed to mark answer as accepted",
        variant: "destructive"
      });
    }
  };

  const openDiscussion = (discussion: ForumPost) => {
    setSelectedPost(discussion);
    fetchReplies(discussion.id);
    setSheetOpen(true);
  };

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = 
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesTab = true;
    if (activeTab === "popular") {
      matchesTab = discussion.views > 10 || discussion.replies > 5;
    } else if (activeTab === "unanswered") {
      matchesTab = !discussion.is_answered;
    } else if (activeTab === "my" && user) {
      matchesTab = discussion.author_id === user.id;
    }
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Discussion Forum</h1>
          <p className="text-gray-500 mt-1">Connect with fellow students and share knowledge</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Input
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
            aria-label="Search discussions"
          />
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-education-primary hover:bg-education-primary/90">
                <Plus className="h-4 w-4 mr-2" /> New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Discussion</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Discussion title"
                    value={newPost.title}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Write your discussion post here..."
                    rows={5}
                    value={newPost.content}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="e.g. Programming, Help, Project"
                    value={newPost.tags}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddPost}>Post Discussion</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Discussions</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
          <TabsTrigger value="my">My Posts</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-4">
        {loading ? (
          <Card className="p-8 flex items-center justify-center">
            <p>Loading discussions...</p>
          </Card>
        ) : filteredDiscussions.length > 0 ? (
          filteredDiscussions.map(discussion => (
            <Card 
              key={discussion.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openDiscussion(discussion)}
              tabIndex={0}
              role="button"
              aria-label={`Discussion: ${discussion.title} by ${discussion.author}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  openDiscussion(discussion);
                  e.preventDefault();
                }
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg font-semibold text-education-primary hover:text-education-primary/80 flex items-center gap-2">
                    {discussion.is_answered && (
                      <Check className="h-4 w-4 text-green-500" aria-label="Answered question" />
                    )}
                    {discussion.title}
                  </CardTitle>
                  <div className="text-sm text-gray-500">
                    {discussion.date}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-3">
                  <Avatar>
                    <AvatarImage src={discussion.author_avatar || ""} alt={discussion.author} />
                    <AvatarFallback className="bg-education-primary text-white">
                      {discussion.author.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{discussion.author}</p>
                    <p className="text-gray-500 text-sm">Student</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-2">{discussion.content}</p>
                <div className="flex flex-wrap gap-2">
                  {discussion.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <div className="flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {discussion.replies} {discussion.replies === 1 ? "reply" : "replies"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {discussion.views} {discussion.views === 1 ? "view" : "views"}
                  </span>
                </div>
                <Button variant="ghost" size="sm">View Discussion</Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No discussions found matching your search.</p>
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            </div>
          </Card>
        )}
      </div>
      
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              {selectedPost?.is_answered && (
                <Check className="h-4 w-4 text-green-500" aria-label="Answered question" />
              )}
              {selectedPost?.title}
            </SheetTitle>
            <SheetDescription>
              Posted by {selectedPost?.author} on {selectedPost?.date}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-4 space-y-6">
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Avatar>
                  <AvatarImage src={selectedPost?.author_avatar || ""} alt={selectedPost?.author} />
                  <AvatarFallback className="bg-education-primary text-white">
                    {selectedPost?.author.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedPost?.author}</p>
                  <p className="text-xs text-gray-500">Original poster</p>
                </div>
              </div>
              
              <div className="text-gray-700 whitespace-pre-wrap">
                {selectedPost?.content}
              </div>
              
              <div className="flex flex-wrap gap-1 pt-2">
                {selectedPost?.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">{replies.length} Replies</h3>
              
              {loadingReplies ? (
                <p className="text-center p-4">Loading replies...</p>
              ) : replies.length === 0 ? (
                <p className="text-center border rounded-lg p-4 text-gray-500">
                  No replies yet. Be the first to reply!
                </p>
              ) : (
                replies.map((reply) => (
                  <div 
                    key={reply.id} 
                    className={`border rounded-lg p-4 ${reply.is_accepted_answer ? 'border-green-500 bg-green-50' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar>
                          <AvatarImage src={reply.author_avatar || ""} alt={reply.author} />
                          <AvatarFallback className="bg-gray-300 text-gray-700">
                            {reply.author.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{reply.author}</p>
                          <p className="text-xs text-gray-500">{reply.date}</p>
                        </div>
                      </div>
                      
                      {user && user.id === selectedPost?.author_id && !reply.is_accepted_answer && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptAnswer(reply.id);
                          }}
                        >
                          Accept answer
                        </Button>
                      )}
                      
                      {reply.is_accepted_answer && (
                        <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">
                          Accepted Answer
                        </span>
                      )}
                    </div>
                    
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {reply.content}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {user ? (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Your Reply</h3>
                <Textarea
                  placeholder="Write your reply here..."
                  rows={4}
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  className="mb-4"
                  ref={replyInputRef}
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddReply}>
                    Post Reply
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-4 text-center">
                <p className="mb-2">You must be logged in to reply</p>
                <Button variant="outline" onClick={() => window.location.href = "/auth"}>
                  Sign In to Reply
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Forum;
