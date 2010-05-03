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
import flash.events.Event;
import flash.events.KeyboardEvent;
import flash.events.MouseEvent;
import flash.geom.Matrix;


public class Bar extends Widget
{
	static const BACK:Array = [0xfffdfa, 0xe7e3dd]
	static const OVERG:Array = [0xeff7ff, 0xddeeff, 0xbbddff, 0xddeeff]
	static const DOWNG:Array = [0xe0f0ff, 0xcce6ff, 0x99ccff, 0xcce6ff]
	static const RATIO:Array = [0, 115, 140, 255]

	var keys:Array

	public function Bar(father:Widget, h:Number, w:Number = 0, priority:int = -1)
	{
		father.add(this)
		size(w, h)
		attach(Event.RESIZE, background)
		if (priority >= 0)
			keys = [],
			event(3 + priority),
			attach(KeyboardEvent.KEY_DOWN, key),
			attach(KeyboardEvent.KEY_UP, key)
	}

	public function item(name:String, i:DisplayObject,
		onClick:Function = null, onKey:int = 0, onKey2:int = 0,
		padL:Number = 4, padR:Number = 4, padT:Number = 1, h:Number = NaN):Widget
	{
		var o:Widget = new Widget().naming(name)
			.add(i)
			.event(-1, true, false)
			.size(i.width + padL + padR, h == h ? h : Height)
			.attach(MouseEvent.ROLL_OVER, pop)
			.attach(MouseEvent.ROLL_OUT, normal)
			.attach(MouseEvent.MOUSE_DOWN, push)
			.attach(MouseEvent.MOUSE_UP, pop)
			.attach(MouseEvent.CLICK, onClick || click)
		i.x = padL, i.y = padT
		add(o)
		onKey && (keys[onKey] = o)
		onKey2 && (keys[onKey2] = o)
		return normal(o)
	}

	public function close(e = null):Bar
	{
		keys && event(0)
		return this
	}

	function key(e:KeyboardEvent)
	{
		var o:Widget = keys[e.keyCode]
		if (o)
			if (e.type == KeyboardEvent.KEY_DOWN)
				push(o)
			else
				normal(o), o.dispatch(MouseEvent.CLICK)
	}

	function keyed(char:int, key:int, shift:Boolean = false, ctrl:Boolean = false)
	{
		stage.dispatchEvent(new KeyboardEvent(KeyboardEvent.KEY_DOWN, false, false,
			char, key, 0, ctrl, false, shift))
		stage.dispatchEvent(new KeyboardEvent(KeyboardEvent.KEY_UP, false, false,
			char, key, 0, ctrl, false, shift))
	}

	function background(e = null)
	{
		var g:flash.display.Graphics = graphics, m:Matrix = new Matrix,
			h:Number = Height
		g.clear()
		m.createGradientBox(100, (h + h) / 3, Math.PI / 2, 0, h / 3)
		g.beginGradientFill(GradientType.LINEAR, BACK, null, null, m)
		g.lineTo(Width, 0), g.lineTo(Width, h), g.lineTo(0, h)
		g.endFill()
	}

	private function normal(e):Widget
	{
		var o:Widget = e as Widget || Widget(Event(e).target),
			g:flash.display.Graphics = o.graphics
		g.clear()
		g.beginFill(0, 0)
		g.drawRect(0, 0, o.Width, o.Height) // 11 if round
		g.endFill()
		return o
	}

	private function pop(e)
	{
		var o:Widget = e as Widget || Widget(Event(e).target),
			g:flash.display.Graphics = o.graphics
		g.clear()
		var m:Matrix = new Matrix
		m.createGradientBox(o.width, o.height - 2, Math.PI / 2, 0, 1)
		g.beginGradientFill(GradientType.LINEAR, OVERG, null, RATIO, m)
		g.drawRect(0, 0, o.width, o.height) // 6 if round
		g.endFill()
	}

	private function push(e)
	{
		var o:Widget = e as Widget || Widget(Event(e).target),
			g:flash.display.Graphics = o.graphics
		g.clear()
		var m:Matrix = new Matrix
		m.createGradientBox(o.width, o.height - 2, Math.PI / 2, 0, 1)
		g.beginGradientFill(GradientType.LINEAR, DOWNG, null, RATIO, m)
		g.drawRect(0, 0, o.width, o.height)
		g.endFill()
	}

	private function click(e:Event)
	{
		dispatch(e.target.name)
	}
}
}
