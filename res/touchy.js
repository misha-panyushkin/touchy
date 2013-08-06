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

     Object.defineProperty(Object.prototype, "lastOne", {
         get: function () {
             return this.length ? this[this.length-1] : null;
         }
     });

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
             this.paths = {};

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

         eventCallback: function (event, rectIdx, axis, targetTouches, changedTouch) {

             // Event definition.
             var temp,
                 eventName = isTouch
                     ? event.type.substr("touch".length)
                     : event.type.substr("mouse".length);

             if (eventName === "down") {
                 eventName = "start";
             } else if (eventName === "up") {
                 eventName = "end";
             } else if (eventName === "move") {
                 eventName = "stir";
             }

             // Handling touch start.
             if (eventName == "start") {
                 this.paths[rectIdx] = this.paths[rectIdx] || new PathFinder(this[rectIdx].getBoundingClientRect());

                 if (isTouch && targetTouches.length > 1) {

                      if (this.paths[rectIdx].identifier != changedTouch.identifier) {
                          /*
                           * Android bug work around.
                           * Android triggers touchstart event twice only after
                           * touchmove event occurs after second touch.
                           * */
                         this.paths[rectIdx].setTouchShift();
                         this.paths[rectIdx].identifier = changedTouch.identifier;
                      }
                 } else {
                     touch_meter++;
                 }

                 this.paths[rectIdx].setStartPoint(
                     isTouch ? changedTouch.pageX : event.pageX,
                     isTouch ? changedTouch.pageY : event.pageY,
                     isTouch ? changedTouch.identifier : 0
                 );
             }

             // Essential.
             this.paths[rectIdx].setPoint(
                 isTouch ? axis.X : event.pageX,
                 isTouch ? axis.Y : event.pageY
             );

             // Handling preferable planes callbacks.
             if (eventName == "stir") {
                 typeof this.callbacks[this.paths[rectIdx].plane] === typeof function () {} &&
                 this.callbacks[this.paths[rectIdx].plane].call(this[rectIdx], event, this.paths[rectIdx]);
             }

             // Call for standard callbacks.
             typeof this.callbacks[eventName] === typeof function () {} &&
             this.callbacks[eventName].call(this[rectIdx], event, this.paths[rectIdx],
                 function () {
                     return !isTouch || ( eventName == "start" ? targetTouches.length == 1 : eventName == "end" ? !targetTouches.length : undefined );
                 } () );

             if (eventName == "end") {

                 temp = touched[isTouch ? changedTouch.identifier : 0];
                 delete touched[isTouch ? changedTouch.identifier : 0];

                 if (isTouch && targetTouches.length) {
                     if (changedTouch.identifier === this.paths[rectIdx].identifier) {

                         touched[
                             this.paths[rectIdx].identifier = targetTouches[targetTouches.length - 1].identifier
                         ] = temp;

                         /*
                          * In case of multi touch.
                          * On touch end event we reset the previous active touch start(X,Y) position.
                          * To establish correct shifting.
                          * */
                         this.paths[rectIdx].startX = isTouch ? targetTouches[targetTouches.length - 1].pageX : event.pageX;
                         this.paths[rectIdx].startY = isTouch ? targetTouches[targetTouches.length - 1].pageY : event.pageY;

                         this.paths[rectIdx].setTouchShift();
                     }
                 } else {
                     // Call for swipe callbacks.
                     if (this.paths[rectIdx].way) {
                         typeof this.callbacks[this.paths[rectIdx].way] === typeof function () {} &&
                         this.callbacks[this.paths[rectIdx].way].call(this[rectIdx], event, this.paths[rectIdx]);
                     }
                     delete this.paths[rectIdx];
                 }
             }
         },

         strategy: function (event) {
             /*
              * Strategy.
              *
              * We'll follow the last touch made by user. So follow the strategy of this kind,
              * every new touch abstractly has unique ID. It doesn't matter ANDROID or IOS
              * operating system user on. Every touch, also in ANDROID, is a new touch. We
              * won't follow the native ID, instead we'll assume that every new touch has
              * unique ID as implemented in IOS.
              * */
             var i, id, temp;
             // Temporary decision.
             if (isTouch) {
                 i = event.touches.length;
                 while (i--) {
                     id = event.touches[i].identifier;
                     if (touched[id] && touched[id].magic == this && touched[id].idx == this.lastTouched){
                         temp = touched[id];
                         delete touched[id];
                         break;
                     }
                 }
             }

             temp = temp || {
                 magic: this,
                 idx:   this.lastTouched,
                 touchesIds: []
             };
             /*
              * On start it will be only one new touch with certainty - Android.
              * On start it could be several new touches with certainty - IOS.
              * Keeping the strategy we'll take the last one.
              * */
             temp.touchesIds.push(isTouch ? event.changedTouches.lastOne.identifier : 0);

             touched[temp.touchesIds.lastOne] = temp;
             // Take away extra data out the event.
             delete event.magicElement;
         },


         // Set touch.the to behave like an Array's method, not touch method.
         length: 0,
         push:      [].push,
         sort:      [].sort,
         splice:    [].splice
     };

     touch.the.magic.prototype = touch.the;

     // Callbacks listeners.
     "start stir aflat upright end rollback right down left up".split(" ").forEach(function (name) {
         touch.the[name] = function (callback) {
             this.callbacks[name] = callback;
             return this;
         };
     });

     eventsChain.forEach(function (eventName) {

         document.addEventListener(eventName, function (event) {

             if (!event.magicElement && function (o) {
                 for (var name in o) {
                     return false;
                 }
                 return true;
             } (touched))
                return;

             var magic = event.magicElement,
                 touches_list,
                 target_touches_list = [];

             if (magic)
                magic.strategy(event);

             if (isTouch) {

                 if (event.changedTouches.length) {
                     touches_list = event.changedTouches;
                 } else {
                     touches_list = event.targetTouches;
                 }

                 Array.prototype.splice.call(touches_list, 0).forEach(function (elem) {
                     var o = touched[elem.identifier];
                     if (o != undefined) {

                        target_touches_list.length = 0;

                        Array.prototype.splice.call(event.touches, 0).forEach(function (elem) {
                            var idx = o.touchesIds.length;
                            while (idx--) if (elem.identifier === o.touchesIds[idx]) {
                                target_touches_list.push(elem);
                            }
                        });

                        o.magic.eventCallback (
                            event,
                            o.idx,
                            {X:elem.pageX, Y:elem.pageY},
                            target_touches_list,
                            event.changedTouches[event.changedTouches.length - 1]
                        );
                     }
                 });
             } else {
                 touched[0] && touched[0].magic.eventCallback(event, touched[0].idx, {X:event.pageX, Y:event.pageY});
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

var PathFinder = function (window, undefined) {

    var pi             = 3.14159265359,
        touch_limen    = .5;

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

        this.plane = undefined;
        this.way = undefined;

        this.identifier = undefined;

        for (var i in rect) if (rect.hasOwnProperty(i)) {
            if (i === "left")
                this[i] = rect[i] + window.scrollX;
            else if (i === "top")
                this[i] = rect[i] + window.scrollY;
            else
                this[i] = rect[i];
        }
    };

    PathFinder.could = PathFinder.prototype = {

        setStartPoint: function (X, Y, ID) {
            this.startX    =  X ? X : 0;
            this.startY    =  Y ? Y : 0;

            this.shiftX    = this.shiftY = 0;

            this.startTime = new Date;
            this.plane = 0;
            this.identifier = ID || this.identifier;

            return this;
        },

        setPoint: function (X, Y) {
            this.shiftX   =  X ? X - this.startX : 0;
            this.shiftY   =  Y ? Y - this.startY : 0;

            this.distanceX = this.shiftX + this.touchShiftX;
            this.distanceY = this.shiftY + this.touchShiftY;

            setAngle (this);

            !this.plane && setPreferablePlane (this);

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
        switch (t.plane) {
            case "aflat":
                t.way = t.shiftX > 0 ? "right" : "left";
                break;
            case "upright":
                // Browser ordinates axis has opposite direction.
                t.way = t.shiftY > 0 ? "down" : "up";
                break;
            default:
                t.way = "rollback";
        }
    }

    function setPreferablePlane (t) {
        var x = Math.abs(t.shiftX),
            y = Math.abs(t.shiftY);
        if (x > y) {
            t.plane = x > touch_limen
                ? "aflat"
                : "atStart"
        } else if (x < y) {
            t.plane = y > touch_limen
                ? "upright"
                : "atStart"
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
} (window) ;