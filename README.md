touchy
======

Touch framework for web apps.

Here you could find the very first prototype of touchy framework (:

___
Primary usage instance:

    touch(document.body)
        .start		(function (event, rect, first) {..} )
        
		.aflat		(function (event, rect, first) {..} )
		.upright	(function (event, rect, first) {..} )
		.stir		(function (event, rect, first) {..} )
        
		.end		(function (event, rect, last) {..} )
			
		.up			(function (event, rect) {..} )
		.right		(function (event, rect) {..} )
		.down		(function (event, rect) {..} )
		.left		(function (event, rect) {..} )

`event` - is an usual event object;

Traditional Event object is enlarged with one property & one method:

`event.stopMagic ()` - apply it to stop event bubbling through touched elements chain. In case of touched elements are nested.

`event.isMagicStopped` - boolean value, indicating was the previous method being applied or not at the current event flow.

`rect` -  is a current path object like:

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

		// Much as object returned by getBoundingClientRect method.
 
		right:			type of Number (px),
		bottom:			type of Number (px),
		left:			type of Number (px),
		top:			type of Number (px),

		width:			type of Number (px),
		height:			type of Number (px)

		// 3D transformation matrix

		matrix3D:		type of Array (Each value in px)

		// If no transform take place: [0, 0, 0, 0, 0, 0]
	} 

---
*Work in progress..*