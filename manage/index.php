<?php
session_start();

// check if logged in
if( ! $_SESSION['isLoggedIn'] ) {
	header("Location: login.php");
	exit();
}

require_once "../variables.php";
require_once "database.php";

$database = new Database($USER, $PASS, $HOST, $DBNAME);
$database->connect();


// Create and/or modify nodes
if( isset($_POST['action']) && isset($_POST['level']) ) {
	$level = $_POST['level'];

	$title 		= isset($_POST['title']) 	 ? $_POST['title'] 		: '';
	$description 	= isset($_POST['description']) ? $_POST['description'] : '';
	$id 			= isset($_POST['id']) 		 ? $_POST['id'] 		: -1;
	$parentId 	= isset($_POST['parentId']) 	 ? $_POST['parentId'] 	: -1;

	switch( $_POST['action'] )
	{
		case 'create':
			switch($level)
			{
				case 'phases':
					// no new phases since they are hard-coded into the display
					//$database->iquery("INSERT INTO phases(title, description) VALUES (%s, %s)", $title, $description);
				break;
				case 'departments':
					$database->iquery("INSERT INTO departments(title, description, phase_id) VALUES (%s, %s, %d)", $title, $description, $parentId);
				break;
				case 'subdepartments':
					$database->iquery("INSERT INTO jobs(title, description, department_id) VALUES (%s, %s, %d)", $title, $description, $parentId);
				break;
				default:
					//level doesn't exist ...
					echo "error creating node";
				break;
			}
		break;
		case 'edit':
			switch($level)
			{
				case 'phases':
					$database->iquery("UPDATE phases SET title = %s, description = %s where id = %d", $title, $description, $id);
				break;
				case 'departments':
					$database->iquery("UPDATE departments SET title = %s, description = %s where id = %d AND phase_id = %d", $title, $description, $id, $parentId);
				break;
				case 'subdepartments':
					$database->iquery("UPDATE jobs SET title = %s, description = %s where id = %d AND department_id = %d", $title, $description, $id, $parentId);
				break;
				default:
					//level doesn't exist ...
					echo "error creating node";
				break;
			}

		break;
		case 'delete':
			switch($level)
			{
				case 'phases':
					// don't delete phases since they are hard-coded into the display
					// $database->iquery("DELETE FROM phases where id = %d", $id);
					// $departmentsToDelete = $database->query("SELECT * FROM departments WHERE phase_id = %d", $id);

					// $database->iquery("DELETE FROM departments where phase_id = %d", $id);

					// foreach( $departmentsToDelete as &$department)
					// {
					// 	$database->iquery("DELETE FROM jobs where department_id = %d", $department['id']);

					// }

				break;
				case 'departments':
					$database->iquery("DELETE FROM departments where id = %d", $id);
					$database->iquery("DELETE FROM jobs where department_id = %d", $id);

				break;
				case 'subdepartments':
					$database->iquery("DELETE FROM jobs where id = %d", $id);
				break;
				default:
					//level doesn't exist ...
					echo "error creating node";
				break;
			}		
		break;
	}
}


// Load table data
$nodes = array();		// Nodes are the titles and descriptions from the database
$currentLevel = ''; 	// Where we are in the hierarchy (viewing all phases, specific departments, or specific subdepartments) -> loaded from GET
$nextLevel = ''; 		// The next level down the hierarchy phases->departments->subdepartments
$currentPhaseId = -1; 	// The id of the current phase
$breadcrumbs = array(); 	// 
$label = '';

$phases = $database->query("SELECT * FROM phases ORDER BY id");

if( ! isset($_GET['level'])  or ! isset($_GET['parentId']) or $_GET['parentId'] == -1) {
	$currentLevel = 'phases';
} else {
	$currentLevel = $_GET['level'];
}

if ($currentLevel == 'phases') {
	$nodes = $database->query("SELECT * FROM phases ORDER BY id");
	foreach($nodes as &$node)
	{
		$tmp = $database->query("SELECT count(*) FROM departments WHERE phase_id = %d ", $node['id']);
		$node['subNodeCount'] = $tmp[0][0];
	}

	$label = "Phase";
	$nextLevel = 'departments';
	$breadcrumbs = array(
			array('name' => 'All Phases',
				 'link' => '?level=phases')
			);

} elseif ($currentLevel == 'departments') {
	$phaseId = $_GET['parentId'];

	$currentPhaseId = $phaseId;

	$nodes = $database->query("SELECT * FROM departments WHERE phase_id = %d ORDER BY id", $phaseId);


	foreach($nodes as &$node)
	{
		$tmp = $database->query("SELECT count(*) FROM jobs WHERE department_id = %d ", $node['id']);
		$node['subNodeCount'] = $tmp[0][0];
	}

	$tmp = $database->query("SELECT * FROM phases WHERE id = %d", $phaseId);
	$phase = $tmp[0];

	$label = "Department";// in Phase: $phaseId. " . $phase['title'];
	$nextLevel = 'subdepartments';
	$breadcrumbs = array(
			array('name' => 'All Phases',
				 'link' => '?level=phases'),
			array('name' => 'Phase: ' . $phase['title'],
				 'link' => '')
			);
} elseif ($currentLevel == 'subdepartments') {
	$departmentId = $_GET['parentId'];
	$nodes = $database->query("SELECT * FROM jobs WHERE department_id = %d ORDER BY id", $departmentId);
	foreach($nodes as &$node)
	{
		$node['subNodeCount'] = -1; // no sub nodes
	}

	$tmp = $database->query("SELECT * FROM departments WHERE id = %d", $departmentId);
	$department = $tmp[0];
	$currentPhaseId = $department['phase_id'];

	$tmp = $database->query("SELECT * FROM phases WHERE id = %d", $currentPhaseId);
	$phase = $tmp[0];
	$label = "Subdepartment";// within Department " . $department['title'];
	$nextLevel = '';
	$breadcrumbs = array(
			array('name' => 'All Phases',
				 'link' => '?level=phases'),
			array('name' => 'Phase: ' . $phase['title'],
				 'link' => '?level=departments&parentId=' . $currentPhaseId),
			array('name' => 'Department: ' . $department['title'],
				 'link' => '')			
			);	
}


?>

<html>
<head>

	<script src='../javascript/external_libraries/jquery.js'></script>
	<script src='../style/bootstrap/js/bootstrap.min.js'></script>

	<link rel=StyleSheet href='../style/bootstrap/css/bootstrap.css' type='text/css'>

	<script src='jquery-ui-1.9.1.custom/js/jquery-ui-1.9.1.custom.min.js'></script>
	<link rel=StyleSheet href='jquery-ui-1.9.1.custom/css/custom-theme/jquery-ui-1.9.1.custom.min.css'>

	<link rel=StyleSheet href='admin-style.css'>
</head>
<body>
	<header>
		<div style='width: 1024px; margin: 0 auto;a'>
			<a href='logout.php' class='right'>logout</a>
		</div>
	</header>	
	<section class='container'>

	<ul class="breadcrumb">
		<?php for($index=0; $index<count($breadcrumbs); $index++) {
			$breadcrumb = $breadcrumbs[$index];
			$name = $breadcrumb['name'];
			$link = $breadcrumb['link'];
			if( $index == count($breadcrumbs) - 1) 
			{
				echo "<li class='active'>$name</li>";
			} else {

				echo "<li><a href='$link'>$name</a><span class='divider'>></span></li>";

			}

		} ?>
	</ul>

	<div id="add-new-node-dialog" title="Create New <?php echo $label?>">
		<form method='post'>
			<input type='hidden' name='action' value='create'/>
			<input type='hidden' name='parentId' value='<?php echo $_GET['parentId']?>'/>
			<input type='hidden' name='level' value='<?php echo $currentLevel;?>'/>
			<label>Title</label>
			<input class='title' name='title'/>
			<label>Description</label>
			<textarea class='description' name='description'></textarea><br>
			<input type='submit' value='Create'/>
		</form>
	</div>
 
	<div id="edit-node-dialog" title="Edit Node">
		<form method='post'>
			<input type='hidden' name='action' value='edit'/>
			<input type='hidden' name='level' value='<?php echo $currentLevel;?>'/>
			<input type='hidden' name='parentId' value='<?php echo $_GET['parentId']?>'/>			
			<input type='hidden' id='edit-node-dialog-id' name='id' value=''/>

			<label>Title</label>
			<input id='edit-node-dialog-title' class='title' name='title'/>
			<label>Description</label>
			<textarea id='edit-node-dialog-description' class='description' name='description'></textarea><br>
			<input type='submit' value='Save Changes'/>
		</form>
	</div>

	<div id="delete-dialog" title="Delete">
		<p>Are you sure you want to delete <b id='delete-dialog-item-name'></b>?</p>
		<form id='delete-node-form' method='post'>
			<input type='hidden' name='action' value='delete'/>
			<input type='hidden' name='parentId' value='<?php echo $_GET['parentId']?>'/>			
			<input type='hidden' name='level' value='<?php echo $currentLevel;?>'/>
			<input type='hidden' id='delete-dialog-id' name='id' value=''/>

			<input type='submit' class='btn btn-danger' value='Delete'/>
		</form>
		<button id='delete-dialog-cancel' class='btn'>Cancel</button>

	</div>

	<h1><?php echo $label . "s";?> <?php if($currentLevel != 'phases'): ?><span id='add-new-button' class='btn btn-success'>Add New <?php echo $label; ?></span> <?php endif; ?></h1>
	<table id='node-information' class='table table-striped'>
		<thead>
			<th>ID</th>
			<th>Title</th>
			<th>Description</th>
			<th></th>
			<th></th>
			<th></th>
		</thead>
		<?php foreach($nodes as &$node) { ?>
		<tr id='node-<?php echo $node['id']; ?>'>
			<td><?php echo $node['id']; ?></td>
			<td class='title'><?php echo $node['title']; ?></td>
			<td class='description'><?php echo $node['description']; ?></td>
			<td class='singleLine'><?php if($node['subNodeCount'] != -1 ): ?> <a href='?level=<?php echo $nextLevel;?>&parentId=<?php echo $node['id'];?>'>View <?php echo $nextLevel; echo " (" . $node['subNodeCount'] . ")"; ?></a> <?php endif; ?></td>
			<td><span class='btn edit-node'><i class='icon-pencil'></i></span></td>
			<td class='singleLine'>
				<?php if($currentLevel != 'phases'): ?>
				<span class='btn btn-danger delete-node'><i class='icon-trash'></i></span> 
				<?php endif; ?>
			</td>

		</tr>
		<?php } ?>
	</table>
	</section>
	<script>

	$(document).ready( function() {
		// Setup Dialogs		
		$( "#add-new-node-dialog" ).dialog({
			autoOpen: false,
			width: '500px',
			modal: true});

		$( "#edit-node-dialog" ).dialog({
			autoOpen: false,
			width: '500px',
			modal: true,
			open: function (event, ui) {
				// load data
				var nodeId 		= $(this).data('node-id');
				var nodeTitle 		= $(this).data('node-title');
				var nodeDescription = $(this).data('node-description');

				$('#edit-node-dialog-id').val(nodeId);
				$('#edit-node-dialog-title').val(nodeTitle);
				$('#edit-node-dialog-description').html(nodeDescription);
			}});

		$( "#delete-dialog" ).dialog({
			autoOpen: false,
			width: '500px',
			modal: true,
			open: function (event, ui) {
				// Set id
				var id = $(this).data('node-id');
				$('#delete-dialog-id').val(id);

				// Set name for description purposes
				var nodeTitle = $(this).data('node-title');				
				$('#delete-dialog-item-name').html(nodeTitle);
			}
		});	

		$('#delete-node-form').submit( function() {
			return confirm("Are you sure you want to delete? Deletion is permanent and will delete any subdepartments connected to this node.");
		});

		$('#delete-dialog-cancel').click( function() {
			$('#delete-dialog').dialog('close');
		});


		// Opening Dialogs
		$('#add-new-button').click( function() {
			$( "#add-new-node-dialog" ).dialog('open');
		});


		$('.edit-node').click( function() {
			var rowElement = $(this).parent().parent();

			var idString = rowElement.attr('id');
			var id = parseInt( idString.substr("node-".length) );
			$('#edit-node-dialog').data('node-id', id);

			var nodeTitle = rowElement.children('.title').html();
			$('#edit-node-dialog').data('node-title', nodeTitle);

			var nodeDescription = rowElement.children('.description').html();
			$('#edit-node-dialog').data('node-description', nodeDescription);

			$( "#edit-node-dialog" ).dialog('open');
		});


		$('.delete-node').click( function() {
			var rowElement = $(this).parent().parent();

			var idString = rowElement.attr('id');
			var id = parseInt( idString.substr("node-".length) );
			$('#delete-dialog').data('node-id', id);

			var nodeTitle = rowElement.children('.title').html();
			$('#delete-dialog').data('node-name', nodeTitle);

			$( "#delete-dialog" ).dialog('open');
		});


		$('#change-phase-select').change(function() {
			var value = $(this).val();

			// strip out section after ? (and including ?)
			var baseUrl = window.location.href.substr(0, window.location.href.indexOf('?'));
			// navigate to page with deparments in selected phase
			window.location.href = baseUrl + '?level=departments&parentId=' + value;
		});	
	});
	</script>
</body>
</html>

