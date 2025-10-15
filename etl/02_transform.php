<?php

// -> daten laden
$data = include(__DIR__ . '/01_extract.php');

// -> daten zusammenfügen
$transformed_data = [
    'timestamp' => null,
    'cyclists' => 0,
    'temperature' => null,
    'precipitation' => null
];

// cyclists: finde die neuste messung
$records = $data['cyclists']['result']['records'] ?? [];

if (!empty($records)) {
    $bestRecord = null;
    $maxEpoch = PHP_INT_MIN;

    forEach ($records as $r) {
        if (empty($r['stunde'])) {
            continue;
        }
        $epoch = strtotime($r['stunde']);
        if ($epoch === false) {
            continue;
        }
        if ($epoch > $maxEpoch) {
            $maxEpoch = $epoch;
            $bestRecord = $r;
        }
    }

    if ($bestRecord !== null) {
        // setze velodaten (sichere Konvertierung)
        $transformed_data['cyclists'] = isset($bestRecord['velo_in']) ? (int)$bestRecord['velo_in'] : 0;
        // bewahre den original-string als timestamp
        $transformed_data['timestamp'] = $bestRecord['stunde'];
    }
}

//wetter: suche die stunde, die zur velotimestamp matcht
$weather = $data['weather'] ?? [];
$weather_times = $weather['hourly']['time'] ?? [];
$temperature_hourly = $weather['hourly']['temperature_2m'] ?? [];
$precipitation_hourly = $weather['hourly']['precipitation'] ?? [];

if (!empty($transformed_data['timestamp']) && !empty($weather_times) && !empty($temperature_hourly)) {
    $veloEpoch = strtotime($transformed_data['timestamp']);

    if ($veloEpoch !== false) {
        $foundIndex = null;
        // 1) exakter match (nach epoch)
        foreach ($weather_times as $i => $wt) {
            $wepoch = strtotime($wt);
            if ($wepoch === false) {
                continue;
            }
            if ($wepoch === $veloEpoch) {
                $foundIndex = $i;
                break;
            }
        }

        // 2) wenn kein exakter match, suche den nächsten zeitpunkt (innerhalb 2 stunden)
        if ($foundIndex === null) {
            $bestDiff = PHP_INT_MAX;
            foreach ($weather_times as $i => $wt) {
                $wepoch = strtotime($wt);
                if ($wepoch === false) {
                    continue;
                }
                $diff = abs($wepoch - $veloEpoch);
                if ($diff < $bestDiff) {
                    $bestDiff = $diff;
                    $foundIndex = $i;
                }
            }
            if ($bestDiff > 7200) { // mehr als 2 stunden -> kein vernünftiger match
                $foundIndex = null;
            }
        }

        if ($foundIndex !== null) {
            $transformed_data['temperature'] = isset($temperature_hourly[$foundIndex]) ? (float)$temperature_hourly[$foundIndex] : null;
            $transformed_data['precipitation'] = isset($precipitation_hourly[$foundIndex]) ? (float)$precipitation_hourly[$foundIndex] : null;
        }

        
    }
}

// -> testen
/*
echo '<pre>';
print_r($transformed_data);
echo '</pre>';
exit;
*/

// -> daten weitergeben
return $transformed_data;