import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Save, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PersonalInfoTab from "@/components/resume/PersonalInfoTab";
import ExperienceTab from "@/components/resume/ExperienceTab";
import { useResumeData } from "@/hooks/useResumeData";
import { Experience } from "@/types/resume";

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
                
                <TabsContent value="education" className="space-y-6">
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
                </TabsContent>
                
                <TabsContent value="skills" className="space-y-6">
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
                </TabsContent>
                
                <TabsContent value="projects" className="space-y-6">
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
                </TabsContent>
                
                <TabsContent value="extras" className="space-y-6">
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
