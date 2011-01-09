//
// Qutum 10 implementation
// Copyright 2008-2011 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Toolbar = function (edit, dom1, dom2)
{
	tool(dom1, '^lt', 'Undo', 'func-left', cmd(edit, 'undo'))
	tool(dom1, '^rt', 'Redo', 'func-right', cmd(edit, 'redo'))
	tool(dom1, '^up', 'Previous focus', 'func-up', foc(edit, 'navPrev'))
	tool(dom1, '^dn', 'Next focus', 'func-down', foc(edit, 'navNext'))
	dom1.appendChild(document.createElement('span'))
	tool(dom1, 'z', 'Zone', 'z', foc(edit, 'focZone'))
	tool(dom1, ',', 'Inner Input', ',', foc(edit, 'focInput'))
	tool(dom1, '`', 'Inner Datum', '`', foc(edit, 'focDatum'))
	tool(dom1, '.', 'Inner Output', '.', foc(edit, 'focOutput'))
	tool(dom1, ';', 'Next Unity', ';', foc(edit, 'focUnity'))
	tool(dom1, '[', 'Next Base', '[', foc(edit, 'focBase', true))
	tool(dom1, ']', 'Next Agent', ']', foc(edit, 'focAgent', true))
	tool(dom1, '{', 'Base', '{', foc(edit, 'focBase'))
	tool(dom1, '}', 'Agent', '}', foc(edit, 'focAgent'))
	tool(dom1, '-', 'Fold', '- or _', foc(edit, 'focFold'))
	tool(dom1, '=', 'Unfold', '=', foc(edit, 'focUnfold', 3))
	tool(dom1, '+', 'Unfold deeply', '+', foc(edit, 'focUnfold', 4))
	dom1.appendChild(document.createElement('span'))
	tool(dom1, 'lt', 'Left', 'left', foc(edit, 'focLeft'))
	tool(dom1, 'rt', 'Right', 'right', foc(edit, 'focRight'))
	tool(dom1, 'up', 'Up', 'up', foc(edit, 'focUp'))
	tool(dom1, 'dn', 'Down', 'down', foc(edit, 'focDown'))
	tool(dom1, 'hm', 'Leftmost', 'home', foc(edit, 'focHome'))
	tool(dom1, 'en', 'Rightmost', 'end', foc(edit, 'focEnd'))

	tool(dom2, 'i', 'Add sibling Input', 'i', cmd(edit, 'input'))
	tool(dom2, 'd', 'Add sibling Datum', 'd', cmd(edit, 'datum'))
	tool(dom2, 'o', 'Add sibling Output', 'o', cmd(edit, 'output'))
	tool(dom2, 'I', 'Add inner Input', 'I', cmd(edit, 'input', true))
	tool(dom2, 'D', 'Add inner Datum', 'D', cmd(edit, 'datum', true))
	tool(dom2, 'O', 'Add inner Output', 'O', cmd(edit, 'output', true))
}

function tool(dom, icon, desc, key, click)
{
	var o = document.createElement('a')
	Util.text(o, icon)
	Util.text(o.appendChild(document.createElement('div')), desc + '\nkey: ' + key)
	o.onclick = click
	return dom.appendChild(o)
}

function foc(edit, foc)
{
	var args = Array.prototype.slice.call(arguments, 2)
	return function ()
	{
		edit.dom.focus()
		edit[foc].apply(edit, args)
	}
}
function cmd(edit, cmd)
{
	var args = Array.prototype.slice.call(arguments, 2)
	return function ()
	{
		edit.dom.focus()
		edit.com[cmd].apply(edit.com, args)
	}
}
function drag(edit, drag)
{
	return function ()
	{
		edit.dom.focus()
		drag && edit.Drag(edit.com[cmd])
	}
}

})()