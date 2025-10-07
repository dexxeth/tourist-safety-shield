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
      accommodations: {
        Row: {
          id: string
          name: string
          description: string | null
          accommodation_type: 'hotel' | 'hostel' | 'guesthouse' | 'apartment' | 'resort' | 'bnb' | 'camping' | 'other'
          latitude: number
          longitude: number
          address: string
          city: string
          country: string
          postal_code: string | null
          phone: string | null
          email: string | null
          website: string | null
          booking_url: string | null
          check_in_time: string | null
          check_out_time: string | null
          price_per_night_usd: number | null
          currency: string
          price_range: 'budget' | 'mid-range' | 'luxury' | null
          overall_rating: number | null
          safety_rating: number | null
          total_reviews: number
          amenities: string[] | null
          safety_features: string[] | null
          accessibility_features: string[] | null
          is_verified: boolean
          verification_date: string | null
          verified_by: string | null
          is_partner: boolean
          is_active: boolean
          last_availability_check: string | null
          instant_booking_available: boolean
          primary_image_url: string | null
          image_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          accommodation_type: 'hotel' | 'hostel' | 'guesthouse' | 'apartment' | 'resort' | 'bnb' | 'camping' | 'other'
          latitude: number
          longitude: number
          address: string
          city: string
          country: string
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          booking_url?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          price_per_night_usd?: number | null
          currency?: string
          price_range?: 'budget' | 'mid-range' | 'luxury' | null
          overall_rating?: number | null
          safety_rating?: number | null
          total_reviews?: number
          amenities?: string[] | null
          safety_features?: string[] | null
          accessibility_features?: string[] | null
          is_verified?: boolean
          verification_date?: string | null
          verified_by?: string | null
          is_partner?: boolean
          is_active?: boolean
          last_availability_check?: string | null
          instant_booking_available?: boolean
          primary_image_url?: string | null
          image_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          accommodation_type?: 'hotel' | 'hostel' | 'guesthouse' | 'apartment' | 'resort' | 'bnb' | 'camping' | 'other'
          latitude?: number
          longitude?: number
          address?: string
          city?: string
          country?: string
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          booking_url?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          price_per_night_usd?: number | null
          currency?: string
          price_range?: 'budget' | 'mid-range' | 'luxury' | null
          overall_rating?: number | null
          safety_rating?: number | null
          total_reviews?: number
          amenities?: string[] | null
          safety_features?: string[] | null
          accessibility_features?: string[] | null
          is_verified?: boolean
          verification_date?: string | null
          verified_by?: string | null
          is_partner?: boolean
          is_active?: boolean
          last_availability_check?: string | null
          instant_booking_available?: boolean
          primary_image_url?: string | null
          image_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      digital_ids: {
        Row: {
          id: string
          user_id: string
          tss_id: string
          status: 'active' | 'expired' | 'revoked' | 'pending'
          verification_level: 'unverified' | 'basic' | 'verified' | 'premium'
          issued_at: string
          expires_at: string | null
          qr_code_url: string | null
          blockchain_hash: string | null
          verification_documents: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tss_id?: string
          status?: 'active' | 'expired' | 'revoked' | 'pending'
          verification_level?: 'unverified' | 'basic' | 'verified' | 'premium'
          issued_at?: string
          expires_at?: string | null
          qr_code_url?: string | null
          blockchain_hash?: string | null
          verification_documents?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tss_id?: string
          status?: 'active' | 'expired' | 'revoked' | 'pending'
          verification_level?: 'unverified' | 'basic' | 'verified' | 'premium'
          issued_at?: string
          expires_at?: string | null
          qr_code_url?: string | null
          blockchain_hash?: string | null
          verification_documents?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      emergency_contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          relationship: string
          phone: string
          email: string | null
          is_primary: boolean
          is_verified: boolean
          verification_method: string | null
          verification_date: string | null
          emergency_message_template: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          relationship: string
          phone: string
          email?: string | null
          is_primary?: boolean
          is_verified?: boolean
          verification_method?: string | null
          verification_date?: string | null
          emergency_message_template?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          relationship?: string
          phone?: string
          email?: string | null
          is_primary?: boolean
          is_verified?: boolean
          verification_method?: string | null
          verification_date?: string | null
          emergency_message_template?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      id_documents: {
        Row: {
          id: string
          user_id: string
          document_type: 'passport' | 'national_id' | 'drivers_license' | 'visa' | 'other'
          document_number: string
          issuing_country: string
          issuing_authority: string | null
          issue_date: string | null
          expiry_date: string | null
          verification_status: 'pending' | 'verified' | 'rejected' | 'expired'
          verification_method: string | null
          verification_date: string | null
          verified_by: string | null
          document_image_url: string | null
          extracted_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_type: 'passport' | 'national_id' | 'drivers_license' | 'visa' | 'other'
          document_number: string
          issuing_country: string
          issuing_authority?: string | null
          issue_date?: string | null
          expiry_date?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected' | 'expired'
          verification_method?: string | null
          verification_date?: string | null
          verified_by?: string | null
          document_image_url?: string | null
          extracted_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_type?: 'passport' | 'national_id' | 'drivers_license' | 'visa' | 'other'
          document_number?: string
          issuing_country?: string
          issuing_authority?: string | null
          issue_date?: string | null
          expiry_date?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected' | 'expired'
          verification_method?: string | null
          verification_date?: string | null
          verified_by?: string | null
          document_image_url?: string | null
          extracted_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          user_id: string
          email: string
          full_name: string | null
          nationality: string | null
          date_of_birth: string | null
          phone_number: string | null
          avatar_url: string | null
          bio: string | null
          emergency_medical_info: Json | null
          address: Json | null
          preferences: Json | null
          safety_score: number
          public_profile: boolean
          last_seen_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          email: string
          full_name?: string | null
          nationality?: string | null
          date_of_birth?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          bio?: string | null
          emergency_medical_info?: Json | null
          address?: Json | null
          preferences?: Json | null
          safety_score?: number
          public_profile?: boolean
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          email?: string
          full_name?: string | null
          nationality?: string | null
          date_of_birth?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          bio?: string | null
          emergency_medical_info?: Json | null
          address?: Json | null
          preferences?: Json | null
          safety_score?: number
          public_profile?: boolean
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      safety_alerts: {
        Row: {
          id: string
          title: string
          description: string
          alert_type: 'weather' | 'security' | 'health' | 'transport' | 'emergency' | 'general'
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'active' | 'resolved' | 'expired'
          source: string | null
          source_url: string | null
          affected_area: Json | null
          coordinates: Json | null
          radius_km: number | null
          target_demographics: string[] | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          alert_type: 'weather' | 'security' | 'health' | 'transport' | 'emergency' | 'general'
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'active' | 'resolved' | 'expired'
          source?: string | null
          source_url?: string | null
          affected_area?: Json | null
          coordinates?: Json | null
          radius_km?: number | null
          target_demographics?: string[] | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          alert_type?: 'weather' | 'security' | 'health' | 'transport' | 'emergency' | 'general'
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'active' | 'resolved' | 'expired'
          source?: string | null
          source_url?: string | null
          affected_area?: Json | null
          coordinates?: Json | null
          radius_km?: number | null
          target_demographics?: string[] | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sos_incidents: {
        Row: {
          id: string
          user_id: string
          status: 'active' | 'acknowledged' | 'responding' | 'resolved' | 'false_alarm' | 'cancelled'
          incident_type: 'medical' | 'security' | 'accident' | 'natural_disaster' | 'lost' | 'other'
          priority: 'low' | 'medium' | 'high' | 'critical'
          description: string | null
          location_latitude: number
          location_longitude: number
          location_accuracy: number | null
          location_address: string | null
          user_condition: string | null
          photos: string[] | null
          audio_recording_url: string | null
          emergency_contacts_notified: boolean
          authorities_notified: boolean
          responder_id: string | null
          estimated_response_time: number | null
          resolution_notes: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'active' | 'acknowledged' | 'responding' | 'resolved' | 'false_alarm' | 'cancelled'
          incident_type: 'medical' | 'security' | 'accident' | 'natural_disaster' | 'lost' | 'other'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          description?: string | null
          location_latitude: number
          location_longitude: number
          location_accuracy?: number | null
          location_address?: string | null
          user_condition?: string | null
          photos?: string[] | null
          audio_recording_url?: string | null
          emergency_contacts_notified?: boolean
          authorities_notified?: boolean
          responder_id?: string | null
          estimated_response_time?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'active' | 'acknowledged' | 'responding' | 'resolved' | 'false_alarm' | 'cancelled'
          incident_type?: 'medical' | 'security' | 'accident' | 'natural_disaster' | 'lost' | 'other'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          description?: string | null
          location_latitude?: number
          location_longitude?: number
          location_accuracy?: number | null
          location_address?: string | null
          user_condition?: string | null
          photos?: string[] | null
          audio_recording_url?: string | null
          emergency_contacts_notified?: boolean
          authorities_notified?: boolean
          responder_id?: string | null
          estimated_response_time?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_accommodations: {
        Row: {
          id: string
          user_id: string
          accommodation_id: string
          interaction_type: 'viewed' | 'saved' | 'booked' | 'stayed' | 'reviewed'
          check_in_date: string | null
          check_out_date: string | null
          guests_count: number | null
          total_price_usd: number | null
          booking_reference: string | null
          booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | null
          overall_rating: number | null
          safety_rating: number | null
          cleanliness_rating: number | null
          service_rating: number | null
          review_text: string | null
          review_helpful_count: number
          safety_incidents: boolean
          safety_incident_details: string | null
          would_recommend: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          accommodation_id: string
          interaction_type: 'viewed' | 'saved' | 'booked' | 'stayed' | 'reviewed'
          check_in_date?: string | null
          check_out_date?: string | null
          guests_count?: number | null
          total_price_usd?: number | null
          booking_reference?: string | null
          booking_status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | null
          overall_rating?: number | null
          safety_rating?: number | null
          cleanliness_rating?: number | null
          service_rating?: number | null
          review_text?: string | null
          review_helpful_count?: number
          safety_incidents?: boolean
          safety_incident_details?: string | null
          would_recommend?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          accommodation_id?: string
          interaction_type?: 'viewed' | 'saved' | 'booked' | 'stayed' | 'reviewed'
          check_in_date?: string | null
          check_out_date?: string | null
          guests_count?: number | null
          total_price_usd?: number | null
          booking_reference?: string | null
          booking_status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | null
          overall_rating?: number | null
          safety_rating?: number | null
          cleanliness_rating?: number | null
          service_rating?: number | null
          review_text?: string | null
          review_helpful_count?: number
          safety_incidents?: boolean
          safety_incident_details?: string | null
          would_recommend?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_safety_score: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      generate_tss_digital_id: {
        Args: Record<PropertyKey, never>
        Returns: string
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