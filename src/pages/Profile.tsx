import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [newSkill, setNewSkill] = useState("");
  const resumeRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [certifications, setCertifications] = useState([
    {
      id: 1,
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      issueDate: "2025-01",
      expiryDate: "2028-01"
    },
    {
      id: 2,
      name: "Machine Learning Specialization",
      issuer: "Stanford University & Coursera",
      issueDate: "2024-11",
      expiryDate: null
    }
  ]);

  const [studentProfile, setStudentProfile] = useState({
    id: "S12345",
    name: "John Doe",
    email: user?.email || "john.doe@university.edu",
    phone: "+1 (555) 123-4567",
    dob: "1998-06-15",
    address: "123 Campus Drive, University City, CA 94102",
    major: "Computer Science",
    year: "Junior",
    gpa: "8.75",
    bio: "Enthusiastic computer science student with a passion for AI and machine learning. Looking for internship opportunities in software development.",
    skills: ["JavaScript", "Python", "React", "Node.js", "Machine Learning"],
    courses: [
      { code: "CS301", name: "Database Systems", credits: 3, grade: "A" },
      { code: "CS350", name: "Web Development", credits: 4, grade: "A-" },
      { code: "CS430", name: "Machine Learning", credits: 4, grade: "B+" }
    ],
    activeProjects: [
      { id: 1, name: "Smart Campus Navigation System", status: "In Progress", deadline: "2025-06-15" },
      { id: 2, name: "Student Health Analysis Dashboard", status: "Completed", completionDate: "2025-03-10" }
    ],
    jobApplications: [
      { id: 1, role: "Software Engineering Intern", company: "TechCorp", status: "Applied" },
      { id: 2, role: "Junior Data Analyst", company: "DataInsight", status: "In Review" }
    ]
  });

  const [newCourse, setNewCourse] = useState({ code: "", name: "", credits: "", grade: "" });
  const [newProject, setNewProject] = useState({ name: "", status: "In Progress", deadline: "" });
  const [newJobApplication, setNewJobApplication] = useState({ role: "", company: "", status: "Applied" });

  useEffect(() => {
    if (user) {
      setStudentProfile(prev => ({
        ...prev,
        email: user.email || prev.email,
        name: user.user_metadata?.full_name || prev.name
      }));
    }
  }, [user]);

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    setEditMode(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== "" && !studentProfile.skills.includes(newSkill)) {
      setStudentProfile({
        ...studentProfile,
        skills: [...studentProfile.skills, newSkill],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setStudentProfile({
      ...studentProfile,
      skills: studentProfile.skills.filter(skill => skill !== skillToRemove),
    });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setStudentProfile({
      ...studentProfile,
      [id]: value,
    });
  };

  const handleAddCourse = () => {
    if (newCourse.code && newCourse.name && newCourse.credits && newCourse.grade) {
      setStudentProfile(prev => ({
        ...prev,
        courses: [...prev.courses, { ...newCourse, credits: Number(newCourse.credits) }]
      }));
      setNewCourse({ code: "", name: "", credits: "", grade: "" });
    }
  };

  const handleRemoveCourse = (courseCode: string) => {
    setStudentProfile(prev => ({
      ...prev,
      courses: prev.courses.filter(course => course.code !== courseCode)
    }));
  };

  const handleAddProject = () => {
    if (newProject.name && newProject.deadline) {
      setStudentProfile(prev => ({
        ...prev,
        activeProjects: [...prev.activeProjects, { ...newProject, id: Date.now() }]
      }));
      setNewProject({ name: "", status: "In Progress", deadline: "" });
    }
  };

  const handleRemoveProject = (projectId: number) => {
    setStudentProfile(prev => ({
      ...prev,
      activeProjects: prev.activeProjects.filter(project => project.id !== projectId)
    }));
  };

  const handleAddJobApplication = () => {
    if (newJobApplication.role && newJobApplication.company) {
      setStudentProfile(prev => ({
        ...prev,
        jobApplications: [...prev.jobApplications, { ...newJobApplication, id: Date.now() }]
      }));
      setNewJobApplication({ role: "", company: "", status: "Applied" });
    }
  };

  const handleRemoveJobApplication = (applicationId: number) => {
    setStudentProfile(prev => ({
      ...prev,
      jobApplications: prev.jobApplications.filter(app => app.id !== applicationId)
    }));
  };

  const handleRemoveCertification = (id: number) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
  };

  const handleDownloadResume = async () => {
    if (!resumeRef.current) return;
    
    setIsDownloading(true);
    toast({
      title: "Preparing Resume",
      description: "Your resume is being generated...",
    });

    try {
      const resumeElement = resumeRef.current;
      const canvas = await html2canvas(resumeElement, {
        scale: 2,
        logging: false,
        useCORS: true,
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
      pdf.save(`${studentProfile.name.replace(/\s+/g, '_')}_Resume.pdf`);
      
      toast({
        title: "Resume Downloaded",
        description: "Your resume has been successfully downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Student Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4 group">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="" alt={studentProfile.name} />
                  <AvatarFallback className="text-3xl bg-education-primary text-white">
                    {studentProfile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white text-sm">Change Photo</span>
                </div>
              </div>
              <h2 className="text-xl font-bold">{studentProfile.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{studentProfile.id}</p>
              <div className="text-center mb-6">
                <div className="text-sm font-medium text-gray-700">
                  {studentProfile.major}
                </div>
                <div className="text-sm text-gray-500">{studentProfile.year} Year</div>
              </div>
              <div className="w-full">
                <Button
                  className="w-full mb-3"
                  onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                >
                  {editMode ? "Save Profile" : "Edit Profile"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-education-primary text-education-primary hover:bg-education-light flex items-center justify-center gap-2"
                  onClick={handleDownloadResume}
                  disabled={isDownloading}
                >
                  <Download size={16} />
                  {isDownloading ? "Generating..." : "Download Resume"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3" ref={resumeRef}>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="border-b pb-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{studentProfile.name}</h1>
              <div className="mt-2 text-gray-600 space-y-1">
                <p>{studentProfile.email}</p>
                <p>{studentProfile.phone}</p>
                <p>{studentProfile.address}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Professional Summary</h2>
              <p className="text-gray-600 leading-relaxed">{studentProfile.bio}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Education</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">University Name</h3>
                  <p className="text-gray-600">{studentProfile.major} • {studentProfile.year} Year</p>
                  <p className="text-gray-600">CGPA: {studentProfile.gpa}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {studentProfile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Projects</h2>
              <div className="space-y-4">
                {studentProfile.activeProjects.map((project) => (
                  <div key={project.id}>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-gray-600">
                      Status: {project.status} • 
                      {project.status === "Completed" 
                        ? ` Completed: ${new Date(project.completionDate).toLocaleDateString()}`
                        : ` Due: ${new Date(project.deadline).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Certifications</h2>
              <div className="space-y-4">
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    <p className="text-gray-600">
                      {cert.issuer} • Issued: {cert.issueDate}
                      {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Relevant Coursework</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentProfile.courses.map((course) => (
                  <div key={course.code} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{course.name}</p>
                      <p className="text-sm text-gray-600">{course.code}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      {course.grade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
