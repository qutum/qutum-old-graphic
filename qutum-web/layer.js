//
// Qutum 10 implementation
// Copyright 2008-2011 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Layer2 = function (zonest)
{
	var In = input(zonest, 'in', -1)
	var data = output(In, 'data', -2), next = output(In, 'next', -3)
	In.show(3)

	var math = input(zonest, 'math', -4)
	var Int = output(math, 'int', -5)
	var m1 = output(Int, '-1', -6)
	for (var bit = 0; bit <= 31; bit++)
		output(m1, 'b' + bit, -7-bit)

	var add = output(Int, '+', -39)
	var a = input(add, 'a', -40), b = input(add, 'b', -41), v = output(add, 'v', -42)
	var sub = output(Int, '-', -43)
	input(sub, a), input(sub, b), output(sub, v)
	var mul = output(Int, '*', -44)
	input(mul, a), input(mul, b), output(mul, v)
	var div = output(Int, '/', -45)
	input(div, a), input(div, b), output(div, v), output(div, 'remainder', -46)
	var e = output(Int, '=', -47)
	input(e, a), input(e, b), output(e, v)
	var g = output(Int, '>', -48)
	input(g, a), input(g, b), output(g, v)
	var l = output(Int, '<', -49)
	input(l, a), input(l, b), output(l, v)
	var ge = output(Int, '>=', -50)
	input(ge, a), input(ge, b), output(ge, v)
	var le = output(Int, '<=', -51)
	input(le, a), input(le, b), output(le, v)

	var al = input(zonest, 'algorithm', -52)
	var s = output(al, 'list.next', -53)
	output(s, data), output(s, next)
	s = output(al, 'list.data', -54)
	output(s, data)
	next = output(s, next), output(next, data)
	s = output(al, 'list.cycle', -55)
	output(s, data)
	next = output(s, next), s.agent(new Wire, next, false)
	output(next, data), output(next, output(s, 'nextable', -56))
}

function input(z, name, u)
{
	var d = new Datum(-1, 2, name.deep ? name.u : u)
	d.addTo(z, 0, z.ox < 0 ? 0 : z.rows[0].length)
	name.deep ? d.unityTo(name) : d.Name(name)
	return d
}

function output(z, name, u)
{
	var d = new Datum(1, 2, name.deep ? name.u : u)
	d.addTo(z, 1, z.ox < 0 ? 0 : z.rows[1].length)
	name.deep ? d.unityTo(name) : d.Name(name)
	return d
}

})()