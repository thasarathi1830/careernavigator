
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { Button } from "@/components/ui/button";
import { useProfileData } from "@/hooks/useProfileData";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();
  const resumeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const {
    loading,
    profile,
    skills,
    courses,
    projects,
    jobApplications,
    certifications,
    updateProfile,
    refreshData
  } = useProfileData();

  const handleSaveProfile = async () => {
    await updateProfile(profile);
    setEditMode(false);
    refreshData();
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
      pdf.save(`${profile?.name || 'Resume'}.pdf`);
      
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Student Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ProfileHeader
            name={profile?.name || user?.email || ""}
            studentId={profile?.student_id || ""}
            isEditMode={editMode}
            onEditClick={() => setEditMode(true)}
            onSaveClick={handleSaveProfile}
          />
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={handleDownloadResume}
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" /> Download Resume
            </Button>
          </div>
        </div>

        <div className="lg:col-span-3" ref={resumeRef}>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="border-b pb-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{profile?.name || ""}</h1>
              <div className="mt-2 text-gray-600 space-y-1">
                <p>{profile?.email || ""}</p>
                <p>{profile?.phone || ""}</p>
                <p>{profile?.address || ""}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Professional Summary</h2>
              <p className="text-gray-600 leading-relaxed">{profile?.bio || ""}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Education</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">University Name</h3>
                  <p className="text-gray-600">{profile?.major || ""} • {profile?.year || ""} Year</p>
                  <p className="text-gray-600">CGPA: {profile?.gpa || ""}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Projects</h2>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id}>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-gray-600">
                      Status: {project.status} • 
                      {project.status === "Completed" 
                        ? ` Completed: ${project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'N/A'}`
                        : ` Due: ${project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}`
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
                      {cert.issuer} • Issued: {cert.issue_date}
                      {cert.expiry_date && ` • Expires: ${cert.expiry_date}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Relevant Coursework</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{course.name}</p>
                      <p className="text-sm text-gray-600">{course.code}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      {course.grade || 'N/A'}
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
