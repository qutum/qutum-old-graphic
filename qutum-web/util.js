//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Log = function (s, clazz)
{
	var dom = document.getElementById('Log')
	if (dom)
		with (dom.appendChild(document.createElement('div')))
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

canvas: function (o, font)
{
	var canv = o.appendChild(document.createElement('canvas')), draw = canv.getContext('2d')
	canv.style.display = 'block', canv.style.position = 'absolute'
	draw.font0 = font
	return draw
},

draw: function (draw, x, y, w, h)
{
	var canv = draw.canvas
	canv.style.left = x + 'px', canv.style.top = y + 'px'
	canv.width = w, canv.height = h
	draw.textBaseline = 'bottom' // 'top' 'baseline' uncompatible
	draw.font = draw.font0
	return draw
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

}

})()