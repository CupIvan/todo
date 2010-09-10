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
		$id = $_POST['id'];
		$nn = $_POST['vote'];
		$t = $todo->get($id);
		$todo->edit(array('id' => $_POST['id'], $nn => $n = $t[$nn] + 1));
		echo $n;
		break;
}
