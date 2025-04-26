
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Save, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PersonalInfoTab from "@/components/resume/PersonalInfoTab";
import ExperienceTab from "@/components/resume/ExperienceTab";
import EducationTab from "@/components/resume/EducationTab";
import SkillsTab from "@/components/resume/SkillsTab";
import ProjectsTab from "@/components/resume/ProjectsTab";
import ExtrasTab from "@/components/resume/ExtrasTab";
import { useResumeData } from "@/hooks/useResumeData";
import { Experience, Education, Skill, Project } from "@/types/resume";

const ResumeBuilder = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("personal");
  const {
    resumeData,
    setResumeData,
    loading,
    saving,
    lastSaved,
    saveResumeData
  } = useResumeData();

  const handleInputChange = (field: keyof typeof resumeData, value: any) => {
    setResumeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Experience handlers
  const handleAddExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: "",
          company: "",
          location: "",
          from_date: "",
          to_date: "",
          current: false,
          description: ""
        }
      ]
    }));
  };
  
  const handleUpdateExperience = (index: number, field: keyof Experience, value: any) => {
    setResumeData(prev => {
      const updatedExperience = [...prev.experience];
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value
      };
      return {
        ...prev,
        experience: updatedExperience
      };
    });
  };
  
  const handleRemoveExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  // Education handlers
  const handleAddEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: "",
          degree: "",
          field: "",
          from_date: "",
          to_date: "",
          current: false,
          description: ""
        }
      ]
    }));
  };
  
  const handleUpdateEducation = (index: number, field: keyof Education, value: any) => {
    setResumeData(prev => {
      const updatedEducation = [...prev.education];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value
      };
      return {
        ...prev,
        education: updatedEducation
      };
    });
  };
  
  const handleRemoveEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Skills handlers
  const handleAddSkill = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          name: "",
          level: "Intermediate"
        }
      ]
    }));
  };
  
  const handleUpdateSkill = (index: number, field: keyof Skill, value: any) => {
    setResumeData(prev => {
      const updatedSkills = [...prev.skills];
      updatedSkills[index] = {
        ...updatedSkills[index],
        [field]: value
      };
      return {
        ...prev,
        skills: updatedSkills
      };
    });
  };
  
  const handleRemoveSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Projects handlers
  const handleAddProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          name: "",
          description: "",
          technologies: "",
          url: ""
        }
      ]
    }));
  };
  
  const handleUpdateProject = (index: number, field: keyof Project, value: any) => {
    setResumeData(prev => {
      const updatedProjects = [...prev.projects];
      updatedProjects[index] = {
        ...updatedProjects[index],
        [field]: value
      };
      return {
        ...prev,
        projects: updatedProjects
      };
    });
  };
  
  const handleRemoveProject = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const handleDownloadPDF = async () => {
    const resumeElement = document.getElementById('resume-preview');
    if (!resumeElement) return;
    
    try {
      toast({
        title: "Preparing PDF",
        description: "Please wait while we generate your resume...",
      });
      
      const canvas = await html2canvas(resumeElement, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${resumeData.full_name?.replace(/\s+/g, '_') || 'resume'}_Resume.pdf`);
      
      toast({
        title: "Success",
        description: "Your resume has been downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download resume as PDF",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Resume Builder</h1>
          <p className="text-gray-500 mt-1">Build and manage your professional resume</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="text-sm text-gray-500">
            {lastSaved ? (
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            ) : saving ? (
              <span>Saving...</span>
            ) : (
              <span>All changes will be auto-saved</span>
            )}
          </div>
          <Button onClick={saveResumeData} disabled={saving}>
            {saving ? (
              <>Saving</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resume Editor</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-muted-foreground">Resume Score:</span>
                  <Badge variant={resumeData.resume_score >= 80 ? "default" : resumeData.resume_score >= 50 ? "secondary" : "outline"}>
                    {resumeData.resume_score}%
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="extras">Extras</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal">
                  <PersonalInfoTab 
                    resumeData={resumeData}
                    onInputChange={handleInputChange}
                    setActiveTab={setActiveTab}
                  />
                </TabsContent>
                
                <TabsContent value="experience">
                  <ExperienceTab 
                    resumeData={resumeData}
                    handleAddExperience={handleAddExperience}
                    handleUpdateExperience={handleUpdateExperience}
                    handleRemoveExperience={handleRemoveExperience}
                    setActiveTab={setActiveTab}
                  />
                </TabsContent>
                
                <TabsContent value="education">
                  <EducationTab
                    resumeData={resumeData}
                    handleAddEducation={handleAddEducation}
                    handleUpdateEducation={handleUpdateEducation}
                    handleRemoveEducation={handleRemoveEducation}
                    setActiveTab={setActiveTab}
                  />
                </TabsContent>
                
                <TabsContent value="skills">
                  <SkillsTab
                    resumeData={resumeData}
                    handleAddSkill={handleAddSkill}
                    handleUpdateSkill={handleUpdateSkill}
                    handleRemoveSkill={handleRemoveSkill}
                    setActiveTab={setActiveTab}
                  />
                </TabsContent>
                
                <TabsContent value="projects">
                  <ProjectsTab
                    resumeData={resumeData}
                    handleAddProject={handleAddProject}
                    handleUpdateProject={handleUpdateProject}
                    handleRemoveProject={handleRemoveProject}
                    setActiveTab={setActiveTab}
                  />
                </TabsContent>
                
                <TabsContent value="extras">
                  <ExtrasTab
                    resumeData={resumeData}
                    setActiveTab={setActiveTab}
                    handleDownloadPDF={handleDownloadPDF}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Resume Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div id="resume-preview" className="bg-white text-black p-4 rounded-md border">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">{resumeData.full_name || "Your Name"}</h2>
                  <div className="text-sm">
                    {resumeData.email && <span className="mr-2">{resumeData.email}</span>}
                    {resumeData.phone && <span className="mr-2">{resumeData.phone}</span>}
                    {resumeData.location && <span>{resumeData.location}</span>}
                  </div>
                </div>
                
                {resumeData.summary && (
                  <div className="mb-4">
                    <h3 className="text-sm font-bold border-b mb-2">PROFESSIONAL SUMMARY</h3>
                    <p className="text-xs">{resumeData.summary}</p>
                  </div>
                )}
                
                {resumeData.experience.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-bold border-b mb-2">EXPERIENCE</h3>
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="mb-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{exp.title} - {exp.company}</span>
                          <span>
                            {exp.from_date && new Date(exp.from_date).getFullYear()} - 
                            {exp.current ? "Present" : exp.to_date && new Date(exp.to_date).getFullYear()}
                          </span>
                        </div>
                        <div className="text-xs">{exp.location}</div>
                        <p className="text-xs mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {resumeData.education.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-bold border-b mb-2">EDUCATION</h3>
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="mb-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{edu.degree} in {edu.field}</span>
                          <span>
                            {edu.from_date && new Date(edu.from_date).getFullYear()} - 
                            {edu.current ? "Present" : edu.to_date && new Date(edu.to_date).getFullYear()}
                          </span>
                        </div>
                        <div className="text-xs">{edu.institution}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {resumeData.skills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-bold border-b mb-2">SKILLS</h3>
                    <div className="flex flex-wrap gap-1">
                      {resumeData.skills.map((skill, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {skill.name} ({skill.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {resumeData.projects.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-bold border-b mb-2">PROJECTS</h3>
                    {resumeData.projects.map((project, index) => (
                      <div key={index} className="mb-2">
                        <div className="text-xs font-semibold">
                          {project.name} {project.url && <span className="font-normal">({project.url})</span>}
                        </div>
                        <div className="text-xs italic">{project.technologies}</div>
                        <p className="text-xs mt-1">{project.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
