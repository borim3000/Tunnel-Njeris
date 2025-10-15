<?php

// -> daten laden
$data = include('01_extract.php');

// -> daten zusammenfügen
$transformed_data = [];

// cyclists: letzte stündliche messung
$records = $data['cyclists']['result']['records'] ?? [];
$last_record = end($records);
$transformed_data['cyclists'] = $last_record['velo_in'] ?? 0;
$transformed_data['timestamp'] = $last_record['stunde'] ?? null;

//wetter: aktuelle stunde
$temperature_hourly = $data['weather']['hourly']['temperature_2m'] ?? [];
$precipitation_hourly = $data['weather']['hourly']['precipitation'] ?? [];

$transformed_data['temperature'] = end($temperature_hourly) ?? null;
$transformed_data['precipitation'] = end($precipitation_hourly) ?? null;

// -> testen
/*
echo '<pre>';
print_r($transformed_data);
echo '</pre>';
exit;
*/

// -> daten weitergeben
return $transformed_data;