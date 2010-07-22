//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function () {

Layer2 = function (zonest)
{
	var In = input(zonest, 'in')
	var data = output(In, 'data'), next = output(In, 'next')
	In.show(3)

	var math = input(zonest, 'math')
	var Int = output(math, 'int')
	var m1 = output(Int, '-1')
	for (var bit = 0; bit <= 31; bit++)
		output(m1, 'b' + bit)

	var add = output(Int, '+')
	var a = input(add, 'a'), b = input(add, 'b'), v = output(add, 'v')
	var sub = output(Int, '-')
	input(sub, a), input(sub, b), output(sub, v)
	var mul = output(Int, '*')
	input(mul, a), input(mul, b), output(mul, v)
	var div = output(Int, '/')
	input(div, a), input(div, b), output(div, v), output(div, 'remainder')
	var e = output(Int, '=')
	input(e, a), input(e, b), output(e, v)
	var g = output(Int, '>')
	input(g, a), input(g, b), output(g, v)
	var l = output(Int, '<')
	input(l, a), input(l, b), output(l, v)
	var ge = output(Int, '>=')
	input(ge, a), input(ge, b), output(ge, v)
	var le = output(Int, '<=')
	input(le, a), input(le, b), output(le, v)

	var al = input(zonest, 'algorithm')
	var s = output(al, 'list.next')
	output(s, data), output(s, next)
	s = output(al, 'list.data')
	output(s, data)
	next = output(s, next), output(next, data)
	s = output(al, 'list.cycle')
	output(s, data)
	next = output(s, next), s.agent(new Wire, next, false)
	output(next, data), output(next, output(s, 'nextable'))
}

function input(z, nameOrU)
{
	var d = new Datum(-1)
	d.layer2 = true
	d.addTo(z, 0, z.ox < 0 ? 0 : z.rows[0].length)
	nameOrU.unity ? d.unityTo(nameOrU) : d.Name(nameOrU)
	return d
}

function output(z, nameOrU)
{
	var d = new Datum(1)
	d.layer2 = true
	d.addTo(z, 1, z.ox < 0 ? 0 : z.rows[1].length)
	nameOrU.unity ? d.unityTo(nameOrU) : d.Name(nameOrU)
	return d
}

})()