
export interface SemesterCourse {
  id: string;
  profile_id: string;
  course_name: string;
  course_code: string;
  credits: number;
  grade: string;
  semester_id: string;
  created_at: string;
}

export interface Semester {
  id: string;
  profile_id: string;
  semester_name: string;
  sgpa: number;
  created_at: string;
}
