//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Row = function (d, row)
{
	row.d = d
	row.layoutW = layoutW
	row.layout = layout
	row.searchDatum = searchDatum
	row.searchDatumX = searchDatumX
	return row
}
var SPACE = Datum.SPACE

function layoutW ()
{
	var w = SPACE
	for (var i = 0, d; d = this[i]; i++)
		w += d.w + SPACE
	return this.w = w
}

// mode 0: hide, 1: top, 2: middle, 3: bottom
function layout(mode, left, right, y)
{
	var n = this.length, space = (right - left - this.w) / (n + 1) + SPACE | 0,
		w = 0, h = 0, i, d
	if (mode <= 0)
		for (i = 0; d = this[i]; i++)
			d.x = left, d.y = y
	else
	{
		w = left + space
		for (i = 0; d = this[i]; i++)
			d.x = w, d.y = y,
			w += d.w + space, h = Math.max(h, d.h)
		if (mode > 1)
			for (i = 0; d = this[i]; i++)
				d.y += h - d.h >> (3 - mode)
	}
	this.y = y
	this.w = w, this.h = h
	this.space = space
}

function searchDatum(x, y)
{
	var low = 0, high = this.length - 1
	while (low <= high)
	{
		var mid = (low + high) >> 1, d = this[mid], dx = d.x
		if (x < dx)
			high = mid - 1
		else if (x >= dx + d.w)
			low = mid + 1
		else if (y < (dx = d.y))
			return -2147483647 // 0x80000001
		else if (y >= dx + d.h)
			return -2147483648 // 0x80000000
		else
			return mid
	}
	return ~low
}

function searchDatumX(x)
{
	var low = 0, high = this.length - 1, s2 = this.space >> 1
	while (low <= high)
	{
		var mid = (low + high) >> 1, d = this[mid], dx = d.x
		if (x <= dx - s2)
			high = mid - 1
		else if (x > dx + d.w + s2)
			low = mid + 1
		else
			return mid
	}
	return ~low
}

})()