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

go: function (f)
{
	var s = this.coms, x = this.x
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
	com.call(this, true), this.x++
	this.edit.Unsave(1)
},

undo: function (test)
{
	var x = this.x
	if ( !x) return 'nothing to undo'
	if (this.edit.drag) return 'not available under dragging'
	if (test) return
	var r = this.coms[x], com = this.coms[this.x = x - 1]
	com.call(this, false)
	this.edit.Unsave(-1)
},

Name: function (v, test)
{
	var now = this.edit.now, m = now.name
	var c0 = v.charCodeAt(0)
	if (c0 == 63 || c0 == 33) // ? !
		v = v.substr(1)
	if ( !now.deep) return 'must be datum'
	if (m == v) return 'no change'
	if (now.layer || now.unity < 0) return 'can not change layer 2'
	if ( !v && now.yield) return 'can not change yield'
	now = now.uNonyield()
	if ( !now) return 'can not change yield'
	if (test) return
	var u = v || now.uNext.uNonyield()
	this.go(function (redo)
	{
		if (redo)
			v || now.unityTo(now), now.Name(v)
		else
			v || now.unityTo(u), now.Name(m)
		this.edit.Now(now)
	})
},

input: function (inner, test)
{
	var now = this.edit.now, z = !inner && now.zone || now
	if ( !now.deep) return 'must be datum'
	if (z.layer) return 'can not change layer 2'
	if (z.yield) return 'can not change yield'
	if (this.edit.drag) return 'not available under dragging'
	if (test) return
	var d = new Datum(-1), R, D
	if (z == now || now.io >= 0 || now.layer)
		R = 0, D = z.ox < 0 ? 0 : z.rows[R].length
	else
		R = z.rows.indexOf(now.row), D = now.row.indexOf(now) + 1
	while (D > 0 && z.rows[R][D - 1].yield)
		D--
	this.go(function (redo)
	{
		if (redo)
			d.addTo(z, R, D), this.edit.Now(d)
		else
			d.unadd(R, D), this.edit.Now(now)
	})
},

datum: function (inner, test)
{
	var now = this.edit.now, z = !inner && now.zone || now
	if ( !now.deep) return 'must be datum'
	if (z.layer) return 'can not change layer 2'
	if (z.yield) return 'can not change yield'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
	var d = new Datum(0), R, D
	if (z == now || now.io)
		z.ox <= 1 ? (R = 1, D = -1) : (R = z.ox - 1, D = z.rows[R].length),
		D >= 4 && (R++, D = -1)
	else
		R = z.rows.indexOf(now.row), D = now.row.indexOf(now) + 1
	this.go(function (redo)
	{
		if (redo)
			d.addTo(z, R, D), this.edit.Now(d)
		else
			d.unadd(R, D < 0 ? 0 : D), this.edit.Now(now)
	})
},

output: function (inner, test)
{
	var now = this.edit.now, z = !inner && now.zone || now
	if ( !now.deep) return 'must be datum'
	if (z.layer) return 'can not change layer 2'
	if (z.yield) return 'can not change yield'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
	var d = new Datum(1), R, D
	if (z == now || now.io <= 0 || now.layer)
		R = z.ox < 0 ? 1 : z.ox, D = z.ox < 0 ? 0 : z.rows[R].length
	else
		R = z.rows.indexOf(now.row), D = now.row.indexOf(now) + 1
	while (D > 0 && z.rows[R][D - 1].yield)
		D--
	this.go(function (redo)
	{
		if (redo)
			d.addTo(z, R, D), this.edit.Now(d)
		else
			d.unadd(R, D), this.edit.Now(now)
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
	var rs = z.rows, R = rs.indexOf(e.row), D = e.row.indexOf(e)
	if (D >= 1 && !e.row[D - 1].yield) return 'can not change yield'
	if ( !test && this.edit.drag) return 'not available while dragging'
	if (test) return
	var R0 = rs.indexOf(now.row), D0 = now.row.indexOf(now)
	var unrow = R != R0 && now.row.length == 1
	R == R0 && D > D0 && D--
	e = null
	this.go(function (redo)
	{
		if (redo)
			rs[R0].splice(D0, 1), rs[R].splice(D, 0, now), now.row = rs[R],
			unrow && (z.ox--, rs.splice(R0, 1)),
			z.show(-1), this.edit.Now(now)
		else
			unrow && (z.ox++, rs.splice(R0, 0, Row(z, []))),
			rs[R].splice(D, 1), rs[R0].splice(D0, 0, now), now.row = rs[R0],
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
	if (l.yield) return 'can not change yield'
	if ( !test && this.edit.drag) return 'not available while dragging'
	if (test) return
	var rs = z.rows, R = rs.indexOf(l.row), D = l.row.indexOf(l) + 1
	var R0 = rs.indexOf(now.row), D0 = now.row.indexOf(now)
	var unrow = R != R0 && rs[R0].length == 1
	R == R0 && D > D0 && D--
	l = null
	this.go(function (redo)
	{
		if (redo)
			rs[R0].splice(D0, 1), rs[R].splice(D, 0, now), now.row = rs[R],
			unrow && (z.ox--, rs.splice(R0, 1)),
			z.show(-1), this.edit.Now(now)
		else
			unrow && (z.ox++, rs.splice(R0, 0, Row(z, []))),
			rs[R].splice(D, 1), rs[R0].splice(D0, 0, now), now.row = rs[R0],
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
	var rs = z.rows, R = rs.indexOf(e.row)
	var R0 = rs.indexOf(now.row), D0 = now.row.indexOf(now)
	var unrow = now.row.length == 1
	unrow && R > R0 && R--
	e = null
	this.go(function (redo)
	{
		if (redo)
			unrow ? rs.splice(R, 0, rs.splice(R0, 1)[0]) :
				(z.ox++, rs[R0].splice(D0, 1), rs.splice(R, 0, now.row = Row(z, [ now ]))),
			z.show(-1), this.edit.Now(now)
		else
			unrow ? rs.splice(R0, 0, rs.splice(R, 1)[0]) :
				(z.ox--, rs.splice(R, 1), rs[R0].splice(D0, 0, now), now.row = rs[R0]),
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
	var rs = z.rows, R = rs.indexOf(l.row) + 1
	var R0 = rs.indexOf(now.row), D0 = now.row.indexOf(now)
	var unrow = now.row.length == 1
	unrow && R > R0 && R--
	l = null
	this.go(function (redo)
	{
		if (redo)
			unrow ? rs.splice(R, 0, rs.splice(R0, 1)[0]) :
				(z.ox++, rs[R0].splice(D0, 1), rs.splice(R, 0, now.row = Row(z, [ now ]))),
			z.show(-1), this.edit.Now(now)
		else
			unrow ? rs.splice(R0, 0, rs.splice(R, 1)[0]) :
				(z.ox--, rs.splice(R, 1), rs[R0].splice(D0, 0, now), now.row = rs[R0]),
			z.show(-1), this.edit.Now(now)
	})
},

unity: function (u, test)
{
	var now = this.edit.now, m = now.name
	if ( !now.io) return 'must be input or output'
	if (now.layer) return 'can not change layer 2'
	if (now.yield) return 'can not change yield'
	if (test && !u) return
	var um = u.name
	if (u.io != now.io) return now.io < 0 ? 'must be input' : 'must be output'
	if (u != now && u.unity == now.unity) return 'already same unity'
	if ( !m && !um) return 'must have name'
	u = u.uNonyield()
	if ( !u) return 'can not change yield'
	if ( !test && this.edit.drag) return 'not available while dragging'
	if (test) return
	var nowu = now.uNext.uNonyield()
	this.go(function (redo)
	{
		if (redo)
			now.unityTo(u)
		else
			now.unityTo(nowu), now.Name(m),
			um || (u.unityTo(u), u.Name(um)) // unity self if no name
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
	if (now.yield || now.agent.yield) return 'can not change yield'
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
	if (now.yield || now.base.yield) return 'can not change yield'
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
	if (now.yield) return 'can not change yield'
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
	if ( !now.yield) return 'must be yield'
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
	var now = this.edit.now
	if ( !now.row) return now.deep ? 'must not be zonest' : 'must be datum'
	if (now.io) return 'must be nonput'
	var D = now.row.indexOf(now)
	if (D <= 0) return 'must not be first of row'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
	var R = now.zone.rows.indexOf(now.row)
	this.go(function (redo)
	{
		if (redo)
			now.zone.breakRow(R, D), this.edit.Now(now)
		else
			now.zone.mergeRow(R), this.edit.Now(now)
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
	if (now.yield) return 'can not change yield'
	if (this.edit.drag) return 'not available while dragging'
	if (test) return
	var z = now.zone, rs = z.rows
	var R = rs.indexOf(now.row), D = now.row.indexOf(now), unrow
	this.go(function (redo)
	{
		if (redo)
			unrow = now.unadd(R, D),
			this.edit.Now(z.ox < 0 ? z
				: rs[R][D] || rs[R + 1] && rs[R + 1][0]
				|| rs[R][D - 1] || ArrayLast(rs[R - 1]))
		else
			now.addTo(z, R, unrow ? -1 : D), this.edit.Now(now)
	})
},

removeLeftDatum: function (test)
{
	var now = this.edit.now
	if ( !now.row) return now.deep ? 'must not be zonest' : 'must be datum'
	if (now.layer) return 'can not change layer 2'
	var z = now.zone, R = z.rows.indexOf(now.row), D = now.row.indexOf(now)
	if (R > 1 && R < z.ox && D == 0)
	{
		if (this.edit.drag) return 'not available while dragging'
		if (test) return
		this.go(function (redo)
		{
			if (redo)
				D = z.mergeRow(R - 1), this.edit.Now(now)
			else
				z.breakRow(R - 1, D), this.edit.Now(now)
		})
	}
	else
	{
		var d = now.row[D - 1]
		if ( !d) return 'no change'
		if (d.layer) return 'can not change layer 2'
		if (d.yield) return 'can not change yield'
		if (this.edit.drag) return 'not available while dragging'
		if (test) return
		this.go(function (redo)
		{
			if (redo)
				d.unadd(R, D - 1), this.edit.Now(now)
			else
				d.addTo(z, R, D - 1), this.edit.Now(now)
		})
	}
},

removeRightDatum: function (test)
{
	var now = this.edit.now
	if ( !now.row) return now.deep ? 'must not be zonest' : 'must be datum'
	if (now.layer) return 'can not change layer 2'
	var z = now.zone, R = z.rows.indexOf(now.row), D = now.row.indexOf(now)
	if (R > 0 && R < z.ox - 1 && D == now.row.length - 1)
	{
		if (this.edit.drag) return 'not available while dragging'
		if (test) return
		this.go(function (redo)
		{
			if (redo)
				D = z.mergeRow(R), this.edit.Now(now)
			else
				z.breakRow(R, D), this.edit.Now(now)
		})
	}
	else
	{
		var d = z.rows[R][D + 1]
		if ( !d) return 'no change'
		if (d.layer) return 'can not change layer 2'
		if (d.yield) return 'can not change yield'
		if (this.edit.drag) return 'not available while dragging'
		if (test) return
		this.go(function (redo)
		{
			if (redo)
				d.unadd(R, D + 1), this.edit.Now(now)
			else
				d.addTo(z, R, D + 1), this.edit.Now(now)
		})
	}
},

removeWire: function (test)
{
	var now = this.edit.now
	if (now.deep) return 'must be wire'
	if (now.zone.layer) return 'can not change layer 2'
	if (now.yield) return 'can not change yield'
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