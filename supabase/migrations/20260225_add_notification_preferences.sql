-- Migration: Add notification_preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "appointment_confirmation": true,
  "appointment_cancellation": true,
  "new_patient": false,
  "empty_schedule": true,
  "weekly_report": false,
  "overdue_payment": true
}'::jsonb;

-- Update RLS if necessary (though profiles already has RLS for the owner)
COMMENT ON COLUMN public.profiles.notification_preferences IS 'Stores user notification preferences as a JSON object.';
