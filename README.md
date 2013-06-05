touchy
======

Touch framework for web apps.

Here you could find the very first prototype of touchy framework (:

___
Primary usage instance:

    touch(document.body)
        .bind({
            start   : function( event, touches, credits ){..},
            move    : function( event, touches, credits ){..},
            end     : function( event, touches, credits ){..},
			
			up     	: function( event, touches, credits ){..},
			right   : function( event, touches, credits ){..},
			down    : function( event, touches, credits ){..},
			left    : function( event, touches, credits ){..}
        });

`event` - is an usual event;

`touches` - is an array, each element consists of several properties:

	{
		startX:     type of Number (px),
        startY:     type of Number (px),
        shiftX:   	type of Number (px),
        shiftY:   	type of Number (px),
        
	    angle:   	type of Number (degrees),
	    vector:   	type of Number (times),
	
	    startTime:  type of Number (milli sec),
	    endTime:   	type of Number (milli sec),
	    speed:   	type of Number (px/sec)
	} 

`credits` - is an elements bounding rectangle at first touch start position;

---
*Work in progress..*


Follow the first touch of each touch list.