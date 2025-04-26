
import { Tables, Json } from "@/integrations/supabase/types";

// Remove extension from Supabase Tables type and define our own interface
export interface ResumeData {
  id?: string;
  profile_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  resume_score?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  from_date: string;
  to_date: string;
  current: boolean;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  from_date: string;
  to_date: string;
  current: boolean;
  description: string;
}

export interface Skill {
  name: string;
  level: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string;
  url: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
}

export interface Language {
  name: string;
  proficiency: string;
}

// Helper type for converting between ResumeData and Supabase table format
export type ResumeDataSupabase = Omit<Tables<'resume_details'>, 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages'> & {
  experience?: Json[];
  education?: Json[];
  skills?: Json[];
  projects?: Json[];
  certifications?: Json[];
  languages?: Json[];
};
