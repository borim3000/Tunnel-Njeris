<?php

$host = 'zf2c4d.myd.infomaniak.com';
$dbname = 'zf2c4d_im3';
$username = 'zf2c4d_ETLscript';
$password = 'UDf!S35x$e.61D';

$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";

$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false
];
