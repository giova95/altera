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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_personas: {
        Row: {
          consent_given: boolean
          consent_timestamp: string | null
          context_events: Json | null
          created_at: string
          id: string
          interview_answers: Json | null
          interview_questions: Json | null
          status: Database["public"]["Enums"]["persona_status"]
          traits: Json | null
          transcription: string | null
          updated_at: string
          user_id: string
          voice_profile_id: string | null
        }
        Insert: {
          consent_given?: boolean
          consent_timestamp?: string | null
          context_events?: Json | null
          created_at?: string
          id?: string
          interview_answers?: Json | null
          interview_questions?: Json | null
          status?: Database["public"]["Enums"]["persona_status"]
          traits?: Json | null
          transcription?: string | null
          updated_at?: string
          user_id: string
          voice_profile_id?: string | null
        }
        Update: {
          consent_given?: boolean
          consent_timestamp?: string | null
          context_events?: Json | null
          created_at?: string
          id?: string
          interview_answers?: Json | null
          interview_questions?: Json | null
          status?: Database["public"]["Enums"]["persona_status"]
          traits?: Json | null
          transcription?: string | null
          updated_at?: string
          user_id?: string
          voice_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_personas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_role: Database["public"]["Enums"]["user_role"]
          work_role: Database["public"]["Enums"]["work_role"] | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
          work_role?: Database["public"]["Enums"]["work_role"] | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
          work_role?: Database["public"]["Enums"]["work_role"] | null
        }
        Relationships: []
      }
      saved_phrases: {
        Row: {
          context: string | null
          created_at: string
          id: string
          phrase: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          phrase: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          phrase?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_phrases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          simulation_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          simulation_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          simulation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_messages_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          completed_at: string | null
          context: string | null
          created_at: string
          emotion: Database["public"]["Enums"]["emotion"] | null
          id: string
          is_using_persona: boolean | null
          other_role: Database["public"]["Enums"]["work_role"]
          persona_id: string | null
          theme: Database["public"]["Enums"]["conversation_theme"]
          user_id: string
          user_role: Database["public"]["Enums"]["work_role"]
        }
        Insert: {
          completed_at?: string | null
          context?: string | null
          created_at?: string
          emotion?: Database["public"]["Enums"]["emotion"] | null
          id?: string
          is_using_persona?: boolean | null
          other_role: Database["public"]["Enums"]["work_role"]
          persona_id?: string | null
          theme: Database["public"]["Enums"]["conversation_theme"]
          user_id: string
          user_role: Database["public"]["Enums"]["work_role"]
        }
        Update: {
          completed_at?: string | null
          context?: string | null
          created_at?: string
          emotion?: Database["public"]["Enums"]["emotion"] | null
          id?: string
          is_using_persona?: boolean | null
          other_role?: Database["public"]["Enums"]["work_role"]
          persona_id?: string | null
          theme?: Database["public"]["Enums"]["conversation_theme"]
          user_id?: string
          user_role?: Database["public"]["Enums"]["work_role"]
        }
        Relationships: [
          {
            foreignKeyName: "simulations_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "ai_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_recordings: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          persona_id: string
          recording_url: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          persona_id: string
          recording_url?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          persona_id?: string
          recording_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_recordings_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "ai_personas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      conversation_theme:
        | "feedback"
        | "performance"
        | "conflict"
        | "workload"
        | "change_decision"
        | "other"
      emotion:
        | "anxious"
        | "guilty"
        | "frustrated"
        | "calm_unsure"
        | "confident"
        | "other"
      persona_status:
        | "not_created"
        | "in_progress"
        | "processing"
        | "active"
        | "failed"
      user_role: "standard" | "hr" | "admin"
      work_role:
        | "individual_contributor"
        | "manager"
        | "hr"
        | "leadership"
        | "other"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      conversation_theme: [
        "feedback",
        "performance",
        "conflict",
        "workload",
        "change_decision",
        "other",
      ],
      emotion: [
        "anxious",
        "guilty",
        "frustrated",
        "calm_unsure",
        "confident",
        "other",
      ],
      persona_status: [
        "not_created",
        "in_progress",
        "processing",
        "active",
        "failed",
      ],
      user_role: ["standard", "hr", "admin"],
      work_role: [
        "individual_contributor",
        "manager",
        "hr",
        "leadership",
        "other",
      ],
    },
  },
} as const
