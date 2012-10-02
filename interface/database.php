<?php
/************************************************************************
 Class: DATABASE
 Purpose: To allow access to a MySQL database
************************************************************************/

//include_once "variables.php";

class Database
{
	var $database_name;
	var $database_user;
	var $database_pass;
	var $database_host;	
	var $database_link;
	private static $instance;
	
	function Database($user=null, $pass=null, $host=null, $name=null)
	{
		$this->database_user = isset($user)?$user:$GLOBALS["db_user"];
		$this->database_pass = isset($pass)?$pass:$GLOBALS["db_pass"];
		$this->database_host = isset($host)?$host:$GLOBALS["db_host"];
		$this->database_name = isset($name)?$name:$GLOBALS["db_name"];
	}

	public static function get()
	{
        if (!isset(self::$instance)) {
            $c = __CLASS__;
            self::$instance = new $c;
			self::$instance->connect();
        }

        return self::$instance;	
	}
	
	public function __clone()
    {
        trigger_error('Clone is not allowed.', E_USER_ERROR);
    }
	
	function connect()
	{
		$this->database_link = new mysqli(
			$this->database_host,
			$this->database_user,
			$this->database_pass,
			$this->database_name
		);

		/* check connection */
		if (mysqli_connect_errno($this->database_link)) {
		    printf("Connect failed: %s\n", mysqli_connect_error());
		    exit();
		}
	}
	
    function close()
	{
		if(isset($this->database_link))
			$this->database_link->close();
	}

	function isConnected() {
		return $this->database_link == TRUE; //return boolean not a reference
	}

	function escape($value) {
		return $this->database_link->real_escape_string( $value );
	}

	function query(/*$query, [[, $args [, $... ]]*/)
	{
		$returnArray = array();

		$args = func_get_args();
		$query = array_shift($args);

		//Available binding types mysqli accepts
		$avail_types = array("i", "d", "s", "b");

		//Get the types in the order they appear in the query
		$reg_ex = "/%[".implode($avail_types, "|")."]/";
		preg_match_all($reg_ex, $query, $matches);
		$types = str_replace("%", "", implode($matches[0]));

		//Some queries have quotes that need to be removed.
		//Also need placeholers to be ? instead of %s or %d ... etc
		$replacements = array();
		foreach($avail_types as $type)
			$replacements[] = "%".$type;
		$query = str_replace($replacements, "?", $query);

		//remove quotes
		$quote_types = array("'", "`", '“', '”');
		$diff_ways_to_quote = array();
		foreach($quote_types as $type1)
			foreach($quote_types as $type2)
				$diff_ways_to_quote[] = $type1."?".$type2;
		$query = str_replace($diff_ways_to_quote, "?", $query);

		if($stmt = $this->database_link->prepare($query)) {
			//In order to dynmically bind parameter, references to the 
			//bound parameter variables are required in call_user_func_array
			$bindVars = array();
			if(count($args) != 0 ) {
				foreach($args as $key => $value) 
				    $bindVars[$key] = &$args[$key];
				$params = array_merge(array($stmt, $types), $bindVars);
				call_user_func_array('mysqli_stmt_bind_param', $params);
			}

			//Run query
			$stmt->execute();
			$stmt->store_result();

			//Retrieve meta info on the results.
			//This provides the variable names + the correct 
			//number of variables to bind the results to
			$meta = $stmt->result_metadata();
			$result = array();
			while($field = $meta->fetch_field())
				$result[$field->name] = 0;
			$meta->close();

			//In order to dynmically bind results, references to the 
			//bound result variables are required in call_user_func_array
			$bindVars = array();
			foreach($result as $key => $value) 
			    $bindVars[$key] = &$result[$key];
			$params = array_merge(array($stmt) , $bindVars);
			call_user_func_array('mysqli_stmt_bind_result', $params);

			//Format results + store each row's results for every fetch()
			$i = 0;
			while($stmt->fetch()) {
				$returnArray[$i] = array();
				foreach($result as $key => $value) {
					$returnArray[$i][] = $value;
					$returnArray[$i][$key] = $value;
				}
				$i++;
			}

			$stmt->close();

		} else {
			//Prepare may have failed because statement had varaibles 
			//on both sides of operator not allowed.  EX: ... ?=? ...
			//Try escaped strings instaed

			$args = func_get_args();
			$query = array_shift($args);
			if($args)
	  			$query = vsprintf($query, $this->escapeArgs($args));

			if(($result = $this->database_link->query($query)) instanceof MySQLi_Result) {
				$i = 0;
				while($row = $result->fetch_object()) {
					$returnArray[$i] = array();
					foreach($row as $key => $value) {
						$returnArray[$i][] = $value;
						$returnArray[$i][$key] = $value;

					}
					$i++;
				}
				$result->close();
			}
		}

		return $returnArray;
	}


	function iquery(/*$query, [[, $args [, $... ]]*/)
	{
		$args = func_get_args();
		$query = array_shift($args);

		//Available binding types mysqli accepts
		$avail_types = array("i", "d", "s", "b");

		//Get the types in the order they appear in the query
		$reg_ex = "/%[".implode($avail_types, "|")."]/";
		preg_match_all($reg_ex, $query, $matches);
		$types = str_replace("%", "", implode($matches[0]));

		//Some queries have quotes that need to be removed.
		//Also need placeholers to be ? instead of %s or %d ... etc
		$replacements = array();
		foreach($avail_types as $type)
			$replacements[] = "%".$type;
		$query = str_replace($replacements, "?", $query);

		//remove quotes
		$quote_types = array("'", "`", '“', '”');
		$diff_ways_to_quote = array();
		foreach($quote_types as $type1)
			foreach($quote_types as $type2)
				$diff_ways_to_quote[] = $type1."?".$type2;
		$query = str_replace($diff_ways_to_quote, "?", $query);

		if($stmt = $this->database_link->prepare($query)) {
			//In order to dynmically bind parameter, references to the 
			//bound parameter variables are required in call_user_func_array
			$bindVars = array();
			foreach($args as $key => $value) 
			    $bindVars[$key] = &$args[$key];
			$params = array_merge(array($stmt, $types), $bindVars);
			call_user_func_array('mysqli_stmt_bind_param', $params);

			//Run query
			$stmt->execute();
			$stmt->close();

		} else {
			//Prepare may have failed because statement had varaibles 
			//on both sides of operator not allowed.  EX: ... ?=? ...
			//Try escaped strings instaed

			$args = func_get_args();
			$query = array_shift($args);
			if($args)
	  			$query = vsprintf($query, $this->escapeArgs($args));

			if(($result = $this->database_link->query($query)) instanceof MySQLi_Result)
			 	$result->close();
		}
	}
	
	
	function getFirst(/*$query, [[, $args [, $... ]]*/)
	{
		$returnValue = "";

		$args = func_get_args();
		$query = array_shift($args);

		//Available binding types mysqli accepts
		$avail_types = array("i", "d", "s", "b");

		//Get the types in the order they appear in the query
		$reg_ex = "/%[".implode($avail_types, "|")."]/";
		preg_match_all($reg_ex, $query, $matches);
		$types = str_replace("%", "", implode($matches[0]));

		//Some queries have quotes that need to be removed.
		//Also need placeholers to be ? instead of %s or %d ... etc
		$replacements = array();
		foreach($avail_types as $type)
			$replacements[] = "%".$type;
		$query = str_replace($replacements, "?", $query);

		//remove quotes
		$quote_types = array("'", "`", '“', '”');
		$diff_ways_to_quote = array();
		foreach($quote_types as $type1)
			foreach($quote_types as $type2)
				$diff_ways_to_quote[] = $type1."?".$type2;
		$query = str_replace($diff_ways_to_quote, "?", $query);

		if($stmt = $this->database_link->prepare($query)) {
			//In order to dynmically bind parameter, references to the 
			//bound parameter variables are required in call_user_func_array
			$bindVars = array();
			foreach($args as $key => $value) 
			    $bindVars[$key] = &$args[$key];
			$params = array_merge(array($stmt, $types), $bindVars);
			call_user_func_array('mysqli_stmt_bind_param', $params);
		

			//Run query
			$stmt->execute();
			$stmt->store_result();

			//Retrieve meta info on the results.
			//Don't need variable names because only first is required, 
			//but do need the correct number of variables to bind the results to
			$meta = $stmt->result_metadata();
			$result = array();
			while($field = $meta->fetch_field())
				$result[] = 0;
			$meta->close();

			//In order to dynmically bind results, references to the 
			//bound result variables are required in call_user_func_array
			$bindVars = array();
			foreach($result as $key => $value) 
			    $bindVars[$key] = &$result[$key];
			$params = array_merge(array($stmt) , $bindVars);
			call_user_func_array('mysqli_stmt_bind_result', $params);

			//Format store first filed of first fetch() to be returned
			$stmt->fetch();
			$returnValue = $result[0];
			$stmt->close();

		} else {
			//Prepare may have failed because statement had varaibles 
			//on both sides of operator not allowed.  EX: ... ?=? ...
			//Try escaped strings instaed

			$args = func_get_args();
			$query = array_shift($args);
			if($args)
	  			$query = vsprintf($query, $this->escapeArgs($args));

			if(($result = $this->database_link->query($query)) instanceof MySQLi_Result) {
				if($row = $result->fetch_row())
					$returnValue = $row[0];
				$result->close();
			}
		}

		return $returnValue;
	}

	function escapeArgs($object)
	{
		if (is_array($object))
   			foreach ($object as $key => $value)
				if(is_array($value))
					$object[$key] = $this->escapeArgs($value);
				else
					$object[$key] = $this->escapeString($value);
  		else
    			$object = $this->escapeString($object);
  		return $object;
	}

	function escapeString($str)
	{
		if (get_magic_quotes_gpc())
			$str = stripslashes($str);
		if($this->database_link)
			$str = $this->database_link->real_escape_string($str);
		else
			$str = addslashes($str);
		return $str;
	}
}
?>