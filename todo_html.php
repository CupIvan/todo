<?php
if (!isset($_POST['action'])) exit;

switch ($_GET['site'])
{
	case 'si': chdir('../sadowajaimperija/'); break;
	default: exit;
}

require_once 'todo.php';
$todo = new todo();

$params = $_POST;
unset($params['action']);
$params['m'] = urldecode($params['m']);

switch($_POST['action'])
{
	case 'add':
		$todo->add($params);
		break;
	case 'vote':
		$todo->edit($_POST['id'], $params);
		break;
}
