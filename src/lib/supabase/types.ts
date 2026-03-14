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
      adgate_verifications: {
        Row: {
          campaign_id: string
          created_at: string
          dwell_sec: number
          id: string
          ttl_exp: string
          user_id: string
          utm: Json | null
          verified: boolean
        }
        Insert: {
          campaign_id: string
          created_at?: string
          dwell_sec: number
          id?: string
          ttl_exp: string
          user_id: string
          utm?: Json | null
          verified: boolean
        }
        Update: {
          campaign_id?: string
          created_at?: string
          dwell_sec?: number
          id?: string
          ttl_exp?: string
          user_id?: string
          utm?: Json | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "adgate_verifications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "event_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adgate_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          correlation_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: number
          notes: string | null
          payload: Json | null
          target: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string
          correlation_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: number
          notes?: string | null
          payload?: Json | null
          target?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          correlation_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: number
          notes?: string | null
          payload?: Json | null
          target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_ad_watch_verifications: {
        Row: {
          ad_session_id: string
          campaign_id: string
          completed_at: string | null
          created_at: string
          focus_lost: boolean
          id: string
          muted: boolean
          participant_id: string
          verification_payload: Json
          watched_ratio: number
        }
        Insert: {
          ad_session_id: string
          campaign_id: string
          completed_at?: string | null
          created_at?: string
          focus_lost?: boolean
          id?: string
          muted?: boolean
          participant_id: string
          verification_payload: Json
          watched_ratio: number
        }
        Update: {
          ad_session_id?: string
          campaign_id?: string
          completed_at?: string | null
          created_at?: string
          focus_lost?: boolean
          id?: string
          muted?: boolean
          participant_id?: string
          verification_payload?: Json
          watched_ratio?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_ad_watch_verifications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ticket_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_ad_watch_verifications_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "campaign_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_blacklist: {
        Row: {
          created_at: string
          expires_at: string | null
          external_user_id: string
          id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          external_user_id: string
          id?: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          external_user_id?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      campaign_draws: {
        Row: {
          algorithm_version: string
          campaign_id: string
          config: Json
          duration_ms: number
          executed_by: string | null
          id: string
          log_id: number | null
          run_at: string
          seed: number
          waitlist: Json
          winners: Json
        }
        Insert: {
          algorithm_version: string
          campaign_id: string
          config: Json
          duration_ms: number
          executed_by?: string | null
          id?: string
          log_id?: number | null
          run_at?: string
          seed: number
          waitlist: Json
          winners: Json
        }
        Update: {
          algorithm_version?: string
          campaign_id?: string
          config?: Json
          duration_ms?: number
          executed_by?: string | null
          id?: string
          log_id?: number | null
          run_at?: string
          seed?: number
          waitlist?: Json
          winners?: Json
        }
        Relationships: [
          {
            foreignKeyName: "campaign_draws_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ticket_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_draws_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "audit_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_entries: {
        Row: {
          ad_verification_id: string | null
          campaign_id: string
          created_at: string
          duplicate_group: string | null
          extra: Json | null
          fingerprint: Json | null
          id: string
          novelty_factor: number
          participant_id: string
          random_seed: number
          reason: string | null
          referral_factor: number
          status: Database["public"]["Enums"]["campaign_entry_status"]
          updated_at: string
          weight: number
        }
        Insert: {
          ad_verification_id?: string | null
          campaign_id: string
          created_at?: string
          duplicate_group?: string | null
          extra?: Json | null
          fingerprint?: Json | null
          id?: string
          novelty_factor?: number
          participant_id: string
          random_seed: number
          reason?: string | null
          referral_factor?: number
          status?: Database["public"]["Enums"]["campaign_entry_status"]
          updated_at?: string
          weight?: number
        }
        Update: {
          ad_verification_id?: string | null
          campaign_id?: string
          created_at?: string
          duplicate_group?: string | null
          extra?: Json | null
          fingerprint?: Json | null
          id?: string
          novelty_factor?: number
          participant_id?: string
          random_seed?: number
          reason?: string | null
          referral_factor?: number
          status?: Database["public"]["Enums"]["campaign_entry_status"]
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_entries_ad_verification_id_fkey"
            columns: ["ad_verification_id"]
            isOneToOne: false
            referencedRelation: "campaign_ad_watch_verifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_entries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ticket_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_entries_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "campaign_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_participants: {
        Row: {
          campaign_id: string
          consent_marketing: boolean
          created_at: string
          external_user_id: string
          hashed_contact: string
          id: string
          nickname: string | null
        }
        Insert: {
          campaign_id: string
          consent_marketing?: boolean
          created_at?: string
          external_user_id: string
          hashed_contact: string
          id?: string
          nickname?: string | null
        }
        Update: {
          campaign_id?: string
          consent_marketing?: boolean
          created_at?: string
          external_user_id?: string
          hashed_contact?: string
          id?: string
          nickname?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ticket_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_rules: {
        Row: {
          campaign_id: string
          config: Json
          created_at: string
          id: string
          is_active: boolean
          rule_type: string
        }
        Insert: {
          campaign_id: string
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          rule_type: string
        }
        Update: {
          campaign_id?: string
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          rule_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_rules_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "event_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_waitlist_promotions: {
        Row: {
          campaign_id: string
          id: string
          log_id: number | null
          participant_id: string
          promoted_from: number
          promoted_to: number
          run_at: string
          trigger: string
        }
        Insert: {
          campaign_id: string
          id?: string
          log_id?: number | null
          participant_id: string
          promoted_from: number
          promoted_to: number
          run_at?: string
          trigger: string
        }
        Update: {
          campaign_id?: string
          id?: string
          log_id?: number | null
          participant_id?: string
          promoted_from?: number
          promoted_to?: number
          run_at?: string
          trigger?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_waitlist_promotions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ticket_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_waitlist_promotions_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "audit_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_waitlist_promotions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "campaign_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_winner_responses: {
        Row: {
          created_at: string
          deadline: string
          draw_id: string
          id: string
          metadata: Json | null
          participant_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          deadline: string
          draw_id: string
          id?: string
          metadata?: Json | null
          participant_id: string
          responded_at?: string | null
          status: string
        }
        Update: {
          created_at?: string
          deadline?: string
          draw_id?: string
          id?: string
          metadata?: Json | null
          participant_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_winner_responses_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "campaign_draws"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_winner_responses_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "campaign_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          body: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          organization_id: string | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          organization_id?: string | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          organization_id?: string | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      entries: {
        Row: {
          ad_verified: boolean
          campaign_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          id: string
          intro_seen: boolean
          is_cancelled: boolean
          user_id: string
          weight: number
          weight_json: Json | null
        }
        Insert: {
          ad_verified?: boolean
          campaign_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          id?: string
          intro_seen?: boolean
          is_cancelled?: boolean
          user_id: string
          weight?: number
          weight_json?: Json | null
        }
        Update: {
          ad_verified?: boolean
          campaign_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          id?: string
          intro_seen?: boolean
          is_cancelled?: boolean
          user_id?: string
          weight?: number
          weight_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "entries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "event_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_campaigns: {
        Row: {
          adgate_rules: Json
          apply_end: string
          apply_start: string
          created_at: string
          draw_at: string
          id: string
          seats: number
          show_id: string
          status: string
          updated_at: string
          weight_rules: Json
        }
        Insert: {
          adgate_rules: Json
          apply_end: string
          apply_start: string
          created_at?: string
          draw_at: string
          id?: string
          seats: number
          show_id: string
          status?: string
          updated_at?: string
          weight_rules: Json
        }
        Update: {
          adgate_rules?: Json
          apply_end?: string
          apply_start?: string
          created_at?: string
          draw_at?: string
          id?: string
          seats?: number
          show_id?: string
          status?: string
          updated_at?: string
          weight_rules?: Json
        }
        Relationships: [
          {
            foreignKeyName: "event_campaigns_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_notes: string | null
          attachments: Json | null
          author_email: string | null
          author_name: string | null
          author_role: string | null
          created_at: string
          description: string
          id: string
          page_url: string | null
          priority: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          admin_notes?: string | null
          attachments?: Json | null
          author_email?: string | null
          author_name?: string | null
          author_role?: string | null
          created_at?: string
          description: string
          id?: string
          page_url?: string | null
          priority?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          admin_notes?: string | null
          attachments?: Json | null
          author_email?: string | null
          author_name?: string | null
          author_role?: string | null
          created_at?: string
          description?: string
          id?: string
          page_url?: string | null
          priority?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      lottery_runs: {
        Row: {
          campaign_id: string
          executed_at: string
          executed_by: string
          id: string
          seed_hash: string
          wait_json: Json
          winners_json: Json
        }
        Insert: {
          campaign_id: string
          executed_at?: string
          executed_by: string
          id?: string
          seed_hash: string
          wait_json: Json
          winners_json: Json
        }
        Update: {
          campaign_id?: string
          executed_at?: string
          executed_by?: string
          id?: string
          seed_hash?: string
          wait_json?: Json
          winners_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "lottery_runs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "event_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_runs_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          campaign_id: string | null
          created_at: string
          deliver_at: string
          id: string
          payload: Json | null
          state: string
          template: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          deliver_at: string
          id?: string
          payload?: Json | null
          state: string
          template: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          deliver_at?: string
          id?: string
          payload?: Json | null
          state?: string
          template?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "event_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_followers: {
        Row: {
          created_at: string
          follower_email: string | null
          follower_name: string | null
          follower_type: string
          id: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          follower_email?: string | null
          follower_name?: string | null
          follower_type?: string
          id?: string
          organization_id: string
        }
        Update: {
          created_at?: string
          follower_email?: string | null
          follower_name?: string | null
          follower_type?: string
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_followers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          follower_count: number
          genre_focus: string[] | null
          id: string
          instagram: string | null
          logo_url: string | null
          name: string
          region: string | null
          slug: string
          tagline: string | null
          updated_at: string
          website: string | null
          youtube: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          follower_count?: number
          genre_focus?: string[] | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name: string
          region?: string | null
          slug: string
          tagline?: string | null
          updated_at?: string
          website?: string | null
          youtube?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          follower_count?: number
          genre_focus?: string[] | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name?: string
          region?: string | null
          slug?: string
          tagline?: string | null
          updated_at?: string
          website?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      performance_submissions: {
        Row: {
          additional_notes: string | null
          assets_url: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          id: string
          organization_name: string
          organization_slug: string | null
          organization_website: string | null
          performance_category: string | null
          performance_region: string | null
          performance_slug: string | null
          performance_tags: string[] | null
          performance_title: string
          period_end: string | null
          period_start: string | null
          status: string
          submission_type: string
          synopsis: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          additional_notes?: string | null
          assets_url?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          organization_name: string
          organization_slug?: string | null
          organization_website?: string | null
          performance_category?: string | null
          performance_region?: string | null
          performance_slug?: string | null
          performance_tags?: string[] | null
          performance_title: string
          period_end?: string | null
          period_start?: string | null
          status?: string
          submission_type?: string
          synopsis?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          additional_notes?: string | null
          assets_url?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          organization_name?: string
          organization_slug?: string | null
          organization_website?: string | null
          performance_category?: string | null
          performance_region?: string | null
          performance_slug?: string | null
          performance_tags?: string[] | null
          performance_title?: string
          period_end?: string | null
          period_start?: string | null
          status?: string
          submission_type?: string
          synopsis?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      performances: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          hero_headline: string | null
          hero_subtitle: string | null
          id: string
          is_featured: boolean
          organization: string | null
          organization_id: string | null
          period_end: string | null
          period_start: string | null
          poster_url: string | null
          region: string | null
          slug: string
          status: string
          synopsis: string | null
          tags: string[] | null
          tasks: string[] | null
          ticket_link: string | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          hero_headline?: string | null
          hero_subtitle?: string | null
          id?: string
          is_featured?: boolean
          organization?: string | null
          organization_id?: string | null
          period_end?: string | null
          period_start?: string | null
          poster_url?: string | null
          region?: string | null
          slug: string
          status?: string
          synopsis?: string | null
          tags?: string[] | null
          tasks?: string[] | null
          ticket_link?: string | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          hero_headline?: string | null
          hero_subtitle?: string | null
          id?: string
          is_featured?: boolean
          organization?: string | null
          organization_id?: string | null
          period_end?: string | null
          period_start?: string | null
          poster_url?: string | null
          region?: string | null
          slug?: string
          status?: string
          synopsis?: string | null
          tags?: string[] | null
          tasks?: string[] | null
          ticket_link?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_requests: {
        Row: {
          additional_notes: string | null
          assets_url: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          id: string
          marketing_channels: string[] | null
          marketing_goals: string | null
          organization_name: string
          performance_category: string | null
          performance_dates: string | null
          performance_region: string | null
          performance_synopsis: string | null
          performance_title: string
          performance_venue: string | null
          status: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          assets_url?: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          id?: string
          marketing_channels?: string[] | null
          marketing_goals?: string | null
          organization_name: string
          performance_category?: string | null
          performance_dates?: string | null
          performance_region?: string | null
          performance_synopsis?: string | null
          performance_title: string
          performance_venue?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          assets_url?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          id?: string
          marketing_channels?: string[] | null
          marketing_goals?: string | null
          organization_name?: string
          performance_category?: string | null
          performance_dates?: string | null
          performance_region?: string | null
          performance_synopsis?: string | null
          performance_title?: string
          performance_venue?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      show_performances: {
        Row: {
          created_at: string
          id: string
          seat_capacity: number | null
          show_id: string
          starts_at: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          seat_capacity?: number | null
          show_id: string
          starts_at: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          seat_capacity?: number | null
          show_id?: string
          starts_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "show_performances_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      shows: {
        Row: {
          category: string | null
          created_at: string
          hero_image: string | null
          id: string
          intro_html: string | null
          partner_id: string | null
          region: string | null
          slug: string
          status: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          hero_image?: string | null
          id?: string
          intro_html?: string | null
          partner_id?: string | null
          region?: string | null
          slug: string
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          hero_image?: string | null
          id?: string
          intro_html?: string | null
          partner_id?: string | null
          region?: string | null
          slug?: string
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shows_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_campaigns: {
        Row: {
          age_rating: string | null
          algorithm_version: string
          allocation: Json
          approved_at: string | null
          approved_by: string | null
          available_dates: string[] | null
          config: Json
          created_at: string
          description: string | null
          ends_at: string
          entry_count: number
          form_link: string | null
          hashtags: Json | null
          id: string
          kopis_id: string | null
          last_draw_at: string | null
          one_line_intro: string | null
          partner_email: string | null
          partner_name: string | null
          partner_phone: string | null
          performance_id: string
          performance_period_end: string | null
          performance_period_start: string | null
          poster_image: string | null
          production_team: Json | null
          reward: string | null
          running_time: number | null
          sessions_per_week: number | null
          slug: string | null
          snapshot_seed: number | null
          sns_instagram: string | null
          sns_tiktok: string | null
          sns_youtube: string | null
          starts_at: string
          status: string
          still_images: Json | null
          ticket_allocations: Json | null
          ticket_purchase_url: string | null
          title: string
          updated_at: string
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          age_rating?: string | null
          algorithm_version?: string
          allocation?: Json
          approved_at?: string | null
          approved_by?: string | null
          available_dates?: string[] | null
          config?: Json
          created_at?: string
          description?: string | null
          ends_at: string
          entry_count?: number
          form_link?: string | null
          hashtags?: Json | null
          id?: string
          kopis_id?: string | null
          last_draw_at?: string | null
          one_line_intro?: string | null
          partner_email?: string | null
          partner_name?: string | null
          partner_phone?: string | null
          performance_id: string
          performance_period_end?: string | null
          performance_period_start?: string | null
          poster_image?: string | null
          production_team?: Json | null
          reward?: string | null
          running_time?: number | null
          sessions_per_week?: number | null
          slug?: string | null
          snapshot_seed?: number | null
          sns_instagram?: string | null
          sns_tiktok?: string | null
          sns_youtube?: string | null
          starts_at: string
          status?: string
          still_images?: Json | null
          ticket_allocations?: Json | null
          ticket_purchase_url?: string | null
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          age_rating?: string | null
          algorithm_version?: string
          allocation?: Json
          approved_at?: string | null
          approved_by?: string | null
          available_dates?: string[] | null
          config?: Json
          created_at?: string
          description?: string | null
          ends_at?: string
          entry_count?: number
          form_link?: string | null
          hashtags?: Json | null
          id?: string
          kopis_id?: string | null
          last_draw_at?: string | null
          one_line_intro?: string | null
          partner_email?: string | null
          partner_name?: string | null
          partner_phone?: string | null
          performance_id?: string
          performance_period_end?: string | null
          performance_period_start?: string | null
          poster_image?: string | null
          production_team?: Json | null
          reward?: string | null
          running_time?: number | null
          sessions_per_week?: number | null
          slug?: string | null
          snapshot_seed?: number | null
          sns_instagram?: string | null
          sns_tiktok?: string | null
          sns_youtube?: string | null
          starts_at?: string
          status?: string
          still_images?: Json | null
          ticket_allocations?: Json | null
          ticket_purchase_url?: string | null
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_campaigns_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_entries: {
        Row: {
          answers: Json | null
          applicant_email: string
          applicant_name: string
          applicant_phone: string | null
          attendance_status: string
          campaign_id: string
          checked_in_at: string | null
          consent_marketing: boolean
          id: string
          selected_at: string | null
          selection_status: string
          submitted_at: string
        }
        Insert: {
          answers?: Json | null
          applicant_email: string
          applicant_name: string
          applicant_phone?: string | null
          attendance_status?: string
          campaign_id: string
          checked_in_at?: string | null
          consent_marketing?: boolean
          id?: string
          selected_at?: string | null
          selection_status?: string
          submitted_at?: string
        }
        Update: {
          answers?: Json | null
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string | null
          attendance_status?: string
          campaign_id?: string
          checked_in_at?: string | null
          consent_marketing?: boolean
          id?: string
          selected_at?: string | null
          selection_status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_entries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ticket_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      user_penalties: {
        Row: {
          campaign_id: string | null
          created_at: string
          created_by: string | null
          entry_id: string | null
          expires_at: string
          id: string
          penalty_type: string
          points: number
          reason: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          entry_id?: string | null
          expires_at?: string
          id?: string
          penalty_type: string
          points?: number
          reason?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          entry_id?: string | null
          expires_at?: string
          id?: string
          penalty_type?: string
          points?: number
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_penalties_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "event_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_penalties_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_penalties_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_penalties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_restricted: boolean
          kakao_user_id: string
          restriction_reason: string | null
          restriction_until: string | null
          role: string
          trust_score: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_restricted?: boolean
          kakao_user_id: string
          restriction_reason?: string | null
          restriction_until?: string | null
          role: string
          trust_score?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_restricted?: boolean
          kakao_user_id?: string
          restriction_reason?: string | null
          restriction_until?: string | null
          role?: string
          trust_score?: number
        }
        Relationships: []
      }
    }
    Views: {
      active_penalties: {
        Row: {
          campaign_id: string | null
          campaign_title: string | null
          created_at: string | null
          created_by: string | null
          entry_id: string | null
          expires_at: string | null
          id: string | null
          penalty_type: string | null
          points: number | null
          reason: string | null
          trust_score: number | null
          user_email: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_penalties_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "event_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_penalties_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_penalties_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_penalties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      public_ticket_campaigns: {
        Row: {
          age_rating: string | null
          algorithm_version: string
          allocation: Json
          approved_at: string | null
          approved_by: string | null
          available_dates: string[] | null
          config: Json
          created_at: string
          description: string | null
          ends_at: string
          entry_count: number
          form_link: string | null
          hashtags: Json | null
          id: string
          kopis_id: string | null
          last_draw_at: string | null
          one_line_intro: string | null
          performance_id: string
          performance_period_end: string | null
          performance_period_start: string | null
          poster_image: string | null
          production_team: Json | null
          reward: string | null
          running_time: number | null
          sessions_per_week: number | null
          slug: string | null
          snapshot_seed: number | null
          sns_instagram: string | null
          sns_tiktok: string | null
          sns_youtube: string | null
          starts_at: string
          status: string
          still_images: Json | null
          ticket_allocations: Json | null
          ticket_purchase_url: string | null
          title: string
          updated_at: string
          venue_address: string | null
          venue_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      next_waitlist_promotions: {
        Args: { now: string }
        Returns: {
          campaign_id: string
          title: string
          user_id: string
        }[]
      }
      recalculate_trust_score: {
        Args: { target_user_id: string }
        Returns: number
      }
    }
    Enums: {
      campaign_entry_status:
        | "pending"
        | "eligible"
        | "duplicate"
        | "blacklisted"
        | "winner"
        | "waitlist"
        | "expired"
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
      campaign_entry_status: [
        "pending",
        "eligible",
        "duplicate",
        "blacklisted",
        "winner",
        "waitlist",
        "expired",
      ],
    },
  },
} as const

