<?php
// 1. Security Key
$secret_key = "87ans#E@nAl0g_mmp24cv"; 

if (!isset($_GET['key']) || $_GET['key'] !== $secret_key) {
    header('HTTP/1.1 403 Forbidden');
    die("Access Denied.");
}

// 2. identify where exaclty we are
$currentDir = dirname(__FILE__);
$targetFile = $currentDir . '/etl/03_load.php';

if (!file_exists($targetFile)) {
    // This runs the script internally, bypassing all .htaccess blocks
    require_once $targetFile;
    echo "Success: ETL task executed";
} else {
    die("Path error: could not find script at " . $targetFile);
}