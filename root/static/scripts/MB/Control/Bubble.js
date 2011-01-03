/*
   This file is part of MusicBrainz, the open internet music database.
   Copyright (C) 2010 Kuno Woudt <kuno@frob.nl>
   Copyright (C) 2010 MetaBrainz Foundation

   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; either version 2 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

*/

jQuery.fn.borderRadius = function (radius) {

    this.each (function () {

        var elem = jQuery (this);

        if (typeof radius === 'number')
        {
            radius = '' + radius + 'px';
        }

        if (typeof radius === 'string')
        {
            elem.css ('border-radius', radius);
            elem.css ('-webkit-border-radius', radius);
            elem.css ('-moz-border-radius', radius);
            return;
        }

        if (typeof radius !== 'object')
            return;

        jQuery.each ([ 'top', 'bottom' ], function (i, ver) {
            jQuery.each (['left', 'right' ], function (j, hor) {

                var value = radius[ver + '-' + hor];
                if (!value)
                    return;

                elem.css ('border-' + ver + '-' + hor + '-radius', value);
                elem.css ('-webkit-border-' + ver + '-' + hor + '-radius', value);
                elem.css ('-moz-border-radius-' + ver + hor, value);
            });
        });
    });

    return this;
};

/* BubbleBase provides the common code for speech bubbles as used
   on the Release Editor.
*/
MB.Control.BubbleBase = function (parent, target, content, offset) {
    var self = MB.Object ();

    self.parent = parent;
    self.offset = offset ? offset : 20;
    self.target = $(target);
    self.content = $(content);
    self.container = self.content.parent ();

    self.target.data ('bubble', self);

    var tail = function () {
        self.balloon0.css ('position', 'absolute').css ('z-index', '1');

        self.balloon1.css ('position', 'absolute')
            .css ('padding', '0')
            .css ('margin', '0');

        self.balloon2.css ('float', 'left')
            .css ('background', '#fff')
            .css ('padding', '0')
            .css ('margin', '0')
            .css ('border-style', 'solid')
            .css ('border-color', '#999');

        self.balloon3.css ('float', 'left')
            .css ('background', '#fff')
            .css ('padding', '0')
            .css ('margin', '0')
            .css ('border-style', 'solid')
            .css ('border-color', '#999');
    };

    var show = function () {
        self.parent.hideOthers (self);
        self.container.show ();
        self.move ();
        self.tail ();
        self.visible = true;

        if (typeof self.callbacks['show'] === "function")
        {
            self.callbacks['show'] (self);
        }
    };

    var hide = function () {
        self.container.hide ();
        self.visible = false;

        if (typeof self.callbacks['hide'] === "function")
        {
            self.callbacks['hide'] (self);
        }
    };

    var toggle = function () {
        if (self.visible)
        {
            self.hide ();
        }
        else
        {
            self.show ();
        }
    };

    var bind = function (key, fun) {
        self.callbacks[key] = fun;
    };

    self.visible = false;
    self.callbacks = {};

    self.move = function () {};
    self.tail = tail;
    self.show = show;
    self.hide = hide;
    self.toggle = toggle;
    self.bind = bind;

    self.balloon0 = $('<div>');
    self.balloon1 = $('<div>');
    self.balloon2 = $('<div>');
    self.balloon3 = $('<div>');

    self.balloon0.append (
        self.balloon1.append (self.balloon2).append (self.balloon3)
    ).insertBefore (self.content);

    return self;
};

/* BubbleDocBase turns a documentation div into a bubble pointing at an
   input to the left of it on the Release Editor information tab.

   It also positions the bubble vertically when 'move ()' is called.
   If the target input can move (e.g. because other inputs are
   inserted above it) make sure to call move() again whenever that
   input is focused and the documentation div displayed.
*/
MB.Control.BubbleDocBase = function (parent, target, content) {
    var self = MB.Control.BubbleBase (parent, target, content);

    var parent_tail = self.tail;
    var parent_hide = self.hide;

    var move = function () {

        self.container.show ();

        self.container.position({
            my: "left top",
            at: "right top",
            of: self.target,
            offset: "37 -23",
            collision: "none"
        });

        /* FIXME: figure out why opera doesn't position this correctly on the
           first call and fix that issue or submit a bug report to opera. */
        if (window.opera)
        {
            self.container.position({
                my: "left top",
                at: "right top",
                of: self.target,
                offset: "37 -23",
                collision: "none"
            });
        }

        var height = self.content.height ();

        if (height < 42)
        {
            height = 42;
        }

        self.container.css ('min-height', height);
        self.content.css ('min-height', height);

        var pageBottom = self.page.offset ().top + self.page.outerHeight ();
        var bubbleBottom = self.container.offset ().top + self.container.outerHeight ();

        if (pageBottom < bubbleBottom)
        {
            var newHeight = self.page.outerHeight () + bubbleBottom - pageBottom + 10;

            self.page.css ('min-height', newHeight);
        }
    };

    var tail = function () {

        parent_tail ();

        var targetY = self.target.offset ().top - 24 + self.target.height () / 2;
        var offsetY = targetY - self.content.offset ().top;

        self.balloon0.position({
            my: "right top",
            at: "left top",
            of: self.content,
            offset: "0 " + Math.floor (offsetY)
        });

        self.balloon1.css ('background', '#eee')
            .css ('width', '14px')
            .css ('height', '42px')
            .css ('left', '-12px')
            .css ('top', '10px');

        self.balloon2.borderRadius ({ 'bottom-right': '12px' })
            .css ('width', '12px')
            .css ('height', '20px')
            .css ('border-width', '0 1px 1px 0');

        self.balloon3.borderRadius ({ 'top-right': '12px' })
            .css ('width', '12px')
            .css ('height', '20px')
            .css ('border-width', '1px 1px 0 0');
    };

    var hide = function () {
        parent_hide ();

        self.page.css ('min-height', '');
    };


    self.page = $('#page');

    self.move = move;
    self.tail = tail;
    self.hide = hide;

    return self;
};


MB.Control.BubbleDoc = function (parent, target, content) {
    var self = MB.Control.BubbleDocBase (parent, target, content);

    var parent_show = self.show;
    var parent_hide = self.hide;

    var show = function () {
        parent_show ();

        if (self.button)
        {
            self.target.text (MB.text.Done);
        }
    };

    var hide = function () {
        parent_hide ();

        if (self.button)
        {
            self.target.text (MB.text.Change);
        }
    };

    var initialize = function () {

        self.button = false;
        self.textinput = false;

        if (self.target.filter ('a').length ||
            self.target.filter ('input[type=submit]').length ||
            self.target.filter ('input[type=button]').length)
        {
            self.button = true;
        }
        else if (self.target.filter ('input[type=text]').length ||
                 self.target.filter ('textarea').length)
        {
            self.textinput = true;
        }

        if (self.button)
        {
            /* show content when a button is pressed. */
            self.target.click (function (event) {
                self.toggle ();
                event.preventDefault ();
            });
        }

        if (self.textinput)
        {
            /* show content when an input field is focused. */
            self.target.focus (function (event) {

                self.show ();
            });
        }

        return self;
    };

    self.show = show;
    self.hide = hide;
    self.initialize = initialize;

    return self;
};


/* BubbleRow turns the div inside a table row into a bubble pointing
   at one of the inputs in the preceding row. */
MB.Control.BubbleRow = function (parent, target, content, offset) {
    var self = MB.Control.BubbleBase (parent, target, content, offset);

    var parent_tail = self.tail;

    var tail = function () {

        parent_tail ();

    };

    self.tail = tail;

    return self;
};


/* BubbleCollection is a containter for all the BubbleRows or
   BubbleDocs on a page.  It's main purpose is to allow a Bubble to
   hide any other active bubbles when it is to be shown.
*/
MB.Control.BubbleCollection = function (targets, contents) {
    var self = MB.Object ();

    self.bubbles = [];

    var hideOthers = function (bubble) {
        if (self.active)
        {
            self.active.hide ();
        }

        self.active = bubble;
    };

    var hideAll = function () {
        self.hideOthers (null);
    };

    var add = function (target, contents) {
        self.bubbles.push (
            MB.Control.BubbleDoc (self, target, contents).initialize ()
        );
    };

    var initialize = function ()
    {
        var tmp = [];

        if (targets && contents)
        {
            targets.each (function (idx, data) { tmp.push ({ 'button': data }); });
            contents.each (function (idx, data) { tmp[idx].doc = data; });

            $.each (tmp, function (idx, data) {
                self.bubbles.push (
                    MB.Control.BubbleDoc (self, data.button, data.doc).initialize ()
                );
            });
        }
    }

    var bind = function (key, fun) {
        $.each (self.bubbles, function (idx, bubble) {
            bubble.bind (key, fun);
        });
    };

    self.hideOthers = hideOthers;
    self.hideAll = hideAll;
    self.add = add;
    self.initialize = initialize;
    self.active = false;
    self.bind = bind;

    self.initialize ();

    return self;
};