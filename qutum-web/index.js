//
// Qutum 10 implementation
// Copyright 2008-2013 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

var Z = Util.dom('#zonest'), ZT = Util.dom('#left > .tool')
var E = Util.dom('.editor')
var Zs = {}, Es = {}, Key, tooltest

Tool()
Saver.all(Zonest) || New()
setInterval(function () { tooltest && tooltest() }, 200)

function Zonest(key)
{
	var name = Saver.Name(key)
	var z = Util.add(null, 'div')
	Util.text(Util.add(z, 'span'), '*')
	Util.text(Util.add(z, 'span', name ? null : 'unnamed'), name || 'qutum')
	Zs[key] = z
	var t = Util.add(z, 'div', 'tool')
	var load = Util.add(t, 'a')
	Util.text(load, '>')
	Util.text(Util.add(load, 'div'), 'Load')
	Util.on(load, 'click', null, Load, [ key ])
	var save = Util.add(t, 'a')
	Util.text(save, '<')
	Util.text(Util.add(save, 'div'), 'Save')
	Util.on(save, 'click', null, Save, [ key ])
//	case -115: case -83: case -83.5
	var exp = Util.add(t, 'a')
	Util.text(exp, '{')
	Util.text(Util.add(exp, 'div'), 'Export, Click and \n Save Link As...')
	Util.on(exp, 'click', null, Export, [ key ], true)
	var rem = Util.add(t, 'a')
	Util.text(rem, 'x')
	Util.text(Util.add(rem, 'div'), 'Remove')
	Util.on(rem, 'click', null, Remove, [ key ])
	z.exp = exp
	return Z.appendChild(z)
}

function Tool()
{
	var n = Util.add(ZT, 'a')
	Util.text(n, '+')
	Util.text(Util.add(n, 'div'), 'New')
	Util.on(n, 'click', null, New)
	var save = Util.add(ZT, 'a')
	Util.text(save, '<<')
	Util.text(Util.add(save, 'div'), 'Save all')
	var imps = Util.add(ZT, 'input')
	imps.type = 'file', imps.multiple = 'multiple'
	imps.style.display = 'none'
	var imp = Util.add(ZT, 'a')
	Util.text(imp, '}}')
	Util.text(Util.add(imp, 'div'), 'Import')
	Util.on(imps, 'change', null, ImportAll, [ imps ])
	Util.on(imp, 'click', imps, imps.click)
}

function New(Els)
{
	var key = Saver.New()
	Zonest(key).scrollIntoView(), Load(key, Els), Save(key)
	return key
}

function Load(key, Els)
{
	if (Key)
		Es[Key].dom.style.display = 'none', Zs[Key].className = ''
	var e = Es[key]
	if (e)
		e.dom.style.display = ''
	else
	{
		var els = Els || []
		e = Es[key] = new Edit(Util.add(E, 'div', 'edit'), els)
		Saver.load(key, e.zonest, els)
		e.onUnsave = Unsave
		tooltest = Toolbar(e, Util.dom('.tool', E), Util.dom('.toolv', E))
	}
	setTimeout(function () { e.dom.focus() }, 0)
	Zs[Key = key].className = 'active'
	return e
}

function Rename(key, rekey)
{
	Es[rekey] = Es[key], delete Es[key]
	Z.removeChild(Zs[key]), delete Zs[key]
	Zonest(rekey).scrollIntoView()
	key == Key && (Zs[Key = rekey].className = 'active')
}

function Save(key)
{
	var e = Es[key] || Load(key)
	Saver.save(key, e.zonest, Rename)
	e.dom.focus()
	Unsave()
}

function SaveAll()
{
	for (var key in Es)
		Es[k].unsave && Save(key)
}

function Unsave()
{
	for (var key in Es)
		if (Zs[key].firstChild.style.display != 'inline' != !Es[key].unsave)
			Zs[key].firstChild.style.display = Es[key].unsave ? 'inline' : ''
}

onbeforeunload = function ()
{
	for (var key in Es)
		if (Es[key].unsave)
			return (Saver.Name(key) || 'unnamed') + ' unsaved !'
}

function Import(file)
{
	var els = [], key = New(els), e = Es[key]
	Filer.load(key, file, e.zonest, els, function (ok, err)
	{
		if (ok)
			Save(key), e.zonest.show(4), e.show(true, true)

		else
			Remove(key, true), alert('Import ' + file.name + ' Error: ' + err)
	})
}

function ImportAll(files)
{
	var s = []
	for (var i = 0; i < files.files.length; i++)
		s[i] = files.files[i]
	files.value = ''
	for (var i = 0; i < s.length; i++)
		Import(s[i])
}

function Export(key)
{
	var e = Es[key] || Load(key), z = Zs[key]
	if ( !z.exp.getAttribute('href'))
		Filer.save(key, e.zonest, function (ok, enc)
		{
			if (ok)
				z.exp.href = enc
			else
				alert('Export ' + Saver.Name(key) + ' Error: ' + enc)
		})
	else
		z.exp.removeAttribute('href')
}

function Remove(key, force)
{
	var z = Zs[key], e = Es[key]
	if ( !force && !confirm('Remove ' + (Saver.Name(key) || 'unnamed') + ' ?'))
		return
	Saver.remove(key)
	delete Es[key], delete Zs[key], Z.removeChild(z)
	if (key == Key)
		Key = null, E.removeChild(e.dom), tooltest = null,
		Util.dom('.tool', E).innerHTML = Util.dom('.toolv', E).innerHTML = ''
}

Util.dom('#split *').onclick = function ()
{
	document.body.className = document.body.className.replace
		(/[0-9]/, function (i) { return (+i + 2) % 3 })
}

})()