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
      football_dual_ledger: {
        Row: {
          away: string
          div: string
          home: string
          kickoff_utc: string
          lambda: number[]
          locked_at: string
          match_key: string
          odds: number[] | null
          odds_source: string
          p_a: number[]
          p_b_d: number
          p_final: number[]
          pick_odds: number | null
          prediction: string
          stake: number
          version: string
        }
        Insert: {
          away: string
          div: string
          home: string
          kickoff_utc: string
          lambda: number[]
          locked_at?: string
          match_key: string
          odds?: number[] | null
          odds_source?: string
          p_a: number[]
          p_b_d: number
          p_final: number[]
          pick_odds?: number | null
          prediction: string
          stake?: number
          version?: string
        }
        Update: {
          away?: string
          div?: string
          home?: string
          kickoff_utc?: string
          lambda?: number[]
          locked_at?: string
          match_key?: string
          odds?: number[] | null
          odds_source?: string
          p_a?: number[]
          p_b_d?: number
          p_final?: number[]
          pick_odds?: number | null
          prediction?: string
          stake?: number
          version?: string
        }
        Relationships: []
      }
      football_lineup_settle: {
        Row: {
          away_formation_ok: boolean | null
          away_hits: number | null
          home_formation_ok: boolean | null
          home_hits: number | null
          incidents: Json | null
          match_key: string
          official: Json | null
          post_stats: Json | null
          settled_at: string
        }
        Insert: {
          away_formation_ok?: boolean | null
          away_hits?: number | null
          home_formation_ok?: boolean | null
          home_hits?: number | null
          incidents?: Json | null
          match_key: string
          official?: Json | null
          post_stats?: Json | null
          settled_at?: string
        }
        Update: {
          away_formation_ok?: boolean | null
          away_hits?: number | null
          home_formation_ok?: boolean | null
          home_hits?: number | null
          incidents?: Json | null
          match_key?: string
          official?: Json | null
          post_stats?: Json | null
          settled_at?: string
        }
        Relationships: []
      }
      football_lineup_snapshots: {
        Row: {
          away: string
          bsd_event_id: number | null
          bsd_latency_ms: number | null
          bsd_prediction: Json | null
          captured_at: string
          context: Json | null
          div: string
          error: string | null
          home: string
          kickoff_utc: string
          lineup_status: string | null
          lineups: Json | null
          match_key: string
          unavailable: Json | null
        }
        Insert: {
          away: string
          bsd_event_id?: number | null
          bsd_latency_ms?: number | null
          bsd_prediction?: Json | null
          captured_at?: string
          context?: Json | null
          div: string
          error?: string | null
          home: string
          kickoff_utc: string
          lineup_status?: string | null
          lineups?: Json | null
          match_key: string
          unavailable?: Json | null
        }
        Update: {
          away?: string
          bsd_event_id?: number | null
          bsd_latency_ms?: number | null
          bsd_prediction?: Json | null
          captured_at?: string
          context?: Json | null
          div?: string
          error?: string | null
          home?: string
          kickoff_utc?: string
          lineup_status?: string | null
          lineups?: Json | null
          match_key?: string
          unavailable?: Json | null
        }
        Relationships: []
      }
      model_versions: {
        Row: {
          engine: string
          fingerprint: string | null
          notes: string | null
          released_at: string
          status: string
          version: string
        }
        Insert: {
          engine: string
          fingerprint?: string | null
          notes?: string | null
          released_at: string
          status?: string
          version: string
        }
        Update: {
          engine?: string
          fingerprint?: string | null
          notes?: string | null
          released_at?: string
          status?: string
          version?: string
        }
        Relationships: []
      }
      ops_event_history: {
        Row: {
          event_key: string
          gate_key: string | null
          gate_status: string | null
          id: number
          kind: string
          message: string
          metadata: Json
          model_version: string | null
          occurred_at: string
          route: string | null
          severity: string
          source: string
          status_code: number | null
        }
        Insert: {
          event_key: string
          gate_key?: string | null
          gate_status?: string | null
          id?: never
          kind: string
          message: string
          metadata?: Json
          model_version?: string | null
          occurred_at?: string
          route?: string | null
          severity: string
          source: string
          status_code?: number | null
        }
        Update: {
          event_key?: string
          gate_key?: string | null
          gate_status?: string | null
          id?: never
          kind?: string
          message?: string
          metadata?: Json
          model_version?: string | null
          occurred_at?: string
          route?: string | null
          severity?: string
          source?: string
          status_code?: number | null
        }
        Relationships: []
      }
      race_dividends: {
        Row: {
          combo: string
          created_at: string
          date: string
          dividend: number
          id: number
          pool: string
          race_no: number
          unit: number
          venue: string
        }
        Insert: {
          combo: string
          created_at?: string
          date: string
          dividend: number
          id?: never
          pool: string
          race_no: number
          unit?: number
          venue: string
        }
        Update: {
          combo?: string
          created_at?: string
          date?: string
          dividend?: number
          id?: never
          pool?: string
          race_no?: number
          unit?: number
          venue?: string
        }
        Relationships: []
      }
      telegram_alert_state: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weather_snapshots: {
        Row: {
          captured_at: string
          gust_speed: number | null
          humidity: number | null
          id: string
          pressure: number | null
          rain_10min: number | null
          rain_today: number | null
          sectional: Json
          soil_loss_today: number | null
          soil_water: number | null
          station_time: string | null
          sunshine_hour: number | null
          temperature: number | null
          temperature_max: number | null
          temperature_min: number | null
          venue: string
          wind_direction: string | null
          wind_speed: number | null
        }
        Insert: {
          captured_at?: string
          gust_speed?: number | null
          humidity?: number | null
          id?: string
          pressure?: number | null
          rain_10min?: number | null
          rain_today?: number | null
          sectional?: Json
          soil_loss_today?: number | null
          soil_water?: number | null
          station_time?: string | null
          sunshine_hour?: number | null
          temperature?: number | null
          temperature_max?: number | null
          temperature_min?: number | null
          venue: string
          wind_direction?: string | null
          wind_speed?: number | null
        }
        Update: {
          captured_at?: string
          gust_speed?: number | null
          humidity?: number | null
          id?: string
          pressure?: number | null
          rain_10min?: number | null
          rain_today?: number | null
          sectional?: Json
          soil_loss_today?: number | null
          soil_water?: number | null
          station_time?: string | null
          sunshine_hour?: number | null
          temperature?: number | null
          temperature_max?: number | null
          temperature_min?: number | null
          venue?: string
          wind_direction?: string | null
          wind_speed?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
