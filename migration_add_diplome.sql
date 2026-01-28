-- Migration script to add diplome field to existing candidats table
-- Prix Fondation Jardin Majorelle 2026
-- Date: 2026-01-28

USE u710497052_Majorelle;

-- Add diplome column after ecole_archi
ALTER TABLE candidats 
ADD COLUMN diplome VARCHAR(255) AFTER ecole_archi;

-- Verify the change
DESCRIBE candidats;

SELECT 'Migration completed successfully! Column diplome added after ecole_archi.' AS message;
