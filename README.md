touchy
======

Touch framework for web apps.

Here you could find the very first prototype of touchy framework (:

___
Primary usage instance:

    touch(document.body)
        .bind({
            start   : function( event, tocuhes ){..},
            move    : function( event, tocuhes ){..},
            end     : function( event, tocuhes ){..},

            click   : function( event, tocuhes ){..}
        });

`event` - is an usual event;

`tocuhes` - is an object, consists of several properties:

	{
		startX:     typeof Number (px),
        startY:     typeof Number (px),
        shiftX:   	typeof Number (px),
        shiftY:   	typeof Number (px),
        
	    angle:   	typeof Number (degrees),
	    vector:   	typeof Number (times),
	
	    startTime:  typeof Number (millisec),
	    endTime:   	typeof Number (millisec),
	    speed:   	typeof Number (px/sec)
	} 

---
*Work in progress..*


Follow the first touch of each touch list.