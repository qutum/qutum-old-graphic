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
import flash.utils.IDataInput;
import flash.utils.IDataOutput;

import qutum.main.Util;


/** x == 0 and y == 0 */
final class Wire extends Hit
{
	static const S:Number = Datum.SPACE / 4
	static const SS:Number = Datum.SPACE / 2

	var base:Datum, agent:Datum
	var zone:Datum, zb:Datum, za:Datum
	/** yield, with error */
	var yield:int

	var err:String
	var refresh:Boolean
	var xys:Vector.<Number>
	var dragMode:int

	Shape // fix mxml bug on Graphics

	function addTo(b:Datum = null, a:Datum = null):void
	{
		if (b != a)
		{
			var d:int = b.deep - a.deep
			base = zb = b, agent = za = a
			while (d > 0)
				b = (zb = b).zone, --d
			while (d < 0)
				a = (za = a).zone, ++d
			while (b != a)
				b = (zb = b).zone, a = (za = a).zone
			zone = b
			edit = zone.edit
			zone.addChild(this)
			yield || compile1() // skip layout if error
		}
		else
			zone.addChild(this)
		edit.refresh = refresh = true
	}

	function unadd():void
	{
		zone.removeChild(this) // no zone layout
		edit.key == this && (edit.key = keyPrev)
		keyPrev && (keyPrev.keyNext = keyNext)
		keyNext && (keyNext.keyPrev = keyPrev)
		keyPrev = keyNext = null
	}

////////////////////////////////      ////////////////////////////////
//////////////////////////////// view ////////////////////////////////
////////////////////////////////      ////////////////////////////////

	function layout(force:Boolean)
	{
		if ( !refresh && !force)
			return
		refresh = false
		var g:flash.display.Graphics = graphics
		g.clear()
		if (zone.detail <= 2)
			return xys && (xys.length = 0)
		xys ? xys.length = 0 : xys = new Vector.<Number>

		var xy:Point, bx:Number, by:Number, b5:Number, bq:Number,
			ax:Number, ay:Number, aw:Number, a5:Number, aq:Number
		xy = base.localParent(zone)
		bx = xy.x, b5 = bx + base.w / 2
		bq = base.w ? 1 : 0
		if (base != zone)
			by = err ? xy.y + base.h - bq : zb.y + zb.h - 1
		xy.x = xy.y = 0, agent.localParent(zone, xy)
		if (err || base == zone)
			ax = xy.x, ay = xy.y, aw = agent.w, a5 = ax + aw / 2
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
		if (err)
			xys.push(ax, ay, bx, base == zone ? ay : by)
		else
		{
			ax = aw ? xy.x - aq : xy.x + aq, ay = xy.y + aq
			xys.push(xy.x = aw ? ax + agent.w : ax, xy.y = ay)
			var azer:Datum = agent.azer, a:Datum = agent, r:Row, d:Datum
			for (; a != azer; a = a.zone)
				ax -= a.x, ay -= a.y
			while (a != za || base == zone)
			{
				Up: if (a.detail >= 2)
				{
					r = Row(a.parent)
					Hori: if (a != azer || agent == azer)
						if (aw)
						{
							for (i = r.numChildren - 1; a != (d = r.datumAt(i)); i--)
								if (d.y - a.y <= xy.y - ay)
									break Hori
							break Up
						}
						else
						{
							for (i = 0; a != (d = r.datumAt(i)); i++)
								if (d.y - a.y <= xy.y - ay)
									break Hori
							break Up
						}
					xys.push(xy.x, xy.y = ay - a.y + r.top - S - SS * a.x / r.w)
				}
				if (a == za)
					break // base == zone
				ax -= a.x, ay -= a.y
				a = a.zone
				if (a.detail >= 2)
					xy.x = S + S * (xy.y - ay) / a.h,
					xys.push(xy.x = aw ? ax + a.w + xy.x : ax - xy.x, xy.y)
			}
			if (base == zone)
				by = xy.y
			else if ((r = Row(a.parent)) == zb.parent)
			{
				ax = xy.x
				if (ax == a.x + aq)
					xys.push(ax -= S + S, xy.y)
				if (r.datum(i = r.getChildIndex(a) - 1) == zb && base == zb)
					xys.push(ax, by)
				else
					xys.push(ax, ay = r.top + r.h + S + SS * bx / r.w, bx, ay)
			}
			else
			{
				ax = xy.x, ay = r.top - S - SS * a.x / zone.w
				xys.push(ax, ay)
				i = zone.getChildIndex(r)
				while ((r = zone.rowAt(--i)) != zb.parent)
				{
					var x:int = r.searchDatumX(ax)
					if (x >= 0 && ax > (d = r.datumAt(x)).x - S && ax < d.x + d.w + S)
						if (ax < d.x + d.w / 2)
							ax = d.x - S - S * ax / zone.w
						else
							ax = d.x + d.w + S + S * ax / zone.w
					xys.push(ax, ay)
					xys.push(ax, ay = r.top - S - SS * ax / zone.w)
				}
				if (Math.abs(ax - bx) > 2)
					xys.push(bx, ay)
			}
			xys.push(bx, by)
		}
		Util.line(g, 2, err ? yield ? 0xffbbbb : 0xff3333 : yield ? 0xaaaaaa : 0x555555)
		g.moveTo(xys[0], xys[1])
		for (var i:int = 2; i < xys.length; )
			g.lineTo(xys[i++], xys[i++])
	}

	override function hover(x:int, y:int):void
	{
		var g:flash.display.Graphics = edit.hover.graphics
		g.clear()
		Util.line(g, 3, err ? yield ? 0xff6666 : 0xff0000 : yield ? 0x77ee77 : 0x66cc66)
		g.moveTo(xys[0], xys[1])
		for (var i:int = 2; i < xys.length; )
			g.lineTo(xys[i++], xys[i++])
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
		var g:flash.display.Graphics = edit.keying.graphics
		g.clear()
		Util.line(g, 3, err ? yield ? 0xff6666 : 0xff0000 : yield ? 0x449944 : 0x8800)
		g.moveTo(xys[0], xys[1])
		for (var i:int = 2; i < xys.length; )
			g.lineTo(xys[i++], xys[i++])
		edit.keying.x = xy.x, edit.keying.y = xy.y
	}

////////////////////////////////      ////////////////////////////////
//////////////////////////////// edit ////////////////////////////////
////////////////////////////////      ////////////////////////////////

	override function key(k:int, c:int, shift:Boolean, ctrl:Boolean)
	{
		var x:int
		if (k == 90) // z
			return edit.keyin(zone)
		if (c == 123) // {
			return edit.keyin(base)
		if (c == 125) // }
			return edit.keyin(agent)
		if (c == 91) // [
			for (x = agent.bs.indexOf(this); (x = (x + 1) % agent.bs.length) || true;)
				if (agent.bs[x].visible)
					return edit.keyin(agent.bs[x])
		if (c == 93) // ]
			for (x = base.As.indexOf(this); (x = (x + 1) % base.As.length) || true;)
				if (base.As[x].visible)
					return edit.keyin(base.As[x])

		if (zone.layer2)
			return
		if (yield)
			return k == 89 && !ctrl && edit.com.nonyieldWire() // y

		if (k == 8 || k == 46) // backspace or delete
			return edit.com.removeWire()
		if (k == 65 || k == 66) // a b
			return edit.dragStart(k, c, shift, ctrl)
	}

	override function draging(drag:Shape, state:int,
		k:int, c:int, shift:Boolean, ctrl:Boolean)
	{
		if (yield || zone.layer2)
			return state > 0 || edit.dragStop()
		if (state < 0 && k == 0 || k == 65) // a
			dragMode = 0
		else if (k == 66) // b
			dragMode = 1
		if (dragMode == 1)
			dragingBase(drag, state)
		else
			dragingAgent(drag, state)
	}

	function dragingBase(drag:Shape, state:int):void
	{
		var g:flash.display.Graphics = drag.graphics,
			x:Number = agent.mouseX, y:Number = agent.mouseY,
			x0:Number = x <= agent.w / 2 ? -x : agent.w - x, y0:Number = -y,
			hit:Datum = edit.hit as Datum
		g.clear()
		Util.line(g, 1, 0, 0.5)
		g.lineTo(x0, y0)
		if (hit && hit != agent && !hit.yield)
		{
			Util.line(g, NaN, 0)
			g.beginFill(0)
			g.moveTo(x0, y0), g.lineTo(x0 + 5, y0 - 10)
			g.lineTo(x0 - 5, y0 - 10), g.lineTo(x0, y0)
			g.endFill()
			state > 0 && edit.com.moveBase(hit)
			return
		}
		Util.line(g, 2, 0)
		g.moveTo(-7.5, -8.5), g.lineTo(8.5, 7.5)
		g.moveTo(8.5, -8.5), g.lineTo(-7.5, 7.5)
	}

	function dragingAgent(drag:Shape, state:int):void
	{
		var g:flash.display.Graphics = drag.graphics,
			x:Number = base.mouseX, y:Number = base.mouseY,
			x0:Number = x <= base.w / 2 ? -x : base.w - x, y0:Number = base.h - y,
			hit:Datum = edit.hit as Datum
		g.clear()
		Util.line(g, 1, 0, 0.5)
		g.lineTo(x0, y0)
		if (hit && hit != base && !hit.yield)
		{
			Util.line(g, NaN, 0)
			g.beginFill(0)
			g.moveTo(0, 0), g.lineTo(5, -10)
			g.lineTo(-5, -10), g.lineTo(0, 0)
			g.endFill()
			state > 0 && edit.com.moveAgent(hit)
			return
		}
		Util.line(g, 2, 0)
		g.moveTo(-7.5, -8.5), g.lineTo(8.5, 7.5)
		g.moveTo(8.5, -8.5), g.lineTo(-7.5, 7.5)
	}

////////////////////////////////           ////////////////////////////////
//////////////////////////////// load save ////////////////////////////////
////////////////////////////////           ////////////////////////////////

	function save(str:IDataOutput):void
	{
		base.saveDatum(str, zone)
		agent.saveDatum(str, zone)
	}

	function load(str:IDataInput, z:Datum):void
	{
		var b:Datum = z.loadDatum(str), a:Datum = z.loadDatum(str)
		if (b == a)
			throw 'invalid wire'
		if (b.agent(this, a))
			throw 'duplicate wire'
	}

////////////////////////////////         ////////////////////////////////
//////////////////////////////// compile ////////////////////////////////
////////////////////////////////         ////////////////////////////////

	function compile1()
	{
		err != (err = error1()) && (edit.refresh = refresh = true)
		err && (edit.error = 1)
	}

	private function error1():String
	{
		if (base.tv > 0 || base.zv)
			return 'base must not be veto or inside'
		if (agent.tv > 0 || agent.zv)
			return 'agent must not be veto or inside'
		var bz:Datum = base.bzer, az:Datum = agent.azer, a:Datum, z:Datum
		if (base != zone && bz != zb)
			return "base or base zoner's zone must be wire zone"
		if (az.deep <= zone.deep)
			return 'agent zoner must be inside wire zone'
		if (base != zone && zb.el >= za.el)
			return 'must wire early to later'
		if ( !zone.gene)
			if (base != zone && !base.io)
				return 'wire inside agent must have input or output base'
			else if ( !agent.io)
				return 'wire inside agent must have input or output agent'
		for (a = az.zone; a != zone; a = a.zone)
			if (a.io < 0)
				return 'wire must not cross input edge'
		for (a = az.zone; a != zone; a = z, z = z.zone)
			if (z = a.zone, !a.gene && z.gene)
				return 'wire must not cross agent edge from gene'
		return ''
	}
}
}
