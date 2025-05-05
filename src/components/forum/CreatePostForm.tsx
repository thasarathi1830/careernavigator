
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreatePostFormProps {
  title: string;
  content: string;
  tags: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const CreatePostForm = ({
  title,
  content,
  tags,
  onTitleChange,
  onContentChange,
  onTagsChange,
  onSubmit,
  onCancel
}: CreatePostFormProps) => {
  return (
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
              value={title} 
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter a descriptive title" 
            />
          </div>
          <div>
            <label htmlFor="postContent" className="block text-sm font-medium mb-1">Content</label>
            <Textarea 
              id="postContent"
              value={content} 
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Describe your question or topic in detail" 
              rows={8}
            />
          </div>
          <div>
            <label htmlFor="postTags" className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <Input 
              id="postTags"
              value={tags} 
              onChange={(e) => onTagsChange(e.target.value)}
              placeholder="e.g. java, programming, homework" 
            />
            <p className="text-xs text-muted-foreground mt-1">Add relevant tags to help others find your post</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSubmit}>Post Discussion</Button>
      </CardFooter>
    </Card>
  );
};
