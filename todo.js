	/**
 * @dateModify 18.09.10
 * @version    1.5
 * @author CupIvan <mail@cupivan.ru>
 */
var todo = {}
var todo_types = { 'tasks': 'IDEA|TODO', 'bugs': 'PROBLEM|BUG', 'completed': 'DONE|FIX' };

/** инициализация */
todo.init = function(cfg_)
{
	// настройки
	var i, cfg = { color: '#FFA000', offsetBottom: '300px', side: 'left', border: 'auto', params: {} };
	for (i in cfg_) cfg[i] = cfg_[i];
	cfg.side = (cfg.side == 'right') ? 'left: 100%; margin-left: -22px' : 'left: 0';
	todo.src = cfg.src;
	if (!cfg.action) cfg.action = todo.src + 'todo_html.php';
	todo.action = cfg.action;
	todo.params = cfg.params;

	// создаем HTML-код таба и формы
	var content = '\
<style>\
	#todo .tab {\
		border: cfg.border; width: 22px; height: 151px;\
		position: fixed; cfg.side; top: 100%; margin-top: -cfg.offsetBottom;\
		background: cfg.color URL("http://cupivan.ru/todo/tab.png");\
	}\
	#todoWindow {\
		position: fixed; z-index: 999;\
		left: 50%; top: 50%; margin-left: -400px; margin-top: -200px;\
		width: 800px; height: 400px; scroll; padding: 20px;\
		background: #FFF;\
		border: 2px solid #FFA000;\
		-moz-border-radius: 20px;\
	}\
	#todoWindow .close {\
		float: right; width: 20px; height: 20px; margin: -10px -10px 0 0;\
		border: 2px solid #FFA000; -moz-border-radius: 20px;\
		text-align: center; text-decoration: none; color: #FFA000; font: bold 17px Courier;\
	}\
	#todoWindow .close:hover { color: #FFF; background: #FFA000; }\
	#todoWindow form { padding: 10px 0; }\
	#todoWindow form .text { width: 700px; }\
	#todoWindow .todoTypes a     { padding: 2px 15px; border: 1px solid #FFA000; text-decoration: none; color: #000; }\
	#todoWindow .todoTypes a.act { background: #FFF9EF; }\
	#todoTable    { overflow: auto; height: 300px; margin-top: 20px; }\
	#todoTable table { width: 100%; border-collapse: collapse; background: #FFF3DF; }\
	#todoTable td    { text-align: center; border: 1px solid #FFA000; padding: 2px 10px; }\
	#todoTable .text { text-align: left; width: 100%; }\
	#todoTable .vote a { display: inline-block; width: 100%; background: #FFEEEE; font: 14px Verdana; }\
</style>\
<div id="todo">\
<a href="#showWindow" onclick="return todo.togle()" class="tab"></a>\
<div id="todoWindow">\
	<a href="#close" onclick="return todo.togle()" title="Закрыть" class="close">x</a>\
	<form onsubmit="return todo.sendTodo(this)">\
		<label><input name="type" type="radio" value="PROBLEM" checked="checked" />Ошибка</label>\
		<label><input name="type" type="radio" value="IDEA" />Предложение</label>\
		<br/>\
		<input name="text" class="text" />\
		<input value="Добавить" type="submit" />\
	</form>\
	<div class="todoTypes">\
		<a href="#tasks"     onclick="return todo.showTable(this)">Предложения</a>\
		<a href="#bugs"      onclick="return todo.showTable(this)">Ошибки</a>\
		<a href="#completed" onclick="return todo.showTable(this)">Выполненные</a>\
	</div>\
	<div id="todoTable"></div>\
</div></div>';
	for (i in cfg) content = content.replace('cfg.'+i, cfg[i]);
	if (!-[1,]) // IE, чтоб его, нихрена не умеет, пришлось извращаться >:-[
		document.write(content); // так нельзя делать, если страница уже загрузилась
	else // для нормальныхх браузеров
	{
		var div = document.createElement('DIV');
		div.innerHTML = content;
		$().appendChild(div);
	}

	todo.togle(); // скрываем
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
		var i, j, t = [0], res;
		if (typeof(x) == 'string')
		{
			res = x.replace(/^_\(/gm,'').replace(/\)$/gm,',');
			res = eval('['+res+' 0]');
			res.pop();
		} else res = x;
		// формируем массив тудушек
		for (i = 0; i < res.length; i++)
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

/** дополнительные параметры */
todo.getParams = function()
{
	var i, st = '';
	for (i in todo.params)
		st += todo.params[i] == '' ? '&' + i : '&' + i + '=' + todo.params[i];
	return st;
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
			if ($_COOKIE['vote'+i])
			{
				if ($_COOKIE['vote'+i] == 'n1')
					vote1 = '<b title="Я тоже за">' + vote1 + '</b>';
				else
					vote2 = '<b title="Я тоже против">' + vote2 + '</b>';
			}
			else
			{
				vote1 = '<a href="#vote" onclick="return todo.sendVote('+i+', \'n1\', this)" title="Голосовать за">'+vote1+'</a>';
				vote2 = '<a href="#vote" onclick="return todo.sendVote('+i+', \'n2\', this)" title="Голосовать против">'+vote2+'</a>';
			}
		}
		st += '<tr>'+
			'<td><span class="vote">'+ vote1 + '<br/>' + vote2 + '</span></td>'+
			'<td>#'+todo.list[i].id+'</td>'+
			'<td class="text">'+todo.list[i].m.replace(/</g, '&lt;').replace(/>/g, '&gt;')+'</td>'+
			'<td>'+(todo.list[i].v ? 'v'+todo.list[i].v+'<br/>' : '') +
				todo.list[i].d +
				('TODO|BUG'.indexOf(todo.list[i].s) != -1 ? '<br/>принято' : '') +
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
		'&m=' + encodeURIComponent(form.text.value) + todo.getParams();
	ajax.load(todo.action, post, function() {
		setTimeout(function(){ todo.load($$('.todoTypes a')[s=='PROBLEM'?1:0]); }, 3000);
	});
	$('todoTable', 'Ваше мнение принято. Спасибо за участие!');
	return false;
}

/** отправка голоса */
todo.sendVote = function(id, vote, link)
{
	var post = 'action=vote&id=' + id + '&vote=' + vote + todo.getParams();
	ajax.load(todo.action, post);
	setcookie('vote'+id, vote);
	todo.list[id][vote]++;
	link.parentNode.innerHTML = vote=='n1' ? 'я за' : 'я против';
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
/** текущее время в секундах */
function time() { return Math.round((new Date()).getTime() / 1000); }
/** подгрузка страниц */
var ajax = {
	load: function(url, post, handler)
	{
		if (typeof(post) == 'function')
		{
			handler = post;
			post = undefined;
		}
		// XML используем только на своем домене
		if (this.domain(document.location) == this.domain(url))
			this.loadAjax(url, post, handler);
		else
		{
			if (post == undefined)
				this.loadJS(url, handler);
			else
				this.formSend(url, post, handler);
		}
	},
	/** выделение домена из URL */
	domain: function(url)
	{
		var d = (''+url).replace(/http:\/\/([^\/]+).*/, '$1');
		return d;
	},
	/** загрузка средствами XMLHttpRequest */
	loadAjax: function(url, post, handler)
	{
		var ajax = new XMLHttpRequest();
		ajax.open(post != undefined ? 'POST' : 'GET', url);
		ajax.onreadystatechange = function()
		{
			if (handler != undefined && ajax.readyState == 4
				&& ajax.status == 200 )
				handler(ajax.responseText);
		}
		if (post != undefined)
			ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		ajax.send(post != undefined ? post : null);
	},
	/** установка .onload, из-за IE отдельная функция >:-[ */
	setOnload: function(e, handler)
	{
		e.onload = handler; // для нормальных браузеров
		if (!-[1,]) // сработет только для IE
		e.onreadystatechange = function() {
			if ('loaded|complete'.indexOf(this.readyState) != -1) handler();
		};
	},
	/** загрузка средствами JS */
	loadJS: function(url, handler)
	{
		var s  = document.createElement('SCRIPT'), i;
		s.type = 'text/javascript';
		s.src  = url;
		ajax.jsData = [];
		_ = function(x) { ajax.jsData.push(x);  } // через эту функцию JS-файл может передавать инфу
		ajax.setOnload(s, function() { handler(ajax.jsData); });
		document.body.appendChild(s);
	},
	/** отправка POST формы */
	formSend: function(url, post, handler)
	{
		// фрейм, куда будет загружен результат
		var frame = $('ajaxFrame');
		if (!frame)
		{
			frame      = document.createElement('IFRAME');
			frame.name = 'ajaxFrame';
			frame.style.display = 'none';
			$().appendChild(frame);
		}
		ajax.setOnload(frame, handler);

		// создаем форму
		var i, st, form = document.createElement('FORM');
		form.action = url;
		form.method = 'POST';
		form.target = 'ajaxFrame';
		form.style.display = 'none';
		form.innerHTML = post.replace(/([^=]+)=([^&]+)(&(amp;)?)?/g, '<textarea name="$1">$2</textarea>\n');
		$().appendChild(form);
		// отправляем
		form.submit();
	},
	/** загрузка средствами iframe */
	loadIframe: function(url, handler)
	{
		var frame = document.createElement('IFRAME');
		frame.onload = function()
		{
			var st = this.contentDocument.body.innerHTML;
			st = st.replace(/^<pre>([\s\S]+?)<\/pre>.*/, '$1');
			handler(st);
		}
		frame.src    = url;
		document.body.appendChild(frame);
	}
};
/** установка куки */
function setcookie(name, value, expires, path, domain, secure)
{
	if (expires) expires = (new Date()).setTime(expires);
	document.cookie = name + "=" + escape(value) +
		((expires) ? "; expires=" + expires.toGMTString() : "") +
		((path)    ? "; path="    + path : "") +
		((domain)  ? "; domain="  + domain : "") +
		((secure)  ? "; secure" : "");
	updatecookies();
}
/** получение куки */
function updatecookies() {
	var cookie = '' + document.cookie + ';';
	var reg    = /([^= ]+)=([^;]+);/g, res;
	$_COOKIE   = {};
	while ((res = reg.exec(cookie)) != null)
		$_COOKIE[res[1]] = res[2];
}
$_COOKIE = {}; updatecookies();
