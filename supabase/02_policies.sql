-- =====================================================
-- Tourist Safety Shield - Row Level Security (RLS) Policies
-- =====================================================
-- Comprehensive security policies for all tables
-- Ensures users can only access their own data and appropriate public data

-- =====================================================
-- AUTO-PROVISIONING TRIGGER
-- =====================================================

-- Auto-provision profile and defaults on new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _digital_id text := public.generate_tss_digital_id();
begin
  begin
    -- Create profile
    insert into public.profiles (user_id, full_name, email)
    values (
      new.id,
      coalesce(nullif(coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''),'@',1)), ''), 'User'),
      coalesce(new.email, '')
    )
    on conflict (user_id) do nothing;
  exception when others then
    -- never abort user signup
    null;
  end;

  begin
    -- Create digital_id record
    insert into public.digital_ids (user_id, tss_id, issued_at, expires_at, status, verification_level)
    values (
      new.id, 
      _digital_id, 
      now(), 
      (date_trunc('year', now()) + interval '2 year' - interval '1 day'), 
      'active', 
      'basic'
    )
    on conflict (user_id) do nothing;
  exception when others then
    null;
  end;

  return new;
end; $$;

-- Create trigger if not exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

alter table public.profiles enable row level security;
alter table public.digital_ids enable row level security;
alter table public.id_documents enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.user_locations enable row level security;
alter table public.safety_zones enable row level security;
alter table public.safety_alerts enable row level security;
alter table public.user_alert_interactions enable row level security;
alter table public.sos_incidents enable row level security;
alter table public.sos_incident_logs enable row level security;
alter table public.saved_routes enable row level security;
alter table public.route_usage enable row level security;
alter table public.accommodations enable row level security;
alter table public.user_accommodations enable row level security;
alter table public.user_devices enable row level security;
alter table public.notifications enable row level security;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profiles and public profiles of verified users
drop policy if exists "profiles_select_policy" on public.profiles;
create policy "profiles_select_policy" on public.profiles
  for select to authenticated using (
    user_id = auth.uid() 
    or (profile_visibility = 'public' and is_verified = true)
    or (profile_visibility = 'verified_users' and is_verified = true and exists(
      select 1 from public.profiles p where p.user_id = auth.uid() and p.is_verified = true
    ))
  );

-- Users can insert only their own profile
drop policy if exists "profiles_insert_policy" on public.profiles;
create policy "profiles_insert_policy" on public.profiles
  for insert to authenticated with check (user_id = auth.uid());

-- Users can update only their own profile
drop policy if exists "profiles_update_policy" on public.profiles;
create policy "profiles_update_policy" on public.profiles
  for update to authenticated using (user_id = auth.uid());

-- Users can delete only their own profile
drop policy if exists "profiles_delete_policy" on public.profiles;
create policy "profiles_delete_policy" on public.profiles
  for delete to authenticated using (user_id = auth.uid());

-- =====================================================
-- DIGITAL IDS POLICIES
-- =====================================================

-- Users can view their own digital IDs and verified IDs when needed for verification
drop policy if exists "digital_ids_select_policy" on public.digital_ids;
create policy "digital_ids_select_policy" on public.digital_ids
  for select to authenticated using (
    user_id = auth.uid()
    or (status = 'active' and verification_level in ('verified', 'premium'))
  );

-- Users can only modify their own digital IDs
drop policy if exists "digital_ids_modify_policy" on public.digital_ids;
create policy "digital_ids_modify_policy" on public.digital_ids
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================
-- ID DOCUMENTS POLICIES
-- =====================================================

-- Users can only access their own documents
drop policy if exists "id_documents_select_policy" on public.id_documents;
create policy "id_documents_select_policy" on public.id_documents
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "id_documents_modify_policy" on public.id_documents;
create policy "id_documents_modify_policy" on public.id_documents
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================
-- EMERGENCY CONTACTS POLICIES
-- =====================================================

-- Users can only access their own emergency contacts
drop policy if exists "emergency_contacts_select_policy" on public.emergency_contacts;
create policy "emergency_contacts_select_policy" on public.emergency_contacts
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "emergency_contacts_modify_policy" on public.emergency_contacts;
create policy "emergency_contacts_modify_policy" on public.emergency_contacts
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================
-- USER LOCATIONS POLICIES
-- =====================================================

-- Users can only access their own location data
drop policy if exists "user_locations_select_policy" on public.user_locations;
create policy "user_locations_select_policy" on public.user_locations
  for select to authenticated using (
    user_id = auth.uid() 
    or exists(
      select 1 from public.profiles p 
      where p.user_id = user_locations.user_id 
      and p.emergency_sharing = true 
      and exists(
        select 1 from public.emergency_contacts ec 
        where ec.user_id = p.user_id 
        and ec.email = (select email from public.profiles where user_id = auth.uid())
      )
    )
  );

drop policy if exists "user_locations_modify_policy" on public.user_locations;
create policy "user_locations_modify_policy" on public.user_locations
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================
-- SAFETY ZONES POLICIES (PUBLIC READ)
-- =====================================================

-- Safety zones are publicly readable
drop policy if exists "safety_zones_select_policy" on public.safety_zones;
create policy "safety_zones_select_policy" on public.safety_zones
  for select using (true);

-- Only authenticated users can suggest new zones
drop policy if exists "safety_zones_insert_policy" on public.safety_zones;
create policy "safety_zones_insert_policy" on public.safety_zones
  for insert to authenticated with check (true);

-- =====================================================
-- SAFETY ALERTS POLICIES (PUBLIC READ)
-- =====================================================

-- Safety alerts are publicly readable
drop policy if exists "safety_alerts_select_policy" on public.safety_alerts;
create policy "safety_alerts_select_policy" on public.safety_alerts
  for select using (true);

-- Authenticated users can create alerts (community reporting)
drop policy if exists "safety_alerts_insert_policy" on public.safety_alerts;
create policy "safety_alerts_insert_policy" on public.safety_alerts
  for insert to authenticated with check (true);

-- =====================================================
-- USER ALERT INTERACTIONS POLICIES
-- =====================================================

-- Users can only see their own alert interactions
drop policy if exists "user_alert_interactions_select_policy" on public.user_alert_interactions;
create policy "user_alert_interactions_select_policy" on public.user_alert_interactions
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "user_alert_interactions_modify_policy" on public.user_alert_interactions;
create policy "user_alert_interactions_modify_policy" on public.user_alert_interactions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================
-- SOS INCIDENTS POLICIES
-- =====================================================

-- Users can see their own incidents + emergency contacts can see incidents of their users
drop policy if exists "sos_incidents_select_policy" on public.sos_incidents;
create policy "sos_incidents_select_policy" on public.sos_incidents
  for select to authenticated using (
    user_id = auth.uid()
    or exists(
      select 1 from public.emergency_contacts ec 
      where ec.user_id = sos_incidents.user_id 
      and ec.email = (select email from public.profiles where user_id = auth.uid())
      and ec.is_verified = true
    )
  );

-- Users can only modify their own SOS incidents
drop policy if exists "sos_incidents_modify_policy" on public.sos_incidents;
create policy "sos_incidents_modify_policy" on public.sos_incidents
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================
-- SOS INCIDENT LOGS POLICIES
-- =====================================================

-- Users can see logs for incidents they have access to
drop policy if exists "sos_incident_logs_select_policy" on public.sos_incident_logs;
create policy "sos_incident_logs_select_policy" on public.sos_incident_logs
  for select to authenticated using (
    exists(
      select 1 from public.sos_incidents si 
      where si.id = incident_id 
      and (
        si.user_id = auth.uid()
        or exists(
          select 1 from public.emergency_contacts ec 
          where ec.user_id = si.user_id 
          and ec.email = (select email from public.profiles where user_id = auth.uid())
          and ec.is_verified = true
        )
      )
    )
  );

-- Users can insert logs for incidents they have access to
drop policy if exists "sos_incident_logs_insert_policy" on public.sos_incident_logs;
create policy "sos_incident_logs_insert_policy" on public.sos_incident_logs
  for insert to authenticated with check (
    exists(
      select 1 from public.sos_incidents si 
      where si.id = incident_id 
      and si.user_id = auth.uid()
    )
  );

-- =====================================================
-- SAVED ROUTES POLICIES
-- =====================================================

-- Users can see their own routes and public routes
drop policy if exists "saved_routes_select_policy" on public.saved_routes;
create policy "saved_routes_select_policy" on public.saved_routes
  for select to authenticated using (
    user_id = auth.uid() 
    or is_public = true
  );

-- Users can only modify their own routes
drop policy if exists "saved_routes_modify_policy" on public.saved_routes;
create policy "saved_routes_modify_policy" on public.saved_routes
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================
-- ROUTE USAGE POLICIES
-- =====================================================

-- Users can only see their own route usage
drop policy if exists "route_usage_select_policy" on public.route_usage;
create policy "route_usage_select_policy" on public.route_usage
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "route_usage_modify_policy" on public.route_usage;
create policy "route_usage_modify_policy" on public.route_usage
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================
-- ACCOMMODATIONS POLICIES (PUBLIC READ)
-- =====================================================

-- Accommodations are publicly readable
drop policy if exists "accommodations_select_policy" on public.accommodations;
create policy "accommodations_select_policy" on public.accommodations
  for select using (true);

-- Authenticated users can suggest new accommodations
drop policy if exists "accommodations_insert_policy" on public.accommodations;
create policy "accommodations_insert_policy" on public.accommodations
  for insert to authenticated with check (true);

-- =====================================================
-- USER ACCOMMODATIONS POLICIES
-- =====================================================

-- Users can only see their own accommodation interactions
drop policy if exists "user_accommodations_select_policy" on public.user_accommodations;
create policy "user_accommodations_select_policy" on public.user_accommodations
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "user_accommodations_modify_policy" on public.user_accommodations;
create policy "user_accommodations_modify_policy" on public.user_accommodations
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================
-- USER DEVICES POLICIES
-- =====================================================

-- Users can only see their own devices
drop policy if exists "user_devices_select_policy" on public.user_devices;
create policy "user_devices_select_policy" on public.user_devices
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "user_devices_modify_policy" on public.user_devices;
create policy "user_devices_modify_policy" on public.user_devices
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can only see their own notifications
drop policy if exists "notifications_select_policy" on public.notifications;
create policy "notifications_select_policy" on public.notifications
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "notifications_modify_policy" on public.notifications;
create policy "notifications_modify_policy" on public.notifications
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================
-- STORAGE BUCKET SETUP
-- =====================================================
-- Note: Storage policies should be created through Supabase Dashboard
-- or using the Supabase CLI, not via SQL

-- Create storage buckets (these can be created via SQL)
insert into storage.buckets (id, name, public)
values ('id-documents', 'id-documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('accommodation-images', 'accommodation-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('sos-photos', 'sos-photos', false)
on conflict (id) do nothing;

-- =====================================================
-- STORAGE POLICY INSTRUCTIONS
-- =====================================================
-- Storage policies must be created through the Supabase Dashboard:
-- 
-- For 'id-documents' bucket:
-- 1. Policy Name: "Users can manage own documents"
-- 2. Allowed Operations: SELECT, INSERT, UPDATE, DELETE
-- 3. Policy Definition: bucket_id = 'id-documents' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- For 'avatars' bucket:
-- 1. Policy Name: "Public read access"
-- 2. Allowed Operations: SELECT
-- 3. Policy Definition: bucket_id = 'avatars'
-- 4. Policy Name: "Users can manage own avatars"
-- 5. Allowed Operations: INSERT, UPDATE, DELETE
-- 6. Policy Definition: bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- For 'accommodation-images' bucket:
-- 1. Policy Name: "Public read access"
-- 2. Allowed Operations: SELECT
-- 3. Policy Definition: bucket_id = 'accommodation-images'
-- 4. Policy Name: "Authenticated users can upload"
-- 5. Allowed Operations: INSERT
-- 6. Policy Definition: bucket_id = 'accommodation-images'
--
-- For 'sos-photos' bucket:
-- 1. Policy Name: "Users can manage own SOS photos"
-- 2. Allowed Operations: SELECT, INSERT, UPDATE, DELETE
-- 3. Policy Definition: bucket_id = 'sos-photos' AND (storage.foldername(name))[1] = auth.uid()::text

-- =====================================================
-- HELPER VIEWS
-- =====================================================

-- Comprehensive user profile view
create or replace view public.v_user_profile as
select 
  p.user_id,
  p.full_name,
  p.email,
  p.phone,
  p.nationality,
  p.avatar_url,
  p.safety_score,
  p.is_verified,
  p.verification_level,
  p.last_seen_at,
  d.tss_id,
  d.status as digital_id_status,
  d.qr_code_url,
  d.expires_at as digital_id_expires,
  (
    select count(*) 
    from public.emergency_contacts ec 
    where ec.user_id = p.user_id
  ) as emergency_contacts_count,
  (
    select count(*) 
    from public.id_documents doc 
    where doc.user_id = p.user_id and doc.is_verified = true
  ) as verified_documents_count
from public.profiles p
left join public.digital_ids d on d.user_id = p.user_id
where p.user_id = auth.uid();

-- Active safety alerts view
create or replace view public.v_active_safety_alerts as
select 
  id,
  title,
  description,
  alert_type,
  severity,
  location_description,
  latitude,
  longitude,
  radius_meters,
  city,
  country_code,
  valid_from,
  valid_until,
  source,
  action_required,
  safety_tips,
  created_at
from public.safety_alerts
where status = 'active' 
  and (valid_until is null or valid_until > now());

-- User's current location view
create or replace view public.v_user_current_location as
select distinct on (user_id)
  user_id,
  latitude,
  longitude,
  address,
  area_name,
  city,
  country_code,
  safety_level,
  created_at as last_location_update
from public.user_locations
where user_id = auth.uid()
order by user_id, created_at desc;