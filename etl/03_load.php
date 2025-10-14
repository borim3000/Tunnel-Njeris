<?php

// -> daten als json laden
$data = include('02_transform.php');

// -> datenbank zugangsdaten einbinden
require_once '../config.php';

// -> verbindung mit der datenbank
try {
    $pdo = new PDO($dsn, $username, $password, $options);

    // prüfen, ob datensatz für diese stunde schon existiert
    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM entries WHERE timestamp = ?");
    $stmtCheck->execute([$data['timestamp']]);
    $exists = $stmtCheck->fetchColumn();

    if ($exists) {
        echo "Datensatz für diese Stunde existiert bereits. Kein Eintrag vorgenommen.";
        exit;
    }

    // insert vorbereiten
    $sql = "INSERT INTO entries (timestamp, cyclists, temperature, precipitation) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data['timestamp'],
        $data['cyclists'],
        $data['temperature'],
        $data['precipitation']
    ]);

    echo "Daten erfolgreich eingefügt.";
    
} catch (PDOException $e) {
    die("Verbindung zur Datenbank konnte nicht hergestellt werden: " . $e->getMessage());
}