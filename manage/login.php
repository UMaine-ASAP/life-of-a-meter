<?php
session_start();
if( isset($_POST['username']) and isset($_POST['password'])) {
	//attempt login
	if( $_POST['username'] == 'loamadmin' and $_POST['password'] == '527tdg892' ) {
		$_SESSION['isLoggedIn'] = TRUE;
		header("Location: index.php");
	} else {
		$_SESSION['isLoggedIn'] = FALSE;
		echo "log in failed";
	}
}

if( isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn']) {
	header("Location: index.php");
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
	</header>	
	<section class='container'>
		<form method='post'>
			<label>Username</label>
			<input name='username'/>
			<label>Password</label>
			<input type='password' name='password'/>
			<br>
			<input type='submit' value='login'/>
		</form>
	</section>

</body>
</html>
