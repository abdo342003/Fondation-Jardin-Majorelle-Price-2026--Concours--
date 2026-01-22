-- Database setup for Prix Fondation Jardin Majorelle 2026
-- Run this SQL on your Hostinger MySQL database

-- Create the database (if not exists)
CREATE DATABASE IF NOT EXISTS u710497052_concours CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE u710497052_concours;

-- Create candidats table
CREATE TABLE IF NOT EXISTS candidats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE NOT NULL,
    cin_recto VARCHAR(255) NOT NULL,
    cin_verso VARCHAR(255) NOT NULL,
    adresse TEXT NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone_code VARCHAR(10),
    phone_number VARCHAR(20),
    ecole_archi VARCHAR(200),
    annee_obtention INT,
    num_ordre VARCHAR(50),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Create admin_users table for future admin panel
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Create projects table for Phase 2 (project submissions)
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidat_id INT NOT NULL,
    project_title VARCHAR(255),
    project_description TEXT,
    project_file VARCHAR(255),
    status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidat_id) REFERENCES candidats(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert a test admin user (password: Admin2026!)
-- IMPORTANT: Change this password in production!
INSERT INTO admin_users (username, password_hash, email) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'abdoraoui9@gmail.com')
ON DUPLICATE KEY UPDATE username=username;

-- Display success message
SELECT 'Database setup completed successfully!' AS message;
