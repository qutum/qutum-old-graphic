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
	Util.on(dom, 'mousedown', this, this.HitDown)
	Util.on(dom, 'keydown', this, this.key)
	Util.on(dom, 'keypress', this, this.key)

	var z = this.zonest = new Datum(0)
	z.edit = this
	z.addTo(null, 0, 0)
	this.Now(z, false)
	Layer2(z)
	z.show(4)
	this.com = new Command(this)
}

Edit.prototype =
{

zonest: null,
now: null,
nowScroll: false, // scroll to show now
hit: null,
hitX: 0, // relative to page
hitY: 0, // relative to page
hitXY: true, // use hitX and hitY
drag: false,
keyType: '',

dom: null,
whole: null,
draw: null,
drawHit: null,
drawDrag: null,
nameH: 0,
nameTvW: 0,
name: null,
showing: 0, // to show in milliseconds
hitting: 0, // to show hit in milliseconds

com: null,
unsave: 0, // >0 saved and redos <0 saved and undos
saveUs: null, // {}
errorN: 0, // number of errors
compiling: 0, // to compile in milliseconds
yields: null, // []

// nav is true by default, show is 2 by default
Now: function (now, nav, show)
{
	if ( !now)
		throw 'null now'
	if (this.drag)
		this.hit = now
	else
	{
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
	}
	show == null && (show = 2)
	now.nowUnfold && now.nowUnfold(show) || (this.drag ? this.Hit() : this.show())
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
			var now = this.drag && this.hit || this.now, x = now.offsetX(), y = now.offsetY()
			x = x - Math.max(mx, Math.min(x, mx + mw - now.w))
			y = y - Math.max(my, Math.min(y, my + mh - now.h))
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
	if (e && this.hitX == (this.hitX = e.clientX + pageXOffset - 1)
			& this.hitY == (this.hitY = e.clientY + pageYOffset - 1)) // fix key bug on safari
		return
	this.hitXY = e != null
	if (this.hitting >= 0)
		Util.timer(this.hitting - Date.now(), this, this._Hit), this.hitting = -1
},

HitDown: function (e)
{
	this.hitX = e.clientX + pageXOffset - 1, this.hitY = e.clientY + pageYOffset - 1
	this.hitXY = true, this._Hit(e.shiftKey ? 3 : 2)
},

_Hit: function (down)
{
	this.hitting = Date.now() + 80
	if (this.hitXY)
	{
		var x = this.hitX, y = this.hitY, m = this.dom
		do
			x += m.scrollLeft - m.offsetLeft - m.clientLeft,
			y += m.scrollTop - m.offsetTop - m.clientTop
		while (m = m.offsetParent)
		var xy = [ x, y ], h = this.hit = this.zonest.hit(xy)
		x = h && xy[0], y = h && xy[1]
	}
	else
		var h = this.hit, x = h && h.offsetX(), y = h && h.offsetY()
	if ( !h)
		Util.draw(this.drawHit, 0, 0, 0, 0)
	else if (down)
		if (this.now != h) 
			this.Now(h, true, down)
		else
			h.nowUnfold && h.nowUnfold(down + 1)
	else
	{
		var m = this.dom,
			mx = m.scrollLeft, my = m.scrollTop, mw = m.clientWidth, mh = m.clientHeight
		mw = Math.min(x + h.w, mx + mw) - (mx = Math.max(x, mx))
		mh = Math.min(y + h.h, my + mh) - (my = Math.max(y, my))
		Util.draw(this.drawHit, mx, my, mw, mh)
		this.drawHit.translate(x - mx, y - my)
		h.Hit(this.drawHit)
	}
},

////////////////////////////////      ////////////////////////////////
//////////////////////////////// edit ////////////////////////////////
////////////////////////////////      ////////////////////////////////

key: function (e)
{
	var drag = this.drag, now = drag && this.hit || this.now, k = e.charCode
	if ( !k)
	K: {
		k = e.keyCode
		if (k == 13 && e.type == 'keypress')
			break K
		if (k != 9 && k != 27 && (k < 33 || k > 40))
			return
		e.preventDefault() // no scroll
		if (this.keyType != 'keypress' && e.type == 'keypress')
			return this.keyType = e.type // fix keydown repeat on Firefox
		this.keyType = e.type

		var shift = e.shiftKey, cam = e.ctrlKey || e.altKey || e.metaKey
		if ( !shift && !cam)
			switch (k)
			{
			case 37: now.nowLeft && now.nowLeft(); break // left
			case 39: now.nowRight && now.nowRight(); break // right
			case 38: now.nowUp && now.nowUp(); break // up
			case 40: now.nowDown && now.nowDown(); break // down
			case 36: now.nowHome && now.nowHome(); break // home
			case 35: now.nowEnd && now.nowEnd(); break // end
			case 9: now.nowInner && now.nowInner(); break // tab
			case 27: this.drag = false; break // esc
			}

		if (shift && k == 37 || cam && k == 90)
			drag || this.com.undo() // shift-left cam-z
		else if (shift && k == 39 || shift && cam && k == 90)
			drag || this.com.redo() // shift-right shift-cam-z
		else if (shift && k == 38) // shift-up
			now.nowPrev && this.Now(now.nowPrev, false)
		else if (shift && k == 40) // shift-down
			now.nowNext && this.Now(now.nowNext, false)
		return
	}
	this.keyType = e.type

	switch (k)
	{
	case 122: now.nowZone && now.nowZone(); break // z
	case 32: now.nowInner && now.nowInner(); break // space
	case 44: now.nowInput && now.nowInput(); break // ,
	case 96: now.nowDatum && now.nowDatum(); break // `
	case 46: now.nowOuput && now.nowOutput(); break // .
	case 59: now.nowUnity && now.nowUnity(); break // ;
	case 91: case 123: now.nowBase && now.nowBase(k == 91); break // [ {
	case 93: case 125: now.nowAgent && now.nowAgent(k == 93); break // ] }
	case 43: case 61: now.nowUnfold && now.nowUnfold(k == 43 ? 4 : 3); break // + =
	case 45: case 95: now.nowFold && now.nowFold(2); break // - _

	case 105: case 73: drag || this.com.input(k == 105); break // i I
	case 100: case 68: drag || this.com.datum(k == 100); break // d D
	case 111: case 79: drag || this.com.output(k == 111); break // o O
	case 13: drag || e.shiftKey && this.com.breakRow(); break // shift-enter
	case 116: case 63: drag || this.com.trialVeto(-1); break // t ?
	case 118: case 33: drag || this.com.trialVeto(1); break // v !
	case 117: this.drag = true; break; // u
	default: return
	}
	e.preventDefault() // key consumed
},

Unsave: function (delta)
{
	this.error = 0
	// TODO compiling
	this.yields = null
	if ( !this.unsave != !(this.unsave += delta))
		; // TODO unsaved 
},

}

})()