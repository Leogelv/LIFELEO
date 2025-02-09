-- Add new columns to contacts_userbot_leo table
ALTER TABLE contacts_userbot_leo 
ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS members_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_message_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update existing records
UPDATE contacts_userbot_leo 
SET 
  is_group = FALSE,
  members_count = 2,
  unread_count = 0,
  last_message_date = CURRENT_TIMESTAMP 
WHERE is_group IS NULL;

-- Add index for sorting
CREATE INDEX IF NOT EXISTS idx_contacts_sort 
ON contacts_userbot_leo (is_pinned DESC, last_message_date DESC); 