export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assignments: {
        Row: {
          completed: boolean
          course: string
          created_at: string
          due_date: string
          id: string
          name: string
          profile_id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          course: string
          created_at?: string
          due_date: string
          id?: string
          name: string
          profile_id: string
          status: string
          type: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          course?: string
          created_at?: string
          due_date?: string
          id?: string
          name?: string
          profile_id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          issue_date: string
          issuer: string
          name: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date: string
          issuer: string
          name: string
          profile_id: string
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string
          issuer?: string
          name?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          credits: number | null
          grade: string | null
          id: string
          name: string
          profile_id: string
        }
        Insert: {
          code: string
          created_at?: string
          credits?: number | null
          grade?: string | null
          id?: string
          name: string
          profile_id: string
        }
        Update: {
          code?: string
          created_at?: string
          credits?: number | null
          grade?: string | null
          id?: string
          name?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_answered: boolean
          profile_id: string
          tags: string[] | null
          title: string
          views: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_answered?: boolean
          profile_id: string
          tags?: string[] | null
          title: string
          views?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_answered?: boolean
          profile_id?: string
          tags?: string[] | null
          title?: string
          views?: number
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          is_accepted_answer: boolean
          post_id: string
          profile_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_accepted_answer?: boolean
          post_id: string
          profile_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_accepted_answer?: boolean
          post_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          company: string
          created_at: string
          id: string
          profile_id: string
          role: string
          status: string
        }
        Insert: {
          company: string
          created_at?: string
          id?: string
          profile_id: string
          role: string
          status: string
        }
        Update: {
          company?: string
          created_at?: string
          id?: string
          profile_id?: string
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          completion_date: string | null
          created_at: string
          deadline: string | null
          id: string
          name: string
          profile_id: string
          status: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          name: string
          profile_id: string
          status: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          name?: string
          profile_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_details: {
        Row: {
          certifications: Json[] | null
          created_at: string | null
          education: Json[] | null
          email: string | null
          experience: Json[] | null
          full_name: string | null
          id: string
          languages: Json[] | null
          location: string | null
          phone: string | null
          profile_id: string
          projects: Json[] | null
          resume_score: number | null
          skills: Json[] | null
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          certifications?: Json[] | null
          created_at?: string | null
          education?: Json[] | null
          email?: string | null
          experience?: Json[] | null
          full_name?: string | null
          id?: string
          languages?: Json[] | null
          location?: string | null
          phone?: string | null
          profile_id: string
          projects?: Json[] | null
          resume_score?: number | null
          skills?: Json[] | null
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          certifications?: Json[] | null
          created_at?: string | null
          education?: Json[] | null
          email?: string | null
          experience?: Json[] | null
          full_name?: string | null
          id?: string
          languages?: Json[] | null
          location?: string | null
          phone?: string | null
          profile_id?: string
          projects?: Json[] | null
          resume_score?: number | null
          skills?: Json[] | null
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      semester_courses: {
        Row: {
          course_code: string | null
          course_name: string | null
          created_at: string
          credits: number | null
          grade: string | null
          id: string
          profile_id: string
          semester_id: string | null
          semester_name: string
          sgpa: number
          updated_at: string
        }
        Insert: {
          course_code?: string | null
          course_name?: string | null
          created_at?: string
          credits?: number | null
          grade?: string | null
          id?: string
          profile_id: string
          semester_id?: string | null
          semester_name: string
          sgpa?: number
          updated_at?: string
        }
        Update: {
          course_code?: string | null
          course_name?: string | null
          created_at?: string
          credits?: number | null
          grade?: string | null
          id?: string
          profile_id?: string
          semester_id?: string | null
          semester_name?: string
          sgpa?: number
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          id: string
          name: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          address: string | null
          bio: string | null
          created_at: string
          dob: string | null
          email: string | null
          gpa: string | null
          id: string
          major: string | null
          name: string | null
          phone: string | null
          student_id: string | null
          university: string | null
          updated_at: string
          year: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          gpa?: string | null
          id: string
          major?: string | null
          name?: string | null
          phone?: string | null
          student_id?: string | null
          university?: string | null
          updated_at?: string
          year?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          gpa?: string | null
          id?: string
          major?: string | null
          name?: string | null
          phone?: string | null
          student_id?: string | null
          university?: string | null
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          color_blind_mode: boolean
          created_at: string
          font_size: string
          id: string
          profile_id: string
          reduced_motion: boolean
          theme: string
          updated_at: string
        }
        Insert: {
          color_blind_mode?: boolean
          created_at?: string
          font_size?: string
          id?: string
          profile_id: string
          reduced_motion?: boolean
          theme?: string
          updated_at?: string
        }
        Update: {
          color_blind_mode?: boolean
          created_at?: string
          font_size?: string
          id?: string
          profile_id?: string
          reduced_motion?: boolean
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
