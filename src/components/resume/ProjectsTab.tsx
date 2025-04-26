
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { Project, ResumeData } from '@/types/resume';

interface ProjectsTabProps {
  resumeData: ResumeData;
  handleAddProject: () => void;
  handleUpdateProject: (index: number, field: keyof Project, value: any) => void;
  handleRemoveProject: (index: number) => void;
  setActiveTab: (tab: string) => void;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({
  resumeData,
  handleAddProject,
  handleUpdateProject,
  handleRemoveProject,
  setActiveTab
}) => {
  return (
    <div className="space-y-6">
      {resumeData.projects.map((project, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => handleRemoveProject(index)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`project-name-${index}`}>Project Name</Label>
              <Input
                id={`project-name-${index}`}
                value={project.name}
                onChange={(e) => handleUpdateProject(index, "name", e.target.value)}
                placeholder="E-commerce Website"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`project-url-${index}`}>Project URL</Label>
              <Input
                id={`project-url-${index}`}
                value={project.url}
                onChange={(e) => handleUpdateProject(index, "url", e.target.value)}
                placeholder="https://github.com/username/project"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`project-tech-${index}`}>Technologies</Label>
            <Input
              id={`project-tech-${index}`}
              value={project.technologies}
              onChange={(e) => handleUpdateProject(index, "technologies", e.target.value)}
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`project-desc-${index}`}>Description</Label>
            <Textarea
              id={`project-desc-${index}`}
              value={project.description}
              onChange={(e) => handleUpdateProject(index, "description", e.target.value)}
              placeholder="Describe the project, your role, and accomplishments..."
              rows={3}
            />
          </div>
        </div>
      ))}
      
      <Button
        variant="outline"
        onClick={handleAddProject}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Project
      </Button>
      
      <div className="flex justify-between">
        <Button 
          variant="ghost"
          onClick={() => setActiveTab("skills")}
        >
          Back
        </Button>
        <Button 
          onClick={() => setActiveTab("extras")}
          className="flex items-center gap-2"
        >
          Next: Extras <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectsTab;
