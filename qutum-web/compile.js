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
	var log = Info('compile ')
	edit.fatal = true, edit.errorN = 0
	datum1(edit.zonest)
	datum2(edit.zonest)
	while (datum3(edit.zonest, edit.zonest.mn))
		;
	datum4(edit.zonest)
	LogTo(log), Info(Date.now() - time, 'ms')
	edit.fatal = false
}
Compile.wire1 = wire1

function datum1(d)
{
	if (d.gene != (d.gene = d.io >= 0 && ( !d.zone || d.zone.gene && d.bs.length == 0)))
		d.show(-1)
	d.zv = d.zone != null && (d.zone.tv > 0 || d.zone.zv)
	d.cycle = null
	d.yield && (d.yield = -1) // old yield
	d.us = {}
	d.qs ? d.qs.length = 0 : d.qs = []
	if (d.ox > 0)
	{
		for (var R = 0, el = 0, r; r = d.rows[R]; R++)
			for (var D = 0, dd; dd = r[D]; D++)
				dd.el = ++el,
				datum1(dd),
				dd.uNext == dd || dd.yield && d.us[dd.unity] || (d.us[dd.unity] = dd)
		for (var W = 0, w; w = d.ws[W]; W++)
			wire1(w)
	}
	d.err && (d.err = null, d.show(-1))
}

function wire1(w)
{
	w.yield && (w.yield = -1)
	if (w.err != (w.err = wireError1(w)))
		w.showing = true, w.edit.show(true)
	w.err && w.edit.errorN++
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
	for (var W = 0, w; w = d.bs[W]; W++)
		if ( !w.err && !w.yield && w.base == w.zone)
			d.cycle = w.base
	d.base0 = d.bs.length ? 1 : d.deep
	for (var W = d.bs.length - 1, w; w = d.bs[W]; W--)
	{
		if (w.err || w.yield)
			continue;
		var b = w.base
		if (d.cycle && b != d.cycle)
		{
			w.err = 'only one base allowed for cycle agent' // only the cycle wire is no error
			w.showing = true, d.edit.show(true), d.edit.errorN++
			continue;
		}
		var q = new Quote
		d.qs.push(q)
		q.b = b
		q.deep0 = w.zone.deep, q.deep9 = d.azer.deep
		d.base0 = Math.max(d.base0, Math.min(b.base0, // already set b.base0
			w.zb.io < 0 ? w.zone.deep : w.zb.deep)) // same if cycle
		for (var Q = 0, bq; bq = b.qs[Q]; Q++)
			if (bq.deep0 <= q.deep0 // skip quotes that cross base edge
				&& ArrayFind(d.qs, 'b', bq.b) == null)
			{
				var qq = new Quote
				d.qs.push(qq)
				qq.b = bq.b, qq.w = w
				qq.deep0 = bq.deep0 // <= q.deep0
				qq.deep9 = bq.deep9 <= q.deep0 ? bq.deep9 // bq outside q zone
					: q.deep9 // bq cross q zone edge
			}
	}
	for (var R = 0, r; r = d.rows[R]; R++)
		for (var D = 0, dd; dd = r[D]; D++)
			datum2(dd) // early before later, i.e. base base before agent agent
	d.mn = 0
}

function datum3(d, Mn)
{
	for (var R = d.ox, r; r = d.rows[R]; R--)
		for (var D = r.length - 1, dd; dd = r[D]; D--)
			d.mn = Math.max(datum3(dd, Mn), d.mn)
	if (d.ox > 0 && !d.tv)
		for (var W = 0, w; w = d.bs[W]; W++)
			if ( !w.err && !w.yield && (d.mn >= Mn || w.base.mn >= Mn))
				match(w.base, w.base, d, d, Mn)
	return d.mn > Mn ? d.mn : 0
}

// base b in zone zb matchs agent a in zone za, return true if anything changes
function match(zb, b, za, a, Mn)
{
	if (a.ox < 0)
		return false
	Assert( !a.gene, 'never match a gene')
	var change = false
	for (var r = a.rows[0], D = 0, ai; ai = r[D]; D++)
		if (ai.name && ai.yield >= 0) // skip no unity and old yield
		{
			var bi = searchBaseUnity(b, a, ai, Mn)
			if (bi && !bi.err)
				change = match(ai, ai, bi, bi, Mn) || bi.mn > Mn || change,
				b != zb && matchWire(zb, bi, za, ai)
		}
	for (var r = a.rows[a.ox], D = 0, ao; ao = r[D]; D++)
		if (ao.tv >= 0 && ao.name && ao.yield >= 0) // skip trial and no unity and old yield
		{
			var bo = searchBaseUnity(b, a, ao, Mn)
			if (bo && !bo.err)
			{
				for (var W = ao.bs.length - 1, w; w = ao.bs[W]; W--)
					if ( !w.err && !w.yield)
						if (w.base == w.zone)
							break;
						else
						{
							Assert(w.base.bzer.io < 0, 'base zoner must be input inside nongene')
							if ( !w.base.bzer.bs.length)
								break;
						}
				if (w || !ao.bs.length)
					change = match(zb, bo, za, ao, Mn) || bo.mn > Mn || change
					// TODO maybe bo.err ?
			}
			if ( !bo)
				matchWire(zb, null, za, ao, b)
			else if ( !bo.err)
				matchWire(zb, bo, za, ao)
		}
	change && (b.mn = a.mn = Mn + 1)
	return change
}

// search the ad unity in base b or b cycle
function searchBaseUnity(b, a, ad, Mn)
{
	var bd = b.us[ad.unity]
	if (bd && bd.yield >= 0)
	{
		if (bd.tv <= 0 && ad.tv > 0 && !ad.err)
			ad.err = [ 'must not be veto to be matched\n  by ', bd ],
			ad.show(-1), b.edit.errorN++
		else if (bd.tv > 0 && ad.tv <= 0 && !bd.err)
			bd.err = [ 'must not be veto to match\n  ', ad ],
			bd.show(-1), b.edit.errorN++
		return bd
	}
	if (ad.tv > 0 && (b.gene || b.layer))
		return null // don't yield veto inside gene or layer 2
	var err
// TODO why check this ? search ad unity in cycle base ?
//	for (var z = b; z.io > 0; z = z.zone)
//		if (z.unity == ad.unity)
//		{
//			if (b.cycle == z.zone)
//				return z // not yield
//			err = 'yield zone must be cycle agent of zone of\n\
//  innermost zone of same unity inside base zoner'
//			break;
//		}
	if (bd) // old yield
		bd.yield = 1,
		bd.Tv(ad.tv > 0 ? 1 : 0),
		bd.mn = Mn + 1
	else
	{
		bd = new Datum(ad.io)
		bd.yield = 1
		ad.tv > 0 && (bd.tv = 1)
		var r = bd.io < 0 ? 0 : b.ox < 0 ? 1 : b.ox
		bd.addTo(b, r, b.ox < 0 ? 0 : b.rows[r].length)
		ad.uNext == ad && (a.us[ad.unity] = ad), b.us[ad.unity] = bd
		bd.unityTo(ad)
		bd.us = {}, bd.qs = []
		bd.mn = Mn + 1
	}
	if ((bd.layer = b.layer))
		bd.err = 'yield must not change layer 2',
		bd.show(-1), b.edit.errorN++
	else if (err)
		bd.err = err,
		bd.show(-1), b.edit.errorN++
	return bd
}

function matchWire(zb, b, za, a, b_)
{
	var a0b9 = a.deep, n = 0, awb, w
	for (var Q = 0, aq; aq = a.qs[Q]; Q++)
		if (a.azer.deep == aq.deep9)
			n++, aq.deep0 < a0b9 && (a0b9 = aq.deep0)
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
	for (var W = 0; bw = b.qs[W]; W++)
	W: {
		if (bw.w && bw.w.err || bw.deep9 <= a0b9
			|| bw.b != zb && bw.b.bzer.io >= 0 && bw.b.base0 <= a0b9)
			continue;
		n++
		if ((awb = zb.deep > bw.deep0 ? bw.b : searchZoneUnity(zb, bw.b, za)))
			for (var WW = 0, aw; aw = a.qs[WW]; WW++)
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
		awb = searchZoneUnity(zb, b, za)
		for (var W = 0, aw; aw = a.qs[W]; W++)
			if (aw.b == awb)
				break B // base outside cycle agent and agent inside cycle agent
		if ( !n && !b.err)
			for (var W = 0, aw; aw = a.qs[W]; W++)
				if (aw.b != b)
				{
					b.err = [ 'output must have base to match\n  ',
						za, ' and ', a, ' inside' ]
					b.show(-1), b.edit.errorN++
					break;
				}
	}
}

// for d and zoners inside z, find their unities inside z2, return d unity
function searchZoneUnity(z, d, z2)
{
	return d == z ? z2 : (z = searchZoneUnity(z, d.zone, z2)) && z.us[d.unity]
}

function datum4(d)
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
	d.us = d.qs = null
	var e = datumError4(d)
	d.err || (d.err = e)
	d.err && (d.show(-1), d.edit.errorN++)
}

function datumError4(d)
{
	d.mustRun = d.tv >= 0
	if (d.io < 0 && !d.zone.zone && !d.layer)
		return 'can not change layer 2'
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