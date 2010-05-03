//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.main
{
import flash.display.DisplayObjectContainer;
import flash.display.InteractiveObject;
import flash.display.Shape;
import flash.events.Event;
import flash.events.KeyboardEvent;
import flash.geom.Rectangle;


public final class Info extends Widget
{
	public var body:Text
	var head:Bar, foot:Bar
	var center:Boolean = true
	var off:InteractiveObject, offMouse:Boolean, offMouses:Boolean
	var keyOff:Widget

	Shape // for mxml bug on Graphics

	public function Info(parent:DisplayObjectContainer, title:String,
		disable:InteractiveObject = null, wrapBodyTitle:Boolean = false)
	{
		parent.addChild(this)
		var t:Text = new Text().str(title).selectMode()
		head = new Bar(this, 28, t.width)
		head.xy(1, 1).add(t)
		add(body = new Text().selectMode())
		body.xy(6, 32)
		foot = new Bar(this, 29, 0, 2)

		attach(Event.RESIZE, resize)
		if (wrapBodyTitle)
			body.size(420, 100, true).str(title), resize()
		if ((off = disable))
		{
			offMouse = off.mouseEnabled, off.mouseEnabled = false
			off is DisplayObjectContainer &&
				(offMouses = DisplayObjectContainer(off).mouseChildren,
				DisplayObjectContainer(off).mouseChildren = false),
			event(4)
			attach(KeyboardEvent.KEY_DOWN, keyStop)
			attach(KeyboardEvent.KEY_UP, keyStop)
		}
		keyOff = Keyon
	}

	public function close(e = null):Info
	{
		if (off)
		{
			off.mouseEnabled = offMouse
			off is DisplayObjectContainer
				&& (DisplayObjectContainer(off).mouseChildren = offMouses)
			event(0)
		}
		head.close()
		foot.close()
		keyOff && keyOff.keyon()
		e is Event && dispatch(e.target.name)
		parent.removeChild(this)
		return this
	}

	public function addOk(enter:Boolean = true, esc = null, close:Boolean = true):Info
	{
		foot.item(Eventy.OK, new Text().style(enter).add('OK'),
			close ? this.close : null, enter ? 13 : 0, (esc == null ? enter : esc) ? 27 : 0)
		resize()
		return this
	}

	public function addYes(enter:Boolean = true, esc = null, close:Boolean = true):Info
	{
		foot.item(Eventy.OK, new Text().style(enter).add('Yes'),
			close ? this.close : null, enter ? 13 : 0, (esc == null ? enter : esc) ? 27 : 0)
		resize()
		return this
	}

	public function addNo(enter:Boolean = true, esc = null, close:Boolean = true):Info
	{
		foot.item(Eventy.NO, new Text().style(enter).add('No'),
			close ? this.close : null, enter ? 13 : 0, (esc == null ? enter : esc) ? 27 : 0)
		resize()
		return this
	}

	public function addCancel(enter:Boolean = true, esc = null, close:Boolean = true):Info
	{
		foot.item(Eventy.CANCEL, new Text().style(enter).add('Cancel'),
			close ? this.close : null, enter ? 13 : 0, (esc == null ? enter : esc) ? 27 : 0)
		resize()
		return this
	}

	private function resize(e = null)
	{
		for (var x:int = foot.numChildren - 1; x >= 0; x--)
			foot.widgetAt(x).rightNext()
		var g:flash.display.Graphics = graphics,
			r:Rectangle = scrollRect || new Rectangle,
			w:Number = Math.max(r.width, body.width + 12, foot.width + 2, 200),
			h:Number = Math.max(r.height, body.height + 6 + 28 + 29, 120)
		r.width = w, r.height = h, scrollRect = r
		g.clear()
		g.beginFill(0xfffffa)
		g.drawRect(0, 0, w, h)
		g.endFill()
		Util.line(g, 1, 0x6699cc)
		g.drawRect(0.5, 0.5, w - 1, h - 1)
		head.size(w - 2, 28)
		foot.xy(1, h - 1 - 29)
		if (w - 2 != foot.Width)
		{
			foot.size(w - 2, 29)
			for (x = foot.numChildren - 1; x >= 0; x--)
				foot.widgetAt(x).rightNext()
		}
		if (center)
			xy(parent.width - w >> 1, parent.height - h >> 1)
	}
}
}
