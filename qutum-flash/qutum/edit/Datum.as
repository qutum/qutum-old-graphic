//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.edit
{
import __AS3__.vec.Vector;

import flash.display.Shape;
import flash.geom.Point;
import flash.utils.Dictionary;
import flash.utils.IDataInput;
import flash.utils.IDataOutput;

import qutum.main.Text;
import qutum.main.Util;


final class Datum extends Hit
{
	public static const SIZE0:int = 20
	public static const SPACE:int = 20
	public static const NAME_WIDTH:int = 50
	static const IX:int = 1
	static const DX:int = 2

	var zone:Datum
	/** zone.deep + 1 */
	var deep:int
	/** <0 input >0 output 0 neither input nor output */
	var io:int
	var unity:Unity, uNext:Datum, uPrev:Datum
	var gene:Boolean
	/** >0 trial <0 veto 0 neither */
	var tv:int
	/** zoner is veto */
	var zv:Boolean
	/** innermost non output zoner or this, as base zoner */
	var bzer:Datum
	/** innermost non input zoner or this, as agent zoner */
	var azer:Datum
	const bs:Vector.<Wire> = new Vector.<Wire>
	const As:Vector.<Wire> = new Vector.<Wire>
	/** cycle base */
	var cycle:Datum
	/** early or later in the zone, [ x-0x400000, x, x+0x400000 ] */
	var el:int
	var layer2:Boolean

	/** must run or may run, as agent zoner */
	var mustRun:Boolean
	var yield:int, yR:int, yX:int, unyR:int, unyX:int
	var us:Dictionary
	const bbs:Vector.<Wiring> = new Vector.<Wiring>
	/** the maximum deep of all outermost bases */
	var base0:int
	/** match iteration */
	var mn:int

	var err:String
	var namey:Text, nameR:int, nameH:int
	var w:int, h:int
	/** -1: no inner datum, >0: output row index */
	var ox:int
	/** 1: hide, 2: only this, 3: this and inners */
	var detail:int = 2, redetail:int
	var dragMode:int

	Shape // for mxml bug on Graphics

////////////////////////////////       ////////////////////////////////
//////////////////////////////// logic ////////////////////////////////
////////////////////////////////       ////////////////////////////////

	function Datum(io_:int)
	{
		io = io_
		unity = new Unity, unity.d = uNext = uPrev = this
		setName('')
		super()
		add(namey = new Text)
		namey.x = 2, nameR = nameH = 0
		namey.backgroundColor = io < 0 ? 0xe6ccff : io > 0 ? 0xcce6ff : 0
		ox = -1

		mouseEnabled = mouseChildren = false
	}

	function rowAt(x:int):Row
	{
		return Row(getChildAt(x))
	}

	function row(x:int):Row
	{
		return x >= IX && x <= ox ? Row(getChildAt(x)) : null
	}

	function wireAt(x:int):Wire
	{
		return Wire(getChildAt(x))
	}

	function addTo(z:Datum, r:int, x:int, addRow:Boolean):Datum
	{
		if (z == null)
		{
			deep = 1
			gene = true
			bzer = azer = this
			err = ''
			return this // zonest
		}
		if (z.ox < 0)
			z.addChildAt(new Row, IX),
			z.addChildAt(new Row, z.ox = DX)
		if (addRow)
			Row(z.addChildAt(new Row, r)).addChildAt(this, x),
			z.ox++
		else
			z.rowAt(r).addChildAt(this, x)
		if ( !zone)
		{
			edit = z.edit
			zone = z
			deep = z.deep + 1
			if (io < 0)
				bzer = this,
				azer = zone.io < 0 ? zone.azer : zone,
				el = x - 0x400000 // also for loading
			else if (io > 0)
				gene = zone.gene,
				bzer = zone.io > 0 ? zone.bzer : zone,
				azer = this,
				el = x + 0x400000 // also for loading
			else
				gene = zone.gene,
				bzer = azer = this,
				el = r <= DX ? x // for loading
					: x ? z.rowAt(r).datumAt(x - 1).el + 1
					: z.rowAt(r - 1).datumAt(z.rowAt(r - 1).numChildren - 1).el + 1
		}
		addTo0(deep)
		refresh(layer2 ? zone.layer2 ? 1 : 2 : 3)
		return this
	}

	private function addTo0(deep:int):void
	{
		unity.d != this && unityTo(unity.d, true)
		for each (var w:Wire in bs)
			if (w.zone.deep < deep)
				w.base.As.push(w), w.addTo()
		for each (w in As)
			if (w.zone.deep < deep)
				w.agent.bs.push(w), w.addTo()
		for (var x:int = IX; x <= ox; x++)
			for (var r:Row = rowAt(x), y:int = 0, n:int = r.numChildren; y < n; y++)
				r.datumAt(y).addTo0(deep)
	}

	/** @return true if the row is unadd */
	function unadd(r:int, x:int):Boolean
	{
		unadd0(deep)
		var row:Row = Row(parent), unrow:Boolean = false
		with (zone)
		{
			row.removeChildAt(x)
			this.io || row.numChildren || (removeChildAt(r), ox--, unrow = true)
			if (ox == DX && rowAt(IX).numChildren + rowAt(ox).numChildren == 0)
				removeChildAt(DX), removeChildAt(IX),
				ox = -1
			refresh(3)
		}
		edit.key == this && edit.keyin(keyPrev, 0, 0, false) // will keyin again
		keyPrev && (keyPrev.keyNext = keyNext)
		keyNext && (keyNext.keyPrev = keyPrev)
		keyPrev = keyNext = null
		return unrow
	}

	private function unadd0(deep:int):void
	{
		uNext != this && unityTo(this, true)
		var x:int, w:Wire
		for each (w in bs)
			if (w.zone.deep < deep)
				w.base.As.splice(w.base.As.indexOf(w), 1), w.unadd()
		for each (w in As)
			if (w.zone.deep < deep)
				w.agent.bs.splice(w.agent.bs.indexOf(w), 1), w.unadd()
		for (x = IX; x <= ox; x++)
			for (var r:Row = rowAt(x), y:int = 0, n:int = r.numChildren; y < n; y++)
				r.datumAt(y).unadd0(deep)
	}

	public override function set name(v:String):void
	{
		if (v.charCodeAt(0) == 63 || v.charCodeAt(0) == 33) // ? !
			v = v.substr(1)
		for (var d:Datum = uNext; d != this; d = d.uNext)
			if (v)
				d.setName(v)
			else
				throw 'empty unity name'
		setName(v)
	}

	private function setName(v:String):void
	{
		super.name = v
		if ( !namey)
			return // constuctor
		if (tv)
			namey.str(tv < 0 ? '?' : '!').add(v)
		else
			namey.str(v)
		nameR = int(Math.ceil(namey.textWidth))
		nameH = int(Math.ceil(namey.textHeight))
		nameR && int(nameR += 4), nameH && int(nameH += 6)
		refresh(-1)
	}

	function setTv(tv_:int):void
	{
		if (tv == tv_)
			return
		tv = tv_
		setName(name)
	}

	/** @return exist */
	function agent(w:Wire, a:Datum, replace:Boolean = true):Wire
	{
		if (replace)
			for (var x:int = As.length - 1, w0:Wire; x >= 0; x--)
				if ((w0 = As[x]).agent == a)
				{
					As[x] = w, a.bs[a.bs.indexOf(w0)] = w,
					w0.unadd(), w.zone ? w.addTo() : w.addTo(this, a)
					return w0
				}
		As.push(w), a.bs.push(w)
		w.zone ? w.addTo() : w.addTo(this, a)
		return null
	}

	function unagent(w:Wire):void
	{
		var x:int = As.indexOf(w), a:Datum = w.agent
		if (x < 0)
			return
		As.splice(x, 1), a.bs.splice(a.bs.indexOf(w), 1)
		w.unadd()
	}

	function breakRow(r:int, x:int):void
	{
		var r0:Row = row(r), r1:Row = Row(addChildAt(new Row, r + 1))
		for (var n:int = r0.numChildren - x; n > 0; n--)
			r1.addChild(r0.getChildAt(x))
		ox++
		refresh(3)
	}

	/** @return the numChildren before merge */
	function mergeRow(r:int):int
	{
		var r0:Row = row(r), r1:Row = row(r + 1)
		if (r1 == null)
			return -1
		var n0 = r0.numChildren
		removeChildAt(r + 1)
		for (var n:int = r1.numChildren; n > 0; n--)
			r0.addChild(r1.getChildAt(0))
		ox--
		refresh(3)
		return n0
	}

	function unityTo(u:Datum, undoRedo:Boolean = false):void
	{
		if (io != u.io)
			throw 'must be input or output both'
		if (unity.d == this)
			unity.d = uNext
		if ( !undoRedo)
			if (u == this)
				(unity = new Unity).d = this
			else if (unity == u.unity)
				return
		uNext.uPrev = uPrev
		uPrev.uNext = uNext
		uNext = u.uNext
		uPrev = u
		u.uNext = this
		uNext.uPrev = this
		if (u != this)
		{
			if (u.name)
				name = u.name
			else if (name)
				u.name = name
			else
				throw 'unity must have name'
			unity = u.unity
		}
	}

	function unities(u:Boolean):void
	{
		var d:Datum = uNext
		namey.background = u && d != this
		for (; d != this; d = d.uNext)
			d.namey.background = u
	}

////////////////////////////////      ////////////////////////////////
//////////////////////////////// view ////////////////////////////////
////////////////////////////////      ////////////////////////////////

	/** 0: no refresh, <0: refresh, 1: refresh to hide, 2: refresh to only this
	 *  3: refresh to this and inners, >3: refresh all deeply */
	function refresh(x:int):Boolean
	{
		if (redetail <= 0 || x > redetail)
			redetail = x, edit.refresh = true
		return true
	}

	function layoutDetail():void
	{
		var r:Row, n:int, x:int, y:int, d:Datum
		if ( !zone || redetail >= 4)
			detail = 3
		else if (redetail > 0)
			detail = redetail
		for (x = IX; x <= ox; x++)
			for (r = rowAt(x), n = r.numChildren, y = 0; y < n; y++)
			{
				d = r.datumAt(y)
				if (redetail > 0)
					if (redetail >= 4 && !d.layer2)
						d.redetail = 4
					else if (redetail <= 2)
						d.redetail = 1
				d.layoutDetail()
				if (d.detail >= 2 && detail < 3)
					detail = redetail = 3
			}
		if (detail >= 3)
			for (x = IX; x <= ox; x++)
				for (r = rowAt(x), n = r.numChildren, y = 0; y < n; y++)
					if ((d = r.datumAt(y)).detail < 2)
						d.detail = d.redetail = 2
	}

	function layout(force:Boolean):Boolean
	{
		var r:Row, n:int, x:int, y:int, d:Datum
		for (x = IX; x <= ox; x++)
			for (r = rowAt(x), n = r.numChildren, y = 0; y < n; y++)
				d = r.datumAt(y),
				d.layout(false) && (force = true)
		redetail && (force = true)
		redetail = 0
		n = numChildren
		if ( !force)
		{
			if (ox > 0)
				for (; x < n; x++)
					wireAt(x).layout(false)
			return false
		}
		var g:flash.display.Graphics = graphics, w2:int, h2:int
		g.clear()
		if (detail <= 1)
		{
			for (x = IX; x <= ox; x++)
				rowAt(x).layout(0, 0, 0, 0)
			for (; x < n; x++)
				wireAt(x).layout(true)
			w = h = 0
			visible = false
			return true
		}
		if (ox < 0)
		{
			w = Math.max(SIZE0, nameR + 4)
			h = Math.max(SIZE0, (namey.y = 2) + nameH)
		}
		else if (detail == 2)
		{
			w = Math.max(SIZE0, nameR + 4)
			h = Math.max(SIZE0, (namey.y = 2) + (nameR ? nameH + 8 : 0))
			w2 = w >> 1, h2 = nameR ? nameH + 3 : h >> 1
			rowAt(IX).layout(0, w2, w2, 0)
			for (x = IX + 1; x <= ox; x++)
				rowAt(x).layout(0, w2, w2, h2)
			for (; x < n; x++)
				wireAt(x).layout(true)
		}
		else
		{
			r = rowAt(IX)
			if (r.numChildren && nameR > NAME_WIDTH)
				w = Math.max(SIZE0, nameR, r.layoutW())
			else
				w = Math.max(SIZE0, nameR + r.layoutW())
			for (x = IX + 1; x <= ox; x++)
				w = Math.max(w, rowAt(x).layoutW())
			r = rowAt(IX)
			if (r.numChildren && nameR > NAME_WIDTH)
				r.layout(1, 0, w, 0),
				namey.y = r.h + 1
			else
				r.layout(1, nameR, w, 0),
				namey.y = 2
			h = Math.max(namey.y + nameH, r.h + SPACE)
			for (x = IX + 1; x <= ox; x++)
				r = rowAt(x),
				r.layout(x < ox ? 2 : 3, 0, w, h),
				h += x < ox ? r.h + SPACE : r.h
			for (; x < n; x++)
				wireAt(x).layout(true)
		}
		var c0:int = io < 0 ? 0xf9f3ff : io > 0 ? 0xf3f9ff : 0xf5fff5,
			c:int = err ? 0xff0000 : io < 0 ? 0x6600dd : io > 0 ? 0x66dd : 0x8800
		if ( !zone || io != zone.io)
			g.beginFill(c0),
			g.drawRect(0, 0, w, h), g.endFill()
		if (gene)
			g.beginFill(c), g.moveTo(1, 1), g.lineTo(3.5, 1), g.lineTo(1, 3.5), g.endFill()
		Util.line(g, 1, c, yield ? 0.5 : 1)
		g.drawRect(0.5, 0.5, w - 1, h - 1)
		if (detail == 2 && ox > 0)
			w2 = w >> 1, h2 = nameR ? nameH + 3 : h >> 1,
			Util.line(g, 2, c), g.moveTo(w2 - 3, h2), g.lineTo(w2 + 3, h2)
		if (yield)
			Util.line(g, 1, c0), g.moveTo(0.5, 1), g.lineTo(0.5, 6)
		visible = true
		return true
	}

	function searchRow(y:int):int
	{
		var low:int = IX, high:int = ox
		while (low <= high)
		{
			var mid:int = (low + high) >> 1, r:Row = rowAt(mid)
			if (y < r.top)
				high = mid - 1
			else if (y >= r.top + r.h)
				low = mid + 1
			else
				return mid
		}
		return ~low
	}

	function hit(xy:Point, wire:Boolean = true):Hit
	{
		var x:int = xy.x, y:int = xy.y, i:int, n:int, d:Datum, W:Wire, p:Point, r:Row
		if (x < 0 || y < 0 || x >= w || y >= h)
			return null
		d = this
		xy.x = xy.y = 0
		wire && (p = new Point)
		for (;;)
		{
			if (wire && (i = d.ox > 0 ? d.ox + 1 : IX) < (n = d.numChildren)
				&& (p.x = x + 1, p.y = y, p = d.localToGlobal(p)))
				do
					if ((W = d.wireAt(i)).visible && W.hitTestPoint(p.x, p.y, true))
						return W
				while (++i < n)
			if ((i = d.searchRow(y)) < 0)
				break
			r = d.rowAt(i)
			i = r.searchDatum(x, y)
			if (i < 0)
				break
			d = r.datumAt(i)
			x -= d.x, y -= d.y
			xy.x += d.x, xy.y += d.y
		}
		return d
	}

	override function hover(x:int, y:int):void
	{
		var g:flash.display.Graphics = edit.hover.graphics,
			c:int = err ? 0xff0000 : io < 0 ? 0xbb66ff : io > 0 ? 0x66aaff : 0x66cc66
		g.clear()
		if (gene)
			g.beginFill(c), g.moveTo(3, 3), g.lineTo(6, 3), g.lineTo(3, 6), g.endFill()
		Util.line(g, 3, c, yield ? 0.5 : 1)
		g.drawRect(1.5, 1.5, w - 3, h - 3)
		edit.hover.x = x, edit.hover.y = y
		if (err)
			edit.tip.str(err).color(0xfff8f8, 0xaa6666, 0x880000)
				.xy(stage.mouseX + 1, stage.mouseY - edit.tip.height).visible = true
		else
			edit.tip.str('').visible = false
	}

	override function keyin(mouse:Boolean):void
	{
		var xy:Point = localParent(edit)
		var g:flash.display.Graphics = edit.keying.graphics,
			c:int = err ? 0xff0000 : io < 0 ? 0x7700cc : io > 0 ? 0x55dd : 0x8800
		g.clear()
		if (gene)
			g.beginFill(c), g.moveTo(3, 3), g.lineTo(6, 3), g.lineTo(3, 6), g.endFill()
		Util.line(g, 3, c, yield ? 0.5 : 1)
		g.drawRect(1.5, 1.5, w - 3, h - 3)
		edit.keying.x = xy.x, edit.keying.y = xy.y
		mouse || edit.scrollDelta(
			xy.x - Math.max(edit.sx, Math.min(xy.x, edit.sr - w)),
			xy.y - Math.max(edit.sy, Math.min(xy.y, edit.sb - h)))
	}

////////////////////////////////      ////////////////////////////////
//////////////////////////////// edit ////////////////////////////////
////////////////////////////////      ////////////////////////////////

	override function key(k:int, c:int, shift:Boolean, ctrl:Boolean)
	{
		var r:Row = parent as Row, kr:int = edit.keyR, kx:int = edit.keyX,
			d:Datum, xy:Point
		if (r)
		{
			if (k == 37) // left
				if (--kx >= 0 || (r = zone.row(--kr)) && (kx = r.numChildren - 1) >= 0)
					return edit.keyin(r.datumAt(kx), kr, kx)
			if (k == 39) // right
				if (++kx < r.numChildren || (r = zone.row(++kr)) && (kx = 0) < r.numChildren)
					return edit.keyin(r.datumAt(kx), kr, kx)
			if (k == 38 || k == 40) // up and down
				if ((r = zone.row(k == 38 ? --kr : ++kr)) && r.numChildren)
				{
					var x:int = r.searchDatumX(x + w / 2)
					return edit.keyin(
						r.datumAt(kx = Math.min(x ^= x >> 31, r.numChildren - 1)), kr, kx)
				}
			if (k == 36) // home
				return kx > 0 && edit.keyin(r.datumAt(0), kr, 0)
			if (k == 35) // end
				return kx != (kx = r.numChildren - 1) && edit.keyin(r.datumAt(kx), kr, kx)
		}

		if (k == 90) // z
			return edit.keyin(zone || this)
		if (k == 32 || k == 9) // space or tab
			return ox > 0 &&
				edit.keyin(rowAt(kr = IX).datum(0) || rowAt(kr = DX).datum(0), kr, 0)
		if (c == 44) // ,
			return ox > 0 && (d = rowAt(IX).datum(0)) && edit.keyin(d, IX, 0)
		if (c == 96) // `
			return ox > DX && (d = rowAt(DX).datum(0)) && edit.keyin(d, DX, 0)
		if (c == 46) // .
			return ox > 0 && (d = rowAt(ox).datum(0)) && edit.keyin(d, ox, 0)
		if (c == 59 && !ctrl) // ;
			return uNext != this && edit.keyin(uNext)
		if (k == 219) // [ {
			return bs.length && edit.keyin(bs[0])
		if (k == 221) // ] }
			return As.length && edit.keyin(As[0])

		if (k != edit.keyOn)
			if (c == 43 || c == 61) // + =
				return shift ? refresh(4) : detail < 3 && refresh(3)
			else if (c == 45 || c == 95) // - _
				return detail > 2 && refresh(2)
			else if (c == 59 && ctrl) // ctrl ;
				return edit.unities = !edit.unities, edit.refresh = true

		if (layer2)
			return
		if (yield)
			return k == 89 && !ctrl && edit.com.nonyield() // y

		if (k == 13 && !shift && !ctrl) // enter
			return xy = localParent(edit),
				edit.namey.xy(xy.x + namey.x, xy.y + namey.y),
				edit.namey.str(name).visible = true,
				edit.namey.focus().caret(-1)

		if (k != edit.keyOn)
			if (k == 73) // i
				return edit.com.input(shift)
			else if (k == 68) // d
				return edit.com.datum(shift)
			else if (k == 79) // o
				return edit.com.output(shift)
			else if (k == 13 && shift) // shift-enter
				return edit.com.breakRow()
			else if (k == 84 || c == 63) // t ?
				return edit.com.trialVeto(-1)
			else if (k == 86 || c == 33) // v !
				return edit.com.trialVeto(1)

		if (k == 8) // backspace
			return edit.com.removeBefore()
		if (k == 46) // delete
			return edit.com.remove()
		if (k == 65 || k == 66 || k == 85) // a b u
			return edit.dragStart(k, c, shift, ctrl)
	}

	override function draging(drag:Shape, state:int,
		k:int, c:int, shift:Boolean, ctrl:Boolean)
	{
		if (yield || layer2)
			return state > 0 || edit.dragStop()
		if (state < 0 && k == 0)
			dragMode = 0
		else if (k == 85) // u
			dragMode = 1
		else if (k == 65) // a
			dragMode = 2
		else if (k == 66) // b
			dragMode = 3
		if (dragMode == 1)
			dragingUnity(drag, state)
		else if (dragMode == 2)
			dragingAgent(drag, state)
		else if (dragMode == 3)
			dragingBase(drag, state)
		else
			dragingMove(drag, state)
	}

	function dragingMove(drag:Shape, state:int):void
	{
		var g:flash.display.Graphics = drag.graphics
		g.clear()
		Ok: if (zone && edit.hit == zone)
		{
			var x:int, y:int = zone.mouseY, r:Row,
				i:int = zone.searchRow(y), ii:int = i >> 31, j:int
			r = zone.rowAt(i ^= ii)
			if (ii == 0)
			{
				j = ~r.searchDatum(x = r.mouseX, y = r.mouseY)
				if (j < 0x7ffffffe)
				{
					if ((io < 0) == (i > IX) || (io > 0) == (i < zone.ox))
						break Ok
					state > 0 && edit.com.move(i, j)
					g.beginFill(0)
					g.drawRect(-2, -10, 3, 20)
					g.endFill()
					return
				}
				j == 0x7fffffff && i++
			}
			if (io)
				break Ok
			state > 0 && edit.com.moveRow(i)
			g.beginFill(0)
			g.drawRect(-10, -2, 20, 3)
			g.endFill()
			return
		}
		Util.line(g, 2, 0)
		g.moveTo(-7.5, -8.5), g.lineTo(8.5, 7.5)
		g.moveTo(8.5, -8.5), g.lineTo(-7.5, 7.5)
	}

	function dragingUnity(drag:Shape, state:int):void
	{
		var g:flash.display.Graphics = drag.graphics,
			hit:Datum = edit.hit as Datum,
			x:Number = mouseX, y:Number = mouseY,
			x0:Number = x <= w / 2 ? -x : w - x, y0:Number = y <= h / 2 ? -y : h - y
		g.clear()
		Util.line(g, 1, 0, 0.5)
		g.lineTo(x0, y0)
		if (hit && io && io == hit.io && (name || hit.name))
		{
			Util.line(g, 2, 0)
			g.moveTo(-4, -4), g.lineTo(2, -4)
			g.moveTo(2.5, 4.5), g.lineTo(-4.5, 11.5)
			state > 0 && edit.com.unity(hit)
			return
		}
		Util.line(g, 2, 0)
		g.moveTo(-7.5, -8.5), g.lineTo(8.5, 7.5)
		g.moveTo(8.5, -8.5), g.lineTo(-7.5, 7.5)
	}

	function dragingBase(drag:Shape, state:int):void
	{
		var g:flash.display.Graphics = drag.graphics,
			x:Number = mouseX, y:Number = mouseY,
			x0:Number = x <= w / 2 ? -x : w - x, y0:Number = -y,
			hit:Datum = edit.hit as Datum
		g.clear()
		Util.line(g, 1, 0, 0.5)
		g.lineTo(x0, y0)
		if (hit && hit != this && !hit.yield)
		{
			Util.line(g, NaN, 0)
			g.beginFill(0)
			g.moveTo(x0, y0), g.lineTo(x0 + 5, y0 - 10)
			g.lineTo(x0 - 5, y0 - 10), g.lineTo(x0, y0)
			g.endFill()
			state > 0 && edit.com.base(hit)
			return
		}
		Util.line(g, 2, 0)
		g.moveTo(-7.5, -8.5), g.lineTo(8.5, 7.5)
		g.moveTo(8.5, -8.5), g.lineTo(-7.5, 7.5)
	}

	function dragingAgent(drag:Shape, state:int):void
	{
		var g:flash.display.Graphics = drag.graphics,
			x:Number = mouseX, y:Number = mouseY,
			x0:Number = x <= w / 2 ? -x : w - x, y0:Number = h - y,
			hit:Datum = edit.hit as Datum
		g.clear()
		Util.line(g, 1, 0, 0.5)
		g.lineTo(x0, y0)
		if (hit && hit != this && !hit.yield)
		{
			Util.line(g, NaN, 0)
			g.beginFill(0)
			g.moveTo(0, 0), g.lineTo(5, -10)
			g.lineTo(-5, -10), g.lineTo(0, 0)
			g.endFill()
			state > 0 && edit.com.agent(hit)
			return
		}
		Util.line(g, 2, 0)
		g.moveTo(-7.5, -8.5), g.lineTo(8.5, 7.5)
		g.moveTo(8.5, -8.5), g.lineTo(-7.5, 7.5)
	}

////////////////////////////////           ////////////////////////////////
//////////////////////////////// load save ////////////////////////////////
////////////////////////////////           ////////////////////////////////

	function save(str:IDataOutput, byte:int):void
	{
		var d:Datum, r:Row, x:int, y:int, n:int, el:int, w:Wire
		if (io && uNext != this)
			(d = edit.saveUs[unity]) || (edit.saveUs[unity] = this)
		if ( !layer2)
		{
			if (zone)
				str.writeByte(byte)
			str.writeByte((tv < 0 ? 1 : tv ? 3 : 0) | (d ? 16 : 0))
			if (d)
				d.saveDatum(str, edit.zonest)
			else
				edit.saveUcs(str, name)
		}
		if (ox > 0)
		{
			for (r = rowAt(IX), x = 0, n = r.numChildren, el = -0x400000; x < n; x++)
				if ( !(d = r.datumAt(x)).yield)
					d.el = el++, d.save(str, 3)
			for (x = DX, el = 0; x < ox; x++)
				for (r = rowAt(x), y = 0, n = r.numChildren; y < n; y++)
					if ( !(d = r.datumAt(y)).yield)
						d.el = el++, d.save(str, x > DX && y == 0 ? 16 : 0)
			for (r = rowAt(ox), x = 0, n = r.numChildren, el = 0x400000; x < n; x++)
				if ( !(d = r.datumAt(x)).yield)
					d.el = el++, d.save(str, 1)
			if ( !layer2)
				for (x = ox + 1; x < numChildren; x++)
					if ( !(w = wireAt(x)).yield)
						str.writeByte(4),
						w.save(str)
		}
		if ( !layer2)
			str.writeByte(255)
	}

	function saveDatum(str:IDataOutput, z:Datum, end:int = 0x200000):void
	{
		if (deep > z.deep + 1)
			zone.saveDatum(str, z, 0), str.writeInt(el | end)
		else if (this != z) // deep == z.deep + 1
			str.writeInt(el | end)
		else // deep == z.deep
			str.writeInt(-1)
	}

	function load(str:IDataInput):void
	{
		var x:int = str.readUnsignedByte()
		setTv(x & 1 ? x & 2 ? 1 : -1 : 0)
		if (x & 16)
			unityTo(edit.zonest.loadDatum(str))
		else
			name = edit.loadUcs(str)
		while ((x = str.readUnsignedByte()) < 255)
			if (x == 3 && zone)
				new Datum(-1).addTo(this, IX,
					ox < 0 ? 0 : rowAt(IX).numChildren, false).load(str)
			else if (x == 0)
				new Datum(0).addTo(this, ox <= DX ? DX : ox - 1,
					ox <= DX ? 0 : rowAt(ox - 1).numChildren, ox <= DX).load(str)
			else if (x == 16)
				new Datum(0).addTo(this, ox < 0 ? DX : ox, 0, true).load(str)
			else if (x == 1)
				new Datum(1).addTo(this, ox < 0 ? DX : ox,
					ox < 0 ? 0 : rowAt(ox).numChildren, false).load(str)
			else if (x == 4 && ox > 0)
				new Wire().load(str, this)
			else
				throw 'invalid file format'
	}

	function loadDatum(str:IDataInput):Datum
	{
		var x:int = str.readInt()
		if (x == -1)
			return this
		var end:int = x & 0x200000, r:Row = null, d:Datum
		end && (x &= ~0x200000)
		if (x < 0)
			r = row(IX), x += 0x400000
		else if (x >= 0x400000)
			r = row(ox), x -= 0x400000
		else if (ox > DX)
		{
			for (var low:int = DX, high:int = ox - 1; low <= high; )
			{
				var mid:int = low + high >>> 1
				d = (r = rowAt(mid)).datumAt(0)
				if (x < d.el)
					high = mid - 1
				else if (x > d.el)
					low = mid + 1
				else
					return end ? d : d.loadDatum(str)
			}
			r = rowAt(high), x -= r.datumAt(0).el
		}
		if (r && (d = r.datum(x)))
			return end ? d : d.loadDatum(str)
		throw 'datum not found'
	}

////////////////////////////////         ////////////////////////////////
//////////////////////////////// compile ////////////////////////////////
////////////////////////////////         ////////////////////////////////

	function compile1():void
	{
		if (gene != (gene = io >= 0 && ( !zone || zone.gene && bs.length == 0)))
			refresh(-1)
		zv = zone && (zone.tv > 0 || zone.zv)
		cycle = null
		var d:Datum, r:Row, x:int, y:int, n:int, el:int, w:Wire
		if (ox > 0)
		{
			for (r = rowAt(IX), x = 0, n = r.numChildren, el = -0x400000; x < n; x++)
				Boolean((d = r.datumAt(x)).yield ? d.yield = -1 : d.el = el++),
				d.compile1()
			for (r = rowAt(ox), x = 0, n = r.numChildren, el = 0x400000; x < n; x++)
				Boolean((d = r.datumAt(x)).yield ? d.yield = -1 : d.el = el++),
				d.compile1()
			for (x = DX, el = 0; x < ox; x++)
				for (r = rowAt(x), y = 0, n = r.numChildren; y < n; y++)
					Boolean((d = r.datumAt(y)).yield ? d.yield = -1 : d.el = el++),
					d.compile1()
			for (x = numChildren - 1; x > ox; x--)
				(w = wireAt(x)).yield && (w.yield = -1),
				w.compile1()
		}
		bbs.length = 0
		err && (err = '', refresh(-1))
	}

	function compile2():void
	{
		us = new Dictionary
		var r:Row, bw:Wire, w:Wiring, wb:Wiring, wbb:Wiring, ww:Wiring, x:int, y:int, n:int
		for each (bw in bs)
			if ( !bw.err && !bw.yield && bw.base == bw.zone)
				cycle = bw.base
		base0 = bs.length ? 1 : deep
		for (x = bs.length - 1; x >= 0; x--)
			if ( !(bw = bs[x]).err && !bw.yield)
			{
				if (cycle && bw.base != cycle)
				{
					bw.err = 'only one base allowed for cycle agent'
					edit.refresh = bw.refresh = true, edit.error = 1
					continue
				}
				w = new Wiring
				bbs.push(w)
				w.b = bw.base
				w.deep0 = bw.zone.deep, w.deep9 = azer.deep - 1
				base0 = Math.max(base0, Math.min(w.b.base0,
					bw.base == bw.zone || bw.zb.io < 0 ? bw.zone.deep : bw.zb.deep))
				for each (wb in w.b.bbs)
					if (wb.deep0 <= w.deep0)
					B: {
						for each (wbb in bbs)
							if (wbb.b == wb.b)
								break B // continue
						ww = new Wiring
						bbs.push(ww)
						ww.b = wb.b
						ww.deep0 = wb.deep0
						ww.deep9 = wb.deep9 < w.deep0 ? wb.deep9 : w.deep9
						ww.from = bw
					}
			}
//		namey.text = namey.text.replace(/:.*/, '') + ':' + base0 // TODO debug
		if (ox > 0)
			for (x = IX; x <= ox; x++)
				for (r = rowAt(x), y = 0, n = r.numChildren; y < n; y++)
					r.datumAt(y).compile2()
		mn = 0
		uNext == this || zone.us[unity] && yield || Boolean(zone.us[unity] = this)
	}

	function compile3(mn_:int):int
	{
		var r:Row, x:int, n:int, y:int, w:Wire
		if (ox > 0)
			for (x = ox; x >= IX; x--)
				for (r = rowAt(x), y = r.numChildren - 1; y >= 0; y--)
					mn = Math.max(r.datumAt(y).compile3(mn_), mn)
		if (ox > 0 && !tv)
			for each (w in bs)
				if ( !w.err && !w.yield && (mn >= mn_ || w.base.mn >= mn_))
					match(w.base, w.base, this, this, mn_)
		return mn > mn_ ? mn : 0
	}

	private static function match(zb:Datum, b:Datum, za:Datum, a:Datum, mn_:int):Boolean
	{
		if (a.ox < 0)
			return false
		var _:Boolean = false, r:Row, x:int, n:int, bd:Datum, ad:Datum, y:int, w:Wire
		for (r = a.rowAt(IX), x = 0, n = r.numChildren; x < n; x++)
			if ((ad = r.datumAt(x)).name && ad.yield >= 0)
				if ((bd = matchBaseUnity(b, a, ad, mn_)) && !bd.err)
					(match(ad, ad, bd, bd, mn_) || bd.mn > mn_) && (_ = true),
					b != zb && matchWire(zb, bd, za, ad, b)
		for (r = a.rowAt(a.ox), x = 0, n = r.numChildren; x < n; x++)
			if ((ad = r.datumAt(x)).tv >= 0 && ad.name && ad.yield >= 0)
			{
				bd = matchBaseUnity(b, a, ad, mn_)
				if (bd && !bd.err)
				{
					for (w = null, y = ad.bs.length - 1; y >= 0; y--)
						if ( !(w = ad.bs[y]).err && !w.yield &&
							(w.base == w.zone || w.base.bzer.io < 0 && !w.base.bzer.bs.length))
							break
					w && y < 0 || match(zb, bd, za, ad, mn_) && (_ = true)
					bd.mn > mn_ && (_ = true)
				}
				bd && bd.err || matchWire(zb, bd, za, ad, b)
			}
		_ && (b.mn = a.mn = mn_ + 1)
		return _
	}

	private static function matchBaseUnity(b:Datum, a:Datum, ad:Datum, mn_:int):Datum
	{
		var d:Datum = b.us[ad.unity], z:Datum, err:String
		if (d && d.yield >= 0)
		{
			if (d.tv <= 0 && ad.tv > 0 && !ad.err)
				ad.err = "veto must be matched\n  by '"
					+ b.name + "' and '" + d.name + "' inside",
				ad.refresh(-1), b.edit.error = 1
			else if (d.tv > 0 && ad.tv <= 0 && !d.err)
				d.err = (d.io < 0 ? "input must not be veto to match\n  '"
					: "output must not be veto to match\n  '")
					+ a.name + "' and '" + ad.name + "' inside",
				d.refresh(-1), b.edit.error = 1
			return d
		}
		if (ad.tv > 0 && (b.gene || b.layer2))
			return null
		for (z = b; z.io > 0; z = z.zone)
			if (z.unity == ad.unity)
			{
				if (b.cycle == z.zone)
					return z // not yield
				err = 'yield zone must be cycle agent of zone of\
  innermost zone of same unity inside base zoner'
				break
			}
		if (d) // d.yield < 0
			d.yield = 1,
			d.setTv(ad.tv > 0 ? 1 : 0),
			d.mn = mn_ + 1
		else
		{
			d = new Datum(ad.io)
			d.yield = 1
			ad.tv > 0 && (d.tv = 1)
			var r:int = ad.io < 0 ? IX : b.ox < 0 ? DX : b.ox
			d.yR = r, d.yX = b.ox < 0 ? 0 : b.rowAt(r).numChildren
			d.addTo(b, d.yR, d.yX, false)
			ad.uNext == ad && Boolean(a.us[ad.unity] = ad)
			d.unityTo(ad), b.us[ad.unity] = d
			d.mn = mn_ + 1
			d.us = new Dictionary
			b.edit.yields.push(d)
		}
		if ((d.layer2 = b.layer2))
			d.err = 'Yield forbidden here',
			d.refresh(-1), b.edit.error = 1
		else if (err)
			d.err = err,
			d.refresh(-1), b.edit.error = 1
		return d
	}

	private static function matchWire(zb:Datum, b:Datum, za:Datum, a:Datum, b_:Datum):void
	{
		var a0b9:int = a.deep, n:int = 0, bw:Wiring, aw:Wiring, awb:Datum, w:Wire
		for each (aw in a.bbs)
			if (a.azer.zone.deep == aw.deep9)
				n++, aw.deep0 < a0b9 && (a0b9 = aw.deep0)
		if ( !n)
			return
		if ( !b)
		{
			if (a.tv <= 0 && !a.err)
				a.err = "output having base must be matched\n  by '"
					+ (zb == b_ ? b_.name + "'" : zb.name + "' and '" + b_.name + "' inside"),
				a.refresh(-1), a.edit.error = 1
			return
		}
		a0b9 = a0b9 - a.deep + b.deep, n = 0
		for each (bw in b.bbs)
		W: {
			if (bw.from && bw.from.err || bw.deep9 < a0b9
				|| bw.b != zb && bw.b.bzer.io >= 0 && bw.b.base0 <= a0b9)
				continue
			n++
			if ((awb = zb.deep > bw.deep0 ? bw.b : matchDatum(zb, bw.b, za)))
				for each (aw in a.bbs)
					if (aw.b == awb)
						break W // continue
			WW: {
				for each (w in b.bs)
					if (w.base == bw.b)
						break WW
				w = new Wire
				w.yield = 1, b.edit.yields.push(w)
				bw.b.As.push(w), b.bs.push(w)
				w.addTo(bw.b, b)
			}
			w.yield < 0 && (w.yield = 1)
			if ( !w.err)
				w.err = "wire must match a wire\n  inside '"
					+ za.name + "' with agent '" + a.name + "'",
				b.edit.refresh = w.refresh = true, b.edit.error = 1
		}
		B: {
			awb = matchDatum(zb, b, za) 
			for each (aw in a.bbs)
				if (aw.b == awb)
					break B // base outsite cycle agent and agent inside cycle agent
			if ( !n && !b.err)
				for each (aw in a.bbs)
					if (aw.b != b)
					{
						b.err = "output must have base to match\n  '"
							+ za.name + "' and '" + a.name + "' inside"
						b.refresh(-1), b.edit.error = 1
						break
					}
		}
	}

	private static function matchDatum(z:Datum, d:Datum, zz:Datum):Datum
	{
		return d == z ? zz : (z = matchDatum(z, d.zone, zz)) && z.us[d.unity]
	}

	function compile4():void
	{
		var r:Row, d:Datum, w:Wire, x:int, y:int, n:int
		if (ox > 0)
			for (x = IX; x <= ox; x++)
				for (r = rowAt(x), y = r.numChildren - 1; y >= 0; y--)
					if ((d = r.datumAt(y)).yield < 0)
						d.unyR = x, d.unyX = y,
						d.unadd(x, y), edit.yields.push(d) // ox may < 0
					else
						d.compile4()
		if (ox > 0)
			for (x = numChildren - 1; x > ox; x--)
				if ((w = wireAt(x)).yield < 0)
					w.base.unagent(w), edit.yields.push(w)
		us = null
		var e:String = error4()
		err || (err = e, refresh(-1))
		err && (edit.error = 1)
	}

	private function error4():String
	{
		mustRun = tv >= 0
		if (io < 0 && !zone.zone && !layer2)
			return 'your input zone must not be zonest'
		if (zv)
			return io < 0 ? 'input must not be inside veto' :
				io ? 'output must not be inside veto' : 'datum must not be inside veto'
		if (zone && !zone.gene)
			if ( !io)
				return 'agent can only have input and output inside'
			else if ( !name && !tv)
				return 'non trial inside agent must have name'
		if (tv && gene)
			return 'gene must not be trial or veto'
		if (tv < 0)
			if (cycle)
				return 'cycle agent must not be trial'
			else if ( !azer.gene && !azer.zone.gene)
				return "agent zoner or zoner's zone of trial must be gene"
		if (tv > 0)
			if ( !io)
				return 'veto must be input or output'
			else if ( !name)
				return 'veto must have name'
			else if (zone && zone.gene)
				return 'veto must be inside agent'
		if (uNext != this && zone.us[unity] != this)
			return 'unity must be different in same zone'
		if (io < 0)
			if (bs.length && zone.io < 0 && !zone.bs.length)
				return 'input inside input having no base must not have base'
			else if ( !bs.length && zone.zone && zone.gene)
				return "gene's input must have base"
		var r:Row, w:Wire, x:int, n:int
		Must: if (mustRun)
		{
			mustRun = false
			if (ox > 0)
				for (r = rowAt(IX), x = r.numChildren - 1; x >= 0; x--)
					if ( !r.datumAt(x).mustRun)
						break Must
			mustRun = true
			n = 0
			for each (w in bs)
				if ( !w.err)
					if (n++, w.base == w.zone || w.base.bzer.io || w.base.bzer.mustRun)
						break Must
			mustRun = n == 0
		}
		if (io > 0 && tv <= 0 && !mustRun)
			return mustRun = true, 'output must run : not be trial,\
  all its inputs and one of bases must run'
		return ''
	}
}
}
