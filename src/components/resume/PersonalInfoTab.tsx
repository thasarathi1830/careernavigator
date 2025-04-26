
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { ResumeData } from '@/types/resume';

interface PersonalInfoTabProps {
  resumeData: ResumeData;
  onInputChange: (field: keyof ResumeData, value: any) => void;
  setActiveTab: (tab: string) => void;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  resumeData,
  onInputChange,
  setActiveTab
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={resumeData.full_name}
            onChange={(e) => onInputChange("full_name", e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={resumeData.email}
            onChange={(e) => onInputChange("email", e.target.value)}
            placeholder="john@example.com"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={resumeData.phone}
            onChange={(e) => onInputChange("phone", e.target.value)}
            placeholder="+1 123 456 7890"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={resumeData.location}
            onChange={(e) => onInputChange("location", e.target.value)}
            placeholder="New York, NY"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea
          id="summary"
          value={resumeData.summary}
          onChange={(e) => onInputChange("summary", e.target.value)}
          placeholder="Write a brief summary of your professional background and career objectives..."
          rows={5}
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => setActiveTab("experience")}
          className="flex items-center gap-2"
        >
          Next: Experience <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
