
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ResumeData, Experience, Education, Skill, Project, Certification, Language, ResumeDataSupabase } from '@/types/resume';
import { Json } from '@/integrations/supabase/types';

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

export const useResumeData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const calculateResumeScore = (data: ResumeData): number => {
    let score = 0;
    const maxScore = 100;
    
    if (data.full_name) score += 5;
    if (data.email) score += 5;
    if (data.phone) score += 5;
    if (data.location) score += 5;
    if (data.summary && data.summary.length > 50) score += 10;
    
    const expPoints = Math.min((data.experience?.length || 0) * 5, 20);
    score += expPoints;
    
    const eduPoints = Math.min((data.education?.length || 0) * 5, 15);
    score += eduPoints;
    
    const skillPoints = Math.min((data.skills?.length || 0), 15);
    score += skillPoints;
    
    const projectPoints = Math.min((data.projects?.length || 0) * 2, 10);
    score += projectPoints;
    
    const certPoints = Math.min((data.certifications?.length || 0), 5);
    score += certPoints;
    
    const langPoints = Math.min((data.languages?.length || 0), 5);
    score += langPoints;
    
    return Math.min(Math.round(score), maxScore);
  };

  // Function to safely convert JSON array to typed array
  const parseJsonArray = <T,>(jsonArray: Json[] | null, fallback: T[]): T[] => {
    if (!jsonArray) return fallback;
    try {
      return jsonArray as unknown as T[];
    } catch (error) {
      console.error("Error parsing JSON array:", error);
      return fallback;
    }
  };

  useEffect(() => {
    const fetchResumeData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("resume_details")
          .select("*")
          .eq("profile_id", user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          const typedData: ResumeData = {
            ...initialResumeData,
            id: data.id,
            profile_id: data.profile_id,
            full_name: data.full_name || user.user_metadata?.full_name || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            location: data.location || "",
            summary: data.summary || "",
            experience: parseJsonArray<Experience>(data.experience as Json[], []),
            education: parseJsonArray<Education>(data.education as Json[], []),
            skills: parseJsonArray<Skill>(data.skills as Json[], []),
            projects: parseJsonArray<Project>(data.projects as Json[], []),
            certifications: parseJsonArray<Certification>(data.certifications as Json[], []),
            languages: parseJsonArray<Language>(data.languages as Json[], []),
            resume_score: data.resume_score || 0,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
          
          setResumeData(typedData);
        } else {
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

  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    if (!loading && user) {
      const timeout = setTimeout(() => {
        saveResumeData();
      }, 2000);
      
      setAutoSaveTimeout(timeout);
    }
    
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [resumeData, loading, user]);

  const saveResumeData = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const score = calculateResumeScore(resumeData);
      
      // Convert the typed arrays to Json[] for Supabase
      const dataToSave: ResumeDataSupabase = {
        profile_id: user.id,
        full_name: resumeData.full_name,
        email: resumeData.email,
        phone: resumeData.phone,
        location: resumeData.location,
        summary: resumeData.summary,
        experience: resumeData.experience as unknown as Json[],
        education: resumeData.education as unknown as Json[],
        skills: resumeData.skills as unknown as Json[],
        projects: resumeData.projects as unknown as Json[],
        certifications: resumeData.certifications as unknown as Json[],
        languages: resumeData.languages as unknown as Json[],
        resume_score: score,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from("resume_details")
        .upsert(dataToSave)
        .select()
        .single();
        
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

  return {
    resumeData,
    setResumeData,
    loading,
    saving,
    lastSaved,
    saveResumeData
  };
};
