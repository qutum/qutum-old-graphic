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
	if (d.kit != (d.kit = d.io >= 0 && ( !d.zone || d.zone.kit && d.bs.length == 0)))
		d.show(-1)
	d.zv = d.zone != null && (d.zone.tv > 0 || d.zone.zv)
	d.cycle = null
	d.yield && (d.yield = -1) // old yield
	d.ns || (d.ns = {})
	d.ps || (d.ps = {})
	d.nNext == d || d.zone.ns[d.nk] || (d.zone.ns[d.nk] = d)
	if (d.or > 0)
	{
		for (var R = 0, dx = 0, r; r = d.rows[R]; R++)
			for (var D = 0, dd; dd = r[D]; D++)
				dd.dx = ++dx, datum1(dd)
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
			d.io ? 'output must not be inside veto' : 'hub must not be inside veto'
	if (d.zone && !d.zone.kit)
		if ( !d.io)
			return 'usage can only have input and output inside'
		else if ( !d.name && !d.tv)
			return 'non trial inside usage must have name'
	if (d.tv && d.kit)
		return 'kit must not be trial or veto'
	if (d.tv < 0 && !d.zu.kit && !d.zu.zone.kit)
		return 'datum which zoner usage and zone is not kit must not be trial'
	if (d.tv > 0)
		if ( !d.io)
			return 'veto must be input or output'
		else if (d.io > 0 && !d.name)
			return 'veto output must have name' // unnamed veto input have no namesake
		else if (d.zone && d.zone.kit)
			return 'veto must be inside usage'
	if (d.nNext != d && d.zone.ns[d.nk] != d)
		return 'namesake must be in different datum'
	if (d.io < 0)
		if (d.bs.length && d.zone.io < 0 && !d.zone.bs.length)
			return 'input inside input having no base must not have base'
		else if ( !d.bs.length && d.zone.zone && d.zone.kit)
			return "kit's input must have base"
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
	var base = w.base, usage = w.usage, zone = w.zone
	if (base.tv < 0 && !base.name) // TODO ? veto ?
		return 'trial base must have name'
	if (usage.tv < 0 && w.base == zone)
		return "trial usage must not be cycle"
	if (base.tv > 0 || base.zv)
		return 'base must not be veto or inside'
	if (usage.tv > 0 && usage.name || usage.zv)
		return 'usage must not be named veto or inside'
	var zu = usage.zu, u, z
	if (base != zone && base.zb != w.bz)
		return "wire must not cross zoner base edge"
	if (zu.deep <= zone.deep)
		return 'zoner usage must be inside wire zone'
	if (base != zone && w.bz.dx >= w.uz.dx) // NaN
		return 'must wire early to later'
	if ( !zone.kit)
		if (base != zone && !base.io)
			return 'wire inside non kit must have input or output base'
		else if ( !usage.io)
			return 'wire inside non kit must have input or output usage'
	for (u = zu.zone; u != zone; u = u.zone)
		if (u.io < 0)
			return 'wire must not cross input edge'
	for (u = zu.zone; u != zone; u = z, z = z.zone)
		if (z = u.zone, !u.kit && z.kit)
			return 'wire must not cross non kit edge from kit'
	return ''
}

function datum2(d)
{
	for (var W = 0, w; w = d.bs[W]; W++)
		if ( !w.err && !w.yield && w.base == w.zone)
			d.cycle = w.base
	d.pdeep0 = d.deep, d.padeep0 = d.deep
	var kzb = 0
	for (var W = d.bs.length - 1, w; w = d.bs[W]; W--)
	{
		if (w.err || w.yield)
			continue;
		var b = w.base, p, pp
		if (b == w.zone && b != d.cycle)
		{
			w.err = [ 'only one cycle ', d.cycle, ' allowed' ] // only the cycle wire is not error
			w.showing = true, d.edit.show(true), d.edit.errorN++
			continue;
		}
		kzb |= b.zb.kzb ? 1 : -1
		if (b.zb.io >= 0 && b != w.zone && b.pdeep0 < w.bz.deep)
			for (var PP in b.ps) // w.zone should be kit
				if (pp = b.ps[PP], pp.zone == w.zone)
				{
					p = new Wire
					p.zone = pp.zone, p.base = pp.base, p.bz = pp.bz
					p.usage = d, p.uz = w.uz
					p.yield = 1
					datumPass2(d, p)
				}
		p || datumPass2(d, w)
	}
	d.kzb = kzb > 0 || d.kit || d.io < 0 && d.zone.kit
	for (var R = 0, r; r = d.rows[R]; R++)
		for (var D = 0, dd; dd = r[D]; D++)
			datum2(dd) // early before later, i.e. base base before usage usage
	d.mn = 0
}

function datumPass2(d, p)
{
	d.ps[p.base.id] = p
	var deep = p.zone.deep, pp
	deep < d.pdeep0 && (d.pdeep0 = deep)
	deep < d.padeep0 && (d.padeep0 = deep) // p.usage == d
	for (var PP in p.base.ps)
		if (pp = p.base.ps[PP], pp.zone.deep <= deep)
		{
			if ( !d.ps[pp.base.id])
				d.ps[pp.base.id] = pp, pp.zone.deep < d.pdeep0 && (d.pdeep0 = pp.zone.deep)
			else if (pp.usage.zu.deep > d.ps[pp.base.id].usage.zu.deep)
				d.ps[pp.base.id] = pp // same zone.deep
		}
}

function datum3(d, Mn)
{
	for (var R = d.or, r; r = d.rows[R]; R--)
		for (var D = r.length - 1, dd; dd = r[D]; D--)
			d.mn = Math.max(datum3(dd, Mn), d.mn)
	if (d.or > 0 && !d.tv)
		for (var W = 0, w; w = d.bs[W]; W++)
			if ( !w.err && !w.yield && (d.mn >= Mn || w.base.mn >= Mn))
				match(w.base, w.base, d, d, false, Mn)
	return d.mn > Mn ? d.mn : 0
}

// base b inside bz matchs usage u inside uz, return true if anything changes
// im is input match considering Datum.kzb always false
function match(bz, b, uz, u, im, Mn)
{
	if (u.or < 0)
		return false
	Assert( !u.kit, 'never match a kit')
	var change = false
	for (var r = u.rows[0], D = 0, ai; ai = r[D]; D++)
		if (ai.name && ai.yield >= 0) // skip no namesake and old yield
		{
			var bi = searchBaseNk(b, u, ai, Mn)
			if (bi && !bi.err)
				change = match(ai, ai, bi, bi, true, Mn) || bi.mn > Mn || change
			if (bi && !bi.err && b != bz)
				matchWire(bz, bi, uz, ai)
		}
	for (var r = u.rows[u.or], D = 0, ao; ao = r[D]; D++)
		if (ao.tv >= 0 && ao.name && ao.yield >= 0) // skip trial and no namesake and old yield
		{
			var bo = searchBaseNk(b, u, ao, Mn)
			if (bo && !bo.err && (im || !ao.kzb))
				change = match(bz, bo, uz, ao, im, Mn) || bo.mn > Mn || change
			if (bo && !bo.err)
				matchWire(bz, bo, uz, ao) // skip null bo since ao is veto
		}
	change && (b.mn = u.mn = Mn + 1)
	return change
}

// search the ad namesake in base b or b cycle
function searchBaseNk(b, u, ad, Mn)
{
	var bd = b.ns[ad.nk]
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
	if (ad.tv > 0 && (b.kit || b.layer))
		return null // don't yield veto inside kit or layer 2
	var err
// TODO must check this ? search ad namesake in cycle base ?
//	for (var z = b; z.io > 0; z = z.zone)
//		if (z.nk == ad.nk)
//		{
//			if (b.cycle == z.zone)
//				return z // not yield
//			err = 'yield zone must be cycle usage of zone of\n\
//  innermost zone of same namesake inside zoner base'
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
		var r = bd.io < 0 ? 0 : b.or < 0 ? 1 : b.or
		bd.addTo(b, r, b.or < 0 ? 0 : b.rows[r].length)
		ad.nNext == ad && (u.ns[ad.nk] = ad), b.ns[ad.nk] = bd
		bd.namesakeTo(ad)
		bd.ns = {}, bd.ps = {}
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

function matchWire(bz, b, uz, u)
{
	if (u.err || NoKey(u.ps))
		return
	var bdeep = b.deep + u.padeep0 - u.deep, bnum = 0, bp
	for (var P in b.ps)
		if (bp = b.ps[P], bp.usage.zu.deep > bdeep) // also bp.usage == b
		{
			bnum++
			var ub = bp.zone.deep < bz.deep ? bp.base : searchZoneNk(bz, bp.base, uz)
			if ( !ub)
				u.err || (u.err = [ 'to match ', b ]),
				u.err.push(',\n  must have a wire matching ', bp.base),
				u.show(-1), u.edit.errorN++
			else if ( !u.ps[ub.id])
				u.err || (u.err = [ 'to match ', b ]),
				u.err.push(',\n  must have a wire matching ', bp.base, ' to match ', ub),
				u.show(-1), u.edit.errorN++
		}
	if ( !bnum)
		u.err || (u.err = [ 'to match ', b ]),
		u.err.push(',\n  must have no base'),
		u.show(-1), u.edit.errorN++
// TODO must check this ?
//	B: { var awb = searchZoneNk(bz, b, uz)
//		if (ArrayFind(u.ps, 'b', awb) != null)
//			break B // base outside cycle usage and usage inside cycle usage
}

// for each d and outside zones inside z, find their unities inside z2, return d namesake
function searchZoneNk(z, d, z2)
{
	return d == z ? z2 : (z = searchZoneNk(z, d.zone, z2)) && z.ns[d.nk]
}

function datum4(d)
{
	for (var R = 0, r; r = d.rows[R]; R++)
		for (var D = r.length - 1, dd; dd = r[D]; D--)
			if (dd.yield < 0)
				dd.unadd(R, D) // .or may < 0
			else
				datum4(dd), dd.err && (d.derr = true)
	for (var W = d.ws.length - 1, w; w = d.ws[W]; W--)
		if (w.yield < 0)
			w.base.unusage(w)
	NoKey(d.ns) || (d.ns = null)
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
		var num = 0
		for (var W = 0, w; w = d.bs[W]; W++)
			if ( !w.err)
				if (num++, w.base == w.zone || w.base.zb.io || w.base.zb.mustRun)
					break Must
		d.mustRun = num == 0
	}
	if (d.io > 0 && d.tv <= 0 && !d.mustRun)
		return d.mustRun = true, 'output must run : not be trial,\
  all its inputs and one of bases must run'
	return ''
}


})()
