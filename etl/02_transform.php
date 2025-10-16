<?php

// -> daten laden
$data = include(__DIR__ . '/01_extract.php');

// -> result array vorbereiten
$transformed_list = [];

// -> rohdaten prüfen
$records = $data['cyclists']['result']['records'] ?? [];

if (empty($records)) {
    echo "Keine Zählerdaten gefunden.\n";
    return [];
}

// -> nur die letzten 720 Datensätze nehmen
$latest_records = array_slice($records, 0, 720); // lade die letzten 1 Monate

// -> wetterdaten vorbereiten
$weather = $data['weather'] ?? [];
$weather_times = $weather['hourly']['time'] ?? [];
$temperature_hourly = $weather['hourly']['temperature_2m'] ?? [];
$precipitation_hourly = $weather['hourly']['precipitation'] ?? [];

// -> für jede velo-messung den passenden wetterwert suchen
foreach ($latest_records as $record) {
    if (empty($record['stunde'])) {
        continue;
    }

    $timestamp = $record['stunde'];
    $velo_in = isset($record['velo_in']) ? (int)$record['velo_in'] : 0;

    $matchedTemperature = null;
    $matchedPrecipitation = null;

    // Finde Wetterstunde, die zeitlich am nächsten liegt (innerhalb 2 Stunden)
    $veloEpoch = strtotime($timestamp);
    $bestDiff = PHP_INT_MAX;
    $foundIndex = null;

    foreach ($weather_times as $i => $wt) {
        $wepoch = strtotime($wt);
        if ($wepoch === false) continue;

        $diff = abs($wepoch - $veloEpoch);
        if ($diff < $bestDiff) {
            $bestDiff = $diff;
            $foundIndex = $i;
        }
    }

    if ($foundIndex !== null && $bestDiff <= 7200) { // max. 2 Stunden Differenz
        $matchedTemperature = isset($temperature_hourly[$foundIndex]) ? (float)$temperature_hourly[$foundIndex] : null;
        $matchedPrecipitation = isset($precipitation_hourly[$foundIndex]) ? (float)$precipitation_hourly[$foundIndex] : null;
    }

    // Ergebnis zur Liste hinzufügen
    $transformed_list[] = [
        'timestamp' => $timestamp,
        'cyclists' => $velo_in,
        'temperature' => $matchedTemperature,
        'precipitation' => $matchedPrecipitation
    ];
}

// -> testen
/*
echo '<pre>';
print_r($transformed_list);
echo '</pre>';
exit;
*/

// -> daten weitergeben
return $transformed_list;
