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
	this.drawDrag = Util.canvas(whole, font)
	this.nameH = parseInt(css.fontSize, 10)
	this.nameTvW = this.draw.measureText('?').width | 0
	css = font = null
	Util.on(dom, 'scroll', this, this.show, null)
	Util.on(window, 'resize', this, this.show, null)
	Util.on(whole, 'mousemove', this, this.Hit)
	Util.on(whole, 'mousedown', this, this.Hit)
	Util.on(dom, 'keydown', this, this.key)
	Util.on(dom, 'keypress', this, this.key)

	var z = this.zonest = new Datum(0)
	z.edit = this
	z.addTo(null, 0, 0)
	this.Now(this.nav = this.hit = this.now = z)
	Layer2(z)
	z.show(4)
	this.com = new Command(this)
}

Edit.prototype =
{

zonest: null,
now: null,
hit: null,
hitX: 0, // relative to page
hitY: 0, // relative to page
hitXY: true, // use hitX and hitY
nav: null, // navigable now or hit
drag: null, // null or a command
dragable: true,
keyType: '',

dom: null,
whole: null,
draw: null,
drawDrag: null,
nameH: 0,
nameTvW: 0,
name: null,
showing: 0, // to show in milliseconds
layout: false,
scroll: false,

com: null,
unsave: 0, // >0 saved and redos <0 saved and undos
saveUs: null, // {}
errorN: 0, // number of errors
compiling: 0, // to compile in milliseconds
yields: null, // []

// nav is true by default, show is 2 by default, drag unchanged by default
Now: function (now, nav, show, drag)
{
	if ( !now)
		throw 'null now'
	var n = this.nav
	if (nav !== false && n != now)
		now.navPrev && (now.navPrev.navNext = now.navNext),
		now.navNext && (now.navNext.navPrev = now.navPrev),
		now.navPrev = n,
		now.navNext = null,
		n.navNext && (n.navNext.navPrev = null),
		n.navNext = now
	if (drag !== undefined)
		this.drag != drag && (this.scroll = true), this.drag = drag
	else
		this.scroll = this.scroll || n != now
// TODO no name edit
	if (this.drag)
		this.nav = this.hit = now, this.dragable = this.drag.call(this.com, now, true)
	else
		this.nav = this.now = now, this.dragable = this.hitXY = true
	now.nowUnfold && now.nowUnfold(show != null ? show : 2) || this.show()
},

////////////////////////////////      ////////////////////////////////
//////////////////////////////// view ////////////////////////////////
////////////////////////////////      ////////////////////////////////

show: function (layout)
{
	layout && (this.layout = true)
	if (this.showing >= 0)
		Util.timer(this.showing - Date.now(), this, this._show), this.showing = -1
},

_show: function ()
{
	try
	{
		var re = false, time = Date.now(), z = this.zonest, m = this.dom
		if (this.layout)
			z.layoutDetail(), z.layout(false),
			this.layout = false, this.scroll = true,
			this.whole.style.width = z.w + 'px', this.whole.style.height = z.h + 'px'
		this.hitXY && (this.hit = this.HitXY() || z)
		var mx = m.scrollLeft, my = m.scrollTop, mw = m.clientWidth, mh = m.clientHeight
		if (this.scroll)
		{
			this.scroll = false
			var x = mx && z.w - mw, y = my && z.h - mh
			if (x < mx || y < my)
				return x < mx && (m.scrollLeft = x), y < my && (m.scrollTop = y), re = true
			var now = this.drag && this.hit || this.now, x = now.offsetX(), y = now.offsetY()
			if (this.drag == this.com.early)
				x = x - Datum.SPACE - Math.max(mx, Math.min(x - Datum.SPACE, mx + mw - now.w))
			else if (this.drag == this.com.later)
				x = x - Math.min(Math.max(mx, x), mx + mw - now.w - Datum.SPACE)
			else
				x = x - Math.max(mx, Math.min(x, mx + mw - now.w))
			if (this.drag == this.com.earlyRow)
				y = y - Datum.SPACE - Math.max(my, Math.min(y - Datum.SPACE, my + mh - now.h))
			else if (this.drag == this.com.laterRow)
				y = y - Math.min(Math.max(my, y), my + mh - now.h - Datum.SPACE)
			else
				y = y - Math.max(my, Math.min(y, my + mh - now.h))
			if (x || y)
				return m.scrollLeft = mx + x, m.scrollTop = my + y, re = true
		}
		var draw = Util.draw(this.draw, mx, my, mw, mh)
		z._show(draw, mx, my, mw, mh)
		if (this.drag)
			draw.lineWidth = 1, draw.strokeStyle = '#666', draw.beginPath(),
			draw.moveTo(this.now.offsetX(), this.now.offsetY()),
			draw.lineTo(this.hit.offsetX(), this.hit.offsetY()), draw.stroke()
		this.hitXY = false
	}
	finally
	{
		this.showing = -time + (time = Date.now()) + time + 40
		re && this.show()
	}
},

Hit: function (e)
{
	var ok = this.hitX != (this.hitX = e.clientX + pageXOffset - 1)
		| this.hitY != (this.hitY = e.clientY + pageYOffset - 1) // fix key bug on safari
	if (e.type == 'mousedown' && (ok = this.HitXY()))
	{
		this.hitXY = false
		if (ok != this.nav)
			this.Now(ok, true, e.shiftKey ? 3 : 2)
		else
			ok.nowUnfold && ok.nowUnfold(e.shiftKey ? 4 : 3) || this.show()
	}
	else if (ok || e.type == 'mousedown') 
		this.hitXY = true, this.show()
},

HitXY: function ()
{
	var x = this.hitX, y = this.hitY, m = this.dom
	do
		x += m.scrollLeft - m.offsetLeft - m.clientLeft,
		y += m.scrollTop - m.offsetTop - m.clientTop
	while (m = m.offsetParent)
	return this.zonest.hit([ x, y ])
},

////////////////////////////////      ////////////////////////////////
//////////////////////////////// edit ////////////////////////////////
////////////////////////////////      ////////////////////////////////

key: function (e)
{
	var drag = this.drag, now = drag ? this.hit : this.now, k = e.charCode
	if (k)
		(e.ctrlKey || e.altKey || e.metaKey) && (k = -k)
	else
	{
		k = e.keyCode
		if (this.keyType != 'keypress' && e.type == 'keypress')
			return this.keyType = e.type // fix keydown repeat on Firefox
		k = e.shiftKey || e.ctrlKey || e.altKey || e.metaKey ? - k - 0.5 : k + 0.5
	}
	this.keyType = e.type

	try
	{
	switch (k)
	{
	case 37.5: now.nowLeft && now.nowLeft(); break // left
	case 39.5: now.nowRight && now.nowRight(); break // right
	case 38.5: now.nowUp && now.nowUp(); break // up
	case 40.5: now.nowDown && now.nowDown(); break // down
	case -37.5: drag || this.com.undo(); break // func-left
	case -39.5: drag || this.com.redo(); break // func-right 
	case -38.5: var n = this.nav; now != n ? this.Now(n, false)
				: n.navPrev && this.Now(n.navPrev, false); break // func-up
	case -40.5: var n = this.nav; now != n ? this.Now(n, false)
				: n.navNext && this.Now(n.navNext, false); break // func-down
	case 36.5: now.nowHome && now.nowHome(); break // home
	case 35.5: now.nowEnd && now.nowEnd(); break // end
	case 9.5: now.nowInner && now.nowInner(); break // tab
	case 27.5: this.Now(this.now, false, null, null); break // esc

	case 122: now.nowZone && now.nowZone(); break // z
	case 32: now.nowInner && now.nowInner(); break // space
	case 44: now.nowInput && now.nowInput(); break // ,
	case 96: now.nowDatum && now.nowDatum(); break // `
	case 46: now.nowOutput && now.nowOutput(); break // .
	case 59: now.nowUnity && now.nowUnity(); break // ;
	case 91: case 123: now.nowBase && now.nowBase(k == 91); break // [ {
	case 93: case 125: now.nowAgent && now.nowAgent(k == 93); break // ] }
	case 43: case 61: now.nowUnfold && now.nowUnfold(k == 43 ? 4 : 3); break // + =
	case 45: case 95: now.nowFold && now.nowFold(2); break // - _

	case 105: case 73: drag || this.com.input(k == 73); break // i I
	case 100: case 68: drag || this.com.datum(k == 68); break // d D
	case 111: case 79: drag || this.com.output(k == 79); break // o O
	case -13.5: drag || this.com.breakRow(); break // func-enter
	case 8.5: drag || this.com.removeBefore(); break // backspace
	case 46.5: drag || this.com.remove(); break // delete
	case 116: case 63: drag || this.com.trialVeto(-1); break // t ?
	case 118: case 33: drag || this.com.trialVeto(1); break // v !
	case 117: this.Now(now, false, null, this.com.unity); break; // u
	case 101: this.Now(now, false, null, this.com.early); break; // e
	case 108: this.Now(now, false, null, this.com.later); break; // l
	case 69: this.Now(now, false, null, this.com.earlyRow); break; // E
	case 76: this.Now(now, false, null, this.com.laterRow); break; // L
	case 13.5: drag ? (this.Now(this.now, false, null, null), drag.call(this.com, now))
		: null;	
		break // enter

	default: return e = null
	}
	}
	finally
	{
		e && e.preventDefault() // key consumed
	}
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