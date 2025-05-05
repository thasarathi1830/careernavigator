
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface EmptyStateProps {
  onStartNewDiscussion: () => void;
  isUserAuthenticated: boolean;
}

export const EmptyState = ({ onStartNewDiscussion, isUserAuthenticated }: EmptyStateProps) => {
  return (
    <div className="h-full flex items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
      <div>
        <h3 className="font-medium text-lg mb-2">Select a discussion</h3>
        <p className="text-muted-foreground">Choose a topic from the list to view the discussion</p>
        {isUserAuthenticated && (
          <Button 
            onClick={onStartNewDiscussion} 
            className="mt-4"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> 
            Start a new discussion
          </Button>
        )}
      </div>
    </div>
  );
};
