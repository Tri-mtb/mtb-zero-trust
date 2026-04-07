-- Migration: AI Feedback Loop
-- Add admin_feedback column to access_logs

ALTER TABLE public.access_logs 
ADD COLUMN IF NOT EXISTS admin_feedback text 
CHECK (admin_feedback IN ('confirmed_threat', 'marked_safe'));

-- Additional indices for fast querying the lists (optional)
CREATE INDEX IF NOT EXISTS idx_access_logs_admin_feedback ON public.access_logs(admin_feedback);
