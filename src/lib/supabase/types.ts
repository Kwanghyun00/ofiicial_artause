export type PerformanceStatus = "draft" | "scheduled" | "ongoing" | "completed";

export type PromotionRequestStatus = "new" | "in_review" | "approved" | "rejected" | "completed";
export type PromotionInquiryType = "invitation" | "promotion";

export type FollowerType = "audience" | "creator";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          slug: string;
          name: string;
          tagline: string | null;
          description: string | null;
          genre_focus: string[] | null;
          region: string | null;
          cover_image_url: string | null;
          logo_url: string | null;
          website: string | null;
          instagram: string | null;
          youtube: string | null;
          follower_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          tagline?: string | null;
          description?: string | null;
          genre_focus?: string[] | null;
          region?: string | null;
          cover_image_url?: string | null;
          logo_url?: string | null;
          website?: string | null;
          instagram?: string | null;
          youtube?: string | null;
          follower_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          tagline?: string | null;
          description?: string | null;
          genre_focus?: string[] | null;
          region?: string | null;
          cover_image_url?: string | null;
          logo_url?: string | null;
          website?: string | null;
          instagram?: string | null;
          youtube?: string | null;
          follower_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      community_posts: {
        Row: {
          id: string;
          organization_id: string | null;
          slug: string;
          title: string;
          excerpt: string | null;
          body: string | null;
          cover_image_url: string | null;
          tags: string[] | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          slug: string;
          title: string;
          excerpt?: string | null;
          body?: string | null;
          cover_image_url?: string | null;
          tags?: string[] | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          organization_id?: string | null;
          slug?: string;
          title?: string;
          excerpt?: string | null;
          body?: string | null;
          cover_image_url?: string | null;
          tags?: string[] | null;
          published_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "community_posts_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      organization_followers: {
        Row: {
          id: string;
          organization_id: string;
          follower_email: string | null;
          follower_name: string | null;
          follower_type: FollowerType;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          follower_email?: string | null;
          follower_name?: string | null;
          follower_type?: FollowerType;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "organization_followers_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      performances: {
        Row: {
          id: string;
          slug: string;
          title: string;
          status: PerformanceStatus;
          category: string | null;
          region: string | null;
          organization: string | null;
          organization_id: string | null;
          period_start: string | null;
          period_end: string | null;
          venue: string | null;
          synopsis: string | null;
          tasks: string[] | null;
          poster_url: string | null;
          hero_headline: string | null;
          hero_subtitle: string | null;
          ticket_link: string | null;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          status?: PerformanceStatus;
          category?: string | null;
          region?: string | null;
          organization?: string | null;
          organization_id?: string | null;
          period_start?: string | null;
          period_end?: string | null;
          venue?: string | null;
          synopsis?: string | null;
          tasks?: string[] | null;
          poster_url?: string | null;
          hero_headline?: string | null;
          hero_subtitle?: string | null;
          ticket_link?: string | null;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          status?: PerformanceStatus;
          category?: string | null;
          region?: string | null;
          organization?: string | null;
          organization_id?: string | null;
          period_start?: string | null;
          period_end?: string | null;
          venue?: string | null;
          synopsis?: string | null;
          tasks?: string[] | null;
          poster_url?: string | null;
          hero_headline?: string | null;
          hero_subtitle?: string | null;
          ticket_link?: string | null;
          is_featured?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "performances_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      performance_submissions: {
        Row: {
          id: string;
          status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'published';
          submission_type: 'listing' | 'full_service';
          organization_name: string;
          organization_slug: string | null;
          organization_website: string | null;
          contact_name: string;
          contact_email: string;
          contact_phone: string | null;
          performance_title: string;
          performance_slug: string | null;
          performance_category: string | null;
          performance_region: string | null;
          performance_tags: string[] | null;
          period_start: string | null;
          period_end: string | null;
          venue: string | null;
          synopsis: string | null;
          assets_url: string | null;
          additional_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          status?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'published';
          submission_type?: 'listing' | 'full_service';
          organization_name: string;
          organization_slug?: string | null;
          organization_website?: string | null;
          contact_name: string;
          contact_email: string;
          contact_phone?: string | null;
          performance_title: string;
          performance_slug?: string | null;
          performance_category?: string | null;
          performance_region?: string | null;
          performance_tags?: string[] | null;
          period_start?: string | null;
          period_end?: string | null;
          venue?: string | null;
          synopsis?: string | null;
          assets_url?: string | null;
          additional_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'published';
          submission_type?: 'listing' | 'full_service';
          organization_name?: string;
          organization_slug?: string | null;
          organization_website?: string | null;
          contact_name?: string;
          contact_email?: string;
          contact_phone?: string | null;
          performance_title?: string;
          performance_slug?: string | null;
          performance_category?: string | null;
          performance_region?: string | null;
          performance_tags?: string[] | null;
          period_start?: string | null;
          period_end?: string | null;
          venue?: string | null;
          synopsis?: string | null;
          assets_url?: string | null;
          additional_notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };      promotion_requests: {
        Row: {
          id: string;
          status: PromotionRequestStatus;
          inquiry_type: PromotionInquiryType;
          organization_name: string;
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          performance_title: string;
          performance_category: string | null;
          performance_region: string | null;
          performance_dates: string | null;
          performance_venue: string | null;
          performance_synopsis: string | null;
          marketing_goals: string | null;
          marketing_channels: string[] | null;
          assets_url: string | null;
          additional_notes: string | null;
          submitted_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          status?: PromotionRequestStatus;
          inquiry_type?: PromotionInquiryType;
          organization_name: string;
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          performance_title: string;
          performance_category?: string | null;
          performance_region?: string | null;
          performance_dates?: string | null;
          performance_venue?: string | null;
          performance_synopsis?: string | null;
          marketing_goals?: string | null;
          marketing_channels?: string[] | null;
          assets_url?: string | null;
          additional_notes?: string | null;
          submitted_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: PromotionRequestStatus;
          inquiry_type?: PromotionInquiryType;
          performance_category?: string | null;
          performance_region?: string | null;
          performance_dates?: string | null;
          performance_venue?: string | null;
          performance_synopsis?: string | null;
          marketing_goals?: string | null;
          marketing_channels?: string[] | null;
          assets_url?: string | null;
          additional_notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      ticket_campaigns: {
        Row: {
          id: string;
          performance_id: string;
          title: string;
          description: string | null;
          reward: string | null;
          starts_at: string;
          ends_at: string;
          form_link: string | null;
          created_at: string;
          updated_at: string;
          slug: string | null;
          status: "draft" | "scheduled" | "active" | "closed" | "pending_approval" | "approved" | "rejected";
          allocation: Record<string, unknown>;
          algorithm_version: string;
          config: Record<string, unknown>;
          snapshot_seed: number | null;
          last_draw_at: string | null;
          ticket_purchase_url: string | null;
          partner_name: string | null;
          partner_email: string | null;
          partner_phone: string | null;
          approved_at: string | null;
          approved_by: string | null;
          available_dates: string[] | null;
          performance_period_start: string | null;
          performance_period_end: string | null;
        };
        Insert: {
          id?: string;
          performance_id: string;
          title: string;
          description?: string | null;
          reward?: string | null;
          starts_at: string;
          ends_at: string;
          form_link?: string | null;
          created_at?: string;
          updated_at?: string;
          slug?: string | null;
          status?: "draft" | "scheduled" | "active" | "closed" | "pending_approval" | "approved" | "rejected";
          allocation?: Record<string, unknown>;
          algorithm_version?: string;
          config?: Record<string, unknown>;
          snapshot_seed?: number | null;
          last_draw_at?: string | null;
          ticket_purchase_url?: string | null;
          partner_name?: string | null;
          partner_email?: string | null;
          partner_phone?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          reward?: string | null;
          starts_at?: string;
          ends_at?: string;
          form_link?: string | null;
          updated_at?: string;
          slug?: string | null;
          status?: "draft" | "scheduled" | "active" | "closed" | "pending_approval" | "approved" | "rejected";
          allocation?: Record<string, unknown>;
          algorithm_version?: string;
          config?: Record<string, unknown>;
          snapshot_seed?: number | null;
          last_draw_at?: string | null;
          ticket_purchase_url?: string | null;
          partner_name?: string | null;
          partner_email?: string | null;
          partner_phone?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ticket_campaigns_performance_id_fkey";
            columns: ["performance_id"];
            referencedRelation: "performances";
            referencedColumns: ["id"];
          }
        ];
      };
      ticket_entries: {
        Row: {
          id: string;
          campaign_id: string;
          applicant_name: string;
          applicant_email: string;
          applicant_phone: string | null;
          answers: Record<string, unknown> | null;
          consent_marketing: boolean;
          submitted_at: string;
          selection_status: "pending" | "selected" | "rejected";
          attendance_status: "pending" | "checked_in" | "no_show";
          selected_at: string | null;
          checked_in_at: string | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          applicant_name: string;
          applicant_email: string;
          applicant_phone?: string | null;
          answers?: Record<string, unknown> | null;
          consent_marketing?: boolean;
          submitted_at?: string;
          selection_status?: "pending" | "selected" | "rejected";
          attendance_status?: "pending" | "checked_in" | "no_show";
          selected_at?: string | null;
          checked_in_at?: string | null;
        };
        Update: {
          applicant_name?: string;
          applicant_email?: string;
          applicant_phone?: string | null;
          answers?: Record<string, unknown> | null;
          consent_marketing?: boolean;
          selection_status?: "pending" | "selected" | "rejected";
          attendance_status?: "pending" | "checked_in" | "no_show";
          selected_at?: string | null;
          checked_in_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ticket_entries_campaign_id_fkey";
            columns: ["campaign_id"];
            referencedRelation: "ticket_campaigns";
            referencedColumns: ["id"];
          }
        ];
      };
      campaign_participants: {
        Row: {
          id: string;
          campaign_id: string;
          external_user_id: string;
          hashed_contact: string;
          nickname: string | null;
          consent_marketing: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          external_user_id: string;
          hashed_contact: string;
          nickname?: string | null;
          consent_marketing?: boolean;
          created_at?: string;
        };
        Update: {
          hashed_contact?: string;
          nickname?: string | null;
          consent_marketing?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_participants_campaign_id_fkey";
            columns: ["campaign_id"];
            referencedRelation: "ticket_campaigns";
            referencedColumns: ["id"];
          }
        ];
      };
      campaign_ad_watch_verifications: {
        Row: {
          id: string;
          campaign_id: string;
          participant_id: string;
          ad_session_id: string;
          watched_ratio: number;
          focus_lost: boolean;
          muted: boolean;
          completed_at: string | null;
          verification_payload: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          participant_id: string;
          ad_session_id: string;
          watched_ratio: number;
          focus_lost?: boolean;
          muted?: boolean;
          completed_at?: string | null;
          verification_payload: Record<string, unknown>;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "campaign_ad_watch_verifications_campaign_id_fkey";
            columns: ["campaign_id"];
            referencedRelation: "ticket_campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_ad_watch_verifications_participant_id_fkey";
            columns: ["participant_id"];
            referencedRelation: "campaign_participants";
            referencedColumns: ["id"];
          }
        ];
      };
      campaign_blacklist: {
        Row: {
          id: string;
          external_user_id: string;
          reason: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          external_user_id: string;
          reason?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          reason?: string | null;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      campaign_entries: {
        Row: {
          id: string;
          campaign_id: string;
          participant_id: string;
          ad_verification_id: string | null;
          status: "pending" | "eligible" | "duplicate" | "blacklisted" | "winner" | "waitlist" | "expired";
          reason: string | null;
          weight: number;
          novelty_factor: number;
          referral_factor: number;
          duplicate_group: string | null;
          random_seed: number;
          fingerprint: Record<string, unknown> | null;
          extra: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          participant_id: string;
          ad_verification_id?: string | null;
          status?: "pending" | "eligible" | "duplicate" | "blacklisted" | "winner" | "waitlist" | "expired";
          reason?: string | null;
          weight?: number;
          novelty_factor?: number;
          referral_factor?: number;
          duplicate_group?: string | null;
          random_seed: number;
          fingerprint?: Record<string, unknown> | null;
          extra?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "eligible" | "duplicate" | "blacklisted" | "winner" | "waitlist" | "expired";
          reason?: string | null;
          weight?: number;
          novelty_factor?: number;
          referral_factor?: number;
          duplicate_group?: string | null;
          fingerprint?: Record<string, unknown> | null;
          extra?: Record<string, unknown> | null;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_entries_campaign_id_fkey";
            columns: ["campaign_id"];
            referencedRelation: "ticket_campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_entries_participant_id_fkey";
            columns: ["participant_id"];
            referencedRelation: "campaign_participants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_entries_ad_verification_id_fkey";
            columns: ["ad_verification_id"];
            referencedRelation: "campaign_ad_watch_verifications";
            referencedColumns: ["id"];
          }
        ];
      };
      campaign_draws: {
        Row: {
          id: string;
          campaign_id: string;
          algorithm_version: string;
          seed: number;
          executed_by: string | null;
          run_at: string;
          config: Record<string, unknown>;
          winners: Record<string, unknown>;
          waitlist: Record<string, unknown>;
          duration_ms: number;
          log_id: number | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          algorithm_version: string;
          seed: number;
          executed_by?: string | null;
          run_at?: string;
          config: Record<string, unknown>;
          winners: Record<string, unknown>;
          waitlist: Record<string, unknown>;
          duration_ms: number;
          log_id?: number | null;
        };
        Update: {
          run_at?: string;
          duration_ms?: number;
          log_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_draws_campaign_id_fkey";
            columns: ["campaign_id"];
            referencedRelation: "ticket_campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_draws_log_id_fkey";
            columns: ["log_id"];
            referencedRelation: "audit_logs";
            referencedColumns: ["id"];
          }
        ];
      };
      campaign_winner_responses: {
        Row: {
          id: string;
          draw_id: string;
          participant_id: string;
          status: "pending" | "accepted" | "declined" | "timeout";
          deadline: string;
          responded_at: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          draw_id: string;
          participant_id: string;
          status?: "pending" | "accepted" | "declined" | "timeout";
          deadline: string;
          responded_at?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          status?: "pending" | "accepted" | "declined" | "timeout";
          responded_at?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_winner_responses_draw_id_fkey";
            columns: ["draw_id"];
            referencedRelation: "campaign_draws";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_winner_responses_participant_id_fkey";
            columns: ["participant_id"];
            referencedRelation: "campaign_participants";
            referencedColumns: ["id"];
          }
        ];
      };
      campaign_waitlist_promotions: {
        Row: {
          id: string;
          campaign_id: string;
          participant_id: string;
          promoted_from: number;
          promoted_to: number;
          run_at: string;
          trigger: string;
          log_id: number | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          participant_id: string;
          promoted_from: number;
          promoted_to: number;
          run_at?: string;
          trigger: string;
          log_id?: number | null;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "campaign_waitlist_promotions_campaign_id_fkey";
            columns: ["campaign_id"];
            referencedRelation: "ticket_campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_waitlist_promotions_participant_id_fkey";
            columns: ["participant_id"];
            referencedRelation: "campaign_participants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_waitlist_promotions_log_id_fkey";
            columns: ["log_id"];
            referencedRelation: "audit_logs";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, never>;
        Relationships: never[];
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string;
    };
  };
}
