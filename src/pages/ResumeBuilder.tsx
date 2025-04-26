
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Save, Download, Plus, Trash2, Check, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ResumeData {
  id?: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  resume_score: number;
}

interface Experience {
  id?: string;
  title: string;
  company: string;
  location: string;
  from_date: string;
  to_date: string;
  current: boolean;
  description: string;
}

interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  from_date: string;
  to_date: string;
  current: boolean;
  description: string;
}

interface Skill {
  id?: string;
  name: string;
  level: string;
}

interface Project {
  id?: string;
  name: string;
  description: string;
  technologies: string;
  url: string;
}

interface Certification {
  id?: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
}

interface Language {
  id?: string;
  name: string;
  proficiency: string;
}

const initialResumeData: ResumeData = {
  full_name: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  resume_score: 0
};

const ResumeBuilder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Calculate resume score based on completeness
  const calculateResumeScore = (data: ResumeData): number => {
    let score = 0;
    const maxScore = 100;
    
    // Basic information (30 points)
    if (data.full_name) score += 5;
    if (data.email) score += 5;
    if (data.phone) score += 5;
    if (data.location) score += 5;
    if (data.summary && data.summary.length > 50) score += 10;
    
    // Experience (20 points)
    const expPoints = Math.min(data.experience.length * 5, 20);
    score += expPoints;
    
    // Education (15 points)
    const eduPoints = Math.min(data.education.length * 5, 15);
    score += eduPoints;
    
    // Skills (15 points)
    const skillPoints = Math.min(data.skills.length, 15);
    score += skillPoints;
    
    // Projects (10 points)
    const projectPoints = Math.min(data.projects.length * 2, 10);
    score += projectPoints;
    
    // Certifications (5 points)
    const certPoints = Math.min(data.certifications.length, 5);
    score += certPoints;
    
    // Languages (5 points)
    const langPoints = Math.min(data.languages.length, 5);
    score += langPoints;
    
    return Math.min(Math.round(score), maxScore);
  };

  // Fetch resume data
  useEffect(() => {
    const fetchResumeData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("resume_details")
          .select("*")
          .eq("profile_id", user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setResumeData({
            id: data.id,
            full_name: data.full_name || user.user_metadata?.full_name || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            location: data.location || "",
            summary: data.summary || "",
            experience: data.experience || [],
            education: data.education || [],
            skills: data.skills || [],
            projects: data.projects || [],
            certifications: data.certifications || [],
            languages: data.languages || [],
            resume_score: data.resume_score || 0
          });
        } else {
          // Create default resume with user data
          setResumeData({
            ...initialResumeData,
            full_name: user.user_metadata?.full_name || "",
            email: user.email || ""
          });
        }
      } catch (error) {
        console.error("Error fetching resume data:", error);
        toast({
          title: "Error",
          description: "Failed to load resume data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchResumeData();
  }, [user, toast]);

  // Auto-save data when changes occur
  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    if (!loading && user) {
      const timeout = setTimeout(() => {
        saveResumeData();
      }, 2000); // Auto-save after 2 seconds of inactivity
      
      setAutoSaveTimeout(timeout);
    }
    
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [resumeData, loading, user]);

  // Save resume data
  const saveResumeData = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Calculate resume score
      const score = calculateResumeScore(resumeData);
      
      const { error } = await supabase
        .from("resume_details")
        .upsert({
          profile_id: user.id,
          full_name: resumeData.full_name,
          email: resumeData.email,
          phone: resumeData.phone,
          location: resumeData.location,
          summary: resumeData.summary,
          experience: resumeData.experience,
          education: resumeData.education,
          skills: resumeData.skills,
          projects: resumeData.projects,
          certifications: resumeData.certifications,
          languages: resumeData.languages,
          resume_score: score
        }, {
          onConflict: "profile_id"
        });
        
      if (error) throw error;
      
      setLastSaved(new Date());
      setResumeData(prev => ({
        ...prev,
        resume_score: score
      }));
      
    } catch (error) {
      console.error("Error saving resume data:", error);
      toast({
        title: "Error",
        description: "Failed to save resume data",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ResumeData, value: any) => {
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
    setResumeData(prev => {
      const updatedExperience = [...prev.experience];
      updatedExperience.splice(index, 1);
      return {
        ...prev,
        experience: updatedExperience
      };
    });
  };

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
    setResumeData(prev => {
      const updatedEducation = [...prev.education];
      updatedEducation.splice(index, 1);
      return {
        ...prev,
        education: updatedEducation
      };
    });
  };

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
    setResumeData(prev => {
      const updatedSkills = [...prev.skills];
      updatedSkills.splice(index, 1);
      return {
        ...prev,
        skills: updatedSkills
      };
    });
  };

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
    setResumeData(prev => {
      const updatedProjects = [...prev.projects];
      updatedProjects.splice(index, 1);
      return {
        ...prev,
        projects: updatedProjects
      };
    });
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
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${resumeData.full_name.replace(/\s+/g, '_')}_Resume.pdf`);
      
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
                
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={resumeData.full_name}
                        onChange={(e) => handleInputChange("full_name", e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
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
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 123 456 7890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={resumeData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="New York, NY"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      value={resumeData.summary}
                      onChange={(e) => handleInputChange("summary", e.target.value)}
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
                </TabsContent>
                
                <TabsContent value="experience" className="space-y-6">
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
