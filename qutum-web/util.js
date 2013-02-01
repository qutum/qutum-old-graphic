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
		l = Util.add(log, 'div'), l.textContent = s, l.scrollIntoView()
	l.className = clazz ? 'line ' + clazz : 'line'
	L = null
	return l
}
LogTo = function (log)
{
	L = log
}
Info = function (v)
{
	return Log(Array.prototype.join.call(arguments, ' '))
}
Err = function (v)
{
	return Log(Array.prototype.join.call(arguments, ' '), 'err')
}
Assert = function (v, err)
{
	v || Log('ASSERT ' + Array.prototype.slice.call(arguments, 1).join(' '), 'err')
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
ArrayFind = function (s, key, v)
{
	for (var i = 0, a; a = s[i]; i++)
		if (a[key] == v)
			return i
	return null
}
NoKey = function (s)
{
	for (var k in s)
		return false
	return true
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
			try { var _; func.call(This); _ = true } finally { _ || Err('event fatal') }
		}
		: args ? function ()
		{
			try { var _; func.apply(This, args); _ = true } finally { _ || Err('event fatal') }
		}
		: function (e)
		{
			try { var _; func.call(This, e); _ = true } finally { _ || Err('event fatal') }
		},
		!!capture)
},

timer: function (time, This, func, args)
{
	func.call.call
	return setTimeout(args ? function ()
		{
			try { var _; func.apply(This, args); _ = true } finally { _ || Err('timer fatal') }
		}
		: function ()
		{
			try { var _; func.call(This); _ = true } finally { _ || Err('timer fatal') }
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

shortest: function (xs, ys, Xs, Ys)
{
	var dx, dy, Dx, Dy
	for (var i = 0, D = 1/0; i < xs.length; i++)
		for (var I = 0, d; I < Xs.length; I++)
			if (d = (d = xs[i] - Xs[I]) * d + (d = ys[i] - Ys[I]) * d, d < D)
				D = d, dx = xs[i], dy = ys[i], Dx = Xs[I], Dy = Ys[I]
	if (dx != null)
		xs[0] = dx, ys[0] = dy, Xs[0] = Dx, Ys[0] = Dy
	return dx != null
},

}

})()