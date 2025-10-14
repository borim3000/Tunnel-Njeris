<?php

$host = 'zf2c4d.myd.infomaniak.com';
$dbname = 'velo_weather_db';
$username = 'zf2c4d_temp_1';
$password = 'zxWboyzlg7oI';

$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";

$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false
];
