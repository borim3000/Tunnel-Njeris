<?php

// -> daten laden
$data = include('01_extract.php');

// -> daten zusammenfügen
$transformed_data = [];
$transformed_data['cyclists'] = $data['cyclists']['results'][0]['summe'];
$transformed_data['temperature'] = $data['weather']['current']['temperature_2m'];

// -> testen
/*
echo '<pre>';
print_r($transformed_data);
echo '</pre>';
*/

// -> daten weitergeben
return $transformed_data;