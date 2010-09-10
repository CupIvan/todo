	/**
 * @dateModify 11.09.10
 * @version    0.3
 * @author CupIvan <mail@cupivan.ru>
 */
var todo = {}
var todo_types = { 'tasks': 'IDEA|TODO', 'bugs': 'PROBLEM|BUG', 'completed': 'DONE|FIX' };

/** инициализация */
todo.init = function(cfg_)
{
	// настройки
	var i, cfg = { color: '#FFA000', offsetBottom: '300px', side: 'left', border: 'auto' };
	for (i in cfg_) cfg[i] = cfg_[i];
	cfg.side = (cfg.side == 'right') ? 'left: 100%; margin-left: -22px' : 'left: 0';
	todo.src = cfg.src;
	if (!cfg.action) cfg.action = todo.src + 'todo_html.php';
	todo.action = cfg.action;

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
	<form onsubmit="return todo.sendTodo(this)">
		<label><input name="type" type="radio" value="PROBLEM" checked="checked" />Ошибка</label>
		<label><input name="type" type="radio" value="IDEA" />Предложение</label>
		<br/>
		<input name="text" class="text" />
		<input value="Добавить" type="submit" />
	</form>
	<div class="todoTypes">
		<a href="#tasks"     onclick="return todo.showTable(this)">Предложения</a>
		<a href="#bugs"      onclick="return todo.showTable(this)">Ошибки</a>
		<a href="#completed" onclick="return todo.showTable(this)">Выполненные</a>
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
todo.load = function(link)
{
	ajax.load(todo.src+'todo?'+time(), function(x)
	{
		var i, j, t = [0], res = eval(st = '(['+x+''+0+'])');
		// формируем массив тудушек
		for (i = 0; i < res.length - 1; i++)
		if (t[res[i].id] == undefined)
		{
			t[res[i].id]    = res[i];
			t[res[i].id].n1 = res[i].n1 ? res[i].n1 : 0;
			t[res[i].id].n2 = res[i].n2 ? res[i].n2 : 0;
		} else
		{
			for (j in res[i])
				t[res[i].id][j] = res[i][j];
		}
		todo.list = t;
		if (!link) link = $$('.todoTypes a')[0];
		todo.showTable(link);
	});
}

/** отображение таблицы */
todo.showTable = function(link)
{
	var i, vote1, vote2, st = '', status = todo_types[link.href.replace(/.+#/, '')];
	st += '<table>';
	for (i = 1; i < todo.list.length; i++)
	if (status.indexOf(todo.list[i].s) != -1)
	{
		vote1 = 'за '     + todo.list[i].n1;
		vote2 = 'против ' + todo.list[i].n2;
		if (link.href.indexOf('#completed') == -1)
		{
			vote1 = '<a href="#vote" onclick="return todo.sendVote('+i+', \'n1\', this)" title="Голосовать за">'+vote1+'</a>';
			vote2 = '<a href="#vote" onclick="return todo.sendVote('+i+', \'n2\', this)" title="Голосовать против">'+vote2+'</a>';
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

/** отправка тудушки */
todo.sendTodo = function(form)
{
	var s, post = 'action=add' +
		'&s=' + (s = (form.type[0].checked ? form.type[0].value : form.type[1].value)) +
		'&m=' + encodeURIComponent(form.text.value);
	ajax.load(todo.action, post, function() {
		setTimeout(function(){ todo.load($$('.todoTypes a')[s=='PROBLEM'?1:0]); }, 3000);
	});
	$('todoTable', 'Ваше мнение принято. Спасибо за участие!');
	return false;
}

/** отправка голоса */
todo.sendVote = function(id, vote, link)
{
	// TODO: два раза голосовать нельзя!
	var post = 'action=vote&id=' + id + '&vote=' + vote;
	ajax.load(todo.action, post, function(x){
		todo.list[id][vote] = x;
		link.innerHTML = link.innerHTML.replace(/(\d+)/, x);
	});
	return false;
}

// ---------- + ---------- БИБЛИОТЕЧНЫЕ ФУНКЦИИ ---------- + ---------- //
/** поиск элементов в dom
 * @return array
 */
function $$(st) // $$("#id .class tag")
{
	var i, j, k, els = [document], els_, e;
	st = st.split(' ');
	for (i = 0; i < st.length; i++)
	{
		els_ = [];
		for (j = 0; j < els.length; j++)
		{
			if (st[i][0] == '#')
				e = els[j].getElementById(st[i].replace(/./, ''));
			else
			if (st[i][0] == '.')
				e = els[j].getElementsByClassName(st[i].replace(/./, ''));
			else
				e = els[j].getElementsByTagName(st[i]);
			for (k = 0; k < e.length; k++)
			els_.push(e[k]);
		}
		els = [].concat(els_);
	}
	return els;
}
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
