
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

  const createProfileIfNotExists = async () => {
    if (!user) return null;
    
    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', user.id);
      
      if (checkError) throw checkError;

      // If profile doesn't exist, create a new one
      if (!existingProfile || existingProfile.length === 0) {
        const newProfile = {
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Student',
          email: user.email,
          student_id: `S${Math.floor(100000 + Math.random() * 900000)}` // Generate a random student ID
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('student_profiles')
          .insert([newProfile])
          .select()
          .single();
          
        if (createError) throw createError;
        
        return createdProfile;
      }
      
      return existingProfile[0];
    } catch (error: any) {
      console.error("Error ensuring profile exists:", error);
      return null;
    }
  };

  const fetchProfileData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First ensure a profile exists
      const currentProfile = await createProfileIfNotExists();
      if (currentProfile) {
        setProfile(currentProfile);
      }
      
      // Now fetch all related data
      const [
        { data: skillsData, error: skillsError },
        { data: coursesData, error: coursesError },
        { data: projectsData, error: projectsError },
        { data: jobsData, error: jobsError },
        { data: certsData, error: certsError }
      ] = await Promise.all([
        supabase.from('skills').select('*').eq('profile_id', user.id),
        supabase.from('courses').select('*').eq('profile_id', user.id),
        supabase.from('projects').select('*').eq('profile_id', user.id),
        supabase.from('job_applications').select('*').eq('profile_id', user.id),
        supabase.from('certifications').select('*').eq('profile_id', user.id)
      ]);

      if (skillsError) console.error("Error fetching skills:", skillsError);
      if (coursesError) console.error("Error fetching courses:", coursesError);
      if (projectsError) console.error("Error fetching projects:", projectsError);
      if (jobsError) console.error("Error fetching job applications:", jobsError);
      if (certsError) console.error("Error fetching certifications:", certsError);
      
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
