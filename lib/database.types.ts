export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string
          name: string
          city_id: string
          type: string
          coordinates: Json
          description: string | null
          price: number
          image_url: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          city_id: string
          type: string
          coordinates: Json
          description?: string | null
          price: number
          image_url?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          city_id?: string
          type?: string
          coordinates?: Json
          description?: string | null
          price?: number
          image_url?: string | null
          color?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_city_id_fkey"
            columns: ["city_id"]
            referencedRelation: "cities"
            referencedColumns: ["id"]
          }
        ]
      }
      cities: {
        Row: {
          id: string
          name: string
          country_id: string
          coordinates: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country_id: string
          coordinates: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country_id?: string
          coordinates?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            referencedRelation: "countries"
            referencedColumns: ["id"]
          }
        ]
      }
      countries: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      step_logs: {
        Row: {
          id: string
          user_id: string
          steps: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          steps: number
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          steps?: number
          date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_assets: {
        Row: {
          id: string
          user_id: string
          asset_id: string
          purchase_price: number
          purchase_date: string
        }
        Insert: {
          id?: string
          user_id: string
          asset_id: string
          purchase_price: number
          purchase_date?: string
        }
        Update: {
          id?: string
          user_id?: string
          asset_id?: string
          purchase_price?: number
          purchase_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_assets_asset_id_fkey"
            columns: ["asset_id"]
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_assets_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          steps: number
          coins: number
          created_at: string
          updated_at: string
          avatar_url: string | null
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          steps?: number
          coins?: number
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          steps?: number
          coins?: number
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      purchase_asset: {
        Args: {
          p_user_id: string
          p_asset_id: string
          p_price: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}