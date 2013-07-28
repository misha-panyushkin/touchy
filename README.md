touchy
======

Touch framework for web apps.

Here you could find the very first prototype of touchy framework (:

___
Primary usage instance:

    touch(document.body)
        .bind({
            start   : function( event, path ){..},
            move    : function( event, path ){..},
            end     : function( event, path ){..},

			up     	: function( event, path ){..},
			right   : function( event, path ){..},
			down    : function( event, path ){..},
			left    : function( event, path ){..}
        });

`event` - is an usual event;

`path` -  is an object:

	{
		startX:     type of Number (px),
        startY:     type of Number (px),

		shiftX:   	type of Number (px),
        shiftY:   	type of Number (px),

		touchShiftX:   	type of Number (px),
        touchShiftY:   	type of Number (px),

		distanceX:   	type of Number (px),
        distanceY:   	type of Number (px),

	    angle:   	type of Number (degrees),
	    vector:   	type of Number (times),

	    startTime:  type of Number (milli sec),
	    endTime:   	type of Number (milli sec),
	    speed:   	type of Number (px/sec)

        identifier:   	type of Number (touch identifier),
	}

---
*Work in progress..*