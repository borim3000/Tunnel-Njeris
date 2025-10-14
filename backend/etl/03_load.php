<?php

// -> daten als json laden
$data = include('02_transform.php');

// -> datenbank zugangsdaten einbinden
require_once '../config.php';

// -> verbindung mit der datenbank
try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $sql = "INSERT INTO entries (passengers, temperature) VALUES (?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data['passengers'],
        $data['temperature']
    ]);
    echo "Daten erfolgreich eingefügt.";
} catch (PDOException $e) {
    die("Verbindung zur Datenbank konnte nicht hergestellt werden: " . $e->getMessage());
}