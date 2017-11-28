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
zone: null, // common zone of bz and az, should be cycle zone or base.zb.zone
bz: null, // outermost zone of base, or base, should be cycle zone or base.zb
az: null, // outermost zone of agent, or agent, be or inside wire zone
yield: 0, // 0 nonyield >0 yield <0 yield while compiling

err: '',
showing: false,
xys: null, // [ x, y, ... ] relative to zone
X: 0, // minimal x
Y: 0, // minimal y
W: 0,
H: 0,
navPrev: null,
navNext: null,

addTo: function (b, a)
{
	if (b || a)
	{
		if (b == a)
			throw 'wire self'
		var d = b.deep - a.deep
		var bzz = b, bz = b, azz = a, az = a
		while (d > 0)
			bz = bzz, bzz = bz.zone, --d
		while (d < 0)
			az = azz, azz = az.zone, ++d
		while (bzz != azz)
			bz = bzz, bzz = bz.zone, az = azz, azz = az.zone
		this.base = b, this.agent = a
		this.bz = bz, this.az = az
		this.edit = bzz.edit
		this.zone = bzz, bzz.ws.push(this)
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

	var xys = this.xys = []
	var zone = this.zone, x, y
	var base = this.base, bz = this.bz, bx, by, b5, bq
	var agent = this.agent, az = this.az, ax, ay, aw, a5, aq
	x = agent.offsetX(zone), y = agent.offsetY(zone)
	if (this.err || base == zone)
		ax = x, ay = y, aw = agent.W, a5 = ax + aw / 2
	else
		ax = az.X, ay = az.Y, aw = az.W, a5 = ax + aw / 2
	aq = agent.W ? 1 : 0
	bx = base.offsetX(zone), b5 = bx + base.W / 2
	bq = base.W ? 1 : 0
	if (b5 < ax && bx + base.W < a5)
		bx += base.W - bq, aw = 0 // right of base, left of agent
	else if (a5 < bx && ax + aw < b5)
		bx += bq // left of base, right of agent
	else if ((b5 < a5) == (base.W < aw))
		bx += bq, aw = 0 // left of base, left of agent
	else
		bx += base.W - bq // right of base, right of agent
	by = base == zone ? ay : this.err ? base.offsetY(zone) + base.H - bq : bz.Y + bz.H - 1
	if (this.err)
		xys.push(ax, ay, bx, by)
	else
	{
		ax = aw ? x - aq : x + aq, ay = y + aq
		x = aw ? ax + agent.W : ax, y = ay, xys.push(x, y)
		var za = agent.za, a = agent, r
		while (a != za) // i.e. a is input
			ax -= a.X, ay -= a.Y, a = a.zone
		while (a != az || base == zone)
		{
			Up: if (a.detail >= 2)
			{
				r = a.row
				if (a != za || agent == za)
				Hori: {
					for (var D = aw ? r.length - 1 : 0; a != r[D]; D += aw ? -1 : 1)
						if (r[D].Y - a.Y <= y - ay)
							break Hori
					break Up
				}
				y = ay - a.Y + r.Y - S - SS * a.X / r.W, xys.push(x, y)
			}
			if (a == az)
				break; // base == zone
			ax -= a.X, ay -= a.Y, a = a.zone
			if (a.detail >= 2)
				x = S + S * (y - ay) / a.H,
				x = aw ? ax + a.W + x : ax - x, xys.push(x, y)
		}
		if (base == zone)
			by = y
		// a == az
		else if ((r = a.row) == bz.row)
		{
			ax = x
			if (a == za && agent != za)
				y -= SS * a.X / r.W, xys.push(ax, y),
				ax = a.X + aq - S, xys.push(ax, y)
			else if (ax == a.X + aq)
				ax -= S + S, xys.push(ax, y)
			if (r[r.indexOf(a) - 1] == bz && base == bz)
				xys.push(ax, by)
			else
				ay = r.Y + r.H + S + SS * bx / r.W, xys.push(ax, ay, bx, ay)
		}
		else
		{
			ax = x, ay = r.Y - S - SS * a.X / zone.W
			xys.push(ax, ay)
			for (var i = zone.rows.indexOf(r)-1, j = zone.rows.indexOf(bz.row);
				r = zone.rows[i], j < i; i--)
			{
				d = r[r.searchDatumX(ax)]
				if (d && ax > d.X - S && ax < d.X + d.W + S)
					if (ax < d.X + d.W / 2)
						ax = d.X - S - S * ax / zone.W
					else
						ax = d.X + d.W + S + S * ax / zone.W
				xys.push(ax, ay)
				ay = r.Y - S - SS * ax / zone.W, xys.push(ax, ay)
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
	this.X = x0 - 2, this.Y = y0 - 2
	this.W = x9 - x0 + 4, this.H = y9 - y0 + 4
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
	if (x < this.X || x >= this.X + this.W || y < this.Y || y >= this.Y + this.H)
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
		x += d.X
	return x
},

offsetY: function (z)
{
	for (var y = 0, d = this; d != z; d = d.zone)
		y += d.Y
	return y
},

}

})()
