<?php

// -> daten als array laden (mehrere einträge)
$data_list = include(__DIR__ . '/02_transform.php');

// -> datenbank zugangsdaten einbinden
require_once __DIR__ . '/config.php';

// -> prüfen, ob überhaupt daten da sind
if (empty($data_list) || !is_array($data_list)) {
    die("Keine gültigen Daten zum Laden gefunden.\n");
}

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $inserted = 0;
    $skipped = 0;

    foreach ($data_list as $entry) {
        if (empty($entry['timestamp'])) {
            $skipped++;
            continue;
        }

        // prüfen, ob datensatz schon existiert
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM velotunnel_db WHERE timestamp = ?");
        $stmtCheck->execute([$entry['timestamp']]);
        $exists = $stmtCheck->fetchColumn();

        if ($exists) {
            $skipped++;
            continue;
        }

        // insert vorbereiten
        $sql = "INSERT INTO velotunnel_db (timestamp, cyclists, temperature, precipitation) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $entry['timestamp'],
            $entry['cyclists'] ?? 0,
            $entry['temperature'] ?? null,
            $entry['precipitation'] ?? null
        ]);

        $inserted++;
    }

    echo "ETL erfolgreich abgeschlossen. $inserted neue Einträge, $skipped übersprungen.\n";

} catch (PDOException $e) {
    die("Verbindung zur Datenbank konnte nicht hergestellt werden: " . $e->getMessage());
}
