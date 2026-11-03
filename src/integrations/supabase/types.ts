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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string
          heading: string | null
          id: string
          page_from: number | null
          page_to: number | null
          word_count: number | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding: string
          heading?: string | null
          id?: string
          page_from?: number | null
          page_to?: number | null
          word_count?: number | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string
          heading?: string | null
          id?: string
          page_from?: number | null
          page_to?: number | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          content: string
          content_hash: string | null
          created_at: string
          drive_file_id: string | null
          drive_url: string | null
          error_message: string | null
          file_name: string | null
          file_type: string | null
          folder_path: string | null
          id: string
          modified_time: string | null
          needs_ocr: boolean
          page_count: number | null
          source: string
          sync_status: string
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          content_hash?: string | null
          created_at?: string
          drive_file_id?: string | null
          drive_url?: string | null
          error_message?: string | null
          file_name?: string | null
          file_type?: string | null
          folder_path?: string | null
          id?: string
          modified_time?: string | null
          needs_ocr?: boolean
          page_count?: number | null
          source?: string
          sync_status?: string
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          content_hash?: string | null
          created_at?: string
          drive_file_id?: string | null
          drive_url?: string | null
          error_message?: string | null
          file_name?: string | null
          file_type?: string | null
          folder_path?: string | null
          id?: string
          modified_time?: string | null
          needs_ocr?: boolean
          page_count?: number | null
          source?: string
          sync_status?: string
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          sources: Json
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          sources?: Json
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          sources?: Json
        }
        Relationships: []
      }
      site_links: {
        Row: {
          discovered_at: string
          drive_id: string | null
          id: string
          link_type: string
          page_path: string
          page_title: string
          url: string
        }
        Insert: {
          discovered_at?: string
          drive_id?: string | null
          id?: string
          link_type: string
          page_path: string
          page_title: string
          url: string
        }
        Update: {
          discovered_at?: string
          drive_id?: string | null
          id?: string
          link_type?: string
          page_path?: string
          page_title?: string
          url?: string
        }
        Relationships: []
      }
      sync_runs: {
        Row: {
          files_error: number
          files_found: number
          files_new: number
          files_removed: number
          files_updated: number
          finished_at: string | null
          folders_scanned: number
          id: string
          message: string | null
          pages_scanned: number
          started_at: string
          status: string
          trigger_type: string
        }
        Insert: {
          files_error?: number
          files_found?: number
          files_new?: number
          files_removed?: number
          files_updated?: number
          finished_at?: string | null
          folders_scanned?: number
          id?: string
          message?: string | null
          pages_scanned?: number
          started_at?: string
          status?: string
          trigger_type?: string
        }
        Update: {
          files_error?: number
          files_found?: number
          files_new?: number
          files_removed?: number
          files_updated?: number
          finished_at?: string | null
          folders_scanned?: number
          id?: string
          message?: string | null
          pages_scanned?: number
          started_at?: string
          status?: string
          trigger_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_chunks: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          content: string
          document_id: string
          file_name: string
          heading: string
          id: string
          page_from: number
          page_to: number
          similarity: number
          title: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
