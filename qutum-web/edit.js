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
	dom.tabIndex = 0
	var whole = this.whole = dom.appendChild(document.createElement('div')),
		css = getComputedStyle(whole, null)
		font = css.fontWeight + ' ' + css.fontSize + ' "' + css.fontFamily + '"',
	this.draw = Util.draw(Util.canvas(whole, font), 0, 0, 50, 50)
	this.drawHit = Util.canvas(whole, font)
	this.drawDrag = Util.canvas(whole, font)
	this.nameH = parseInt(css.fontSize, 10)
	this.nameTvW = this.draw.measureText('?').width | 0
	css = font = null
	Util.on(dom, 'scroll', this, this.show, null)
	Util.on(window, 'resize', this, this.show, null)
	Util.on(dom, 'mousemove', this, this.Hit)
	Util.on(dom, 'mousedown', this, this.Hit)
	Util.on(dom, 'keydown', this, this.key)
	Util.on(dom, 'keypress', this, this.key)
	Util.on(dom, 'keyup', this, this.key)

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
nowScroll: false,
keyType: '',
keyDown: 0,
keyUp: 0,
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

// r and d is -1 by default, nav is true by default, show is 2 by default
Now: function (now, r, d, nav, show)
{
	if (this.drag)
		return
	if ( !now)
		throw 'null now'
	var now0 = this.now
	if (nav !== false && now0 != now)
		now.nowPrev && (now.nowPrev.nowNext = now.nowNext),
		now.nowNext && (now.nowNext.nowPrev = now.nowPrev),
		now.nowPrev = now0,
		now.nowNext = null,
		now0.nowNext && (now0.nowNext.nowPrev = null),
		now0.nowNext = now
	this.nowScroll = now0 != now
// TODO no name edit
	this.now = now
	this._Now(r, d)
	show == null && (show = 2)
	now instanceof Datum && now.detail < show && now.show(show) || this.show()
},

_Now: function (r, d)
{
	if (this.now == this.zonest || !(this.now instanceof Datum))
		this.nowR = nowD = -1
	else if (r >= 0 && d >= 0)
		this.nowR = r, this.nowD = d
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
		var re = false, time = Date.now(), z = this.zonest, m = this.dom
		z.layoutDetail(), z.layout(false) && (this.nowScroll = true)
		this.whole.style.width = z.w + 'px', this.whole.style.height = z.h + 'px'
		var mx = m.scrollLeft, my = m.scrollTop, mw = m.clientWidth, mh = m.clientHeight
		if (this.nowScroll)
		{
			this.nowScroll = false
			var x = this.now.offsetX(), y = this.now.offsetY(),
			x = x - Math.max(mx, Math.min(x, mx + mw - this.now.w))
			y = y - Math.max(my, Math.min(y, my + mh - this.now.h))
			if (x || y)
				return re = true, m.scrollLeft = mx + x, m.scrollTop = my + y
		}
		z._show(Util.draw(this.draw, mx, my, mw, mh), mx, my, mw, mh)
		this._Hit()
	}
	finally
	{
		this.showing = -time + (time = Date.now()) + time + 50
		re && this.show()
	}
},

Hit: function (e)
{
	this.hitX = e.clientX + pageXOffset - 1
	this.hitY = e.clientY + pageYOffset - 1
	if (e.type == 'mousedown')
		this._Hit(e.shiftKey ? 3 : 2)
	else if (this.hitting >= 0)
		Util.timer(this.hitting - Date.now(), this, this._Hit), this.hitting = -1
},

_Hit: function (down)
{
	this.hitting = Date.now() + 80
	var x = this.hitX, y = this.hitY, m = this.dom
	do
		x += m.scrollLeft - m.offsetLeft - m.clientLeft,
		y += m.scrollTop - m.offsetTop - m.clientTop
	while (m = m.offsetParent)
	var xy = [ x, y ], h = this.hit = this.zonest.hit(xy)
	if ( !h)
		Util.draw(this.drawHit, 0, 0, 0, 0)
	else if (down)
		if (this.now != h) 
			this.Now(h, -1, -1, true, down)
		else
			h instanceof Datum && h.detail < down + 1 && h.show(down + 1)
	else
		h.Hit(this.drawHit, xy[0], xy[1])
},

////////////////////////////////      ////////////////////////////////
//////////////////////////////// edit ////////////////////////////////
////////////////////////////////      ////////////////////////////////

key: function (e)
{
	if (e.type == 'keyup')
	{
		if (e.keyCode == this.keyDown)
			this.keyDown = 0,
			this.keyUp = e.keyCode,
			this.keyTime = Date.now() // fix key repeat on linux
		return
	}
	var k = e.charCode, shift = e.shiftKey, cam = e.ctrlKey || e.altKey || e.metaKey
	if ( !k)
	K: {
		k = e.keyCode
		if (k != 9 && k != 27 && (k < 33 || k > 40))
			return
		e.preventDefault() // no scroll
		if (this.keyType == 'keypress' && e.type != 'keypress')
			return this.keyType = e.type // fix keydown repeat on Firefox
		this.keyType = e.type

		if ( !shift && !cam)
			if (k == 37) // left
				this.now.nowLeft()
			else if (k == 39) // right
				this.now.nowRight()
			else if (k == 38) // up
				this.now.nowUp()
			else if (k == 40) // down
				this.now.nowDown()
			else if (k == 36) // home
				this.now.nowHome()
			else if (k == 35) // end
				this.now.nowEnd()
			else if (k == 9) // tab
				this.now.nowInner()

		if (shift && k == 37 || cam && k == 90)
			this.com.undo() // shift-left cam-z
		else if (shift && k == 39 || shift && cam && k == 90)
			this.com.redo() // shift-right shift-cam-z
		else if (shift && k == 38) // shift-up
			this.now.nowPrev && this.Now(this.now.nowPrev, -1, -1, false)
		else if (shift && k == 40) // shift-down
			this.now.nowNext && this.Now(this.now.nowNext, -1, -1, false)
		return
	}
	this.keyType = e.type

	if (k == 122) // z
		this.now.nowZone()
	else if (k == 32) // space
		this.now.nowInner()
// TODO if (c && k == keyOff && new Date().time - keyTime < 16)
//		keyOn = keyOff // fix linux player on key repeat
	else
		return
	e.preventDefault() // key consumed
},

}

})()
