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
	this.draw = Util.draw(Util.canvas(whole, font), 0, 0, 50, 50)
	this.drawHit = Util.canvas(whole, font)
	this.drawNow = Util.canvas(whole, font)
	this.drawDrag = Util.canvas(whole, font)
	this.nameH = parseInt(css.fontSize, 10)
	this.nameTvW = this.draw.measureText('?').width | 0
	this.showing = Date.now()
	dom.addEventListener('scroll', show, false)
	window.addEventListener('resize', show, false)
	function show() { This.show() }

	var This = this, z = this.zonest = new Datum(0)
	z.edit = this
	z.addTo(null, 0, 0)
	this.nowing(z, -1, -1, false)
	Layer2(z)
	z.show(4)
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
drawHit: null,
drawNow: null,
drawDrag: null,
nameH: 0,
nameTvW: 0,
name: null,
showing: 0,

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
	now instanceof Datum && now.detail < 2 && now.show(2)
	this.show()
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

////////////////////////////////      ////////////////////////////////
//////////////////////////////// view ////////////////////////////////
////////////////////////////////      ////////////////////////////////

show: function (edit)
{
	if ( !edit)
	{
		if (this.showing >= 0)
			setTimeout(this.show, this.showing - Date.now(), this), this.showing = -1
		return true
	}
	var now = Date.now(), z = edit.zonest, dom = edit.dom
	z.layoutDetail(), z.layout(false)
	edit.whole.style.width = z.w + 'px', edit.whole.style.height = z.h + 'px'
	Util.draw(edit.draw, dom.scrollLeft, dom.scrollTop, dom.clientWidth, dom.clientHeight)
	z.show(null, edit.draw, dom.scrollLeft, dom.scrollTop, dom.clientWidth, dom.clientHeight)
	edit.showing = -now + (now = Date.now()) + now + 50
},

}

})()
