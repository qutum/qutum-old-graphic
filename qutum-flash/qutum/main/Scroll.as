//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.main
{
import flash.display.GradientType;
import flash.events.Event;
import flash.events.MouseEvent;
import flash.geom.Matrix;


public class Scroll extends Widget
{
	public var pos:int
	/** viewable len, <= 32767 */
	public var len:int
	/** total len, <= 32767 */
	public var cap:int

	public var hori:Boolean = false
	var bar:Widget
	var last:int
	var over:Boolean
	var dragX:int = -1, dragY:int
	var lastX:int, lastY:int

	static const BACKL:uint = 0xcac6c1
	static const BACK:uint = 0xede9e3
	static const BARL:uint = 0x6699cc
	static const BARG:Array = [0xcce6ff, 0xa6d3ff, 0x80c0ff, 0xa6d3ff]
	static const OVERL:uint = 0x88aacc
	static const OVERG:Array = [0xe0f0ff, 0xcce6ff, 0x99ccff, 0xcce6ff]
	static const RATIO:Array = [0, 115, 140, 255]

	public function Scroll(father:Widget, hori_:Boolean)
	{
		father.add(this)
		hori = hori_
		add(bar = new Widget())
		attach(Event.RESIZE, show)
		bar.attach(MouseEvent.MOUSE_OVER, draw)
		bar.attach(MouseEvent.MOUSE_OUT, draw)
		bar.attach(MouseEvent.MOUSE_DOWN, down)
		stage.addEventListener(MouseEvent.MOUSE_UP, up, false, 0, true)
	}

	public function change(p:int, l:int, c:int):void
	{
		cap = Math.max(0, c)
		len = Math.max(0, l)
		pos = Math.max(0, Math.min(p, cap - len))
		pos != p && dispatch(Eventy.SCROLL, null, true)
		draw()
	}

	private function show(e = null)
	{
		var g:flash.display.Graphics = graphics
		g.clear()
		Util.line(g, 1, BACKL)
		g.beginFill(BACK)
		g.drawRect(0.5, 0.5, Width - 1, Height - 1)
		g.endFill()
		draw()
	}

	private function draw(e:MouseEvent = null)
	{
		var c:int = hori ? Width : Height,
			l:int = len >= cap ? c : Math.max(c * len / cap, 40),
			p:int = len >= cap ? 0 : pos * (c - l) / (cap - len),
			w:int = hori ? l : Width, h:int = hori ? Height : l
		hori ? (bar.x = p) : (bar.y = p)
		e && (over = e.type == MouseEvent.MOUSE_OVER)
		var g:flash.display.Graphics = bar.graphics, m:Matrix = new Matrix
		g.clear()
		m.createGradientBox(w, h - 2, hori ? Math.PI / 2 : 0, 0, 1)
		g.beginGradientFill(GradientType.LINEAR, over || dragX >= 0 ? OVERG : BARG,
			null, RATIO, m)
		Util.line(g, 1, over || dragX >= 0 ? OVERL : BARL)
		g.drawRect(0.5, 0.5, w - 1, h - 1)
		g.endFill()
	}

	private function down(e:MouseEvent)
	{
		if (dragX < 0)
			dragX = e.localX, dragY = e.localY,
			lastX = mouseX, lastY = mouseY,
			attach(Event.ENTER_FRAME, move)
	}

	private function up(e)
	{
		if (dragX >= 0)
			dragX = -1, draw(),
			detach(Event.ENTER_FRAME, move)
	}

	private function move(e = null)
	{
		if ((lastX - (lastX = mouseX) | lastY - (lastY = mouseY)) == 0)
			return
		dragX > bar.width && (dragX = bar.width)
		dragY > bar.height && (dragY = bar.height)
		var p:int = hori ?
			bar.x = Util.bound(lastX - dragX, 0, width - bar.width) :
			bar.y = Util.bound(lastY - dragY, 0, height - bar.height)
		var c:int = hori ? width : height,
			l:int = len >= cap ? c : Math.max(c * len / cap, 40)
		p = len >= cap ? 0 : p * (cap - len) / (c - l)
		pos = p
		dispatch(Eventy.SCROLL, null, true)
	}
}
}
