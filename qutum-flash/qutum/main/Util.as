//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.main
{
import flash.display.CapsStyle;
import flash.display.JointStyle;
import flash.display.LineScaleMode;
import flash.events.TimerEvent;
import flash.utils.Timer;


public final class Util
{
	public static function rand(end:int, begin:int = 0, includeEnd:Boolean = false):int
	{
		includeEnd && end++
		return Math.random() * (end - begin) + begin
	}

	/** @param on function(e) */
	public static function timer(on:Function, delay:Number, now:Boolean = false,
		count:int = 0, args:Array = null):Timer
	{
		var t:Timer = new Timer(delay, count)
		var _:Function = args ? function () { on.apply(null, args) } : on
		t.addEventListener(TimerEvent.TIMER, _)
		now && _()
		t.start()
		return t
	}

	public static function bound(x:Number, min:Number, max:Number):Number
	{
		return x < min ? min : x > max ? max : x
	}

	public static function In(x:Number, min:Number, max:Number):Boolean
	{
		return x >= min && x <= max
	}

	public static function line(g:flash.display.Graphics, thick:Number, color:uint,
		alpha:Number = 1, hint:Boolean = false, scale:Boolean = true):void
	{
		g.lineStyle(thick, color, alpha, hint,
			scale ? null : LineScaleMode.NONE, CapsStyle.NONE, JointStyle.MITER, 2)
	}

	public static function lineQ(g:flash.display.Graphics, thick:Number, color:uint,
		alpha:Number = 1, hint:Boolean = false, scale:Boolean = true):void
	{
		g.lineStyle(thick, color, alpha, hint,
			scale ? null : LineScaleMode.NONE, CapsStyle.SQUARE, JointStyle.MITER, 2)
	}
}
}
