<?PHP
	$url = 'https://bad-api-assignment.reaktor.com';
	$cursor = $_SERVER['HTTP_CURSOR'];
	$json = file_get_contents($url.$cursor);
	echo($json);
?>
