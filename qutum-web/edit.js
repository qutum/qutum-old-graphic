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
	this.drawDrag = Util.canvas(whole, font)
	this.nameH = parseInt(css.fontSize, 10)
	this.nameTvW = this.draw.measureText('?').width | 0
	css = font = null
	Util.on(dom, 'scroll', this, this.show)
	Util.on(window, 'resize', this, this.show)
	Util.on(dom, 'mousemove', this, this.Hit, true)
	Util.on(dom, 'mousedown', this, this.Hit, true)
	Util.on(dom, 'mouseup', this, this.Hit, true)

	var z = this.zonest = new Datum(0)
	z.edit = this
	z.addTo(null, 0, 0)
	this.Now(z, -1, -1, false)
	Layer2(z)
	z.show(4)
}

Edit.prototype =
{

zonest: null,
now: null,
nowR: 0,
nowD: 0,
keyOn: 0,
keyOff: 0,
keyTime: 0,
hit: null,
hitX: 0, // relative to page
hitY: 0, // relative to page
drag: false,
dragX: 0,
dragY: 0,

dom: null,
whole: null,
draw: null,
drawHit: null,
drawDrag: null,
nameH: 0,
nameTvW: 0,
name: null,
showing: 0,
hitting: 0,

com: null,
unsave: 0,
saveUs: null, // {}
error: 0,
yields: null, // []

// r and x is -1 by default, nav is true by default
Now: function (now, r, x, nav)
{
	if (this.drag)
		return
	if ( !now)
		throw 'null now'
	var now0 = this.now
	this.now = now
	this._Now(r, x)
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

_Now: function (r, x)
{
	if (this.now == this.zonest || !(this.now instanceof Datum))
		this.nowR = nowD = -1
	else if (r >= 0 && x >= 0)
		this.nowR = r, this.nowD = x
	else
		this.nowR = this.now.zone.rows.indexOf(this.now.row),
		this.nowD = this.now.row.indexOf(this.now)
},

////////////////////////////////      ////////////////////////////////
//////////////////////////////// view ////////////////////////////////
////////////////////////////////      ////////////////////////////////

show: function (edit)
{
	if (this.showing >= 0)
		Util.timer(this.showing - Date.now(), this, this._show), this.showing = -1
},

_show: function ()
{
	try
	{
		var time = Date.now(), z = this.zonest, m = this.dom
		z.layoutDetail(), z.layout(false)
		this.whole.style.width = z.w + 'px', this.whole.style.height = z.h + 'px'
		Util.draw(this.draw, m.scrollLeft, m.scrollTop, m.clientWidth, m.clientHeight)
		z._show(this.draw, m.scrollLeft, m.scrollTop, m.clientWidth, m.clientHeight)
		this._Hit()
	}
	finally
	{
		this.showing = -time + (time = Date.now()) + time + 50
	}
},

Hit: function (e)
{
	this.hitX = e.clientX + pageXOffset
	this.hitY = e.clientY + pageYOffset
	if (e.type == 'mousedown')
		this._Hit(true)
	else if (e.type == 'mouseup')
		this._Hit(false, e.shiftKey ? 4 : 3)
	else if (this.hitting >= 0)
		Util.timer(this.hitting - Date.now(), this, this._Hit), this.hitting = -1
},

_Hit: function (down, up)
{
	this.hitting = Date.now() + 80
	var x = this.hitX, y = this.hitY, m = this.dom
	do
		x += m.scrollLeft - m.offsetLeft - m.clientLeft,
		y += m.scrollTop - m.offsetTop - m.clientTop
	while (m = m.offsetParent)
	var xy = [ x, y ], h = this.hit = this.zonest.hit(xy), now
	if ( !h)
		Util.draw(this.drawHit, 0, 0, 0, 0)
	else if (down)
		this.Now(h)
	else if ( !up)
		h.Hit(this.drawHit, xy[0], xy[1])
	else if ((now = this.now) == h && now instanceof Datum && now.detail < up)
		now.show(up)
},

}

})()
