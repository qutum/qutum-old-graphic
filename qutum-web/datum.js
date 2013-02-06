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
	this.uNext = this.uPrev = this
	this.rows = []
	this.ws = []
	this.bs = []
	this.as = []
}
var SIZE0 = Datum.SIZE0 = 20, SPACE = Datum.SPACE = 20, NAME_WIDTH = Datum.NAME_WIDTH = 50

Datum.prototype =
{

edit: null, // null for unadd
id: 0,
zone: null, // null for zonest
deep: 1, // zone.deep + 1
io: 0, // <0 input >0 output 0 nonput
unity: 0, // >0 for layer 1 <0 for layer 2
uNext: null, // next unity
uPrev: null, // previous unity
gene: false,
tv: 0, // <0 trial >0 veto 0 neither
zv: false, // outside zone is veto
zb: null, // innermost outside nonput or input zones, or this, as zoner base
za: null, // innermost outside nonput or output zones, or this, as zoner agent
bs: null, // [ base wire ]
as: null, // [ agent wire ]
cycle: null, // cycle base
layer: 0, // 0 for layer 1, 2 for layer 2
row: null, // null for zonest
rows: null, // []
ox: -1, // -1: no inner datum, >=1: output row index, == rows.length - 1
ws: null, // [ Wire inside this ]

el: NaN, // small early, big later, asynchronous update
mustRun: false, // must run or may run, as zoner agent
yield: 0, // 0 nonyield >0 yield <0 old yield while compiling
us: null, // { unity: Datum }
gzb: false, // gene, or has base and all zoner base zoner bases are gene
ps: null, // wired passes from base or base base, { base.id: outermost wire }
pdeep0: 0, // outermost zone deep of passes
padeep0: 0, // outermost zone deep of passes which agents are this
mn: 0, // match iteration

name: '',
nameY: 0, // text top
nameR: 0, // with left and right margin of around 3px each
nameH: 0, // with top and bottom margin of around 3px each
err: null, // '' or [ '' or Datum... ]
derr: false, // error inside
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

addTo: function (z, R, D) // D < 0 to add row
{
	if (z == null)
	{
		this.id = this.edit.newId++
		this.deep = 1
		this.gene = true
		this.zb = this
		this.za = this
		return this // zonest
	}
	this.edit = z.edit
	if ( !this.id)
		this.id = this.edit.newId++
	if (this.io && !this.unity)
		this.unity = this.edit.newUnity++
	if (z.ox < 0)
		z.rows[0] = Row(z, []), z.rows[1] = Row(z, []),
		z.ox = 1
	if (D < 0)
		z.rows.splice(R, 0, this.row = Row(z, [ this ])),
		z.ox++, D = 0
	else
		(this.row = z.rows[R]).splice(D, 0, this)
	if ( !this.zone)
	{
		this.zone = z
		this.deep = z.deep + 1
		if (this.io < 0)
			this.zb = this,
			this.za = z.io < 0 ? z.za : z
		else if (this.io > 0)
			this.gene = z.gene,
			this.zb = z.io > 0 ? z.zb : z,
			this.za = this
		else
			this.gene = z.gene,
			this.zb = this.za = this
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
	for (var R = 0, r; r = this.rows[R]; R++)
		for (var D = 0, d; d = r[D]; D++)
			d._addTo(deep)
},

// return true if the row is unadd
unadd: function (R, D)
{
	this._unadd(this.deep)
	var z = this.zone, unrow = false
	this.row.splice(D, 1)
	if ( !this.io && !this.row.length)
		z.rows.splice(R, 1), z.ox--, unrow = true // nonput all nonyield
	this.row = null
	if (z.ox == 1 && z.rows[0].length + z.rows[1].length == 0)
		z.rows = [], z.ox = -1
	this.showing = 0, z.show(3)
	var p = this.navPrev, n = this.navNext
	this.edit.now == this && this.edit.Now(p, false)
	p && (p.navNext = n), n && (n.navPrev = p)
	this.navPrev = this.navNext = null
	this.edit = null
	return unrow
},

_unadd: function (deep)
{
	this.uNext != this && this.unityTo(this, true)
	for (var s = this.bs, W = 0, Q = 0, w; w = s[Q] = s[W]; W++, Q++)
		if (w.zone.deep < deep)
			ArrayRem(w.base.as, w), w.unadd(), w.yield && Q--
	s.length = Q
	for (var s = this.as, W = 0, Q = 0, w; w = s[Q] = s[W]; W++, Q++)
		if (w.zone.deep < deep)
			ArrayRem(w.agent.bs, w), w.unadd(), w.yield && Q--
	s.length = Q
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

breakRow: function (R, D)
{
	var r0 = this.rows[R], r1 = Row(this, r0.splice(D))
	this.rows.splice(R + 1, 0, r1)
	for (var D = r1.length - 1; D >= 0; D--)
		r1[D].row = r1
	this.ox++
	this.show(3)
},

// return the length before merge
mergeRow: function (R)
{
	var r0 = this.rows[R], r1 = this.rows.splice(R + 1, 1)
	if (r1 == null)
		return -1
	var n0 = r0.length, r1 = r1[0]
	r0.push.apply(r0, r1)
	for (var D = r1.length - 1; D >= 0; D--)
		r1[D].row = r0
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
		this.uNext == this.uPrev ? delete this.edit.us[this.unity] :
			this.edit.us[this.unity] == this && (this.edit.us[this.unity] = this.uNext)
	if (u == this)
		this.uNext = this.uPrev = this,
		!keepUnity && (this.unity = this.edit.newUnity++)
	else
	{
		u.uNext == u && (this.edit.us[u.unity] = u)
		this.uPrev = u.uPrev, u.uPrev.uNext = this
		this.uNext = u, u.uPrev = this
		this.unity = u.unity
		u.name ? this._Name(u.name) : u.Name(this.name)
	}
},

uNonyield: function ()
{
	if ( !this.yield)
		return this // use self rather than edit.us
	var uu = this.edit.us[this.unity], u = uu
	if ( !uu)
		return null
	while (u.yield)
		if ((u = u.uNext) == uu)
			return null
	if (u != uu)
		this.edit.us[this.unity] = u
	return u
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
		this.w = Math.max(SIZE0, nr), this.h = Math.max(SIZE0, nh)
		this.nameY = 2
	}
	else if (this.detail == 2)
	{
		this.w = Math.max(SIZE0, nr), this.h = Math.max(SIZE0, nh + 6)
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
			r.layout(1, 0, w, 0), h = r.h + 3
		else
			r.layout(1, nr, w, 0), h = 0
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

	var edit = this.edit, io = this.io, R, r, D, d, x, y

	draw.fillStyle = io < 0 ? '#fbf6ff' : io > 0 ? '#f3f8ff' : '#f9fff9'
	if (this.detail > 2 && this.ox > 0)
		for (R = this.searchRow(Y), R ^= R >> 31, y = 0; (r = this.rows[R]) && y < Y + H; R++)
		{
			draw.fillRect(0, y, w, -y + (y = r.y))
			var rh = r.h, dw, dh
			D = r.searchDatumX(X), D ^= D >> 31
			for (x = 0; (d = r[D]) && x < X + W; D++)
				draw.fillRect(x, y, -x + (x = d.x), rh), // left
				draw.fillRect(x, y, dw = d.w, d.y - y), // top
				draw.fillRect(x, dh = d.y + d.h, dw, y + rh - dh), // bottom
				x += dw
			if (D)
				d = r[D - 1], draw.fillRect(dw = d.x + d.w, y, w - dw, rh)
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
		draw.lineWidth = 2, draw.strokeStyle = this.derr ? '#f00' : c,
		draw.strokeRect((w >> 1) - 3, this.nameH || h >> 1, 6, 0)

	if (this.uNext != this && this.unity == edit.nav.unity)
		draw.fillStyle = io < 0 ? '#ecf' : '#cce3ff',
		draw.fillRect(2, this.nameY, this.nameR - 4, edit.nameH + 1)
	if (this.tv)
		draw.fillStyle = '#000',
		draw.fillText(this.tv < 0 ? '?' : '!', 3, this.nameY + edit.nameH)
	if (this.name)
		draw.fillStyle = '#000',
		draw.fillText(this.name, (this.tv && edit.nameTvW) + 3, this.nameY + edit.nameH)
//	draw.fillStyle = '#777', draw.fillText(this.gzb ? '_' : '', -12, this.nameY + edit.nameH)

	draw.translate(X, Y)
	for (R = 0; r = this.rows[R]; R++)
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
	{
		var hit
		for (var w, x = 0; w = this.ws[x]; x++)
			w == edit.hit ? hit = w : w._show(draw, X, Y, W, H)
		hit && hit._show(draw, X, Y, W, H)
	}
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
			break;
		var r = d.rows[i]
		i = r.searchDatum(x, y)
		if (i < 0)
			break;
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

}

})()