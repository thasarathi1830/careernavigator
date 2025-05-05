
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExtendedForumPost, ExtendedForumReply } from "@/types/Forum";
import { useNavigate } from "react-router-dom";

interface ForumPostDetailProps {
  post: ExtendedForumPost;
  replies: ExtendedForumReply[];
  replyContent: string;
  onReplyContentChange: (value: string) => void;
  onSubmitReply: () => void;
  onMarkAsAnswer: (replyId: string) => void;
  isUserAuthenticated: boolean;
  isPostAuthor: boolean;
}

export const ForumPostDetail = ({
  post,
  replies,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onMarkAsAnswer,
  isUserAuthenticated,
  isPostAuthor
}: ForumPostDetailProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{post.title}</h2>
            <div className="flex items-center mt-2">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={post.author_avatar || ''} alt={post.author} />
                <AvatarFallback>{post.author?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{post.author} • {post.date}</span>
            </div>
          </div>
          {post.is_answered && (
            <Badge variant="default">Solved</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p>{post.content}</p>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {post.tags.map((tag, idx) => (
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
                    
                    {isPostAuthor && !reply.is_accepted_answer && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-xs h-7"
                        onClick={() => onMarkAsAnswer(reply.id)}
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
        {isUserAuthenticated ? (
          <div className="w-full space-y-4">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => onReplyContentChange(e.target.value)}
              rows={4}
            />
            <Button onClick={onSubmitReply} disabled={!replyContent.trim()}>
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
  );
};
