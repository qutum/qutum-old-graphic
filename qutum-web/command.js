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
var UNDOn = 301

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
	if ( !this.edit.drag && com)
		this.unyield(this.edit.yields),
		com(true), this.reyield(com.s), this.x++,
		this.edit.Unsave(1)
},

undo: function ()
{
	var x = this.x
	if (this.edit.drag || !x)
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
	var now = this.edit.now, u = now.uNext, m = now.name, um = nu.name
	if (m != v && ( !v || !now.unity.d.layer2))
		this.go(function (redo)
		{
			if (redo)
				now != u && !v && now.unityTo(now), key.name = v
			else
				now != u && !v ? now.unityTo(u) : key.name = m
			this.edit.Now(now)
		})
},

input: function (inner)
{
	var now = this.edit.now
	if (this.edit.drag || now instanceof Wire)
		return
	var z, d = new Datum(-1), r, q
	if (now.io < 0 && !inner)
		z = now.zone, r = now.zone.rows.indexOf(now.row), q = now.row.indexOf(now) + 1
	else
		z = !inner && now.zone || now,
		r = 0, q = z.ox < 0 ? 0 : z.rows[r].length
	if ((inner ? z : now).layer2)
		return
	this.go(function (redo)
	{
		if (redo)
			d.addTo(z, r, q), this.edit.Now(d)
		else
			d.unadd(r, q), this.edit.Now(now)
	})
},

datum: function (inner)
{
	var now = this.edit.now
	if (this.edit.drag || now instanceof Wire)
		return
	var z, d = new Datum(0), r, q
	if (now.io || inner || !now.zone)
		z = !inner && now.zone || now,
		z.ox <= 1 ? (r = 1, q = -1) : (r = z.ox - 1, q = z.rows[r].length),
		q >= 4 && (r++, q = -1)
	else
		z = now.zone, r = now.zone.rows.indexOf(now.row), q = now.row.indexOf(now) + 1
	if ((inner ? now : z).layer2)
		return
	this.go(function (redo)
	{
		if (redo)
			d.addTo(z, r, q), this.edit.Now(d)
		else
			d.unadd(r, q < 0 ? 0 : q), this.edit.Now(now)
	})
},

output: function (inner)
{
	var now = this.edit.now
	if (this.edit.drag || now instanceof Wire)
		return
	var z, d = new Datum(1), r, q
	if (now.io > 0 && !inner)
		z = now.zone, r = now.zone.rows.indexOf(now.row), q = now.row.indexOf(now) + 1
	else
		z = !inner && now.zone || now,
		r = z.ox < 0 ? 1 : z.ox, q = z.ox < 0 ? 0 : z.rows[r].length
	if ((inner ? z : now).layer2)
		return
	this.go(function (redo)
	{
		if (redo)
			d.addTo(z, r, q), this.edit.Now(d)
		else
			d.unadd(r, q), this.edit.Now(now)
	})
},

breakRow: function ()
{
	var now = this.edit.now, r, q
	if (this.edit.drag || now.io !== 0 || !now.row || (q = now.row.indexOf(now)) <= 0)
		return // not wire
	r = now.zone.rows.indexOf(now.row)
	this.go(function (redo)
	{
		if (redo)
			now.zone.breakRow(r, q), this.edit.Now(now)
		else
			now.zone.mergeRow(r), this.edit.Now(now)
	})
},

remove: function ()
{
	return this.edit.now instanceof Wire ? this.removeWire() : this.removeDatum()
},

removeBefore: function ()
{
	return this.edit.now instanceof Wire ? this.removeWire() : this.removeBeforeDatum()
},

removeAfter: function ()
{
	return this.edit.now instanceof Wire ? this.removeWire() : this.removeAfterDatum()
},

removeDatum: function ()
{
	var now = this.edit.now
	if (this.edit.drag || now.layer2 || !now.row)
		return // now wire
	var z = now.zone, rs = z.rows, r = rs.indexOf(now.row), q = now.row.indexOf(now), addRow
	this.go(function (redo)
	{
		if (redo)
			addRow = now.unadd(r, q),
			this.edit.Now(z.ox < 0 ? z
				: rs[r][q] || rs[r + 1] && rs[r + 1][0]
				|| rs[r][q - 1] || ArrayLast(rs[r - 1]))
		else
			now.addTo(z, r, addRow ? -1 : q), this.edit.Now(now)
	})
},

removeBeforeDatum: function ()
{
	var now = this.edit.now
	if (this.edit.drag || now.layer2 || !now.row)
		return // not wire
	var z = now.zone, r = z.rows.indexOf(now.row), q = now.row.indexOf(now), d
	if (r > 1 && r < z.ox && q == 0)
		this.go(function (redo)
		{
			if (redo)
				q = z.mergeRow(r - 1), this.edit.Now(now)
			else
				z.breakRow(r - 1, q), this.edit.Now(now)
		})
	else if ((d = z.rows[r][q - 1]) && !d.layer2)
		this.go(function (redo)
		{
			if (redo)
				d.unadd(r, q - 1), this.edit.Now(now)
			else
				d.addTo(z, r, q - 1), this.edit.Now(now)
		})
},

removeAfterDatum: function ()
{
	var now = this.edit.now
	if (this.edit.drag || now.layer2 || !now.row)
		return // not wire
	var z = now.zone, r = z.rows.indexOf(now.row), q = now.row.indexOf(now), d
	if (r > 0 && r < z.ox - 1 && q == now.row.length - 1)
		this.go(function (redo)
		{
			if (redo)
				q = z.mergeRow(r), this.edit.Now(now)
			else
				z.breakRow(r, q), this.edit.Now(now)
		})
	else if ((d = z.rows[r][q + 1]) && !d.layer2)
		this.go(function (redo)
		{
			if (redo)
				d.unadd(r, q + 1), this.edit.Now(now)
			else
				d.addTo(z, r, q + 1), this.edit.Now(now)
		})
},

early: function (e, test)
{
	var now = this.edit.now, z = now.zone
	if (this.edit.drag || now.layer2 || !now.row || e.zone != z)
		return // not wire
	var rs = z.rows, nr = rs.indexOf(now.row), nq = now.row.indexOf(now),
		r = rs.indexOf(e.row), q = e.row.indexOf(e),
		empty = r != nr && now.row.length == 1
	if (r == nr && q > nq)
		q--
	if ((now.io < 0) == (r > 0) || (now.io > 0) == (r < z.ox))
		return
	if (test)
		return true
	this.go(function (redo)
	{
		if (redo)
			rs[nr].splice(nq, 1), rs[r].splice(q, 0, now), now.row = rs[r],
			empty && (z.ox--, rs.splice(nr, 1)),
			z.show(-1), this.edit.Now(now)
		else
			empty && (z.ox++, rs.splice(nr, 0, Row(z, []))),
			rs[r].splice(q, 1), rs[nr].splice(nq, 0, now), now.row = rs[nr],
			z.show(-1), this.edit.Now(now)
	})
},

later: function (l, test)
{
	var now = this.edit.now, z = now.zone
	if (this.edit.drag || now.layer2 || !now.row || l.zone != z)
		return // not wire
	var rs = z.rows, nr = rs.indexOf(now.row), nq = now.row.indexOf(now),
		r = rs.indexOf(l.row), q = l.row.indexOf(l) + 1,
		empty = r != nr && rs[nr].length == 1
	if (r == nr && q > nq)
		q--
	if ((now.io < 0) == (r > 0) || (now.io > 0) == (r < z.ox))
		return
	if (test)
		return true
	this.go(function (redo)
	{
		if (redo)
			rs[nr].splice(nq, 1), rs[r].splice(q, 0, now), now.row = rs[r],
			empty && (z.ox--, rs.splice(nr, 1)),
			z.show(-1), this.edit.Now(now)
		else
			empty && (z.ox++, rs.splice(nr, 0, Row(z, []))),
			rs[r].splice(q, 1), rs[nr].splice(nq, 0, now), now.row = rs[nr],
			z.show(-1), this.edit.Now(now)
	})
},

earlyRow: function (e, test)
{
	var now = this.edit.now, z = now.zone
	if (this.edit.drag || now.layer2 || now.io != 0 || !z || e.zone != z || e.io < 0)
		return // not wire
	if (test)
		return true
	var rs = z.rows, nr = rs.indexOf(now.row), nq = now.row.indexOf(now),
		r = rs.indexOf(e.row), empty = now.row.length == 1
	if (empty && r > nr)
		r--
	this.go(function (redo)
	{
		if (redo)
			empty ? rs.splice(r, 0, rs.splice(nr, 1)[0]) :
				(z.ox++, rs[nr].splice(nq, 1), rs.splice(r, 0, now.row = Row(z, [ now ]))),
			z.show(-1), this.edit.Now(now)
		else
			empty ? rs.splice(nr, 0, rs.splice(r, 1)[0]) :
				(z.ox--, rs.splice(r, 1), rs[nr].splice(nq, 0, now), now.row = rs[nr]),
			z.show(-1), this.edit.Now(now)
	})
},

laterRow: function (l, test)
{
	var now = this.edit.now, z = now.zone
	if (this.edit.drag || now.layer2 || now.io != 0 || !z || l.zone != z || l.io > 0)
		return // not wire
	if (test)
		return true
	var rs = z.rows, nr = rs.indexOf(now.row), nq = now.row.indexOf(now),
		r = rs.indexOf(l.row) + 1, empty = now.row.length == 1
	if (empty && r > nr)
		r--
	this.go(function (redo)
	{
		if (redo)
			empty ? rs.splice(r, 0, rs.splice(nr, 1)[0]) :
				(z.ox++, rs[nr].splice(nq, 1), rs.splice(r, 0, now.row = Row(z, [ now ]))),
			z.show(-1), this.edit.Now(now)
		else
			empty ? rs.splice(nr, 0, rs.splice(r, 1)[0]) :
				(z.ox--, rs.splice(r, 1), rs[nr].splice(nq, 0, now), now.row = rs[nr]),
			z.show(-1), this.edit.Now(now)
	})
},

unity: function (u, test)
{
	var now = this.edit.now, nu = now.uNext, m = now.name, um = u.name
	if (this.edit.drag || now.layer2 || now.io == 0 || !now.row || now.io != u.io)
		return // not wire
	if (test)
		return true
	this.go(function (redo)
	{
		if (redo)
			now.unityTo(u)
		else
			now.unityTo(nu),
			n == now.name || (now.name = m), um == u.name || (u.name = um)
		this.edit.Now(now)
	})
},

trialVeto: function (tv)
{
	var now = this.edit.now, tv0 = now.tv
	if (this.edit.drag || now.layer2 || !now.row)
		return // not wire
	tv0 == tv && (tv = 0)
	this.go(function (redo)
	{
		if (redo)
			now.Tv(tv)
		else
			now.Tv(tv0)
		this.edit.Now(now)
	})
},

nonyield: function ()
{
	var now = this.edit.now, z, zz
	if (this.edit.drag)
		return
	this.go(function (redo)
	{
		if (redo)
			for (z = now; (zz = z).yield; z = z.zone)
				z.yield = 0, z.show(-1)
		else
			for (z = now; z != zz; z = z.zone)
				z.yield = 1, z.show(-1)
		this.edit.Now(now)
	})
},

base: function (b)
{
	var now = this.edit.now, w0, w = new Wire
	if (this.edit.drag)
		return
	this.go(function (redo)
	{
		if (redo)
			w0 = b.agent(w, now)
		else
			w0 ? b.agent(w0, now) : b.unagent(w)
		this.edit.Now(now)
	})
},

agent: function (a)
{
	var now = this.edit.now, w0, w = new Wire
	if (this.edit.drag)
		return
	this.go(function (redo)
	{
		if (redo)
			w0 = now.agent(w, a)
		else
			w0 ? now.agent(w0, a) : now.unagent(w)
		this.edit.Now(now)
	})
},

removeWire: function ()
{
	var now = this.edit.now
	if (this.edit.drag || !(now instanceof Wire))
		return
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
	if (this.edit.drag)
		return
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
	if (this.edit.drag)
		return
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
	if (this.edit.drag)
		return
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
		this.edit.Now(now), now.showing = true, edit.show(true)
	})
},

}

})()