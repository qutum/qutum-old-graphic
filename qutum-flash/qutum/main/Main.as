//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.main
{
import flash.display.Shape;
import flash.display.StageAlign;
import flash.display.StageScaleMode;
import flash.events.ContextMenuEvent;
import flash.events.ErrorEvent;
import flash.events.Event;
import flash.events.IOErrorEvent;
import flash.events.MouseEvent;
import flash.events.SecurityErrorEvent;
import flash.external.ExternalInterface;
import flash.geom.Rectangle;
import flash.net.FileReference;
import flash.net.URLRequest;
import flash.net.navigateToURL;
import flash.system.Security;
import flash.ui.ContextMenu;
import flash.ui.ContextMenuItem;
import flash.utils.ByteArray;

import qutum.edit.Edit;


public class Main extends Widget
{
	var menu:Menu
	var tool:Tool
	var file:FileReference = new FileReference
	var fileName:String
	var edit:Edit
	var vert:Scroll
	var hori:Scroll
	var inactive:Shape

	public function Main()
	{
		stage.scaleMode = StageScaleMode.NO_SCALE
		stage.align = StageAlign.TOP_LEFT
		stage.stageFocusRect = false
		contextMenu = new ContextMenu
		contextMenu.hideBuiltInItems()
		var m:ContextMenuItem = new ContextMenuItem('Qutum 10 Help')
		m.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, help)
		contextMenu.customItems.push(m)

		event(0)
		menu = new Menu(this)
		menu.attach(Eventy.NEW, New)
			.attach(Eventy.LOAD, load)
			.attach(Eventy.SAVE, save)
			.attach(Eventy.RUN, run)
		tool = new Tool(this)
		vert = new Scroll(this, false)
		hori = new Scroll(this, true)
		vert.attach(Eventy.SCROLL, editVert)
		hori.attach(Eventy.SCROLL, editHori)

		Security.allowDomain('*')
		if (ExternalInterface.available)
			try
			{
				ExternalInterface.marshallExceptions = true
				ExternalInterface.addCallback('unsaved', unsaved)
			}
			catch (e)
			{
				new Info(stage, e, this, true).addOk()
			}
		stage.addEventListener(Event.RESIZE, resize)
		attach(Eventy.SHOW, editShow)
		stage.addEventListener(MouseEvent.MOUSE_WHEEL, editShow)
		file.addEventListener(SecurityErrorEvent.SECURITY_ERROR, fileErr)
		file.addEventListener(IOErrorEvent.IO_ERROR, fileErr)
		New()
	}

	private function resize(e = null)
	{
		var w:Number = stage.stageWidth, h:Number = stage.stageHeight
		menu.size(w, Menu.H)
		tool.size(Tool.W, h)
		vert.xy(w - 16, Menu.H).size(16, h - Menu.H)
		hori.xy(Tool.W, h - 16).size(w - Tool.W - 16, 16)
		edit.size(w - 16 - Tool.W, h - 16 - Menu.H)
		edit.attach(Eventy.UNSAVE, editUnsave)
		editShow()
	}

	private function New(e = null)
	{
		if (edit && edit.unsave && !(e is Event && e.type == Eventy.OK))
		{
			var i:Info = new Info(stage, 'New', this)
			i.body.style(true).add(fileName).style(false)
				.add(' Unsaved !\nDiscard it ?')
			i.addYes(false).addNo(true)
			i.attach(Eventy.OK, New)
			return
		}
		menu.file.str(fileName = 'qutum.q')
		menu.unsave.str('')
		edit && edit.close()
		edit = new Edit(this)
		edit.xy(Tool.W, Menu.H)
		resize()
		edit.keyon()
	}

	private function editShow(e = null)
	{
		var me:MouseEvent = e as MouseEvent
		me && edit.scrollDelta
			(me.ctrlKey ? - me.delta * 100 : 0, me.ctrlKey ? 0 : - me.delta * 100)
		var r:Rectangle = edit.scrollRect
		hori.change(r.x, vert.x - Tool.W, edit.width)
		vert.change(r.y, hori.y - Menu.H, edit.height)
	}

	private function editHori(e = null)
	{
		edit.scroll(hori.pos, NaN)
	}

	private function editVert(e = null)
	{
		edit.scroll(NaN, vert.pos)
	}

	private function unsaved():String
	{
		return edit && edit.unsave ? fileName : null
	}

	private function editUnsave(e)
	{
		menu.file.str(fileName)
		menu.unsave.str(edit.unsave ? '*' : '')
	}

	private function load(e)
	{
		if (edit && edit.unsave && !(e is Event && e.type == Eventy.OK))
		{
			var i:Info = new Info(stage, 'Load', this)
			i.body.style(true).add(fileName).style(false)
				.add(' Unsaved !\nDiscard it ?')
			i.addYes(false).addNo(true)
			i.attach(Eventy.OK, load)
			return
		}
		file.addEventListener(Event.SELECT, loading)
		file.browse()
	}

	private function loading(e)
	{
		file.removeEventListener(Event.COMPLETE, saved)
		file.addEventListener(Event.COMPLETE, loaded)
		try
		{
			file.load()
		}
		catch (e)
		{
			new Info(stage, e, this, true).addOk()
		}
	}

	private function loaded(e)
	{
		try
		{
			var ed:Edit = new Edit(this, file.data)
			edit && edit.close()
			edit = ed
			edit.xy(Tool.W, Menu.H)
			resize()
			edit.keyon()
			file.data.clear()
			menu.file.str(fileName = file.name)
			menu.unsave.str('')
		}
		catch (e)
		{
			new Info(stage, e, this, true).addOk()
		}
	}

	private function save(e)
	{
		file.removeEventListener(Event.SELECT, loading)
		file.removeEventListener(Event.COMPLETE, loaded)
		file.addEventListener(Event.COMPLETE, saved)
		var o:ByteArray = new ByteArray, l:int = fileName.length
		try
		{
			edit.save(o)
			file.save(o, fileName)
		}
		catch (e)
		{
			new Info(stage, e, this, true).addOk()
		}
	}

	private function saved(e)
	{
		edit.unsave = 0
		menu.file.str(fileName = file.name)
		menu.unsave.str('')
	}

	private function fileErr(e:ErrorEvent)
	{
		new Info(stage, e.text, this, true).addOk()
	}

	private function run(e)
	{
	}

	static function web(e = null)
	{
		navigateToURL(new URLRequest('http://qutum.com'))
	}

	private function help(e)
	{
		navigateToURL(new URLRequest('http://qutum.com'))
	}
}
}
