<?php
$user = 'root';
$pass = '';
$host = 'localhost';
$dbname = 'loam';

require_once "interface/database.php";

function xmlspecialchars($text)
{
	// $text = htmlspecialchars($text);
	 $text = str_replace("nbsp", "", $text);
	// return $text;

	  return str_replace(array("&", "<", ">", "\"", "'"),
        array("&amp;", "&lt;", "&gt;", "&quot;", "&apos;"), $text);
}

$database = new Database($user, $pass, $host, $dbname);
$database->connect();

/*$xmlResult = '<?xml version="1.0"?> <!DOCTYPE some_name [ <!ENTITY nbsp "&#160;"> ]> ';*/
$xmlResult = '<?xml version="1.0"?><!DOCTYPE some_name [ <!ENTITY nbsp "&#160;"> ]> ';
$xmlResult .= "<lifeOfMeter>";
$dom = new DOMDocument("1.0");
$root = $dom->createElement("lifeOfMeter");
$dom->appendChild($root);

$phases = $database->query("SELECT * FROM phases ORDER BY id");
// Get departments
$xmlResult .= "<phases>";
$phasesItems = $dom->createElement("phases");
$root->appendChild($phasesItems);

foreach($phases as &$phase)
{
	$phaseItem = $dom->createElement("phase");
	$phasesItems->appendChild( $phaseItem);

	// add description
	$phaseDescription = $dom->createElement("description");
	$phaseItem->appendChild($phaseDescription);

	$phaseDescriptionValue = $dom->createTextNode( utf8_encode($phase['description']) );
	$phaseDescription->appendChild($phaseDescriptionValue);

	// add order
	$order = $dom->createAttribute("order");
	$phaseItem->appendChild($order);
	$orderValue = $dom->createTextNode( utf8_encode($phase['id']) );
	$order->appendChild($orderValue);

	// add name
	$title = $dom->createAttribute("name");
	$phaseItem->appendChild($title);
	$titleValue = $dom->createTextNode( utf8_encode($phase['title']) );
	$title->appendChild($titleValue);


	// Create departments
	$departments = $database->query("SELECT * FROM departments WHERE phase_id = %d", $phase['id']);	

	$departmentsItems = $dom->createElement("departments");
	$phaseItem->appendChild($departmentsItems);

	foreach($departments as &$department) 
	{
		$departmentItem = $dom->createElement("department");
		$departmentsItems->appendChild($departmentItem);

		// add description
		$departmentDescription = $dom->createElement("description");
		$departmentItem->appendChild($departmentDescription);

		$departmentDescriptionValue = $dom->createTextNode( utf8_encode($department['description']) );
		$departmentDescription->appendChild($departmentDescriptionValue);

		// add name
		$title = $dom->createAttribute("name");
		$departmentItem->appendChild($title);
		$titleValue = $dom->createTextNode( utf8_encode($department['title']) );
		$title->appendChild($titleValue);


		// Create positions
		$positions = $database->query("SELECT * FROM jobs WHERE phase_id = %d", $phase['id']);

		$positionsItems = $dom->createElement("positions");
		$departmentItem->appendChild($positionsItems);		
		foreach($positions as $position)
		{
			$positionItem = $dom->createElement("position");
			$positionsItems->appendChild($positionItem);

			// add description
			$positionDescription = $dom->createElement("description");
			$positionItem->appendChild($positionDescription);

			$positionDescriptionValue = $dom->createTextNode( utf8_encode($position['description']) );
			$positionDescription->appendChild($positionDescriptionValue);

			// add name
			$title = $dom->createAttribute("name");
			$positionItem->appendChild($title);
			$titleValue = $dom->createTextNode( utf8_encode($position['title']) );
			$title->appendChild($titleValue);
		}
	}	
}


// Output results
header("Content-type: text/xml");
echo $dom->saveXML();

// Close database
$database->close();



