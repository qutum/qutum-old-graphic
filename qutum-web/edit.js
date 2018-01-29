//
// Qutum 10 implementation
// Copyright 2008-2013 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Edit = function (dom, dxs)
{
	this.dom = dom, dom.tabIndex >= 1 || (dom.tabIndex = 1)
	var whole = this.whole = Util.add(dom, 'div', 'whole')
	var css = getComputedStyle(whole, null),
		f = css.fontWeight + ' ' + css.fontSize + ' ' + css.fontFamily
	this.draw = Util.draw(Util.canvas(whole, f, true), 0, 0, 50, 50)

	var naming = this.naming = Util.add(Util.add(whole, 'span'), 'input')
	with (naming.parentNode.style) position = 'absolute', display = 'none'
	naming.style.font = f
	this.nameH = parseInt(css.fontSize, 10)
	this.nameTvW = this.draw.measureText('?').width | 0
	css = f = null
	var err = this.err = Util.add(whole, 'div', 'err')
	with (err.style) position = 'absolute', display = 'none', left = top = '0'

	Util.on(window, 'resize', this, this.show, null)
	Util.on(dom, 'scroll', this, this.show, null)
	Util.on(whole, 'mousemove', this, this.Hit)
	Util.on(whole, 'mousedown', this, this.Hit)
	Util.on(whole, 'mouseup', this, this.Hit)
	Util.on(dom, 'keypress', this, this.key, false, true)
	Util.HTML == 'w' && Util.on(dom, 'keydown', this, this.key, false, true)
	Util.on(naming, 'input', this, this.Name, [ null, true ])
	Util.on(naming, 'change', this, this.Name, [ null, true ])

	this.ns = {}
	var z = this.zonest = new Datum(0)
	z.edit = this, z.X = z.Y = Datum.SPACE + 4 >> 1
	z.addTo(null, 0, 0)
	this.Now(this.now = this.hit = this.nav = this.foc = z)
	Layer(z, dxs)
	this.compile()
	z.show(4)
	this.com = new Command(this)
}

Edit.prototype =
{

newId: 1, // new datum id
newNk: 1, // new namesake
zonest: null,
now: null, // being edited
hit: null, // hit by mouse pointer or changed now
hitX: 0, // relative to page
hitY: 0, // relative to page
hitXY: true, // use hitX and hitY
hitTime: 0, // timer for long mouse press
nav: null, // navigable hit while dragging or else now
foc: null, // hit while dragging or else now
drag: null, // null or command for dragging
dragerr: null, // error info about dragging target

dom: null, // scroll area
whole: null, // whole area
draw: null, // drawing area
naming: null, // name input
err: null, // error info
nameH: 0, // name text height
nameTvW: 0, // trial/veto name width
showTime: 0, // to show in milliseconds
layouting: false, // to layout while showing
scrolling: false, // to scroll while showing

ns: null, // { namesake:Datum }
com: null, // commands
unsave: 0, // >0 saved and redos <0 saved and undos
fatal: false, // fatal error
errorN: 0, // number of errors
compileTime: 0, // timer to compile

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
		this.drag != drag && (this.scrolling = true, this.drag = drag)
	this.Name(false) // cancel naming
	if (this.drag)
		now != this.foc && (this.scrolling = true),
		this.hit = this.nav = this.foc = now,
		this.dragerr = this.drag.call(this.com, now, true)
	else
		now != n && (this.scrolling = true),
		this.now = this.hit = this.nav = this.foc = now,
		this.dragerr = null
	this.focUnfold(show != null ? show : 2) || this.show()
},

////////////////////////////////      ////////////////////////////////
//////////////////////////////// view ////////////////////////////////
////////////////////////////////      ////////////////////////////////

show: function (layouting)
{
	layouting && (this.layouting = true)
	if (this.showTime >= 0)
		Util.timer(this.showTime - Date.now(), this, this._show), this.showTime = -1
},

_show: function ()
{
	try
	{
		var re = false, time = Date.now(), drag = this.drag, z = this.zonest, h = this.hit
		if (this.layouting)
			z.layoutDetail(), z.layout(false),
			this.whole.style.width = z.X + z.W + z.X + 'px',
			this.whole.style.height = z.Y + z.H + z.Y + 'px',
			this.err.style.display = 'none',
			this.layouting = false, this.scrolling = true
		if (this.hitXY)
			(h = this.HitXY()) ? this.hit = h : h = this.hit,
			drag && (this.foc = h), this.hitXY = false
		var com = this.com, n = this.now, dx, dy, Dx, Dy, x, y
		if (drag)
		{
			var xys, xs = [], ys = [], Xs = [], Ys = []
			if (n.deep)
				xs[1] = (xs[0] = n.offsetX()) + n.W, ys[0] = ys[1] = n.offsetY(),
				drag == com.base ? null :
				drag == com.usage ? ys[0] = ys[1] += n.H
				: (xs[2] = xs[0], xs[3] = xs[1], ys[2] = ys[3] = ys[0] + n.H)
			else
				xs[0] = n.zone.offsetX(), ys[0] = n.zone.offsetY(), xys = n.xys,
				drag == com.base ? (xs[0] += xys[0], ys[0] += xys[1]) :
				drag == com.usage ? (xs[0] += xys[xys.length -2], ys[0] += xys[xys.length -1])
				: (xs[1] = xs[0] + xys[xys.length -2], ys[1] = ys[0] + xys[xys.length -1],
					xs[0] += xys[0], ys[0] += xys[1])
			if (h.deep)
				Xs[0] = h.offsetX(), Ys[0] = h.offsetY(),
				drag == com.early ? (Xs[0] -= Datum.SPACE / 2, Ys[0] += h.H >> 1) :
				drag == com.later ? (Xs[0] += h.W + Datum.SPACE / 2, Ys[0] += h.H >> 1) :
				drag == com.earlyRow ? (Xs[0] += h.W >> 1, Ys[0] -= Datum.SPACE / 2) :
				drag == com.laterRow ? (Xs[0] += h.W >> 1, Ys[0] += h.H + Datum.SPACE / 2) :
				drag == com.namesake ? Ys[0] += h.nameY + (this.nameH >> 1) :
				(Xs[1] = Xs[0] + h.W, Ys[1] = Ys[0] += drag == com.base ? h.H : 0)
			else
				xys = h.xys, Xs[1] = (Xs[0] = h.zone.offsetX()) + xys[xys.length -2],
				Ys[1] = (Ys[0] = h.zone.offsetY()) + xys[xys.length -1],
				Xs[0] += xys[0], Ys[0] += xys[1]
			Util.shortest(xs, ys, Xs, Ys), dx = xs[0], dy = ys[0], Dx = Xs[0], Dy = Ys[0]
		}
		var dom = this.dom, X = dom.scrollLeft, Y = dom.scrollTop,
			W = Math.max(dom.clientWidth, 1), H = Math.max(dom.clientHeight, 1)
		if (this.scrolling)
		{
			x = X && z.X + z.W + z.X - W, y = Y && z.Y + z.H + z.Y - H
			if (x < X || y < Y)
				return x < X && (dom.scrollLeft = x), y < Y && (dom.scrollTop = y), re = true
			this.scrolling = false
			var foc = this.foc, x = foc.offsetX(), y = foc.offsetY()
			x = Math.min(x - 2, Math.max(X, x + 2 + foc.W - W))
			y = Math.min(y - 2, Math.max(Y, y + 2 + foc.H - H))
			if (drag)
				x = Math.min(Dx - 3, Math.max(x, Dx + 3 - W)),
				y = Math.min(Dy - 3, Math.max(y, Dy + 3 - H))
			if (x != X || y != Y)
				return dom.scrollLeft = x, dom.scrollTop = y, re = true
		}
		var draw = Util.draw(this.draw, X, Y, W, H)
		z._show(draw, X - z.X, Y - z.Y, W, H)
		if (drag)
		{
			dx -= X, dy -= Y, Dx -= X, Dy -= Y
			this.dragerr = drag.call(com, h, true)
			draw.fillStyle = draw.strokeStyle = this.dragerr ? '#f33' : '#333'
			draw.lineWidth = 2.5
			if (h.deep)
				if (drag == com.early || drag == com.later)
					draw.strokeRect(Dx, Dy - h.H / 2, 0, h.H)
				else if (drag == com.earlyRow || drag == com.laterRow)
					draw.strokeRect(Dx - h.W / 2, Dy, h.W, 0)
			var xy
			if (drag == com.base)
				Util.arrow(draw, Dx, Dy, dx, dy, 5)
			else if (drag == com.usage)
				Util.arrow(draw, dx, dy, Dx, Dy, 5)
			draw.lineWidth = 5, draw.lineCap = 'round', draw.globalAlpha = 0.375
			draw.beginPath(), draw.moveTo(dx, dy), draw.lineTo(Dx, Dy)
			draw.stroke(), draw.globalAlpha = 1
		}
		this._showErr(this.drag ? this.dragerr : h.err, X, Y, W, H)
	}
	finally
	{
		this.showTime = -time + (time = Date.now()) + time + 40
		re && this.show()
	}
},

_showErr: function (err, X, Y, W, H)
{
	this.err.style.display = 'none'
	if ( !err)
		return
	var z = this.zonest, draw = this.draw
	var hx = this.hitX - Util.pageX(this.whole), hy = this.hitY - Util.pageY(this.whole)
	if (hx < z.X || hx >= z.X + z.W || hy < z.Y || hy >= z.Y + z.H)
		return
	this.err.style.display = '', this.err.innerHTML = ''
	if (typeof err == 'string')
		this.err.textContent = err
	else
		for (var E = 0, e; e = err[E]; E++)
			Util.text(Util.add(this.err, 'span', typeof e == 'string' ? '' : 'ref'),
				typeof e == 'string' ? e : e.name)
	var x = hx + 10, y = hy + 3, w = this.err.offsetWidth, h = this.err.offsetHeight
	x + w > X + W && hx - 1 - w >= X && (x = hx - 1 - w)
	y + h > Y + H && hy - 1 - h >= Y && (y = hy - 1 - h)
	this.err.style.left = x + 'px', this.err.style.top = y + 'px'

	if (typeof err != 'string')
		for (var E = 0, e, xs = [], ys = [], Xs = [], Ys = []; e = err[E]; E++)
			if (typeof e != 'string')
			{
				var n = this.err.childNodes[E]
				xs[0] = xs[2] = n.offsetLeft + x - X, ys[0] = ys[1] = n.offsetTop + y - Y + 2
				xs[1] = xs[3] = xs[0] + n.offsetWidth, ys[2] = ys[3] = ys[0] + n.offsetHeight - 2
				Xs[0] = Xs[2] = e.offsetX() - X, Ys[0] = Ys[1] = e.offsetY() - Y
				Xs[1] = Xs[3] = Xs[0] + e.W, Ys[2] = Ys[3] = Ys[0] + e.H
				draw.lineWidth = 2, draw.lineCap = 'round', draw.globalAlpha = 0.75
				draw.strokeStyle = '#c90', draw.beginPath()
				draw.strokeRect(Xs[0] - 1, Ys[0] - 1, Xs[1] - Xs[0] + 2, Ys[2] - Ys[0] + 2)
				draw.stroke(), draw.globalAlpha = 1
				draw.fillStyle = draw.strokeStyle = '#c00', draw.beginPath()
				Util.shortest(xs, ys, Xs, Ys)
				draw.moveTo(xs[0], ys[0]), draw.lineTo(Xs[0], Ys[0]), draw.stroke()
				Util.arrow(draw, xs[0], ys[0], Xs[0], Ys[0], 3.5)
			}
},

Hit: function (e)
{
	this.hitTime && clearTimeout(this.hitTime)
	if (e.target == this.naming || e.target == this.naming.parentNode)
		return
	var ok = this.hitX != (this.hitX = e.pageX - 1) | this.hitY != (this.hitY = e.pageY - 1)
			// fix key bug on Safari
	if (e.type == 'mousedown' && (ok = this.HitXY()))
	{
		this.hitXY = false
		if (ok != this.nav)
			this.Now(ok, true, e.shiftKey ? 3 : 2)
		else
			this.focUnfold(e.shiftKey ? 4 : 3) || this.show()
		this.hitTime = Util.timer(400, this, this.nowOk, [ true ])
	}
	else if (ok || e.type == 'mousedown')
		this.hitXY = true, this.show()
},

HitXY: function ()
{
	var t = Date.now(), h = this.zonest.hit(
		[ this.hitX - Util.pageX(this.whole), this.hitY - Util.pageY(this.whole) ])
	t = Date.now() - t
	t > 50 && Info('slow: zonest.hit')
	return h
},

////////////////////////////////          ////////////////////////////////
//////////////////////////////// navigate ////////////////////////////////
////////////////////////////////          ////////////////////////////////

navPrev: function (test)
{
	return this.nav != this.foc ? test || this.Now(this.nav, false)
		: this.nav.navPrev ? test || this.Now(this.nav.navPrev, false) : false
},
navNext: function (test)
{
	return this.nav != this.foc ? test || this.Now(this.nav, false)
		: this.nav.navNext ? test || this.Now(this.nav.navNext, false) : false
},
focLeft: function (test)
{
	var foc = this.foc, r = foc.row, rs
	if (r) // not wire
		if (foc != r[0])
			return test || this.Now(r[r.indexOf(foc) - 1])
		else if (rs = foc.zone.rows, (r = rs[rs.indexOf(r) - 1]) && r.length)
			return test || this.Now(ArrayLast(r))
	return false
},
focRight: function (test)
{
	var foc = this.foc, r = foc.row
	if (r) // not wire
		if (foc != ArrayLast(r))
			return test || this.Now(r[r.indexOf(foc) + 1])
		else if (rs = foc.zone.rows, (r = rs[rs.indexOf(r) + 1]) && r.length)
			return test || this.Now(r[0])
	return false
},
focUp: function (test)
{
	var foc = this.foc, r = foc.zone, d
	if (foc.deep && r && (r = r.rows[r.rows.indexOf(foc.row) - 1]) && r.length)
		return d = r.searchDatumX(foc.X + foc.W / 2),
			test || this.Now(r[d ^ d >> 31] || ArrayLast(r))
	return false
},
focDown: function (test)
{
	var foc = this.foc, r = foc.zone, d
	if (foc.deep && r && (r = r.rows[r.rows.indexOf(foc.row) + 1]) && r.length)
		return d = r.searchDatumX(foc.X + foc.W / 2),
			test || this.Now(r[d ^ d >> 31] || ArrayLast(r))
	return false
},
focHome: function (test)
{
	var x = this.foc.row
	return x && this.foc != x[0] && (test || this.Now(x[0])) // not wire
},
focEnd: function (test)
{
	var x = this.foc.row
	return x && this.foc != (x = ArrayLast(x)) && (test || this.Now(x)) // not wire
},
focZone: function (test)
{
	return this.foc.zone && (test || this.Now(this.foc.zone))
},
focInner: function (test)
{
	var foc = this.foc
	return foc.or > 0 && (test || this.Now(foc.rows[0][0] || foc.rows[1][0])) // not wire
},
focInput: function (test)
{
	var foc = this.foc
	return foc.or > 0 && foc.rows[0][0] && (test || this.Now(foc.rows[0][0])) // not wire
},
focHub: function (test)
{
	var foc = this.foc
	return foc.or > 1 && foc.rows[1][0] && (test || this.Now(foc.rows[1][0])) // not wire
},
focOutput: function (test)
{
	var foc = this.foc
	return foc.or > 0 && foc.rows[foc.or][0]
		&& (test || this.Now(foc.rows[foc.or][0])) // not wire
},
focNamesake: function (prev, test)
{
	var foc = this.foc
	return foc.deep && foc.nNext != foc && (test || this.Now(prev ? foc.nPrev : foc.nNext))
},
focBase: function (next, test)
{
	var foc = this.foc
	if (foc.deep)
		return foc.bs[0] && (test || this.Now(foc.bs[0]))
	if ( !next)
		return test || this.Now(foc.base)
	var s = foc.usage.bs
	return test || this.Now(s[s.indexOf(foc) + 1] || s[0])
},
focUsage: function (next, test)
{
	var foc = this.foc
	if (foc.deep)
		return foc.us[0] && (test || this.Now(foc.us[0]))
	if ( !next)
		return test || this.Now(foc.usage)
	var s = foc.base.us
	return test || this.Now(s[s.indexOf(foc) + 1] || s[0])
},
focFold: function (test)
{
	return this.foc.detail > 2 && (test || this.foc.show(2)) // not wire
},
focUnfold: function (x, test)
{
	return this.foc.deep && (x >= 4 || this.foc.detail < x) && (test || this.foc.show(x))
},

////////////////////////////////      ////////////////////////////////
//////////////////////////////// edit ////////////////////////////////
////////////////////////////////      ////////////////////////////////

nowName: function (ok, test)
{
	if (this.naming.parentNode.style.display == '')
	{
		var err = ok && this.com.Name(this.naming.value, true)
		test || this.Name(ok)
		return err || test
	}
	else
		return ok && !this.drag && this.now.deep && (test || this.Name())
},
nowOk: function (ok, test)
{
	return this.drag ? test || this.Drag(ok) : this.nowName(ok, test)
},

// start by defult, done if done is true, cancel if done is false
Name: function (done, doing)
{
	var now = this.now
	if ( !now.deep)
		return
	var naming = this.naming, parent = naming.parentNode.style
	if (doing)
		if (Util.HTML == 'w')
			naming.style.width = '10px',
			naming.style.width = naming.scrollWidth + 'px'
		else
			naming.size = naming.textLength || 1
	else if (done == null)
	{
		parent.top = now.offsetY() + now.nameY + 'px'
		parent.left = now.offsetX() + 3 + 'px'
		parent.display = ''
		naming.className = now.io < 0 ? 'input' : now.io > 0 ? 'output' : 'datum'
		naming.focus(), naming.value = now.name, naming.select()
		this.Name(null, true)
		this.compile(true)
	}
	else
		parent.display != (parent.display = 'none') && this.dom.focus(),
		done && this.com.Name(naming.value),
		this.compile(false)
},

// start if drag is a command, done if drag is true, cancel if drag is false
Drag: function (drag, sameDragDone)
{
	var foc = this.foc, d
	if (sameDragDone && drag == this.drag && !this.dragerr)
		drag = true
	if (drag instanceof Function)
		drag.call(this.com, null, true) || this.Now(foc, false, null, drag)
	else if (d = this.drag)
		this.Now(this.now, false, null, null),
		drag && d.call(this.com, foc)
},

key: function (e)
{
	if (e.target == this.naming &&
		(e.keyCode != 13 && e.keyCode != 27 || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey))
		return // neither esc nor enter
	var k = e.type == 'keypress' && e.which // charCode uncompatible
	if (k >= 32)
		(e.ctrlKey || e.altKey || e.metaKey) && (k = -k)
	else
		k = e.keyCode + 0.5,
		(e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) && (k = -k)

	try
	{
	switch (k)
	{
	case 37.5: this.focLeft(); break // left
	case 39.5: this.focRight(); break // right
	case 38.5: this.focUp(); break // up
	case 40.5: this.focDown(); break // down
	case -37.5: case -122: case -90: case -90.5: this.com.undo(); break // func-left func-z
	case -39.5: case -121: case -89: case -89.5: this.com.redo(); break // func-right func-y
	case -38.5: this.navPrev(); break // func-up
	case -40.5: this.navNext(); break // func-down
	case 36.5: this.focHome(); break // home
	case 35.5: this.focEnd(); break // end
	case 9.5: this.focInner(); break // tab
	case 27.5: this.nowOk(false); break // esc

	case 122: case -9.5: this.focZone(); break // z func-tab
	case 32: this.focInner(); break // space
	case 44: this.focInput(); break // ,
	case 96: this.focDatum(); break // `
	case 46: this.focOutput(); break // .
	case 58: case 59: this.focNamesake(k == 58); break // ;
	case 91: case 123: this.focBase(k == 91); break // [ {
	case 93: case 125: this.focUsage(k == 93); break // ] }
	case 45: case 95: this.focFold(); break // - _
	case 43: case 61: this.focUnfold(k == 43 ? 4 : 3); break // + =

	case 13.5: this.nowOk(true); break; // enter
	case 105: case 73: this.com.input(k == 73); break // i I
	case 104: case 72: this.com.hub(k == 72); break // h H
	case 111: case 79: this.com.output(k == 79); break // o O
	case 101: this.Drag(this.com.early); break; // e
	case 108: this.Drag(this.com.later); break; // l
	case 69: this.Drag(this.com.earlyRow); break; // E
	case 76: this.Drag(this.com.laterRow); break; // L
	case 110: this.Drag(this.com.namesake); break; // n
	case 98: this.Drag(this.com.base); break; // b
	case 117: this.Drag(this.com.usage); break; // u
	case 116: case 63: this.com.trialVeto(-1); break // t ?
	case 118: case 33: this.com.trialVeto(1); break // v !
	case 121: this.com.nonyield(); break // y
	case -13.5: this.com.breakRow(); break // func-enter
	case 8.5: this.com.removeLeft(); break // back
	case 46.5: this.com.remove(); break // del
	case -8.5: case -46.5: this.com.removeRight(); break // func-del func-back

	default: return e = null
	}
	}
	finally
	{
		e && e.preventDefault() // key consumed
	}
},

////////////////////////////////           ////////////////////////////////
//////////////////////////////// load save ////////////////////////////////
////////////////////////////////           ////////////////////////////////

Unsave: function (delta)
{
	if ( !this.unsave != !(this.unsave += delta))
		this.onUnsave(this, this.unsave)
	this.compile()
},

onUnsave: function (edit, unsave) {},

////////////////////////////////         ////////////////////////////////
//////////////////////////////// compile ////////////////////////////////
////////////////////////////////         ////////////////////////////////

compile: function (pause)
{
	this.compileTime && clearTimeout(this.compileTime)
	if (pause == null || pause == false && this.compileTime)
		this.compileTime = Util.timer(400, null, Compile, [ this ])
},

}

})()
