//
// Qutum 10 implementation
// Copyright 2008-2013 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function () {

////////////////////////////////       ////////////////////////////////
//////////////////////////////// saver ////////////////////////////////
////////////////////////////////       ////////////////////////////////

Saver = function ()
{
}

Saver.all = function (onKey)
{
	for (var i = 0; i < localStorage.length; i++)
	{
		var key = localStorage.key(i)
		var name = key.indexOf('!')
		if (name >= 0)
			name = key.substr(name + 1), onKey && onKey(key, name)
	}
	return i
}

Saver.Name = function (key)
{
	var name = key.indexOf('!')
	Assert(name >= 0)
	return key.substr(name + 1)
}

Saver.New = function ()
{
	var key = Date.now() + '!'
	if (localStorage.getItem(key))
		throw 'duplicate'
	return key
}

Saver.load = function (key, zonest, els)
{
	var s = localStorage.getItem(key)
	if ( !s)
		return
	var name = Saver.Name(key)
	s = new String(s), s.x = 0
	if (s[s.x++] != '\u0a51') // 10 Q
		throw 'unknown format'
	els[0] = null
	sdec(zonest, s, els)
	if (s.x != s.length)
		throw 'unexpected end'
	zonest.Name(name)
}

Saver.save = function (key, zonest, onRename)
{
	var name = Saver.Name(key)
	var s = [ '\u0a51' ] // Q 10
	senc(zonest, s, {}, 0)
	zonest.edit.unsave = 0
	s = s.join('')
	var rekey
	if (zonest.name == name)
		rekey = key, localStorage.setItem(key, s)
	else
		rekey = Date.now() + '!' + zonest.name,
		onRename && onRename(key, rekey),
		localStorage.setItem(rekey, s),
		localStorage.removeItem(key)
	return rekey
}

Saver.remove = function (key)
{
	Saver.Name(key)
	localStorage.removeItem(key)
}

////////////////////////////////       ////////////////////////////////
//////////////////////////////// codec ////////////////////////////////
////////////////////////////////       ////////////////////////////////

function sencN(s, n)
	// Webkit localStorage can't save \0 and Firefox \ud800-\udfff \ufffe \uffff
{
	if (n >> 13 == n >> 31) // 14bit
		s.push(String.fromCharCode(n << 1 & 0x7ffe | 1))
	else if (n >> 27 == n >> 31) // 28bit
		s.push(String.fromCharCode(n & 0x3fff | 0x8000, n >> 13 & 0x7ffe | 1))
	else
		throw 'number overflow'
}
function sencS(s, str)
{
	var n = str.length
	if (n >> 13 == n >> 31) // 14bit
		s.push(String.fromCharCode(n << 1 & 0x7ffe | 1), str)
	else if (n >> 27 == n >> 31) // 28bit
		s.push(String.fromCharCode(n & 0x3fff | 0x8000, n >> 13 & 0x7ffe | 1), str)
	else
		throw 'string too long'
}
function sdecN(s, stay)
{
	var x = s.x, l = s.charCodeAt(x)
	if (l < 32768)
		s.x = x + 1, l = l << 17 >> 18
	else if ((h = s.charCodeAt(x + 1)) == h)
		s.x = x + 2, l = h >> 1 << 18 >> 4 | l & 0x3fff
	else
		throw 'eof'
	return l
}
function sdecN14(s)
{
	return s.charCodeAt(s.x) << 17 >> 18
}
function sdecS(s)
{
	var x = s.x, l = s.charCodeAt(x)
	if (l < 32768)
		x = x + 1, l = l << 17 >> 18
	else if ((h = s.charCodeAt(x + 1)) == h)
		x = x + 2, l = h >> 1 << 18 >> 4 | l & 0x3fff
	else
		throw 'eof'
	if ((s.x = x + l) > s.length)
		throw 'eof'
	return s.substr(x, l)
}

function senc(d, s, us, el)
{
	d.el = ++el
	var uel = 0
	if (d.unity < 0)
		uel = d.unity;
	else if (d.io && d.uNext != d)
		(uel = us[d.unity]) || (us[d.unity] = el)
	sencN(s, (d.tv < 0 ? 8 : d.tv ? 16 : 0) | (uel && 32) |
		(d.io < 0 ? 1 : d.io > 0 ? 3 : d.row && d == d.row[0] ? 34 : 2))
	if (uel)
		sencN(s, uel)
	else
		sencS(s, d.zone ? d.name : '')
	for (var R = 0, r; r = d.rows[R]; R++)
		for (var D = 0, dd; dd = r[D]; D++)
			dd.yield || dd.layer || (el = senc(dd, s, us, el))
	for (var W = 0, w; w = d.ws[W]; W++)
		if ( !w.yield)
			sencN(s, 4), sencN(s, w.base.el), sencN(s, w.agent.el)
	sencN(s, 0)
	return el
}
function sdec(d, s, els)
{
	d.el = els.push(d)
	var x = sdecN(s), u
	d.Tv(x & 8 ? -1 : x & 16 ? 1 : 0)
	if (d.io == 0 || ~x & 32)
	{
		var name = sdecS(s)
		if (d.zone)
			d.Name(name)
		else if (name)
			throw 'invalid name'
	}
	else if (u = els[sdecN(s)])
		d.unityTo(u)
	else
		throw 'invalid unity'
	for (var X = x = xx = 0; x = (xx = sdecN14(s)) & 7; X = x)
		if (x < X)
			throw 'invalid format'
		else if (x == 1)
			sdec(new Datum(-1).addTo(d, 0, d.ox < 0 ? 0 : d.rows[0].length), s, els)
		else if (x == 2)
			if (xx & 32)
				sdec(new Datum(0).addTo(d, d.ox < 0 ? 1 : d.ox, -1), s, els)
			else
				sdec(new Datum(0).addTo(d,
					d.ox <= 1 ? 1 : d.ox - 1, d.ox <= 1 ? 0 : d.rows[d.ox - 1].length), s, els)
		else if (x == 3)
			sdec(new Datum(1).addTo(d,
				d.ox < 0 ? 1 : d.ox, d.ox < 0 ? 0 : d.rows[d.ox].length), s, els)
		else if (x == 4)
		{
			sdecN(s)
			var b = els[sdecN(s)], a = els[sdecN(s)]
			if ( !b || !a || b == a)
				throw 'invalid wire'
			if (b.agent(new Wire, a))
				throw 'duplicate wire'
		}
		else
			throw 'invalid format'
	sdecN(s)
}

})()