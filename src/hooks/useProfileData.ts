
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';

export const useProfileData = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Tables<'student_profiles'> | null>(null);
  const [skills, setSkills] = useState<Tables<'skills'>[]>([]);
  const [courses, setCourses] = useState<Tables<'courses'>[]>([]);
  const [projects, setProjects] = useState<Tables<'projects'>[]>([]);
  const [jobApplications, setJobApplications] = useState<Tables<'job_applications'>[]>([]);
  const [certifications, setCertifications] = useState<Tables<'certifications'>[]>([]);

  const fetchProfileData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [
        { data: profileData, error: profileError },
        { data: skillsData },
        { data: coursesData },
        { data: projectsData },
        { data: jobsData },
        { data: certsData }
      ] = await Promise.all([
        supabase.from('student_profiles').select('*').eq('id', user.id).single(),
        supabase.from('skills').select('*').eq('profile_id', user.id),
        supabase.from('courses').select('*').eq('profile_id', user.id),
        supabase.from('projects').select('*').eq('profile_id', user.id),
        supabase.from('job_applications').select('*').eq('profile_id', user.id),
        supabase.from('certifications').select('*').eq('profile_id', user.id)
      ]);

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else {
        setProfile(profileData);
      }
      
      setSkills(skillsData || []);
      setCourses(coursesData || []);
      setProjects(projectsData || []);
      setJobApplications(jobsData || []);
      setCertifications(certsData || []);

    } catch (error: any) {
      console.error("Error in fetchProfileData:", error);
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const updateProfile = async (data: Partial<Tables<'student_profiles'>>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('student_profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state immediately for instant UI feedback
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

      // Refetch all profile data to ensure UI is fully up-to-date
      await fetchProfileData();
      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
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
