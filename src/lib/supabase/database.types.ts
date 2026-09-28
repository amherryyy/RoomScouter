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
      boarding_house_facilities: {
        Row: {
          boarding_house_id: string
          facility_id: number
        }
        Insert: {
          boarding_house_id: string
          facility_id: number
        }
        Update: {
          boarding_house_id?: string
          facility_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "boarding_house_facilities_boarding_house_id_fkey"
            columns: ["boarding_house_id"]
            isOneToOne: false
            referencedRelation: "boarding_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boarding_house_facilities_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      boarding_house_utilities: {
        Row: {
          boarding_house_id: string
          details: string | null
          is_included: boolean
          utility_id: number
        }
        Insert: {
          boarding_house_id: string
          details?: string | null
          is_included: boolean
          utility_id: number
        }
        Update: {
          boarding_house_id?: string
          details?: string | null
          is_included?: boolean
          utility_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "boarding_house_utilities_boarding_house_id_fkey"
            columns: ["boarding_house_id"]
            isOneToOne: false
            referencedRelation: "boarding_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boarding_house_utilities_utility_id_fkey"
            columns: ["utility_id"]
            isOneToOne: false
            referencedRelation: "utilities"
            referencedColumns: ["id"]
          },
        ]
      }
      boarding_houses: {
        Row: {
          address_line: string
          available_rooms: number
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          description: string
          id: string
          latitude: number
          longitude: number
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          monthly_rent: number
          owner_id: string
          room_type: Database["public"]["Enums"]["room_type"]
          status: Database["public"]["Enums"]["listing_status"]
          submitted_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          address_line: string
          available_rooms: number
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          description: string
          id?: string
          latitude: number
          longitude: number
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          monthly_rent: number
          owner_id: string
          room_type: Database["public"]["Enums"]["room_type"]
          status?: Database["public"]["Enums"]["listing_status"]
          submitted_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          address_line?: string
          available_rooms?: number
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          latitude?: number
          longitude?: number
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          monthly_rent?: number
          owner_id?: string
          room_type?: Database["public"]["Enums"]["room_type"]
          status?: Database["public"]["Enums"]["listing_status"]
          submitted_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boarding_houses_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boarding_houses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          boarding_house_id: string
          created_at: string
          student_id: string
        }
        Insert: {
          boarding_house_id: string
          created_at?: string
          student_id: string
        }
        Update: {
          boarding_house_id?: string
          created_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_boarding_house_id_fkey"
            columns: ["boarding_house_id"]
            isOneToOne: false
            referencedRelation: "boarding_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      house_rules: {
        Row: {
          boarding_house_id: string
          id: string
          position: number
          rule_text: string
        }
        Insert: {
          boarding_house_id: string
          id?: string
          position: number
          rule_text: string
        }
        Update: {
          boarding_house_id?: string
          id?: string
          position?: number
          rule_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "house_rules_boarding_house_id_fkey"
            columns: ["boarding_house_id"]
            isOneToOne: false
            referencedRelation: "boarding_houses"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_photos: {
        Row: {
          alt_text: string
          boarding_house_id: string
          byte_size: number
          created_at: string
          created_by: string
          id: string
          media_type: string
          object_path: string
          position: number
        }
        Insert: {
          alt_text: string
          boarding_house_id: string
          byte_size: number
          created_at?: string
          created_by: string
          id?: string
          media_type: string
          object_path: string
          position: number
        }
        Update: {
          alt_text?: string
          boarding_house_id?: string
          byte_size?: number
          created_at?: string
          created_by?: string
          id?: string
          media_type?: string
          object_path?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_photos_boarding_house_id_fkey"
            columns: ["boarding_house_id"]
            isOneToOne: false
            referencedRelation: "boarding_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_photos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_events: {
        Row: {
          action: Database["public"]["Enums"]["listing_status"]
          actor_id: string
          boarding_house_id: string
          created_at: string
          id: number
          reason: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["listing_status"]
          actor_id: string
          boarding_house_id: string
          created_at?: string
          id?: never
          reason?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["listing_status"]
          actor_id?: string
          boarding_house_id?: string
          created_at?: string
          id?: never
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_events_boarding_house_id_fkey"
            columns: ["boarding_house_id"]
            isOneToOne: false
            referencedRelation: "boarding_houses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          boarding_house_id: string
          comment: string
          created_at: string
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          rating: number
          status: Database["public"]["Enums"]["review_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          boarding_house_id: string
          comment: string
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          rating: number
          status?: Database["public"]["Enums"]["review_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          boarding_house_id?: string
          comment?: string
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          rating?: number
          status?: Database["public"]["Enums"]["review_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_boarding_house_id_fkey"
            columns: ["boarding_house_id"]
            isOneToOne: false
            referencedRelation: "boarding_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      utilities: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_reviews: {
        Row: {
          boarding_house_id: string | null
          comment: string | null
          created_at: string | null
          id: string | null
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          boarding_house_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          boarding_house_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_boarding_house_id_fkey"
            columns: ["boarding_house_id"]
            isOneToOne: false
            referencedRelation: "boarding_houses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assert_current_owner_listing: {
        Args: { target_id: string }
        Returns: undefined
      }
      current_user_can_manage_listing_photo: {
        Args: { object_name: string }
        Returns: boolean
      }
      current_user_is_admin: { Args: never; Returns: boolean }
      current_user_is_owner: { Args: never; Returns: boolean }
      current_user_is_student: { Args: never; Returns: boolean }
      get_current_student_review: {
        Args: { target_id: string }
        Returns: {
          comment: string
          created_at: string
          id: string
          moderation_note: string
          rating: number
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
        }[]
      }
      get_public_review_summary: {
        Args: { target_id: string }
        Returns: {
          average_rating: number
          review_count: number
        }[]
      }
      moderate_boarding_house: {
        Args: {
          decision: Database["public"]["Enums"]["listing_status"]
          reason?: string
          target_id: string
        }
        Returns: {
          address_line: string
          available_rooms: number
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          description: string
          id: string
          latitude: number
          longitude: number
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          monthly_rent: number
          owner_id: string
          room_type: Database["public"]["Enums"]["room_type"]
          status: Database["public"]["Enums"]["listing_status"]
          submitted_at: string | null
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "boarding_houses"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      provision_admin: { Args: { target_email: string }; Returns: string }
      replace_boarding_house_facilities: {
        Args: { target_facility_ids: number[]; target_id: string }
        Returns: number
      }
      replace_boarding_house_utilities: {
        Args: {
          target_detail_values: string[]
          target_id: string
          target_included_values: boolean[]
          target_utility_ids: number[]
        }
        Returns: number
      }
      replace_house_rules: {
        Args: { target_id: string; target_rules: string[] }
        Returns: number
      }
      replace_listing_photo_details: {
        Args: {
          target_alt_texts: string[]
          target_id: string
          target_photo_ids: string[]
        }
        Returns: number
      }
      search_public_boarding_houses: {
        Args: {
          maximum_distance_km?: number
          maximum_monthly_rent?: number
          minimum_available_rooms?: number
          page_offset?: number
          page_size?: number
          search_text?: string
          selected_facility_id?: number
          selected_room_type?: Database["public"]["Enums"]["room_type"]
          selected_utility_id?: number
          university_latitude?: number
          university_longitude?: number
        }
        Returns: {
          address_line: string
          approximate_distance_km: number
          available_rooms: number
          description: string
          id: string
          latitude: number
          longitude: number
          monthly_rent: number
          room_type: Database["public"]["Enums"]["room_type"]
          title: string
          total_count: number
        }[]
      }
      submit_boarding_house: {
        Args: { target_id: string }
        Returns: {
          address_line: string
          available_rooms: number
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          description: string
          id: string
          latitude: number
          longitude: number
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          monthly_rent: number
          owner_id: string
          room_type: Database["public"]["Enums"]["room_type"]
          status: Database["public"]["Enums"]["listing_status"]
          submitted_at: string | null
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "boarding_houses"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "student" | "owner" | "admin"
      listing_status: "draft" | "pending" | "approved" | "rejected" | "archived"
      review_status: "published" | "hidden"
      room_type: "bedspace" | "shared_room" | "private_room" | "studio"
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
    Enums: {
      app_role: ["student", "owner", "admin"],
      listing_status: ["draft", "pending", "approved", "rejected", "archived"],
      review_status: ["published", "hidden"],
      room_type: ["bedspace", "shared_room", "private_room", "studio"],
    },
  },
} as const
