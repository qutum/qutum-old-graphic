//
// Qutum 10 implementation
// Copyright 2008-2011 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

var Z = Util.dom('#zonest'), ZT = Util.dom('#left > .tool'), E = Util.dom('.editor')
var Zs = {}, Es = {}, Key, tool

Tool()
for (var i = 0; i < localStorage.length; i++)
	Zonest(localStorage.key(i))
i || New()
setInterval(function () { tool && tool() }, 200)

function Zonest(key)
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

function Tool()
{
	var n = Util.add(ZT, 'a')
	Util.text(n, '+')
	Util.text(Util.add(n, 'div'), 'New')
	Util.on(n, 'click', null, New)
	var save = Util.add(ZT, 'a')
	Util.text(save, '<')
	Util.text(Util.add(save, 'div'), 'Save all')
	Util.on(save, 'click', null, SaveAll)
}

function New()
{
	var key = Date.now() + '!'
	if (Es[key])
		throw 'duplicate'
	Zonest(key).scrollIntoView(), Load(key), Save(key)
}

function Load(key)
{
	if (Key)
		Es[Key].dom.style.display = 'none', Zs[Key].className = ''
	var e = Es[key]
	if (e)
		e.dom.style.display = ''
	else
		e = Es[key] = new Edit(Util.add(E, 'div', 'edit'), localStorage.getItem(key))
	setTimeout(function () { e.dom.focus() }, 0)
	e.onUnsave = Unsave
	Zs[key].className = 'active'
	tool = Toolbar(e, Util.dom('.tool', E), Util.dom('.toolv', E))
	return Key = key, e
}

function Save(key)
{
	var e = Es[key], z = Zs[key], out = e.save()
	if (e.zonest.name == key.substr(key.indexOf('!') + 1))
		Unsave()
	else
	{
		var key0 = key, key = Date.now() + '!' + e.zonest.name
		delete Es[key0], delete Zs[key0], Z.removeChild(z)
		Es[key] = e, Zonest(key).scrollIntoView()
		key0 == Key && (Zs[Key = key].className = 'active')
	}
	localStorage.setItem(key, out)
	key0 && localStorage.removeItem(key0)
	e.dom.focus()
}

function Unsave()
{
	for (var k in Es)
	{
		var n = Zs[k].firstChild.textContent
		if (n[0] != '*' != !Es[k].unsave)
			Util.text(Zs[k].firstChild, Es[k].unsave ? '* ' + n : n.substr(2))
	}
}

function SaveAll()
{
	for (var k in Es)
		if (Es[k].unsave)
			Save(k)
}

function Remove(key)
{
	var z = Zs[key], e = Es[key]
	if ( !confirm('Remove ' + key.substr(key.indexOf('!') + 1) + ' ?'))
		return
	delete Es[key], delete Zs[key], Z.removeChild(z)
	if (key == Key)
		Key = null, E.removeChild(e.dom), tool = null,
		Util.dom('.tool', E).innerHTML = Util.dom('.toolv', E).innerHTML = ''
	localStorage.removeItem(key)
	
}

onbeforeunload = function ()
{
	for (var k in Es)
		if (Es[k].unsave)
			return Zs[k].firstChild.textContent + ' unsaved !'
}

Util.dom('#split *').onclick = function ()
{
	document.body.className = document.body.className.replace
		(/[0-9]/, function (i) { return (+i + 2) % 3 })
}

})()