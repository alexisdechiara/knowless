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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      friendship: {
        Row: {
          created_at: string | null
          friend_id: string
          id: number
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: number
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: number
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          created_at: string
          current_player_index: number | null
          current_question_index: number | null
          id: number
          phase: string
          players_data: Json[] | null
          questions: Json[] | null
        }
        Insert: {
          created_at?: string
          current_player_index?: number | null
          current_question_index?: number | null
          id?: number
          phase?: string
          players_data?: Json[] | null
          questions?: Json[] | null
        }
        Update: {
          created_at?: string
          current_player_index?: number | null
          current_question_index?: number | null
          id?: number
          phase?: string
          players_data?: Json[] | null
          questions?: Json[] | null
        }
        Relationships: []
      }
      lobbies: {
        Row: {
          banned_players: string[] | null
          created_at: string
          friends_only: boolean | null
          game_id: number | null
          host: string
          id: number
          invited_friends: string[] | null
          is_public: boolean | null
          max_players: number
          nb_questions: number | null
          password: string | null
          players: string[] | null
          security_level: string[] | null
          title: string
        }
        Insert: {
          banned_players?: string[] | null
          created_at?: string
          friends_only?: boolean | null
          game_id?: number | null
          host?: string
          id?: number
          invited_friends?: string[] | null
          is_public?: boolean | null
          max_players?: number
          nb_questions?: number | null
          password?: string | null
          players?: string[] | null
          security_level?: string[] | null
          title: string
        }
        Update: {
          banned_players?: string[] | null
          created_at?: string
          friends_only?: boolean | null
          game_id?: number | null
          host?: string
          id?: number
          invited_friends?: string[] | null
          is_public?: boolean | null
          max_players?: number
          nb_questions?: number | null
          password?: string | null
          players?: string[] | null
          security_level?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobbies_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          avatar: string | null
          categories: Json | null
          created_at: string
          id: string
          language: string | null
          last_active_at: string | null
          lobby_id: number | null
          stats: Json | null
          status: string | null
          theme: Database["public"]["Enums"]["themes"] | null
          username: string
          usertag: string
        }
        Insert: {
          avatar?: string | null
          categories?: Json | null
          created_at?: string
          id: string
          language?: string | null
          last_active_at?: string | null
          lobby_id?: number | null
          stats?: Json | null
          status?: string | null
          theme?: Database["public"]["Enums"]["themes"] | null
          username: string
          usertag?: string
        }
        Update: {
          avatar?: string | null
          categories?: Json | null
          created_at?: string
          id?: string
          language?: string | null
          last_active_at?: string | null
          lobby_id?: number | null
          stats?: Json | null
          status?: string | null
          theme?: Database["public"]["Enums"]["themes"] | null
          username?: string
          usertag?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          anecdote: string | null
          answers: Json[] | null
          category: string
          difficulty: Database["public"]["Enums"]["difficulties"] | null
          id: number
          language: Database["public"]["Enums"]["languages"]
          metadata: Json | null
          nb_count: number | null
          question: string | null
          theme: string
          theme_id: number
          type: Database["public"]["Enums"]["types"]
          wiki: string | null
        }
        Insert: {
          anecdote?: string | null
          answers?: Json[] | null
          category: string
          difficulty?: Database["public"]["Enums"]["difficulties"] | null
          id?: number
          language?: Database["public"]["Enums"]["languages"]
          metadata?: Json | null
          nb_count?: number | null
          question?: string | null
          theme: string
          theme_id: number
          type?: Database["public"]["Enums"]["types"]
          wiki?: string | null
        }
        Update: {
          anecdote?: string | null
          answers?: Json[] | null
          category?: string
          difficulty?: Database["public"]["Enums"]["difficulties"] | null
          id?: number
          language?: Database["public"]["Enums"]["languages"]
          metadata?: Json | null
          nb_count?: number | null
          question?: string | null
          theme?: string
          theme_id?: number
          type?: Database["public"]["Enums"]["types"]
          wiki?: string | null
        }
        Relationships: []
      }
      statistics: {
        Row: {
          best_score: number | null
          best_score_date: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulties"]
          nb_games: number | null
          nb_rounds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_score?: number | null
          best_score_date?: string | null
          created_at?: string
          difficulty: Database["public"]["Enums"]["difficulties"]
          nb_games?: number | null
          nb_rounds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          best_score?: number | null
          best_score_date?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulties"]
          nb_games?: number | null
          nb_rounds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_friendship: {
        Args: { p_friend_id: string; p_user_id: string }
        Returns: undefined
      }
      add_player_to_lobby: {
        Args: { new_lobby_id: number; player_id: string }
        Returns: undefined
      }
      delete_all_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_anonymous_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_random_quiz: {
        Args: {
          p_category: string
          p_language: Database["public"]["Enums"]["languages"]
          p_limit?: number
        }
        Returns: {
          anecdote: string | null
          answers: Json[] | null
          category: string
          difficulty: Database["public"]["Enums"]["difficulties"] | null
          id: number
          language: Database["public"]["Enums"]["languages"]
          metadata: Json | null
          nb_count: number | null
          question: string | null
          theme: string
          theme_id: number
          type: Database["public"]["Enums"]["types"]
          wiki: string | null
        }[]
      }
      get_random_quizzes: {
        Args: {
          p_categories: string[]
          p_difficulty?: Database["public"]["Enums"]["difficulties"]
          p_language: Database["public"]["Enums"]["languages"]
          p_limit?: number
        }
        Returns: {
          anecdote: string | null
          answers: Json[] | null
          category: string
          difficulty: Database["public"]["Enums"]["difficulties"] | null
          id: number
          language: Database["public"]["Enums"]["languages"]
          metadata: Json | null
          nb_count: number | null
          question: string | null
          theme: string
          theme_id: number
          type: Database["public"]["Enums"]["types"]
          wiki: string | null
        }[]
      }
      next_player_correction: {
        Args: {
          p_game_id: number
          p_new_default_score: number
          p_new_player_index: number
          p_new_question_index: number
          p_player_id: string
        }
        Returns: undefined
      }
      remove_friendship: {
        Args: { p_friend_id: string; p_user_id: string }
        Returns: undefined
      }
      remove_inactive_lobbies: {
        Args: { hours_threshold?: unknown }
        Returns: undefined
      }
      update_answer: {
        Args: {
          p_answer_index: number
          p_game_id: number
          p_new_answer: string
          p_player_id: string
        }
        Returns: undefined
      }
      update_player_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      difficulties: "easy" | "medium" | "hard"
      languages: "fr" | "en" | "es" | "it" | "de" | "nl"
      themes: "light" | "dark" | "system"
      types: "open" | "two" | "four" | "order" | "range"
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
      difficulties: ["easy", "medium", "hard"],
      languages: ["fr", "en", "es", "it", "de", "nl"],
      themes: ["light", "dark", "system"],
      types: ["open", "two", "four", "order", "range"],
    },
  },
} as const
