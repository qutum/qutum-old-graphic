//
// Qutum 10 implementation
// Copyright 2008-2011 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function(){

var edits = {}, edit, tool
setInterval(function () { tool && tool() }, 200)

dom('#zonest .unnamed').onclick = function ()
{
	var name = '!qutum' + Date.now()
	edit && (edit.dom.style.display = 'none')
	edits[name] = edit = openEdit(dom('.editor'))
}
function openEdit(editor, edit)
{
	if ( !edit)
		edit = editor.appendChild(document.createElement('div')),
		edit.className = 'edit', edit = new Edit(edit)
	tool = Toolbar(edit, dom('.tool', editor), dom('.toolV', editor))
	setTimeout(function () { edit.dom.focus() }, 0)
	return edit
}

dom('#split *').onclick = function ()
{
	document.body.className = document.body.className.replace
		(/[0-9]/, function (i) { return (+i + 2) % 3 })
}

function dom(css, node)
{
	return (node || document).querySelector(css)
}

})()