<?php
/**
 * @dateModify 30.09.10
 * @version    1.5
 * @author     CupIvan <mail@cupivan.ru>
 */
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

		$file = preg_replace('/^_\(/m', '', $file);
		$file = preg_replace('/\)$/m', ',', $file);
		$file = preg_replace('/({|, )([a-z0-9]+):/', '$1"$2$3":', $file);
		$file = json_decode("[$file 0]", TRUE);
		array_pop($file);

		// обрабатываем массив
		$this->list = array(0);
		for ($i = 0; $i < count($file); $i++)
		if (!isset($this->list[$file[$i]['id']]))
			$this->list[$file[$i]['id']] = $file[$i];
		else
		foreach ($file[$i] as $k => $v)
		{
			$this->list[$file[$i]['id']][$k] = $v;
		}
	}
	/** сохранение записи на диск */
	private function save($a)
	{
		$a['t'] = time();
		$time = date('d.m.y'); $id = $a['id']; unset($a['id']);
		$params = '';
		foreach ($a as $k => $v)
		{
			if (is_string($v) == 'string') $v = '"'.str_replace('"', '\"', $v).'"';
			$params .= ", $k:$v";
		}

		if (!@file_put_contents($fname = $this->file, "_({d:\"$time\", id:$id$params})\n", FILE_APPEND))
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
		if (isset($this->list[$i]['s']) && $this->list[$i]['s'] != 'FIX' &&
			$this->list[$i]['s'] != 'DONE' && $this->list[$i]['s'] != 'DELETE')
		{
			printf("%7s #%2d %s\n", $this->list[$i]['s'], $this->list[$i]['id'], $this->list[$i]['m']);
		}
	}
	/** добавление новой туду */
	public function add($a)
	{
		if (!isset($a['m']) || $a['m'] == '') throw new Exception("empty message");
		$a['id'] = $this->getMaxId() + 1;
		$a['s']  = isset($a['s']) ? strtoupper($a['s']) : 'IDEA';
		$this->list[] = $a;
		$this->save($a);
		return $a['id'];
	}
	/** изменение тудушки */
	public function edit($a)
	{
		$a['id'] = (int)$a['id']; $n = -1;
		for ($i = 0; $i < count($this->list); $i++)
			if ($this->list[$i]['id'] == $a['id']) $n = $i;
		if ($n < 0) throw new Exception("#$id not found");
		$this->list[] = $a;
		$this->save($a);
		return $a['id'];
	}
	/** удаление тудушки */
	public function delete($id)
	{
		if (!isset($this->list[$id])) throw new Exception("#$id no found");
		$this->save(array('id' => $id, 's' => 'DELETE'));
		return $id;
	}
	/** туду выполнено */
	public function done($id, $state = 'DONE')
	{
		if (!isset($this->list[$id])) throw new Exception("#$id no found");
		$s = $this->list[$id]['s'];
		if ((($s == 'TODO' || $s == 'IDEA')    && $state != 'DONE') ||
			(($s == 'BUG'  || $s == 'PROBLEM') && $state != 'FIX')) throw new Exception("#$id cannot change state $s to $state");
		if ($state == $this->list[$id]['s'])   throw new Exception("#$id already $state");
		$this->save(array('id' => $id, 's' => $state));
		return $id;
	}
	/** поиск тудушки */
	public function get($id)
	{
		$res = array();
		for ($i = 0; $i < count($this->list); $i++)
			if ($this->list[$i]['id'] == $id)
				foreach ($this->list[$i] as $k => $v)
					$res[$k] = $v;
		return $res;
	}
}

