//
// Qutum 10 implementation
// Copyright 2008-2013 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

var HTML
	= /WebKit/.test(navigator.userAgent) ? 'w' // Chrome, Safari, etc
	: /Gecko/.test(navigator.userAgent) ? 'g' // Firefox, etc
	: /Presto/.test(navigator.userAgent) ? 'p' // Opera, etc
	: 'w'

var L
Log = function (s, clazz)
{
	var log = document.getElementById('Log'), l = L
	log || (log = Util.add(document.body, 'div', null, 'Log'))
	if (l)
		l.textContent = l.textContent + s
	else
		l = Util.add(log, 'div', clazz ? 'line ' + clazz : 'line'),
		l.textContent = s, l.scrollIntoView()
	return l
}
$info = function (v)
{
	return Log(Array.prototype.join.call(arguments, ' '))
}
$err = function (v)
{
	return Log(Array.prototype.join.call(arguments, ' '), 'err')
}
$logmore = function (log)
{
	L = log
}

ArrayLast = function (s)
{
	return s[s.length - 1]
}
ArrayRem = function (s, v)
{
	(v = s.indexOf(v)) >= 0 && s.splice(v, 1)
	return s
}

Util =
{

HTML: HTML,

dom: function (css, dom)
{
	return (dom || document).querySelector(css)
},

add: function (to, tag, clazz, id)
{
	var o = document.createElement(tag)
	id && (o.id = id)
	clazz && (o.className = clazz)
	to && to.appendChild(o)
	return o
},

on: function (dom, event, This, func, args, capture)
{
	func.call.call
	dom.addEventListener(event,
		args===null ? function ()
		{
			try { var _; func.call(This); _ = true } finally { _ || $err('event error') }
		}
		: args ? function ()
		{
			try { var _; func.apply(This, args); _ = true } finally { _ || $err('event error') }
		}
		: function (e)
		{
			try { var _; func.call(This, e); _ = true } finally { _ || $err('event error') }
		},
		!!capture)
},

timer: function (time, This, func, args)
{
	func.call.call
	return setTimeout(args ? function ()
		{
			try { var _; func.apply(This, args); _ = true } finally { _ || $err('timer error') }
		}
		: function ()
		{
			try { var _; func.call(This); _ = true } finally { _ || $err('timer error') }
		},
		time >= 0 ? time : 0)
},

canvas: function (o, font, absolute)
{
	var canv = o.appendChild(document.createElement('canvas')), draw = canv.getContext('2d')
	absolute && (canv.style.display = 'block', canv.style.position = 'absolute')
	draw.font0 = font
	return draw
},

draw: function (draw, x, y, w, h)
{
	var canv = draw.canvas
	canv.style.left = x + 'px', canv.style.top = y + 'px'
	canv.width = w, canv.height = h
	draw.textBaseline = 'bottom'
	draw.font = draw.font0
	return draw
},

text: function (dom, text)
{
	dom.innerHTML = text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
		.replace(/\n|\r\n/g, '<br>').replace(/\t/g, '\u00a0 \u00a0 ').replace(/  /g, '\u00a0 ')
	return dom
},

pageX: function (o)
{
	var w = HTML == 'w' || 0
	for (var p = o.offsetParent, x = p ? o.scrollLeft : 0; p; p = (o = p).offsetParent)
		x += o.offsetLeft - o.scrollLeft + (w && o.clientLeft)
	return x
},

pageY: function (o)
{
	var w = HTML == 'w' || 0
	for (var p = o.offsetParent, y = p ? o.scrollTop : 0; p; p = (o = p).offsetParent)
		y += o.offsetTop - o.scrollTop + (w && o.clientTop)
	return y
},

saveN: function (out, n)
	// Webkit localStorage can't save \0 and Firefox \ud800-\udfff \ufffe \uffff
{
	if (n >> 13 == n >> 31) // 14bit
		out.push(String.fromCharCode(n << 1 & 0x7ffe | 1))
	else if (n >> 27 == n >> 31) // 28bit
		out.push(String.fromCharCode(n & 0x3fff | 0x8000, n >> 13 & 0x7ffe | 1))
	else
		throw 'number overflow'
},

saveS: function (out, s)
{
	var n = s.length
	if (n >> 13 == n >> 31) // 14bit
		out.push(String.fromCharCode(n << 1 & 0x7ffe | 1), s)
	else if (n >> 27 == n >> 31) // 28bit
		out.push(String.fromCharCode(n & 0x3fff | 0x8000, n >> 13 & 0x7ffe | 1), s)
	else
		throw 'string too long'
},

loadN: function (In, stay)
{
	var x = In.x, l = In.charCodeAt(x)
	if (l < 32768)
		In.x = x + 1, l = l << 17 >> 18
	else if ((h = In.charCodeAt(x + 1)) == h)
		In.x = x + 2, l = h >> 1 << 18 >> 4 | l & 0x3fff
	else
		throw 'eof'
	return l
},

loadN14: function (In)
{
	return In.charCodeAt(In.x) << 17 >> 18
},

loadS: function (In)
{
	var x = In.x, l = In.charCodeAt(x)
	if (l < 32768)
		x = x + 1, l = l << 17 >> 18
	else if ((h = In.charCodeAt(x + 1)) == h)
		x = x + 2, l = h >> 1 << 18 >> 4 | l & 0x3fff
	else
		throw 'eof'
	if ((In.x = x + l) > In.length)
		throw 'eof'
	return In.substr(x, l)
},

}

})()