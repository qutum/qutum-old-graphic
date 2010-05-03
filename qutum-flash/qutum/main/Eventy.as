//
// Qutum 10 implementation
// Copyright 2008-2010 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
package qutum.main
{
import flash.events.Event;


/** event with dynamic properties, bubble */
public dynamic class Eventy extends Event
{
	public static const KEYON:String = 'widget:keyon'
	public static const KEYOFF:String = 'widget:keyoff'
	public static const SCROLL:String = 'widget:scroll'
	public static const OK:String = 'widget:ok'
	public static const NO:String = 'widget:no'
	public static const CANCEL:String = 'widget:cancel'

	public static const NEW:String = 'qutum:new'
	public static const LOAD:String = 'qutum:load'
	public static const SAVE:String = 'qutum:save'
	public static const RUN:String = 'qutum:run'

	public static const SHOW:String = 'qutum:show'
	public static const UNSAVE:String = 'qutum:unsave'

	public function Eventy(name:String, bubble:Boolean)
	{
		super(name, bubble)
	}
}
}
