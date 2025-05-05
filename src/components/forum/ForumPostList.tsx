
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExtendedForumPost } from "@/types/Forum";

interface ForumPostListProps {
  posts: ExtendedForumPost[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectPost: (post: ExtendedForumPost) => void;
  selectedPostId?: string;
}

export const ForumPostList = ({ 
  posts, 
  isLoading, 
  searchTerm, 
  onSearchChange, 
  onSelectPost,
  selectedPostId 
}: ForumPostListProps) => {
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle>Recent Discussions</CardTitle>
      </CardHeader>
      <div className="px-4 pb-2">
        <Input
          placeholder="Search discussions..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
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
                className={`p-4 hover:bg-muted cursor-pointer ${selectedPostId === post.id ? 'bg-muted' : ''}`}
                onClick={() => onSelectPost(post)}
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
  );
};
