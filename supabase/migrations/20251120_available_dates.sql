-- Add available_dates field to ticket_campaigns table
-- This allows organizers to specify specific dates that audiences can choose from

ALTER TABLE ticket_campaigns
ADD COLUMN IF NOT EXISTS available_dates TEXT[] DEFAULT '{}';

COMMENT ON COLUMN ticket_campaigns.available_dates IS
'Array of available performance dates that users can select from when applying for tickets. Format: YYYY-MM-DD';

-- Example data:
-- available_dates = ['2024-03-15', '2024-03-16', '2024-03-20', '2024-03-21']
