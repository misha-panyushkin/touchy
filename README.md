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

`event` - is an usual event object;

`path` -  is a current path object like:

	{
		startX:     	type of Number (px),
        startY:     	type of Number (px),
        
		shiftX:   		type of Number (px),
        shiftY:   		type of Number (px),

		touchShiftX:	type of Number (px),
        touchShiftY:	type of Number (px),

		distanceX:  	type of Number (px),
        distanceY:  	type of Number (px),
        
	    angle:   		type of Number (degrees),
	    vector:   		type of Number (times),
	
	    startTime:  	type of Number (milli sec),
	    endTime:   		type of Number (milli sec),
	    speed:   		type of Number (px/sec)

        identifier: 	type of Number (touch identifier),

        preferable_plane:  	typeof String (millisec),
        preferable_way:   	typeof String
                            (one of "up", "right", "down", "left"),


		right:			type of Number (px),
		bottom:			type of Number (px),
		left:			type of Number (px),
		top:			type of Number (px),

		width:			type of Number (px),
		height:			type of Number (px)
	} 

---
*Work in progress..*