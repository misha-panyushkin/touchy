touchy
======

Touch framework for web apps.

The second coming. New developer interafce new architecture approach.

___
Primary usage instance:

    touch (document)
            .start		(function (event) {})
            .move		(function (event) {})
            .end		(function (event) {})

			.right		(function (event) {})
			.down		(function (event) {})
			.left		(function (event) {})
			.up			(function (event) {})

			.rollback	(function (event) {});

`event` - is an usual event;




----------

> in progress now...

>
> `touches` - is an array, each element consists of several properties:
>
> 	{
> 		startX:     type of Number (px),
>         startY:     type of Number (px),
>         shiftX:   	type of Number (px),
>         shiftY:   	type of Number (px),
>
> 	    angle:   	type of Number (degrees),
> 	    vector:   	type of Number (times),
>
> 	    startTime:  type of Number (milli sec),
> 	    endTime:   	type of Number (milli sec),
> 	    speed:   	type of Number (px/sec)
> 	}
>
> `credits` - is an elements bounding rectangle at first touch start position;

---