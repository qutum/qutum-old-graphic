//
// Qutum 10 implementation
// Copyright 2008-2013 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Command = function (edit)
{
	this.edit = edit
	this.coms = []
}
//var UNDOn = 301

Command.prototype =
{

edit: null,
coms: null, // [ function ]
x: 0, // next command index, <= coms.length

go: function (f) // TODO no edit.yields at all
{
	var s = this.coms, x = this.x
	if (x && this.edit.yields)
		s[x - 1].ys || (s[x - 1].ys = this.edit.yields)
	f.call(this, true)
	s[x++] = f, s.length = this.x = x
	this.edit.Unsave(1)
},

redo: function (test)
{
	var com = this.coms[this.x]
	if ( !com) return 'nothing to redo'
	if (this.edit.drag) return 'not available under dragging'
	if (test) return
	this.unyield(this.edit.yields)
	com.call(this, true), this.reyield(com.s), this.x++
	this.edit.Unsave(1)
},

undo: function (test)
{
	var x = this.x
	if ( !x) return 'nothing to undo'
	if (this.edit.drag) return 'not available under dragging'
	if (test) return
	var r = this.coms[x], com = this.coms[this.x = x - 1]
	if (this.edit.yields)
		r || com.ys ? this.unyield(this.edit.yields) : com.ys = this.edit.yields
	this.unyield(com.ys), com.call(this, false)
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


Name: function (v, test)
{
	var now = this.edit.now, m = now.name, c0 = v.charCodeAt(0)
	if (c0 == 63 || c0 == 33) // ? !
		v = v.substr(1)
	if ( !now.deep) return 'must be datum'
	if (m == v) return 'no change'
	if (now.unity < 0 || now.layer) return 'can not change layer 2'
	if (test) return
	var u = now.uNext, um = u.name
	this.go(function (redo)
	{
		if (redo)
			now != u && !v && now.unityTo(now), now.Name(v)
		else
			now.unityTo(u), now.Name(m)
		this.edit.Now(now)
	})
},

input: function (inner, test)
{
	var now = this.edit.now, z = !inner && now.zone || now
	if ( !now.deep) return 'must be datum'
	if (z.layer) return 'can not change layer 2'
	if (inner && z.yield) return 'can not change yield'
	if (this.edit.drag) return 'not available under dragging'
	if (test) return
	var d = new Datum(-1), r, q
	if (inner || now.io >= 0 || now.layer)
		r = 0, q = z.ox < 0 ? 0 : z.rows[r].length
	else
		r = now.zone.rows.indexOf(now.row), q = now.row.indexOf(now) + 1
	this.go(function (redo)
	{
		if (redo)
			d.addTo(z, r, q), this.edit.Now(d)
		else
			d.unadd(r, q), this.edit.Now(now)
	})
},

datum: function (inner, test)
{
	var now = this.edit.now, z = !inner && now.zone || now
	if ( !now.deep) return 'must be datum'
	if (z.layer) return 'can not change layer 2'
	if (inner && z.yield) return 'can not change yield'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
	var d = new Datum(0), r, q
	if (inner || now.io || !now.zone)
		z.ox <= 1 ? (r = 1, q = -1) : (r = z.ox - 1, q = z.rows[r].length),
		q >= 4 && (r++, q = -1)
	else
		r = now.zone.rows.indexOf(now.row), q = now.row.indexOf(now) + 1
	this.go(function (redo)
	{
		if (redo)
			d.addTo(z, r, q), this.edit.Now(d)
		else
			d.unadd(r, q < 0 ? 0 : q), this.edit.Now(now)
	})
},

output: function (inner, test)
{
	var now = this.edit.now, z = !inner && now.zone || now
	if ( !now.deep) return 'must be datum'
	if (z.layer) return 'can not change layer 2'
	if (inner && z.yield) return 'can not change yield'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
	var d = new Datum(1), r, q
	if (inner || now.io <= 0 || now.layer)
		r = z.ox < 0 ? 1 : z.ox, q = z.ox < 0 ? 0 : z.rows[r].length
	else
		r = now.zone.rows.indexOf(now.row), q = now.row.indexOf(now) + 1
	this.go(function (redo)
	{
		if (redo)
			d.addTo(z, r, q), this.edit.Now(d)
		else
			d.unadd(r, q), this.edit.Now(now)
	})
},


early: function (e, test)
{
	var now = this.edit.now, z = now.zone
	if ( !now.row) return now.deep ? 'must not be zonest' : 'must be datum'
	if (now.layer) return 'can not change layer 2'
	if (test && !e) return
	if ( !e.deep) return 'must be datum'
	if (e.zone != z) return 'must be same zone'
	if (e.io != now.io) return now.io < 0 ? 'must be input' : now.io > 0 ? 'must be output'
		: 'must be nonput'
	if (e.layer) return 'can not change layer 2'
	if ( !test && this.edit.drag) return 'not available while dragging'
	if (test) return
	var rs = z.rows, nr = rs.indexOf(now.row), nq = now.row.indexOf(now),
		r = rs.indexOf(e.row), q = e.row.indexOf(e),
		empty = r != nr && now.row.length == 1
	if (r == nr && q > nq)
		q--
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
	if ( !now.row) return now.deep ? 'must not be zonest' : 'must be datum'
	if (now.layer) return 'can not change layer 2'
	if (test && !l) return
	if ( !l.deep) return 'must be datum'
	if (l.zone != z) return 'must be same zone'
	if (l.io != now.io) return now.io < 0 ? 'must be input' : now.io > 0 ? 'must be output'
		: 'must be nonput'
	if (l.layer) return 'can not change layer 2'
	if ( !test && this.edit.drag) return 'not available while dragging'
	if (test) return
	var rs = z.rows, nr = rs.indexOf(now.row), nq = now.row.indexOf(now),
		r = rs.indexOf(l.row), q = l.row.indexOf(l) + 1,
		empty = r != nr && rs[nr].length == 1
	if (r == nr && q > nq)
		q--
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
	if ( !now.row) return now.deep ? 'must not be zonest' : 'must be datum'
	if (now.layer) return 'can not change layer 2'
	if (now.io) return 'must be nonput'
	if (test && !e) return
	if ( !e.deep) return 'must be datum'
	if ( !(e.io >= 0)) return 'must not be input'
	if (e.zone != z) return 'must be same zone'
	if ( !test && this.edit.drag) return 'not available while dragging'
	if (test) return
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
	if ( !now.row) return now.deep ? 'must not be zonest' : 'must be datum'
	if (now.layer) return 'can not change layer 2'
	if (now.io) return 'must be nonput'
	if (test && !l) return
	if ( !l.deep) return 'must be datum'
	if ( !(l.io <= 0)) return 'must not be output'
	if (l.zone != z) return 'must be same zone'
	if ( !test && this.edit.drag) return 'not available while dragging'
	if (test) return
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
	var now = this.edit.now, nu = now.uNext, m = now.name
	if ( !now.io) return 'must be input or output'
	if (now.layer) return 'can not change layer 2'
	if (test && !u) return
	var um = u.name
	if (u.io != now.io) return now.io < 0 ? 'must be input' : 'must be output'
	if ( !m && !um) return 'must have name'
	if ( !test && this.edit.drag) return 'not available while dragging'
	if (test) return
	this.go(function (redo)
	{
		if (redo)
			now.unityTo(u)
		else
			now.unityTo(nu),
			m == now.name || now.Name(m), um == u.name || u.Name(um)
		this.edit.Now(now)
	})
},

base: function (b, test)
{
	return this.edit.now.deep ? this.baseDatum(b, test) : this.baseWire(b, test)
},

agent: function (a, test)
{
	return this.edit.now.deep ? this.agentDatum(a, test) : this.agentWire(a, test)
},

baseDatum: function (b, test)
{
	var now = this.edit.now
	if ( !now.deep) return 'must be datum'
	if (now.azer.bzer.layer) return 'can not change layer 2'
	if (now.yield) return 'can not change yield'
	if (test && !b) return
	if ( !b.deep) return 'must be datum'
	if (b.bzer.azer.layer) return 'can not change layer 2'
	if (b.yield) return 'can not change yield'
	if (b == now) return 'must not be self'
	if ( !test && this.edit.drag) return 'not available while dragging'
	if (test) return
	var w = new Wire, w0
	this.go(function (redo)
	{
		if (redo)
			w0 = b.agent(w, now)
		else
			w0 ? b.agent(w0, now) : b.unagent(w)
		this.edit.Now(now)
	})
},

agentDatum: function (a, test)
{
	var now = this.edit.now
	if ( !now.deep) return 'must be datum'
	if (now.bzer.azer.layer) return 'can not change layer 2'
	if (now.yield) return 'can not change yield'
	if (test && !a) return
	if ( !a.deep) return 'must be datum'
	if (a.azer.bzer.layer) return 'can not change layer 2'
	if (a.yield) return 'can not change yield'
	if (a == now) return 'must not be self'
	if ( !test && this.edit.drag) return 'not available while dragging'
	if (test) return
	var w = new Wire, w0
	this.go(function (redo)
	{
		if (redo)
			w0 = now.agent(w, a)
		else
			w0 ? now.agent(w0, a) : now.unagent(w)
		this.edit.Now(now)
	})
},

baseWire: function (b, test)
{
	var now = this.edit.now
	if (now.deep) return 'must be wire'
	if (now.zone.layer) return 'can not change layer 2'
	if (now.agent.yield) return 'can not change yield'
	if (test && !b) return
	if ( !b.deep) return 'must be datum'
	if (b.yield) return 'can not change yield'
	if (b == now.agent) return 'must not be self'
	if ( !test && this.edit.drag) return 'not available while dragging'
	if (test) return
	var w = new Wire, w0
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

agentWire: function (a, test)
{
	var now = this.edit.now
	if (now.deep) return 'must be wire'
	if (now.zone.layer) return 'can not change layer 2'
	if (now.base.yield) return 'can not change yield'
	if (test && !a) return
	if ( !a.deep) return 'must be datum'
	if (a.yield) return 'can not change yield'
	if (a == now.base) return 'must not be self'
	if ( !test && this.edit.drag) return 'not available while dragging'
	if (test) return
	var w = new Wire, w0
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

trialVeto: function (tv, test)
{
	var now = this.edit.now, tv0 = now.tv
	if ( !now.deep) return 'must be datum'
	if (now.layer) return 'can not change layer 2'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
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

nonyield: function (test)
{
	return this.edit.now.deep ? this.nonyieldDatum(test) : this.nonyieldWire(test)
},

nonyieldDatum: function (test)
{
	var now = this.edit.now, z, zz
	if ( !now.yield) return 'must be yield'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
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

nonyieldWire: function (test)
{
	var now = this.edit.now, bz, bzz, az, azz
	if ( !now.yield) return 'ust be yield'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
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


breakRow: function (test)
{
	var now = this.edit.now, r, q
	if ( !now.row) return now.deep ? 'must not be zonest' : 'must be datum'
	if (now.io) return 'must be nonput'
	if ((q = now.row.indexOf(now)) <= 0) return 'must not be first of row'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
	r = now.zone.rows.indexOf(now.row)
	this.go(function (redo)
	{
		if (redo)
			now.zone.breakRow(r, q), this.edit.Now(now)
		else
			now.zone.mergeRow(r), this.edit.Now(now)
	})
},

remove: function (test)
{
	return this.edit.now.deep ? this.removeDatum(test) : this.removeWire(test)
},

removeLeft: function (test)
{
	return this.edit.now.deep ? this.removeLeftDatum(test) : this.removeWire(test)
},

removeRight: function (test)
{
	return this.edit.now.deep ? this.removeRightDatum(test) : this.removeWire(test)
},

removeDatum: function (test)
{
	var now = this.edit.now
	if ( !now.row) return now.deep ? 'must not be zonest' : 'must be datum'
	if (now.layer) return 'can not change layer 2'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
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

removeLeftDatum: function (test)
{
	var now = this.edit.now
	if ( !now.row) return now.deep ? 'must not be zonest' : 'must be datum'
	if (now.layer) return 'can not change layer 2'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
	var z = now.zone, r = z.rows.indexOf(now.row), q = now.row.indexOf(now), d
	if (r > 1 && r < z.ox && q == 0)
		this.go(function (redo)
		{
			if (redo)
				q = z.mergeRow(r - 1), this.edit.Now(now)
			else
				z.breakRow(r - 1, q), this.edit.Now(now)
		})
	else if ((d = z.rows[r][q - 1]) && !d.layer)
		this.go(function (redo)
		{
			if (redo)
				d.unadd(r, q - 1), this.edit.Now(now)
			else
				d.addTo(z, r, q - 1), this.edit.Now(now)
		})
},

removeRightDatum: function (test)
{
	var now = this.edit.now
	if ( !now.row) return now.deep ? 'must not be zonest' : 'must be datum'
	if (now.layer) return 'can not change layer 2'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
	var z = now.zone, r = z.rows.indexOf(now.row), q = now.row.indexOf(now), d
	if (r > 0 && r < z.ox - 1 && q == now.row.length - 1)
		this.go(function (redo)
		{
			if (redo)
				q = z.mergeRow(r), this.edit.Now(now)
			else
				z.breakRow(r, q), this.edit.Now(now)
		})
	else if ((d = z.rows[r][q + 1]) && !d.layer)
		this.go(function (redo)
		{
			if (redo)
				d.unadd(r, q + 1), this.edit.Now(now)
			else
				d.addTo(z, r, q + 1), this.edit.Now(now)
		})
},

removeWire: function (test)
{
	var now = this.edit.now
	if (now.deep) return 'must be wire'
	if (now.zone.layer) return 'can not change layer 2'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
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

}

})()