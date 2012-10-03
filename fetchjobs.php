<?php
$host = 'localhost';
$user = 'root';
$pass = 'root';
$dbname = 'loam';

try
{
	$dbh = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
	$stmt = "SELECT * FROM jobs";
	$result = $dbh->query($stmt);

	$result->setFetchMode(PDO::FETCH_ASSOC);

	$resultArr = array();

	while ($row = $result->fetch())
	{
		$resultArr[] = $row;
	}

	echo json_encode($resultArr);
}
catch (PDOException $e)
{
	error_log($e);
	$dbh = null;
	return;
}


?>