-- Database Update Script - Complete Migration for Step 2 System
-- Run this on your Hostinger MySQL database via phpMyAdmin
-- This adds all necessary columns for the Step 2 submission process

USE u710497052_Majorelle;

-- 1. Add token_step2 column for secure Step 2 access
ALTER TABLE candidats 
ADD COLUMN IF NOT EXISTS token_step2 VARCHAR(255) DEFAULT NULL AFTER status;

-- 2. Add bio_file column to store biography PDF path
ALTER TABLE candidats 
ADD COLUMN IF NOT EXISTS bio_file VARCHAR(255) DEFAULT NULL AFTER token_step2;

-- 3. Add presentation_file column to store note d'intention PDF path
ALTER TABLE candidats 
ADD COLUMN IF NOT EXISTS presentation_file VARCHAR(255) DEFAULT NULL AFTER bio_file;

-- 4. Add aps_file column to store APS (Avant-Projet Sommaire) PDF path
ALTER TABLE candidats 
ADD COLUMN IF NOT EXISTS aps_file VARCHAR(255) DEFAULT NULL AFTER presentation_file;

-- 5. Add date_submission_step2 to track when Step 2 was submitted
ALTER TABLE candidats 
ADD COLUMN IF NOT EXISTS date_submission_step2 TIMESTAMP NULL DEFAULT NULL AFTER aps_file;

-- 6. Update status ENUM to include 'completed' status
ALTER TABLE candidats 
MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending';

-- 7. Add index for token_step2 for faster lookups
ALTER TABLE candidats 
ADD INDEX IF NOT EXISTS idx_token_step2 (token_step2);

-- Display success message
SELECT 'Database updated successfully! All Step 2 columns have been added.' AS message;

-- Verify the changes
SHOW COLUMNS FROM candidats;
