<?php
include "database.php";
$database = new Database("root", "", "localhost", "loam");
$database->connect();
?>
<!DOCTYPE html>
<!-- Below are the static options for phases. They are in HTML and not queried through phpMyAdmin -->
<html> 
	<head>
    <link rel="stylesheet" type="text/css" href="bootstrap.min.css"/>    
		<title>Bangor Hydro Job Phases, Departments, and Positions</title>
	</head>
  <body>
  <h4>Bangor Hydro Phases:</h4>

  <form action="process.php" method="post">
  <select name="phase_id">
    <option value='' disabled selected>Select Phase:</option>
  <?php
    $database = new Database("root", "", "localhost", "loam");
     $database->connect();
    $phases = $database->query("SELECT * FROM phases");
    foreach($phases as $phase) 
    {?>
      <option value='<?php echo $phase['id'];?>'><?php echo $phase['title'];?></option>
    <?php}
  ?>
  <!--
    <option value='1'>Design Specs</option>
    <option value='2'>Purchase Approval</option>
    <option value='3'>Purchase Order</option>
    <option value='4'>Recieve Meters/Modules</option>
    <option value='5'>Delivery to Outlying Divisions</option>
    <option value='6'>Meter Install/Exchange</option>
    <option value='7'>AMI Trouble</option>
    <option value='8'>Maintenance</option>
    <option value='9'>Testing</option>
    <option value='10'>Retire</option>-->
  <?php
  }
  ?>
</select>
<input type="Submit"/>
</form>                               

<br>

<?php

function buildForms($type, $subgroup_type) {
  /*************/
  /* Display Department Select field
  /*************/
   
  //This allows the user to select any given phase, which in turn allows them to select the department they wish to see a description of and change. Changes are NOT made within this code.
  $database = new Database("root", "", "localhost", "loam");
  $database->connect();

// Modify
  if( isset($_POST["${type}_id"]) ) {
    $id = $_POST["${type}_id"];
    $results = $database->query("SELECT title, description FROM ${type}s WHERE id=%d", $id);
    $item = $results[0];
  
  echo "<form action='process.php' method='post'>";
  echo "  <input type='hidden' name='${type}_id' value='$id'/>";
  echo "  <input type='text' name='${type}_title' value='${item['title']}'/>";
  echo "  <textarea name='${type}_descriptions' >${item['description']}</textarea>";
  echo "  <input type='submit' name='${type}_save' value='Save'/>";
  echo "</form>";

  }
  

  // Selection
  if( isset($_POST["${type}_id"])) {
    $id = $_POST[$type . "_id"];
    $results = $database->query("SELECT title FROM ${type}s WHERE id = " . $id);
    echo "Description for Bangor Hydro's " . $results[0]['title'] . " $type:";
    $subgroup_items = $database->query("SELECT * FROM ${subgroup_type}s WHERE ${type}_id = " . $id);
    ?>
    <form method='post'>
      <input name='<?php echo $type;?>_id' value='<?php echo $_POST["${type}_id"]; ?>' type='hidden'/>
      <select name='<?php echo $subgroup_type;?>_id'>
        <option selected>Select <?php echo $subgroup_type;?></option>
    <?php
        foreach($subgroup_items as $item) {
          echo "<option value='" . $item['id'] . "'>" . $item['title'] . "</option>";
        }
    ?>
      </select>
      <input type='submit' />
    </form>
  <?php
  }


  // Save submitted
  if( isset($_POST["${type}_descriptions"])) {
    $description = $_POST["${type}_descriptions"];
    $id = $_POST["${type}_id"];
    $title = $_POST["${type}_title"];
    $database->iquery("UPDATE ${type}s SET description='%s', title='%s' WHERE id=%d", $description, $title, $id);
  }

} // end of build form function
buildForms("phase", "department");
buildForms("department", "job");

/*************/
/* Modify a Department's title and description
/*************/

//This allows the user see the department they have selected and within that allows them to make changes to the departments description.



/*************/
/* Display Job Select field
/*************/

//This allows the user to select a given position within the departments. NEED to add a way to change the descriptions for the positions. (see Modify a Department's title and Description for reference.)

// if( isset($_POST["department_id"])) {
//   $department_id = $_POST["department_id"];
//   $jobs = $database->query("SELECT * FROM jobs WHERE department_id = " . $department_id);
//   ?>
<!--  <form>
    <select>
  -->
  <?php
      // foreach($jobs as $job) {
      //   echo "<option value='" . $job['id'] . "'>" . $job['title'] . "</option>";
      // }
  ?>
  <!--
<form action="process.php" method="post">
        <input type='hidden' name='department_id' value='<?php echo $_POST['department_id']; ?>'/>
        <input type='text' name='department_title' value='<?php echo $department['title']; ?>'/>
        <textarea name="department_descriptions" id=""><?php echo $department['description']; ?></textarea>
        <input type="submit" name="sub" value="Save"/>
        </form>
  </form>-->
<?php
//}
  ?>

<?php
$database->close();
?>