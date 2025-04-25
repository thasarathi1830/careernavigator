
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { Summary } from "@/components/profile/Summary";
import { Education } from "@/components/profile/Education";
import { Skills } from "@/components/profile/Skills";
import { Projects } from "@/components/profile/Projects";
import { Certifications } from "@/components/profile/Certifications";
import { Courses } from "@/components/profile/Courses";
import { Button } from "@/components/ui/button";
import { useProfileData } from "@/hooks/useProfileData";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

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
    certifications,
    refreshData
  } = useProfileData();

  const handleSaveProfile = async () => {
    setEditMode(false);
    await refreshData(); // Make sure to await this
    toast({
      title: "Profile saved",
      description: "All changes to your profile have been saved successfully."
    });
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
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Student Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="flex flex-col items-center">
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-6 w-40 mt-4" />
              <Skeleton className="h-4 w-20 mt-2 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-60 w-full mb-8" />
            <Skeleton className="h-40 w-full mb-8" />
            <Skeleton className="h-30 w-full mb-8" />
            <Skeleton className="h-40 w-full mb-8" />
          </div>
        </div>
      </div>
    );
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
          <Summary 
            bio={profile?.bio}
            email={profile?.email}
            phone={profile?.phone}
            address={profile?.address}
            isEditMode={editMode}
            profileId={user?.id || ""}
            onProfileUpdate={refreshData}
          />
          
          <Education 
            major={profile?.major}
            year={profile?.year}
            gpa={profile?.gpa}
            isEditMode={editMode}
            profileId={user?.id || ""}
            onProfileUpdate={refreshData}
          />

          <Skills 
            skills={skills} 
            isEditMode={editMode}
            profileId={user?.id || ""}
            onSkillsChange={refreshData}
          />

          <Projects 
            projects={projects} 
            isEditMode={editMode}
            profileId={user?.id || ""}
            onProjectsChange={refreshData}
          />

          <Certifications 
            certifications={certifications} 
            isEditMode={editMode}
            profileId={user?.id || ""}
            onCertificationsChange={refreshData}
          />

          <Courses 
            courses={courses} 
            isEditMode={editMode}
            profileId={user?.id || ""}
            onCoursesChange={refreshData}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
