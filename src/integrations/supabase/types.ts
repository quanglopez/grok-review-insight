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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analysis_reports: {
        Row: {
          average_rating: number | null
          business_id: string
          created_at: string
          id: string
          keywords: Json | null
          pain_points: Json | null
          raw_result_json: Json | null
          reply_templates: Json | null
          sentiment: string | null
          top_complaints: Json | null
          top_strengths: Json | null
          topics: Json | null
        }
        Insert: {
          average_rating?: number | null
          business_id: string
          created_at?: string
          id?: string
          keywords?: Json | null
          pain_points?: Json | null
          raw_result_json?: Json | null
          reply_templates?: Json | null
          sentiment?: string | null
          top_complaints?: Json | null
          top_strengths?: Json | null
          topics?: Json | null
        }
        Update: {
          average_rating?: number | null
          business_id?: string
          created_at?: string
          id?: string
          keywords?: Json | null
          pain_points?: Json | null
          raw_result_json?: Json | null
          reply_templates?: Json | null
          sentiment?: string | null
          top_complaints?: Json | null
          top_strengths?: Json | null
          topics?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          category: string | null
          created_at: string
          google_maps_url: string | null
          id: string
          location: string | null
          name: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          google_maps_url?: string | null
          id?: string
          location?: string | null
          name: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          google_maps_url?: string | null
          id?: string
          location?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          action_steps: Json | null
          created_at: string
          difficulty: string | null
          evidence: string | null
          expected_impact: string | null
          id: string
          kpi: string | null
          priority: string | null
          problem: string | null
          rank: number
          report_id: string
          timeline: string | null
          title: string
        }
        Insert: {
          action_steps?: Json | null
          created_at?: string
          difficulty?: string | null
          evidence?: string | null
          expected_impact?: string | null
          id?: string
          kpi?: string | null
          priority?: string | null
          problem?: string | null
          rank: number
          report_id: string
          timeline?: string | null
          title: string
        }
        Update: {
          action_steps?: Json | null
          created_at?: string
          difficulty?: string | null
          evidence?: string | null
          expected_impact?: string | null
          id?: string
          kpi?: string | null
          priority?: string | null
          problem?: string | null
          rank?: number
          report_id?: string
          timeline?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "analysis_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          business_id: string
          created_at: string
          id: string
          owner_reply: string | null
          rating: number
          review_date: string | null
          review_text: string | null
          reviewer_name: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          owner_reply?: string | null
          rating: number
          review_date?: string | null
          review_text?: string | null
          reviewer_name?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          owner_reply?: string | null
          rating?: number
          review_date?: string | null
          review_text?: string | null
          reviewer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
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
    Enums: {},
  },
} as const
