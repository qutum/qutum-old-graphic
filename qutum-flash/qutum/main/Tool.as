//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.main
{
import flash.display.DisplayObject;
import flash.display.GradientType;
import flash.display.Shape;
import flash.events.MouseEvent;
import flash.geom.Matrix;
import flash.geom.Point;


public final class Tool extends Bar
{
	[Embed(source='/embed/qutum.png')]
	static const Logo:Class

	public static const W:Number = 32

	var tip:Text, ty:Number

	public function Tool(father:Widget)
	{
		super(father, 0, W, 0)
		logo()
		zInput(), zDatum(), zOutput()
		input(), datum(), output()
		namey(), trial(), veto(), unity(), base(), agent()
		Remove(), removeBefore(), breakRow(), unyield()

		stage.addChild(tip = new Text().selectOn(false).color(0xfff8f8, 0))
		tip.mouseEnabled = tip.visible = false
		var p:Point = localParent()
		tip.x = p.x + W, ty = p.y
	}

	override function background(e = null)
	{
		var g:flash.display.Graphics = graphics, m:Matrix = new Matrix
		m.createGradientBox((W + W) / 3, 100, 0, W / 3, 0)
		g.beginGradientFill(GradientType.LINEAR, Bar.BACK, null, null, m)
		g.moveTo(0, 0), g.lineTo(0, Height),
		g.lineTo(W, Height), g.lineTo(W, Menu.H)
		g.endFill()
	}

	function Item(i:DisplayObject, on:Function, tip_:String, key:String,
		top:Number = 0, w:Number = W, h:Number = 26)
	{
		var v:int = w - i.width >> 1
		i = item('', i, on, 0, 0, v, w - i.width - v, h - i.height >> 1, h).topPrev(top)
			.attach(MouseEvent.ROLL_OVER, mouse)
			.attach(MouseEvent.ROLL_OUT, mouse)
			.attach(MouseEvent.MOUSE_DOWN, mouse)
		function mouse(e:MouseEvent = null)
		{
			if (tip_ && e.type == MouseEvent.ROLL_OVER)
				tip.style(true).str(tip_).style(false).add('\n  Key: ', key),
				tip.y = ty + i.y + 1,
				tip.visible = true
			else
				tip.visible = false
		}
	}

	private function logo(e = null)
	{
		if (e)
			Main.web()
		else
		{
			var i:Widget = new Widget().add(new Logo).attach(MouseEvent.CLICK, logo)
			i.xy(W - i.width >> 1, Menu.H - i.height >> 1)
			add(i)
		}
	}

	private function zInput(e = null)
	{
		if (e)
			return keyed(105, 73)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0x6600dd), g.moveTo(0, 1), g.lineTo(16, 1), g.drawRect(3, 1, 10, 9)
		Item(p, zInput, 'Add sibling Input', 'i', 14)
	}

	private function zDatum(e = null)
	{
		if (e)
			return keyed(100, 68)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0x8800), g.drawRect(1, 1, 10, 10)
		Item(p, zDatum, 'Add sibling Datum', 'd')
	}

	private function zOutput(e = null)
	{
		if (e)
			return keyed(111, 79)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0x66dd), g.moveTo(0, 10), g.lineTo(16, 10), g.drawRect(3, 1, 10, 9)
		Item(p, zOutput, 'Add sibling Output', 'o')
	}

	private function input(e = null)
	{
		if (e)
			return keyed(73, 73, true)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 1, 0x6600dd), g.drawRect(0.5, 0.5, 16, 14)
		Util.line(g, 2, 0x6600dd), g.drawRect(4, 1, 9, 9)
		Item(p, input, 'Add inner Input', 'Shift i')
	}

	private function datum(e = null)
	{
		if (e)
			return keyed(68, 68, true)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 1, 0x8800), g.drawRect(0.5, 0.5, 16, 16)
		Util.line(g, 2, 0x8800), g.drawRect(4, 4, 9, 9)
		Item(p, datum, 'Add inner Datum', 'Shift d')
	}

	private function output(e = null)
	{
		if (e)
			return keyed(79, 79, true)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 1, 0x66dd), g.drawRect(0.5, 0.5, 16, 14)
		Util.line(g, 2, 0x66dd), g.drawRect(4, 5, 9, 9)
		Item(p, output, 'Add inner Output', 'Shift o')
	}

	private function namey(e = null)
	{
		if (e)
			return keyed(0, 13)
		Item(new Text().color(NaN, NaN, 0x553300).style(true).add('Q').size(18, 28),
			namey, 'Change name', 'Enter', 10)
	}

	private function trial(e = null)
	{
		if (e)
			return keyed(116, 84)
		Item(new Text().color(NaN, NaN, 0x553300).style(true).add('?').size(14, 28),
			trial, 'Be Trial or not', 't or ?')
	}

	private function veto(e = null)
	{
		if (e)
			return keyed(118, 86)
		Item(new Text().color(NaN, NaN, 0x553300).style(true).add('!').size(12, 28),
			veto, 'Be Veto or not', 'v or !')
	}

	private function unity(e = null)
	{
		if (e)
			return keyed(117, 85)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0x6600dd)
		g.moveTo(10, 5), g.lineTo(10, 1), g.lineTo(1, 1), g.lineTo(1, 10), g.lineTo(6, 10)
		Util.line(g, 2, 0x66dd), g.drawRect(6, 6, 9, 9)
		Item(p, unity, 'As Unity of, both Input or Output with name', 'u')
	}

	private function base(e = null)
	{
		if (e)
			return keyed(98, 66)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		g.beginFill(0x774400)
		g.moveTo(0, 0), g.lineTo(14, 0), g.lineTo(7, 7), g.lineTo(0, 0)
		g.endFill()
		Util.line(g, 2, 0x774400), g.moveTo(7, 6), g.lineTo(7, 14)
		Item(p, base, 'Add or change Base', 'b')
	}

	private function agent(e = null)
	{
		if (e)
			return keyed(97, 65)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		g.beginFill(0x774400)
		g.moveTo(0, 7), g.lineTo(14, 7), g.lineTo(7, 14), g.lineTo(0, 7)
		g.endFill()
		Util.line(g, 2, 0x774400), g.moveTo(7, 0), g.lineTo(7, 8)
		Item(p, agent, 'Add or change Agent', 'a')
	}

	private function Remove(e = null)
	{
		if (e)
			return keyed(0, 46)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0x8800), g.drawRect(3, 3, 9, 9)
		Util.line(g, 2, 0xa00000)
		g.moveTo(1, 1), g.lineTo(14, 14), g.moveTo(14, 1), g.lineTo(1, 14)
		Item(p, Remove, 'Remove self', 'Del', 10)
	}

	private function removeBefore(e = null)
	{
		if (e)
			return keyed(0, 8)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0x8800),
		g.moveTo(15, 3), g.lineTo(10, 3), g.lineTo(10, 12), g.lineTo(15, 12)
		Util.line(g, 2, 0xa00000)
		g.moveTo(1, 1), g.lineTo(8, 14), g.moveTo(8, 1), g.lineTo(1, 14)
		Item(p, removeBefore, 'Remove previous', 'Backspace')
	}

	private function breakRow(e = null)
	{
		if (e)
			return keyed(0, 13, true)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0x8800)
		g.moveTo(1, 1), g.lineTo(1, 6), g.lineTo(12, 6), g.lineTo(12, 1)
		g.moveTo(1, 15), g.lineTo(1, 10), g.lineTo(12, 10), g.lineTo(12, 15)
		Item(p, breakRow, 'Break a row', 'Shift Enter')
	}

	private function unyield(e = null)
	{
		if (e)
			return keyed(121, 89)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 1, 0x8800)
		g.moveTo(9.5, 4), g.lineTo(9.5, 0.5), g.lineTo(0.5, 0.5)
		g.moveTo(0.5, 4), g.lineTo(0.5, 9.5), g.lineTo(4, 9.5)
		Util.line(g, 2, 0x8800), g.drawRect(5, 5, 9, 9)
		Item(p, unyield, 'Be not Yield', 'y')
	}
}
}