//
// Qutum 10 implementation
// Copyright 2008-2013 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function () {

Compile = function (edit)
{
	edit.compileTime = 0
	var time = Date.now()
	var log = $info('compile ')
	edit.fatal = true, edit.errorN = 0
	datum1(edit.zonest)
	datum2(edit.zonest)
	while (datum3(edit.zonest, edit.zonest.mn))
		;
	datum4(edit.zonest)
	$logmore(log), $info(Date.now() - time, 'ms')
	edit.fatal = false
}
Compile.wire1 = wire1

function datum1(d)
{
	if (d.gene != (d.gene =
		d.io >= 0 && ( !d.zone || d.zone.gene && d.bs.length == 0)))
		d.show(-1)
	d.zv = d.zone != null && (d.zone.tv > 0 || d.zone.zv)
	d.cycle = null
	if (d.ox > 0)
	{
		for (var R = 0, el = 0, r; r = d.rows[R]; R++)
			for (var D = 0, dd; dd = r[D]; D++)
				dd.el = ++el, dd.yield && (dd.yield = -1),
				datum1(dd)
		for (var W = 0, w; w = d.ws[W]; W++)
			w.yield && (w.yield = -1),
			wire1(w)
	}
	d.bbs ? d.bbs.length = 0 : d.bbs = []
	d.err && (d.err = '', d.show(-1))
}

function wire1(w)
{
	if (w.err != (w.err = wireError1(w)))
		w.showing = true, w.edit.show(true)
	w.err && (w.edit.errorN++)
}

function wireError1(w)
{
	var base = w.base, agent = w.agent
	if (base.tv > 0 || base.zv)
		return 'base must not be veto or inside'
	if (agent.tv > 0 || agent.zv)
		return 'agent must not be veto or inside'
	var zone = w.zone, az = agent.azer, a, z
	if (base != zone && base.bzer != w.zb)
		return "base or base zoner's zone must be wire zone"
	if (az.deep <= zone.deep)
		return 'agent zoner must be inside wire zone'
	if (base != zone && w.zb.el >= w.za.el) // NaN
		return 'must wire early to later'
	if ( !zone.gene)
		if (base != zone && !base.io)
			return 'wire inside agent must have input or output base'
		else if ( !agent.io)
			return 'wire inside agent must have input or output agent'
	for (a = az.zone; a != zone; a = a.zone)
		if (a.io < 0)
			return 'wire must not cross input edge'
	for (a = az.zone; a != zone; a = z, z = z.zone)
		if (z = a.zone, !a.gene && z.gene)
			return 'wire must not cross agent edge from gene'
	return ''
}

function datum2(d)
{
	d.us = {}
	var bw // Wire
	var w, wb, wbb, ww // Wiring
	for (var W = 0; bw = d.bs[W]; W++)
		if ( !bw.err && !bw.yield && bw.base == bw.zone)
			d.cycle = bw.base
	d.base0 = d.bs.length ? 1 : d.deep
	for (var W = d.bs.length - 1; bw = d.bs[W]; W--)
		if ( !bw.err && !bw.yield)
		{
			if (d.cycle && bw.base != d.cycle)
			{
				bw.err = 'only one base allowed for cycle agent'
				bw.showing = true
				d.edit.show(true), d.edit.errorN++
				continue;
			}
			w = new Wiring
			d.bbs.push(w)
			w.b = bw.base
			w.deep0 = bw.zone.deep, w.deep9 = d.azer.deep - 1
			d.base0 = Math.max(d.base0, Math.min(w.b.base0,
				bw.base == bw.zone || bw.zb.io < 0 ? bw.zone.deep : bw.zb.deep))
			for (var B = 0; wb = w.b.bbs[B]; B++)
				if (wb.deep0 <= w.deep0)
				B: {
					for (var BB = 0; wbb = d.bbs[BB]; BB++)
						if (wbb.b == wb.b)
							break B // continue
					ww = new Wiring
					d.bbs.push(ww)
					ww.b = wb.b
					ww.deep0 = wb.deep0
					ww.deep9 = wb.deep9 < w.deep0 ? wb.deep9 : w.deep9
					ww.from = bw
				}
		}
//		namey.text = namey.text.replace(/:.*/, '') + ':' + base0 // TODO debug
	for (var R = 0, r; r = d.rows[R]; R++)
		for (var D = 0, dd; dd = r[D]; D++)
			datum2(dd)
	d.mn = 0
	if (d.uNext != d && (!d.yield || !d.zone.us[d.unity]))
		d.zone.us[d.unity] = d
}

function datum3(d, Mn)
{
	for (var R = d.ox, r; r = d.rows[R]; R--)
		for (var D = 0, dd; dd = r[D]; D--)
			d.mn = Math.max(datum3(dd, Mn), d.mn)
	if (d.ox > 0 && !d.tv)
		for (var W = 0, w; w = d.bs[W]; W++)
			if ( !w.err && !w.yield && (d.mn >= Mn || w.base.mn >= Mn))
				match(w.base, w.base, d, d, Mn)
	return d.mn > Mn ? d.mn : 0
}

function match(zb, b, za, a, Mn)
{
	if (a.ox < 0)
		return false
	var _ = false, bd, W, w
	for (var r = a.rows[0], D = 0, ad; ad = r[D]; D++)
		if (ad.name && ad.yield >= 0)
			if ((bd = matchBaseUnity(b, a, ad, Mn)) && !bd.err)
				_ = match(ad, ad, bd, bd, Mn) || bd.mn > Mn || _,
				b != zb && matchWire(zb, bd, za, ad, b)
	for (var r = a.rows[a.ox], D = 0, ad; ad = r[D]; D++)
		if (ad.tv >= 0 && ad.name && ad.yield >= 0)
		{
			bd = matchBaseUnity(b, a, ad, Mn)
			if (bd && !bd.err)
			{
				for (w = null, W = ad.bs.length - 1; w = ad.bs[W]; W--)
					if ( !w.err && !w.yield &&
						(w.base == w.zone || w.base.bzer.io < 0 && !w.base.bzer.bs.length))
						break;
				_ = w && W < 0 || match(zb, bd, za, ad, Mn) || bd.mn > Mn || _
			}
			bd && bd.err || matchWire(zb, bd, za, ad, b)
		}
	_ && (b.mn = a.mn = Mn + 1)
	return _
}

function matchBaseUnity(b, a, ad, Mn)
{
	var d = b.us[ad.unity], err
	if (d && d.yield >= 0)
	{
		if (d.tv <= 0 && ad.tv > 0 && !ad.err)
			ad.err = "veto must be matched\n  by '"
				+ b.name + "' and '" + d.name + "' inside",
			ad.show(-1), b.edit.errorN++
		else if (d.tv > 0 && ad.tv <= 0 && !d.err)
			d.err = (d.io < 0 ? "input must not be veto to match\n  '"
				: "output must not be veto to match\n  '")
				+ a.name + "' and '" + ad.name + "' inside",
			d.show(-1), b.edit.errorN++
		return d
	}
	if (ad.tv > 0 && (b.gene || b.layer))
		return null
	for (var z = b; z.io > 0; z = z.zone)
		if (z.unity == ad.unity)
		{
			if (b.cycle == z.zone)
				return z // not yield
			err = 'yield zone must be cycle agent of zone of\
  innermost zone of same unity inside base zoner'
			break;
		}
	if (d) // d.yield < 0
		d.yield = 1,
		d.Tv(ad.tv > 0 ? 1 : 0),
		d.mn = Mn + 1
	else
	{
		d = new Datum(ad.io)
		d.yield = 1
		ad.tv > 0 && (d.tv = 1)
		var r = ad.io < 0 ? 0 : b.ox < 0 ? 1 : b.ox
		d.yR = r, d.yX = b.ox < 0 ? 0 : b.rows[r].length
		d.addTo(b, d.yR, d.yX, false)
		ad.uNext == ad && (a.us[ad.unity] = ad)
		d.unityTo(ad), b.us[ad.unity] = d
		d.us = {}, d.bbs = []
		d.mn = Mn + 1
	}
	if ((d.layer = b.layer))
		d.err = 'Yield forbidden here',
		d.show(-1), b.edit.errorN++
	else if (err)
		d.err = err,
		d.show(-1), b.edit.errorN++
	return d
}

function matchWire(zb, b, za, a, b_)
{
	var a0b9 = a.deep, n = 0, awb, w
	for (var W = 0, aw; aw = a.bbs[W]; W++)
		if (a.azer.zone.deep == aw.deep9)
			n++, aw.deep0 < a0b9 && (a0b9 = aw.deep0)
	if ( !n)
		return
	if ( !b)
	{
		if (a.tv <= 0 && !a.err)
			a.err = "output having base must be matched\n  by '"
				+ (zb == b_ ? b_.name + "'" : zb.name + "' and '" + b_.name + "' inside"),
			a.show(-1), a.edit.errorN++
		return
	}
	a0b9 = a0b9 - a.deep + b.deep, n = 0
	for (var W = 0; bw = b.bbs[W]; W++)
	W: {
		if (bw.from && bw.from.err || bw.deep9 < a0b9
			|| bw.b != zb && bw.b.bzer.io >= 0 && bw.b.base0 <= a0b9)
			continue;
		n++
		if ((awb = zb.deep > bw.deep0 ? bw.b : matchDatum(zb, bw.b, za)))
			for (var WW = 0, aw; aw = a.bbs[WW]; WW++)
				if (aw.b == awb)
					break W // continue
		WW: {
			for (var WW = 0; w = b.bs[WW]; WW++)
				if (w.base == bw.b)
					break WW
			w = new Wire
			w.yield = 1
			bw.b.as.push(w), b.bs.push(w)
			w.addTo(bw.b, b)
		}
		w.yield < 0 && (w.yield = 1)
		if ( !w.err)
			w.err = "wire must match a wire\n  inside '"
				+ za.name + "' with agent '" + a.name + "'",
			w.showing = true,
			b.edit.show(true), b.edit.errorN++
	}
	B: {
		awb = matchDatum(zb, b, za)
		for (var W = 0, aw; aw = a.bbs[W]; W++)
			if (aw.b == awb)
				break B // base outsite cycle agent and agent inside cycle agent
		if ( !n && !b.err)
			for (var W = 0, aw; aw = a.bbs[W]; W++)
				if (aw.b != b)
				{
					b.err = "output must have base to match\n  '"
						+ za.name + "' and '" + a.name + "' inside"
					b.show(-1), b.edit.errorN++
					break;
				}
	}
}

function matchDatum(z, d, zz)
{
	return d == z ? zz : (z = matchDatum(z, d.zone, zz)) && z.us[d.unity]
}

function datum4(d) // TODO bbs = null
{
	for (var R = 0, r; r = d.rows[R]; R++)
		for (var D = r.length - 1, dd; dd = r[D]; D--)
			if (dd.yield < 0)
				dd.unadd(R, D) // ox may < 0
			else
				datum4(dd)
	for (var W = d.ws.length - 1, w; w = d.ws[W]; W--)
		if (w.yield < 0)
			w.base.unagent(w)
	d.us = null
	var e = datumError4(d)
	d.err || (d.err = e)
	d.err && (d.show(-1), d.edit.errorN++)
}

function datumError4(d)
{
	d.mustRun = d.tv >= 0
	if (d.io < 0 && !d.zone.zone && !d.layer)
		return 'your input zone must not be zonest'
	if (d.zv)
		return d.io < 0 ? 'input must not be inside veto' :
			d.io ? 'output must not be inside veto' : 'datum must not be inside veto'
	if (d.zone && !d.zone.gene)
		if ( !d.io)
			return 'agent can only have input and output inside'
		else if ( !d.name && !d.tv)
			return 'non trial inside agent must have name'
	if (d.tv && d.gene)
		return 'gene must not be trial or veto'
	if (d.tv < 0)
		if (d.cycle)
			return 'cycle agent must not be trial'
		else if ( !d.azer.gene && !d.azer.zone.gene)
			return "agent zoner or zoner's zone of trial must be gene"
	if (d.tv > 0)
		if ( !d.io)
			return 'veto must be input or output'
		else if ( !d.name)
			return 'veto must have name'
		else if (d.zone && d.zone.gene)
			return 'veto must be inside agent'
	if (d.uNext != d && d.zone.us[d.unity] != d)
		return 'unity must be different in same zone'
	if (d.io < 0)
		if (d.bs.length && d.zone.io < 0 && !d.zone.bs.length)
			return 'input inside input having no base must not have base'
		else if ( !d.bs.length && d.zone.zone && d.zone.gene)
			return "gene's input must have base"
	Must: if (d.mustRun)
	{
		d.mustRun = false
		var r = d.rows[0]
		if (r)
			for (var D = 0, dd; dd = r[D]; D++)
				if ( !dd.mustRun)
					break Must
		d.mustRun = true
		var n = 0
		for (var W = 0, w; w = d.bs[W]; W++)
			if ( !w.err)
				if (n++, w.base == w.zone || w.base.bzer.io || w.base.bzer.mustRun)
					break Must
		d.mustRun = n == 0
	}
	if (d.io > 0 && d.tv <= 0 && !d.mustRun)
		return d.mustRun = true, 'output must run : not be trial,\
  all its inputs and one of bases must run'
	return ''
}


})()