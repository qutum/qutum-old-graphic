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
	if (edit.errorN > 0)
		LogTo(log), Err(' ', edit.errorN, 'errors')
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
	d.us || (d.us = {})
	d.ps || (d.ps = {})
	d.uNext == d || d.yield && d.zone.us[d.unity] || (d.zone.us[d.unity] = d)
	if (d.ox > 0)
	{
		for (var R = 0, el = 0, r; r = d.rows[R]; R++)
			for (var D = 0, dd; dd = r[D]; D++)
				dd.el = ++el, datum1(dd)
		for (var W = 0, w; w = d.ws[W]; W++)
			wire1(w)
	}
	d.err && (d.err = '', d.show(-1))
	if (d.yield >= 0)
		(d.err = datumError1(d)) && (d.show(-1), d.edit.errorN++)
}

function datumError1(d)
{
	if (d.io < 0 && !d.zone.zone && !d.layer)
		return 'can not change layer 2'
	if (d.zv)
		return d.io < 0 ? 'input must not be inside veto' :
			d.io ? 'output must not be inside veto' : 'nonput must not be inside veto'
	if (d.zone && !d.zone.gene)
		if ( !d.io)
			return 'agent can only have input and output inside'
		else if ( !d.name && !d.tv)
			return 'non trial inside agent must have name'
	if (d.tv && d.gene)
		return 'gene must not be trial or veto'
	if (d.tv < 0 && !d.za.gene && !d.za.zone.gene)
		return 'datum which zoner agent and zone is not gene must not be trial'
	if (d.tv > 0)
		if ( !d.io)
			return 'veto must be input or output'
		else if (d.io > 0 && !d.name)
			return 'veto output must have name' // unnamed veto input have no unity
		else if (d.zone && d.zone.gene)
			return 'veto must be inside agent'
	if (d.uNext != d && d.zone.us[d.unity] != d)
		return 'unity must be different in same zone'
	if (d.io < 0)
		if (d.bs.length && d.zone.io < 0 && !d.zone.bs.length)
			return 'input inside input having no base must not have base'
		else if ( !d.bs.length && d.zone.zone && d.zone.gene)
			return "gene's input must have base"
	return ''
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
	var base = w.base, agent = w.agent, zone = w.zone
	if (base.tv < 0 && !base.name) --TODO ? veto ?
		return 'trial base must have name'
	if (agent.tv < 0 && w.base == zone)
		return "trial agent must not be cycle"
	if (base.tv > 0 || base.zv)
		return 'base must not be veto or inside'
	if (agent.tv > 0 && agent.name || agent.zv)
		return 'agent must not be named veto or inside'
	var za = agent.za, a, z
	if (base != zone && base.zb != w.bz)
		return "wire must not cross base zone edge"
	if (za.deep <= zone.deep)
		return 'zoner agent must be inside wire zone'
	if (base != zone && w.bz.el >= w.az.el) // NaN
		return 'must wire early to later'
	if ( !zone.gene)
		if (base != zone && !base.io)
			return 'wire inside non gene must have input or output base'
		else if ( !agent.io)
			return 'wire inside non gene must have input or output agent'
	for (a = za.zone; a != zone; a = a.zone)
		if (a.io < 0)
			return 'wire must not cross input edge'
	for (a = za.zone; a != zone; a = z, z = z.zone)
		if (z = a.zone, !a.gene && z.gene)
			return 'wire must not cross non gene edge from gene'
	return ''
}

function datum2(d)
{
	for (var W = 0, w; w = d.bs[W]; W++)
		if ( !w.err && !w.yield && w.base == w.zone)
			d.cycle = w.base
	d.pdeep0 = d.deep, d.padeep0 = d.deep
	var gzb = 0
	for (var W = d.bs.length - 1, w; w = d.bs[W]; W--)
	{
		if (w.err || w.yield)
			continue;
		var b = w.base, p, pp
// TODO must only one base ?
//		if (d.cycle && b != d.cycle)
//			w.err = 'only one base allowed for cycle agent' // only the cycle wire is not error
//			...
		if (b == w.zone && b != d.cycle)
		{
			w.err = [ 'only one cycle ', d.cycle, ' allowed' ] // only the cycle wire is not error
			w.showing = true, d.edit.show(true), d.edit.errorN++
			continue;
		}
		gzb |= b.zb.gzb ? 1 : -1
		if (b.zb.io >= 0 && b != w.zone && b.pdeep0 < w.bz.deep)
			for (var PP in b.ps) // w.zone should be gene
				if (pp = b.ps[PP], pp.zone == w.zone)
				{
					p = new Wire
					p.zone = pp.zone, p.base = pp.base, p.bz = pp.bz
					p.agent = d, p.az = w.az
					p.yield = 1
					datumPass2(d, p)
				}
		p || datumPass2(d, w)
	}
	d.gzb = gzb > 0 || d.gene || d.io < 0 && d.zone.gene
	for (var R = 0, r; r = d.rows[R]; R++)
		for (var D = 0, dd; dd = r[D]; D++)
			datum2(dd) // early before later, i.e. base base before agent agent
	d.mn = 0
}

function datumPass2(d, p)
{
	d.ps[p.base.id] = p
	var deep = p.zone.deep, pp
	deep < d.pdeep0 && (d.pdeep0 = deep)
	deep < d.padeep0 && (d.padeep0 = deep) // p.agent == d
	for (var PP in p.base.ps)
		if (pp = p.base.ps[PP], pp.zone.deep <= deep)
		{
			if ( !d.ps[pp.base.id])
				d.ps[pp.base.id] = pp, pp.zone.deep < d.pdeep0 && (d.pdeep0 = pp.zone.deep)
			else if (pp.agent.za.deep > d.ps[pp.base.id].agent.za.deep)
				d.ps[pp.base.id] = pp // same zone.deep
		}
}

function datum3(d, Mn)
{
	for (var R = d.ox, r; r = d.rows[R]; R--)
		for (var D = r.length - 1, dd; dd = r[D]; D--)
			d.mn = Math.max(datum3(dd, Mn), d.mn)
	if (d.ox > 0 && !d.tv)
		for (var W = 0, w; w = d.bs[W]; W++)
			if ( !w.err && !w.yield && (d.mn >= Mn || w.base.mn >= Mn))
				match(w.base, w.base, d, d, false, Mn)
	return d.mn > Mn ? d.mn : 0
}

// base b inside bz matchs agent a inside az, return true if anything changes
// im is input match considering Datum.gzb always false
function match(bz, b, az, a, im, Mn)
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
				change = match(ai, ai, bi, bi, true, Mn) || bi.mn > Mn || change
			if (bi && !bi.err && b != bz)
				matchWire(bz, bi, az, ai)
		}
	for (var r = a.rows[a.ox], D = 0, ao; ao = r[D]; D++)
		if (ao.tv >= 0 && ao.name && ao.yield >= 0) // skip trial and no unity and old yield
		{
			var bo = searchBaseUnity(b, a, ao, Mn)
			if (bo && !bo.err && (im || !ao.gzb))
				change = match(bz, bo, az, ao, im, Mn) || bo.mn > Mn || change
			if (bo && !bo.err)
				matchWire(bz, bo, az, ao) // skip null bo since ao is veto
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
// TODO must check this ? search ad unity in cycle base ?
//	for (var z = b; z.io > 0; z = z.zone)
//		if (z.unity == ad.unity)
//		{
//			if (b.cycle == z.zone)
//				return z // not yield
//			err = 'yield zone must be cycle agent of zone of\n\
//  innermost zone of same unity inside zoner base'
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
		bd.us = {}, bd.ps = {}
		bd.mn = Mn + 1
	}
	if ((bd.layer = b.layer))
		err = 'yield must not change layer 2'
	else
		err = datumError1(bd)
	if (err)
		bd.err = err, bd.show(-1), b.edit.errorN++
	return bd
}

function matchWire(bz, b, az, a)
{
	if (a.err || NoKey(a.ps))
		return
	var bdeep = b.deep + a.padeep0 - a.deep, n = 0, bp
	for (var P in b.ps)
		if (bp = b.ps[P], bp.agent.za.deep > bdeep) // also bp.agent == b
		{
			n++
			var ab = bp.zone.deep < bz.deep ? bp.base : searchZoneUnity(bz, bp.base, az)
			if ( !ab)
				a.err || (a.err = [ 'to match ', b ]),
				a.err.push(',\n  must have a wire matching ', bp.base),
				a.show(-1), a.edit.errorN++
			else if ( !a.ps[ab.id])
				a.err || (a.err = [ 'to match ', b ]),
				a.err.push(',\n  must have a wire matching ', bp.base, ' to match ', ab),
				a.show(-1), a.edit.errorN++
		}
	if ( !n)
		a.err || (a.err = [ 'to match ', b ]),
		a.err.push(',\n  must have no base'),
		a.show(-1), a.edit.errorN++
// TODO must check this ?
//	B: { var awb = searchZoneUnity(bz, b, az)
//		if (ArrayFind(a.ps, 'b', awb) != null)
//			break B // base outside cycle agent and agent inside cycle agent
}

// for each d and outside zones inside z, find their unities inside z2, return d unity
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
				datum4(dd), dd.err && (d.derr = true)
	for (var W = d.ws.length - 1, w; w = d.ws[W]; W--)
		if (w.yield < 0)
			w.base.unagent(w)
	NoKey(d.us) || (d.us = null)
	NoKey(d.ps) || (d.ps = null)
	var e = datumRun4(d)
	if ( !d.err)
		(d.err = e) && (d.show(-1), d.edit.errorN++)
}

function datumRun4(d)
{
	d.mustRun = d.tv >= 0
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
				if (n++, w.base == w.zone || w.base.zb.io || w.base.zb.mustRun)
					break Must
		d.mustRun = n == 0
	}
	if (d.io > 0 && d.tv <= 0 && !d.mustRun)
		return d.mustRun = true, 'output must run : not be trial,\
  all its inputs and one of bases must run'
	return ''
}


})()