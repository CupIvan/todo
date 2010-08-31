#!/usr/bin/php
<?php

class todo
{
	// PRIVATE
	private $params = array(); // параметры командной строки
	private $file   = '_1';

	// PUBLIC
	public function __construct()
	{
		$this->load();
	}

	// PRIVATE
	/** загрузка списка todo */
	private function load()
	{
		$this->list = array(0,
			array(
				't' => time(),
				'm' => 'Тестовая туду',
				's' => 'TODO',
				'h' => '',
				'v' => '',
			),
			array(
				't' => time(),
				'm' => 'Тестовая туду2',
				's' => 'TODO',
				'h' => '',
				'v' => '',
			),
			array(
				't' => time(),
				'm' => 'Первый баг',
				's' => 'BUG',
				'h' => '',
				'v' => '',
			),
			array(
				't' => time(),
				'm' => 'Тестовая туду3',
				's' => 'TODO',
				'h' => '',
				'v' => '',
			),
		);
	}
	/** сохранение записи на диск */
	private function save($a)
	{
		if (!isset($a['t'])) $a['t'] = time();
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

	// PUBLIC
	/** отображение списка тудушек */
	public function show()
	{
		for ($i = 1; $i < count($this->list); $i++)
		if ($this->list[$i]['s'] != 'FIX' || $this->list[$i]['s'] != 'DONE')
		{
			printf("%5s #%2d %s\n", $this->list[$i]['s'], $i, $this->list[$i]['m']);
		}
	}
	/** добавление новой туду */
	public function add($a)
	{
		if (!isset($a['m'])) throw new Exception("empty message");
		$a['id'] = count($this->list);
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

// наши тудушки
$todo = new todo();

// параметры командной строки
$argv = $_SERVER['argv'];
if (count($argv) == 1) $argv[1] = 'list';

// парсим ключи
$params = array();
for ($i = 0; $i < count($argv); $i++)
if ($argv[$i][0] == '-')
{
	$params[substr($argv[$i], 1)] = $argv[$i+1];
	$i++;
}

try {
	// запускаем команду
	switch ($argv[1])
	{
		case 'list':  $todo->show(); break;
		case 'add':   $n = $todo->add($params);   echo "#$n added\n"; break;
		case 'done':  $n = $todo->done($id = $argv[2]);        echo "#$id done\n";  break;
		case 'fix':   $n = $todo->done($id = $argv[2], 'FIX'); echo "#$id fixed\n"; break;
		default: $todo->help();
	}
}
catch (Exception $e)
{
	echo "ERROR! ".$e->getMessage()."\n";
}
