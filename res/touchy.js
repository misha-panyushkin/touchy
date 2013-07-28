/*
* The Touchy framework.
*
* Created by Misha Panyushkin.
* misha.panyushkin@gmail.com
*
* 25.06.2013
* */

 ! function (window, undefined) {

     var document = window.document,
         html = document.getElementsByTagName("html")[0],
         // Basics in detecting touch support.
         isTouch = function (eventName) {
             var el = document.createElement("i"),
                 isSupported = eventName in el;
             if (!isSupported) {
                 el.setAttribute(eventName, "return;");
                 isSupported = typeof el[eventName] === "function";
             }
             el = null;
             return isSupported;
         } ("ontouchstart"),
         eventsChain = (isTouch ? "touchstart touchmove touchend" : "mousedown mousemove mouseup").split(" "),
         // Local touch copy.
         touch = function (selector) {
             return new touch.the.magic(selector);
         },
         /*
         * Place where touched elements live.
         *
         * Because of touch identifier is the unique ID of the touch itself.
         * Different browsers implement different IDs.
         * Android implements IDs from 0 till max number of supported touches.
         * IOS implement unique IDs incrementing touch number each new touch occurs. And uses its number like uniquer ID for every new touch.
         * */
         touched = {},
         // Touch identifier.
         touch_meter = 0;

     touch.the = {
         constructor: touch,
         magic: function (selector) {
             var magic = this,
                 who_is_it;

             if (typeof selector === typeof "") {
                 who_is_it = Array.prototype.splice.call(document.querySelectorAll(selector), 0);
             } else {
                 if (selector instanceof HTMLElement || selector instanceof HTMLDocument) {
                     who_is_it = [ selector ];
                 } else {
                     who_is_it = selector;
                 }
             }

             this.context = document;

             who_is_it.forEach(function (element, idx) {
                 magic[idx] = element;
                 var iAmDoc = element instanceof HTMLDocument;
                 // In case the touched element is Document itself make hack for proper event order chain.
                 element.addEventListener(eventsChain[0], magic.magicClosure(magic, idx, iAmDoc), iAmDoc);
                 magic.length++;
             });

             // Where will be event callbacks live.
             this.callbacks = {};

             // Where will be elements rectangles live.
             this.rects = {};

             return this;
         },

         magicClosure: function (magic, idx, iAmDoc) {
             return function (event) {
                 if (iAmDoc) {
                     event.magicElement = magic;
                 } else if (!event.magicElement) {

                     magic.lastTouched = idx;
                     event.magicElement =  magic;
                 }
             };
         },

         eventCallback: function (event, rectIdx, touchIdx) {

             var touchId,
                 eventName = isTouch
                     ? event.type.substr("touch".length)
                     : event.type.substr("mouse".length);

             if (eventName === "down") {
                 eventName = "start";
             } else if (eventName === "up") {
                 eventName = "end";
             }

             if (eventName == "start") {
                 if (isTouch && event.targetTouches.length > 1) {

                     /*
                      * Android bug work around.
                      * Android triggers touchstart twice only after touchmove event occurs after last touch.
                      * */
                     if (this.rects[rectIdx].identifier != event.changedTouches[0].identifier) {

                         //Do not pick up reverting touches with smaller identifier than current.
                         /*
                         if (this.rects[rectIdx].identifier && this.rects[rectIdx].identifier > event.changedTouches[0].identifier) {
                             return;
                         }
                         */

                         this.rects[rectIdx].setTouchShift();
                         this.rects[rectIdx].identifier = event.changedTouches[0].identifier;
                     }

                 } else {

                     this.rects[rectIdx] = new PathFinder(this[rectIdx].getBoundingClientRect());
                     touch_meter++;
                 }

                 this.rects[rectIdx].setStartPoint(
                     isTouch ? event.changedTouches[0].pageX : event.pageX,
                     isTouch ? event.changedTouches[0].pageY : event.pageY,
                     isTouch ? event.changedTouches[0].identifier : 0
                 );
             }

             this.rects[rectIdx].setPoint(
                 isTouch ? event.changedTouches[touchIdx].pageX : event.pageX,
                 isTouch ? event.changedTouches[touchIdx].pageY : event.pageY
             );

             typeof this.callbacks[eventName] === typeof function () {} &&
             this.callbacks[eventName].call(this[rectIdx], event, this.rects[rectIdx]);

             if (eventName == "end") {
                 delete touched[isTouch ? event.changedTouches[0].identifier : 0];

                 if (isTouch && event.targetTouches.length) {
                     if (event.changedTouches[0].identifier === this.rects[rectIdx].identifier) {
                         this.rects[rectIdx].identifier = event.targetTouches[event.targetTouches.length - 1].identifier;

                         /*
                          * In case of multi touch.
                          * On touch end event we reset the previous active touch start(X,Y) position.
                          * To establish correct shifting.
                          * */
                         this.rects[rectIdx].startX = isTouch ? event.targetTouches[event.targetTouches.length - 1].pageX : event.pageX;
                         this.rects[rectIdx].startY = isTouch ? event.targetTouches[event.targetTouches.length - 1].pageY : event.pageY;

                         this.rects[rectIdx].setTouchShift();
                     }
                 } else {
                     this.rects[rectIdx].identifier = undefined;
                 }
             }
         },


         // Set touch.the to behave like an Array's method, not touch method.
         length: 0,
         push:      [].push,
         sort:      [].sort,
         splice:    [].splice
     };

     touch.the.magic.prototype = touch.the;

     // Callbacks listeners.
     "start move end rollback right down left up".split(" ").forEach(function (name) {
         touch.the[name] = function (callback) {
             this.callbacks[name] = callback;
             return this;
         };
     });

     eventsChain.forEach(function (eventName) {

         document.addEventListener(eventName, function (event) {

             event.preventDefault();

             var magic = event.magicElement;

             if (magic) {

                 // Temporary decision.
                 if (isTouch) {
                     var i = event.targetTouches.length;
                     while (i--) {
                         delete touched[event.targetTouches[i].identifier];
                     }
                 }

                 // On start it will be only one new touch with certainty.
                 touched[isTouch ? event.changedTouches[0].identifier : 0] =
                     {
                         magic: magic,
                         idx:   magic.lastTouched
                     };
                 // Take away extra data.
                 delete event.magicElement;
             } else {
                 magic = touched;
             }

             if (magic.magic) {
                 magic.eventCallback(event, magic.lastTouched, 0);
             } else {
                     if (isTouch) {
                         Array.prototype.splice.call(event.changedTouches,0).forEach(function (elem, id) {
                             var o = touched[elem.identifier];
                             if (o != undefined) {
                                 o.magic.eventCallback(event, o.idx, id);
                             }
                         });
                     } else {
                         touched[0] && touched[0].magic.eventCallback(event, touched[0].idx, 0);
                     }
             }
         }, false);
     });

     window.touch = touch;
} (window);


/*
 * The PathFinder class.
 *
 * Created by Misha Panyushkin.
 * misha.panyushkin@gmail.com
 *
 * 01.07.2013
 * */

var PathFinder = function (undefined) {

    var pi             = 3.14159265359,
        touch_limen    = 10;

    var PathFinder = function (rect) {
        this.startX = 0;
        this.startY = 0;
        this.shiftX = 0;
        this.shiftY = 0;

        this.touchShiftX = 0;
        this.touchShiftY = 0;

        this.distanceX = 0;
        this.distanceY = 0;

        this.angle = 0;
        this.vector = 0;

        this.startTime = 0;
        this.endTime = 0;
        this.speed = 0;

        this.preferable_plane = 0;
        this.preferable_way = 0;

        this.identifier = undefined;

        for (var i in rect) if (rect.hasOwnProperty(i)) {
            this[i] = rect[i];
        }
    };

    PathFinder.could = PathFinder.prototype = {

        setStartPoint: function (X, Y, ID) {
            this.startX    =  X ? X : 0;
            this.startY    =  Y ? Y : 0;

            this.shiftX    = this.shiftY = 0;

            this.startTime = new Date;
            this.preferable_plane = 0;
            this.identifier = ID || this.identifier;

            return this;
        },

        setPoint: function (X, Y) {
            this.shiftX   =  X ? X - this.startX : 0;
            this.shiftY   =  Y ? Y - this.startY : 0;

            this.distanceX = this.shiftX + this.touchShiftX;
            this.distanceY = this.shiftY + this.touchShiftY;

            setAngle (this);

            ! this.preferable_plane && setPreferablePlane (this);

            setPreferableWay (this);

            this.vector = parseInt(12*this.angle/360) || 12;

            this.endTime = new Date;

            setSpeed (this);

            return this;
        },

        setTouchShift: function () {
            this.touchShiftX   +=  this.shiftX;
            this.touchShiftY   +=  this.shiftY;

            return this;
        }
    };

    // Private.
    function setPreferableWay (t) {
        switch (t.preferable_plane) {
            case "horizontal":
                t.preferable_way = t.shiftX > 0 ? "right" : "left";
                break;
            case "vertical":
                // Browser ordinates axis has opposite direction.
                t.preferable_way = t.shiftY > 0 ? "down" : "up";
                break;
            default:
                t.preferable_way = "rollback";
        }
    }

    function setPreferablePlane (t) {
        var x = Math.abs(t.shiftX),
            y = Math.abs(t.shiftY);
        if (x > y) {
            t.preferable_plane = x > touch_limen
                ? "horizontal"
                : "before_touch_limen"
        } else if (x < y) {
            t.preferable_plane = y > touch_limen
                ? "vertical"
                : "before_touch_limen"
        }
    }

    function setAngle (t) {
        // Browser ordinates axis has opposite direction.
        var atan = t.shiftY == 0 || t.shiftX == 0
                ? 0
                : Math.atan( Math.abs( t.shiftX*t.shiftY > 0? t.shiftY/t.shiftX : t.shiftX/t.shiftY ) ),
            angle = atan*180/pi;
        t.angle = angle + (t.shiftX >= 0
            ? t.shiftY < 0 ? 0   : 90
            : t.shiftY > 0 ? 180 : 270);
    }

    function setSpeed (t) {
        var hypothenuse = Math.sqrt( Math.pow(t.shiftX,2) + Math.pow(t.shiftY,2)),
            time = (t.startTime - t.endTime)/1000;
        t.speed = hypothenuse / time;
    }

    return PathFinder;
}();