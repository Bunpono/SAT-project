ALTER TABLE IF EXISTS public.analysis_history
ADD COLUMN IF NOT EXISTS raw_model_output TEXT;

ALTER TABLE IF EXISTS public.analysis_history
ADD COLUMN IF NOT EXISTS output_modified BOOLEAN NOT NULL DEFAULT FALSE;
