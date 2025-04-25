import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

const Forum = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      title: "Tips for Data Structures Midterm",
      author: "Alice Johnson",
      authorInitials: "AJ",
      content: "I'm preparing for the Data Structures midterm next week. Any tips on what to focus on? I'm particularly struggling with AVL trees and red-black trees.",
      date: "2025-04-20",
      replies: 5,
      views: 42,
      tags: ["Data Structures", "Exam Prep", "Algorithms"]
    },
    {
      id: 2,
      title: "Web Development Project Group",
      author: "Bob Smith",
      authorInitials: "BS",
      content: "Looking for 2-3 people to join my Web Development final project group. We're planning to build a full-stack application using React and Node.js.",
      date: "2025-04-18",
      replies: 8,
      views: 76,
      tags: ["Web Development", "Project", "Group Work"]
    },
    {
      id: 3,
      title: "Machine Learning Resource Recommendations",
      author: "Carol Davis",
      authorInitials: "CD",
      content: "Can anyone recommend good resources for getting started with machine learning? I'm looking for tutorials, courses, or books that are beginner-friendly.",
      date: "2025-04-15",
      replies: 12,
      views: 103,
      tags: ["Machine Learning", "Resources", "AI"]
    }
  ]);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    tags: ""
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost({ ...newPost, [name]: value });
  };

  const handleAddPost = () => {
    const id = discussions.length > 0 ? Math.max(...discussions.map(d => d.id)) + 1 : 1;
    const tags = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    setDiscussions([
      {
        id,
        title: newPost.title,
        author: user?.user_metadata?.full_name || user?.email || "Anonymous User",
        authorInitials: (user?.user_metadata?.full_name || "AU").split(" ").map((n) => n[0]).join(""),
        content: newPost.content,
        date: new Date().toISOString().split('T')[0],
        replies: 0,
        views: 0,
        tags
      },
      ...discussions
    ]);
    
    setNewPost({
      title: "",
      content: "",
      tags: ""
    });
    
    setDialogOpen(false);
  };

  const filteredDiscussions = discussions.filter(discussion => {
    return discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           discussion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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
          />
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-education-primary hover:bg-education-primary/90">
                New Discussion
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
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Discussions</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
          <TabsTrigger value="my">My Posts</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-4">
        {filteredDiscussions.length > 0 ? (
          filteredDiscussions.map(discussion => (
            <Card key={discussion.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg font-semibold text-education-primary hover:text-education-primary/80 cursor-pointer">
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
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-education-primary text-white">
                      {discussion.authorInitials}
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
                  <span>{discussion.replies} replies</span>
                  <span>{discussion.views} views</span>
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
    </div>
  );
};

export default Forum;
