//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Edit = function (dom)
{
	this.mobileSafari = navigator.userAgent.search('Mobile') >= 0 && navigator.userAgent.search('Safari') >= 0
	this.dom = dom
	dom.style.overflow = 'scroll', dom.style.position = 'relative'
	var whole = this.whole = dom.appendChild(document.createElement('div')),
		css = getComputedStyle(whole, null)
		font = css.fontWeight + ' ' + css.fontSize + ' "' + css.fontFamily + '"',
		draw = setDraw(canvas(whole, font), 50, 50)
	this.draw = draw
	this.drawName = setDraw(canvas(whole, font), 50, 50)
	this.drawHit = setDraw(canvas(whole, font), 50, 50)
	this.drawDrag = setDraw(canvas(whole, font), 50, 50)
	this.nameH = parseInt(css.fontSize, 10)
	this.nameTvW = Math.max(draw.measureText('?').width, draw.measureText('!').width) | 0

	var z = this.zonest = new Datum(0)
	z.edit = this
	z.addTo(null, 0, 0)
	Layer2(z)
	z.view(4), z.layoutDetail(), z.layout(false)
	setDraw(draw, z.w, z.h)
	setDraw(this.drawName, z.w, z.h)
	z.draw(draw, this.drawName)
}
var Alert = alert
alert = function (v)
{
	Alert.call(null, Array.prototype.join.call(arguments, ' '))
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
function canvas(o, font)
{
	var canv = o.appendChild(document.createElement('canvas')), draw = canv.getContext('2d')
	canv.style.display = 'block', canv.style.position = 'absolute'
	draw.font0 = font
	return draw
}
function setDraw(draw, w, h)
{
	var canv = draw.canvas
	canv.width = w, canv.height = h
	draw.textBaseline = 'bottom' // 'top' 'baseline' uncompatible
	draw.font = draw.font0
	return draw
}

Edit.prototype =
{
zonest: null,
now: null,
nowR: 0,
nowX: 0,
keyOn: 0,
keyOff: 0,
keyTime: 0,
hit: null,
hitX: 0,
hitY: 0,
drag: false,
dragX: 0,
dragY: 0,

dom: null,
whole: null,
draw: null,
drawName: null,
drawHit: null,
drawDrag: null,
nameH: 0,
nameTvW: 0,
name: null,
unities: true,
unity: null,
refresh: false,

com: null,
unsave: 0,
saveUs: null, // {}
error: 0,
yields: null, // []

// r and x is -1 by default, nav is true by default
nowing: function (now, r, x, nav)
{
	if (this.drag)
		return
	if ( !now)
		throw 'null now'
	var now0 = this.now
	this.now = now
	this._nowing(r, x)
	if (nav !== false && now0 != now)
		now.nowPrev && (now.nowPrev.nowNext = now.nowNext),
		now.nowNext && (now.nowNext.nowPrev = now.nowPrev),
		now.nowPrev = now0,
		now.nowNext = null,
		now0.nowNext && (now0.nowNext.nowPrev = null),
		now0.nowNext = now
// TODO no name edit
	this.refresh = true
	now instanceof Datum && now.detail < 2 && now.view(2)
},

_nowing: function (r, x)
{
	if (this.now == this.zonest || !(this.now instanceof Datum))
		this.nowR = nowX = -1
	else if (r >= 0 && x >= 0)
		this.nowR = r, this.nowX = x
	else
		this.nowR = this.now.zone.rows.indexOf(this.now.row),
		this.nowX = this.now.row.indexOf(this.now)
},

view: function ()
{
	
},

}

})()
