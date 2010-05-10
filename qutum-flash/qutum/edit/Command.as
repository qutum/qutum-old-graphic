//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.edit
{
import __AS3__.vec.Vector;


final class Command
{
	public static const UNDOn:int = 301

	var edit:Edit
	const coms:Vector.<Function> = new Vector.<Function>(UNDOn)
	var com:int, com0:int, com9:int

	function Command(edit_:Edit)
	{
		edit = edit_
	}

	private function go(f:Function):void
	{
		var x:int
		if (com != com0 && edit.yields)
			coms[x = (com - 1 + UNDOn) % UNDOn]['s'] || Boolean(coms[x]['s'] = edit.yields)
		f(true)
		for (x = com; x != com9; x = (x + 1) % UNDOn)
			coms[x] = null
		coms[com] = f
		com9 = com = (com + 1) % UNDOn
		if (com == com0)
			com0 = (com0 + 1) % UNDOn
		edit.unSave(1)
	}

	function redo():void
	{
		if (com == com9)
			return
		unyield(edit.yields)
		coms[com](true)
		reyield(coms[com]['s'])
		com = (com + 1) % UNDOn
		edit.unSave(1)
	}

	function undo():void
	{
		if (com == com0)
			return
		var r:Boolean = com != com9
		com = (com - 1 + UNDOn) % UNDOn
		if (edit.yields)
			r || coms[com]['s'] ? unyield(edit.yields) : coms[com]['s'] = edit.yields
		unyield(coms[com]['s'])
		coms[com](false)
		edit.unSave(-1)
	}

	private function reyield(s:Array)
	{
		if ( !s)
			return
		var o, d:Datum, w:Wire, x:int
		for (x = 0; o = s[x]; x++)
			(d = o as Datum) ? d.addTo(d.zone, d.yR, d.yX, false)
				: (w = Wire(o)).base.agent(w, w.agent, false)
		while (o = s[++x])
			(d = o as Datum) ? d.unadd(d.unyR, d.unyX)
				: (w = Wire(o)).base.unagent(w)
		return
	}

	private function unyield(s:Array)
	{
		if ( !s)
			return
		var o, d:Datum, w:Wire, x:int
		for (x = s.length - 1; o = s[x]; x--)
			(d = o as Datum) ? d.addTo(d.zone, d.unyR, d.unyX, false)
				: (w = Wire(o)).base.agent(w, w.agent, false)
		while (o = s[--x])
			(d = o as Datum) ? d.unadd(d.yR, d.yX)
				: (w = Wire(o)).base.unagent(w)
		return
	}

	function name(v:String)
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX,
			ku:Datum = key.uNext, u:Boolean = key != ku,
			n:String = key.name, un:String = ku.name
		if (n != v && ( !v || !key.unity || !key.unity.d.layer2))
			go(function (redo)
			{
				if (redo)
					u && !v && Boolean(key.unityTo(key)),
					key.name = v
				else
					u && !v ? key.unityTo(ku) : key.name = n
				edit.keyin(key, kr, kx)
			})
	}

	function input(shift:Boolean)
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX
		var z:Datum, d:Datum = new Datum(-1), dr:int, dx:int
		if (key.io < 0 && !shift)
			z = key.zone,
			dr = kr, dx = kx + 1
		else
			z = Datum( !shift && key.zone || key),
			dr = Datum.IX, dx = z.ox < 0 ? 0 : z.row(dr).numChildren
		go(function (redo)
		{
			if (redo)
				d.addTo(z, dr, dx, false),
				edit.keyin(d, dr, dx)
			else
				d.unadd(dr, dx),
				edit.keyin(key, kr, kx)
		})
	}

	function datum(shift:Boolean)
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX
		var z:Datum, d:Datum = new Datum(0), dr:int, dx:int, addRow:Boolean = false
		if (key.io || shift || !key.zone)
			z = Datum( !shift && key.zone || key),
			dr = z.ox <= Datum.DX ? (addRow = true, Datum.DX) : z.ox - 1,
			dx = addRow ? 0 : z.row(dr).numChildren,
			dx >= 4 && (dr++, dx = 0, addRow = true)
		else
			z = key.zone,
			dr = kr, dx = kx + 1
		go(function (redo)
		{
			if (redo)
				d.addTo(z, dr, dx, addRow),
				edit.keyin(d, dr, dx)
			else
				d.unadd(dr, dx),
				edit.keyin(key, kr, kx)
		})
	}

	function output(shift:Boolean)
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX
		var z:Datum, d:Datum = new Datum(1), dr:int, dx:int
		if (key.io > 0 && !shift)
			z = key.zone,
			dr = kr, dx = kx + 1
		else
			z = Datum( !shift && key.zone || key),
			dr = z.ox < 0 ? Datum.DX : z.ox, dx = z.ox < 0 ? 0 : z.row(dr).numChildren
		go(function (redo)
		{
			if (redo)
				d.addTo(z, dr, dx, false),
				edit.keyin(d, dr, dx)
			else
				d.unadd(dr, dx),
				edit.keyin(key, kr, kx)
		})
	}

	function breakRow()
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX
		if (key.io || kx <= 0)
			return
		go(function (redo)
		{
			if (redo)
				key.zone.breakRow(kr, kx),
				edit.keyin(key, kr + 1, 0)
			else
				key.zone.mergeRow(kr),
				edit.keyin(key, kr, kx)
		})
	}

	function remove()
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX,
			z:Datum = key.zone, addRow:Boolean
		if (z == null)
			return
		if (kr > Datum.IX && kr < z.ox - 1 && kx && kx == z.rowAt(kr).numChildren - 1)
			go(function (redo)
			{
				if (redo)
					key.unadd(kr, kx),
					z.mergeRow(kr),
					edit.keyin(z.rowAt(kr).datumAt(kx), kr, kx)
				else
					z.breakRow(kr, kx),
					key.addTo(z, kr, kx, false),
					edit.keyin(key, kr, kx)
			})
		else
			go(function (redo)
			{
				if (redo)
					addRow = key.unadd(kr, kx),
					edit.keyin(z.ox < 0 ? z : z.rowAt(kr).datum(kx)
						|| z.row(kr + 1) && z.row(kr + 1).datum(0)
						|| z.rowAt(kr).datum(kx - 1)
						|| z.rowAt(kr - 1).datum(z.rowAt(kr - 1).numChildren - 1))
				else
					key.addTo(z, kr, kx, addRow),
					edit.keyin(key, kr, kx)
			})
	}

	function removeBefore()
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX,
			z:Datum = key.zone, d:Datum, dx:int
		if (z == null)
			return
		if (kr > Datum.IX + 1 && kr < z.ox && kx == 0)
			go(function (redo)
			{
				if (redo)
					dx = z.mergeRow(kr - 1),
					edit.keyin(key, kr - 1, dx)
				else
					z.breakRow(kr - 1, dx),
					edit.keyin(key, kr, kx)
			})
		else if (kx)
			d = z.rowAt(kr).datumAt(dx = kx - 1),
			go(function (redo)
			{
				if (redo)
					d.unadd(kr, dx),
					edit.keyin(key, kr, dx)
				else
					d.addTo(z, kr, dx, false),
					edit.keyin(key, kr, kx)
			})
	}

	function move(r:int, x:int)
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX,
			z:Datum = key.zone, empty:Boolean = r != kr && z.rowAt(kr).numChildren == 1
		if (r == kr && x > kx)
			x--
		go(function (redo)
		{
			if (redo)
				z.rowAt(kr).removeChildAt(kx), z.rowAt(r).addChildAt(key, x),
				Boolean(empty && (z.ox--, z.removeChildAt(kr))),
				z.refresh(-1), edit.keyin(key, r, x)
			else
				Boolean(empty && (z.ox++, z.addChildAt(new Row, kr))),
				z.rowAt(r).removeChildAt(x), z.rowAt(kr).addChildAt(key, kx),
				z.refresh(-1), edit.keyin(key, kr, kx)
		})
	}

	function moveRow(r:int)
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX,
			z:Datum = key.zone, empty:Boolean = z.rowAt(kr).numChildren == 1
		if (empty && r > kr)
			r--
		go(function (redo)
		{
			if (redo)
				empty ? z.addChildAt(z.removeChildAt(kr), r)
					: (z.ox++,
					z.rowAt(kr).removeChildAt(kx), z.addChildAt(new Row().add(key), r)),
				z.refresh(-1), edit.keyin(key, r, 0)
			else
				empty ? z.addChildAt(z.removeChildAt(r), kr)
					: (z.ox--, z.removeChildAt(r), z.rowAt(kr).addChildAt(key, kx)),
				z.refresh(-1), edit.keyin(key, kr, kx)
		})
	}

	function unity(u:Datum)
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX,
			ku:Datum = key.uNext, n:String = key.name, un:String = u.name
		go(function (redo)
		{
			if (redo)
				key.unityTo(u)
			else
				key.unityTo(ku),
				n == key.name || Boolean(key.name = n),
				un == u.name || Boolean(u.name = un)
			edit.keyin(key, kr, kx)
		})
	}

	function trialVeto(tv:int)
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX,
			tv0:int = key.tv
		tv0 == tv && (tv = 0)
		go(function (redo)
		{
			if (redo)
				key.setTv(tv)
			else
				key.setTv(tv0)
			edit.keyin(key, kr, kx)
		})
	}

	function nonyield()
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX,
			z:Datum, zz:Datum
		go(function (redo)
		{
			if (redo)
				for (z = key; (zz = z).yield; z = z.zone)
					z.yield = 0,
					z.refresh(-1)
			else
				for (z = key; z != zz; z = z.zone)
					z.yield = 1,
					z.refresh(-1)
			edit.keyin(key, kr, kx)
		})
	}

	function base(b:Datum)
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX,
			w0:Wire, w:Wire = new Wire
		go(function (redo)
		{
			if (redo)
				w0 = b.agent(w, key)
			else
				w0 ? b.agent(w0, key) : b.unagent(w)
			edit.keyin(key, kr, kx)
		})
	}

	function agent(a:Datum)
	{
		var key:Datum = Datum(edit.key), kr:int = edit.keyR, kx:int = edit.keyX,
			w0:Wire, w:Wire = new Wire
		go(function (redo)
		{
			if (redo)
				w0 = key.agent(w, a)
			else
				w0 ? key.agent(w0, a) : key.unagent(w)
			edit.keyin(key, kr, kx)
		})
	}

	function removeWire()
	{
		var key:Wire = Wire(edit.key)
		go(function (redo)
		{
			if (redo)
				edit.keyin(key.keyPrev || key.agent),
				key.base.unagent(key)
			else
				key.base.agent(key, key.agent, false),
				edit.keyin(key)
		})
	}

	function moveBase(b:Datum)
	{
		var key:Wire = Wire(edit.key), w0:Wire, w:Wire = new Wire
		go(function (redo)
		{
			if (redo)
				key.base.unagent(key),
				w0 = b.agent(w, key.agent),
				edit.keyin(w)
			else
			{
				w0 ? b.agent(w0, key.agent) : b.unagent(w)
				key.base.agent(key, key.agent, false)
				edit.keyin(key)
			}
		})
	}

	function moveAgent(a:Datum)
	{
		var key:Wire = Wire(edit.key), w0:Wire, w:Wire = new Wire
		go(function (redo)
		{
			if (redo)
				key.base.unagent(key),
				w0 = key.base.agent(w, a),
				edit.keyin(w)
			else
			{
				w0 ? key.base.agent(w0, a) : key.base.unagent(w)
				key.base.agent(key, key.agent, false)
				edit.keyin(key)
			}
		})
	}

	function nonyieldWire()
	{
		var key:Wire = Wire(edit.key),
			bz:Datum, bzz:Datum, az:Datum, azz:Datum
		go(function (redo)
		{
			if (redo)
			{
				key.yield = 0
				for (bz = key.base; (bzz = bz).yield; bz = bz.zone)
					bz.yield = 0,
					bz.refresh(-1)
				for (az = key.agent; (azz = az).yield; az = az.zone)
					az.yield = 0,
					az.refresh(-1)
			}
			else
			{
				key.yield = 1
				for (bz = key.base; bz != bzz; bz = bz.zone)
					bz.yield = 1,
					bz.refresh(-1)
				for (az = key.agent; az != azz; az = az.zone)
					az.yield = 1,
					az.refresh(-1)
			}
			edit.keyin(key)
			edit.refresh = key.refresh = true
		})
	}
}
}
