
import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download } from "lucide-react";
import { ResumeData } from '@/types/resume';

interface ExtrasTabProps {
  resumeData: ResumeData;
  setActiveTab: (tab: string) => void;
  handleDownloadPDF: () => void;
}

const ExtrasTab: React.FC<ExtrasTabProps> = ({
  resumeData,
  setActiveTab,
  handleDownloadPDF
}) => {
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Resume Score</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Completeness</span>
            <span>{resumeData.resume_score}%</span>
          </div>
          <Progress value={resumeData.resume_score} className="h-2" />
          
          <div className="text-sm text-gray-500 mt-2">
            <p>Resume score is calculated based on the completeness of your resume.</p>
            <ul className="list-disc list-inside mt-1">
              <li>Personal Information: 30%</li>
              <li>Experience: 20%</li>
              <li>Education: 15%</li>
              <li>Skills: 15%</li>
              <li>Projects: 10%</li>
              <li>Additional Information: 10%</li>
            </ul>
          </div>
          
          {resumeData.resume_score < 80 && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mt-4 text-sm">
              <p className="font-medium text-yellow-800">Recommendations to improve your resume:</p>
              <ul className="list-disc list-inside mt-1 text-yellow-700">
                {!resumeData.summary && <li>Add a professional summary</li>}
                {resumeData.experience.length === 0 && <li>Add work experience</li>}
                {resumeData.education.length === 0 && <li>Add education details</li>}
                {resumeData.skills.length < 5 && <li>Add at least 5 relevant skills</li>}
                {resumeData.projects.length === 0 && <li>Add projects to showcase your work</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="ghost"
          onClick={() => setActiveTab("projects")}
        >
          Back
        </Button>
        <Button onClick={handleDownloadPDF}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default ExtrasTab;
