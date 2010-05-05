//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.edit
{


final class Layer2
{
	private static function input(z:Datum, x:int, name:String):Datum
	{
		var d:Datum = new Datum(-1)
		d.layer2 = true
		d.addTo(z, Datum.IX, x, false)
		d.name = name
		return d
	}

	private static function output(z:Datum, x:int, name:String):Datum
	{
		var d:Datum = new Datum(1)
		d.layer2 = true
		d.addTo(z, Datum.DX, x, false)
		d.name = name
		return d
	}

	static function init(zonest:Datum):void
	{
		var i:Datum = input(zonest, 0, 'in')
		output(i, 0, 'data'), output(i, 1, 'next')
		i.refresh(3)

		var math:Datum = input(zonest, 1, 'math')
		var Int:Datum = output(math, 0, 'int')
		var m1:Datum = output(Int, 0, '-1')
		for (var b:int = 0; b <= 31; b++)
			output(m1, b, 'b' + b)
		var add:Datum = output(Int, 1, '+')
		input(add, 0, 'a'), input(add, 1, 'b')
		var sub:Datum = output(Int, 2, '-')
		input(sub, 0, 'a'), input(sub, 1, 'b')
		var mul:Datum = output(Int, 3, '*')
		input(mul, 0, 'a'), input(mul, 1, 'b')
		var div:Datum = output(Int, 4, '/')
		input(div, 0, 'a'), input(div, 1, 'b')
	}
}
}
