
import { Tables } from "@/integrations/supabase/types";

export interface ResumeData extends Partial<Tables<'resume_details'>> {
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
