//
// Qutum 10 implementation
// Copyright 2008-2013 Qianyan Cai
// Under the terms of the GNU General Public License version 3
// http://qutum.com
//
(function () {

// quote base or base base
Quote = function ()
{
}

Quote.prototype =
{

b: null, // base, or base base
w: null, // base wire to quote if b is base base
deep0: 0, // outermost zone deep of all wires to b, i.e. deep of cycle zone or b.zb.zone
deep9: 0, // deep9 of outermost base base wire, or deep of zoner agent

}

})()