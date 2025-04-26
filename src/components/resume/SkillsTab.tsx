
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { Skill, ResumeData } from '@/types/resume';

interface SkillsTabProps {
  resumeData: ResumeData;
  handleAddSkill: () => void;
  handleUpdateSkill: (index: number, field: keyof Skill, value: any) => void;
  handleRemoveSkill: (index: number) => void;
  setActiveTab: (tab: string) => void;
}

const SkillsTab: React.FC<SkillsTabProps> = ({
  resumeData,
  handleAddSkill,
  handleUpdateSkill,
  handleRemoveSkill,
  setActiveTab
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resumeData.skills.map((skill, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-2 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleRemoveSkill(index)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
            
            <div className="space-y-2">
              <Label htmlFor={`skill-name-${index}`}>Skill</Label>
              <Input
                id={`skill-name-${index}`}
                value={skill.name}
                onChange={(e) => handleUpdateSkill(index, "name", e.target.value)}
                placeholder="JavaScript"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`skill-level-${index}`}>Proficiency Level</Label>
              <select
                id={`skill-level-${index}`}
                value={skill.level}
                onChange={(e) => handleUpdateSkill(index, "level", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      
      <Button
        variant="outline"
        onClick={handleAddSkill}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Skill
      </Button>
      
      <div className="flex justify-between">
        <Button 
          variant="ghost"
          onClick={() => setActiveTab("education")}
        >
          Back
        </Button>
        <Button 
          onClick={() => setActiveTab("projects")}
          className="flex items-center gap-2"
        >
          Next: Projects <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SkillsTab;
