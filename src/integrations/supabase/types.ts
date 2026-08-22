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
      admin_activity_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          org_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          org_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_applications: {
        Row: {
          admin_note: string | null
          bio: string | null
          city: string | null
          created_at: string
          email: string
          experience_years: number | null
          full_name: string
          id: string
          languages: string | null
          phone: string | null
          reason: string | null
          rera_number: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          specialization: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email: string
          experience_years?: number | null
          full_name: string
          id?: string
          languages?: string | null
          phone?: string | null
          reason?: string | null
          rera_number?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialization?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          languages?: string | null
          phone?: string | null
          reason?: string | null
          rera_number?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialization?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_clients: {
        Row: {
          agent_id: string
          branch_id: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          commission: number | null
          created_at: string
          deal_value: number | null
          id: string
          notes: string | null
          org_id: string | null
          property_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          branch_id?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          commission?: number | null
          created_at?: string
          deal_value?: number | null
          id?: string
          notes?: string | null
          org_id?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          branch_id?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          commission?: number | null
          created_at?: string
          deal_value?: number | null
          id?: string
          notes?: string | null
          org_id?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_clients_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "org_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_profiles: {
        Row: {
          agent_id: string
          areas_served: string[] | null
          certifications: string[] | null
          commission_earned: number | null
          created_at: string
          experience_years: number | null
          id: string
          languages: string | null
          properties_listed: number | null
          rating: number | null
          specialization: string | null
          total_revenue: number | null
          total_reviews: number | null
          total_sales: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          areas_served?: string[] | null
          certifications?: string[] | null
          commission_earned?: number | null
          created_at?: string
          experience_years?: number | null
          id?: string
          languages?: string | null
          properties_listed?: number | null
          rating?: number | null
          specialization?: string | null
          total_revenue?: number | null
          total_reviews?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          areas_served?: string[] | null
          certifications?: string[] | null
          commission_earned?: number | null
          created_at?: string
          experience_years?: number | null
          id?: string
          languages?: string | null
          properties_listed?: number | null
          rating?: number | null
          specialization?: string | null
          total_revenue?: number | null
          total_reviews?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_reviews: {
        Row: {
          agent_user_id: string
          created_at: string
          id: string
          rating: number
          review_text: string | null
          reviewer_name: string
          reviewer_user_id: string
        }
        Insert: {
          agent_user_id: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          reviewer_name: string
          reviewer_user_id: string
        }
        Update: {
          agent_user_id?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          reviewer_name?: string
          reviewer_user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_id: string
          author_name: string | null
          category: string
          content: string | null
          created_at: string
          cta_button_label: string | null
          cta_button_url: string | null
          cta_text: string | null
          cta_title: string | null
          excerpt: string | null
          faqs: Json
          featured_image_url: string | null
          featured_property_ids: string[]
          hindi_slug: string | null
          id: string
          key_takeaways: Json
          published_at: string | null
          read_time: number | null
          related_locality: string | null
          seo_description: string | null
          seo_title: string | null
          show_toc: boolean
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id: string
          author_name?: string | null
          category?: string
          content?: string | null
          created_at?: string
          cta_button_label?: string | null
          cta_button_url?: string | null
          cta_text?: string | null
          cta_title?: string | null
          excerpt?: string | null
          faqs?: Json
          featured_image_url?: string | null
          featured_property_ids?: string[]
          hindi_slug?: string | null
          id?: string
          key_takeaways?: Json
          published_at?: string | null
          read_time?: number | null
          related_locality?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_toc?: boolean
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string
          author_name?: string | null
          category?: string
          content?: string | null
          created_at?: string
          cta_button_label?: string | null
          cta_button_url?: string | null
          cta_text?: string | null
          cta_title?: string | null
          excerpt?: string | null
          faqs?: Json
          featured_image_url?: string | null
          featured_property_ids?: string[]
          hindi_slug?: string | null
          id?: string
          key_takeaways?: Json
          published_at?: string | null
          read_time?: number | null
          related_locality?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_toc?: boolean
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      buyer_shortlist_items: {
        Row: {
          added_at: string
          id: string
          notes: string | null
          property_id: string
          shortlist_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          notes?: string | null
          property_id: string
          shortlist_id: string
        }
        Update: {
          added_at?: string
          id?: string
          notes?: string | null
          property_id?: string
          shortlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_shortlist_items_shortlist_id_fkey"
            columns: ["shortlist_id"]
            isOneToOne: false
            referencedRelation: "buyer_shortlists"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_shortlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lead_tasks: {
        Row: {
          agent_id: string
          completed_at: string | null
          created_at: string
          due_at: string | null
          id: string
          lead_id: string
          notes: string | null
          org_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          org_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          org_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          agent_id: string | null
          branch_id: string | null
          budget: string | null
          commission: number | null
          created_at: string
          deal_value: number | null
          email: string | null
          expected_close_date: string | null
          full_name: string
          id: string
          notes: string | null
          org_id: string | null
          otp_verified: boolean | null
          phone: string
          property_id: string | null
          property_type: string | null
          stage: string
          stage_updated_at: string | null
          status: string
          updated_at: string
          user_id: string | null
          visit_date: string | null
        }
        Insert: {
          agent_id?: string | null
          branch_id?: string | null
          budget?: string | null
          commission?: number | null
          created_at?: string
          deal_value?: number | null
          email?: string | null
          expected_close_date?: string | null
          full_name: string
          id?: string
          notes?: string | null
          org_id?: string | null
          otp_verified?: boolean | null
          phone: string
          property_id?: string | null
          property_type?: string | null
          stage?: string
          stage_updated_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          visit_date?: string | null
        }
        Update: {
          agent_id?: string | null
          branch_id?: string | null
          budget?: string | null
          commission?: number | null
          created_at?: string
          deal_value?: number | null
          email?: string | null
          expected_close_date?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          org_id?: string | null
          otp_verified?: boolean | null
          phone?: string
          property_id?: string | null
          property_type?: string | null
          stage?: string
          stage_updated_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "org_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      new_projects: {
        Row: {
          amenities: string[] | null
          available_units: number | null
          builder: string
          city: string
          configs: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image: string | null
          images: string[] | null
          is_featured: boolean | null
          is_new: boolean | null
          locality: string
          max_price: number
          min_price: number
          name: string
          possession_date: string | null
          rating: number | null
          rera_id: string | null
          status: string
          total_units: number | null
          type: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          available_units?: number | null
          builder: string
          city: string
          configs?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          locality: string
          max_price?: number
          min_price?: number
          name: string
          possession_date?: string | null
          rating?: number | null
          rera_id?: string | null
          status?: string
          total_units?: number | null
          type?: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          available_units?: number | null
          builder?: string
          city?: string
          configs?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          locality?: string
          max_price?: number
          min_price?: number
          name?: string
          possession_date?: string | null
          rating?: number | null
          rera_id?: string | null
          status?: string
          total_units?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      org_branches: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          locality: string | null
          name: string
          org_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          locality?: string | null
          name: string
          org_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          locality?: string | null
          name?: string
          org_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_branches_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          branch_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          org_id: string
          role: Database["public"]["Enums"]["org_member_role"]
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          branch_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          org_id: string
          role?: Database["public"]["Enums"]["org_member_role"]
          status?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          branch_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_member_role"]
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_invites_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "org_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          invited_by: string | null
          is_active: boolean
          joined_at: string
          org_id: string
          role: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "org_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          gst_number: string | null
          id: string
          is_active: boolean
          is_verified: boolean
          logo_url: string | null
          name: string
          owner_id: string
          rera_id: string | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          logo_url?: string | null
          name: string
          owner_id: string
          rera_id?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string
          rera_id?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          bio: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_banned: boolean | null
          is_verified: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_banned?: boolean | null
          is_verified?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_banned?: boolean | null
          is_verified?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_listings: {
        Row: {
          address: string | null
          admin_note: string | null
          age_of_property: string | null
          amenities: string[] | null
          approval_authority: string | null
          area: number | null
          area_unit: string | null
          bathrooms: number | null
          bedrooms: number | null
          branch_id: string | null
          builder_name: string | null
          city: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          facing: string | null
          floor: number | null
          furnishing: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_new: boolean | null
          is_verified: boolean | null
          latitude: number | null
          listing_type: string
          locality: string
          longitude: number | null
          org_id: string | null
          parking: number | null
          price: number
          price_per_sqft: number | null
          price_unit: string | null
          property_attributes: Json | null
          property_type: string
          rera_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          society_name: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string
          total_floors: number | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          admin_note?: string | null
          age_of_property?: string | null
          amenities?: string[] | null
          approval_authority?: string | null
          area?: number | null
          area_unit?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          branch_id?: string | null
          builder_name?: string | null
          city: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          facing?: string | null
          floor?: number | null
          furnishing?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          listing_type: string
          locality: string
          longitude?: number | null
          org_id?: string | null
          parking?: number | null
          price: number
          price_per_sqft?: number | null
          price_unit?: string | null
          property_attributes?: Json | null
          property_type: string
          rera_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          society_name?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title: string
          total_floors?: number | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          admin_note?: string | null
          age_of_property?: string | null
          amenities?: string[] | null
          approval_authority?: string | null
          area?: number | null
          area_unit?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          branch_id?: string | null
          builder_name?: string | null
          city?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          facing?: string | null
          floor?: number | null
          furnishing?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          listing_type?: string
          locality?: string
          longitude?: number | null
          org_id?: string | null
          parking?: number | null
          price?: number
          price_per_sqft?: number | null
          price_unit?: string | null
          property_attributes?: Json | null
          property_type?: string
          rera_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          society_name?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string
          total_floors?: number | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_listings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "org_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_listings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_reviews: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean | null
          property_id: string
          rating: number
          review_text: string | null
          reviewer_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          property_id: string
          rating: number
          review_text?: string | null
          reviewer_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          property_id?: string
          rating?: number
          review_text?: string | null
          reviewer_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      property_update_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          listing_id: string
          proposed_changes: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          listing_id: string
          proposed_changes?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          proposed_changes?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_properties: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          alerts_enabled: boolean
          bedrooms: number | null
          city: string | null
          created_at: string
          id: string
          last_alerted_at: string | null
          listing_type: string | null
          locality: string | null
          max_price: number | null
          min_price: number | null
          name: string
          property_type: string | null
          user_id: string
        }
        Insert: {
          alerts_enabled?: boolean
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          id?: string
          last_alerted_at?: string | null
          listing_type?: string | null
          locality?: string | null
          max_price?: number | null
          min_price?: number | null
          name: string
          property_type?: string | null
          user_id: string
        }
        Update: {
          alerts_enabled?: boolean
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          id?: string
          last_alerted_at?: string | null
          listing_type?: string | null
          locality?: string | null
          max_price?: number | null
          min_price?: number | null
          name?: string
          property_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sponsorship_plans: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          duration_days: number
          features: string[] | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          sort_order: number | null
          stripe_price_id: string | null
          stripe_product_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          duration_days: number
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          duration_days?: number
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Relationships: []
      }
      sponsorships: {
        Row: {
          amount: number
          checkout_session_id: string | null
          created_at: string
          duration_days: number
          expires_at: string | null
          id: string
          listing_id: string
          org_id: string | null
          payment_id: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          plan_name: string
          starts_at: string | null
          status: Database["public"]["Enums"]["sponsorship_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          checkout_session_id?: string | null
          created_at?: string
          duration_days?: number
          expires_at?: string | null
          id?: string
          listing_id: string
          org_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          plan_name?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["sponsorship_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          checkout_session_id?: string | null
          created_at?: string
          duration_days?: number
          expires_at?: string | null
          id?: string
          listing_id?: string
          org_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          plan_name?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["sponsorship_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsorships_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsorships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      update_request_audit: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          id: string
          listing_id: string
          note: string | null
          request_id: string
          reviewer_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          id?: string
          listing_id: string
          note?: string | null
          request_id: string
          reviewer_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          id?: string
          listing_id?: string
          note?: string | null
          request_id?: string
          reviewer_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      market_trends: {
        Row: {
          avg_price_sqft: number | null
          city: string | null
          listing_count: number | null
          year: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_org_invite: { Args: { _token: string }; Returns: Json }
      admin_delete_user: { Args: { _target_user_id: string }; Returns: Json }
      allowed_property_attribute_keys: {
        Args: { _property_type: string }
        Returns: string[]
      }
      current_user_org_ids: { Args: never; Returns: string[] }
      filter_property_attributes: {
        Args: { _attrs: Json; _property_type: string }
        Returns: Json
      }
      has_org_role: {
        Args: {
          _org_id: string
          _roles: Database["public"]["Enums"]["org_member_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_residential_property_type: {
        Args: { _property_type: string }
        Returns: boolean
      }
      org_role_of: {
        Args: { _org_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["org_member_role"]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "agent" | "user"
      listing_status: "pending" | "approved" | "rejected" | "suspended"
      org_member_role: "owner" | "admin" | "manager" | "agent"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      sponsorship_status: "pending" | "active" | "expired" | "cancelled"
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
      app_role: ["admin", "moderator", "agent", "user"],
      listing_status: ["pending", "approved", "rejected", "suspended"],
      org_member_role: ["owner", "admin", "manager", "agent"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      sponsorship_status: ["pending", "active", "expired", "cancelled"],
    },
  },
} as const
