#!/usr/bin/php
<?php
require_once 'todo.php';

/** помощь по командам */
function help()
{ echo
"Usage: todo [CMD] [-m TEXT] [-t TYPE]
Commands:
  no_command    - write all todo
  add           - add one item
  edit          - edit todo
  bugs          - write all bugs
  link N1 to N2 - link todo (N1) to target (N2)
  --help        - write this help
Keys:
  -m - text of todo
  -t - type of todo: todo (default), done, bug, fix, message
  -a - add todo file
Examples:
  todo add -m 'To do someting'
  todo done 1
  todo add -t bug -m 'Something wrong'
  todo fix 1 -m 'something fixed'
  todo add -t bug -m 'Something wrong2'
  todo link 3 to 2
";
}


// параметры командной строки
$argv = $_SERVER['argv'];
if (count($argv) == 1) $argv[1] = 'list';

// парсим ключи
$params = array('id' => 0);
for ($i = 0; $i < count($argv); $i++)
if ($argv[$i][0] == '-')
{
	$params[substr($argv[$i], 1)] = @$argv[$i + 1];
	$i++;
}
// заменяем ключ -t на -s
if (isset($params['t'])) $params['s'] = $params['t'];

try {
	// наши тудушки
	$todo = new todo();

	// запускаем команду
	switch ($argv[1])
	{
		case 'list':  $todo->show(); break;
		case 'add':   $n = $todo->add($params);                     echo "#$n added\n"; break;
		case 'edit':  $n = $todo->edit($argv[2], $params);          echo "#$n modified\n"; break;
		case 'done':  $n = $todo->done($id = (int)$argv[2]);        echo "#$id done\n";  break;
		case 'fix':   $n = $todo->done($id = (int)$argv[2], 'FIX'); echo "#$id fixed\n"; break;
		default: help();
	}
}
catch (Exception $e)
{
	echo "ERROR! ".$e->getMessage()."\n";
}
