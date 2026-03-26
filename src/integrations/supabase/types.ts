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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      leads: {
        Row: {
          created_at: string
          id: string
          resident_id: string
          tradesman_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resident_id: string
          tradesman_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resident_id?: string
          tradesman_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_tradesman_id_fkey"
            columns: ["tradesman_id"]
            isOneToOne: false
            referencedRelation: "tradesmen"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_admin: boolean
          is_blocked: boolean
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          is_admin?: boolean
          is_blocked?: boolean
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_admin?: boolean
          is_blocked?: boolean
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          resident_id: string
          tradesman_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          resident_id: string
          tradesman_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          resident_id?: string
          tradesman_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_tradesman_id_fkey"
            columns: ["tradesman_id"]
            isOneToOne: false
            referencedRelation: "tradesmen"
            referencedColumns: ["id"]
          },
        ]
      }
      tradesman_leads: {
        Row: {
          admin_notes: string | null
          approved_tradesman_id: string | null
          clean_bio: string | null
          clean_location: string | null
          clean_name: string | null
          created_at: string
          id: string
          raw_bio: string | null
          raw_languages: string[]
          raw_location: string | null
          raw_name: string
          raw_phone: string | null
          raw_trade: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          approved_tradesman_id?: string | null
          clean_bio?: string | null
          clean_location?: string | null
          clean_name?: string | null
          created_at?: string
          id?: string
          raw_bio?: string | null
          raw_languages?: string[]
          raw_location?: string | null
          raw_name: string
          raw_phone?: string | null
          raw_trade?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          approved_tradesman_id?: string | null
          clean_bio?: string | null
          clean_location?: string | null
          clean_name?: string | null
          created_at?: string
          id?: string
          raw_bio?: string | null
          raw_languages?: string[]
          raw_location?: string | null
          raw_name?: string
          raw_phone?: string | null
          raw_trade?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tradesman_leads_approved_tradesman_id_fkey"
            columns: ["approved_tradesman_id"]
            isOneToOne: false
            referencedRelation: "tradesmen"
            referencedColumns: ["id"]
          },
        ]
      }
      tradesmen: {
        Row: {
          additional_categories: string[]
          bio: string | null
          created_at: string
          full_name: string
          id: string
          is_available: boolean
          is_claimed: boolean
          is_featured: boolean
          languages: string[]
          location: string | null
          phone_verified: boolean
          profile_image_url: string | null
          services: string[] | null
          subscription_tier: string
          trade_category: Database["public"]["Enums"]["trade_category"]
          updated_at: string
          user_id: string | null
          vetted_by_community: boolean
          view_count: number
          whatsapp_number: string | null
        }
        Insert: {
          additional_categories?: string[]
          bio?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_available?: boolean
          is_claimed?: boolean
          is_featured?: boolean
          languages?: string[]
          location?: string | null
          phone_verified?: boolean
          profile_image_url?: string | null
          services?: string[] | null
          subscription_tier?: string
          trade_category?: Database["public"]["Enums"]["trade_category"]
          updated_at?: string
          user_id?: string | null
          vetted_by_community?: boolean
          view_count?: number
          whatsapp_number?: string | null
        }
        Update: {
          additional_categories?: string[]
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_available?: boolean
          is_claimed?: boolean
          is_featured?: boolean
          languages?: string[]
          location?: string | null
          phone_verified?: boolean
          profile_image_url?: string | null
          services?: string[] | null
          subscription_tier?: string
          trade_category?: Database["public"]["Enums"]["trade_category"]
          updated_at?: string
          user_id?: string | null
          vetted_by_community?: boolean
          view_count?: number
          whatsapp_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_tradesman_profile:
        | { Args: { _phone: string }; Returns: string }
        | { Args: { _phone: string; _user_id: string }; Returns: string }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_blocked: { Args: { _user_id: string }; Returns: boolean }
      is_tradesman_owner: { Args: { _tradesman_id: string }; Returns: boolean }
    }
    Enums: {
      trade_category:
        | "electrician"
        | "plumber"
        | "carpenter"
        | "painter"
        | "general_handyman"
        | "locksmith"
        | "gardener"
        | "cleaner"
        | "mason"
        | "roofer"
        | "hvac"
        | "other"
      user_role: "tradesman" | "resident"
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
      trade_category: [
        "electrician",
        "plumber",
        "carpenter",
        "painter",
        "general_handyman",
        "locksmith",
        "gardener",
        "cleaner",
        "mason",
        "roofer",
        "hvac",
        "other",
      ],
      user_role: ["tradesman", "resident"],
    },
  },
} as const
