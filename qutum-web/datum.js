//
// Qutum 10 implementation
// Copyright 2008-2013 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function () {

Datum = function (io, layer, layerU)
{
	this.io = io
	if (layer)
		this.layer = layer, this.unity = layerU
	else if (io)
		this.unity = ++Unity
	this.uNext = this.uPrev = this
	this.rows = []
	this.ws = []
	this.bs = []
	this.as = []
}
var Unity = 0
var SIZE0 = Datum.SIZE0 = 20, SPACE = Datum.SPACE = 20, NAME_WIDTH = Datum.NAME_WIDTH = 50

Datum.prototype =
{

edit: null,
zone: null,
deep: 1, // zone.deep + 1
io: 0, // <0 input >0 output 0 neither input nor output
unity: 0, // >0 for layer 1 <0 for layer 2
uNext: null, // next unity
uPrev: null, // previous unity
gene: false,
tv: 0, // >0 trial <0 veto 0 neither
zv: false, // zoner is veto
bzer: null, // innermost non output zoner or this, as base zoner
azer: null, // innermost non input zoner or this, as agent zoner
bs: null, // [Wire]
as: null, // [Wire]
cycle: null, // cycle base
layer: 0, // 0 for layer 1, 2 for layer 2
row: null, // null for zonest
rows: null, // []
ox: -1, // -1: no inner datum, >=1: output row index, == rows.length - 1
ws: null, // [ Wire inside this ]

el: NaN, // small early, big later, asynchronous update
mustRun: false, // must run or may run, as agent zoner
yield: 0,
yR: 0,
yD: 0,
unyR: 0,
unyD: 0,
us: null, // { unity:Datum }
bbs: null, // [Wiring]
base0: 0, // the maximum deep of all outermost bases
mn: 0, // match iteration

name: '',
nameY: 0, // text top
nameR: 0, // with left and right margin of around 3px each
nameH: 0, // with top and bottom margin of around 3px each
err: '',
x: 0,
y: 0,
w: 0,
h: 0,
detail: 2, // 1: hide, 2: only this, 3: this and inners
showing: 0,
navPrev: null,
navNext: null,

////////////////////////////////       ////////////////////////////////
//////////////////////////////// logic ////////////////////////////////
////////////////////////////////       ////////////////////////////////

addTo: function (z, r, q) // q < 0 to add row
{
	if (z == null)
	{
		this.deep = 1
		this.gene = true
		this.bzer = this
		this.azer = this
		return this // zonest
	}
	if (z.ox < 0)
		z.rows[0] = Row(z, []), z.rows[1] = Row(z, []),
		z.ox = 1
	if (q < 0)
		z.rows.splice(r, 0, this.row = Row(z, [ this ])),
		z.ox++, q = 0
	else
		(this.row = z.rows[r]).splice(q, 0, this)
	if ( !this.zone)
	{
		this.edit = z.edit
		this.zone = z
		this.deep = z.deep + 1
		if (this.io < 0)
			this.bzer = this,
			this.azer = z.io < 0 ? z.azer : z
		else if (this.io > 0)
			this.gene = z.gene,
			this.bzer = z.io > 0 ? z.bzer : z,
			this.azer = this
		else
			this.gene = z.gene,
			this.bzer = this.azer = this
	}
	this._addTo(this.deep)
	this.showing = 0 // drop last showing to force layout for redo
	this.show(this.layer ? z.layer ? 1 : 2 : this.detail)
	return this
},

_addTo: function (deep)
{
	var u = this.edit.us[this.unity]
	u && this.unityTo(u)
	for (var W = 0, w; w = this.bs[W]; W++)
		if (w.zone.deep < deep)
			w.base.as.push(w), w.addTo()
	for (var W = 0, w; w = this.as[W]; W++)
		if (w.zone.deep < deep)
			w.agent.bs.push(w), w.addTo()
	for (var R = 0, r; r = this.rows[R]; X++)
		for (var D = 0, d; d = r[D]; D++)
			d._addTo(deep)
},

// return true if the row is unadd
unadd: function (r, q)
{
	this._unadd(this.deep)
	var z = this.zone, unrow = false
	this.row.splice(q, 1)
	this.io || this.row.length || (z.rows.splice(r, 1), z.ox--, unrow = true)
	if (z.ox == 1 && z.rows[0].length + z.rows[1].length == 0)
		z.rows = [], z.ox = -1
	this.showing = 0, z.show(3)
	var p = this.navPrev, n = this.navNext
	this.edit.now == this && this.edit.Now(p, false)
	p && (p.navNext = n), n && (n.navPrev = p)
	this.navPrev = this.navNext = null
	return unrow
},

_unadd: function (deep)
{
	this.uNext != this && this.unityTo(this, true)
	for (var W = 0, w; w = this.bs[W]; W++)
		if (w.zone.deep < deep)
			ArrayRem(w.base.as, w), w.unadd()
	for (var W = 0, w; w = this.as[W]; W++)
		if (w.zone.deep < deep)
			ArrayRem(w.agent.bs, w), w.unadd()
	for (var R = 0, r; r = this.rows[R]; R++)
		for (var D = 0, d; d = r[D]; D++)
			d._unadd(deep)
},

Name: function (v)
{
	var c0 = v.charCodeAt(0), w
	if (c0 == 63 || c0 == 33) // ? !
		v = v.substr(1)
	if (this.name == v)
		return
	for (var d = this.uNext; d != this; d = d.uNext)
		if (v)
			w = d._Name(v, w)
		else
			throw 'empty unity name'
	this._Name(v, w)
},

_Name: function (v, width)
{
	this.name = v
	width != null || (width = v ? this.edit.draw.measureText(v).width | 0 : 0)
	v = (this.tv ? this.edit.nameTvW : 0) + width
	this.nameR = v && (v + 6), this.nameH = v && (this.edit.nameH + 5)
	this.show(-1)
	return width
},

toString: function ()
{
	return "'" + this.name + "'"
},

Tv: function (tv)
{
	var tv0 = this.tv
	if (tv0 == tv)
		return
	this.tv = tv
	!tv0 != !tv && this._Name(this.name)
},

// replace is true by default, return exist
agent: function (w, a, replace)
{
	if (replace !== false)
		for (var W = this.as.length - 1, w0; w0 = this.as[W]; W--)
			if (w0.agent == a)
			{
				this.as[W] = w, a.bs[a.bs.indexOf(w0)] = w,
				w0.unadd(), w.zone ? w.addTo() : w.addTo(this, a)
				return w0
			}
	this.as.push(w), a.bs.push(w)
	w.zone ? w.addTo() : w.addTo(this, a)
	return null
},

unagent: function (w)
{
	var x = this.as.indexOf(w), a = w.agent
	if (x < 0)
		return
	this.as.splice(x, 1), ArrayRem(a.bs, w)
	w.unadd()
},

breakRow: function (r, x)
{
	var r0 = this.rows[r], r1 = Row(this, r0.splice(x)), d
	this.rows.splice(r + 1, 0, r1)
	for (d = r1.length - 1; d >= 0; d--)
		r1[d].row = r1
	this.ox++
	this.show(3)
},

// return the length before merge
mergeRow: function (r)
{
	var r0 = this.rows[r], r1 = this.rows.splice(r + 1, 1)
	if (r1 == null)
		return -1
	var n0 = r0.length, r1 = r1[0]
	r0.push.apply(r0, r1)
	for (d = r1.length - 1; d >= 0; d--)
		r1[d].row = r0
	this.ox--
	this.show(3)
	return n0
},

unityTo: function (u, keepUnity)
{
	if (this.io != u.io || !u.io)
		throw 'must be input or output both'
	if (u == this == (this.uNext == this) && this.unity == u.unity)
		return
	if ( !u.name && !this.name)
		throw 'unity must have name'
	if (this.uNext != this)
		this.uNext.uPrev = this.uPrev,
		this.uPrev.uNext = this.uNext,
		this.edit.us[this.unity] == this && (this.edit.us[this.unity] = this.uNext)
	if (u == this)
		this.uNext = this.uPrev = this,
		!keepUnity && (this.unity = ++Unity)
	else
	{
		u.uNext == u && (this.edit.us[u.unity] = u)
		this.uPrev = u.uPrev, u.uPrev.uNext = this
		this.uNext = u, u.uPrev = this
		this.unity = u.unity
		u.name ? this._Name(u.name) : u.Name(this.name)
	}
},

////////////////////////////////      ////////////////////////////////
//////////////////////////////// view ////////////////////////////////
////////////////////////////////      ////////////////////////////////

layoutDetail: function ()
{
	var dd = this.showing, d
	if (dd >= 4 || !this.zone)
		this.detail = 3
	else if (dd > 0)
		this.detail = dd < 2 && this.edit.now == this ? 2 : dd
	for (var R = 0, r; r = this.rows[R]; R++)
		for (var D = 0; d = r[D]; D++)
		{
			if (dd > 0)
				if (dd >= 4 && !d.layer)
					d.showing = 4
				else if (dd <= 2)
					d.showing = 1
			d.layoutDetail()
			if (d.detail >= 2 && this.detail < 3)
				this.detail = this.showing = 3
		}
	if (this.detail >= 3)
		for (var R = 0, r; r = this.rows[R]; R++)
			for (var D = 0; d = r[D]; D++)
				if (d.detail < 2)
					d.detail = d.showing = 2
},

layout: function (force)
{
	var rs = this.rows, ws = this.ws, r, w, h, w2, h2
	for (var R = 0; r = rs[R]; R++)
		for (var D = 0, d; d = r[D]; D++)
			d.layout(false) && (force = true)
	this.showing && (force = true, this.showing = 0)
	if ( !force)
	{
		for (var W = 0; w = ws[W]; W++)
			w.layout(false)
		return false
	}
	if (this.detail <= 1)
	{
		for (var R = 0; r = rs[R]; R++)
			r.layout(0, 0, 0, 0)
		for (var W = 0; w = ws[W]; W++)
			w.layout(true)
		this.w = this.h = 0
		return true
	}
	var nr = this.nameR, nh = this.nameH
	if (this.ox < 0)
	{
		this.w = Math.max(SIZE0, nr)
		this.h = Math.max(SIZE0, nh)
		this.nameY = 2
	}
	else if (this.detail == 2)
	{
		this.w = Math.max(SIZE0, nr)
		this.h = Math.max(SIZE0, nh + 6)
		this.nameY = 2
		w2 = this.w >> 1, h2 = nh || this.h >> 1
		rs[0].layout(0, w2, w2, 0)
		for (var R = 1; r = rs[R]; R++)
			r.layout(0, w2, w2, h2)
		for (var W = 0; w = ws[W]; W++)
			w.layout(true)
	}
	else
	{
		r = rs[0]
		if (r.length && nr > NAME_WIDTH)
			w = Math.max(SIZE0, nr, r.layoutW())
		else
			w = Math.max(SIZE0, nr + r.layoutW())
		for (var R = 1; r = rs[R]; R++)
			w = Math.max(w, r.layoutW())
		r = rs[0]
		if (r.length && nr > NAME_WIDTH)
			r.layout(1, 0, w, 0),
			h = r.h + 3
		else
			r.layout(1, nr, w, 0),
			h = 0
		this.nameY = h + 2
		h = Math.max(h + nh, r.h + SPACE)
		for (var R = 1; r = rs[R]; R++)
			r.layout(R < this.ox ? 2 : 3, 0, w, h),
			h += R < this.ox ? r.h + SPACE : r.h
		this.w = w, this.h = h
		for (var W = 0; w = ws[W]; W++)
			w.layout(true)
	}
	return true
},

// 0: no show, <0: show, 1: hide, 2: show only this
// 3: show this and inners, >=4: show all deeply
show: function (x)
{
	if (this.showing <= 0 || x > this.showing)
		this.showing = x, this.edit.show(true)
	return true
},

// X Y W H is draw area based on this datum
_show: function (draw, X, Y, W, H)
{
	var w = this.w, h = this.h
	if (X >= w || Y >= h || X + W <= 0 || Y + H <= 0 || !w)
		return
	draw.translate(-X, -Y)

	var edit = this.edit, io = this.io, s = this.rows, R, r, D, d, x, y, rh, dw, dh

	draw.fillStyle = io < 0 ? '#fbf6ff' : io > 0 ? '#f3f8ff' : '#f9fff9'
	if (this.detail > 2 && this.ox > 0)
		for (R = this.searchRow(Y), R ^= R >> 31, y = 0; (r = s[R]) && y < Y + H; R++)
		{
			draw.fillRect(0, y, w, -y + (y = r.y))
			rh = r.h
			D = r.searchDatumX(X), D ^= D >> 31
			for (x = 0; (d = r[D]) && x < X + W; D++)
				draw.fillRect(x, y, -x + (x = d.x), rh), // left
				draw.fillRect(x, y, dw = d.w, d.y - y), // top
				draw.fillRect(x, dh = d.y + d.h, dw, y + rh - dh), // bottom
				x += dw
			D && (d = r[D - 1], draw.fillRect(dw = d.x + d.w, y, w - dw, rh))
			y += rh
		}
	else
		draw.fillRect(0, 0, w, h)

	var c = this.err ? '#f00' : io < 0 ? '#90c' : io > 0 ? '#06d' : '#080'
	draw.strokeStyle = c
	draw.lineWidth = this.yield ? 0.5 : 1, draw.strokeRect(0.5, 0.5, w - 1, h - 1)
	if (this.gene)
		draw.fillStyle = c, draw.beginPath(),
		draw.moveTo(1, 1), draw.lineTo(4, 1), draw.lineTo(1, 6), draw.fill()
	if (this.yield)
		draw.fillStyle = c, draw.beginPath(),
		draw.moveTo(0, 0), draw.lineTo(-3, 0), draw.lineTo(0, 6), draw.fill()
	if (this.detail == 2 && this.ox > 0)
		draw.lineWidth = 2, draw.strokeRect((w >> 1) - 3, this.nameH || h >> 1, 6, 0)

	if (this.uNext != this && this.unity == edit.nav.unity)
		draw.fillStyle = io < 0 ? '#ecf' : '#cce3ff',
		draw.fillRect(2, this.nameY, this.nameR - 4, edit.nameH + 1)
	if (D = this.tv)
		draw.fillStyle = '#000', draw.fillText(D < 0 ? '?' : '!', 3, this.nameY + edit.nameH)
	if (d = this.name)
		draw.fillStyle = '#000', draw.fillText(d, (D && edit.nameTvW) + 3, this.nameY + edit.nameH)

	draw.translate(X, Y)
	for (R = 0; r = s[R]; R++)
		if (Y - r.y < r.h && Y + H > r.y)
			for (D = 0; d = r[D]; D++)
				d._show(draw, X - d.x, Y - d.y, W, H)
	if (this == edit.hit && (this != edit.now || edit.drag))
		draw.translate(-X, -Y),
		draw.strokeStyle = this.err ? '#f66' : io < 0 ? '#d8f' : io > 0 ? '#8bf' : '#7d7',
		draw.lineWidth = this.yield ? 1 : 2, draw.strokeRect(-0.5, -0.5, w + 1, h + 1),
		draw.translate(X, Y)
	else if (this == edit.now)
		draw.translate(-X, -Y), draw.strokeStyle = c,
		draw.lineWidth = this.yield ? 1 : 2, draw.strokeRect(-0.5, -0.5, w + 1, h + 1),
		draw.translate(X, Y)

	if (this.detail >= 3)
		for (s = this.ws, x = 0; s[x]; x++)
			s[x]._show(draw, X, Y, W, H)
},

hit: function (xy, wire)
{
	var d = this, x = xy[0] - d.x, y = xy[1] - d.y
	if (x < 0 || y < 0 || x >= this.w || y >= this.h)
		return null
	xy[0] = d.x, xy[1] = d.y
	for (;;)
	{
		if (wire !== false && d.detail >= 3)
			for (var W = 0, w; w = d.ws[W]; W++)
				if (w.hit(x, y))
					return xy[0] += w.x, xy[1] += w.y, w
		var i = d.searchRow(y)
		if (i < 0)
			break
		var r = d.rows[i]
		i = r.searchDatum(x, y)
		if (i < 0)
			break
		d = r[i]
		x -= d.x, y -= d.y
		xy[0] += d.x, xy[1] += d.y
	}
	return d
},

offsetX: function (z)
{
	for (var x = 0, d = this; d != z; d = d.zone)
		x += d.x
	return x
},

offsetY: function (z)
{
	for (var y = 0, d = this; d != z; d = d.zone)
		y += d.y
	return y
},

searchRow: function (y)
{
	if (y < 0)
		return -1
	var low = 0, high = this.ox, s = this.rows
	while (low <= high)
	{
		var mid = low + high >>> 1, r = s[mid]
		if (y < r.y)
			high = mid - 1
		else if (y >= r.y + r.h)
			low = mid + 1
		else
			return mid
	}
	return ~low
},

////////////////////////////////      ////////////////////////////////
//////////////////////////////// edit ////////////////////////////////
////////////////////////////////      ////////////////////////////////

////////////////////////////////           ////////////////////////////////
//////////////////////////////// load save ////////////////////////////////
////////////////////////////////           ////////////////////////////////

save: function (out, us, el)
{
	this.el = ++el
	var uel
	if (this.unity < 0)
		uel = this.unity;
	else if (this.io && this.uNext != this)
		(uel = us[this.unity]) || (us[this.unity] = el)
	Util.saveN(out, (this.tv < 0 ? 8 : this.tv ? 16 : 0) | (uel && 32) |
		(this.io < 0 ? 1 : this.io > 0 ? 3 : !this.zone || this != this.row[0] ? 2 : 34))
	uel ? Util.saveN(out, uel) : Util.saveS(out, this.name)
	for (var R = 0, r; r = this.rows[R]; R++)
		for (var D = 0, d; d = r[D]; D++)
			d.yield || d.layer || (el = d.save(out, us, el))
	for (var W = 0, w; w = this.ws[W]; W++)
		w.yield || (Util.saveN(out, 4), w.save(out))
	Util.saveN(out, 0)
	return el
},

load: function (In, els)
{
	this.el = els.push(this)
	var x = Util.loadN(In), d
	this.Tv(x & 8 ? -1 : x & 16 ? 1 : 0)
	if (~x & 32 || this.io == 0)
		this.Name(Util.loadS(In))
	else if (d = els[Util.loadN(In)])
		this.unityTo(d)
	else
		throw 'invalid unity'
	for (var X = x = xx = 0; x = (xx = Util.loadN14(In)) & 7; X = x)
		if (x < X)
			throw 'invalid format'
		else if (x == 1)
			new Datum(-1).addTo(this, 0,
				this.ox < 0 ? 0 : this.rows[0].length).load(In, els)
		else if (x == 2)
			if (xx & 32)
				new Datum(0).addTo(this, this.ox < 0 ? 1 : this.ox, -1).load(In, els)
			else
				new Datum(0).addTo(this, this.ox <= 1 ? 1 : this.ox - 1,
					this.ox <= 1 ? 0 : this.rows[this.ox - 1].length).load(In, els)
		else if (x == 3)
			new Datum(1).addTo(this, this.ox < 0 ? 1 : this.ox,
				this.ox < 0 ? 0 : this.rows[this.ox].length).load(In, els)
		else if (x == 4)
			Util.loadN(In), new Wire().load(In, els)
		else
			throw 'invalid format'
	Util.loadN(In)
},

}

})()