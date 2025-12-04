<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../etl/config.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // daten aus db holen

    $stmt = $pdo->query("
        SELECT timestamp, cyclists, temperature, precipitation
        FROM velotunnel_db
        ORDER BY timestamp ASC
    ");

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "count" => count($rows),
        "data" => $rows
        
    ], JSON_PRETTY_PRINT); 

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);

}