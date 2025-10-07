-- =====================================================
-- Tourist Safety Shield - Sample Data for Development
-- =====================================================
-- Insert sample data for testing and development purposes
-- This file should only be run in development environments

-- =====================================================
-- SAFETY ZONES SAMPLE DATA
-- =====================================================

-- Insert sample safe zones in major tourist destinations
insert into public.safety_zones (name, zone_type, description, latitude, longitude, radius_meters, city, country_code, features, active_hours) values
-- London, UK
('London Eye Area', 'safe', 'Well-patrolled tourist area with high security presence', 51.5033, -0.1196, 500, 'London', 'GB', array['cctv', 'police_patrol', 'tourist_police'], jsonb_build_object('start', '06:00', 'end', '23:00')),
('Tower Bridge District', 'safe', 'Historic area with constant security monitoring', 51.5055, -0.0754, 400, 'London', 'GB', array['cctv', 'security_guards', 'emergency_phones'], jsonb_build_object('start', '24h', 'end', '24h')),

-- Paris, France
('Champs-Élysées District', 'safe', 'Major tourist avenue with heavy police presence', 48.8698, 2.3076, 800, 'Paris', 'FR', array['cctv', 'police_patrol', 'tourist_police'], jsonb_build_object('start', '06:00', 'end', '02:00')),
('Louvre Museum Area', 'safe', 'Museum district with comprehensive security', 48.8606, 2.3376, 600, 'Paris', 'FR', array['cctv', 'security_guards', 'emergency_phones'], jsonb_build_object('start', '09:00', 'end', '18:00')),

-- New York, USA
('Times Square', 'safe', 'High-traffic tourist area with NYPD presence', 40.7580, -73.9855, 300, 'New York', 'US', array['cctv', 'police_patrol', 'emergency_phones'], jsonb_build_object('start', '24h', 'end', '24h')),
('Central Park South', 'safe', 'Well-maintained park area with regular patrols', 40.7686, -73.9789, 1000, 'New York', 'US', array['park_rangers', 'cctv', 'emergency_phones'], jsonb_build_object('start', '06:00', 'end', '21:00')),

-- Tokyo, Japan
('Shibuya Crossing Area', 'safe', 'Busy intersection with excellent safety record', 35.6598, 139.7006, 400, 'Tokyo', 'JP', array['cctv', 'police_patrol', 'emergency_phones'], jsonb_build_object('start', '24h', 'end', '24h')),
('Asakusa Temple District', 'safe', 'Traditional area with good security infrastructure', 35.7148, 139.7967, 500, 'Tokyo', 'JP', array['cctv', 'security_guards', 'tourist_police'], jsonb_build_object('start', '06:00', 'end', '22:00'))

on conflict do nothing;

-- Insert some warning zones
insert into public.safety_zones (name, zone_type, description, latitude, longitude, radius_meters, city, country_code, features, active_hours) values
('Construction Zone - Oxford Street', 'warning', 'Ongoing construction work - pedestrian detours in place', 51.5154, -0.1423, 200, 'London', 'GB', array['construction'], jsonb_build_object('start', '07:00', 'end', '18:00')),
('High Crime Area - 14th Street', 'warning', 'Increased petty crime reported in this area', 40.7370, -73.9903, 300, 'New York', 'US', array['police_patrol'], jsonb_build_object('start', '22:00', 'end', '06:00'))
on conflict do nothing;

-- =====================================================
-- SAFETY ALERTS SAMPLE DATA
-- =====================================================

-- Insert sample safety alerts
insert into public.safety_alerts (title, description, alert_type, severity, location_description, latitude, longitude, radius_meters, city, country_code, valid_from, valid_until, source, action_required, safety_tips) values
('Tube Strike - Central London', 'London Underground strikes affecting Central, Northern, and Piccadilly lines', 'transportation', 'medium', 'Central London Underground Network', 51.5074, -0.1278, 5000, 'London', 'GB', now(), now() + interval '2 days', 'Transport for London', true, array['Use bus services', 'Allow extra travel time', 'Check TfL website for updates']),

('Heavy Rain Warning', 'Severe weather warning issued for Paris region', 'weather', 'high', 'Paris Metropolitan Area', 48.8566, 2.3522, 10000, 'Paris', 'FR', now(), now() + interval '1 day', 'Météo-France', false, array['Carry umbrella', 'Avoid outdoor activities', 'Watch for flooding in low areas']),

('Street Festival - Traffic Disruption', 'Annual street festival causing road closures in Shibuya', 'event', 'low', 'Shibuya District', 35.6598, 139.7006, 1000, 'Tokyo', 'JP', now(), now() + interval '3 days', 'Tokyo Metropolitan Government', false, array['Use alternative routes', 'Extra crowds expected', 'Public transport recommended']),

('Pickpocket Alert', 'Increased pickpocket activity reported near tourist attractions', 'security', 'medium', 'Times Square Area', 40.7580, -73.9855, 500, 'New York', 'US', now() - interval '1 day', now() + interval '7 days', 'NYPD', true, array['Keep valuables secure', 'Be aware of surroundings', 'Report suspicious activity'])

on conflict do nothing;

-- =====================================================
-- ACCOMMODATIONS SAMPLE DATA
-- =====================================================

-- Insert sample accommodations
insert into public.accommodations (name, accommodation_type, description, address, city, country_code, latitude, longitude, phone, email, website, average_rating, total_reviews, price_range, amenities, is_verified, safety_features, emergency_contacts, check_in_time, check_out_time) values
-- London Hotels
('The Premier London Hotel', 'hotel', 'Luxury hotel in heart of London with exceptional safety standards', '123 Regent Street, London', 'London', 'GB', 51.5154, -0.1423, '+44 20 7123 4567', 'info@premierlondon.com', 'https://premierlondon.com', 4.5, 1250, '£150-300', array['wifi', 'restaurant', 'gym', 'spa', 'room_service', 'concierge'], true, array['24h_security', 'cctv', 'safe_deposit', 'emergency_exits', 'fire_safety'], jsonb_build_object('phone', '+44 20 7123 4567', 'emergency', '999'), '15:00', '11:00'),

('Cozy London B&B', 'bed_and_breakfast', 'Family-run B&B near Hyde Park', '45 Sussex Gardens, London', 'London', 'GB', 51.5129, -0.1634, '+44 20 7987 6543', 'stay@cozylondonbb.com', 'https://cozylondonbb.com', 4.2, 342, '£80-150', array['wifi', 'breakfast', 'garden'], true, array['smoke_detectors', 'emergency_exits', 'first_aid'], jsonb_build_object('phone', '+44 20 7987 6543', 'emergency', '999'), '14:00', '10:00'),

-- Paris Hotels
('Hotel Lumière Paris', 'hotel', 'Boutique hotel near the Louvre with modern security', '78 Rue de Rivoli, Paris', 'Paris', 'FR', 48.8584, 2.3373, '+33 1 42 12 34 56', 'contact@hotellumiere.fr', 'https://hotellumiere.fr', 4.3, 897, '€120-250', array['wifi', 'restaurant', 'bar', 'concierge', 'room_service'], true, array['24h_security', 'cctv', 'safe_deposit', 'key_card_access'], jsonb_build_object('phone', '+33 1 42 12 34 56', 'emergency', '112'), '15:00', '12:00'),

-- New York Hotels
('Manhattan Safety Inn', 'hotel', 'Security-focused hotel in Midtown Manhattan', '456 W 42nd Street, New York', 'New York', 'US', 40.7589, -73.9851, '+1 212 555 0123', 'info@manhattansafetyinn.com', 'https://manhattansafetyinn.com', 4.1, 1542, '$200-400', array['wifi', 'gym', 'restaurant', 'business_center'], true, array['24h_security', 'cctv', 'safe_deposit', 'key_card_access', 'security_guards'], jsonb_build_object('phone', '+1 212 555 0123', 'emergency', '911'), '16:00', '11:00'),

-- Tokyo Hotels
('Tokyo Safe Haven Hotel', 'hotel', 'Modern hotel with excellent safety record in Shibuya', '1-2-3 Shibuya, Tokyo', 'Tokyo', 'JP', 35.6580, 139.7016, '+81 3 1234 5678', 'info@tokyosafehaven.jp', 'https://tokyosafehaven.jp', 4.6, 1123, '¥15000-30000', array['wifi', 'restaurant', 'spa', 'concierge', 'multilingual_staff'], true, array['24h_security', 'cctv', 'earthquake_safety', 'emergency_kits'], jsonb_build_object('phone', '+81 3 1234 5678', 'emergency', '110'), '15:00', '11:00'),

-- Budget accommodations
('Backpacker Central Hostel', 'hostel', 'Safe and social hostel for budget travelers', '789 Youth Street, London', 'London', 'GB', 51.5205, -0.1167, '+44 20 7456 7890', 'hello@backpackercentral.com', 'https://backpackercentral.com', 4.0, 2341, '£25-60', array['wifi', 'kitchen', 'lounge', 'laundry'], true, array['lockers', 'cctv', 'key_card_access', '24h_reception'], jsonb_build_object('phone', '+44 20 7456 7890', 'emergency', '999'), '15:00', '10:00'),

('Paris Youth Hostel', 'hostel', 'Modern hostel in safe neighborhood', '12 Rue des Jeunes, Paris', 'Paris', 'FR', 48.8534, 2.3488, '+33 1 45 67 89 01', 'info@parisyouth.fr', 'https://parisyouth.fr', 3.9, 1876, '€30-70', array['wifi', 'kitchen', 'lounge', 'bike_rental'], true, array['lockers', 'cctv', 'emergency_exits'], jsonb_build_object('phone', '+33 1 45 67 89 01', 'emergency', '112'), '14:00', '10:00')

on conflict do nothing;

-- =====================================================
-- SAMPLE ROUTES
-- =====================================================

-- Note: Sample routes would be inserted here, but they require user_id references
-- These would typically be created after user registration in a real application

-- =====================================================
-- DEVELOPMENT UTILITIES
-- =====================================================

-- Function to create a test user with complete profile
create or replace function public.create_test_user(
  p_email text,
  p_full_name text,
  p_nationality text default 'US'
) returns uuid as $$
declare
  user_id uuid := gen_random_uuid();
  digital_id_text text := public.generate_tss_digital_id();
begin
  -- Insert profile
  insert into public.profiles (user_id, full_name, email, nationality, safety_score, is_verified, verification_level)
  values (user_id, p_full_name, p_email, p_nationality, 75.0, true, 'verified');

  -- Insert digital ID
  insert into public.digital_ids (user_id, tss_id, issued_at, expires_at, status, verification_level)
  values (user_id, digital_id_text, now(), now() + interval '2 years', 'active', 'verified');

  -- Insert emergency contact
  insert into public.emergency_contacts (user_id, name, relationship, email, phone, is_verified)
  values (user_id, 'Emergency Contact', 'family', 'emergency@example.com', '+1234567890', true);

  -- Insert sample location
  insert into public.user_locations (user_id, latitude, longitude, address, city, country_code)
  values (user_id, 51.5074, -0.1278, 'London, UK', 'London', 'GB');

  return user_id;
end;
$$ language plpgsql;

-- Function to clean up test data
create or replace function public.cleanup_test_data()
returns void as $$
begin
  -- Delete test users (those with emails containing 'test' or 'example')
  delete from public.profiles 
  where email like '%test%' or email like '%example%';
  
  -- Note: Cascading deletes will handle related data
end;
$$ language plpgsql;

-- =====================================================
-- DATA VALIDATION
-- =====================================================

-- Function to validate data integrity
create or replace function public.validate_data_integrity()
returns table(table_name text, issue text, count bigint) as $$
begin
  -- Check for profiles without digital IDs
  return query
  select 'profiles'::text, 'Missing digital_id'::text, count(*)
  from public.profiles p
  left join public.digital_ids d on d.user_id = p.user_id
  where d.user_id is null;

  -- Check for digital IDs without profiles
  return query
  select 'digital_ids'::text, 'Missing profile'::text, count(*)
  from public.digital_ids d
  left join public.profiles p on p.user_id = d.user_id
  where p.user_id is null;

  -- Check for expired digital IDs that are still active
  return query
  select 'digital_ids'::text, 'Expired but active'::text, count(*)
  from public.digital_ids
  where expires_at < now() and status = 'active';

  -- Check for SOS incidents without logs
  return query
  select 'sos_incidents'::text, 'Missing initial log'::text, count(*)
  from public.sos_incidents s
  left join public.sos_incident_logs l on l.incident_id = s.id
  where l.incident_id is null;

  -- Check for invalid location coordinates
  return query
  select 'user_locations'::text, 'Invalid coordinates'::text, count(*)
  from public.user_locations
  where latitude is null or longitude is null 
     or latitude < -90 or latitude > 90
     or longitude < -180 or longitude > 180;
end;
$$ language plpgsql;