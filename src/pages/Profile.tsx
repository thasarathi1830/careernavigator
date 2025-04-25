import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { Button } from "@/components/ui/button";
import { useProfileData } from "@/hooks/useProfileData";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();
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
        </div>

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
