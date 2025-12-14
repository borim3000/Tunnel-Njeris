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

// -> nur die letzten 24 Datensätze nehmen
$latest_records = array_slice($records, 0, 24); // 0 = Start, 24 = Anzahl Einträge

// -> wetterdaten vorbereiten
$weather = $data['weather'] ?? [];
$weather_times = $weather['hourly']['time'] ?? [];
$temperature_hourly = $weather['hourly']['temperature_2m'] ?? [];
$precipitation_hourly = $weather['hourly']['precipitation'] ?? [];

//1 lookup map erstellen

$weather_map = [];
foreach ($weather_times as $index => $isoTime) {
    //konvertieren datenformat in einheitliches format
    $key = date('Y-m-d H:i', strtotime($isoTime));

    $weather_map[$key] = [
        'temp' => $temperature_hourly[$index] ?? null,
        'precip' => $precipitation_hourly[$index] ?? null
    ];
}

// für jede velo messung den passenden wetterwert suchen
foreach ($latest_records as $record) {
    if (empty($record['stunde'])) {
        continue;
    }

    $rawTimestamp = $record['stunde'];

    // in einheitliches format bringen
    $searchKey = date('Y-m-d H:i', strtotime($rawTimestamp));

    $matchedTemperature = null;
    $matchedPrecipitation = null;

    //2 strikter vergleich: check ob es für diesen key einen wettereintrag gibt
    if (isset($weather_map[$searchKey])) {  
        $matchedTemperature = (float)$weather_map[$searchKey]['temp'];
        $matchedPrecipitation = (float)$weather_map[$searchKey]['precip'];
    }

    //ergebnis zur liste hinzufügen
    $transformed_list[] = [
        'timestamp' => $rawTimestamp,
        'cyclists' => isset($record['velo_in']) ? (int)$record['velo_in'] : 0,
        'temperature' => $matchedTemperature,
        'precipitation' => $matchedPrecipitation
    ];
}

return $transformed_list;
?>