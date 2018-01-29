//
// Qutum 10 implementation
// Copyright 2008-2013 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

Toolbar = function (edit, dom1, dom2)
{
	var test
	dom1.innerHTML = dom2.innerHTML = ''

	com(dom1, '^lt', 'Undo', 'func-left or func-z', edit.com.undo)
	com(dom1, '^rt', 'Redo', 'func-right or func-y', edit.com.redo)
	Util.add(dom1, 'span')
	foc(dom1, '\\n', 'Change name', 'enter', edit.nowName, true)
	com(dom1, 'i', 'Add sibling Input', 'i', edit.com.input, false)
	com(dom1, 'h', 'Add sibling Hub', 'h', edit.com.hub, false)
	com(dom1, 'o', 'Add sibling Output', 'o', edit.com.output, false)
	com(dom1, 'I', 'Add inner Input', 'I', edit.com.input, true)
	com(dom1, 'H', 'Add inner Hub', 'H', edit.com.hub, true)
	com(dom1, 'O', 'Add inner Output', 'O', edit.com.output, true)
	Util.add(dom1, 'span')
	drag(dom1, 'e', 'Move early', 'e', edit.com.early)
	drag(dom1, 'l', 'Move later', 'l', edit.com.later)
	drag(dom1, 'E', 'Move early', 'E', edit.com.earlyRow)
	drag(dom1, 'L', 'Move later', 'L', edit.com.laterRow)
	drag(dom1, 'n', 'Be Namesake of', 'n', edit.com.namesake)
	drag(dom1, 'b', 'Add or change Base', 'b', edit.com.base)
	drag(dom1, 'u', 'Add or change Usage', 'u', edit.com.usage)
	com(dom1, '?', 'Be Trial or not', '? or t', edit.com.trialVeto, -1)
	com(dom1, '!', 'Be Veto or not', '! or v', edit.com.trialVeto, 1)
	com(dom1, 'y', 'Be not Yield', 'y', edit.com.nonyield)
	Util.add(dom1, 'span')
	com(dom1, '^\\n', 'Break a row', 'func-enter', edit.com.breakRow)
	com(dom1, 'bk', 'Remove left', 'backspace', edit.com.removeLeft)
	com(dom1, 'del', 'Remove self', 'delete', edit.com.remove)
	com(dom1, '^bk', 'Remove right', 'func-backspace or func-delete', edit.com.removeRight)
	foc(dom1, 'esc', 'Cancel', 'esc', edit.nowOk, false)

	foc(dom2, '^up', 'Previous focus', 'func-up', edit.navPrev)
	foc(dom2, '^dn', 'Next focus', 'func-down', edit.navNext)
	foc(dom2, 'z', 'Zone', 'z or func-tab', edit.focZone)
	foc(dom2, 'tab', 'Inner Datum', 'tab or space', edit.focInner)
	foc(dom2, ',', 'Inner Input', ',', edit.focInput)
	foc(dom2, '`', 'Inner Hub', '`', edit.focHub)
	foc(dom2, '.', 'Inner Output', '.', edit.focOutput)
	foc(dom2, ';', 'Next Namesake', ';', edit.focNamesake, false)
	foc(dom2, ':', 'Previous Namesake', ':', edit.focNamesake, true)
	foc(dom2, '[', 'Next Base', '[', edit.focBase, true)
	foc(dom2, ']', 'Next Usage', ']', edit.focUsage, true)
	foc(dom2, '{', 'Base', '{', edit.focBase, false)
	foc(dom2, '}', 'Usage', '}', edit.focUsage, false)
	Util.add(dom2, 'span')
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
		var o = Util.add(dom, 'a')
		Util.text(o, icon)
		var e = Util.add(Util.text(Util.add(o, 'div'), desc + '\nkey: ' + key), 'span')
		Util.on(o, 'click', edit.dom, edit.dom.focus)
		var last = test
		if (This != edit.Drag)
		{
			args = Array.prototype.slice.call(arguments, 6)
			Util.on(o, 'click', This, click, args)
			var tests = args.concat([ true ])
			test = function ()
			{
				last && last()
				var err = click.apply(This, tests)
				if (This == edit)
					err = err != true && (typeof err=='string' ? err : 'not available')
				if (err)
					o.setAttribute('disabled', ''), err && Util.text(e, '\n' + err)
				else
					o.removeAttribute('disabled'), Util.text(e, '')
			}
		}
		else
		{
			Util.on(o, 'click', edit, edit.Drag, [ click, true ])
			var tests = [ null, true ]
			test = function ()
			{
				last && last()
				var err = edit.drag == click ? edit.dragerr : click.apply(edit.com, tests)
				if (err)
					o.setAttribute('disabled', ''), Util.text(e, '\n' + err)
				else
					o.removeAttribute('disabled'), Util.text(e, '')
			}
		}
	}
}

})()
