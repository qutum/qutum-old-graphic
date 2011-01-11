//
// Qutum 10 implementation
// Copyright 2008-2011 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Toolbar = function (edit, dom1, dom2, test)
{
	dom1.innerHTML = dom2.innerHTML = ''

	com(dom1, '^lt', 'Undo', 'func-left', edit.com.undo)
	com(dom1, '^rt', 'Redo', 'func-right', edit.com.redo)
	dom1.appendChild(document.createElement('span'))
	foc(dom1, '\\n', 'Change name', 'enter', edit.nowName, true)
	com(dom1, 'i', 'Add sibling Input', 'i', edit.com.input, false)
	com(dom1, 'd', 'Add sibling Datum', 'd', edit.com.datum, false)
	com(dom1, 'o', 'Add sibling Output', 'o', edit.com.output, false)
	com(dom1, 'I', 'Add inner Input', 'I', edit.com.input, true)
	com(dom1, 'D', 'Add inner Datum', 'D', edit.com.datum, true)
	com(dom1, 'O', 'Add inner Output', 'O', edit.com.output, true)
	dom1.appendChild(document.createElement('span'))
	drag(dom1, 'e', 'Move early', 'e', edit.com.early)
	drag(dom1, 'l', 'Move later', 'l', edit.com.later)
	drag(dom1, 'E', 'Move early', 'E', edit.com.earlyRow)
	drag(dom1, 'L', 'Move early', 'L', edit.com.laterRow)
	drag(dom1, 'u', 'As Unity of, both Input or Output with name', 'u', edit.com.unity)
	drag(dom1, 'b', 'Add or change Base', 'b', edit.com.base)
	drag(dom1, 'a', 'Add or change Agent', 'a', edit.com.agent)
	com(dom1, '?', 'Be Trial or not', '? or t', edit.com.trialVeto, -1)
	com(dom1, '!', 'Be Veto or not', '! or v', edit.com.trialVeto, 1)
	com(dom1, 'y', 'Be not Yield', 'y', edit.com.nonyield)
	dom1.appendChild(document.createElement('span'))
	com(dom1, '^\\n', 'Break a row', 'func-enter', edit.com.breakRow)
	com(dom1, 'bk', 'Remove left', 'backspace', edit.com.removeLeft)
	com(dom1, 'del', 'Remove self', 'delete', edit.com.remove)
	com(dom1, '^bk', 'Remove right', 'func-backspace or func-delete', edit.com.removeRight)
	com(dom1, '^\\n', 'Break a row', 'func-enter', edit.com.breakRow)
	foc(dom1, 'esc', 'Cancel', 'esc', edit.nowOk, false)

	foc(dom2, '^up', 'Previous focus', 'func-up', edit.navPrev)
	foc(dom2, '^dn', 'Next focus', 'func-down', edit.navNext)
	foc(dom2, 'z', 'Zone', 'z or func-tab', edit.focZone)
	foc(dom2, 'tb', 'Inner Input, Datum or Output', 'tab or space', edit.focInner)
	foc(dom2, ',', 'Inner Input', ',', edit.focInput)
	foc(dom2, '`', 'Inner Datum', '`', edit.focDatum)
	foc(dom2, '.', 'Inner Output', '.', edit.focOutput)
	foc(dom2, ';', 'Next Unity', ';', edit.focUnity)
	foc(dom2, '[', 'Next Base', '[', edit.focBase, true)
	foc(dom2, ']', 'Next Agent', ']', edit.focAgent, true)
	foc(dom2, '{', 'Base', '{', edit.focBase, false)
	foc(dom2, '}', 'Agent', '}', edit.focAgent, false)
	dom2.appendChild(document.createElement('span'))
	foc(dom2, '-', 'Fold', '- or _', edit.focFold)
	foc(dom2, '=', 'Unfold', '=', edit.focUnfold, 3)
	foc(dom2, '+', 'Unfold deeply', '+', edit.focUnfold, 4)
	foc(dom2, 'lt', 'Left', 'left', edit.focLeft)
	foc(dom2, 'rt', 'Right', 'right', edit.focRight)
	foc(dom2, 'up', 'Up', 'up', edit.focUp)
	foc(dom2, 'dn', 'Down', 'down', edit.focDown)
	foc(dom2, 'hm', 'Leftmost', 'home', edit.focHome)
	foc(dom2, 'end', 'Rightmost', 'end', edit.focEnd)

	return test(), test

	function foc()
	{
		tool.apply(null, Array.prototype.concat.apply([ edit ], arguments))
	}
	function com()
	{
		tool.apply(null, Array.prototype.concat.apply([ edit.com ], arguments))
	}
	function drag()
	{
		tool.apply(null, Array.prototype.concat.apply([ edit.Drag ], arguments))
	}
	function tool(This, dom, icon, desc, key, click, args)
	{
		var o = dom.appendChild(document.createElement('a'))
		Util.text(o, icon)
		Util.text(o.appendChild(document.createElement('div')), desc + '\nkey: ' + key)
		Util.on(o, 'click', edit.dom, edit.dom.focus)
		if (This != edit.Drag)
		{
			args = Array.prototype.slice.call(arguments, 6)
			Util.on(o, 'click', This, click, args)
			var test0 = test, tests = args.concat([ true ])
			test = function ()
			{
				test0 && test0()
				if (click.apply(This, tests))
					o.removeAttribute('disabled')
				else
					o.setAttribute('disabled', '')
			}
		}
		else
		{
			Util.on(o, 'click', edit, This, [ click, true ])
			var test0 = test
			test = function ()
			{
				test0 && test0()
				if (edit.drag != click || edit.dragable)
					o.removeAttribute('disabled')
				else
					o.setAttribute('disabled', '')
			}
		}
	}
}

})()