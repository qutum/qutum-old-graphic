//
// Qutum 10 implementation
// Copyright 2008-2011 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Toolbar = function (edit, dom1, dom2)
{
	tool(dom1, '^up', 'Previous focus', 'func-up', edit.navPrev)
	tool(dom1, '^dn', 'Next focus', 'func-down', edit.navNext)
	tool(dom1, 'z', 'Zone', 'z', edit.focZone)
	tool(dom1, 'tb', 'Inner Input, Datum or Output', 'tab or space', edit.focInner)
	tool(dom1, ',', 'Inner Input', ',', edit.focInput)
	tool(dom1, '`', 'Inner Datum', '`', edit.focDatum)
	tool(dom1, '.', 'Inner Output', '.', edit.focOutput)
	tool(dom1, ';', 'Next Unity', ';', edit.focUnity)
	tool(dom1, '[', 'Next Base', '[', edit.focBase, true)
	tool(dom1, ']', 'Next Agent', ']', edit.focAgent, true)
	tool(dom1, '{', 'Base', '{', edit.focBase, false)
	tool(dom1, '}', 'Agent', '}', edit.focAgent, false)
	dom1.appendChild(document.createElement('span'))
	tool(dom1, '-', 'Fold', '- or _', edit.focFold)
	tool(dom1, '=', 'Unfold', '=', edit.focUnfold, 3)
	tool(dom1, '+', 'Unfold deeply', '+', edit.focUnfold, 4)
	tool(dom1, 'lt', 'Left', 'left', edit.focLeft)
	tool(dom1, 'rt', 'Right', 'right', edit.focRight)
	tool(dom1, 'up', 'Up', 'up', edit.focUp)
	tool(dom1, 'dn', 'Down', 'down', edit.focDown)
	tool(dom1, 'hm', 'Leftmost', 'home', edit.focHome)
	tool(dom1, 'en', 'Rightmost', 'end', edit.focEnd)

	tool(dom2, '^lt', 'Undo', 'func-left', edit.com.undo)
	tool(dom2, '^rt', 'Redo', 'func-right', edit.com.redo)
	tool(dom2, 'i', 'Add sibling Input', 'i', edit.com.input, false)
	tool(dom2, 'd', 'Add sibling Datum', 'd', edit.com.datum, false)
	tool(dom2, 'o', 'Add sibling Output', 'o', edit.com.output, false)
	tool(dom2, 'I', 'Add inner Input', 'I', edit.com.input, true)
	tool(dom2, 'D', 'Add inner Datum', 'D', edit.com.datum, true)
	tool(dom2, 'O', 'Add inner Output', 'O', edit.com.output, true)

	function tool(dom, icon, desc, key, click, args)
	{
		var o = document.createElement('a')
		Util.text(o, icon)
		Util.text(o.appendChild(document.createElement('div')), desc + '\nkey: ' + key)
		if (args != edit.Drag)
		{
			args = Array.prototype.slice.call(arguments, 5)
			Util.on(o, 'click', edit.dom, edit.dom.focus)
			Util.on(o, 'click', dom == dom1 ? edit : edit.com, click, args)
			var test = args.concat([ true ])
			setInterval(function ()
			{
				if (click.apply(dom == dom1 ? edit : edit.com, test))
					o.removeAttribute('disabled')
				else
					o.setAttribute('disabled', '')
			}, 300)
		}
		return dom.appendChild(o)
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