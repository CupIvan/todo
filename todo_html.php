<?php
if (!isset($_POST['action'])) exit;

switch ($_GET['site'])
{
	case 'si':    chdir('../sadowajaimperija/'); break;
	case 'mff':   chdir('../myfreefarm/');       break;
	case 'kupon': chdir('../kupon/');            break;
	default: exit;
}

require_once 'todo.php';
$todo = new todo();

$params = $_POST;
unset($params['action']);
if (isset($params['m']))
	$params['m'] = urldecode($params['m']);

switch($_POST['action'])
{
	case 'add':
		$todo->add($params);
		break;
	case 'vote':
		$id = $params['id'];
		$nn = $params['vote']; unset($params['vote']);
		$t = $todo->get($id);
		$params[$nn] = $t[$nn] + 1;
		$todo->edit($params);
		setcookie("vote$id", $nn=='n1' ? 1 : -1);
		break;
}

