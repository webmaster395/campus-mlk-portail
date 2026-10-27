// Généré depuis le projet Supabase « campus-mlk-portail » (generate_typescript_types).
// Ne pas modifier à la main : régénérer après chaque migration.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_name: string
          body: string
          created_at: string
          cta_label: string | null
          id: string
          promotion_id: string | null
          target_url: string | null
          title: string
        }
        Insert: {
          author_name?: string
          body: string
          created_at?: string
          cta_label?: string | null
          id?: string
          promotion_id?: string | null
          target_url?: string | null
          title: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          cta_label?: string | null
          id?: string
          promotion_id?: string | null
          target_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          course_id: string
          created_at: string
          due_at: string
          id: string
          instructions: string
          promotion_id: string
          requires_file: boolean
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          due_at: string
          id?: string
          instructions?: string
          promotion_id: string
          requires_file?: boolean
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          due_at?: string
          id?: string
          instructions?: string
          promotion_id?: string
          requires_file?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          competency_block: string | null
          created_at: string
          description: string
          formation_id: string
          id: string
          objectives: string[]
          position: number
          title: string
        }
        Insert: {
          competency_block?: string | null
          created_at?: string
          description?: string
          formation_id: string
          id?: string
          objectives?: string[]
          position?: number
          title: string
        }
        Update: {
          competency_block?: string | null
          created_at?: string
          description?: string
          formation_id?: string
          id?: string
          objectives?: string[]
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          coefficient: number
          course_id: string
          created_at: string
          held_on: string
          id: string
          max_score: number
          promotion_id: string
          published: boolean
          title: string
        }
        Insert: {
          coefficient?: number
          course_id: string
          created_at?: string
          held_on: string
          id?: string
          max_score?: number
          promotion_id: string
          published?: boolean
          title: string
        }
        Update: {
          coefficient?: number
          course_id?: string
          created_at?: string
          held_on?: string
          id?: string
          max_score?: number
          promotion_id?: string
          published?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      formations: {
        Row: {
          created_at: string
          id: string
          level: number | null
          rncp_code: string | null
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number | null
          rncp_code?: string | null
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number | null
          rncp_code?: string | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          comment: string
          created_at: string
          evaluation_id: string
          id: string
          result: string | null
          score: number | null
          student_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          evaluation_id: string
          id?: string
          result?: string | null
          score?: number | null
          student_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          evaluation_id?: string
          id?: string
          result?: string | null
          score?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          course_id: string
          created_at: string
          file_path: string | null
          id: string
          link_url: string | null
          session_id: string | null
          title: string
          visible_from: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          file_path?: string | null
          id?: string
          link_url?: string | null
          session_id?: string | null
          title: string
          visible_from?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          file_path?: string | null
          id?: string
          link_url?: string | null
          session_id?: string | null
          title?: string
          visible_from?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          announcements_seen_at: string
          avatar_path: string | null
          company_name: string | null
          created_at: string
          deactivated: boolean
          email: string
          first_name: string
          id: string
          last_name: string
          promotion_id: string | null
          role: string
          updated_at: string
        }
        Insert: {
          announcements_seen_at?: string
          avatar_path?: string | null
          company_name?: string | null
          created_at?: string
          deactivated?: boolean
          email: string
          first_name?: string
          id: string
          last_name?: string
          promotion_id?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          announcements_seen_at?: string
          avatar_path?: string | null
          company_name?: string | null
          created_at?: string
          deactivated?: boolean
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          promotion_id?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string
          ends_on: string
          formation_id: string
          id: string
          label: string
          starts_on: string
        }
        Insert: {
          created_at?: string
          ends_on: string
          formation_id: string
          id?: string
          label: string
          starts_on: string
        }
        Update: {
          created_at?: string
          ends_on?: string
          formation_id?: string
          id?: string
          label?: string
          starts_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          course_id: string | null
          created_at: string
          description: string
          ends_at: string
          id: string
          kind: string
          promotion_id: string
          room: string | null
          starts_at: string
          title: string
          trainer_name: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string
          ends_at: string
          id?: string
          kind?: string
          promotion_id: string
          room?: string | null
          starts_at: string
          title: string
          trainer_name?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string
          ends_at?: string
          id?: string
          kind?: string
          promotion_id?: string
          room?: string | null
          starts_at?: string
          title?: string
          trainer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assignment_id: string
          comment: string
          file_path: string | null
          id: string
          student_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          assignment_id: string
          comment?: string
          file_path?: string | null
          id?: string
          student_id: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          comment?: string
          file_path?: string | null
          id?: string
          student_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      student_viewer_context: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
