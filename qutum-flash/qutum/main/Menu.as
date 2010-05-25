//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.main
{
import flash.display.DisplayObject;
import flash.display.Shape;
import flash.events.MouseEvent;
import flash.geom.Point;


public final class Menu extends Bar
{
	[Embed(source='/embed/qutum.png')]
	static const Logo:Class

	public static const H:Number = 29
	static const OVERL:uint = 0x88aacc
	static const DOWNL:uint = 0x6699cc

	var tip:Text, tx:Number
	var unsave:Text, file:Text

	public function Menu(father:Widget)
	{
		super(father, H, 0, 0)
		text(Eventy.NEW, 'New', 'New file', 'F2', 2, 38)
		text(Eventy.LOAD, 'Load', 'Load file', 'F3', 3)
		text(Eventy.SAVE, 'Save', 'Save file', 'F4', 4)
		text(Eventy.RUN, 'Run', 'Run', 'F10', 10)
		undo(), redo(), unfocus(), refocus()
		zone(), nextUnity(), nextBase(), nextAgent()
		unfold(), unfolds(), fold()
		add(unsave = new Text().selectOn(false)), unsave.leftPrev(12)
		add(file = new Text().selectMode()), file.leftPrev(8)

		stage.addChild(tip = new Text().selectOn(false).color(0xfff8f8, 0))
		tip.mouseEnabled = tip.visible = false
		var p:Point = localParent()
		tip.y = p.y + H, tx = p.x
	}

	function text(name:String, text:String, tip_:String, key:String, fun:int, left:Number = 0)
	{
		Tip(item(name, new Text().add(text), null, fun && (111 + fun)).leftPrev(left),
			tip_, key)
	}

	function Item(i:DisplayObject, on:Function, tip_:String, key:String,
		left:Number = 0, w:Number = 26, h:Number = H)
	{
		var v:int = w - i.width >> 1
		Tip(item('', i, on, 0, 0, v, w - i.width - v, h - i.height >> 1, h).leftPrev(left),
			tip_, key)
	}

	private function Tip(i:Widget, tip_:String, key:String)
	{
		i.attach(MouseEvent.ROLL_OVER, mouse)
		i.attach(MouseEvent.ROLL_OUT, mouse)
		i.attach(MouseEvent.MOUSE_DOWN, mouse)
		function mouse(e:MouseEvent = null)
		{
			if (tip_ && e.type == MouseEvent.ROLL_OVER)
				tip.style(true).str(tip_).style(false).add('\n  Key: ', key),
				tip.x = tx + i.x + 1,
				tip.visible = true
			else
				tip.visible = false
		}
	}

	private function undo(e = null)
	{
		if (e)
			return keyed(0, 37, false, true)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0x774400), g.moveTo(10, 1), g.lineTo(1, 7), g.lineTo(10, 13)
		Item(p, undo, 'Undo', 'Ctrl Left or Ctrl z', 8)
	}

	private function redo(e = null)
	{
		if (e)
			return keyed(0, 39, false, true)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0x774400), g.moveTo(1, 1), g.lineTo(10, 7), g.lineTo(1, 13)
		Item(p, redo, 'Redo', 'Ctrl Right or Ctrl y or Shift Ctrl z')
	}

	private function unfocus(e = null)
	{
		if (e)
			return keyed(0, 38, false, true)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0x774400), g.moveTo(1, 7), g.lineTo(7, 1), g.lineTo(13, 7)
		Item(p, unfocus, 'Previous focus', 'Ctrl Up')
	}

	private function refocus(e = null)
	{
		if (e)
			return keyed(0, 40, false, true)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0x774400), g.moveTo(1, 1), g.lineTo(7, 7), g.lineTo(13, 1)
		Item(p, refocus, 'Next focus', 'Ctrl Down')
	}

	private function zone(e = null)
	{
		if (e)
			return keyed(122, 90)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0), g.drawRect(1, 1, 14, 14)
		Util.line(g, 1, 0), g.drawRect(4.5, 4.5, 7, 7)
		Item(p, zone, 'Zone', 'z', 8)
	}

	private function nextUnity(e = null)
	{
		if (e)
			return keyed(186, 59)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0)
		g.moveTo(10, 5), g.lineTo(10, 1), g.lineTo(1, 1), g.lineTo(1, 10), g.lineTo(6, 10)
		Util.line(g, 2, 0), g.drawRect(6, 6, 9, 9)
		Item(p, nextUnity, 'Next Unity', ';')
	}

	private function nextBase(e = null)
	{
		if (e)
			return keyed(91, 219)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0)
		g.moveTo(1, 0), g.lineTo(1, 8), g.moveTo(12, 0), g.lineTo(12, 8)
		Util.line(g, 1, 0x66dd)
		g.moveTo(0.5, 15), g.lineTo(0.5, 8.5), g.lineTo(12.5, 8.5), g.lineTo(12.5, 15)
		Item(p, nextBase, 'Next Base', '[')
	}

	private function nextAgent(e = null)
	{
		if (e)
			return keyed(93, 221)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 1, 0x6600dd)
		g.moveTo(0.5, 0), g.lineTo(0.5, 6.5), g.lineTo(12, 6.5), g.lineTo(12, 0)
		Util.line(g, 2, 0)
		g.moveTo(1, 15), g.lineTo(1, 7), g.moveTo(12, 15), g.lineTo(12, 7)
		Item(p, nextAgent, 'Next Agent', ']')
	}

	private function unfold(e:MouseEvent = null)
	{
		if (e)
			return keyed(43, 187)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 1, 0), g.drawRect(0.5, 0.5, 12, 12)
		g.moveTo(3, 6.5), g.lineTo(10, 6.5), g.moveTo(6.5, 3), g.lineTo(6.5, 10)
		Item(p, unfold, 'Unfold', '+ or =')
	}

	private function unfolds(e:MouseEvent = null)
	{
		if (e)
			return keyed(43, 187, true)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 2, 0), g.drawRect(1, 1, 12, 12)
		g.moveTo(3, 7), g.lineTo(11, 7), g.moveTo(7, 3), g.lineTo(7, 11)
		Item(p, unfolds, 'Unfold deeply', 'Shift +')
	}

	private function fold(e = null)
	{
		if (e)
			return keyed(45, 189)
		var p:Shape = new Shape, g:flash.display.Graphics = p.graphics
		Util.line(g, 1, 0), g.drawRect(0.5, 0.5, 12, 12)
		g.moveTo(3, 6.5), g.lineTo(10, 6.5)
		Item(p, fold, 'Fold', '- or _')
	}
}
}
