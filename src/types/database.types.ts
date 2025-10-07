export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          full_name: string
          email: string
          phone: string | null
          date_of_birth: string | null
          nationality: string | null
          passport_number: string | null
          avatar_url: string | null
          bio: string | null
          languages: string[] | null
          emergency_sharing: boolean
          location_sharing: boolean
          profile_visibility: 'private' | 'verified_users' | 'public'
          safety_score: number
          is_verified: boolean
          verification_level: 'basic' | 'verified' | 'premium'
          last_seen_at: string | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name: string
          email: string
          phone?: string | null
          date_of_birth?: string | null
          nationality?: string | null
          passport_number?: string | null
          avatar_url?: string | null
          bio?: string | null
          languages?: string[] | null
          emergency_sharing?: boolean
          location_sharing?: boolean
          profile_visibility?: 'private' | 'verified_users' | 'public'
          safety_score?: number
          is_verified?: boolean
          verification_level?: 'basic' | 'verified' | 'premium'
          last_seen_at?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          full_name?: string
          email?: string
          phone?: string | null
          date_of_birth?: string | null
          nationality?: string | null
          passport_number?: string | null
          avatar_url?: string | null
          bio?: string | null
          languages?: string[] | null
          emergency_sharing?: boolean
          location_sharing?: boolean
          profile_visibility?: 'private' | 'verified_users' | 'public'
          safety_score?: number
          is_verified?: boolean
          verification_level?: 'basic' | 'verified' | 'premium'
          last_seen_at?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      digital_ids: {
        Row: {
          id: string
          user_id: string
          tss_id: string
          issued_at: string
          expires_at: string
          status: 'active' | 'suspended' | 'expired' | 'revoked'
          verification_level: 'basic' | 'verified' | 'premium'
          qr_code_url: string | null
          verification_data: Json | null
          last_verification: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tss_id: string
          issued_at?: string
          expires_at: string
          status?: 'active' | 'suspended' | 'expired' | 'revoked'
          verification_level?: 'basic' | 'verified' | 'premium'
          qr_code_url?: string | null
          verification_data?: Json | null
          last_verification?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tss_id?: string
          issued_at?: string
          expires_at?: string
          status?: 'active' | 'suspended' | 'expired' | 'revoked'
          verification_level?: 'basic' | 'verified' | 'premium'
          qr_code_url?: string | null
          verification_data?: Json | null
          last_verification?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_ids_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      emergency_contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          relationship: string
          email: string
          phone: string
          country_code: string | null
          is_primary: boolean
          is_verified: boolean
          verification_code: string | null
          verification_expires: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          relationship: string
          email: string
          phone: string
          country_code?: string | null
          is_primary?: boolean
          is_verified?: boolean
          verification_code?: string | null
          verification_expires?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          relationship?: string
          email?: string
          phone?: string
          country_code?: string | null
          is_primary?: boolean
          is_verified?: boolean
          verification_code?: string | null
          verification_expires?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      safety_alerts: {
        Row: {
          id: string
          title: string
          description: string
          alert_type: 'security' | 'weather' | 'health' | 'transportation' | 'event' | 'natural_disaster' | 'other'
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'active' | 'inactive' | 'resolved'
          location_description: string
          latitude: number
          longitude: number
          radius_meters: number | null
          city: string | null
          country_code: string | null
          valid_from: string
          valid_until: string | null
          source: string
          action_required: boolean
          safety_tips: string[] | null
          affected_areas: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          alert_type: 'security' | 'weather' | 'health' | 'transportation' | 'event' | 'natural_disaster' | 'other'
          severity: 'low' | 'medium' | 'high' | 'critical'
          status?: 'active' | 'inactive' | 'resolved'
          location_description: string
          latitude: number
          longitude: number
          radius_meters?: number | null
          city?: string | null
          country_code?: string | null
          valid_from?: string
          valid_until?: string | null
          source: string
          action_required?: boolean
          safety_tips?: string[] | null
          affected_areas?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          alert_type?: 'security' | 'weather' | 'health' | 'transportation' | 'event' | 'natural_disaster' | 'other'
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'active' | 'inactive' | 'resolved'
          location_description?: string
          latitude?: number
          longitude?: number
          radius_meters?: number | null
          city?: string | null
          country_code?: string | null
          valid_from?: string
          valid_until?: string | null
          source?: string
          action_required?: boolean
          safety_tips?: string[] | null
          affected_areas?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sos_incidents: {
        Row: {
          id: string
          user_id: string
          incident_type: 'medical' | 'security' | 'accident' | 'lost' | 'harassment' | 'natural_disaster' | 'other'
          status: 'active' | 'escalated' | 'resolved' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'critical'
          description: string | null
          location_description: string
          latitude: number
          longitude: number
          timestamp: string
          escalated_at: string | null
          resolved_at: string | null
          emergency_contacts_notified: boolean
          local_authorities_contacted: boolean
          photos: string[] | null
          additional_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          incident_type: 'medical' | 'security' | 'accident' | 'lost' | 'harassment' | 'natural_disaster' | 'other'
          status?: 'active' | 'escalated' | 'resolved' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          description?: string | null
          location_description: string
          latitude: number
          longitude: number
          timestamp?: string
          escalated_at?: string | null
          resolved_at?: string | null
          emergency_contacts_notified?: boolean
          local_authorities_contacted?: boolean
          photos?: string[] | null
          additional_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          incident_type?: 'medical' | 'security' | 'accident' | 'lost' | 'harassment' | 'natural_disaster' | 'other'
          status?: 'active' | 'escalated' | 'resolved' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          description?: string | null
          location_description?: string
          latitude?: number
          longitude?: number
          timestamp?: string
          escalated_at?: string | null
          resolved_at?: string | null
          emergency_contacts_notified?: boolean
          local_authorities_contacted?: boolean
          photos?: string[] | null
          additional_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_incidents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      user_locations: {
        Row: {
          id: string
          user_id: string
          latitude: number
          longitude: number
          altitude: number | null
          accuracy: number | null
          address: string | null
          area_name: string | null
          city: string | null
          country_code: string | null
          timezone: string | null
          safety_level: number
          is_manual: boolean
          device_info: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          latitude: number
          longitude: number
          altitude?: number | null
          accuracy?: number | null
          address?: string | null
          area_name?: string | null
          city?: string | null
          country_code?: string | null
          timezone?: string | null
          safety_level?: number
          is_manual?: boolean
          device_info?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          latitude?: number
          longitude?: number
          altitude?: number | null
          accuracy?: number | null
          address?: string | null
          area_name?: string | null
          city?: string | null
          country_code?: string | null
          timezone?: string | null
          safety_level?: number
          is_manual?: boolean
          device_info?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      accommodations: {
        Row: {
          id: string
          name: string
          accommodation_type: 'hotel' | 'hostel' | 'bed_and_breakfast' | 'apartment' | 'guesthouse' | 'resort' | 'other'
          description: string | null
          address: string
          city: string
          country_code: string
          latitude: number
          longitude: number
          phone: string | null
          email: string | null
          website: string | null
          average_rating: number | null
          total_reviews: number
          price_range: string | null
          amenities: string[] | null
          is_verified: boolean
          safety_features: string[] | null
          emergency_contacts: Json | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          accommodation_type: 'hotel' | 'hostel' | 'bed_and_breakfast' | 'apartment' | 'guesthouse' | 'resort' | 'other'
          description?: string | null
          address: string
          city: string
          country_code: string
          latitude: number
          longitude: number
          phone?: string | null
          email?: string | null
          website?: string | null
          average_rating?: number | null
          total_reviews?: number
          price_range?: string | null
          amenities?: string[] | null
          is_verified?: boolean
          safety_features?: string[] | null
          emergency_contacts?: Json | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          accommodation_type?: 'hotel' | 'hostel' | 'bed_and_breakfast' | 'apartment' | 'guesthouse' | 'resort' | 'other'
          description?: string | null
          address?: string
          city?: string
          country_code?: string
          latitude?: number
          longitude?: number
          phone?: string | null
          email?: string | null
          website?: string | null
          average_rating?: number | null
          total_reviews?: number
          price_range?: string | null
          amenities?: string[] | null
          is_verified?: boolean
          safety_features?: string[] | null
          emergency_contacts?: Json | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_routes: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          start_location: Json
          end_location: Json
          waypoints: Json[] | null
          route_data: Json
          distance_meters: number | null
          estimated_duration: number | null
          safety_score: number | null
          transportation_mode: 'walking' | 'driving' | 'public_transport' | 'cycling' | 'mixed'
          is_public: boolean
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          start_location: Json
          end_location: Json
          waypoints?: Json[] | null
          route_data: Json
          distance_meters?: number | null
          estimated_duration?: number | null
          safety_score?: number | null
          transportation_mode?: 'walking' | 'driving' | 'public_transport' | 'cycling' | 'mixed'
          is_public?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          start_location?: Json
          end_location?: Json
          waypoints?: Json[] | null
          route_data?: Json
          distance_meters?: number | null
          estimated_duration?: number | null
          safety_score?: number | null
          transportation_mode?: 'walking' | 'driving' | 'public_transport' | 'cycling' | 'mixed'
          is_public?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_routes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      id_documents: {
        Row: {
          id: string
          user_id: string
          document_type: 'passport' | 'national_id' | 'drivers_license' | 'visa' | 'other'
          document_number: string
          issuing_country: string
          issue_date: string | null
          expiry_date: string | null
          file_path: string | null
          is_verified: boolean
          verification_date: string | null
          verification_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_type: 'passport' | 'national_id' | 'drivers_license' | 'visa' | 'other'
          document_number: string
          issuing_country: string
          issue_date?: string | null
          expiry_date?: string | null
          file_path?: string | null
          is_verified?: boolean
          verification_date?: string | null
          verification_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_type?: 'passport' | 'national_id' | 'drivers_license' | 'visa' | 'other'
          document_number?: string
          issuing_country?: string
          issue_date?: string | null
          expiry_date?: string | null
          file_path?: string | null
          is_verified?: boolean
          verification_date?: string | null
          verification_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "id_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      safety_zones: {
        Row: {
          id: string
          name: string
          zone_type: 'safe' | 'warning' | 'danger' | 'restricted'
          description: string | null
          latitude: number
          longitude: number
          radius_meters: number
          city: string | null
          country_code: string | null
          features: string[] | null
          active_hours: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          zone_type: 'safe' | 'warning' | 'danger' | 'restricted'
          description?: string | null
          latitude: number
          longitude: number
          radius_meters: number
          city?: string | null
          country_code?: string | null
          features?: string[] | null
          active_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          zone_type?: 'safe' | 'warning' | 'danger' | 'restricted'
          description?: string | null
          latitude?: number
          longitude?: number
          radius_meters?: number
          city?: string | null
          country_code?: string | null
          features?: string[] | null
          active_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_alert_interactions: {
        Row: {
          id: string
          user_id: string
          alert_id: string
          interaction_type: 'viewed' | 'dismissed' | 'acknowledged' | 'shared' | 'reported'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          alert_id: string
          interaction_type: 'viewed' | 'dismissed' | 'acknowledged' | 'shared' | 'reported'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          alert_id?: string
          interaction_type?: 'viewed' | 'dismissed' | 'acknowledged' | 'shared' | 'reported'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_alert_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_alert_interactions_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "safety_alerts"
            referencedColumns: ["id"]
          }
        ]
      }
      sos_incident_logs: {
        Row: {
          id: string
          incident_id: string
          log_type: 'status_change' | 'location_update' | 'contact_attempt' | 'escalation' | 'system' | 'user_action'
          message: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          incident_id: string
          log_type: 'status_change' | 'location_update' | 'contact_attempt' | 'escalation' | 'system' | 'user_action'
          message: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          incident_id?: string
          log_type?: 'status_change' | 'location_update' | 'contact_attempt' | 'escalation' | 'system' | 'user_action'
          message?: string
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_incident_logs_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "sos_incidents"
            referencedColumns: ["id"]
          }
        ]
      }
      route_usage: {
        Row: {
          id: string
          user_id: string
          route_id: string
          usage_type: 'viewed' | 'used' | 'completed' | 'abandoned'
          start_time: string
          end_time: string | null
          actual_duration: number | null
          deviation_meters: number | null
          safety_incidents: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          route_id: string
          usage_type?: 'viewed' | 'used' | 'completed' | 'abandoned'
          start_time: string
          end_time?: string | null
          actual_duration?: number | null
          deviation_meters?: number | null
          safety_incidents?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          route_id?: string
          usage_type?: 'viewed' | 'used' | 'completed' | 'abandoned'
          start_time?: string
          end_time?: string | null
          actual_duration?: number | null
          deviation_meters?: number | null
          safety_incidents?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "route_usage_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "saved_routes"
            referencedColumns: ["id"]
          }
        ]
      }
      user_accommodations: {
        Row: {
          id: string
          user_id: string
          accommodation_id: string
          interaction_type: 'viewed' | 'bookmarked' | 'booked' | 'reviewed' | 'visited'
          booking_reference: string | null
          check_in_date: string | null
          check_out_date: string | null
          review_rating: number | null
          review_text: string | null
          photos: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          accommodation_id: string
          interaction_type: 'viewed' | 'bookmarked' | 'booked' | 'reviewed' | 'visited'
          booking_reference?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          review_rating?: number | null
          review_text?: string | null
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          accommodation_id?: string
          interaction_type?: 'viewed' | 'bookmarked' | 'booked' | 'reviewed' | 'visited'
          booking_reference?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          review_rating?: number | null
          review_text?: string | null
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_accommodations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_accommodations_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          }
        ]
      }
      user_devices: {
        Row: {
          id: string
          user_id: string
          device_id: string
          device_name: string | null
          device_type: 'mobile' | 'tablet' | 'desktop' | 'smartwatch' | 'other'
          platform: string | null
          app_version: string | null
          push_token: string | null
          is_active: boolean
          last_used: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          device_id: string
          device_name?: string | null
          device_type?: 'mobile' | 'tablet' | 'desktop' | 'smartwatch' | 'other'
          platform?: string | null
          app_version?: string | null
          push_token?: string | null
          is_active?: boolean
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          device_id?: string
          device_name?: string | null
          device_type?: 'mobile' | 'tablet' | 'desktop' | 'smartwatch' | 'other'
          platform?: string | null
          app_version?: string | null
          push_token?: string | null
          is_active?: boolean
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'safety_alert' | 'emergency' | 'verification' | 'system' | 'accommodation' | 'route' | 'social'
          title: string
          message: string
          data: Json | null
          is_read: boolean
          send_push: boolean
          send_email: boolean
          priority: 'low' | 'medium' | 'high' | 'urgent'
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'safety_alert' | 'emergency' | 'verification' | 'system' | 'accommodation' | 'route' | 'social'
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          send_push?: boolean
          send_email?: boolean
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'safety_alert' | 'emergency' | 'verification' | 'system' | 'accommodation' | 'route' | 'social'
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          send_push?: boolean
          send_email?: boolean
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          created_at?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
    }
    Views: {
      v_user_profile: {
        Row: {
          user_id: string | null
          full_name: string | null
          email: string | null
          phone: string | null
          nationality: string | null
          avatar_url: string | null
          safety_score: number | null
          is_verified: boolean | null
          verification_level: string | null
          last_seen_at: string | null
          tss_id: string | null
          digital_id_status: string | null
          qr_code_url: string | null
          digital_id_expires: string | null
          emergency_contacts_count: number | null
          verified_documents_count: number | null
        }
        Relationships: []
      }
      v_active_safety_alerts: {
        Row: {
          id: string | null
          title: string | null
          description: string | null
          alert_type: string | null
          severity: string | null
          location_description: string | null
          latitude: number | null
          longitude: number | null
          radius_meters: number | null
          city: string | null
          country_code: string | null
          valid_from: string | null
          valid_until: string | null
          source: string | null
          action_required: boolean | null
          safety_tips: string[] | null
          created_at: string | null
        }
        Relationships: []
      }
      v_user_current_location: {
        Row: {
          user_id: string | null
          latitude: number | null
          longitude: number | null
          address: string | null
          area_name: string | null
          city: string | null
          country_code: string | null
          safety_level: number | null
          last_location_update: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_distance: {
        Args: {
          lat1: number
          lon1: number
          lat2: number
          lon2: number
        }
        Returns: number
      }
      calculate_location_safety_score: {
        Args: {
          p_latitude: number
          p_longitude: number
          p_radius_meters?: number
        }
        Returns: number
      }
      calculate_user_safety_score: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      get_country_name: {
        Args: {
          country_code: string
        }
        Returns: string
      }
      get_user_activity_summary: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      is_within_radius: {
        Args: {
          lat1: number
          lon1: number
          lat2: number
          lon2: number
          radius_meters: number
        }
        Returns: boolean
      }
      search_accommodations: {
        Args: {
          p_latitude?: number
          p_longitude?: number
          p_radius_meters?: number
          p_accommodation_type?: Database['public']['Tables']['accommodations']['Row']['accommodation_type']
          p_price_range?: string
          p_min_rating?: number
          p_limit?: number
        }
        Returns: {
          id: string
          name: string
          accommodation_type: Database['public']['Tables']['accommodations']['Row']['accommodation_type']
          address: string
          city: string
          country_code: string
          latitude: number
          longitude: number
          distance_meters: number | null
          average_rating: number | null
          total_reviews: number
          price_range: string | null
          amenities: string[] | null
          is_verified: boolean
          safety_features: string[] | null
          emergency_contacts: Json | null
        }[]
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

// Helper Types
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

// User-related types for easier component usage
export type Profile = Tables<'profiles'>
export type DigitalId = Tables<'digital_ids'>
export type IdDocument = Tables<'id_documents'>
export type EmergencyContact = Tables<'emergency_contacts'>
export type SafetyAlert = Tables<'safety_alerts'>
export type SafetyZone = Tables<'safety_zones'>
export type UserAlertInteraction = Tables<'user_alert_interactions'>
export type SosIncident = Tables<'sos_incidents'>
export type SosIncidentLog = Tables<'sos_incident_logs'>
export type UserLocation = Tables<'user_locations'>
export type Accommodation = Tables<'accommodations'>
export type UserAccommodation = Tables<'user_accommodations'>
export type SavedRoute = Tables<'saved_routes'>
export type RouteUsage = Tables<'route_usage'>
export type UserDevice = Tables<'user_devices'>
export type Notification = Tables<'notifications'>

// View types
export type UserProfile = Tables<'v_user_profile'>
export type ActiveSafetyAlert = Tables<'v_active_safety_alerts'>
export type UserCurrentLocation = Tables<'v_user_current_location'>