//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.main
{
import flash.display.DisplayObject;
import flash.display.Sprite;
import flash.display.Stage;
import flash.events.Event;
import flash.events.EventPhase;
import flash.events.KeyboardEvent;
import flash.events.MouseEvent;
import flash.geom.Point;
import flash.geom.Rectangle;


public class Widget extends Sprite
{
	public final function get father():Widget
	{
		return Widget(parent)
	}

	public function naming(v:String):Widget
	{
		name = v
		return this
	}

	public final function xy(x_:Number, y_:Number):Widget
	{
		x = x_, y = y_
		return this
	}

	public final function leftPrev(margin:Number = 0):Widget
	{
		var i:int = parent.getChildIndex(this) - 1, p:DisplayObject, r:Rectangle
		if (i >= 0)
			p = parent.getChildAt(i), r = p.scrollRect,
			x = margin + p.x + (r ? r.width : p.width)
		else
			x = margin
		return this
	}

	public final function rightNext(margin:Number = 0):Widget
	{
		var i:int = parent.getChildIndex(this) + 1, r:Rectangle
		if (i < parent.numChildren)
			r = scrollRect,
			x = parent.getChildAt(i).x - margin - Width
		else
			r = parent.scrollRect,
			x = (r ? r.width : parent.width) - margin - Width
		return this
	}

	public final function topPrev(margin:Number = 0):Widget
	{
		var i:int = parent.getChildIndex(this) - 1, p:DisplayObject, r:Rectangle
		if (i >= 0)
			p = parent.getChildAt(i), r = p.scrollRect,
			y = margin + p.y + (r ? r.height : p.height)
		else
			y = margin
		return this
	}

	public final function bottomPrev(margin:Number = 0):Widget
	{
		var i:int = parent.getChildIndex(this) + 1, r:Rectangle
		if (i < parent.numChildren)
			r = scrollRect,
			y = parent.getChildAt(i).y - margin - Height
		else
			r = parent.scrollRect,
			y = (r ? r.height : parent.height) - margin - Height
		return this
	}

	/** disptach Event.RESIZE */
	public final function size(w:Number, h:Number):Widget
	{
		var r:Rectangle = scrollRect || new Rectangle
		r.width = Math.max(w, 0), r.height = Math.max(h, 0)
		scrollRect = r
		dispatch(Event.RESIZE)
		return this
	}

	public final function scroll(x:Number, y:Number):Widget
	{
		var r:Rectangle = scrollRect || new Rectangle
		x == x && (r.x = x) // not NaN
		y == y && (r.y = y) // not NaN
		scrollRect = r
		return this
	}

	public final function scrollDelta(x:Number, y:Number):Widget
	{
		if (x || y)
		{
			var r:Rectangle = scrollRect || new Rectangle
			r.x += x, r.y += y
			scrollRect = r
		}
		return this
	}

	/** disptach Event.RESIZE */
	public final function scrollSize(x:Number, y:Number, w:Number, h:Number):Widget
	{
		var r:Rectangle = scrollRect || new Rectangle
		r.x = x, r.y = y, r.width = Math.max(w, 0), r.height = Math.max(h, 0)
		scrollRect = r
		dispatch(Event.RESIZE)
		return this
	}

	/** disptach Event.RESIZE */
	public final function scrollBound(x:Number, y:Number, right:Number, bottom:Number):Widget
	{
		return scrollSize(x, y, right - x, bottom - y)
	}

	public final function get Width():Number
	{
		var r:Rectangle = scrollRect
		return r ? r.width : width
	}

	public final function get Height():Number
	{
		var r:Rectangle = scrollRect
		return r ? r.height : height
	}

	/** @parm button 0: no button, >0: button with hand, <0: button without hand */
	public final function button(button:int = 1):Widget
	{
		buttonMode = button != 0
		useHandCursor = button > 0
		return this
	}

	public override final function set visible(v:Boolean):void
	{
		(super.visible = v) || KEY != this || setKeyon(this, true, false)
	}

	public final function add(...os):Widget
	{
		for each (var o in os)
			o is DisplayObject && addChild(o)
		return this
	}

	public final function addBefore(o:DisplayObject, x:int):Widget
	{
		if (x <= 0 || x >= numChildren || o.parent != this)
			return addChildAt(o, x), this
		var before:DisplayObject = getChildAt(x)
		addChildAt(o, x)
		if (getChildAt(x - 1) == before) // o is before x
			swapChildrenAt(x - 1, x)
		return this
	}

	public final function remove(...os):Widget
	{
		for each (var o in os)
			o is DisplayObject && removeChild(o)
		return this
	}

	public final function removeAll():Widget
	{
		for (var i:int = numChildren - 1; i >= 0; i--)
			removeChildAt(i)
		return this
	}

	public final function childAt(i:int):DisplayObject
	{
		return i >= 0 && i < numChildren ? getChildAt(i) : null
	}

	public final function widgetAt(i:int):Widget
	{
		return i >= 0 && i < numChildren ? Widget(getChildAt(i)) : null
	}

	public final function getWidget(i:int):Widget
	{
		return Widget(getChildAt(i))
	}

	/** @param phase 0: target, 1: capture, 2: target and bubble, 3: all */
	public final function attach(name:String, on:Function, args:Array = null,
		phase:int = 2, weak:Boolean = false):Widget
	{
		var o:Function
		if (phase == 0)
			o = function (e:Event)
			{
				if (e.eventPhase == EventPhase.AT_TARGET)
					args ? on.apply(this, args) : on.call(this, e)
			}
		else
			o = args ? function (e) { on.apply(this, args) } : on
		phase & 1 && addEventListener(name, o, true, 0, weak)
		phase != 1 && addEventListener(name, o, false, 0, weak)
		return this
	}

	/**
	 * attach and run only once.
	 * @param phase 0: target, 1: capture, 2: target and bubble, 3: all
	 */
	public final function attachOnce(name:String, on:Function, args:Array = null,
		phase:int = 2, weak:Boolean = false):Widget
	{
		var o:Function = function (e:Event)
		{
			if (phase || e.eventPhase == EventPhase.AT_TARGET)
				detach(name, o, phase), args ? on.apply(this, args) : on.call(this, e)
		}
		phase & 1 && addEventListener(name, o, true, 0, weak)
		phase != 1 && addEventListener(name, o, false, 0, weak)
		return this
	}

	/** @param phase 0: target, 1: capture, 2: target and bubble, 3: all */
	public final function detach(name:String, on:Function, phase:int = 2):Widget
	{
		phase & 1 && removeEventListener(name, on, true)
		phase != 1 && removeEventListener(name, on)
		return this
	}

	public final function dispatch(name:String, keyValues:Object = null,
		bubble:Boolean = false):Boolean
	{
		var e:Eventy = new Eventy(name, bubble)
		if (keyValues)
			for (var k in keyValues)
				e[k] = keyValues[k]
		return dispatchEvent(e)
	}

	/** fix standalone player bug on Event.ACTIVATE */
	protected final function fixActivate():void
	{
		addEventListener(Event.ACTIVATE, fixingActivate, false, 0x7fffff)
		stage.addEventListener(MouseEvent.MOUSE_DOWN, fixingActivate, true, 0x7fffff)
		stage.addEventListener(KeyboardEvent.KEY_DOWN, fixingActivate, true, 0x7fffff)
	}

	private function fixingActivate(e:Event):void
	{
		if (e.type != Event.ACTIVATE)
			dispatchEvent(new Event(Event.ACTIVATE))
		removeEventListener(Event.ACTIVATE, fixingActivate)
		stage.removeEventListener(MouseEvent.MOUSE_DOWN, fixingActivate, true)
		stage.removeEventListener(KeyboardEvent.KEY_DOWN, fixingActivate, true)
	}

	public final function focus(direct:Object = true):Widget
	{
		if (stage)
			direct || Boolean(stage.focus = null), // mxmlc bug
			stage.focus = this
		return this
	}

	public function keyon(e:Object = false):Widget
	{
		setKeyon(this, false, e)
		return this
	}

	/**
	 * @param key got event when 0: focus, 1: focus bubble or keyon unbubble,
	 * 				2: 1 and mouse click to keyon(), 3: focus bubble or all unbubble
	 *              >3: 3 and higher priority
	 */
	public final function event(key_:int = -1, mouse = null, mouseChild = null,
		tab = null, tabChild = null):Widget
	{
		if (key_ >= 0 && key_ != key)
			if (!stage)
				throw new ArgumentError('out of Stage')
			else if ((key = key_) >= 3)
			{
				stage.addEventListener(KeyboardEvent.KEY_DOWN, key3, false, key - 3, true)
				stage.addEventListener(KeyboardEvent.KEY_UP, key3, false, key - 3, true)
				detach(MouseEvent.MOUSE_DOWN, mouseKeyon)
				if (KEY3)
					stage.addEventListener(KeyboardEvent.KEY_DOWN, keyable, false, 1<<31),
					stage.addEventListener(KeyboardEvent.KEY_UP, keyable, false, 1<<31),
					KEY3 = false
			}
			else if (key >= 1)
			{
				stage.removeEventListener(KeyboardEvent.KEY_UP, key3)
				stage.removeEventListener(KeyboardEvent.KEY_DOWN, key3)
				key == 2 ? attach(MouseEvent.MOUSE_DOWN, mouseKeyon)
					: detach(MouseEvent.MOUSE_DOWN, mouseKeyon)
				if (KEY1)
					stage.addEventListener(KeyboardEvent.KEY_DOWN, key1, false, 0, true),
					stage.addEventListener(KeyboardEvent.KEY_UP, key1, false, 0, true),
					KEY1 = false
			}
			else // disable key, set keyon to parent if needed
				stage.removeEventListener(KeyboardEvent.KEY_DOWN, key3),
				stage.removeEventListener(KeyboardEvent.KEY_UP, key3),
				detach(MouseEvent.MOUSE_DOWN, mouseKeyon)
				KEY == this && setKeyon(this, true, false)
		mouse == null || (mouseEnabled = Boolean(mouse))
		mouseChild == null || (mouseChildren = Boolean(mouseChild))
		tab == null || (tabEnabled = Boolean(tab))
		tabChild == null || (tabChildren = Boolean(tabChild))
		return this
	}

	/** stop current or next unfocus key event */
	public static function keyStop(e = null):void
	{
		KEYABLE = false
	}

	private static var KEY1:Boolean = true
	private static var KEY:Widget = null
	private static var KEY1K:Widget = null
	private static var KEY3:Boolean = true
	private static var KEYABLE:Boolean = true
	private var key:int = 0

	public static function get Keyon():Widget
	{
		return KEY
	}

	private static function setKeyon(k:Widget, forceUp:Boolean, forceEvent:Boolean):void
	{
		if (k && k.key <= 0 || forceUp)
			while ((k = k.parent as Widget) && k.key != 1 && k.key != 2)
				;
		if (KEY == k && !forceEvent)
			return
		var k0:Widget = KEY
		KEY = null
		k0 && !k0.dispatchEvent(new Eventy(Eventy.KEYOFF, true))
		|| (KEY = k) && k.dispatchEvent(new Eventy(Eventy.KEYON, true)) || (KEY = null)
	}

	private static function key1(e:KeyboardEvent)
	{
		KEY && KEYABLE && e.target is Stage // no focus
		&& KEY.dispatchEvent(new KeyboardEvent(e.type, false, false,
			e.charCode, e.keyCode, e.keyLocation, e.ctrlKey, e.altKey, e.shiftKey))
	}

	private function key3(e:KeyboardEvent)
	{
		e.target == this || KEYABLE
		&& dispatchEvent(new KeyboardEvent(e.type, false, false,
			e.charCode, e.keyCode, e.keyLocation, e.ctrlKey, e.altKey, e.shiftKey))
	}

	private static function keyable(e:KeyboardEvent)
	{
		KEYABLE = true
	}

	private function mouseKeyon(e:MouseEvent)
	{
		e.target == this && keyon()
	}

	/** ignore scroll, change the point */
	public final function localParent(p:DisplayObject = null, xy:Point = null):Point
	{
		xy || (xy = new Point(0, 0))
		p || (p = stage)
		for (var d:DisplayObject = this; d != p; d = d.parent)
			xy.x += d.x, xy.y += d.y
		return xy
	}
}
}
