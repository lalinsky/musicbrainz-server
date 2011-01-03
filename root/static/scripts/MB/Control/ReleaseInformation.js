/*
   This file is part of MusicBrainz, the open internet music database.
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

/**
 * MB.Control.ReleaseLabel keeps track of the label/catno inputs.
 */
MB.Control.ReleaseLabel = function(row, parent, labelno) {
    var self = MB.Object();

    self.row = row;
    self.parent = parent;
    self.labelno = labelno;

    if (!self.row)
    {
        self.catno_message = $('div.catno-container:first').clone ();
	self.catno_message.insertAfter ($('div.catno-container:last'));
	self.catno_message.hide ();

	self.row = $('div.release-label:first').clone ();
	self.row.find ('input.label-id').val ('');
	self.row.find ('input.label-name').val ('');
	self.row.find ('input.catno').val ('');
	self.row.find ('*').each (function (idx, element) {
            var item = $(element);
            if (item.attr ('id'))
            {
                item.attr ('id', item.attr('id').
                           replace('labels.0', "labels." + self.labelno));
            }
            if (item.attr ('name'))
            {
                item.attr ('name', item.attr('name').
                           replace('labels.0', "labels." + self.labelno));
            }
        });

        self.row.appendTo ($('div.label-container').append ());
    }

    /**
     * toggleDelete (un)marks the track for deletion. Provide a boolean to delete
     * or undelete a track, or leave it empty to toggle.
     */
    var toggleDelete = function (value) {
        var deleted = (value === undefined) ? !parseInt (self.deleted.val ()) : value;
        if (deleted)
        {
            self.deleted.val('1');
            self.row.addClass('deleted');
            self.name.attr ('disabled', 'disabled');
            self.catno.attr ('disabled', 'disabled');
        }
        else
        {
            self.deleted.val ('0');
            self.row.removeClass('deleted');
            self.name.removeAttr ('disabled');
            self.catno.removeAttr ('disabled');
        }

        window.toggled = self;
    };

    /**
     * isDeleted returns true if this track is marked for deletion.
     */
    var isDeleted = function () {
        return self.deleted.val () === '1';
    };

    /**
     * selected is a callback called by autocomplete when a selection is made.
     */
    var selected = function (event, data) {
        self.id.val(data.id);
        self.name.removeClass('error');
        self.name.val(data.name);

        event.preventDefault();
        return false;
    };

    var catnoUpdate = function () {

	if (self.catno.val ().match (/^B00[0-9A-Z]{7}$/))
        {
  	    self.catno.data ('bubble').show ();
        }
	else
        {
  	    self.catno.data ('bubble').hide ();
        }
    };

    self.id = self.row.find('input.label-id');
    self.name = self.row.find('input.label-name');
    self.catno = self.row.find('input.catno');
    self.catno_message = $('div.catno').eq(self.labelno);
    self.deleted = self.row.find ('span.remove-label input');

    self.parent = parent;
    self.catnoUpdate = catnoUpdate;
    self.toggleDelete = toggleDelete;
    self.isDeleted = isDeleted;
    self.selected = selected;

    self.catno.bind ('change keyup focus', self.catnoUpdate);
    MB.Control.Autocomplete ({
        'input': self.name,
        'entity': 'label',
        'select': self.selected
    });

    self.row.find ("a[href=#remove_label]").click (function () { self.toggleDelete() });

    if (self.isDeleted ())
    {
        // if the label is marked as deleted, make sure it is displayed as such
        // after page load.
        self.toggleDelete (1);
    }


    return self;
};


MB.Control.ReleaseBarcode = function() {
    var self = MB.Object();

    self.input = $('#id-barcode');
    self.message = $('p.barcode-message');
    self.suggestion = $('p.barcode-suggestion');
    self.count = 0;

    var checkDigit = function (barcode) {
        var weights = [ 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3 ];

        if (barcode.length !== 12)
        {
            return false;
        }

        var calc = 0;
        for (i = 0; i < 12; i++)
        {
            calc += parseInt (barcode[i]) * weights[i];
        }

        var checkdigit = 10 - (calc % 10);

        return checkdigit === 10 ? '0' : '' + checkdigit;
    };

    var validate = function (barcode) {
        return self.checkDigit (barcode.slice (0, 12)) === barcode[12];
    };

    var clean = function () {
        var barcode = self.input.val ().replace (/[^0-9]/g, '');

        self.input.val (barcode);

        return barcode;
    };

    var update = function () {
        var barcode = self.clean ();

        if (barcode.length === 0)
        {
            self.message.html ("");
            self.suggestion.html ("");
        }
        else if (barcode.length === 11)
        {
            self.message.html (MB.text.Barcode.NoCheckdigitUPC);
            self.suggestion.html (MB.text.Barcode.CheckDigit.replace (
                '#checkdigit#', self.checkDigit ('0' + barcode)));
        }
        else if (barcode.length === 12)
        {
            if (self.validate ('0' + barcode))
            {
                self.message.html (MB.text.Barcode.ValidUPC);
                self.suggestion.html ("");
            }
            else
            {
                self.message.html (MB.text.Barcode.InvalidUPC);
                self.suggestion.html (MB.text.Barcode.DoubleCheck + ' ' +
                    MB.text.Barcode.CheckDigit.replace (
                        '#checkdigit#', self.checkDigit (barcode)));
            }
        }
        else if (barcode.length === 13)
        {
            if (self.validate (barcode))
            {
                self.message.html (MB.text.Barcode.ValidEAN);
                self.suggestion.html ('');
            }
            else
            {
                self.message.html (MB.text.Barcode.InvalidEAN);
                self.suggestion.html (MB.text.DoubleCheck);
            }
        }
        else
        {
            self.message.html (MB.text.Barcode.Invalid);
            self.suggestion.html (MB.text.DoubleCheck);
        }
    };

    self.checkDigit = checkDigit;
    self.validate = validate;
    self.clean = clean;
    self.update = update;

    self.input.bind ('change keyup', self.update);
    self.update ();

    return self;
};


MB.Control.ReleaseDate = function (bubble_collection) {
    var self = MB.Object ();

    self.bubbles = bubble_collection;

    self.inputs = [ $('#id-date\\.year'),
        $('#id-date\\.month'), $('#id-date\\.day') ] 
    self.message = $('div.date');

    var amazonEpoch = function () {
	return (self.inputs[0].val () == '1995' &&
	  self.inputs[1].val () == '10' &&
          self.inputs[2].val () == '25');
    };

    var januaryFirst = function () {
        return (parseInt (self.inputs[1].val (), 10) === 1 &&
                parseInt (self.inputs[2].val (), 10) === 1);
    };

    var update = function (event) {
        var amazon = self.amazonEpoch ();
        var january = self.januaryFirst ();

	if (amazon || january)
        {
            $(this).data ('bubble').show ();
	}
	else
	{
            $(this).data ('bubble').hide ();
	}

        if (amazon)
        {
            $('p.amazon').show ();
        }
        else
        {
            $('p.amazon').hide ();
        }

        if (january)
        {
            $('p.january-first').show ();
        }
        else
        {
            $('p.january-first').hide ();
        }
    };

    self.januaryFirst = januaryFirst;
    self.amazonEpoch = amazonEpoch;
    self.update = update;

    $.each (self.inputs, function (idx, item) {
        item.data ('bubble', 
            MB.Control.BubbleDocBase (self.bubbles, item, self.message));

        item.bind ('change keyup focus', self.update);
    });

    return self;
};

MB.Control.ReleaseInformation = function() {
    var self = MB.Object();

    self.bubbles = MB.Control.BubbleCollection ();
    self.release_date = MB.Control.ReleaseDate (self.bubbles);

    var initialize = function () {

        self.bubbles.add ($('#release-artist'), $('div.artist-credit'));
        self.bubbles.add ($('#id-barcode'), $('div.barcode'));
        self.bubbles.add ($('#annotation'), $('div.annotation'));
        self.bubbles.add ($('#id-comment'), $('div.comment'));

        $('div.release-label').each (function () {
            self.addLabel ($(this));
        });

        $('#id-barcode').live ('change', function () {
            var barcode = $(this).val ().replace (/[^0-9]/g, '');
            $(this).val (barcode);
        });

        $('a[href=#add_label]').click (function (event) {
            self.addLabel ();
	    self.bubbles.hideAll ();
            event.preventDefault ();
        });

        var annotation = $('#annotation');
        annotation.focus (function() { annotation.css('height','70px'); });
        annotation.blur (function() {
            if (!annotation.attr('value'))
            {
                annotation.css('height','10px');
            }
        });

        self.artistcredit = MB.Control.ArtistCreditVertical (
            $('input#release-artist'), $('div.artist-credit')
        );

    };

    var addLabel = function (row) {
        var labelno = self.labels.length;
        var l = MB.Control.ReleaseLabel(row, self, labelno);

        self.labels.push (l);

        MB.Control.BubbleDocBase (self.bubbles, l.catno, l.catno_message);
    };

    var submit = function () {
        // always submit disabled inputs.
        $('input:disabled').removeAttr ('disabled');
    };

    self.barcode = MB.Control.ReleaseBarcode ();
    self.labels = [];
    self.initialize = initialize;
    self.addLabel = addLabel;
    self.submit = submit;

    self.initialize ();

    $('form.release-editor').bind ('submit.mb', self.submit);

    return self;
}