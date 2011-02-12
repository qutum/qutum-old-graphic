//
// Qutum 10 implementation
// Copyright 2008-2011 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

var HTML
	= /WebKit/.test(navigator.userAgent) ? 'w' // Chrome, Safari, etc
	: /Gecko/.test(navigator.userAgent) ? 'g' // Firefox, etc
	: /Presto/.test(navigator.userAgent) ? 'p' // Opera, etc
	: 'w'

Log = function (s, clazz)
{
	var log = document.getElementById('Log')
	if (log)
		with (Util.add(log, 'div', clazz ? 'line ' + clazz : 'line'))
			textContent = s, scrollIntoView()
	else
		Util.add(document.body, 'div', null, 'Log'),
		setTimeout(Log, 0, s, clazz) // size rendering bug on WebKit
}
$info = function (v)
{
	Log(Array.prototype.join.call(arguments, ' '))
	return v
}
$err = function (v)
{
	Log(Array.prototype.join.call(arguments, ' '), 'err')
	return v
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

saveN: HTML != 'g' ? function (out, n)
{
	out.push(String.fromCharCode(n & 65535, n >>> 16))
}
: function (out, n) // localStorage \ufffe \uffff bug on Firefox
{
	var l = n & 65535, h = n >>> 16
	out.push(l < 65533 && h < 65533 ? String.fromCharCode(l, h)
		: l < 65533 ? String.fromCharCode(l, 65533, 65535 - h)
		: h < 65533 ? String.fromCharCode(65533, 65535 - l, h)
		: String.fromCharCode(65533, 65535 - l, 65533, 65535 - h))
},

saveS: function (out, s)
{
	out.push(String.fromCharCode(s.length & 65535, s.length >>> 16), s)
},

loadN: HTML != 'g' ? function (In)
{
	var x = In.x, n = In.charCodeAt(x) | In.charCodeAt(x + 1) << 16 
	In.x = x + 2
	return n
}
: function (In, stay)
{
	var x = In.x, l = In.charCodeAt(x)
	l >= 65533 && (l = 65535 - In.charCodeAt(++x))
	var h = In.charCodeAt(x + 1)
	h >= 65533 && (h = 65535 - In.charCodeAt(++x + 1))
	In.x = x + 2
	return l | h << 16
},

loadN14: function (In)
{
	return In.charCodeAt(In.x)
},

loadS: function (In)
{
	var x = In.x, n = In.charCodeAt(x) | In.charCodeAt(x + 1) << 16 
	In.x = x + 2 + n
	return In.substr(x + 2, n)
},

}

})()