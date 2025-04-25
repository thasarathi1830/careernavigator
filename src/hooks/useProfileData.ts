
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useProfileData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // If no profile exists, create one
      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('student_profiles')
          .insert([{ id: user?.id }])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(profileData);
      }

      // Fetch related data
      const [
        { data: skillsData },
        { data: coursesData },
        { data: projectsData },
        { data: jobsData },
        { data: certsData }
      ] = await Promise.all([
        supabase.from('skills').select('*').eq('profile_id', user?.id),
        supabase.from('courses').select('*').eq('profile_id', user?.id),
        supabase.from('projects').select('*').eq('profile_id', user?.id),
        supabase.from('job_applications').select('*').eq('profile_id', user?.id),
        supabase.from('certifications').select('*').eq('profile_id', user?.id)
      ]);

      setSkills(skillsData || []);
      setCourses(coursesData || []);
      setProjects(projectsData || []);
      setJobApplications(jobsData || []);
      setCertifications(certsData || []);

    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const { error } = await supabase
        .from('student_profiles')
        .update(data)
        .eq('id', user?.id);

      if (error) throw error;

      setProfile({ ...profile, ...data });
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    loading,
    profile,
    skills,
    courses,
    projects,
    jobApplications,
    certifications,
    updateProfile,
    refreshData: fetchProfileData
  };
};
