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

Saver.save = function (key, zonest, onRename)
{
	var name = Saver.Name(key)
	var enc = SaverEnc()
	save(enc, zonest, {}, 0)
	enc = enc.finish()
	var rekey
	if (zonest.name == name)
		rekey = key, localStorage.setItem(key, enc)
	else
		rekey = Date.now() + '!' + zonest.name,
		onRename && onRename(key, rekey),
		localStorage.setItem(rekey, enc),
		localStorage.removeItem(key)
	zonest.edit.unsave = 0
	return rekey
}

Saver.load = function (key, zonest, els)
{
	var dec = localStorage.getItem(key)
	if ( !dec)
		return
	var name = Saver.Name(key)
	els[0] = null
	dec = SaverDec(dec)
	load(dec, zonest, els)
	dec.finish()
	zonest.Name(name)
}

Saver.remove = function (key)
{
	Saver.Name(key)
	localStorage.removeItem(key)
}

////////////////////////////////       ////////////////////////////////
//////////////////////////////// filer ////////////////////////////////
////////////////////////////////       ////////////////////////////////

Filer = function ()
{
}

Filer.save = function (key, zonest, onFinish)
{
	Saver.Name(key)
	var enc = FilerEnc()
	save(enc, zonest, {}, 0)
	enc = enc.finish(onFinish)
}

Filer.load = function (key, file, zonest, els, onFinish)
{
	Saver.Name(key)
	var name = file.name, namedot = name.lastIndexOf('.')
	namedot >= 0 && (name = name.substr(0, namedot))
	var r = new FileReader()
	r.onerror = function () { onFinish(false, r.error) }
	r.onload = function ()
	{
		try
		{
			els[0] = null
			var dec = FilerDec(r.result)
			load(dec, zonest, els)
			dec.finish()
			zonest.Name(name)
			onFinish(true)
		}
		catch (e)
		{
			onFinish(false, e)
		}
	}
	r.readAsArrayBuffer(file)
}

////////////////////////////////       ////////////////////////////////
//////////////////////////////// codec ////////////////////////////////
////////////////////////////////       ////////////////////////////////

function save(enc, d, us, el)
{
	d.el = ++el
	var uel = 0
	if (d.unity < 0)
		uel = d.unity;
	else if (d.io && d.uNext != d)
		(uel = us[d.unity]) || (us[d.unity] = el)
	enc.num((d.tv < 0 ? 8 : d.tv ? 16 : 0) | (uel && 32) |
		(d.io < 0 ? 1 : d.io > 0 ? 3 : d.row && d == d.row[0] ? 34 : 2))
	if (uel)
		enc.num(uel)
	else
		enc.str(d.zone ? d.name : '')
	for (var R = 0, r; r = d.rows[R]; R++)
		for (var D = 0, dd; dd = r[D]; D++)
			dd.yield || dd.layer || (el = save(enc, dd, us, el))
	for (var W = 0, w; w = d.ws[W]; W++)
		if ( !w.yield)
			enc.num(4), enc.num(w.base.el), enc.num(w.agent.el)
	enc.num(0)
	return el
}
function load(dec, d, els)
{
	d.el = els.push(d)
	var q = dec.num(), u
	d.Tv(q & 8 ? -1 : q & 16 ? 1 : 0)
	if (d.io == 0 || ~q & 32)
	{
		var name = dec.str()
		if (d.zone)
			d.Name(name)
		else if (name)
			throw 'invalid name'
	}
	else if (u = els[dec.num()])
		d.unityTo(u)
	else
		throw 'invalid unity'
	for (var Q = q = xx = 0; q = (xx = dec.peek()) & 7; Q = q)
		if (q < Q)
			throw 'invalid format'
		else if (q == 1)
			load(dec, new Datum(-1).addTo(d, 0, d.ox < 0 ? 0 : d.rows[0].length), els)
		else if (q == 2)
			if (xx & 32)
				load(dec, new Datum(0).addTo(d, d.ox < 0 ? 1 : d.ox, -1), els)
			else
				load(dec, new Datum(0).addTo(d,
					d.ox <= 1 ? 1 : d.ox - 1, d.ox <= 1 ? 0 : d.rows[d.ox - 1].length), els)
		else if (q == 3)
			load(dec, new Datum(1).addTo(d,
				d.ox < 0 ? 1 : d.ox, d.ox < 0 ? 0 : d.rows[d.ox].length), els)
		else if (q == 4)
		{
			dec.num()
			var b = els[dec.num()], a = els[dec.num()]
			if ( !b || !a || b == a)
				throw 'invalid wire'
			if (b.agent(new Wire, a))
				throw 'duplicate wire'
		}
		else
			throw 'invalid format'
	dec.num()
	return q
}

////////////////////////////////       ////////////////////////////////
//////////////////////////////// codec ////////////////////////////////
////////////////////////////////       ////////////////////////////////

function SaverEnc()
{
	var s = [ '\u0a51' ], x = 1 // 10 Q
	s.num = function (n) // Webkit localStorage denies \0 and Firefox \ud800-\udfff \ufffe \uffff
	{
		if (n != (n|0))
			throw 'invalid number'
		else if (n >> 13 == n >> 31) // 14bit signed
			s[x++] = String.fromCharCode((n & 0x3fff) + 1)
		else if (n >> 27 == n >> 31) // 28bit signed
			s[x++] = String.fromCharCode((n & 0x3fff) + 0x4001, (n >> 14 & 0x3fff) + 1)
		else // 32bit signed
			s[x++] = String.fromCharCode((n & 0x3fff) + 0x8001, (n >> 14 & 0x3fff) + 1,
				(n >> 28 & 15) + 1)
	}
	s.str = function (str)
	{
		var n = str.length
		if (n >> 13 == 0) // 13bit unsigned
			s[x++] = String.fromCharCode((n & 0x3fff) + 1)
		else if (n >> 27 == 0) // 27bit unsigned
			s[x++] = String.fromCharCode((n & 0x3fff) + 0x4001, (n >> 14 & 0x3fff) + 1)
		else
			throw 'string too long'
		s[x++] = str
	}
	s.finish = function ()
	{
		return s.join('')
	}
	return s
}

function SaverDec(s)
{
	s = new String(s)
	if (s[0] != '\u0a51') // 10 Q
		throw 'unknown format'
	var n = s.length, x = 1
	s.num = function ()
	{
		var a = s.charCodeAt(x), b, c
		if (a <= 0x4000)
			return x += 1, a-1 << 18 >> 18
		else if ((b = s.charCodeAt(x + 1)) == b && a <= 0x8000)
			return x += 2, b-1 << 18 >> 4 | a-0x4001
		else if ((c = s.charCodeAt(x + 2)) == c)
			if (a <= 0xc000)
				return x += 3, c-1 << 28 | (b-1 & 0x3fff) << 14 | a-0x8001
			else
				throw 'invalid number'
		throw 'eof'
	}
	s.peek = function ()
	{
		return s.charCodeAt(x)-1 << 18 >> 18
	}
	s.str = function ()
	{
		var a = s.charCodeAt(x)
		if (a < 0x4000)
			x = x + 1, a = a-1
		else if ((b = s.charCodeAt(x + 1)) == b)
			if (a <= 0x8000)
				x = x + 2, a = b-1 << 14 | a-0x4001
			else
				throw 'string too long'
		else
			throw 'eof'
		if ((x += a) > n)
			throw 'eof'
		return s.substr(x - a, a)
	}
	s.finish = function ()
	{
		if (x != n)
			throw 'unexpected end'
	}
	return s
}

function FilerEnc() // only for little endian
{
	var s = [], x = 0
	s[x++] = 0x0a51 // 10 Q
	s.num = function (n)
	{
		if (n != (n|0)) // 32bit signed
			throw 'invalid number'
		s[x++] = n, s[x++] = n >> 16
	}
	s.str = function (str)
	{
		var n = str.length
		if (n >> 27 != 0) // 27bit unsigned
			throw 'string too long'
		s[x++] = n, s[x++] = n >> 16
		for (var i = 0; i < n; i++)
			s[x++] = str.charCodeAt(i)
	}
	s.finish = function (onFinish)
	{
		var r = new FileReader()
		r.onerror = function () { onFinish(false, r.error) }
		r.onload = function () { onFinish(true, r.result) }
		r.readAsDataURL(new Blob([ new Uint16Array(s) ], { type:'application/qutum-file' }))
	}
	return s
}

function FilerDec(bytes) // only for little endian
{
	var n = bytes.byteLength
	if (n % 2)
		throw 'unknown format'
	var s = new Uint16Array(bytes), x = 1
	if (s[0] != 0x0a51) // 10 Q
		throw 'unknown format'
	s.num = function ()
	{
		x += 2
		return s[x-1] << 16 | s[x-2]
	}
	s.peek = function ()
	{
		return s[x+1] << 16 | s[x]
	}
	s.str = function ()
	{
		x += 2
		var v = s[x-1] << 16 | s[x-2]
		if (v >> 27 != 0)
			throw 'string too long'
		x += v
		if (x + x > n)
			throw 'eof'
		return String.fromCharCode.apply(null, new Uint16Array(bytes, x+x-v-v, v+v))
	}
	s.finish = function ()
	{
		if (x + x != n)
			throw 'unexpected end'
	}
	return s
}

})()