<?php

// -> fetch von wetter api
function fetchWeatherData() {
    $url = "https://api.open-meteo.com/v1/forecast?latitude=47.37&longitude=8.55&hourly=temperature_2m,precipitation&timezone=Europe%2FBerlin&past_days=92&forecast_days=1";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        throw new Exception('Error fetching weather data: ' . curl_error($ch));
    }   

    curl_close($ch);

    $data = json_decode($response, true);
    if (!$data) {
        throw new Exception('Error decoding weather data JSON');
    }

    return $data;
}

// -> fetch von velozähler api
function fetchCyclistData() {
    $url = "https://data.stadt-zuerich.ch/api/3/action/datastore_search_sql?sql=SELECT%20DATE_TRUNC(%27HOUR%27%2C%20%22DATUM%22%3A%3ATIMESTAMP)%20AS%20stunde%2C%20SUM(%22VELO_IN%22%3A%3AINT)%20AS%20velo_in%20FROM%20%229e535ea2-7273-4474-94f7-ac64d2f16ae6%22%20WHERE%20%22FK_STANDORT%22%20%3D%20%274272%27%20GROUP%20BY%201%20ORDER%20BY%201%20DESC";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        throw new Exception('Error fetching cyclist data: ' . curl_error($ch));
    }
    curl_close($ch);

    $data = json_decode($response, true);
    if (!$data) {
        throw new Exception('Error decoding cyclist data JSON');
    }

    return $data;
}

// -> daten kombinieren 
$data = [
    'weather' => fetchWeatherData(),
    'cyclists' => fetchCyclistData()
];

// -> testen
/*
echo '<pre>';
print_r($data);
echo '</pre>';
*/

// -> daten weitergeben
return $data;

?>