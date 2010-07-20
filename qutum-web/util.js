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
	if ( !dom)
		document.body.appendChild(dom = document.createElement('div')), dom.id = 'Log'
	dom = dom.appendChild(document.createElement('div'))
	clazz && (dom.className = clazz), dom.textContent = s, dom.scrollIntoView()
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

Array.prototype.last = function ()
{
	return this[this.length - 1]
}
Array.prototype.remove = function (v)
{
	(v = this.indexOf(v)) >= 0 && this.splice(v, 1)
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

on: function (dom, event, This, func, args)
{
	func.call.call
	dom.addEventListener(event,
		args===true ? function (e)
		{
			try { var _; func.call(This, e); _ = true } finally { _ || $err('event error') }
		}
		: args ? function ()
		{
			try { var _; func.apply(This, args); _ = true } finally { _ || $err('event error') }
		}
		: function ()
		{
			try { var _; func.call(This); _ = true } finally { _ || $err('event error') }
		},
		false)
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