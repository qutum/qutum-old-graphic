//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.main
{
import flash.display.DisplayObject;
import flash.events.Event;
import flash.events.EventPhase;
import flash.events.FocusEvent;
import flash.geom.Rectangle;
import flash.text.Font;
import flash.text.TextField;
import flash.text.TextFieldAutoSize;
import flash.text.TextFieldType;
import flash.text.TextFormat;


public class Text extends TextField
{
	public static const SYS_FONT:String = new TextField().defaultTextFormat.font
	public static var format:TextFormat = new TextFormat(findFont(), 16)

	var tabCaret:Number

	public function Text(auto:Boolean = true, format:TextFormat = null)
	{
		defaultTextFormat = format || Text.format
		super()
		super.alwaysShowSelection = true // for flash bug on default text format
		auto && (autoSize = TextFieldAutoSize.LEFT)
		useRichTextClipboard = true
		tabCaret = NaN
	}

	public function naming(v:String):Text
	{
		name = v
		return this
	}

	public function str(t:String):Text
	{
		text = t
		setSelection(length, length)
		return this
	}

	public function add(...ts):Text
	{
		for each (var t in ts)
			appendText(t.toString())
		setSelection(length, length)
		return this
	}

	/** @param input 1: input, 0: no input, -1: no input no select */
	public function input(input:int = 1, multiLine:Boolean = false,
		mouse = null, tab = null):Text
	{
		super.type = input > 0 ? TextFieldType.INPUT : TextFieldType.DYNAMIC
		super.selectable = input >= 0
		multiline = multiLine
		mouse == null || (mouseEnabled = Boolean(mouse))
		tab == null || (tabEnabled = Boolean(tab))
		return this
	}

	public override function set type(v:String):void
	{
		if (v != super.type)
			super.type = v, super.selectable = true
	}

	public function limit(max:int = -1, restrict_:String = null):Text
	{
		max < 0 || (maxChars = max)
		restrict_ == null || (restrict = restrict_)
		return this
	}

	public function caret(index:int):Text
	{
		select(index, index)
		return this
	}

	public function xy(x_:int, y_:int):Text
	{
		x = x_, y = y_
		return this
	}

	public function leftPrev(margin:Number = 0):Text
	{
		var i:int = parent.getChildIndex(this) - 1, p:DisplayObject, r:Rectangle
		if (i >= 0)
			p = parent.getChildAt(i), r = p.scrollRect,
			x = margin + p.x + (r ? r.width : p.width)
		else
			x = margin
		return this
	}

	/** set fixed size, no auto */
	public function size(w:Number, h:Number, wrap = null):Text
	{
		autoSize = TextFieldAutoSize.NONE
		width = w, height = h
		wrap == null || (wordWrap = Boolean(wrap))
		return this
	}

	/** @param auto <0: left, 0: center, 1: right, >1: wrap width */
	public function auto(auto:int = -1):Text
	{
		autoSize = auto == 1 ? TextFieldAutoSize.RIGHT
			: auto == 0 ? TextFieldAutoSize.CENTER : TextFieldAutoSize.LEFT;
		(wordWrap = auto > 1) && (width = auto)
		return this
	}

	public function select(begin:int, end1:int):Text
	{
		setSelection(begin >= 0 ? begin : length + begin + 1,
			end1 >= 0 ? end1 : length + end1 + 1)
		return this
	}

	/** @param tabIn NaN: select all, >=0: at index, <0: at reversed index */
	public function selectMode(outKeep:Boolean = false, tabIn:Number = NaN):Text
	{
		if (outKeep)
			detach(FocusEvent.FOCUS_OUT, unselectOut)
		else
			attach(FocusEvent.FOCUS_OUT, unselectOut)
		tabCaret = tabIn
		if (tabIn == tabIn)
			attach(FocusEvent.FOCUS_IN, unselectIn)
		else
			detach(FocusEvent.FOCUS_IN, unselectIn)
		return this
	}

	protected function unselectOut(e)
	{
		setSelection(caretIndex, caretIndex)
	}

	protected function unselectIn(e)
	{
		if (e is FocusEvent)
			Util.timer(unselectIn, 0, false, 1)
		else if (selectionBeginIndex != selectionEndIndex)
			select(tabCaret, tabCaret)
	}

	public override function set alwaysShowSelection(v:Boolean):void
	{
		selectMode(v, v ? NaN : 0)
	}

	/** tricky if true */
	public function selectOn(v:Boolean):Text
	{
		selectable = v
		return this
	}

	public function font(color:Number = NaN, size:Number = NaN, font:String = null):Text
	{
		var f:TextFormat = defaultTextFormat
		color == color && (f.color = color)
		size == size && (f.size = size)
		font == null || (f.font = font || SYS_FONT)
		defaultTextFormat = f
		return this
	}

	public function style(bold = null, italic = null, underline = null, bullet = null):Text
	{
		var f:TextFormat = defaultTextFormat
		bold == null || (f.bold = Boolean(bold))
		italic == null || (f.italic = Boolean(italic))
		underline == null || (f.underline = Boolean(underline))
		bullet == null || (f.bullet = Boolean(bullet))
		defaultTextFormat = f
		return this
	}

	public function layout(left:Number = NaN, right:Number = NaN,
		leading:Number = NaN, spacing:Number = NaN):Text
	{
		var f:TextFormat = defaultTextFormat
		left == left && (f.leftMargin = left)
		right == right && (f.rightMargin = right)
		leading == leading && (f.leading = leading)
		spacing == spacing && (f.letterSpacing = spacing)
		defaultTextFormat = f
		return this
	}

	public function align(align:String = null, indent:Number = NaN,
		blockIndent:Number = NaN):Text
	{
		var f:TextFormat = defaultTextFormat
		align == null || (f.align = align)
		indent == indent && (f.indent = indent)
		blockIndent == blockIndent && (f.blockIndent = blockIndent)
		defaultTextFormat = f
		return this
	}

	public function url(url:String = null, target:String = null,
		color:Number = NaN, bold = null, underline = null)
	{
		var f:TextFormat = defaultTextFormat
		url == null || (f.url = url)
		target == null || (f.target = target)
		color == color && (f.color = color)
		bold == null || (f.bold = Boolean(bold))
		underline == null || (f.underline = Boolean(underline))
		defaultTextFormat = f
		return this
	}

	/**
	 * @param bg <0: current, >=0: bg color, NaN: no bg
	 * @param border <0: current, >=0: border color, NaN: no border
	 * @param text <0: current, >=0: text color
	 */
	public function color(bg:Number = -1, border_:Number = -1, text:int = -1):Text
	{
		bg < 0 || (background = bg == bg, backgroundColor = bg)
		border_ < 0 || (border = border_ == border_, borderColor = border_)
		text < 0 || (textColor = text)
		return this
	}

	/** @param phase 0: target, 1: capture, 2: target and bubble, 3: all */
	public function attach(name:String, on:Function, args:Array = null,
		phase:int = 2, weak:Boolean = false):Text
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
	public function attachOnce(name:String, on:Function, args:Array = null,
		phase:int = 2, weak:Boolean = false):Text
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
	public function detach(name:String, on:Function, phase:int = 2):Text
	{
		phase & 1 && removeEventListener(name, on, true)
		phase != 1 && removeEventListener(name, on)
		return this
	}

	public function dispatch(name:String, keyValues:Object = null):Text
	{
		var e:Eventy = new Eventy(name, false)
		if (keyValues)
			for (var k in keyValues)
				e[k] = keyValues[k]
		dispatchEvent(e)
		return this
	}

	public function dispatchBubble(name:String, keyValues:Object = null):Boolean
	{
		var e:Eventy = new Eventy(name, true)
		if (keyValues)
			for (var k in keyValues)
				e[k] = keyValues[k]
		return dispatchEvent(e)
	}

	public function focus():Text
	{
		stage && (stage.focus = this)
		return this
	}

	private static function findFont():String
	{
		var fs:Array = Font.enumerateFonts(true), f:Font
		for each (f in fs)
			if (f.fontName == 'Bitstream Charter')
				return f.fontName
		return SYS_FONT
	}
}
}
