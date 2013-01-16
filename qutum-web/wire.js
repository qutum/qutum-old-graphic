//
// Qutum 10 implementation
// Copyright 2008-2013 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function () {

Wire = function ()
{
}
var S = Datum.SPACE / 4, SS = Datum.SPACE / 2

Wire.prototype =
{

edit: null,
base: null,
agent: null,
zone: null, // common zone of zb and za, should be cycle zone or base.bzer.zone
zb: null, // outermost zone of base, or base, inside wire, should be cycle zone or base.bzer
za: null, // outermost zone of agent, or agent, inside wire
yield: 0, // 0 nonyield >0 yield <0 yield while compiling // with error ?

err: '',
showing: false,
xys: null, // [ x, y, ... ] relative to zone
x: 0, // minimal x
y: 0, // minimal y
w: 0,
h: 0,
navPrev: null,
navNext: null,

addTo: function (b, a)
{
	if (b || a)
	{
		if (b == a)
			throw 'wire self'
		var d = b.deep - a.deep
		var zzb = b, zb = b, zza = a, za = a
		while (d > 0)
			zb = zzb, zzb = zb.zone, --d
		while (d < 0)
			za = zza, zza = za.zone, ++d
		while (zzb != zza)
			zb = zzb, zzb = zb.zone, za = zza, zza = za.zone
		this.base = b, this.agent = a
		this.zb = zb, this.za = za
		this.edit = zzb.edit
		this.zone = zzb, zzb.ws.push(this)
		this.yield || Compile.wire1(this) // skip layout if error
	}
	else
		this.zone.ws.push(this)
	this.showing = true, this.edit.show(true)
},

unadd: function ()
{
	ArrayRem(this.zone.ws, this) // no zone layout
	var p = this.navPrev, n = this.navNext
	this.edit.now == this && this.edit.Now(p, false)
	p && (p.navNext = n), n && (n.navPrev = p)
	this.navPrev = this.navNext = null
},

////////////////////////////////      ////////////////////////////////
//////////////////////////////// view ////////////////////////////////
////////////////////////////////      ////////////////////////////////

layout: function (force)
{
	if ( !this.showing && !force)
		return
	this.showing = false
	if (this.zone.detail <= 2)
		return this.xys = null

	var xys = this.xys = [], zone = this.zone, base = this.base, agent = this.agent,
		zb = this.zb, za = this.za, bx, by, b5, bq, ax, ay, aw, a5, aq, x, y
	bx = base.offsetX(zone), b5 = bx + base.w / 2
	bq = base.w ? 1 : 0
	if (base != zone)
		by = this.err ? base.offsetY(zone) + base.h - bq : zb.y + zb.h - 1
	x = agent.offsetX(zone), y = agent.offsetY(zone)
	if (this.err || base == zone)
		ax = x, ay = y, aw = agent.w, a5 = ax + aw / 2
	else
		ax = za.x, ay = za.y, aw = za.w, a5 = ax + aw / 2
	aq = agent.w ? 1 : 0
	if (b5 < ax && bx + base.w < a5)
		bx += base.w - bq, aw = 0 // right of base, left of agent
	else if (a5 < bx && ax + aw < b5)
		bx += bq // left of base, right of agent
	else if ((b5 < a5) == (base.w < aw))
		bx += bq, aw = 0 // left of base, left of agent
	else
		bx += base.w - bq // right of base, right of agent
	if (this.err)
		xys.push(ax, ay, bx, base == zone ? ay : by)
	else
	{
		ax = aw ? x - aq : x + aq, ay = y + aq
		xys.push(x = aw ? ax + agent.w : ax, y = ay)
		var azer = agent.azer, a = agent, r
		for (; a != azer; a = a.zone)
			ax -= a.x, ay -= a.y
		while (a != za || base == zone)
		{
			Up: if (a.detail >= 2)
			{
				r = a.row
				Hori: if (a != azer || agent == azer)
					if (aw)
					{
						for (var D = r.length - 1; a != r[D]; D--)
							if (r[D].y - a.y <= y - ay)
								break Hori
						break Up
					}
					else
					{
						for (var D = 0; a != r[D]; D++)
							if (r[D].y - a.y <= y - ay)
								break Hori
						break Up
					}
				xys.push(x, y = ay - a.y + r.y - S - SS * a.x / r.w)
			}
			if (a == za)
				break; // base == zone
			ax -= a.x, ay -= a.y
			a = a.zone
			if (a.detail >= 2)
				x = S + S * (y - ay) / a.h,
				xys.push(x = aw ? ax + a.w + x : ax - x, y)
		}
		if (base == zone)
			by = y
		else if ((r = a.row) == zb.row)
		{
			ax = x
			if (ax == a.x + aq)
				xys.push(ax -= S + S, y)
			if (r[r.indexOf(a) - 1] == zb && base == zb)
				xys.push(ax, by)
			else
				xys.push(ax, ay = r.y + r.h + S + SS * bx / r.w, bx, ay)
		}
		else
		{
			ax = x, ay = r.y - S - SS * a.x / zone.w
			xys.push(ax, ay)
			var i = zone.rows.indexOf(r)
			while ((r = zone.rows[--i]) != zb.row)
			{
				d = r[r.searchDatumX(ax)]
				if (d && ax > d.x - S && ax < d.x + d.w + S)
					if (ax < d.x + d.w / 2)
						ax = d.x - S - S * ax / zone.w
					else
						ax = d.x + d.w + S + S * ax / zone.w
				xys.push(ax, ay)
				xys.push(ax, ay = r.y - S - SS * ax / zone.w)
			}
			if (ax - bx < -2 || ax - bx > 2)
				xys.push(bx, ay)
		}
		xys.push(bx, by)
	}
	var i = xys.length - 1, y0 = xys[i--], x0 = xys[i--], y9 = y0, x9 = x0
	while (i > 0)
		y = xys[i--], x = xys[i--],
		x < x0 ? x0 = x : x > x9 && (x9 = x),
		y < y0 ? y0 = y : y > y9 && (y9 = y)
	this.x = x0 - 2, this.y = y0 - 2
	this.w = x9 - x0 + 4, this.h = y9 - y0 + 4
},

// X Y W H is draw area based on zone
_show: function (draw, X, Y, W, H)
{
	var s = this.xys, edit = this.edit
	if ( !s)
		return
	if (this == edit.hit && (this != edit.now || edit.drag))
		draw.strokeStyle = this.err ? '#f00' : '#6c6',
		draw.lineWidth = this.yield ? 2.125 : 2.75
	else if (this == edit.now)
		draw.strokeStyle = this.err ? '#f00' : '#080',
		draw.lineWidth = this.yield ? 1.875 : 2.75
	else
		draw.strokeStyle = this.err ? '#f33' : '#555',
		draw.lineWidth = this.yield ? 1.125 : 2
	draw.beginPath()
	draw.moveTo(s[0] - X, s[1] - Y)
	for (var i = 2, n = s.length; i < n; )
		draw.lineTo(s[i++] - X, s[i++] - Y)
	draw.stroke()
},

hit: function (x, y)
{
	var s
	if (x < this.x || x >= this.x + this.w || y < this.y || y >= this.y + this.h)
		return null
	if ( !(s = this.xys))
		return null
	var x1 = s[0], y1 = s[1], x2, y2, p, q
	for (var i = 2, n = s.length; i < n; )
	{
		x2 = s[i++], y2 = s[i++]
		if (y1 == y2 ? y > y1 -3 && y < y1 +3 && (x >= x1 && x <= x2 || x >= x2 && x <= x1)
		: x1 == x2 ? x > x1 -3 && x < x1 +3 && (y >= y1 && y <= y2 || y >= y2 && y <= y1)
		: (x > x1 -2 && x < x2 +2 || x > x2 -2 && x < x1 +2)
			&& (y > y1 -2 && y < y2 +2 || y > y2 -2 && y < y1 +2)
			&& (p = (x1 - x2) / (y1 - y2), x > (q = (y - y2) * p + x2) -3 && x < q +3
				|| y > (q = (x - x2) / p + y2) -3 && y < q +3))
			return this
		x1 = x2, y1 = y2
	}
	return null
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

////////////////////////////////      ////////////////////////////////
//////////////////////////////// edit ////////////////////////////////
////////////////////////////////      ////////////////////////////////

////////////////////////////////           ////////////////////////////////
//////////////////////////////// load save ////////////////////////////////
////////////////////////////////           ////////////////////////////////

save: function (out)
{
	Util.saveN(out, this.base.el)
	Util.saveN(out, this.agent.el)
},

load: function (In, els)
{
	var b = els[Util.loadN(In)], a = els[Util.loadN(In)]
	if ( !b || !a || b == a)
		throw 'invalid wire'
	if (b.agent(this, a))
		throw 'duplicate wire'
},

}

})()