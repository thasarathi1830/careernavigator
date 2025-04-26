
-- Creation script for user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  theme TEXT NOT NULL DEFAULT 'system',
  font_size TEXT NOT NULL DEFAULT 'medium',
  color_blind_mode BOOLEAN NOT NULL DEFAULT false,
  reduced_motion BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add row level security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences FOR SELECT 
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences FOR UPDATE 
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own preferences" 
  ON public.user_preferences FOR INSERT 
  WITH CHECK (auth.uid() = profile_id);

-- Creation script for semester_courses table
CREATE TABLE IF NOT EXISTS public.semester_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES auth.users NOT NULL,
  semester_name TEXT NOT NULL,
  sgpa NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  course_code TEXT,
  course_name TEXT,
  credits INTEGER,
  grade TEXT,
  semester_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add row level security
ALTER TABLE public.semester_courses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own semester_courses" 
  ON public.semester_courses FOR SELECT 
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own semester_courses" 
  ON public.semester_courses FOR UPDATE 
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own semester_courses" 
  ON public.semester_courses FOR INSERT 
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own semester_courses" 
  ON public.semester_courses FOR DELETE 
  USING (auth.uid() = profile_id);
