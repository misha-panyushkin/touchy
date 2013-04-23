touchy
======

Touch framework for web apps.

Here you could find the very first prototype of touchy framework (:

___
Primary usage instance:

    touch(document.body)
        .bind({
            start   : function( event, credits ){..},
            move    : function( event, credits ){..},
            end     : function( event, credits ){..},

            click   : function( event, credits ){..}
        });

`event` - is an usual event;

`credits` - is an object, consits of several properties:

	{
		startX:     typeof Number,
        startY:     typeof Number,
        shiftX:   	typeof Number,
        shiftY:   	typeof Number,
        shifts:    	typeof Number
	} 

---
*Work in progress..*