#!/usr/bin/php
<?php

class todo
{
	// PRIVATE
	private $params = array(); // параметры командной строки
	private $file   = 'todo';

	// PUBLIC
	public function __construct()
	{
		$this->file = $this->findTodoFile();
		$this->load();
	}

	// PRIVATE
	/** поиск файла с тудушками */
	private function findTodoFile()
	{
		$path = $path_orig = getcwd();
		while (!file_exists($p = "$path/todo"))
		{
			if (file_exists("$path/.git")) break;
			if ($path == '') { $p = "$path_orig/todo"; break; }
			$path = preg_replace('/\/[^\/]+$/', '', $path);
		}
		return $p;
	}
	/** загрузка списка todo */
	private function load()
	{
		$file = @file_get_contents($fname = $this->file);

		$file = preg_replace('/({|, )([a-z]+):/', '$1"$2$3":', $file);
		$file = json_decode("[$file 0]", TRUE);
		array_pop($file);

		// обрабатываем массив
		$this->list = array(0);
		for ($i = 0; $i < count($file); $i++)
		if (!isset($this->list[$file[$i]['id']]))
			$this->list[$file[$i]['id']] = $file[$i];
		else
			$this->list[$file[$i]['id']]['s'] = $file[$i]['s'];
	}
	/** сохранение записи на диск */
	private function save($a)
	{
		$a['t'] = time();
		$time = date('\d:"d.m.y"', $a['t']);
		$id   = $a['id'];

		$params = '';
		foreach ($a as $k => $v)
		{
			if (is_string($v) == 'string') $v = '"'.str_replace('"', '\"', $v).'"';
			$params .= ", $k:$v";
		}

		if (!@file_put_contents($fname = $this->file, '{'."$time$params},\n", FILE_APPEND))
			throw new Exception("Cannot write to file '$fname'");
	}
	/** максимальный идентификатор записи */
	private function getMaxId()
	{
		$id = 0;
		for ($i = 1; $i < count($this->list); $i++)
			if ($this->list[$i]['id'] > $id) $id = $this->list[$i]['id'];
		return $id;
	}

	// PUBLIC
	/** отображение списка тудушек */
	public function show()
	{
		if (!count($this->list)) echo "No todo found\n";
		for ($i = 1; $i < count($this->list); $i++)
		if (isset($this->list[$i]['s']) && $this->list[$i]['s'] != 'FIX' && $this->list[$i]['s'] != 'DONE')
		{
			printf("%5s #%2d %s\n", $this->list[$i]['s'], $this->list[$i]['id'], $this->list[$i]['m']);
		}
	}
	/** добавление новой туду */
	public function add($a)
	{
		if (!isset($a['m'])) throw new Exception("empty message");
		$a['id'] = $this->getMaxId() + 1;
		$this->list[] = $a;
		$this->save($a);
		return $a['id'];
	}
	/** туду выполнено */
	public function done($id, $state = 'DONE')
	{
		if (!isset($this->list[$id])) throw new Exception("#$id no found");
		$s = $this->list[$id]['s'];
		if (($s == 'TODO' && $state != 'DONE') ||
			($s == 'BUG'  && $state != 'FIX')) throw new Exception("#$id cannot change state $s to $state");
		$this->save(array('id' => $id, 's' => $state, 'm' => $this->list[$id]['s']." -> $state"));
		return $id;
	}
	/** помощь по командам */
	public function help()
	{ echo
"Usage: todo [CMD] [-m TEXT] [-t TYPE]
Commands:
  no_command    - write all todo
  add           - add one item
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
}

// параметры командной строки
$argv = $_SERVER['argv'];
if (count($argv) == 1) $argv[1] = 'list';

// парсим ключи
$params = array('s' => 'TODO');
for ($i = 0; $i < count($argv); $i++)
if ($argv[$i][0] == '-')
{
	$params[substr($argv[$i], 1)] = @$argv[$i + 1];
	$i++;
}

try {
	// наши тудушки
	$todo = new todo();

	// запускаем команду
	switch ($argv[1])
	{
		case 'list':  $todo->show(); break;
		case 'add':   $n = $todo->add($params);                     echo "#$n added\n"; break;
		case 'done':  $n = $todo->done($id = (int)$argv[2]);        echo "#$id done\n";  break;
		case 'fix':   $n = $todo->done($id = (int)$argv[2], 'FIX'); echo "#$id fixed\n"; break;
		default: $todo->help();
	}
}
catch (Exception $e)
{
	echo "ERROR! ".$e->getMessage()."\n";
}
