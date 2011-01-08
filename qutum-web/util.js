//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Log = function (s, clazz)
{
	var log = document.getElementById('Log')
	if (log)
		with (log.appendChild(document.createElement('div')))
			className = clazz ? 'line ' + clazz : 'line', textContent = s, scrollIntoView()
	else
		document.body.appendChild(document.createElement('div')).id = 'Log',
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
},

pageX: function (o)
{
	for (var p = o.offsetParent, x = p ? o.scrollLeft : 0; p; p = (o = p).offsetParent)
		x += o.offsetLeft - o.scrollLeft + (HTML == 'w' ? o.clientLeft : 0)
	return x
},

pageY: function (o)
{
	for (var p = o.offsetParent, y = p ? o.scrollTop : 0; p; p = (o = p).offsetParent)
		y += o.offsetTop - o.scrollTop + (HTML == 'w' ? o.clientTop : 0)
	return y
},

}

var HTML = Util.HTML
	= /WebKit/.test(navigator.userAgent) ? 'w' // Chrome, Safari, etc
	: /Gecko/.test(navigator.userAgent) ? 'g' // Firefox, etc
	: /Presto/.test(navigator.userAgent) ? 'p' // Opera, etc
	: 'w'

})()