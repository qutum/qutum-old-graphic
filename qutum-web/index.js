//
// Qutum 10 implementation
// Copyright 2008-2011 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

var Z = Util.dom('#zonest'), ZT = Util.dom('#left > .tool'), E = Util.dom('.editor')
var Zs = {}, edits = {}, Key, tool

New()
for (var i = 0; i < localStorage.length; i++)
	Add(localStorage.key(i))
i || New(true)

setInterval(function () { tool && tool() }, 200)

function Add(key)
{
	var name = key.substr(key.indexOf('!') + 1)
	var z = Util.add(null, 'div'), n = Util.add(z, 'div', name ? null : 'unnamed')
	Util.text(n, name || 'qutum')
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
	var rem = Util.add(t, 'a')
	Util.text(rem, 'x')
	Util.text(Util.add(rem, 'div'), 'Remove')
	Util.on(rem, 'click', null, Remove, [ key ])
	return Z.appendChild(z)
}

function New(event)
{
	if (event)
	{
		var key = Date.now() + '!'
		if (edits[key])
			throw 'duplicate'
		Add(key).scrollIntoView(), Load(key), Save(key)
		return
	}
	var n = Util.add(ZT, 'a')
	Util.text(n, '+')
	Util.text(Util.add(n, 'div'), 'New')
	Util.on(n, 'click', null, New)
	return n
}

function Remove(key)
{
	var z = Zs[key]
	if ( !confirm('Remove ' + key.substr(key.indexOf('!') + 1) + ' ?'))
		return
	var z = Z.removeChild(Zs[key])
	delete Zs[key] // TODO remove edit and load last one
	localStorage.removeItem(key)
}

function Load(key)
{
	if (Key)
		edits[Key].dom.style.display = 'none', Zs[Key].className = ''
	var e = edits[key]
	e ? e.dom.style.display = ''
	: e = edits[key] = new Edit(Util.add(E, 'div', 'edit'), localStorage.getItem(key))
	setTimeout(function () { e.dom.focus() }, 0)
	e.onUnsave = Unsave
	Zs[key].className = 'active'
	tool = Toolbar(e, Util.dom('.tool', E), Util.dom('.toolV', E))
	return Key = key, e
}

function Save(key)
{
	var e = edits[key], z = Zs[key], out = e.save()
	if (e.zonest.name == key.substr(key.indexOf('!') + 1))
		Unsave()
	else
	{
		var k = Date.now() + '!' + e.zonest.name
		delete edits[key], edits[k] = e
		Z.removeChild(z), delete Zs[key]
		Add(k).scrollIntoView()
		key == Key && (Zs[Key = k].className = 'active')
		key = k
	}
	localStorage.setItem(key, out)
}

function Unsave()
{
	for (var k in Zs)
	{
		var n = Zs[k].firstChild.textContent
		if (n[0] != '*' != !edits[k].unsave)
			Util.text(Zs[k].firstChild, edits[k].unsave ? '* ' + n : n.substr(2))
	}
}

onbeforeunload = function ()
{
	for (var k in edits)
		if (edits[k].unsave)
			return 'Unsaved !'
}

Util.dom('#split *').onclick = function ()
{
	document.body.className = document.body.className.replace
		(/[0-9]/, function (i) { return (+i + 2) % 3 })
}

})()