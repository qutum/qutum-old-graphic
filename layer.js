//
// Qutum 10 implementation
// Copyright 2008-2013 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Layer = function (zonest, dxs)
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
	input(sub, a, -44), input(sub, b, -45), output(sub, v, -46)
	var mul = output(Int, '*', -47)
	input(mul, a, -48), input(mul, b, -49), output(mul, v, -50)
	var div = output(Int, '/', -51)
	input(div, a, -52), input(div, b, -53), output(div, v, -54), output(div, 'remainder', -55)
	var e = output(Int, '=', -56)
	input(e, a, -57), input(e, b, -58), output(e, v, -59)
	var g = output(Int, '>', -60)
	input(g, a, -61), input(g, b, -62), output(g, v, -63)
	var l = output(Int, '<', -64)
	input(l, a, -65), input(l, b, -66), output(l, v, -67)
	var ge = output(Int, '>=', -68)
	input(ge, a, -69), input(ge, b, -70), output(ge, v, -71)
	var le = output(Int, '<=', -72)
	input(le, a, -73), input(le, b, -74), output(le, v, -75)

	var al = input(zonest, 'algorithm', -76)
	var s = output(al, 'list.next', -77)
	output(s, data, -78), output(s, next, -79)
	s = output(al, 'list.data', -80)
	output(s, data, -81)
	next = output(s, next, -82), output(next, data, -83)
	s = output(al, 'list.cycle', -84)
	output(s, data, -85)
	next = output(s, next, -86), s.usage(new Wire, next, false)
	output(next, data, -87), output(next, output(s, 'nextable', -88), -89)

	function input(z, nk, ndx)
	{
		var d = new Datum(-1, 2, nk.deep ? nk.nk : ndx)
		d.addTo(z, 0, z.or < 0 ? 0 : z.rows[0].length)
		nk.deep ? d.namesakeTo(nk) : d.Name(nk)
		d.dx = ndx, dxs[ndx] = d
		return d
	}
	function output(z, nk, ndx)
	{
		var d = new Datum(1, 2, nk.deep ? nk.nk : ndx)
		d.addTo(z, 1, z.or < 0 ? 0 : z.rows[1].length)
		nk.deep ? d.namesakeTo(nk) : d.Name(nk)
		d.dx = ndx, dxs[ndx] = d
		return d
	}
}

})()
