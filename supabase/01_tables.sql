-- =====================================================
-- Tourist Safety Shield - Database Tables Schema
-- =====================================================
-- Core tables with proper relationships for tourist safety platform
-- Features: Digital IDs, Emergency Response, Route Planning, Accommodations

-- Extensions
create extension if not exists pgcrypto; -- for gen_random_uuid()
create extension if not exists postgis; -- for geospatial features

-- =====================================================
-- ENUMS
-- =====================================================

-- Drop existing enums to ensure clean creation
drop type if exists public.verification_level cascade;
drop type if exists public.digital_id_status cascade;
drop type if exists public.document_type cascade;
drop type if exists public.relationship_type cascade;
drop type if exists public.alert_type cascade;
drop type if exists public.alert_severity cascade;
drop type if exists public.risk_level cascade;
drop type if exists public.accommodation_type cascade;
drop type if exists public.sos_status cascade;
drop type if exists public.incident_type cascade;
drop type if exists public.route_type cascade;
drop type if exists public.interaction_type cascade;
drop type if exists public.booking_status cascade;
drop type if exists public.notification_type cascade;

-- Create enums
create type public.verification_level as enum ('unverified', 'basic', 'verified', 'premium');
create type public.digital_id_status as enum ('pending', 'active', 'expired', 'suspended', 'revoked');
create type public.document_type as enum ('passport', 'national_id', 'drivers_license', 'visa', 'aadhaar', 'pan_card', 'voter_id', 'other');
create type public.relationship_type as enum ('parent', 'spouse', 'sibling', 'child', 'friend', 'colleague', 'guardian', 'relative', 'other');
create type public.alert_type as enum ('weather', 'security', 'health', 'transport', 'emergency', 'general', 'success', 'info', 'warning');
create type public.alert_severity as enum ('low', 'medium', 'high', 'critical');
create type public.risk_level as enum ('safe', 'low', 'medium', 'high', 'critical');
create type public.accommodation_type as enum ('hotel', 'hostel', 'guesthouse', 'apartment', 'resort', 'bnb', 'camping', 'other');
create type public.sos_status as enum ('triggered', 'active', 'acknowledged', 'responding', 'resolved', 'cancelled', 'false_alarm');
create type public.incident_type as enum ('medical', 'security', 'accident', 'natural_disaster', 'lost', 'crime', 'general');
create type public.route_type as enum ('walking', 'driving', 'cycling', 'public_transport');
create type public.interaction_type as enum ('viewed', 'saved', 'booked', 'stayed', 'reviewed', 'shared', 'dismissed', 'reported');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
create type public.notification_type as enum ('safety_alert', 'sos_emergency', 'route_update', 'booking_confirmation', 'system_update');

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Updated timestamp trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- Generate unique TSS Digital ID
create or replace function public.generate_tss_digital_id()
returns text language plpgsql as $$
declare
  yr text := to_char(now(), 'YYYY');
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  suffix text := '';
  i int;
  attempts int := 0;
  candidate text;
begin
  loop
    suffix := '';
    for i in 1..6 loop
      suffix := suffix || substr(chars, 1 + floor(random()*length(chars))::int, 1);
    end loop;
    candidate := 'TSS-' || yr || '-' || suffix;
    
    if not exists (select 1 from public.digital_ids where tss_id = candidate) then
      return candidate;
    end if;
    
    attempts := attempts + 1;
    if attempts > 100 then
      raise exception 'Could not generate unique digital ID after 100 attempts';
    end if;
  end loop;
end; $$;

-- Calculate user safety score
create or replace function public.calculate_safety_score(user_uuid uuid)
returns integer language plpgsql as $$
declare
  base_score integer := 75;
  verification_bonus integer := 0;
  document_bonus integer := 0;
  contact_bonus integer := 0;
  activity_bonus integer := 0;
  total_score integer;
begin
  -- Verification level bonus
  select case 
    when verification_level = 'premium' then 20
    when verification_level = 'verified' then 15
    when verification_level = 'basic' then 10
    else 0
  end into verification_bonus
  from public.digital_ids where user_id = user_uuid and status = 'active';
  
  -- Document verification bonus
  select count(*) * 5 into document_bonus
  from public.id_documents 
  where user_id = user_uuid and is_verified = true;
  
  -- Emergency contacts bonus
  select case when count(*) >= 3 then 10 else count(*) * 3 end into contact_bonus
  from public.emergency_contacts where user_id = user_uuid;
  
  -- Recent activity bonus
  select case when max(created_at) > now() - interval '30 days' then 5 else 0 end into activity_bonus
  from public.user_locations where user_id = user_uuid;
  
  total_score := base_score + verification_bonus + document_bonus + contact_bonus + activity_bonus;
  return least(100, greatest(0, total_score));
end; $$;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User profiles (extends auth.users)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  nationality text default 'Unknown',
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  avatar_url text,
  bio text,
  
  -- Address information
  address jsonb default '{}'::jsonb, -- {street, city, state, country, postal_code}
  
  -- Emergency and medical information
  emergency_medical_info text, -- allergies, conditions, blood type
  
  -- Preferences
  preferred_language text default 'en',
  timezone text default 'UTC',
  
  -- Safety and verification
  safety_score integer not null default 75 check (safety_score >= 0 and safety_score <= 100),
  is_verified boolean not null default false,
  verification_level public.verification_level not null default 'unverified',
  
  -- Privacy settings
  location_sharing boolean not null default true,
  profile_visibility text default 'private' check (profile_visibility in ('public', 'verified_users', 'private')),
  emergency_sharing boolean not null default true,
  
  -- Status
  is_active boolean not null default true,
  last_seen_at timestamptz,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Digital Tourist IDs
create table if not exists public.digital_ids (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  tss_id text not null unique,
  
  -- QR Code and blockchain data
  qr_code_data text, -- base64 or JSON data for QR code
  qr_code_url text, -- storage URL for QR image
  blockchain_hash text,
  blockchain_tx_id text,
  
  -- Status and dates
  status public.digital_id_status not null default 'pending',
  verification_level public.verification_level not null default 'unverified',
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  
  -- Authority and verification
  issuing_authority text default 'Tourist Safety Shield',
  verified_documents uuid[], -- references to id_documents.id
  verification_notes text,
  
  -- Metadata
  metadata jsonb default '{}'::jsonb,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint tss_id_format check (tss_id ~ '^TSS-\d{4}-[A-Z0-9]{6}$'),
  constraint expires_after_issued check (expires_at > issued_at)
);

-- Identity documents with verification
create table if not exists public.id_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  
  -- Document details
  document_type public.document_type not null,
  document_number text not null,
  issuing_country text not null,
  issuing_authority text,
  issue_date date,
  expiry_date date,
  
  -- File storage
  file_url text, -- storage path for document image
  file_size integer,
  file_type text,
  
  -- Verification status
  is_verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid, -- admin who verified
  verification_notes text,
  rejection_reason text,
  
  -- OCR/extracted data
  extracted_data jsonb default '{}'::jsonb,
  
  -- Display order
  priority integer default 1,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint doc_number_not_empty check (length(trim(document_number)) > 0)
);

-- Emergency contacts with verification
create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  
  -- Contact information
  name text not null,
  phone text not null,
  email text,
  relationship public.relationship_type not null,
  
  -- Priority and status
  priority smallint not null default 1 check (priority > 0),
  is_primary boolean not null default false,
  is_verified boolean not null default false,
  
  -- Additional info
  address text,
  notes text,
  can_authorize_medical boolean not null default false,
  
  -- Verification
  verification_method text, -- sms, call, email
  verified_at timestamptz,
  
  -- Notification preferences
  notification_preferences jsonb default '{"sms": true, "email": true, "call": true}'::jsonb,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint name_not_empty check (length(trim(name)) > 0),
  constraint phone_not_empty check (length(trim(phone)) > 0)
);

-- =====================================================
-- LOCATION AND SAFETY TABLES
-- =====================================================

-- User location tracking
create table if not exists public.user_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  
  -- Geographic coordinates
  latitude double precision not null,
  longitude double precision not null,
  accuracy_meters integer,
  altitude_meters double precision,
  
  -- Movement data
  speed_kmh double precision,
  bearing_degrees integer check (bearing_degrees >= 0 and bearing_degrees < 360),
  
  -- Location details
  address text,
  area_name text,
  city text,
  country_code text,
  timezone text,
  
  -- Safety assessment
  safety_level public.risk_level not null default 'safe',
  risk_factors text[], -- detected risks
  is_safe_zone boolean not null default false,
  
  -- Check-in type
  checkin_type text default 'automatic' check (checkin_type in ('automatic', 'manual', 'emergency')),
  notes text,
  
  created_at timestamptz not null default now()
);

-- Predefined safety zones
create table if not exists public.safety_zones (
  id uuid primary key default gen_random_uuid(),
  
  -- Zone identification
  name text not null,
  description text,
  zone_type text not null check (zone_type in ('police_station', 'hospital', 'embassy', 'tourist_center', 'hotel', 'transport_hub', 'safe_area')),
  
  -- Geographic data
  center_latitude double precision not null,
  center_longitude double precision not null,
  radius_meters integer not null default 500,
  
  -- Safety information
  safety_rating public.risk_level not null default 'safe',
  amenities text[],
  
  -- Operating information
  operating_hours jsonb default '{}'::jsonb, -- {open: "09:00", close: "17:00", days: [...]}
  contact_info jsonb default '{}'::jsonb, -- {phone, email, website}
  
  -- Location
  city text not null,
  country_code text not null,
  
  -- Verification
  is_verified boolean not null default false,
  verified_by text,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safety alerts system
create table if not exists public.safety_alerts (
  id uuid primary key default gen_random_uuid(),
  
  -- Alert content
  title text not null,
  description text not null,
  alert_type public.alert_type not null,
  severity public.alert_severity not null default 'medium',
  
  -- Geographic scope
  location_description text,
  latitude double precision,
  longitude double precision,
  radius_meters integer default 1000,
  city text,
  country_code text,
  affected_areas text[], -- specific areas affected
  
  -- Alert timing
  status text default 'active' check (status in ('active', 'expired', 'resolved')),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  auto_expire boolean not null default true,
  
  -- Source and verification
  source text default 'system',
  source_url text,
  is_verified boolean not null default false,
  
  -- Action guidance
  action_required text, -- what users should do
  safety_tips text[],
  
  -- Targeting
  target_demographics text[], -- who this affects most
  language_codes text[] default array['en'],
  
  -- External reference
  external_ref text,
  tags text[],
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint valid_time_range check (valid_until is null or valid_until > valid_from)
);

-- User interactions with alerts
create table if not exists public.user_alert_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  alert_id uuid not null references public.safety_alerts(id) on delete cascade,
  
  interaction_type public.interaction_type not null,
  interaction_data jsonb default '{}'::jsonb,
  
  created_at timestamptz not null default now(),
  
  unique(user_id, alert_id, interaction_type)
);

-- =====================================================
-- SOS AND EMERGENCY TABLES
-- =====================================================

-- SOS incidents with comprehensive tracking
create table if not exists public.sos_incidents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  
  -- Incident classification
  incident_type public.incident_type not null default 'general',
  status public.sos_status not null default 'triggered',
  priority public.alert_severity not null default 'high',
  
  -- Location at trigger time
  trigger_latitude double precision not null,
  trigger_longitude double precision not null,
  trigger_accuracy_meters integer,
  trigger_address text,
  
  -- Current location (may update)
  current_latitude double precision,
  current_longitude double precision,
  current_accuracy_meters integer,
  current_address text,
  
  -- Incident details
  description text,
  user_condition text, -- injured, safe, etc.
  photos text[], -- array of image URLs
  audio_recording_url text,
  
  -- Response coordination
  responder_notes text,
  resolution_notes text,
  responding_authority text,
  incident_number text, -- external reference
  estimated_response_time_minutes integer,
  
  -- Notification tracking
  contacts_notified uuid[], -- emergency_contacts.id array
  authorities_notified text[],
  
  -- Timeline
  triggered_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  responded_at timestamptz,
  resolved_at timestamptz,
  
  -- Metadata
  metadata jsonb default '{}'::jsonb, -- device info, app version, etc.
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- SOS incident activity logs
create table if not exists public.sos_incident_logs (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.sos_incidents(id) on delete cascade,
  
  -- Actor information
  actor_type text not null check (actor_type in ('user', 'system', 'responder', 'contact', 'admin')),
  actor_id uuid, -- user_id, responder_id, etc.
  actor_name text,
  
  -- Action details
  action text not null,
  old_status public.sos_status,
  new_status public.sos_status,
  notes text,
  
  -- Additional data
  metadata jsonb default '{}'::jsonb,
  
  created_at timestamptz not null default now()
);

-- =====================================================
-- ROUTE AND NAVIGATION TABLES
-- =====================================================

-- Saved routes with safety analysis
create table if not exists public.saved_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  
  -- Route identification
  name text not null,
  description text,
  route_type public.route_type default 'walking',
  
  -- Geographic data
  start_latitude double precision not null,
  start_longitude double precision not null,
  start_address text,
  end_latitude double precision not null,
  end_longitude double precision not null,
  end_address text,
  waypoints jsonb default '[]'::jsonb, -- array of {lat, lng, description}
  
  -- Route characteristics
  distance_meters integer,
  estimated_duration_minutes integer,
  safety_score integer check (safety_score >= 0 and safety_score <= 100),
  risk_level public.risk_level not null default 'safe',
  
  -- Safety features and risks
  safety_features text[], -- well-lit, police patrol, cctv
  risk_factors text[], -- construction, protests, high crime
  recommended_times text[], -- day, night, weekday, weekend
  avoid_times text[],
  
  -- Route data
  encoded_polyline text, -- Google polyline encoding
  route_instructions jsonb default '[]'::jsonb, -- turn-by-turn directions
  
  -- Usage and sharing
  times_used integer not null default 0,
  last_used_at timestamptz,
  is_favorite boolean not null default false,
  is_public boolean not null default false,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Route usage tracking
create table if not exists public.route_usage (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.saved_routes(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  
  -- Usage session
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  actual_duration_minutes integer,
  
  -- Feedback
  safety_incidents text[], -- any issues encountered
  user_rating integer check (user_rating >= 1 and user_rating <= 5),
  user_feedback text,
  
  created_at timestamptz not null default now()
);

-- =====================================================
-- ACCOMMODATION TABLES
-- =====================================================

-- Accommodation catalog
create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),
  
  -- Basic information
  name text not null,
  description text,
  accommodation_type public.accommodation_type not null,
  
  -- Location
  latitude double precision not null,
  longitude double precision not null,
  address text not null,
  city text not null,
  country text not null,
  postal_code text,
  
  -- Contact information
  phone text,
  email text,
  website text,
  booking_url text,
  
  -- Operating hours
  check_in_time text,
  check_out_time text,
  
  -- Pricing (normalized to USD)
  price_per_night_usd decimal(10,2),
  currency text default 'USD',
  price_range text check (price_range in ('budget', 'mid-range', 'luxury')),
  
  -- Ratings and reviews
  overall_rating decimal(3,2) check (overall_rating >= 0 and overall_rating <= 5),
  safety_rating decimal(3,2) check (safety_rating >= 0 and safety_rating <= 5),
  total_reviews integer not null default 0,
  
  -- Features
  amenities text[], -- wifi, breakfast, parking, gym, pool
  safety_features text[], -- security_guard, cctv, safe, secure_entrance
  accessibility_features text[], -- wheelchair_accessible, elevator
  
  -- Verification and partnership
  is_verified boolean not null default false,
  verification_date timestamptz,
  verified_by text,
  is_partner boolean not null default false, -- official TSS partner
  
  -- Availability
  is_active boolean not null default true,
  last_availability_check timestamptz,
  instant_booking_available boolean not null default false,
  
  -- Media
  primary_image_url text,
  image_urls text[],
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User accommodation interactions
create table if not exists public.user_accommodations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  accommodation_id uuid not null references public.accommodations(id) on delete cascade,
  
  -- Interaction type
  interaction_type public.interaction_type not null,
  
  -- Booking details (when applicable)
  check_in_date date,
  check_out_date date,
  guests_count integer,
  total_price_usd decimal(10,2),
  booking_reference text,
  booking_status public.booking_status,
  
  -- Review details (when interaction_type = 'reviewed')
  overall_rating integer check (overall_rating >= 1 and overall_rating <= 5),
  safety_rating integer check (safety_rating >= 1 and safety_rating <= 5),
  cleanliness_rating integer check (cleanliness_rating >= 1 and cleanliness_rating <= 5),
  service_rating integer check (service_rating >= 1 and service_rating <= 5),
  review_text text,
  review_helpful_count integer not null default 0,
  
  -- Safety feedback
  safety_incidents boolean not null default false,
  safety_incident_details text,
  would_recommend boolean,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- NOTIFICATION TABLES
-- =====================================================

-- User devices for push notifications
create table if not exists public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  
  -- Device identification
  device_name text,
  platform text default 'web' check (platform in ('web', 'ios', 'android', 'desktop')),
  device_id text, -- unique device identifier
  
  -- Push notification
  push_token text,
  is_push_enabled boolean not null default true,
  
  -- Device info
  user_agent text,
  ip_address inet,
  
  -- Status
  is_active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notification queue/history
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  
  -- Notification content
  title text not null,
  message text not null,
  notification_type public.notification_type not null,
  
  -- Targeting
  device_id uuid references public.user_devices(id) on delete set null,
  
  -- Delivery status
  is_sent boolean not null default false,
  sent_at timestamptz,
  is_read boolean not null default false,
  read_at timestamptz,
  
  -- Related entities
  related_id uuid, -- could reference alerts, incidents, etc.
  related_type text, -- table name of related entity
  
  -- Action data
  action_url text,
  action_data jsonb default '{}'::jsonb,
  
  -- Scheduling
  scheduled_for timestamptz,
  expires_at timestamptz,
  
  created_at timestamptz not null default now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
create index profiles_email_idx on public.profiles(email);
create index profiles_phone_idx on public.profiles(phone) where phone is not null;
create index profiles_safety_score_idx on public.profiles(safety_score desc);
create index profiles_verification_idx on public.profiles(verification_level, is_verified);

-- Digital IDs indexes
create unique index digital_ids_user_idx on public.digital_ids(user_id);
create unique index digital_ids_tss_id_idx on public.digital_ids(tss_id);
create index digital_ids_status_idx on public.digital_ids(status);

-- Documents indexes
create index id_documents_user_idx on public.id_documents(user_id);
create index id_documents_type_idx on public.id_documents(document_type);
create index id_documents_verified_idx on public.id_documents(is_verified) where is_verified = true;

-- Emergency contacts indexes
create index emergency_contacts_user_idx on public.emergency_contacts(user_id);
create index emergency_contacts_priority_idx on public.emergency_contacts(user_id, priority);
create index emergency_contacts_primary_idx on public.emergency_contacts(user_id, is_primary) where is_primary = true;

-- Location indexes
create index user_locations_user_idx on public.user_locations(user_id);
create index user_locations_coords_idx on public.user_locations(latitude, longitude);
create index user_locations_recent_idx on public.user_locations(user_id, created_at desc);
create index user_locations_safety_idx on public.user_locations(safety_level, created_at desc);

-- Safety zones indexes
create index safety_zones_location_idx on public.safety_zones(center_latitude, center_longitude);
create index safety_zones_city_idx on public.safety_zones(city, country_code);
create index safety_zones_type_idx on public.safety_zones(zone_type);

-- Safety alerts indexes
create index safety_alerts_location_idx on public.safety_alerts(latitude, longitude) where latitude is not null;
create index safety_alerts_active_idx on public.safety_alerts(valid_from, valid_until) where status = 'active';
create index safety_alerts_city_idx on public.safety_alerts(city, country_code) where city is not null;
create index safety_alerts_type_severity_idx on public.safety_alerts(alert_type, severity);

-- SOS incidents indexes
create index sos_incidents_user_idx on public.sos_incidents(user_id);
create index sos_incidents_status_idx on public.sos_incidents(status, triggered_at desc);
create index sos_incidents_location_idx on public.sos_incidents(trigger_latitude, trigger_longitude);
create index sos_incidents_active_idx on public.sos_incidents(status, triggered_at) where status in ('triggered', 'active', 'acknowledged', 'responding');

-- SOS logs indexes
create index sos_incident_logs_incident_idx on public.sos_incident_logs(incident_id, created_at desc);
create index sos_incident_logs_actor_idx on public.sos_incident_logs(actor_type, actor_id) where actor_id is not null;

-- Routes indexes
create index saved_routes_user_idx on public.saved_routes(user_id);
create index saved_routes_start_location_idx on public.saved_routes(start_latitude, start_longitude);
create index saved_routes_end_location_idx on public.saved_routes(end_latitude, end_longitude);
create index saved_routes_safety_idx on public.saved_routes(safety_score desc, risk_level);
create index saved_routes_public_idx on public.saved_routes(is_public) where is_public = true;

-- Route usage indexes
create index route_usage_route_idx on public.route_usage(route_id);
create index route_usage_user_idx on public.route_usage(user_id);
create index route_usage_completed_idx on public.route_usage(completed_at desc) where completed_at is not null;

-- Accommodations indexes
create index accommodations_location_idx on public.accommodations(latitude, longitude);
create index accommodations_city_idx on public.accommodations(city, country);
create index accommodations_type_idx on public.accommodations(accommodation_type);
create index accommodations_safety_rating_idx on public.accommodations(safety_rating desc) where safety_rating is not null;
create index accommodations_price_idx on public.accommodations(price_per_night_usd) where price_per_night_usd is not null;
create index accommodations_verified_idx on public.accommodations(is_verified) where is_verified = true;

-- User accommodations indexes
create index user_accommodations_user_idx on public.user_accommodations(user_id);
create index user_accommodations_accommodation_idx on public.user_accommodations(accommodation_id);
create index user_accommodations_type_idx on public.user_accommodations(interaction_type);
create index user_accommodations_booking_idx on public.user_accommodations(booking_status, created_at desc) where booking_status is not null;

-- Alert interactions indexes
create index user_alert_interactions_user_idx on public.user_alert_interactions(user_id);
create index user_alert_interactions_alert_idx on public.user_alert_interactions(alert_id);

-- Devices indexes
create index user_devices_user_idx on public.user_devices(user_id);
create index user_devices_active_idx on public.user_devices(user_id, is_active) where is_active = true;
create index user_devices_push_token_idx on public.user_devices(push_token) where push_token is not null;

-- Notifications indexes
create index notifications_user_idx on public.notifications(user_id);
create index notifications_unread_idx on public.notifications(user_id, created_at desc) where is_read = false;
create index notifications_type_idx on public.notifications(notification_type);
create index notifications_scheduled_idx on public.notifications(scheduled_for) where scheduled_for is not null and is_sent = false;

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================

-- Profiles
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Digital IDs
create trigger set_digital_ids_updated_at before update on public.digital_ids
  for each row execute function public.set_updated_at();

-- Documents
create trigger set_id_documents_updated_at before update on public.id_documents
  for each row execute function public.set_updated_at();

-- Emergency contacts
create trigger set_emergency_contacts_updated_at before update on public.emergency_contacts
  for each row execute function public.set_updated_at();

-- Safety zones
create trigger set_safety_zones_updated_at before update on public.safety_zones
  for each row execute function public.set_updated_at();

-- Safety alerts
create trigger set_safety_alerts_updated_at before update on public.safety_alerts
  for each row execute function public.set_updated_at();

-- SOS incidents
create trigger set_sos_incidents_updated_at before update on public.sos_incidents
  for each row execute function public.set_updated_at();

-- Routes
create trigger set_saved_routes_updated_at before update on public.saved_routes
  for each row execute function public.set_updated_at();

-- Accommodations
create trigger set_accommodations_updated_at before update on public.accommodations
  for each row execute function public.set_updated_at();

-- User accommodations
create trigger set_user_accommodations_updated_at before update on public.user_accommodations
  for each row execute function public.set_updated_at();

-- Devices
create trigger set_user_devices_updated_at before update on public.user_devices
  for each row execute function public.set_updated_at();