//
// Qutum 10 implementation
// Copyright 2008-2013 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

var Z = Util.dom('#zonest'), T = Util.dom('#left > .tool'), E = Util.dom('.editor')
var Zs = {}, Es = {}, Key
var toolbar

(function(){
	var o = Util.add(T, 'a')
	Util.text(o, '+')
	Util.text(Util.add(o, 'div'), 'New')
	Util.on(o, 'click', null, New)
	var o = Util.add(T, 'a')
	Util.text(o, '<<')
	Util.text(Util.add(o, 'div'), 'Save all')
	Util.on(o, 'click', null, saveAll)
	var oo = Util.add(T, 'input')
	oo.type = 'file', oo.multiple = 'multiple'
	oo.style.display = 'none'
	Util.on(oo, 'change', null, importAll, [ oo ])
	var o = Util.add(T, 'a')
	Util.text(o, '}}')
	Util.text(Util.add(o, 'div'), 'Import, Click or Drop')
	Util.on(o, 'click', oo, oo.click)
	Util.on(o, 'dragover', null, importDrag, false)
	Util.on(o, 'dragenter', null, importDrag, false)
	Util.on(o, 'dragleave', null, importUndrag, false)
	Util.on(o, 'drop', null, importDrop, false)
	var o = Util.add(T, 'a')
	Util.text(o, '{{')
	Util.text(Util.add(o, 'div'), 'Export all')
	Util.on(o, 'click', null, exportAll)
})()

Saver.all(zonest) || New()
setInterval(function () { toolbar && toolbar() }, 200)

function zonest(key)
{
	var name = Saver.name(key)
	var z = Util.add(null, 'div')
	Util.text(Util.add(z, 'span'), '*')
	Util.text(Util.add(z, 'span', name ? null : 'unnamed'), name || 'qutum')
	Zs[key] = z
	var t = Util.add(z, 'div', 'tool')
	var o = Util.add(t, 'a')
	Util.text(o, '>')
	Util.text(Util.add(o, 'div'), 'Load')
	Util.on(o, 'click', null, load, [ key ])
//	case -115: case -83: case -83.5
	var o = Util.add(t, 'a')
	Util.text(o, '<')
	Util.text(Util.add(o, 'div'), 'Save')
	Util.on(o, 'click', null, save, [ key ])
	var o = Util.add(t, 'a')
	Util.text(o, '{')
	Util.text(Util.add(o, 'div'), 'Export, Click and \n Save Link As...')
	Util.on(o, 'click', null, Export, [ key ], true)
	z.Export = o
	var o = Util.add(t, 'a')
	Util.text(o, 'x')
	Util.text(Util.add(o, 'div'), 'Remove')
	Util.on(o, 'click', null, remove, [ key ])
	return Z.appendChild(z)
}

function New(Els)
{
	var key = Saver.New()
	zonest(key).scrollIntoView(), load(key, Els), save(key)
	return key
}

function load(key, Els)
{
	if (Key)
		Es[Key].dom.style.display = 'none', Zs[Key].className = ''
	var e = Es[key]
	if (e)
		e.dom.style.display = '', e.show()
	else
	{
		var els = Els || []
		e = Es[key] = new Edit(Util.add(E, 'div', 'edit'), els)
		Saver.load(key, e.zonest, els)
		e.onUnsave = unsave
	}
	toolbar = Toolbar(e, Util.dom('.tool', E), Util.dom('.toolv', E))
	setTimeout(function () { e.dom.focus() }, 0)
	Zs[Key = key].className = 'active'
	return e
}

function rename(key, rekey)
{
	Es[rekey] = Es[key], delete Es[key]
	Z.removeChild(Zs[key]), delete Zs[key]
	zonest(rekey).scrollIntoView()
	key == Key && (Zs[Key = rekey].className = 'active')
}

function save(key)
{
	var e = Es[key] || load(key)
	Saver.save(key, e.zonest, rename)
	e.dom.focus()
	unsave()
}

function saveAll()
{
	for (var key in Es)
		Es[key].unsave && save(key)
}

function unsave()
{
	for (var key in Es)
		if (Zs[key].firstChild.style.display != 'inline' != !Es[key].unsave)
			Zs[key].firstChild.style.display = Es[key].unsave ? 'inline' : ''
}

onbeforeunload = function ()
{
	for (var key in Es)
		if (Es[key].unsave)
			return (Saver.name(key) || 'unnamed') + ' unsaved !'
}

function Import(file)
{
	var els = [], key = New(els), e = Es[key]
	Filer.load(key, file, e.zonest, els, function (ok, err)
	{
		if (ok)
			save(key), e.zonest.show(4), e.show(true)

		else
			remove(key, true), alert('Import ' + file.name + ' Error: ' + err)
	})
}
function importAll(files)
{
	var s = []
	for (var i = 0; i < files.files.length; i++)
		s[i] = files.files[i]
	files.value = ''
	for (var i = 0; i < s.length; i++)
		Import(s[i])
}
function importDrag(e)
{
	e.target.className = 'hover'
	e.preventDefault()
}
function importUndrag(e)
{
	e.target.className = ''
	e.preventDefault()
}
function importDrop(e)
{
	e.target.className = ''
	e.preventDefault()
	importAll(e.dataTransfer)
}

function Export(key)
{
	var e = Es[key] || load(key), z = Zs[key]
	if ( !z.Export.getAttribute('href'))
		Filer.save(key, e.zonest, function (ok, enc)
		{
			if (ok)
				z.Export.href = enc
			else
				alert('Export ' + Saver.name(key) + ' Error: ' + enc)
		})
	else
		z.Export.removeAttribute('href')
}

function exportAll()
{
	for (var key in Zs)
		Export(key)
}

function remove(key, force)
{
	var z = Zs[key], e = Es[key]
	if ( !force && !confirm('Remove ' + (Saver.name(key) || 'unnamed') + ' ?'))
		return
	Saver.remove(key)
	delete Es[key], delete Zs[key], Z.removeChild(z)
	if (key == Key)
		Key = null, E.removeChild(e.dom), toolbar = null,
		Util.dom('.tool', E).innerHTML = Util.dom('.toolv', E).innerHTML = ''
}

Util.dom('#split *').onclick = function ()
{
	document.body.className = document.body.className.replace
		(/[0-9]/, function (i) { return (+i + 2) % 3 })
}

})()