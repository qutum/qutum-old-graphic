//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.edit
{
import flash.display.Shape;

import qutum.main.Widget;


/** x == 0 and y == 0 */
final class Row extends Widget
{
	var top:int, w:int, h:int, space:int

	Shape // fix mxml bug on Graphics

	function datumAt(i:int):Datum
	{
		return Datum(getChildAt(i))
	}

	function datum(i:int):Datum
	{
		return i >= 0 && i < numChildren ? Datum(getChildAt(i)) : null
	}

	function layoutW():int
	{
		w = Datum.SPACE
		for (var n:int = numChildren, i:int = 0; i < n; i++)
			w += datumAt(i).w + Datum.SPACE
		return w
	}

	/** @param mode 0: hide, 1: top, 2: middle, 3: bottom */
	function layout(mode:int, left:int, right:int, y:int):void
	{
		var n:int = numChildren, i:int, d:Datum
		space = (right - left - w) / (n + 1) + Datum.SPACE
		top = y
		w = h = 0
		if (mode <= 0)
			for (i = 0; i < n; i++)
				d = datumAt(i),
				d.x = left, d.y = y
		else
		{
			w = left + space
			for (i = 0; i < n; i++)
				d = datumAt(i),
				d.x = w, d.y = y,
				w += d.w + space, h = Math.max(h, d.h)
			if (mode > 1)
				for (i = 0; i < n; i++)
					d = datumAt(i),
					d.y += h - d.h >> (3 - mode)
		}
	}

	final function searchDatum(x:int, y:int):int
	{
		var low:int = 0, high:int = numChildren - 1
		while (low <= high)
		{
			var mid:int = (low + high) >> 1, d:Datum = datumAt(mid),
				dx:int = d.x
			if (x < dx)
				high = mid - 1
			else if (x >= dx + d.w)
				low = mid + 1
			else if (y < (dx = d.y))
				return 0x80000001
			else if (y >= dx + d.h)
				return 0x80000000
			else
				return mid
		}
		return ~low
	}

	final function searchDatumX(x:int):int
	{
		var low:int = 0, high:int = numChildren - 1, s2:int = space >> 1
		while (low <= high)
		{
			var mid:int = (low + high) >> 1, d:Datum = datumAt(mid),
				dx:int = d.x
			if (x <= dx - s2)
				high = mid - 1
			else if (x > dx + d.w + s2)
				low = mid + 1
			else
				return mid
		}
		return ~low
	}
}
}
