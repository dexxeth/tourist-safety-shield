-- =====================================================
-- Tourist Safety Shield - Advanced Functions & Triggers
-- =====================================================
-- Business logic functions, validation triggers, and data management utilities

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to calculate distance between two points using Haversine formula
create or replace function public.calculate_distance(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
) returns double precision as $$
declare
  r double precision := 6371000; -- Earth's radius in meters
  d_lat double precision;
  d_lon double precision;
  a double precision;
  c double precision;
begin
  d_lat := radians(lat2 - lat1);
  d_lon := radians(lon2 - lon1);
  
  a := sin(d_lat / 2) * sin(d_lat / 2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(d_lon / 2) * sin(d_lon / 2);
  
  c := 2 * atan2(sqrt(a), sqrt(1 - a));
  
  return r * c;
end;
$$ language plpgsql immutable;

-- Function to check if a point is within a circle
create or replace function public.is_within_radius(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision,
  radius_meters double precision
) returns boolean as $$
begin
  return public.calculate_distance(lat1, lon1, lat2, lon2) <= radius_meters;
end;
$$ language plpgsql immutable;

-- Function to get country name from country code
create or replace function public.get_country_name(country_code text)
returns text as $$
begin
  return case upper(country_code)
    when 'AD' then 'Andorra'
    when 'AE' then 'United Arab Emirates'
    when 'AF' then 'Afghanistan'
    when 'AG' then 'Antigua and Barbuda'
    when 'AI' then 'Anguilla'
    when 'AL' then 'Albania'
    when 'AM' then 'Armenia'
    when 'AO' then 'Angola'
    when 'AQ' then 'Antarctica'
    when 'AR' then 'Argentina'
    when 'AS' then 'American Samoa'
    when 'AT' then 'Austria'
    when 'AU' then 'Australia'
    when 'AW' then 'Aruba'
    when 'AX' then 'Åland Islands'
    when 'AZ' then 'Azerbaijan'
    when 'BA' then 'Bosnia and Herzegovina'
    when 'BB' then 'Barbados'
    when 'BD' then 'Bangladesh'
    when 'BE' then 'Belgium'
    when 'BF' then 'Burkina Faso'
    when 'BG' then 'Bulgaria'
    when 'BH' then 'Bahrain'
    when 'BI' then 'Burundi'
    when 'BJ' then 'Benin'
    when 'BL' then 'Saint Barthélemy'
    when 'BM' then 'Bermuda'
    when 'BN' then 'Brunei'
    when 'BO' then 'Bolivia'
    when 'BQ' then 'Caribbean Netherlands'
    when 'BR' then 'Brazil'
    when 'BS' then 'Bahamas'
    when 'BT' then 'Bhutan'
    when 'BV' then 'Bouvet Island'
    when 'BW' then 'Botswana'
    when 'BY' then 'Belarus'
    when 'BZ' then 'Belize'
    when 'CA' then 'Canada'
    when 'CC' then 'Cocos (Keeling) Islands'
    when 'CD' then 'Democratic Republic of the Congo'
    when 'CF' then 'Central African Republic'
    when 'CG' then 'Republic of the Congo'
    when 'CH' then 'Switzerland'
    when 'CI' then 'Côte d''Ivoire'
    when 'CK' then 'Cook Islands'
    when 'CL' then 'Chile'
    when 'CM' then 'Cameroon'
    when 'CN' then 'China'
    when 'CO' then 'Colombia'
    when 'CR' then 'Costa Rica'
    when 'CU' then 'Cuba'
    when 'CV' then 'Cape Verde'
    when 'CW' then 'Curaçao'
    when 'CX' then 'Christmas Island'
    when 'CY' then 'Cyprus'
    when 'CZ' then 'Czech Republic'
    when 'DE' then 'Germany'
    when 'DJ' then 'Djibouti'
    when 'DK' then 'Denmark'
    when 'DM' then 'Dominica'
    when 'DO' then 'Dominican Republic'
    when 'DZ' then 'Algeria'
    when 'EC' then 'Ecuador'
    when 'EE' then 'Estonia'
    when 'EG' then 'Egypt'
    when 'EH' then 'Western Sahara'
    when 'ER' then 'Eritrea'
    when 'ES' then 'Spain'
    when 'ET' then 'Ethiopia'
    when 'FI' then 'Finland'
    when 'FJ' then 'Fiji'
    when 'FK' then 'Falkland Islands'
    when 'FM' then 'Micronesia'
    when 'FO' then 'Faroe Islands'
    when 'FR' then 'France'
    when 'GA' then 'Gabon'
    when 'GB' then 'United Kingdom'
    when 'GD' then 'Grenada'
    when 'GE' then 'Georgia'
    when 'GF' then 'French Guiana'
    when 'GG' then 'Guernsey'
    when 'GH' then 'Ghana'
    when 'GI' then 'Gibraltar'
    when 'GL' then 'Greenland'
    when 'GM' then 'Gambia'
    when 'GN' then 'Guinea'
    when 'GP' then 'Guadeloupe'
    when 'GQ' then 'Equatorial Guinea'
    when 'GR' then 'Greece'
    when 'GS' then 'South Georgia and the South Sandwich Islands'
    when 'GT' then 'Guatemala'
    when 'GU' then 'Guam'
    when 'GW' then 'Guinea-Bissau'
    when 'GY' then 'Guyana'
    when 'HK' then 'Hong Kong'
    when 'HM' then 'Heard Island and McDonald Islands'
    when 'HN' then 'Honduras'
    when 'HR' then 'Croatia'
    when 'HT' then 'Haiti'
    when 'HU' then 'Hungary'
    when 'ID' then 'Indonesia'
    when 'IE' then 'Ireland'
    when 'IL' then 'Israel'
    when 'IM' then 'Isle of Man'
    when 'IN' then 'India'
    when 'IO' then 'British Indian Ocean Territory'
    when 'IQ' then 'Iraq'
    when 'IR' then 'Iran'
    when 'IS' then 'Iceland'
    when 'IT' then 'Italy'
    when 'JE' then 'Jersey'
    when 'JM' then 'Jamaica'
    when 'JO' then 'Jordan'
    when 'JP' then 'Japan'
    when 'KE' then 'Kenya'
    when 'KG' then 'Kyrgyzstan'
    when 'KH' then 'Cambodia'
    when 'KI' then 'Kiribati'
    when 'KM' then 'Comoros'
    when 'KN' then 'Saint Kitts and Nevis'
    when 'KP' then 'North Korea'
    when 'KR' then 'South Korea'
    when 'KW' then 'Kuwait'
    when 'KY' then 'Cayman Islands'
    when 'KZ' then 'Kazakhstan'
    when 'LA' then 'Laos'
    when 'LB' then 'Lebanon'
    when 'LC' then 'Saint Lucia'
    when 'LI' then 'Liechtenstein'
    when 'LK' then 'Sri Lanka'
    when 'LR' then 'Liberia'
    when 'LS' then 'Lesotho'
    when 'LT' then 'Lithuania'
    when 'LU' then 'Luxembourg'
    when 'LV' then 'Latvia'
    when 'LY' then 'Libya'
    when 'MA' then 'Morocco'
    when 'MC' then 'Monaco'
    when 'MD' then 'Moldova'
    when 'ME' then 'Montenegro'
    when 'MF' then 'Saint Martin'
    when 'MG' then 'Madagascar'
    when 'MH' then 'Marshall Islands'
    when 'MK' then 'North Macedonia'
    when 'ML' then 'Mali'
    when 'MM' then 'Myanmar'
    when 'MN' then 'Mongolia'
    when 'MO' then 'Macao'
    when 'MP' then 'Northern Mariana Islands'
    when 'MQ' then 'Martinique'
    when 'MR' then 'Mauritania'
    when 'MS' then 'Montserrat'
    when 'MT' then 'Malta'
    when 'MU' then 'Mauritius'
    when 'MV' then 'Maldives'
    when 'MW' then 'Malawi'
    when 'MX' then 'Mexico'
    when 'MY' then 'Malaysia'
    when 'MZ' then 'Mozambique'
    when 'NA' then 'Namibia'
    when 'NC' then 'New Caledonia'
    when 'NE' then 'Niger'
    when 'NF' then 'Norfolk Island'
    when 'NG' then 'Nigeria'
    when 'NI' then 'Nicaragua'
    when 'NL' then 'Netherlands'
    when 'NO' then 'Norway'
    when 'NP' then 'Nepal'
    when 'NR' then 'Nauru'
    when 'NU' then 'Niue'
    when 'NZ' then 'New Zealand'
    when 'OM' then 'Oman'
    when 'PA' then 'Panama'
    when 'PE' then 'Peru'
    when 'PF' then 'French Polynesia'
    when 'PG' then 'Papua New Guinea'
    when 'PH' then 'Philippines'
    when 'PK' then 'Pakistan'
    when 'PL' then 'Poland'
    when 'PM' then 'Saint Pierre and Miquelon'
    when 'PN' then 'Pitcairn'
    when 'PR' then 'Puerto Rico'
    when 'PS' then 'Palestine'
    when 'PT' then 'Portugal'
    when 'PW' then 'Palau'
    when 'PY' then 'Paraguay'
    when 'QA' then 'Qatar'
    when 'RE' then 'Réunion'
    when 'RO' then 'Romania'
    when 'RS' then 'Serbia'
    when 'RU' then 'Russia'
    when 'RW' then 'Rwanda'
    when 'SA' then 'Saudi Arabia'
    when 'SB' then 'Solomon Islands'
    when 'SC' then 'Seychelles'
    when 'SD' then 'Sudan'
    when 'SE' then 'Sweden'
    when 'SG' then 'Singapore'
    when 'SH' then 'Saint Helena'
    when 'SI' then 'Slovenia'
    when 'SJ' then 'Svalbard and Jan Mayen'
    when 'SK' then 'Slovakia'
    when 'SL' then 'Sierra Leone'
    when 'SM' then 'San Marino'
    when 'SN' then 'Senegal'
    when 'SO' then 'Somalia'
    when 'SR' then 'Suriname'
    when 'SS' then 'South Sudan'
    when 'ST' then 'São Tomé and Príncipe'
    when 'SV' then 'El Salvador'
    when 'SX' then 'Sint Maarten'
    when 'SY' then 'Syria'
    when 'SZ' then 'Eswatini'
    when 'TC' then 'Turks and Caicos Islands'
    when 'TD' then 'Chad'
    when 'TF' then 'French Southern Territories'
    when 'TG' then 'Togo'
    when 'TH' then 'Thailand'
    when 'TJ' then 'Tajikistan'
    when 'TK' then 'Tokelau'
    when 'TL' then 'Timor-Leste'
    when 'TM' then 'Turkmenistan'
    when 'TN' then 'Tunisia'
    when 'TO' then 'Tonga'
    when 'TR' then 'Turkey'
    when 'TT' then 'Trinidad and Tobago'
    when 'TV' then 'Tuvalu'
    when 'TW' then 'Taiwan'
    when 'TZ' then 'Tanzania'
    when 'UA' then 'Ukraine'
    when 'UG' then 'Uganda'
    when 'UM' then 'United States Minor Outlying Islands'
    when 'US' then 'United States'
    when 'UY' then 'Uruguay'
    when 'UZ' then 'Uzbekistan'
    when 'VA' then 'Vatican City'
    when 'VC' then 'Saint Vincent and the Grenadines'
    when 'VE' then 'Venezuela'
    when 'VG' then 'British Virgin Islands'
    when 'VI' then 'U.S. Virgin Islands'
    when 'VN' then 'Vietnam'
    when 'VU' then 'Vanuatu'
    when 'WF' then 'Wallis and Futuna'
    when 'WS' then 'Samoa'
    when 'YE' then 'Yemen'
    when 'YT' then 'Mayotte'
    when 'ZA' then 'South Africa'
    when 'ZM' then 'Zambia'
    when 'ZW' then 'Zimbabwe'
    else 'Unknown'
  end;
end;
$$ language plpgsql immutable;

-- =====================================================
-- SAFETY SCORING FUNCTIONS
-- =====================================================

-- Calculate comprehensive safety score for a user
create or replace function public.calculate_user_safety_score(p_user_id uuid)
returns decimal(5,2) as $$
declare
  base_score decimal(5,2) := 50.0;
  verification_bonus decimal(5,2) := 0.0;
  document_bonus decimal(5,2) := 0.0;
  emergency_contact_bonus decimal(5,2) := 0.0;
  activity_bonus decimal(5,2) := 0.0;
  recent_incident_penalty decimal(5,2) := 0.0;
  location_tracking_bonus decimal(5,2) := 0.0;
  final_score decimal(5,2);
begin
  -- Verification level bonus
  select case verification_level
    when 'basic' then 10.0
    when 'verified' then 25.0
    when 'premium' then 40.0
    else 0.0
  end into verification_bonus
  from public.profiles
  where user_id = p_user_id;

  -- Document verification bonus
  select count(*) * 5.0 into document_bonus
  from public.id_documents
  where user_id = p_user_id and is_verified = true;

  -- Emergency contacts bonus
  select least(count(*) * 3.0, 15.0) into emergency_contact_bonus
  from public.emergency_contacts
  where user_id = p_user_id and is_verified = true;

  -- Recent location tracking bonus
  select case when count(*) > 0 then 5.0 else 0.0 end into location_tracking_bonus
  from public.user_locations
  where user_id = p_user_id 
    and created_at > now() - interval '7 days';

  -- Recent SOS incident penalty
  select count(*) * 10.0 into recent_incident_penalty
  from public.sos_incidents
  where user_id = p_user_id 
    and created_at > now() - interval '30 days'
    and status in ('active', 'escalated');

  -- Calculate final score
  final_score := base_score + verification_bonus + document_bonus + 
                 emergency_contact_bonus + location_tracking_bonus - recent_incident_penalty;

  -- Ensure score is within bounds
  final_score := greatest(0.0, least(100.0, final_score));

  return final_score;
end;
$$ language plpgsql;

-- Calculate safety score for a location
create or replace function public.calculate_location_safety_score(
  p_latitude double precision,
  p_longitude double precision,
  p_radius_meters double precision default 1000
) returns decimal(5,2) as $$
declare
  base_score decimal(5,2) := 70.0;
  alert_penalty decimal(5,2) := 0.0;
  incident_penalty decimal(5,2) := 0.0;
  safe_zone_bonus decimal(5,2) := 0.0;
  final_score decimal(5,2);
begin
  -- Active safety alert penalty
  select count(*) * 
    case 
      when severity = 'critical' then 20.0
      when severity = 'high' then 15.0
      when severity = 'medium' then 10.0
      when severity = 'low' then 5.0
      else 0.0
    end into alert_penalty
  from public.safety_alerts
  where status = 'active'
    and (valid_until is null or valid_until > now())
    and public.is_within_radius(p_latitude, p_longitude, latitude, longitude, coalesce(radius_meters, p_radius_meters));

  -- Recent SOS incident penalty
  select count(*) * 5.0 into incident_penalty
  from public.sos_incidents
  where created_at > now() - interval '30 days'
    and status in ('active', 'escalated', 'resolved')
    and public.is_within_radius(p_latitude, p_longitude, latitude, longitude, p_radius_meters);

  -- Safe zone bonus
  select case when count(*) > 0 then 15.0 else 0.0 end into safe_zone_bonus
  from public.safety_zones
  where zone_type = 'safe'
    and public.is_within_radius(p_latitude, p_longitude, latitude, longitude, radius_meters);

  -- Calculate final score
  final_score := base_score + safe_zone_bonus - alert_penalty - incident_penalty;

  -- Ensure score is within bounds
  final_score := greatest(0.0, least(100.0, final_score));

  return final_score;
end;
$$ language plpgsql;

-- =====================================================
-- NOTIFICATION FUNCTIONS
-- =====================================================

-- Send notification to user
create or replace function public.send_notification(
  p_user_id uuid,
  p_type notification_type,
  p_title text,
  p_message text,
  p_data jsonb default null,
  p_send_push boolean default true,
  p_send_email boolean default false
) returns uuid as $$
declare
  notification_id uuid;
begin
  insert into public.notifications (
    user_id, type, title, message, data, send_push, send_email
  ) values (
    p_user_id, p_type, p_title, p_message, p_data, p_send_push, p_send_email
  ) returning id into notification_id;

  return notification_id;
end;
$$ language plpgsql;

-- Send notification to emergency contacts
create or replace function public.notify_emergency_contacts(
  p_user_id uuid,
  p_type notification_type,
  p_title text,
  p_message text,
  p_data jsonb default null
) returns void as $$
declare
  contact_record record;
  contact_user_id uuid;
begin
  for contact_record in 
    select ec.email, ec.phone, ec.relationship 
    from public.emergency_contacts ec
    where ec.user_id = p_user_id and ec.is_verified = true
  loop
    -- Try to find user by email to send in-app notification
    select p.user_id into contact_user_id
    from public.profiles p
    where p.email = contact_record.email;

    if contact_user_id is not null then
      perform public.send_notification(
        contact_user_id,
        p_type,
        p_title,
        p_message,
        p_data,
        true, -- send push
        true  -- send email
      );
    end if;
  end loop;
end;
$$ language plpgsql;

-- =====================================================
-- SOS INCIDENT MANAGEMENT
-- =====================================================

-- Auto-escalate SOS incidents
create or replace function public.escalate_sos_incident(p_incident_id uuid)
returns void as $$
declare
  incident_record record;
begin
  select * into incident_record
  from public.sos_incidents
  where id = p_incident_id;

  if incident_record.status = 'active' and 
     incident_record.created_at < now() - interval '15 minutes' then
    
    -- Update incident status
    update public.sos_incidents
    set status = 'escalated',
        escalated_at = now()
    where id = p_incident_id;

    -- Log escalation
    insert into public.sos_incident_logs (incident_id, log_type, message)
    values (p_incident_id, 'escalation', 'Incident auto-escalated after 15 minutes of inactivity');

    -- Notify emergency contacts
    perform public.notify_emergency_contacts(
      incident_record.user_id,
      'emergency'::notification_type,
      'URGENT: Emergency Escalated',
      format('Emergency incident for %s has been escalated. Last known location: %s', 
             (select full_name from public.profiles where user_id = incident_record.user_id),
             incident_record.location_description),
      jsonb_build_object(
        'incident_id', p_incident_id,
        'latitude', incident_record.latitude,
        'longitude', incident_record.longitude,
        'incident_type', incident_record.incident_type
      )
    );
  end if;
end;
$$ language plpgsql;

-- =====================================================
-- DATA VALIDATION TRIGGERS
-- =====================================================

-- Trigger to update safety score when profile data changes
create or replace function public.update_user_safety_score_trigger()
returns trigger as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    update public.profiles
    set safety_score = public.calculate_user_safety_score(NEW.user_id),
        updated_at = now()
    where user_id = NEW.user_id;
    return NEW;
  end if;
  return null;
end;
$$ language plpgsql;

-- Apply safety score update triggers
drop trigger if exists profiles_safety_score_update on public.profiles;
create trigger profiles_safety_score_update
  after insert or update on public.profiles
  for each row execute function public.update_user_safety_score_trigger();

drop trigger if exists digital_ids_safety_score_update on public.digital_ids;
create trigger digital_ids_safety_score_update
  after insert or update on public.digital_ids
  for each row execute function public.update_user_safety_score_trigger();

drop trigger if exists id_documents_safety_score_update on public.id_documents;
create trigger id_documents_safety_score_update
  after insert or update on public.id_documents
  for each row execute function public.update_user_safety_score_trigger();

drop trigger if exists emergency_contacts_safety_score_update on public.emergency_contacts;
create trigger emergency_contacts_safety_score_update
  after insert or update or delete on public.emergency_contacts
  for each row execute function public.update_user_safety_score_trigger();

-- Trigger to calculate location safety score on location insert
create or replace function public.calculate_location_safety_trigger()
returns trigger as $$
begin
  NEW.safety_level := public.calculate_location_safety_score(NEW.latitude, NEW.longitude);
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists user_locations_safety_calculation on public.user_locations;
create trigger user_locations_safety_calculation
  before insert on public.user_locations
  for each row execute function public.calculate_location_safety_trigger();

-- Trigger to automatically escalate SOS incidents
create or replace function public.auto_escalate_sos_trigger()
returns trigger as $$
begin
  -- Schedule escalation check in 15 minutes (using pg_cron or similar)
  -- For now, we'll just log that escalation should be checked
  insert into public.sos_incident_logs (incident_id, log_type, message)
  values (NEW.id, 'system', 'Incident created - escalation scheduled for 15 minutes');
  
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists sos_incidents_auto_escalate on public.sos_incidents;
create trigger sos_incidents_auto_escalate
  after insert on public.sos_incidents
  for each row execute function public.auto_escalate_sos_trigger();

-- Trigger to notify emergency contacts on SOS incident creation
create or replace function public.notify_emergency_on_sos_trigger()
returns trigger as $$
begin
  if NEW.status = 'active' then
    perform public.notify_emergency_contacts(
      NEW.user_id,
      'emergency'::notification_type,
      'URGENT: Emergency Alert',
      format('Emergency incident reported by %s. Type: %s. Location: %s', 
             (select full_name from public.profiles where user_id = NEW.user_id),
             NEW.incident_type,
             NEW.location_description),
      jsonb_build_object(
        'incident_id', NEW.id,
        'latitude', NEW.latitude,
        'longitude', NEW.longitude,
        'incident_type', NEW.incident_type
      )
    );
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists sos_incidents_notify_emergency on public.sos_incidents;
create trigger sos_incidents_notify_emergency
  after insert on public.sos_incidents
  for each row execute function public.notify_emergency_on_sos_trigger();

-- =====================================================
-- CLEANUP FUNCTIONS
-- =====================================================

-- Function to clean up old data
create or replace function public.cleanup_old_data()
returns void as $$
begin
  -- Delete old location data (older than 90 days)
  delete from public.user_locations
  where created_at < now() - interval '90 days';

  -- Delete old resolved SOS incidents (older than 1 year)
  delete from public.sos_incidents
  where status = 'resolved' 
    and updated_at < now() - interval '1 year';

  -- Delete old read notifications (older than 30 days)
  delete from public.notifications
  where is_read = true 
    and created_at < now() - interval '30 days';

  -- Delete expired safety alerts
  delete from public.safety_alerts
  where valid_until is not null 
    and valid_until < now() - interval '7 days';

  -- Update last_seen_at for profiles based on recent location data
  update public.profiles
  set last_seen_at = (
    select max(created_at)
    from public.user_locations
    where user_id = profiles.user_id
  )
  where last_seen_at < now() - interval '1 day';
end;
$$ language plpgsql;

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Get user activity summary
create or replace function public.get_user_activity_summary(p_user_id uuid)
returns jsonb as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'total_locations', (
      select count(*) from public.user_locations where user_id = p_user_id
    ),
    'recent_locations_7d', (
      select count(*) from public.user_locations 
      where user_id = p_user_id and created_at > now() - interval '7 days'
    ),
    'total_routes_saved', (
      select count(*) from public.saved_routes where user_id = p_user_id
    ),
    'total_sos_incidents', (
      select count(*) from public.sos_incidents where user_id = p_user_id
    ),
    'active_sos_incidents', (
      select count(*) from public.sos_incidents 
      where user_id = p_user_id and status in ('active', 'escalated')
    ),
    'safety_alerts_interacted', (
      select count(*) from public.user_alert_interactions where user_id = p_user_id
    ),
    'accommodations_bookmarked', (
      select count(*) from public.user_accommodations 
      where user_id = p_user_id and interaction_type = 'bookmarked'
    ),
    'emergency_contacts_count', (
      select count(*) from public.emergency_contacts where user_id = p_user_id
    ),
    'verified_emergency_contacts', (
      select count(*) from public.emergency_contacts 
      where user_id = p_user_id and is_verified = true
    ),
    'account_created', (
      select created_at from public.profiles where user_id = p_user_id
    ),
    'last_activity', (
      select greatest(
        coalesce((select max(created_at) from public.user_locations where user_id = p_user_id), '1970-01-01'::timestamp),
        coalesce((select max(created_at) from public.sos_incidents where user_id = p_user_id), '1970-01-01'::timestamp),
        coalesce((select max(created_at) from public.user_alert_interactions where user_id = p_user_id), '1970-01-01'::timestamp)
      )
    )
  ) into result;

  return result;
end;
$$ language plpgsql;

-- =====================================================
-- SEARCH FUNCTIONS
-- =====================================================

-- Search accommodations with filters
create or replace function public.search_accommodations(
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_radius_meters double precision default 10000,
  p_accommodation_type accommodation_type default null,
  p_price_range text default null,
  p_min_rating decimal default null,
  p_limit integer default 50
) returns table (
  id uuid,
  name text,
  accommodation_type accommodation_type,
  address text,
  city text,
  country_code text,
  latitude double precision,
  longitude double precision,
  distance_meters double precision,
  average_rating decimal,
  total_reviews integer,
  price_range text,
  amenities text[],
  is_verified boolean,
  safety_features text[],
  emergency_contacts jsonb
) as $$
begin
  return query
  select 
    a.id,
    a.name,
    a.accommodation_type,
    a.address,
    a.city,
    a.country_code,
    a.latitude,
    a.longitude,
    case 
      when p_latitude is not null and p_longitude is not null 
      then public.calculate_distance(p_latitude, p_longitude, a.latitude, a.longitude)
      else null
    end as distance_meters,
    a.average_rating,
    a.total_reviews,
    a.price_range,
    a.amenities,
    a.is_verified,
    a.safety_features,
    a.emergency_contacts
  from public.accommodations a
  where 
    (p_accommodation_type is null or a.accommodation_type = p_accommodation_type)
    and (p_price_range is null or a.price_range = p_price_range)
    and (p_min_rating is null or a.average_rating >= p_min_rating)
    and (
      p_latitude is null or p_longitude is null or
      public.is_within_radius(p_latitude, p_longitude, a.latitude, a.longitude, p_radius_meters)
    )
  order by 
    case 
      when p_latitude is not null and p_longitude is not null 
      then public.calculate_distance(p_latitude, p_longitude, a.latitude, a.longitude)
      else a.average_rating
    end desc
  limit p_limit;
end;
$$ language plpgsql;