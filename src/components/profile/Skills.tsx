
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SkillsProps {
  skills: Tables<"skills">[];
  isEditMode: boolean;
  profileId: string;
  onSkillsChange: () => void;
}

export const Skills = ({ skills, isEditMode, profileId, onSkillsChange }: SkillsProps) => {
  const [newSkill, setNewSkill] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    
    try {
      const { error } = await supabase
        .from('skills')
        .insert({
          name: newSkill.trim(),
          profile_id: profileId
        });

      if (error) throw error;
      
      setNewSkill("");
      setIsAdding(false);
      onSkillsChange();
      
      toast({
        title: "Skill added",
        description: `${newSkill} has been added to your skills.`
      });
    } catch (error: any) {
      toast({
        title: "Error adding skill",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRemoveSkill = async (skillId: string, skillName: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;
      
      onSkillsChange();
      
      toast({
        title: "Skill removed",
        description: `${skillName} has been removed from your skills.`
      });
    } catch (error: any) {
      toast({
        title: "Error removing skill",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Skills</h2>
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div 
              key={skill.id} 
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
            >
              {skill.name}
              {isEditMode && (
                <button 
                  onClick={() => handleRemoveSkill(skill.id, skill.name)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          
          {isEditMode && !isAdding ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full flex items-center gap-1"
              onClick={() => setIsAdding(true)}
            >
              <Plus size={14} /> Add Skill
            </Button>
          ) : null}
        </div>
        
        {isEditMode && isAdding && (
          <div className="mt-4 flex items-center gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Enter skill name"
              className="flex-1"
            />
            <Button onClick={handleAddSkill} size="sm">Add</Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsAdding(false);
                setNewSkill("");
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
