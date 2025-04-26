
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { Education, ResumeData } from '@/types/resume';

interface EducationTabProps {
  resumeData: ResumeData;
  handleAddEducation: () => void;
  handleUpdateEducation: (index: number, field: keyof Education, value: any) => void;
  handleRemoveEducation: (index: number) => void;
  setActiveTab: (tab: string) => void;
}

const EducationTab: React.FC<EducationTabProps> = ({
  resumeData,
  handleAddEducation,
  handleUpdateEducation,
  handleRemoveEducation,
  setActiveTab
}) => {
  return (
    <div className="space-y-6">
      {resumeData.education.map((edu, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => handleRemoveEducation(index)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`edu-institution-${index}`}>Institution</Label>
              <Input
                id={`edu-institution-${index}`}
                value={edu.institution}
                onChange={(e) => handleUpdateEducation(index, "institution", e.target.value)}
                placeholder="University of Example"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
              <Input
                id={`edu-degree-${index}`}
                value={edu.degree}
                onChange={(e) => handleUpdateEducation(index, "degree", e.target.value)}
                placeholder="Bachelor of Science"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`edu-field-${index}`}>Field of Study</Label>
              <Input
                id={`edu-field-${index}`}
                value={edu.field}
                onChange={(e) => handleUpdateEducation(index, "field", e.target.value)}
                placeholder="Computer Science"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edu-from-${index}`}>From</Label>
              <Input
                id={`edu-from-${index}`}
                type="date"
                value={edu.from_date}
                onChange={(e) => handleUpdateEducation(index, "from_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edu-to-${index}`}>To</Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`edu-to-${index}`}
                  type="date"
                  value={edu.to_date}
                  onChange={(e) => handleUpdateEducation(index, "to_date", e.target.value)}
                  disabled={edu.current}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`edu-current-${index}`}
                    checked={edu.current}
                    onChange={(e) => handleUpdateEducation(index, "current", e.target.checked)}
                  />
                  <Label htmlFor={`edu-current-${index}`} className="text-sm">Current</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`edu-desc-${index}`}>Description</Label>
            <Textarea
              id={`edu-desc-${index}`}
              value={edu.description}
              onChange={(e) => handleUpdateEducation(index, "description", e.target.value)}
              placeholder="Describe your studies, achievements, activities..."
              rows={3}
            />
          </div>
        </div>
      ))}
      
      <Button
        variant="outline"
        onClick={handleAddEducation}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Education
      </Button>
      
      <div className="flex justify-between">
        <Button 
          variant="ghost"
          onClick={() => setActiveTab("experience")}
        >
          Back
        </Button>
        <Button 
          onClick={() => setActiveTab("skills")}
          className="flex items-center gap-2"
        >
          Next: Skills <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EducationTab;
