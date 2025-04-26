
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { Experience, ResumeData } from '@/types/resume';

interface ExperienceTabProps {
  resumeData: ResumeData;
  handleAddExperience: () => void;
  handleUpdateExperience: (index: number, field: keyof Experience, value: any) => void;
  handleRemoveExperience: (index: number) => void;
  setActiveTab: (tab: string) => void;
}

const ExperienceTab: React.FC<ExperienceTabProps> = ({
  resumeData,
  handleAddExperience,
  handleUpdateExperience,
  handleRemoveExperience,
  setActiveTab
}) => {
  return (
    <div className="space-y-6">
      {resumeData.experience.map((exp, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => handleRemoveExperience(index)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`exp-title-${index}`}>Job Title</Label>
              <Input
                id={`exp-title-${index}`}
                value={exp.title}
                onChange={(e) => handleUpdateExperience(index, "title", e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`exp-company-${index}`}>Company</Label>
              <Input
                id={`exp-company-${index}`}
                value={exp.company}
                onChange={(e) => handleUpdateExperience(index, "company", e.target.value)}
                placeholder="ABC Inc."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`exp-location-${index}`}>Location</Label>
              <Input
                id={`exp-location-${index}`}
                value={exp.location}
                onChange={(e) => handleUpdateExperience(index, "location", e.target.value)}
                placeholder="New York, NY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`exp-from-${index}`}>From</Label>
              <Input
                id={`exp-from-${index}`}
                type="date"
                value={exp.from_date}
                onChange={(e) => handleUpdateExperience(index, "from_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`exp-to-${index}`}>To</Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`exp-to-${index}`}
                  type="date"
                  value={exp.to_date}
                  onChange={(e) => handleUpdateExperience(index, "to_date", e.target.value)}
                  disabled={exp.current}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`exp-current-${index}`}
                    checked={exp.current}
                    onChange={(e) => handleUpdateExperience(index, "current", e.target.checked)}
                  />
                  <Label htmlFor={`exp-current-${index}`} className="text-sm">Current</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`exp-desc-${index}`}>Description</Label>
            <Textarea
              id={`exp-desc-${index}`}
              value={exp.description}
              onChange={(e) => handleUpdateExperience(index, "description", e.target.value)}
              placeholder="Describe your responsibilities and achievements..."
              rows={3}
            />
          </div>
        </div>
      ))}
      
      <Button
        variant="outline"
        onClick={handleAddExperience}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Experience
      </Button>
      
      <div className="flex justify-between">
        <Button 
          variant="ghost"
          onClick={() => setActiveTab("personal")}
        >
          Back
        </Button>
        <Button 
          onClick={() => setActiveTab("education")}
          className="flex items-center gap-2"
        >
          Next: Education <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ExperienceTab;
