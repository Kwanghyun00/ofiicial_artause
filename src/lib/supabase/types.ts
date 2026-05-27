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
      audience_attendance: {
        Row: {
          attendance_status: string
          audience_id: string
          created_at: string
          id: string
          memo: string | null
          performance_id: string | null
          show_at: string
          source: string | null
          updated_at: string
        }
        Insert: {
          attendance_status: string
          audience_id: string
          created_at?: string
          id?: string
          memo?: string | null
          performance_id?: string | null
          show_at: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          attendance_status?: string
          audience_id?: string
          created_at?: string
          id?: string
          memo?: string | null
          performance_id?: string | null
          show_at?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audience_attendance_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
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
      bookmarks: {
        Row: {
          created_at: string
          id: string
          performance_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          performance_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          performance_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
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
            referencedRelation: "public_ticket_campaigns"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "public_ticket_campaigns"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "public_ticket_campaigns"
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
            referencedRelation: "public_ticket_campaigns"
            referencedColumns: ["id"]
          },
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
        Relationships: []
      }
      campaign_taste_tags: {
        Row: {
          auto_tagged: boolean
          campaign_id: string
          taste_tags: string[]
          updated_at: string
        }
        Insert: {
          auto_tagged?: boolean
          campaign_id: string
          taste_tags?: string[]
          updated_at?: string
        }
        Update: {
          auto_tagged?: boolean
          campaign_id?: string
          taste_tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_taste_tags_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "public_ticket_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_taste_tags_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "ticket_campaigns"
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
            referencedRelation: "public_ticket_campaigns"
            referencedColumns: ["id"]
          },
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
          is_published: boolean
          organization_id: string | null
          performance_id: string | null
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
          is_published?: boolean
          organization_id?: string | null
          performance_id?: string | null
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
          is_published?: boolean
          organization_id?: string | null
          performance_id?: string | null
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
          {
            foreignKeyName: "community_posts_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          campaign_id: string | null
          created_at: string
          description: string | null
          entry_id: string | null
          id: string
          partner_email: string
          payment_ref: string | null
          type: string
        }
        Insert: {
          amount: number
          balance_after: number
          campaign_id?: string | null
          created_at?: string
          description?: string | null
          entry_id?: string | null
          id?: string
          partner_email: string
          payment_ref?: string | null
          type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          campaign_id?: string | null
          created_at?: string
          description?: string | null
          entry_id?: string | null
          id?: string
          partner_email?: string
          payment_ref?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "public_ticket_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ticket_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "ticket_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_reports: {
        Row: {
          attendance_photo_url: string | null
          attended: boolean
          campaign_id: string
          created_at: string
          days_to_submit: number | null
          entry_id: string
          experience_date: string | null
          genre_tags: string[] | null
          hashtags_used: string[] | null
          id: string
          performance_id: string | null
          rating_accessibility: number | null
          rating_overall: number | null
          rating_performance: number | null
          rating_production: number | null
          rating_value: number | null
          rejection_reason: string | null
          review_text: string | null
          submitted_content: Json
          submitter_email: string
          submitter_name: string
          updated_at: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          attendance_photo_url?: string | null
          attended?: boolean
          campaign_id: string
          created_at?: string
          days_to_submit?: number | null
          entry_id: string
          experience_date?: string | null
          genre_tags?: string[] | null
          hashtags_used?: string[] | null
          id?: string
          performance_id?: string | null
          rating_accessibility?: number | null
          rating_overall?: number | null
          rating_performance?: number | null
          rating_production?: number | null
          rating_value?: number | null
          rejection_reason?: string | null
          review_text?: string | null
          submitted_content?: Json
          submitter_email: string
          submitter_name: string
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          attendance_photo_url?: string | null
          attended?: boolean
          campaign_id?: string
          created_at?: string
          days_to_submit?: number | null
          entry_id?: string
          experience_date?: string | null
          genre_tags?: string[] | null
          hashtags_used?: string[] | null
          id?: string
          performance_id?: string | null
          rating_accessibility?: number | null
          rating_overall?: number | null
          rating_performance?: number | null
          rating_production?: number | null
          rating_value?: number | null
          rejection_reason?: string | null
          review_text?: string | null
          submitted_content?: Json
          submitter_email?: string
          submitter_name?: string
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_reports_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "public_ticket_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_reports_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ticket_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_reports_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: true
            referencedRelation: "ticket_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_reports_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
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
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      partner_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          partner_email: string
          total_charged: number
          total_used: number
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          partner_email: string
          total_charged?: number
          total_used?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          partner_email?: string
          total_charged?: number
          total_used?: number
          updated_at?: string
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
          age_limit: string | null
          cast_info: string | null
          category: string | null
          created_at: string
          crew_info: string | null
          description: string | null
          detail_images: Json | null
          hero_headline: string | null
          hero_subtitle: string | null
          id: string
          is_featured: boolean
          kopis_facility_id: string | null
          kopis_id: string | null
          kopis_sections: Json | null
          last_synced_at: string | null
          openrun: string | null
          organization: string | null
          organization_id: string | null
          period_end: string | null
          period_start: string | null
          poster_url: string | null
          price_info: string | null
          region: string | null
          runtime_text: string | null
          schedule_info: string | null
          slug: string
          source: string
          state: string | null
          status: string
          sync_status: string | null
          synopsis: string | null
          tags: string[] | null
          tasks: string[] | null
          ticket_link: string | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          age_limit?: string | null
          cast_info?: string | null
          category?: string | null
          created_at?: string
          crew_info?: string | null
          description?: string | null
          detail_images?: Json | null
          hero_headline?: string | null
          hero_subtitle?: string | null
          id?: string
          is_featured?: boolean
          kopis_facility_id?: string | null
          kopis_id?: string | null
          kopis_sections?: Json | null
          last_synced_at?: string | null
          openrun?: string | null
          organization?: string | null
          organization_id?: string | null
          period_end?: string | null
          period_start?: string | null
          poster_url?: string | null
          price_info?: string | null
          region?: string | null
          runtime_text?: string | null
          schedule_info?: string | null
          slug: string
          source?: string
          state?: string | null
          status?: string
          sync_status?: string | null
          synopsis?: string | null
          tags?: string[] | null
          tasks?: string[] | null
          ticket_link?: string | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          age_limit?: string | null
          cast_info?: string | null
          category?: string | null
          created_at?: string
          crew_info?: string | null
          description?: string | null
          detail_images?: Json | null
          hero_headline?: string | null
          hero_subtitle?: string | null
          id?: string
          is_featured?: boolean
          kopis_facility_id?: string | null
          kopis_id?: string | null
          kopis_sections?: Json | null
          last_synced_at?: string | null
          openrun?: string | null
          organization?: string | null
          organization_id?: string | null
          period_end?: string | null
          period_start?: string | null
          poster_url?: string | null
          price_info?: string | null
          region?: string | null
          runtime_text?: string | null
          schedule_info?: string | null
          slug?: string
          source?: string
          state?: string | null
          status?: string
          sync_status?: string | null
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
      research_config: {
        Row: {
          key: string
          note: string | null
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          note?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          note?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      review_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          performance_id: string | null
          review_id: string | null
          user_identifier: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          performance_id?: string | null
          review_id?: string | null
          user_identifier: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          performance_id?: string | null
          review_id?: string | null
          user_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_events_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_events_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_email: string
          author_name: string
          created_at: string
          helpful_count: number
          id: string
          performance_id: string
          rating_acting: number | null
          rating_direction: number | null
          rating_immersion: number | null
          rating_overall: number
          report_count: number
          reservation_id: string | null
          review_headline: string | null
          review_text: string | null
          spoiler_flag: boolean
          status: string
          tags: string[] | null
          updated_at: string
          verified_attendance: boolean
        }
        Insert: {
          author_email: string
          author_name: string
          created_at?: string
          helpful_count?: number
          id?: string
          performance_id: string
          rating_acting?: number | null
          rating_direction?: number | null
          rating_immersion?: number | null
          rating_overall: number
          report_count?: number
          reservation_id?: string | null
          review_headline?: string | null
          review_text?: string | null
          spoiler_flag?: boolean
          status?: string
          tags?: string[] | null
          updated_at?: string
          verified_attendance?: boolean
        }
        Update: {
          author_email?: string
          author_name?: string
          created_at?: string
          helpful_count?: number
          id?: string
          performance_id?: string
          rating_acting?: number | null
          rating_direction?: number | null
          rating_immersion?: number | null
          rating_overall?: number
          report_count?: number
          reservation_id?: string | null
          review_headline?: string | null
          review_text?: string | null
          spoiler_flag?: boolean
          status?: string
          tags?: string[] | null
          updated_at?: string
          verified_attendance?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "ticket_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      show_sessions: {
        Row: {
          capacity: number | null
          created_at: string
          id: string
          performance_id: string
          session_date: string
          start_time: string | null
          venue_name: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          id?: string
          performance_id: string
          session_date: string
          start_time?: string | null
          venue_name?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          id?: string
          performance_id?: string
          session_date?: string
          start_time?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "show_sessions_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          },
        ]
      }
      sns_picks: {
        Row: {
          id: string
          performance_id: string
          caption: string | null
          channel: string
          display_order: number
          promo_start: string | null
          promo_end: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          performance_id: string
          caption?: string | null
          channel?: string
          display_order?: number
          promo_start?: string | null
          promo_end?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          performance_id?: string
          caption?: string | null
          channel?: string
          display_order?: number
          promo_start?: string | null
          promo_end?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sns_picks_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
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
          billing_enabled: boolean
          config: Json
          cost_per_slot: number
          created_at: string
          description: string | null
          ends_at: string
          entry_count: number
          experience_dates: Json | null
          experience_type: string | null
          form_link: string | null
          hashtags: Json | null
          id: string
          kopis_id: string | null
          last_draw_at: string | null
          min_follower_criteria: Json | null
          one_line_intro: string | null
          partner_email: string | null
          partner_name: string | null
          partner_phone: string | null
          performance_id: string
          performance_period_end: string | null
          performance_period_start: string | null
          poster_image: string | null
          production_team: Json | null
          recruit_count: number
          recruit_phase: string
          rejection_reason: string | null
          required_review_platforms: string[]
          review_deadline_days: number
          reward: string | null
          running_time: number | null
          selection_criteria_text: string | null
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
          total_slots_billed: number
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
          billing_enabled?: boolean
          config?: Json
          cost_per_slot?: number
          created_at?: string
          description?: string | null
          ends_at: string
          entry_count?: number
          experience_dates?: Json | null
          experience_type?: string | null
          form_link?: string | null
          hashtags?: Json | null
          id?: string
          kopis_id?: string | null
          last_draw_at?: string | null
          min_follower_criteria?: Json | null
          one_line_intro?: string | null
          partner_email?: string | null
          partner_name?: string | null
          partner_phone?: string | null
          performance_id: string
          performance_period_end?: string | null
          performance_period_start?: string | null
          poster_image?: string | null
          production_team?: Json | null
          recruit_count?: number
          recruit_phase?: string
          rejection_reason?: string | null
          required_review_platforms?: string[]
          review_deadline_days?: number
          reward?: string | null
          running_time?: number | null
          selection_criteria_text?: string | null
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
          total_slots_billed?: number
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
          billing_enabled?: boolean
          config?: Json
          cost_per_slot?: number
          created_at?: string
          description?: string | null
          ends_at?: string
          entry_count?: number
          experience_dates?: Json | null
          experience_type?: string | null
          form_link?: string | null
          hashtags?: Json | null
          id?: string
          kopis_id?: string | null
          last_draw_at?: string | null
          min_follower_criteria?: Json | null
          one_line_intro?: string | null
          partner_email?: string | null
          partner_name?: string | null
          partner_phone?: string | null
          performance_id?: string
          performance_period_end?: string | null
          performance_period_start?: string | null
          poster_image?: string | null
          production_team?: Json | null
          recruit_count?: number
          recruit_phase?: string
          rejection_reason?: string | null
          required_review_platforms?: string[]
          review_deadline_days?: number
          reward?: string | null
          running_time?: number | null
          selection_criteria_text?: string | null
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
          total_slots_billed?: number
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
          available_experience_dates: string[] | null
          campaign_id: string
          checked_in_at: string | null
          confirm_token: string | null
          confirm_token_exp: string | null
          confirmed_at: string | null
          confirmed_date: string | null
          confirmed_time: string | null
          consent_marketing: boolean
          content_type_preference: string[] | null
          declined_at: string | null
          id: string
          motivation_text: string | null
          partner_review_notes: string | null
          past_experience_text: string | null
          qr_token: string | null
          review_sample_url: string | null
          review_submitted: boolean
          review_submitted_at: string | null
          selected_at: string | null
          selection_status: string
          slot_cost: number | null
          sns_blog_monthly_visitors: number | null
          sns_blog_url: string | null
          sns_instagram_followers: number | null
          sns_instagram_handle: string | null
          sns_power_score: number
          sns_tier: string
          sns_tiktok_followers: number | null
          sns_tiktok_handle: string | null
          sns_verified_at: string | null
          sns_verified_by: string | null
          sns_youtube_subscribers: number | null
          sns_youtube_url: string | null
          submitted_at: string
        }
        Insert: {
          answers?: Json | null
          applicant_email: string
          applicant_name: string
          applicant_phone?: string | null
          attendance_status?: string
          available_experience_dates?: string[] | null
          campaign_id: string
          checked_in_at?: string | null
          confirm_token?: string | null
          confirm_token_exp?: string | null
          confirmed_at?: string | null
          confirmed_date?: string | null
          confirmed_time?: string | null
          consent_marketing?: boolean
          content_type_preference?: string[] | null
          declined_at?: string | null
          id?: string
          motivation_text?: string | null
          partner_review_notes?: string | null
          past_experience_text?: string | null
          qr_token?: string | null
          review_sample_url?: string | null
          review_submitted?: boolean
          review_submitted_at?: string | null
          selected_at?: string | null
          selection_status?: string
          slot_cost?: number | null
          sns_blog_monthly_visitors?: number | null
          sns_blog_url?: string | null
          sns_instagram_followers?: number | null
          sns_instagram_handle?: string | null
          sns_power_score?: number
          sns_tier?: string
          sns_tiktok_followers?: number | null
          sns_tiktok_handle?: string | null
          sns_verified_at?: string | null
          sns_verified_by?: string | null
          sns_youtube_subscribers?: number | null
          sns_youtube_url?: string | null
          submitted_at?: string
        }
        Update: {
          answers?: Json | null
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string | null
          attendance_status?: string
          available_experience_dates?: string[] | null
          campaign_id?: string
          checked_in_at?: string | null
          confirm_token?: string | null
          confirm_token_exp?: string | null
          confirmed_at?: string | null
          confirmed_date?: string | null
          confirmed_time?: string | null
          consent_marketing?: boolean
          content_type_preference?: string[] | null
          declined_at?: string | null
          id?: string
          motivation_text?: string | null
          partner_review_notes?: string | null
          past_experience_text?: string | null
          qr_token?: string | null
          review_sample_url?: string | null
          review_submitted?: boolean
          review_submitted_at?: string | null
          selected_at?: string | null
          selection_status?: string
          slot_cost?: number | null
          sns_blog_monthly_visitors?: number | null
          sns_blog_url?: string | null
          sns_instagram_followers?: number | null
          sns_instagram_handle?: string | null
          sns_power_score?: number
          sns_tier?: string
          sns_tiktok_followers?: number | null
          sns_tiktok_handle?: string | null
          sns_verified_at?: string | null
          sns_verified_by?: string | null
          sns_youtube_subscribers?: number | null
          sns_youtube_url?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_entries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "public_ticket_campaigns"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "public_ticket_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_penalties_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ticket_campaigns"
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
            foreignKeyName: "user_penalties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          audience_type: string | null
          companion_type: string | null
          created_at: string
          discovery_channel: string | null
          id: string
          onboarding_done: boolean
          persona: string | null
          profile_done: boolean
          taste_tags: string[]
          updated_at: string
          user_id: string
          visit_frequency: string | null
        }
        Insert: {
          audience_type?: string | null
          companion_type?: string | null
          created_at?: string
          discovery_channel?: string | null
          id?: string
          onboarding_done?: boolean
          persona?: string | null
          profile_done?: boolean
          taste_tags?: string[]
          updated_at?: string
          user_id: string
          visit_frequency?: string | null
        }
        Update: {
          audience_type?: string | null
          companion_type?: string | null
          created_at?: string
          discovery_channel?: string | null
          id?: string
          onboarding_done?: boolean
          persona?: string | null
          profile_done?: boolean
          taste_tags?: string[]
          updated_at?: string
          user_id?: string
          visit_frequency?: string | null
        }
        Relationships: []
      }
      user_taste_signals: {
        Row: {
          campaign_id: string | null
          created_at: string
          id: string
          signal_type: string
          taste_tags: string[]
          user_id: string
          weight: number
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          signal_type: string
          taste_tags?: string[]
          user_id: string
          weight?: number
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          signal_type?: string
          taste_tags?: string[]
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_taste_signals_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "public_ticket_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_taste_signals_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ticket_campaigns"
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
      public_ticket_campaigns: {
        Row: {
          age_rating: string | null
          allocation: Json | null
          available_dates: string[] | null
          created_at: string | null
          description: string | null
          ends_at: string | null
          entry_count: number | null
          form_link: string | null
          hashtags: Json | null
          id: string | null
          kopis_id: string | null
          last_draw_at: string | null
          one_line_intro: string | null
          performance_id: string | null
          performance_period_end: string | null
          performance_period_start: string | null
          poster_image: string | null
          production_team: Json | null
          reward: string | null
          running_time: number | null
          sessions_per_week: number | null
          slug: string | null
          sns_instagram: string | null
          sns_tiktok: string | null
          sns_youtube: string | null
          starts_at: string | null
          status: string | null
          still_images: Json | null
          ticket_allocations: Json | null
          ticket_purchase_url: string | null
          title: string | null
          updated_at: string | null
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          age_rating?: string | null
          allocation?: Json | null
          available_dates?: string[] | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          entry_count?: number | null
          form_link?: string | null
          hashtags?: Json | null
          id?: string | null
          kopis_id?: string | null
          last_draw_at?: string | null
          one_line_intro?: string | null
          performance_id?: string | null
          performance_period_end?: string | null
          performance_period_start?: string | null
          poster_image?: string | null
          production_team?: Json | null
          reward?: string | null
          running_time?: number | null
          sessions_per_week?: number | null
          slug?: string | null
          sns_instagram?: string | null
          sns_tiktok?: string | null
          sns_youtube?: string | null
          starts_at?: string | null
          status?: string | null
          still_images?: Json | null
          ticket_allocations?: Json | null
          ticket_purchase_url?: string | null
          title?: string | null
          updated_at?: string | null
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          age_rating?: string | null
          allocation?: Json | null
          available_dates?: string[] | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          entry_count?: number | null
          form_link?: string | null
          hashtags?: Json | null
          id?: string | null
          kopis_id?: string | null
          last_draw_at?: string | null
          one_line_intro?: string | null
          performance_id?: string | null
          performance_period_end?: string | null
          performance_period_start?: string | null
          poster_image?: string | null
          production_team?: Json | null
          reward?: string | null
          running_time?: number | null
          sessions_per_week?: number | null
          slug?: string | null
          sns_instagram?: string | null
          sns_tiktok?: string | null
          sns_youtube?: string | null
          starts_at?: string | null
          status?: string | null
          still_images?: Json | null
          ticket_allocations?: Json | null
          ticket_purchase_url?: string | null
          title?: string | null
          updated_at?: string | null
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
    }
    Functions: {
      get_research_config: { Args: { p_key: string }; Returns: string }
      increment_review_helpful: {
        Args: { review_id: string }
        Returns: undefined
      }
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
