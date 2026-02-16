<?php
// api/admin_panel.php - Jury Admin Panel
// Prix Fondation Jardin Majorelle 2026

session_start();

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', '../error_log.txt');

require 'db_connect.php';

// Authentication check
if (!isset($_SESSION['jury_logged_in']) || $_SESSION['jury_logged_in'] !== true) {
    header('Location: admin_login.php');
    exit;
}

// Session timeout after 2 hours
$session_timeout = 2 * 60 * 60;
if (isset($_SESSION['jury_login_time']) && (time() - $_SESSION['jury_login_time']) > $session_timeout) {
    session_destroy();
    header('Location: admin_login.php?timeout=1');
    exit;
}

// Logout handler
if (isset($_GET['logout'])) {
    error_log("JURY LOGOUT: IP " . $_SERVER['REMOTE_ADDR'] . " at " . date('Y-m-d H:i:s'));
    session_destroy();
    header('Location: admin_login.php');
    exit;
}

// Fetch candidates
$filter = $_GET['filter'] ?? 'all';
$search = $_GET['search'] ?? '';

$whereClause = "1=1";
$params = [];

if ($filter === 'pending') {
    $whereClause .= " AND status = 'pending'";
} elseif ($filter === 'approved') {
    $whereClause .= " AND status = 'approved'";
} elseif ($filter === 'rejected') {
    $whereClause .= " AND status = 'rejected'";
} elseif ($filter === 'completed') {
    $whereClause .= " AND status = 'completed'";
}

if (!empty($search)) {
    $whereClause .= " AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR ecole_archi LIKE ?)";
    $searchTerm = "%$search%";
    $params = [$searchTerm, $searchTerm, $searchTerm, $searchTerm];
}

try {
    $stmt = $pdo->prepare("SELECT * FROM candidats WHERE $whereClause ORDER BY created_at DESC");
    $stmt->execute($params);
    $candidats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $statsStmt = $pdo->query("SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM candidats");
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
} catch (Exception $e) {
    error_log("Admin panel error: " . $e->getMessage());
    $candidats = [];
    $stats = ['total' => 0, 'pending' => 0, 'approved' => 0, 'rejected' => 0, 'completed' => 0];
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Jury | Prix Fondation Jardin Majorelle 2026</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-teal: #7dafab;
            --secondary-amber: #f8b200;
            --surface-ivory: #ffd452;
            --majorelle-blue: #7dafab;
            --majorelle-deep: #6a9a97;
            --majorelle-light: #8fc3c0;
            --gold-accent: #f8b200;
            --gold-light: #fcc142;
            --gold-muted: #faba00;
            --ivory: #fffaf5;
            --ivory-dark: #fff9f0;
            --warm-gray: #8b8680;
            --warm-gray-light: #a8a49e;
            --charcoal: #2d2d2d;
            --charcoal-light: #4a4a4a;
            --success: #2d6a4f;
            --success-light: #40916c;
            --success-bg: #ecfdf5;
            --danger: #9b2c2c;
            --danger-light: #c53030;
            --danger-bg: #fef2f2;
            --warning: #92400e;
            --warning-bg: #fffbeb;
            --info: #1e40af;
            --info-bg: #eff6ff;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Inter', -apple-system, sans-serif;
            background: var(--ivory-dark);
            min-height: 100vh;
            color: var(--charcoal);
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, var(--majorelle-blue) 0%, var(--majorelle-deep) 100%);
            color: white;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 4px 20px rgba(15, 36, 66, 0.2);
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--gold-accent), var(--gold-light), var(--gold-accent));
        }

        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 18px;
        }

        .header-logo {
            width: 48px;
            height: 48px;
            color: var(--gold-accent);
        }

        .header-text h1 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }

        .header-text p {
            font-size: 12px;
            opacity: 0.8;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-top: 2px;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .header-time {
            font-size: 12px;
            opacity: 0.7;
            letter-spacing: 0.5px;
        }

        .btn-logout {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 24px;
            background: rgba(201, 162, 39, 0.15);
            color: var(--gold-light);
            border: 1px solid rgba(201, 162, 39, 0.3);
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-decoration: none;
            letter-spacing: 1px;
            text-transform: uppercase;
            transition: all 0.3s ease;
        }

        .btn-logout:hover {
            background: var(--gold-accent);
            color: var(--majorelle-deep);
            border-color: var(--gold-accent);
        }

        .btn-logout svg {
            width: 16px;
            height: 16px;
        }

        /* Main Container */
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px;
        }

        /* Stats Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 20px;
            margin-bottom: 35px;
        }

        .stat-card {
            background: white;
            border-radius: 4px;
            padding: 28px 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            border: 1px solid #e8e6e3;
            transition: all 0.3s ease;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: transparent;
            transition: background 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
        }

        .stat-card.active {
            border-color: var(--majorelle-blue);
        }

        .stat-card.active::before {
            background: var(--majorelle-blue);
        }

        .stat-card.active.total::before { background: var(--majorelle-blue); }
        .stat-card.active.pending::before { background: var(--gold-accent); }
        .stat-card.active.approved::before { background: var(--success); }
        .stat-card.active.rejected::before { background: var(--danger); }
        .stat-card.active.completed::before { background: var(--info); }

        .stat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        .stat-icon {
            width: 44px;
            height: 44px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .stat-icon svg {
            width: 22px;
            height: 22px;
        }

        .stat-icon.total { background: rgba(26, 54, 93, 0.1); color: var(--majorelle-blue); }
        .stat-icon.pending { background: rgba(201, 162, 39, 0.12); color: var(--gold-accent); }
        .stat-icon.approved { background: rgba(45, 106, 79, 0.1); color: var(--success); }
        .stat-icon.rejected { background: rgba(155, 44, 44, 0.1); color: var(--danger); }
        .stat-icon.completed { background: rgba(30, 64, 175, 0.1); color: var(--info); }

        .stat-value {
            font-size: 38px;
            font-weight: 700;
            color: var(--charcoal);
            line-height: 1;
            font-family: 'Playfair Display', Georgia, serif;
        }

        .stat-label {
            font-size: 11px;
            color: var(--warm-gray);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Enhanced Search Section */
        .search-section {
            background: white;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            border: 1px solid #e8e6e3;
            margin-bottom: 25px;
            overflow: hidden;
        }

        .search-header {
            padding: 20px 28px;
            background: var(--ivory);
            border-bottom: 1px solid #e8e6e3;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .search-title {
            font-size: 11px;
            font-weight: 700;
            color: var(--majorelle-blue);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .search-title svg {
            width: 18px;
            height: 18px;
        }

        .search-clear {
            font-size: 12px;
            color: var(--warm-gray);
            text-decoration: none;
            padding: 6px 14px;
            border-radius: 4px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .search-clear:hover {
            background: var(--danger-bg);
            color: var(--danger);
        }

        .search-clear svg {
            width: 14px;
            height: 14px;
        }

        .search-body {
            padding: 28px;
        }

        .search-row {
            display: grid;
            grid-template-columns: 1fr 200px 160px;
            gap: 16px;
            align-items: end;
        }

        .search-field {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .search-field label {
            font-size: 10px;
            font-weight: 700;
            color: var(--warm-gray);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .search-box {
            position: relative;
        }

        .search-box input {
            width: 100%;
            padding: 14px 18px 14px 48px;
            border: 2px solid #e8e6e3;
            border-radius: 4px;
            font-size: 14px;
            font-family: inherit;
            transition: all 0.3s ease;
            background: white;
        }

        .search-box input:focus {
            outline: none;
            border-color: var(--majorelle-blue);
            box-shadow: 0 0 0 4px rgba(26, 54, 93, 0.1);
        }

        .search-box input::placeholder {
            color: #b8b5af;
        }

        .search-box svg {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            width: 18px;
            height: 18px;
            color: var(--warm-gray);
        }

        .search-select {
            padding: 14px 18px;
            border: 2px solid #e8e6e3;
            border-radius: 4px;
            font-size: 14px;
            font-family: inherit;
            transition: all 0.3s ease;
            background: white;
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%238b8680' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 14px center;
            padding-right: 45px;
        }

        .search-select:focus {
            outline: none;
            border-color: var(--majorelle-blue);
            box-shadow: 0 0 0 4px rgba(26, 54, 93, 0.1);
        }

        .search-btn {
            padding: 14px 28px;
            background: linear-gradient(135deg, var(--majorelle-blue) 0%, var(--majorelle-light) 100%);
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            height: 48px;
        }

        .search-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(26, 54, 93, 0.25);
        }

        .search-btn svg {
            width: 16px;
            height: 16px;
        }

        /* Quick Filter Pills */
        .quick-filters {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px dashed #e8e6e3;
            flex-wrap: wrap;
        }

        .quick-filter-label {
            font-size: 10px;
            font-weight: 600;
            color: var(--warm-gray);
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 10px 0;
            margin-right: 6px;
        }

        .filter-pill {
            padding: 8px 16px;
            border: 1px solid #e8e6e3;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            color: var(--charcoal);
            background: white;
            text-decoration: none;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .filter-pill:hover {
            border-color: var(--majorelle-blue);
            color: var(--majorelle-blue);
            background: rgba(26, 54, 93, 0.04);
        }

        .filter-pill.active {
            background: var(--majorelle-blue);
            color: white;
            border-color: var(--majorelle-blue);
        }

        .filter-pill svg {
            width: 14px;
            height: 14px;
        }

        .filter-pill .pill-count {
            background: rgba(0,0,0,0.1);
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 700;
        }

        .filter-pill.active .pill-count {
            background: rgba(255,255,255,0.25);
        }

        /* Active search indicator */
        .active-search {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 20px;
            background: linear-gradient(135deg, rgba(201, 162, 39, 0.08) 0%, rgba(201, 162, 39, 0.04) 100%);
            border-top: 1px solid rgba(201, 162, 39, 0.2);
            font-size: 13px;
            color: var(--charcoal);
        }

        .active-search svg {
            width: 16px;
            height: 16px;
            color: var(--gold-accent);
        }

        .active-search strong {
            color: var(--majorelle-blue);
        }

        .active-search a {
            margin-left: auto;
            color: var(--danger);
            font-size: 12px;
            text-decoration: none;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .active-search a:hover {
            text-decoration: underline;
        }

        /* Table Card */
        .table-card {
            background: white;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            border: 1px solid #e8e6e3;
            overflow: hidden;
        }

        .table-header {
            padding: 24px 28px;
            border-bottom: 1px solid #e8e6e3;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--ivory);
        }

        .table-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 18px;
            font-weight: 600;
            color: var(--charcoal);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .table-title svg {
            width: 22px;
            height: 22px;
            color: var(--majorelle-blue);
        }

        .result-count {
            font-size: 13px;
            color: var(--warm-gray);
            font-weight: 500;
            background: white;
            padding: 8px 16px;
            border-radius: 4px;
            border: 1px solid #e8e6e3;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        thead {
            background: var(--ivory);
        }

        th {
            padding: 16px 20px;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            color: var(--warm-gray);
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #e8e6e3;
        }

        td {
            padding: 20px;
            border-bottom: 1px solid #f3f2f0;
            font-size: 14px;
            vertical-align: middle;
        }

        tbody tr {
            transition: all 0.2s ease;
        }

        tbody tr:hover {
            background: var(--ivory);
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        .candidate-id {
            font-family: 'Playfair Display', Georgia, serif;
            font-weight: 600;
            color: var(--majorelle-blue);
        }

        .candidate-name {
            font-weight: 600;
            color: var(--charcoal);
        }

        .candidate-email {
            font-size: 12px;
            color: var(--warm-gray);
            margin-top: 4px;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge svg {
            width: 14px;
            height: 14px;
        }

        .badge-pending {
            background: var(--warning-bg);
            color: var(--warning);
        }

        .badge-approved {
            background: var(--success-bg);
            color: var(--success);
        }

        .badge-rejected {
            background: var(--danger-bg);
            color: var(--danger);
        }

        .badge-completed {
            background: var(--info-bg);
            color: var(--info);
        }

        /* Documents indicator */
        .docs-indicator {
            display: flex;
            gap: 5px;
        }

        .doc-dot {
            width: 10px;
            height: 10px;
            border-radius: 2px;
            background: #e5e3df;
            transition: all 0.3s ease;
        }

        .doc-dot.filled {
            background: var(--success);
        }

        .action-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .action-btn svg {
            width: 16px;
            height: 16px;
        }

        .btn-view {
            background: var(--majorelle-blue);
            color: white;
        }

        .btn-view:hover {
            background: var(--majorelle-light);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(26, 54, 93, 0.2);
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 80px 30px;
        }

        .empty-state svg {
            width: 80px;
            height: 80px;
            color: #d1cfc9;
            margin-bottom: 24px;
        }

        .empty-state h3 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 22px;
            font-weight: 600;
            color: var(--charcoal);
            margin-bottom: 10px;
        }

        .empty-state p {
            color: var(--warm-gray);
            font-size: 14px;
        }

        /* Date formatting */
        .date-cell {
            color: var(--warm-gray);
            font-size: 13px;
        }

        /* Responsive */
        @media (max-width: 1200px) {
            .stats-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        @media (max-width: 900px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .container { padding: 25px 20px; }
            .search-row {
                grid-template-columns: 1fr 1fr;
            }
        }

        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 15px;
                text-align: center;
                padding: 20px;
            }
            
            .stats-grid {
                grid-template-columns: 1fr 1fr;
            }
            
            .search-row {
                grid-template-columns: 1fr;
            }
            
            .search-btn {
                width: 100%;
            }
            
            .quick-filters {
                justify-content: center;
            }
            
            .filter-pill {
                font-size: 11px;
                padding: 6px 12px;
            }
            
            table {
                display: block;
                overflow-x: auto;
            }
            
            .header-time {
                display: none;
            }
        }
    </style>
</head>
<body>

<header class="header">
    <div class="header-content">
        <div class="header-title">
            <svg class="header-logo" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M50 20 L55 45 L80 50 L55 55 L50 80 L45 55 L20 50 L45 45 Z" fill="currentColor" opacity="0.9"/>
                <circle cx="50" cy="50" r="8" fill="currentColor"/>
            </svg>
            <div class="header-text">
                <h1>Espace Jury</h1>
                <p>Prix Fondation Jardin Majorelle 2026</p>
            </div>
        </div>
        <div class="header-actions">
            <span class="header-time"><?php echo date('d M Y • H:i'); ?></span>
            <a href="?logout=1" class="btn-logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Déconnexion
            </a>
        </div>
    </div>
</header>

<div class="container">
    <!-- Statistics -->
    <div class="stats-grid">
        <a href="?filter=all" class="stat-card total <?php echo $filter === 'all' ? 'active' : ''; ?>">
            <div class="stat-header">
                <div class="stat-icon total">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                </div>
            </div>
            <div class="stat-value"><?php echo $stats['total']; ?></div>
            <div class="stat-label">Total Candidatures</div>
        </a>

        <a href="?filter=pending" class="stat-card pending <?php echo $filter === 'pending' ? 'active' : ''; ?>">
            <div class="stat-header">
                <div class="stat-icon pending">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
            </div>
            <div class="stat-value"><?php echo $stats['pending']; ?></div>
            <div class="stat-label">En Attente</div>
        </a>

        <a href="?filter=approved" class="stat-card approved <?php echo $filter === 'approved' ? 'active' : ''; ?>">
            <div class="stat-header">
                <div class="stat-icon approved">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
            </div>
            <div class="stat-value"><?php echo $stats['approved']; ?></div>
            <div class="stat-label">Approuvées</div>
        </a>

        <a href="?filter=rejected" class="stat-card rejected <?php echo $filter === 'rejected' ? 'active' : ''; ?>">
            <div class="stat-header">
                <div class="stat-icon rejected">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
            </div>
            <div class="stat-value"><?php echo $stats['rejected']; ?></div>
            <div class="stat-label">Refusées</div>
        </a>

        <a href="?filter=completed" class="stat-card completed <?php echo $filter === 'completed' ? 'active' : ''; ?>">
            <div class="stat-header">
                <div class="stat-icon completed">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                </div>
            </div>
            <div class="stat-value"><?php echo $stats['completed']; ?></div>
            <div class="stat-label">Projets Soumis</div>
        </a>
    </div>

    <!-- Enhanced Search Section -->
    <form method="GET" class="search-section">
        <div class="search-header">
            <div class="search-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
                Recherche & Filtres
            </div>
            <?php if (!empty($search) || $filter !== 'all'): ?>
                <a href="admin_panel.php" class="search-clear">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Réinitialiser
                </a>
            <?php endif; ?>
        </div>
        
        <div class="search-body">
            <div class="search-row">
                <div class="search-field">
                    <label>Recherche globale</label>
                    <div class="search-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input type="text" name="search" placeholder="Nom, prénom, email, école, n° CNOA..." value="<?php echo htmlspecialchars($search); ?>">
                    </div>
                </div>
                
                <div class="search-field">
                    <label>Statut</label>
                    <select name="filter" class="search-select">
                        <option value="all" <?php echo $filter === 'all' ? 'selected' : ''; ?>>Tous les statuts</option>
                        <option value="pending" <?php echo $filter === 'pending' ? 'selected' : ''; ?>>En attente</option>
                        <option value="approved" <?php echo $filter === 'approved' ? 'selected' : ''; ?>>Approuvées</option>
                        <option value="rejected" <?php echo $filter === 'rejected' ? 'selected' : ''; ?>>Refusées</option>
                        <option value="completed" <?php echo $filter === 'completed' ? 'selected' : ''; ?>>Projets soumis</option>
                    </select>
                </div>
                
                <button type="submit" class="search-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    Rechercher
                </button>
            </div>
            
            <!-- Quick Filter Pills -->
            <div class="quick-filters">
                <span class="quick-filter-label">Accès rapide:</span>
                <a href="?filter=all" class="filter-pill <?php echo $filter === 'all' ? 'active' : ''; ?>">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                    </svg>
                    Tous
                    <span class="pill-count"><?php echo $stats['total']; ?></span>
                </a>
                <a href="?filter=pending" class="filter-pill <?php echo $filter === 'pending' ? 'active' : ''; ?>">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    En attente
                    <span class="pill-count"><?php echo $stats['pending']; ?></span>
                </a>
                <a href="?filter=approved" class="filter-pill <?php echo $filter === 'approved' ? 'active' : ''; ?>">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Approuvées
                    <span class="pill-count"><?php echo $stats['approved']; ?></span>
                </a>
                <a href="?filter=rejected" class="filter-pill <?php echo $filter === 'rejected' ? 'active' : ''; ?>">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Refusées
                    <span class="pill-count"><?php echo $stats['rejected']; ?></span>
                </a>
                <a href="?filter=completed" class="filter-pill <?php echo $filter === 'completed' ? 'active' : ''; ?>">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Projets soumis
                    <span class="pill-count"><?php echo $stats['completed']; ?></span>
                </a>
            </div>
        </div>
        
        <?php if (!empty($search)): ?>
            <div class="active-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Résultats pour : <strong>"<?php echo htmlspecialchars($search); ?>"</strong>
                <a href="?filter=<?php echo htmlspecialchars($filter); ?>">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;">
                        <path d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Effacer
                </a>
            </div>
        <?php endif; ?>
    </form>

    <!-- Candidates Table -->
    <div class="table-card">
        <div class="table-header">
            <div class="table-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                Liste des Candidatures
            </div>
            <span class="result-count"><?php echo count($candidats); ?> résultat<?php echo count($candidats) > 1 ? 's' : ''; ?></span>
        </div>

        <?php if (empty($candidats)): ?>
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <h3>Aucune candidature trouvée</h3>
                <p>Modifiez vos critères de recherche ou attendez de nouvelles candidatures.</p>
            </div>
        <?php else: ?>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Candidat</th>
                        <th>École</th>
                        <th>Diplôme</th>
                        <th>Documents</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($candidats as $candidat): ?>
                        <tr>
                            <td><span class="candidate-id">#<?php echo $candidat['id']; ?></span></td>
                            <td>
                                <div class="candidate-name"><?php echo htmlspecialchars($candidat['prenom'] . ' ' . $candidat['nom']); ?></div>
                                <div class="candidate-email"><?php echo htmlspecialchars($candidat['email']); ?></div>
                            </td>
                            <td><?php echo htmlspecialchars($candidat['ecole_archi']); ?></td>
                            <td><?php echo htmlspecialchars($candidat['diplome']); ?> (<?php echo htmlspecialchars($candidat['annee_obtention']); ?>)</td>
                            <td>
                                <div class="docs-indicator" title="CIN, Bio, Note, APS">
                                    <span class="doc-dot <?php echo $candidat['cin_recto'] ? 'filled' : ''; ?>" title="CIN"></span>
                                    <span class="doc-dot <?php echo $candidat['bio_file'] ? 'filled' : ''; ?>" title="Biographie"></span>
                                    <span class="doc-dot <?php echo $candidat['presentation_file'] ? 'filled' : ''; ?>" title="Note d'intention"></span>
                                    <span class="doc-dot <?php echo $candidat['aps_file'] ? 'filled' : ''; ?>" title="APS"></span>
                                </div>
                            </td>
                            <td>
                                <?php
                                $statusConfig = [
                                    'pending' => ['class' => 'badge-pending', 'label' => 'En Attente', 'icon' => '<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>'],
                                    'approved' => ['class' => 'badge-approved', 'label' => 'Approuvée', 'icon' => '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'],
                                    'rejected' => ['class' => 'badge-rejected', 'label' => 'Refusée', 'icon' => '<path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>'],
                                    'completed' => ['class' => 'badge-completed', 'label' => 'Projet Soumis', 'icon' => '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>']
                                ];
                                $status = $statusConfig[$candidat['status']] ?? $statusConfig['pending'];
                                ?>
                                <span class="badge <?php echo $status['class']; ?>">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><?php echo $status['icon']; ?></svg>
                                    <?php echo $status['label']; ?>
                                </span>
                            </td>
                            <td><span class="date-cell"><?php echo date('d/m/Y', strtotime($candidat['created_at'])); ?></span></td>
                            <td>
                                <a href="admin_review.php?id=<?php echo $candidat['id']; ?>" class="action-btn btn-view">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                    Examiner
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</div>

</body>
</html>
