//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Command = function (edit)
{
	this.edit = edit
	this.coms = []
}
var UNDOn = 301, IX = Datum.IX, DX = Datum.DX

Command.prototype =
{

edit: null,
coms: null, // [ function ]
x: 0, // next command index, <= coms.length

go: function (f)
{
	var s = this.coms, x = this.x
	if (x && this.edit.yields)
		s[x - 1].ys || (s[x - 1].ys = this.edit.yields)
	f(true)
	s[x++] = f, s.length = this.x = x
	this.edit.Unsave(1)
},

redo: function ()
{
	var com = this.coms[this.x]
	if (com)
		this.unyield(this.edit.yields),
		com(true), this.reyield(com.s), this.x++,
		this.edit.Unsave(1)
},

undo: function ()
{
	var x = this.x
	if ( !x)
		return
	var r = this.coms[x], com = this.coms[this.x = x - 1]
	if (this.edit.yields)
		r || com.ys ? this.unyield(this.edit.yields) : com.ys = this.edit.yields
	this.unyield(com.ys), com(false)
	this.edit.Unsave(-1)
},

reyield: function (s)
{
	if ( !s)
		return
	var q, x
	for (x = 0; q = s[x]; x++)
		q instanceof Datum ? q.addTo(q.zone, q.yR, q.yD)
			: q.base.agent(q, q.agent, false)
	while (q = s[++x])
		q instanceof Datum ? q.unadd(q.unyR, q.unyD) : q.base.unagent(q)
},

unyield: function (s)
{
	if ( !s)
		return
	var q, x
	for (x = s.length - 1; q = s[x]; x--)
		q instanceof Datum ? q.addTo(q.zone, q.unyR, q.unyD)
			: q.base.agent(q, q.agent, false)
	while (q = s[--x])
		q instanceof Datum ? q.unadd(q.yR, q.yD) : q.base.unagent(q)
},

name: function (v)
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD,
		u = now.uNext, m = now.name, um = nu.name
	if (m != v && ( !v || !now.unity.d.layer2))
		this.go(function (redo)
		{
			if (redo)
				now != u && !v && now.unityTo(now), key.name = v
			else
				now != u && !v ? now.unityTo(u) : key.name = m
			this.edit.Now(now, nr, nd)
		})
},

input: function (inner)
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD
	if (now instanceof Wire)
		return
	var z, d = new Datum(-1), dr, dd
	if (now.io < 0 && inner)
		z = now.zone, dr = nr, dd = nd + 1
	else
		z = inner && now.zone || now,
		dr = IX, dd = z.ox < 0 ? 0 : z.rows[dr].length
	this.go(function (redo)
	{
		if (redo)
			d.addTo(z, dr, dd), this.edit.Now(d, dr, dd)
		else
			d.unadd(dr, dd), this.edit.Now(now, nr, nd)
	})
},

datum: function (inner)
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD
	if (now instanceof Wire)
		return
	var z, d = new Datum(0), dr, dd
	if (now.io || !inner || !now.zone)
		z = inner && now.zone || now,
		z.ox <= DX ? (dr = DX, dd = -1) : (dr = z.ox - 1, dd = z.rows[dr].length),
		dd >= 4 && (dr++, dd = -1)
	else
		z = now.zone, dr = nr, dd = nd + 1
	this.go(function (redo)
	{
		if (redo)
			d.addTo(z, dr, dd), this.edit.Now(d, dr, dd)
		else
			d.unadd(dr, dd < 0 ? 0 : dd), this.edit.Now(now, nr, nd)
	})
},

output: function (inner)
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD
	if (now instanceof Wire)
		return
	var z, d = new Datum(1), dr, dd
	if (now.io > 0 && inner)
		z = now.zone, dr = nr, dd = nd + 1
	else
		z = inner && now.zone || now,
		dr = z.ox < 0 ? DX : z.ox, dd = z.ox < 0 ? 0 : z.rows[dr].length
	this.go(function (redo)
	{
		if (redo)
			d.addTo(z, dr, dd), this.edit.Now(d, dr, dd)
		else
			d.unadd(dr, dd), this.edit.Now(now, nr, nd)
	})
},

breakRow: function ()
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD
	if (now.io || nd <= 0)
		return
	this.go(function (redo)
	{
		if (redo)
			now.zone.breakRow(nr, nd), this.edit.Now(now, nr + 1, 0)
		else
			now.zone.mergeRow(nr), this.edit.Now(now, nr, nd)
	})
},

remove: function ()
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD,
		z = now.zone, rs, addRow
	if ( !z)
		return
	rs = z.rows
	if (nr > IX && nr < z.ox - 1 && nd && nd == rs[nr].length - 1)
		this.go(function (redo)
		{
			if (redo)
				now.unadd(nr, nd), z.mergeRow(nr),
				this.edit.Now(z.rows[nr][nd], nr, nd)
			else
				z.breakRow(nr, nd), now.addTo(z, nr, nd),
				this.edit.Now(now, nr, nd)
		})
	else
		this.go(function (redo)
		{
			if (redo)
				addRow = now.unadd(nr, nd),
				this.edit.Now(z.ox < 0 ? z
					: rs[nr][nd] || rs[nr + 1] && rs[nr + 1][0]
					|| rs[nr][nd - 1] || ArrayLast(rs[nr - 1]))
			else
				now.addTo(z, nr, addRow ? -1 : nd), this.edit.Now(now, nr, nd)
		})
},

removeBefore: function ()
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD,
		z = now.zone, d, dd
	if ( !z)
		return
	if (nr > IX + 1 && nr < z.ox && nd == 0)
		this.go(function (redo)
		{
			if (redo)
				dd = z.mergeRow(nr - 1), this.edit.Now(now, nr - 1, dd)
			else
				z.breakRow(nr - 1, dd), this.edit.Now(now, nr, nd)
		})
	else if (nd)
		d = z.rows[nr][dd = nd - 1],
		this.go(function (redo)
		{
			if (redo)
				d.unadd(nr, dd), this.edit.Now(now, nr, dd)
			else
				d.addTo(z, nr, dd), this.edit.Now(now, nr, nd)
		})
},

move: function (r, d)
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD,
		z = now.zone, rs = z.rows, empty = r != nr && rs[nr].length == 1
	if (r == nr && d > nd)
		d--
	this.go(function (redo)
	{
		if (redo)
			rs[nr].splice(nd, 1), rs[r].splice(d, 0, now),
			empty && (z.ox--, rs.splice(nr, 1)),
			z.show(-1), this.edit.Now(now, r, d)
		else
			empty && (z.ox++, rs.splice(nr, 0, Row(z, []))),
			rs[r].splice(d, 1), rs[nr].splice(nd, 0, now),
			z.show(-1), this.edit.Now(now, nr, nd)
	})
},

moveRow: function (r)
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD,
		z = now.zone, rs = z.rows, empty = rs[nr].length == 1
	if (empty && r > nr)
		r--
	this.go(function (redo)
	{
		if (redo)
			empty ? rs.splice(r, 0, rs.splice(nr, 1))
				: (z.ox++, rs[nr].splice(nd, 1), rs.splice(r, 0, Row(z, [ now ]))),
			z.show(-1), this.edit.Now(now, r, 0)
		else
			empty ? z.addChildAt(z.removeChildAt(r), nr)
				: (z.ox--, rs.splice(r, 1), rs[nr].splice(nd, 0, now)),
			z.show(-1), this.edit.Now(now, nr, nd)
	})
},

unity: function (u)
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD,
		u = now.uNext, m = now.name, um = u.name
	this.go(function (redo)
	{
		if (redo)
			now.unityTo(u)
		else
			now.unityTo(u),
			n == now.name || (now.name = m), um == u.name || (u.name = um)
		this.edit.Now(now, nr, nd)
	})
},

trialVeto: function (tv)
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD,
		tv0 = now.tv
	tv0 == tv && (tv = 0)
	this.go(function (redo)
	{
		if (redo)
			now.Tv(tv)
		else
			now.Tv(tv0)
		this.edit.Now(now, nr, nd)
	})
},

nonyield: function ()
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD,
		z, zz
	this.go(function (redo)
	{
		if (redo)
			for (z = now; (zz = z).yield; z = z.zone)
				z.yield = 0, z.show(-1)
		else
			for (z = now; z != zz; z = z.zone)
				z.yield = 1, z.show(-1)
		this.edit.Now(now, nr, nd)
	})
},

base: function (b)
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD,
		w0, w = new Wire
	this.go(function (redo)
	{
		if (redo)
			w0 = b.agent(w, now)
		else
			w0 ? b.agent(w0, now) : b.unagent(w)
		this.edit.Now(now, nr, nd)
	})
},

agent: function (a)
{
	var now = this.edit.now, nr = this.edit.nowR, nd = this.edit.nowD,
		w0, w = new Wire
	this.go(function (redo)
	{
		if (redo)
			w0 = now.agent(w, a)
		else
			w0 ? now.agent(w0, a) : now.unagent(w)
		this.edit.Now(now, nr, nd)
	})
},

removeWire: function ()
{
	var now = this.edit.now
	this.go(function (redo)
	{
		if (redo)
			this.edit.Now(now.keyPrev || now.agent),
			now.base.unagent(now)
		else
			now.base.agent(now, now.agent, false),
			this.edit.Now(now)
	})
},

moveBase: function (b)
{
	var now = this.edit.now, w0, w = new Wire
	this.go(function (redo)
	{
		if (redo)
			now.base.unagent(now),
			w0 = b.agent(w, now.agent),
			this.edit.Now(w)
		else
		{
			w0 ? b.agent(w0, now.agent) : b.unagent(w)
			now.base.agent(now, now.agent, false)
			this.edit.Now(now)
		}
	})
},

moveAgent: function (a)
{
	var now = this.edit.now, w0, w = new Wire
	this.go(function (redo)
	{
		if (redo)
			now.base.unagent(now),
			w0 = now.base.agent(w, a),
			this.edit.Now(w)
		else
		{
			w0 ? now.base.agent(w0, a) : now.base.unagent(w)
			now.base.agent(now, now.agent, false)
			this.edit.Now(now)
		}
	})
},

nonyieldWire: function ()
{
	var now = this.edit.now, bz, bzz, az, azz
	this.go(function (redo)
	{
		if (redo)
		{
			now.yield = 0
			for (bz = now.base; (bzz = bz).yield; bz = bz.zone)
				bz.yield = 0, bz.show(-1)
			for (az = now.agent; (azz = az).yield; az = az.zone)
				az.yield = 0, az.show(-1)
		}
		else
		{
			now.yield = 1
			for (bz = now.base; bz != bzz; bz = bz.zone)
				bz.yield = 1, bz.show(-1)
			for (az = now.agent; az != azz; az = az.zone)
				az.yield = 1, az.show(-1)
		}
		this.edit.Now(now)
		now.showing = true, edit.show()
	})
},

}

})()