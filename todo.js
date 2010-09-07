/**
 * @dateModify 07.09.10
 * @version    0.1
 * @author CupIvan <mail@cupivan.ru>
 */
var todo = {}

/** инициализация */
todo.init = function(cfg_)
{
	// настройки
	var i, cfg = { color: '#FFA000', offsetBottom: '300px', side: 'left', border: 'auto' };
	for (i in cfg_) cfg[i] = cfg_[i];
	cfg.side = (cfg.side == 'right') ? 'left: 100%; margin-left: -22px' : 'left: 0';
	todo.src = cfg.src;

	// создаем HTML-код таба и формы
	var div = document.createElement('DIV');
	div.id  = 'todo';
	div.innerHTML = <r><![CDATA[
<style>
	#todo .tab {
		border: cfg.border;
		position: fixed; cfg.side; top: 100%; margin-top: -cfg.offsetBottom;
		width: 22px; height: 151px;
		background: cfg.color URL('http://cupivan.su/todo/tab.png');
	}
	#todoWindow {
		position: fixed; left: 50%; top: 50%; margin-left: -400px; margin-top: -250px;
		width: 800px; height: 500px; scroll; padding: 20px;
		background: #FFF;
		border: 2px solid #FFA000;
		-moz-border-radius: 20px;
	}
	#todoWindow .close {
		float: right; width: 20px; height: 20px; margin: -10px -10px 0 0;
		border: 2px solid #FFA000; -moz-border-radius: 20px;
		text-align: center; text-decoration: none; color: #FFA000; font: bold 17px Courier;
	}
	#todoWindow .close:hover { color: #FFF; background: #FFA000; }
	#todoWindow form { padding: 10px 0; }
	#todoWindow form .text { width: 700px; }
	#todoWindow .todoTypes a     { padding: 2px 15px; border: 1px solid #FFA000; text-decoration: none; color: #000; }
	#todoWindow .todoTypes a.act { background: #FFA000; }
	#todoTable    { overflow: auto; height: 390px; margin-top: 20px; }
	#todoTable table { border-collapse: collapse; }
	#todoTable td { text-align: center; border: 1px solid #FFA000; padding: 2px 10px; }
	#todoTable .l { text-align: left; }
	#todoTable .vote a { display: inline-block; width: 100%; background: #FFEEEE; font: 14px Verdana; }
</style>
<a href="#showWindow" onclick="return todo.togle()" class="tab"></a>
<div id="todoWindow">
	<a href="#close" onclick="return todo.togle()" title="Закрыть" class="close">x</a>
	<form>
		<label><input name="type" type="radio" value="bug" checked="checked" />Ошибка</label>
		<label><input name="type" type="radio" value="idea" />Предложение</label>
		<br/>
		<input name="text" class="text" />
		<input value="Добавить" type="submit" />
	</form>
	<div class="todoTypes">
		<a href="#tasks"     onclick="return todo.showTable('IDEA|TODO', this)">Предложения</a>
		<a href="#bugs"      onclick="return todo.showTable('BUG', this)">Ошибки</a>
		<a href="#completed" onclick="return todo.showTable('DONE|FIX', this)">Выполненные</a>
	</div>
	<div id="todoTable"></div>
</div>
]]></r>;
	for (i in cfg) div.innerHTML = div.innerHTML.replace('cfg.'+i, cfg[i]);
	$().appendChild(div);
//	todo.togle(); // скрываем
	todo.load();
}

/** отображение или скрытие формы */
todo.togle = function()
{
	$('todoWindow').style.display = $('todoWindow').style.display == '' ? 'none' : '';
	return false;
}

/** загрузка тудушек */
todo.load = function()
{
	ajax.load(todo.src, function(x)
	{
		var i, t = [0], res = eval(st = '(['+x+''+0+'])');
		// формируем массив тудушек
		for (i = 0; i < res.length - 1; i++)
		if (t[res[i].id] == undefined)
		{
			t[res[i].id]    = res[i];
			t[res[i].id].n1 = 37;
			t[res[i].id].n2 = 4;
		} else
		{
			t[res[i].id].d = res[i].d;
			t[res[i].id].s = res[i].s;
			t[res[i].id].v = res[i].v;
		}
		todo.list = t;
		todo.showTasks($('.todoTypes')[0].getElementsByTagName('a')[0]);
	});
}

/** отображение задач */
todo.showTasks = function(x)
{
	return todo.showTable('IDEA|TODO', x);
}

/** отображение завершенных */
todo.showCompleted = function(x)
{
	return todo.showTable('DONE|FIX', x);
}

/** отображение таблицы */
todo.showTable = function(status, link)
{
	var i, vote1, vote2, st = '';
	st += '<table>';
	for (i = 1; i < todo.list.length; i++)
	if (status.indexOf(todo.list[i].s) != -1)
	{
		vote1 = 'за '     + todo.list[i].n1;
		vote2 = 'против ' + todo.list[i].n2;
		if (link.href.indexOf('#completed') == -1)
		{
			vote1 = '<a href="#vote" onclick="todo.vote('+i+')" title="Голосовать за">'+vote1+'</a>';
			vote2 = '<a href="#vote" onclick="todo.vote('+i+')" title="Голосовать против">'+vote2+'</a>';
		}
		st += '<tr>'+
			'<td><span class="vote">'+ vote1 + '<br/>' + vote2 + '</span></td>'+
			'<td>#'+todo.list[i].id+'</td>'+
			'<td class="l">' +todo.list[i].m +'</td>'+
			'<td>' +(todo.list[i].v?'v'+todo.list[i].v+'<br/>':'')+todo.list[i].d+
				('TODO|BUG'.indexOf(todo.list[i].s ) != -1 ? '<br/>делаю' : '')+
				'</td>'+
		'</tr>';
	}
	st += '</table>';
	$('todoTable', st);
	// помечаем тип
	if (todo.old_link != undefined) todo.old_link.className = '';
	link.className = 'act'; todo.old_link = link;
	return false;
}


// ---------- + ---------- БИБЛИОТЕЧНЫЕ ФУНКЦИИ ---------- + ---------- //
/** поиск элемента / установка и замена текста */
function $(id, txt)
{
	var pattern, pcre, st, obj;
	if (id == undefined) id = document.body;
	if (typeof(id) == 'string' && id.charAt(0) == '.') return document.getElementsByClassName(id.replace('.',''));
	obj = typeof(id) == 'object' ? id : document.getElementById(id);
	if (!obj) obj = parent.document.getElementById(id);
	if (!obj) obj = parent.parent.document.getElementById(id);
	if (!obj) return null;
	if (txt == undefined) return obj;
	st = obj.innerHTML;
	if (typeof(txt) == 'string')
		st = txt;
	else
	for (pattern in txt)
	{
		pcre = (pattern.charAt(0) != '/') ? pattern : eval('('+pattern+')');
		st = st.replace(pcre, txt[pattern]);
	}
	obj.innerHTML = st;
}
/** подгрузка страниц */
var ajax = {
	load: function(url, post, handler)
	{
		var ajax = new XMLHttpRequest();
		if (typeof(post) == 'function')
		{
			handler = post;
			post = undefined;
		}
		ajax.open(post != undefined ? 'POST' : 'GET', url);
		ajax.onreadystatechange = function()
		{
			if (handler != undefined && ajax.readyState == 4
				&& ajax.status == 200 )
				handler(ajax.responseText);
		}
		if (post != undefined)
		ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
		ajax.send(post != undefined ? post : null);
	}
};
