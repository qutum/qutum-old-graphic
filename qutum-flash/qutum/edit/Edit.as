//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.edit
{
import flash.display.Shape;
import flash.events.Event;
import flash.events.FocusEvent;
import flash.events.KeyboardEvent;
import flash.events.MouseEvent;
import flash.geom.Point;
import flash.geom.Rectangle;
import flash.utils.Dictionary;
import flash.utils.Endian;
import flash.utils.IDataInput;
import flash.utils.IDataOutput;

import qutum.main.Eventy;
import qutum.main.Info;
import qutum.main.Text;
import qutum.main.Util;
import qutum.main.Widget;


public final class Edit extends Widget
{
	static var firstActive:Boolean = true

	var zonest:Datum

	var sx:int, sy:int, sr:int, sb:int
	var key:Hit, keyR:int, keyX:int
	var keyOn:int, keyOff:int, keyTime:Number
	var inside:Boolean
	var moveX:Number, moveY:Number
	var hit:Hit
	var down:Boolean
	var downX:Number, downY:Number
	var hover:Shape
	var tip:Text
	var keying:Shape
	var drag:Shape
	var namey:Text
	var unities:Boolean, unity:Unity
	var refresh:Boolean

	var com:Command
	public var unsave:int
	var saveUs:Dictionary
	var error:int
	var yields:Array
	var fatal:Boolean

	Shape // for mxml bug on Graphics

	public function Edit(father:Widget, load_:IDataInput = null)
	{
		father.add(this)
		add(key = zonest = new Datum(0))
		zonest.edit = this
		zonest.addTo(null, 0, 0, false)
		Layer2.init(zonest)
		if (load_)
			try
			{
				load(load_)
				load_ = null
			}
			finally
			{
				if (load_)
					father.removeChild(this)
			}

		moveX = mouseX, moveY = mouseY
		event(1)
		add(hover = new Shape, keying = new Shape)
		stage.addChild(tip = new Text().selectOn(false)), tip.mouseEnabled = false
		add(namey = new Text().input(1, false).color(0xffffff, 0xccccff))
		namey.attach(KeyboardEvent.KEY_DOWN, nameKey)
			.attach(FocusEvent.FOCUS_OUT, nameKey)
			.visible = false
		unities = true
		com = new Command(this)

		if (firstActive != (firstActive = false))
			active(null),
			fixActivate()
		attach(Event.ACTIVATE, active)
		attach(Event.DEACTIVATE, active)
		attach(KeyboardEvent.KEY_DOWN, keyon)
		attach(KeyboardEvent.KEY_UP, keyon)
		attach(Event.ENTER_FRAME, frame)
		attach(MouseEvent.ROLL_OVER, over)
		attach(MouseEvent.ROLL_OUT, over)
		attach(MouseEvent.MOUSE_DOWN, mouse)
		attach(MouseEvent.MOUSE_UP, mouse)
		stage.addEventListener(MouseEvent.MOUSE_UP, dragStop, false, 0, true)

		unSave(0)
		zonest.refresh(4), zonest.layoutDetail(), zonest.layout(false)
	}

	public function close():Edit
	{
		event(0)
		dragStop()
		stage.removeEventListener(MouseEvent.MOUSE_UP, dragStop, true)
		parent.removeChild(this)
		return this
	}

	public override function set scrollRect(v:Rectangle):void
	{
		sx = v.x, sy = v.y, sr = v.x + v.width, sb = v.y + v.height
		super.scrollRect = v
	}

	public override function get width():Number
	{
		return Math.max(zonest.w, namey.x + namey.width)
	}

	public override function get height():Number
	{
		return Math.max(zonest.h, namey.y + namey.height)
	}

	private function active(e:Event):Edit
	{
		keying.visible = e && e.type == Event.ACTIVATE
		return this
	}

	function keyin(k:Hit, r:int = -1, x:int = -1, nav:Boolean = true):void
	{
		if (down)
			return
		if ( !k)
			throw 'null key'
		var key0:Hit = key, d:Datum
		key = k
		keyRx(r, x)
		if (nav && key0 != key)
			key.keyPrev && (key.keyPrev.keyNext = key.keyNext),
			key.keyNext && (key.keyNext.keyPrev = key.keyPrev),
			key.keyPrev = key0,
			key.keyNext = null,
			key0.keyNext && (key0.keyNext.keyPrev = null),
			key0.keyNext = key
		namey.visible = false
		refresh = true
		d = key as Datum, d && d.detail < 2 && d.refresh(2)
	}

	private function keyRx(r:int, x:int):void
	{
		if (key == zonest || !(key is Datum))
			keyR = keyX = -1
		else if (r < 0 || x < 0)
			keyR = Datum(key).zone.getChildIndex(key.parent),
			keyX = Datum(key).parent.getChildIndex(key)
		else
			keyR = r, keyX = x
	}

	public override function keyon(o:Object = false):Widget
	{
		if (o is Boolean)
			return super.keyon(o)
		var e:KeyboardEvent = KeyboardEvent(o)
		if (e.target != this)
			return this
		var k:int = e.keyCode, c:int = e.charCode,
			shift:Boolean = e.shiftKey, ctrl:Boolean = e.ctrlKey
		if (e.type == KeyboardEvent.KEY_DOWN)
		{
			if (c && k == keyOff && new Date().time - keyTime < 16)
				keyOn = keyOff // fix linux player on key repeat
			if (down)
				if (k == 37) // left
					scrollDelta(-100, 0), dispatch(Eventy.SHOW, null, true)
				else if (k == 39) // right
					scrollDelta(100, 0), dispatch(Eventy.SHOW, null, true)
				else if (k == 38) // up
					scrollDelta(0, -100), dispatch(Eventy.SHOW, null, true)
				else if (k == 40) // down
					scrollDelta(0, 100), dispatch(Eventy.SHOW, null, true)
				else if (drag)
					if (k == 27 || k == 32) // esc or space
						dragStop(false)
					else
						key.draging(drag, 0, k, c, shift, ctrl)
				else if (c != 0)
					dragStart(k, c, shift, ctrl)
				else
					;
			else if (ctrl && k == 38) // ctrl-up
				key.keyPrev && keyin(key.keyPrev, -1, -1, false)
			else if (ctrl && k == 40) // ctrl-down
				key.keyNext && keyin(key.keyNext, -1, -1, false)
			else if (ctrl && (k == 39 || k == 89 || k == 90 && shift))
				com.redo() // ctrl-right ctrl-y ctrl-shift-z
			else if (ctrl && (k == 37 || k == 90)) // ctrl-left ctrl-z
				com.undo()
			else
				key.key(k, c, shift, ctrl),
			c && (keyOn = k)
		}
		else if (k == keyOn)
			keyOn = 0,
			keyOff = k,
			keyTime = new Date().time // fix linux player bug on key repeat
		return this
	}

	private function nameKey(e:Event)
	{
		if ( !namey.visible)
			return
		var k:int = e is FocusEvent ? 13 : KeyboardEvent(e).keyCode
		if (k == 27) // esc
			namey.visible = false // cause FocusEvent
		else if (k == 13) // enter
			namey.visible = false, // cause FocusEvent
			com.name(namey.text)
	}

	private function frame(e:Event)
	{
		if (fatal)
		{
			fatal = false
			var i:Info = new Info(stage, 'Fatal', Widget(root), true)
			i.body.style(true).str('Compiler Failed !').style(false)
				.add(' You could report this error ')
				.url('http://code.google.com/p/qutum/issues/list', null, 0x80, false, true)
					.add('here').url('', null, 0, false, false)
				.add(' with your source file attached')
			i.addOk()
		}
		else if (error < -1 ? !++error : error == -1 && !namey.visible && !++error)
			compile()
		var stay:Boolean = moveX == (moveX = mouseX)
		stay = moveY == (moveY = mouseY) && stay
		if (refresh)
			zonest.layoutDetail(), zonest.layout(false),
			key.keyin(down)
		if (refresh || !stay)
			move()
		var u:Unity = unities && key is Datum ? Datum(key).unity : null
		if (refresh || u != unity)
			Boolean(unity && unity.d.unities(false)),
			(unity = u) && unity.d.unities(true)
		if (refresh)
			refresh = false,
			dispatch(Eventy.SHOW, null, true)
	}

	private function over(e:MouseEvent)
	{
		inside = e.type == MouseEvent.ROLL_OVER
		move()
	}

	private function move(e:Object = null)
	{
		var xy:Point
		if (inside && (hit = zonest.hit(xy = new Point(moveX, moveY))))
			hit.hover(xy.x, xy.y)
		else
			hit = null, hover.x = hover.y = 0, hover.graphics.clear(),
			tip.str('').visible = false
		if (drag)
			drag.x = stage.mouseX, drag.y = stage.mouseY,
			key.draging(drag, 0, 0, 0, false, false)
		else if (down && Math.abs(moveX - downX) + Math.abs(moveY - downY) > 5)
			dragStart(0, 0, false, false)
	}

	private function mouse(e:MouseEvent)
	{
		if (e.target != this)
			return
		if (e.type == MouseEvent.MOUSE_DOWN)
		{
			downX = e.localX, downY = e.localY
			var k:Hit = zonest.hit(new Point(downX, downY))
			k && (keyin(k), down = true)
			return
		}
		down = false
		if (key is Datum && key == zonest.hit(new Point(e.localX, e.localY), false))
			Datum(key).detail < 3 && Datum(key).refresh(e.shiftKey ? 4 : 3),
			refresh = true
	}

	function dragStart(k:int, c:int, shift:Boolean, ctrl:Boolean)
	{
		down = true
		drag || stage.addChild(drag = new Shape)
		drag.x = stage.mouseX, drag.y = stage.mouseY
		key.draging(drag, -1, k, c, shift, ctrl)
	}

	function dragStop(e = null)
	{
		if (drag)
			down = false,
			e is Boolean || Boolean(key.draging(drag, 1, 0, 0, false, false)),
			stage.removeChild(drag),
			drag = null
	}

	function unSave(delta:int):void
	{
		error = stage.frameRate * 800 / -1000
		yields = null
		!unsave != !(unsave += delta) && dispatch(Eventy.UNSAVE, null, true)
	}

	public function save(str:IDataOutput):void
	{
		str.endian = Endian.LITTLE_ENDIAN
		str.writeByte(81) // Q
		str.writeByte(10) // 10
		saveUs = new Dictionary
		zonest.save(str, 0)
		saveUs = null
	}

	// for flash player bug on writeMultiByte
	function saveUcs(str:IDataOutput, ucs:String):void
	{
		var n:int = ucs.length
		str.writeInt(n)
		for (var x:int = 0; x < n; x++)
			str.writeShort(ucs.charCodeAt(x))
	}

	private function load(str:IDataInput):void
	{
		str.endian = Endian.LITTLE_ENDIAN
		if (str.readUnsignedByte() != 81 || str.readUnsignedByte() != 10)
			throw 'unknown file format'
		zonest.load(str)
	}

	// for flash player bug on readMultiByte
	function loadUcs(str:IDataInput):String
	{
		var n:int = str.readInt()
		if (n < 0)
			throw 'invalid length'
		if (n == 0)
			return ''
		var s:Array = new Array(n)
		for (var x:int = 0; x < n; x++)
			s[x] = str.readUnsignedShort()
		return String.fromCharCode.apply(null, s)
	}

	function compile():void
	{
		var t:Number = new Date().time
		fatal = true
		trace(t % 999 + '\tcompile')
		yields = []
		zonest.compile1()
		zonest.compile2()
		while (zonest.compile3(zonest.mn)) ;
//		fatal = false, compiling(t)
//	}
//
//	function compiling(t:Number):void
//	{
//		if (zonest.mn < 20 ? zonest.compile3(zonest.mn) : trace('>100'))
//			Util.timer(compiling, 0, false, 1, [ t ])
//		else
		{
			yields.push(null)
			zonest.compile4()
			trace('\tdone ', new Date().time - t, 'ms')
			keyRx(-1, -1)
			fatal = false
		}
	}
}
}
