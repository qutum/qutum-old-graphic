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
	private static function input(z:Datum, nameOrU:Object):Datum
	{
		var d:Datum = new Datum(-1)
		d.layer2 = true
		d.addTo(z, Datum.IX, z.ox < 0 ? 0 : z.rowAt(Datum.IX).numChildren, false)
		nameOrU is String ? d.name = String(nameOrU) : d.unityTo(Datum(nameOrU))
		return d
	}

	private static function output(z:Datum, nameOrU:Object):Datum
	{
		var d:Datum = new Datum(1)
		d.layer2 = true
		d.addTo(z, Datum.DX, z.ox < 0 ? 0 : z.rowAt(Datum.DX).numChildren, false)
		nameOrU is String ? d.name = String(nameOrU) : d.unityTo(Datum(nameOrU))
		return d
	}

	static function init(zonest:Datum):void
	{
		var In:Datum = input(zonest, 'in')
		var data:Datum = output(In, 'data'), next:Datum = output(In, 'next')
		In.refresh(3)

		var math:Datum = input(zonest, 'math')
		var Int:Datum = output(math, 'int')
		var m1:Datum = output(Int, '-1')
		for (var bit:int = 0; bit <= 31; bit++)
			output(m1, 'b' + bit)

		var add:Datum = output(Int, '+')
		var a:Datum = input(add, 'a'), b:Datum = input(add, 'b'), v:Datum = output(add, 'v')
		var sub:Datum = output(Int, '-')
		input(sub, a), input(sub, b), output(sub, v)
		var mul:Datum = output(Int, '*')
		input(mul, a), input(mul, b), output(mul, v)
		var div:Datum = output(Int, '/')
		input(div, a), input(div, b), output(div, v), output(div, 'remainder')
		var e:Datum = output(Int, '=')
		input(e, a), input(e, b), output(e, v)
		var g:Datum = output(Int, '>')
		input(g, a), input(g, b), output(g, v)
		var l:Datum = output(Int, '<')
		input(l, a), input(l, b), output(l, v)
		var ge:Datum = output(Int, '>=')
		input(ge, a), input(ge, b), output(ge, v)
		var le:Datum = output(Int, '<=')
		input(le, a), input(le, b), output(le, v)

		var al:Datum = input(zonest, 'algorithm')
		var s:Datum = output(al, 'list.next')
		output(s, data), output(s, next)
		s = output(al, 'list.data')
		output(s, data)
		next = output(s, next), output(next, data)
		s = output(al, 'list.cycle')
		output(s, data)
		next = output(s, next), s.agent(new Wire, next, false)
		output(next, data), output(next, output(s, 'nextable'))
	}
}
}
