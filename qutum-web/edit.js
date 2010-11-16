//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Edit = function (box)
{
	this.html = /Firefox/.test(navigator.userAgent) ? 'ff' : 'wk'
	box.tabIndex >= 0 || (box.tabIndex = 0)
	var dom = this.dom = box.appendChild(document.createElement('div'))
	with (dom.style)
		position = 'relative', overflow = 'scroll',
		width = height = '100%', minWidth = minHeight = '10em'
	var whole = this.whole = dom.appendChild(document.createElement('div'))
	whole.style.position = 'absolute'
	var css = getComputedStyle(whole, null),
		f = css.fontWeight + ' ' + css.fontSize + ' ' + css.fontFamily
	this.draw = Util.draw(Util.canvas(whole, f), 0, 0, 50, 50)
	this.nameH = parseInt(css.fontSize, 10)
	this.nameTvW = this.draw.measureText('?').width | 0
	var name = this.name = dom.appendChild(document.createElement('input'))
	with (name.style) font = f, position = 'absolute', display = 'none'
	css = f = null
	Util.on(window, 'resize', this, this.show, null)
	Util.on(dom, 'scroll', this, this.show, null)
	Util.on(whole, 'mousemove', this, this.Hit)
	Util.on(whole, 'mousedown', this, this.Hit)
	Util.on(box, 'keydown', this, this.key, false, true)
	Util.on(box, 'keypress', this, this.key, false, true)
	Util.on(name, 'input', this, this.Naming)
	Util.on(name, 'change', this, this.Naming)
	Util.on(name, 'blur', this, this.Name, [ false ])

	var z = this.zonest = new Datum(0)
	z.edit = this, z.x = z.y = Datum.SPACE + 4 >> 1
	z.addTo(null, 0, 0)
	this.Now(this.now = this.hit = this.nav = this.foc = z)
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
nav: null, // navigable hit while dragging or now
foc: null, // hit while dragging or now
drag: null, // null or a command
keyType: '',

html: '', // html engine
dom: null,
whole: null,
draw: null,
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
		this.drag != drag && (this.scroll = true, this.drag = drag)
	this.Name(false)
	if (this.drag)
		now != this.foc && (this.scroll = true),
		this.hit = this.nav = this.foc = now,
		this.dragable = this.drag.call(this.com, now, true)
	else
		now != n && (this.scroll = true),
		this.now = this.nav = this.foc = now,
		this.dragable = this.hitXY = true
	this.focUnfold(show != null ? show : 2) || this.show()
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
			this.whole.style.width = z.x + z.w + z.x + 'px',
			this.whole.style.height = z.y + z.h + z.y + 'px'
		var drag = this.drag, com = this.com
		if (this.hitXY)
			this.hitXY = false, this.hit = this.HitXY() || z,
			drag && (this.foc = this.hit)
		var dx, dy, Dx, Dy
		if (drag)
		{
			var n = this.now, h = this.hit, xys, d, D = Infinity, xys,
				xs = [], ys = [], Xs = [], Ys = [], i, I
			if (n.deep)
				xs[1] = (xs[0] = n.offsetX()) + n.w, ys[0] = ys[1] = n.offsetY(),
				drag == com.agent ? ys[0] = ys[1] += n.h : drag != com.base
				&& (xs[2] = xs[0], xs[3] = xs[1], ys[2] = ys[3] = ys[0] + n.h)
			else
				xs[0] = n.zone.offsetX(), ys[0] = n.zone.offsetY(), xys = n.xys,
				drag == com.agent ? (xs[0] += xys[0], ys[0] += xys[1]) :
				drag == com.base ? (xs[0] += xys[xys.length -2], ys[0] += xys[xys.length -1])
				: (xs[1] = xs[0] + xys[xys.length -2], ys[1] = ys[0] + xys[xys.length -1],
					xs[0] += xys[0], ys[0] += xys[1])
			if (h.deep)
				Xs[0] = h.offsetX(), Ys[0] = h.offsetY(),
				drag == com.early ? (Xs[0] -= Datum.SPACE / 2, Ys[0] += h.h >> 1) :
				drag == com.later ? (Xs[0] += h.w + Datum.SPACE / 2, Ys[0] += h.h >> 1) :
				drag == com.earlyRow ? (Xs[0] += h.w >> 1, Ys[0] -= Datum.SPACE / 2) :
				drag == com.laterRow ? (Xs[0] += h.w >> 1, Ys[0] += h.h + Datum.SPACE / 2) :
				drag == com.unity ? Ys[0] += h.nameY - (h.nameH >> 1 || this.nameH >> 1) :
				(Xs[1] = Xs[0] + h.w, Ys[1] = Ys[0] += drag == com.base ? h.h : 0)
			else
				xys = h.xys, Xs[1] = (Xs[0] = h.zone.offsetX()) + xys[xys.length -2],
				Ys[1] = (Ys[0] = h.zone.offsetY()) + xys[xys.length -1],
				Xs[0] += xys[0], Ys[0] += xys[1]
			for (i = 0; i < xs.length; i++)
				for (I = 0; I < Xs.length; I++)
					if ((d = (d = xs[i] - Xs[I]) * d + (d = ys[i] - Ys[I]) * d) < D)
						D = d, dx = xs[i], dy = ys[i], Dx = Xs[I], Dy = Ys[I]
		}
		var mx = m.scrollLeft, my = m.scrollTop, mw = m.clientWidth, mh = m.clientHeight
		if (this.scroll)
		{
			var x = mx && z.x + z.w + z.x - mw, y = my && z.y + z.h + z.y - mh
			if (x < mx || y < my)
				return x < mx && (m.scrollLeft = x), y < my && (m.scrollTop = y), re = true
			this.scroll = false
			var foc = this.foc, x = foc.offsetX(), y = foc.offsetY()
			x = Math.min(x - 2, Math.max(mx, x + 2 + foc.w - mw))
			y = Math.min(y - 2, Math.max(my, y + 2 + foc.h - mh))
			if (drag)
				x = Math.min(Dx - 3, Math.max(x, Dx + 3 - mw)),
				y = Math.min(Dy - 3, Math.max(y, Dy + 3 - mh))
			if (x != mx || y != my)
				return m.scrollLeft = x, m.scrollTop = y, $info(re = true)
		}
		var draw = Util.draw(this.draw, mx, my, mw, mh)
		z._show(draw, mx - z.x, my - z.y, mw, mh)
		if (drag)
		{
 			draw.beginPath()
			draw.strokeStyle = drag.call(com, h, true) ? '#333' : '#f33'
			draw.lineWidth = 2.5
			if (h.deep)
				if (drag == com.early || drag == com.later)
					draw.strokeRect(Dx - mx, Dy - h.h / 2 - my, 0, h.h)
				else if (drag == com.earlyRow || drag == com.laterRow)
					draw.strokeRect(Dx - h.w / 2 - mx, Dy - my, h.w, 0)
			draw.lineWidth = 5, draw.lineCap = 'round', draw.globalAlpha = 0.375
			draw.moveTo(dx - mx, dy - my), draw.lineTo(Dx - mx, Dy - my)
			draw.stroke()
		}
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
			this.focUnfold(e.shiftKey ? 4 : 3) || this.show()
	}
	else if (ok || e.type == 'mousedown') 
		this.hitXY = true, this.show()
},

HitXY: function ()
{
	var x = this.hitX, y = this.hitY, m = this.dom
	this.html == 'ff' && (x += m.offsetLeft, y += m.offsetTop) // offsetLeft/Top bug on Firefox
	do
		x += m.scrollLeft - m.offsetLeft - m.clientLeft,
		y += m.scrollTop - m.offsetTop - m.clientTop
	while (m = m.offsetParent)
	var t = Date.now(), m = this.zonest.hit([ x, y ]), t = Date.now() - t
	t > 50 && $info('slow script: hit')
	return m
},

////////////////////////////////      ////////////////////////////////
//////////////////////////////// edit ////////////////////////////////
////////////////////////////////      ////////////////////////////////

navPrev: function ()
{
	this.nav != this.foc ? this.Now(this.nav, false)
		: this.nav.navPrev && this.Now(this.nav.navPrev, false)
},
navNext: function ()
{
	this.nav != this.foc ? this.Now(this.nav, false)
		: this.nav.navNext && this.Now(this.nav.navNext, false)
},
focLeft: function ()
{
	var foc = this.foc, r = foc.row, rs
	if (r) // not wire
		if (foc != r[0])
			this.Now(r[r.indexOf(foc) - 1])
		else if (rs = foc.zone.rows, (r = rs[rs.indexOf(r) - 1]) && r.length)
			this.Now(ArrayLast(r))
},
focRight: function ()
{
	var foc = this.foc, r = foc.row
	if (r) // not wire
		if (foc != ArrayLast(r))
			this.Now(r[r.indexOf(foc) + 1])
		else if (rs = foc.zone.rows, (r = rs[rs.indexOf(r) + 1]) && r.length)
			this.Now(r[0])
},
focUp: function ()
{
	var foc = this.foc, r = foc.zone, d
	if (foc.deep && r && (r = r.rows[r.rows.indexOf(foc.row) - 1]) && r.length)
		d = r.searchDatumX(foc.x + foc.w / 2),
		this.Now(r[d ^ d >> 31] || ArrayLast(r))
},
focDown: function ()
{
	var foc = this.foc, r = foc.zone, d
	if (foc.deep && r && (r = r.rows[r.rows.indexOf(foc.row) + 1]) && r.length)
		d = r.searchDatumX(foc.x + foc.w / 2),
		this.Now(r[d ^ d >> 31] || ArrayLast(r))
},
focHome: function ()
{
	var x = this.foc.row
	x && this.foc != x[0] && this.Now(x[0]) // not wire
},
focEnd: function ()
{
	var x = this.foc.row
	x && this.foc != (x = ArrayLast(x)) && this.Now(x) // not wire
},
focZone: function ()
{
	this.Now(this.foc.zone || this.foc)
},
focInner: function ()
{
	var foc = this.foc
	foc.ox > 0 && this.Now(foc.rows[0][0] || foc.rows[1][0]) // not wire
},
focInput: function ()
{
	var foc = this.foc
	foc.ox > 0 && foc.rows[0][0] && this.Now(foc.rows[0][0]) // not wire
},
focDatum: function ()
{
	var foc = this.foc
	foc.ox > 1 && foc.rows[1][0] && this.Now(foc.rows[1][0]) // not wire
},
focOutput: function ()
{
	var foc = this.foc
	foc.ox > 0 && foc.rows[foc.ox][0] && this.Now(foc.rows[foc.ox][0]) // not wire
},
focUnity: function ()
{
	var foc = this.foc
	foc.deep && foc.uNext != foc && this.Now(foc.uNext)
},
focBase: function (next)
{
	var foc = this.foc
	if (foc.deep)
		return foc.bs[0] && this.Now(foc.bs[0])
	if ( !next)
		return this.Now(foc.base)
	var s = foc.agent.bs
	this.Now(s[s.indexOf(foc) + 1] || s[0])
},
focAgent: function (next)
{
	var foc = this.foc
	if (foc.deep)
		return foc.as[0] && this.Now(foc.as[0])
	if ( !next)
		return this.Now(foc.agent)
	var s = foc.base.as
	this.Now(s[s.indexOf(foc) + 1] || s[0])
},
focUnfold: function (x)
{
	return (x >= 4 || this.foc.detail < x) && this.foc.show(x) // not wire
},
focFold: function (x)
{
	return this.foc.detail > 2 && this.foc.show(2) // not wire
},

// start by default, done if done is true, cancel if done is false
Name: function (done)
{
	var name = this.name, now, d
	if (done == null && (now = this.now).deep)
		name.style.display = '',
		name.style.left = now.offsetX() + 1 + 'px',
		name.style.top = now.offsetY() +
			now.nameY - this.nameH - (this.html == 'ff' ? 1 : 5) + 'px',
		name.value = now.name,
		name.focus(), name.select(), this.Naming()
	else
		d = name.style.display, name.style.display = 'none',
		d == '' && this.dom.parentNode.focus(),
		done && this.com.name(name.value)
},
Naming: function ()
{
	var name = this.name
	if (this.html == 'ff') // scrollWidth bug on Firefox
		name.size = Math.min(name.textLength || 1, 100)
	else
		name.style.width = '1px',
		name.style.width = Math.min(name.scrollWidth, 800) + 'px'
},

// start if drag is a command, done if drag is true, cancel if drag is false 
Drag: function (drag)
{
	var foc = this.foc, d
	if (drag instanceof Function)
		this.Now(foc, false, null, drag)
	else if (d = this.drag)
		this.Now(this.now, false, null, null),
		drag===true && d.call(this.com, foc)
},

key: function (e)
{
	var k = e.keyCode
	if (e.target == this.name
		&& (k != 13 && k != 27 || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey))
		return // neither esc nor enter
	if (k = e.charCode)
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
	case 37.5: this.focLeft(); break // left
	case 39.5: this.focRight(); break // right
	case 38.5: this.focUp(); break // up
	case 40.5: this.focDown(); break // down
	case -37.5: this.com.undo(); break // func-left
	case -39.5: this.com.redo(); break // func-right 
	case -38.5: this.navPrev(); break // func-up
	case -40.5: this.navNext(); break // func-down
	case 36.5: this.focHome(); break // home
	case 35.5: this.focEnd(); break // end
	case 9.5: this.focInner(); break // tab
	case 27.5: this.Name(false); this.Drag(false); break // esc

	case 122: case -9.5: this.focZone(); break // z func-tab
	case 32: this.focInner(); break // space
	case 44: this.focInput(); break // ,
	case 96: this.focDatum(); break // `
	case 46: this.focOutput(); break // .
	case 59: this.focUnity(); break // ;
	case 91: case 123: this.focBase(k == 91); break // [ {
	case 93: case 125: this.focAgent(k == 93); break // ] }
	case 43: case 61: this.focUnfold(k == 43 ? 4 : 3); break // + =
	case 45: case 95: this.focFold(2); break // - _

	case 105: case 73: this.com.input(k == 73); break // i I
	case 100: case 68: this.com.datum(k == 68); break // d D
	case 111: case 79: this.com.output(k == 79); break // o O
	case -13.5: this.com.breakRow(); break // func-enter
	case 8.5: this.com.removeBefore(); break // back
	case 46.5: this.com.remove(); break // del
	case -8.5: case -46.5: this.com.removeAfter(); break // func-del func-back
	case 116: case 63: this.com.trialVeto(-1); break // t ?
	case 118: case 33: this.com.trialVeto(1); break // v !
	case 117: this.Drag(this.com.unity); break; // u
	case 101: this.Drag(this.com.early); break; // e
	case 108: this.Drag(this.com.later); break; // l
	case 69: this.Drag(this.com.earlyRow); break; // E
	case 76: this.Drag(this.com.laterRow); break; // L
	case 98: this.Drag(this.com.base); break; // b
	case 97: this.Drag(this.com.agent); break; // a
	case 13.5: this.drag ? this.Drag(true)
		: this.Name(this.name.style.display == '' ? true : null); break // enter

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