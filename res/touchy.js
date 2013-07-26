/*
* The Touchy framework.
*
* Created by Misha Panyushkin.
* misha.panyushkin@gmail.com
*
* 25.06.2013
* */

 ! function (window, undefined) {

     var tt = 0,
         document = window.document,
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
         //Place where touched elements live.
         touched = [];

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

                     event.magicElement =  magic;

                     if (isTouch && event.targetTouches.length > 1) {

                         /*
                          * Android bug work around.
                          * Android triggers touchstart twice only after touchmove event occurs after last touch.
                          * */
                         if (magic.rects[idx].identifier != event.changedTouches[0].identifier) {

                             if (magic.rects[idx].identifier && magic.rects[idx].identifier > event.changedTouches[0].identifier) {
                                 /*
                                 * Do not pick up reverting touches with smaller identifier than current.
                                 * */
                                 //console.log(" * * * * * * * *  !  ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! * * * * * * * ** * * * * ");
                                 return;
                             }
                                   /*
                             console.log("*************************** START ********************** * * * * * * * * * * * ");
                             console.log(magic.rects[idx].touchShiftX + " - shift X; before");
                             console.log(magic.rects[idx].touchShiftY + " - shift Y; before");
                             console.log(magic.rects[idx].distanceX + " - distance X");
                             console.log(magic.rects[idx].distanceY + " - distance Y");
                             console.log(magic.rects[idx].fullDistanceX + " - full distance X");
                             console.log(magic.rects[idx].fullDistanceY + " - full distance Y");
                                     */
                             magic.rects[idx].touchShiftX += magic.rects[idx].distanceX;
                             magic.rects[idx].touchShiftY += magic.rects[idx].distanceY;
                                       /*
                             console.log(magic.rects[idx].touchShiftX + " - shift X; after");
                             console.log(magic.rects[idx].touchShiftY + " - shift Y; after");
                                         */
                             magic.rects[idx].identifier = event.changedTouches[0].identifier;
                         }

                     } else {
                         magic.rects[idx] = magic[idx].getBoundingClientRect();

                         magic.rects[idx].touchShiftX = 0;
                         magic.rects[idx].touchShiftY = 0;
                     }

                     magic.rects[idx].startX = isTouch ? event.changedTouches[0].pageX : event.pageX;
                     magic.rects[idx].startY = isTouch ? event.changedTouches[0].pageY : event.pageY;

                     magic.lastTouched = idx;
                 }
             };
         },

         callMagicCallback: function (event, rectIdx, touchIdx) {

             var touchId,
                 eventName = isTouch
                     ? event.type.substr("touch".length)
                     : event.type.substr("mouse".length);

             if (eventName === "down") {
                 eventName = "start";
             } else if (eventName === "up") {
                 eventName = "end";
             }

             // Here we should work around situation with several touches on single element.
             /*
             * ..code here.
             * */

             this.rects[rectIdx].distanceX = (isTouch ? event.changedTouches[touchIdx].pageX : event.pageX) - this.rects[rectIdx].startX;
             this.rects[rectIdx].distanceY = (isTouch ? event.changedTouches[touchIdx].pageY : event.pageY) - this.rects[rectIdx].startY;

             this.rects[rectIdx].fullDistanceX = this.rects[rectIdx].distanceX + this.rects[rectIdx].touchShiftX;
             this.rects[rectIdx].fullDistanceY = this.rects[rectIdx].distanceY + this.rects[rectIdx].touchShiftY;

             if (eventName == "move") {
                 /*
                 console.log("*************************** MOVE **********************");
                 //console.log(event.changedTouches[touchIdx].pageX + " - page X;");
                 //console.log(event.changedTouches[touchIdx].pageY + " - page Y;");
                 //console.log(this.rects[rectIdx].startX + " - start X");
                 //console.log(this.rects[rectIdx].startY + " - start Y");
                 console.log(this.rects[rectIdx].touchShiftX + " - touchShift X;");
                 console.log(this.rects[rectIdx].touchShiftY + " - touchShift Y;");
                 console.log(this.rects[rectIdx].distanceX + " - distance X");
                 console.log(this.rects[rectIdx].distanceY + " - distance Y");
                 console.log(this.rects[rectIdx].fullDistanceX + " - full distance X");
                 console.log(this.rects[rectIdx].fullDistanceY + " - full distance Y");
                 console.log(event.changedTouches[touchIdx].identifier + " - touch identifier");
                 */
             }
             if (eventName == "end") {
                 /*
                 console.log("*************************** END **********************");
                 console.log(this.rects[rectIdx].touchShiftX + " - shift X; before");
                 console.log(this.rects[rectIdx].touchShiftY + " - shift Y; before");
                 console.log(this.rects[rectIdx].distanceX + " - distance X");
                 console.log(this.rects[rectIdx].distanceY + " - distance Y");
                 console.log(this.rects[rectIdx].fullDistanceX + " - full distance X");
                 console.log(this.rects[rectIdx].fullDistanceY + " - full distance Y");
                 */
             }

             typeof this.callbacks[eventName] === typeof function () {} &&
             this.callbacks[eventName].call(this[rectIdx], event, this.rects[rectIdx]);

             if (eventName == "end") {
                 touched.splice(isTouch ? event.changedTouches[touchIdx].identifier : 0, 1,
                     undefined
                 );

                 if (event.targetTouches.length) {
                     this.rects[rectIdx].identifier = event.targetTouches[event.targetTouches.length - 1].identifier;

                     /*
                      * In case of multi touch.
                      * On touch end event we reset the previous active touch start(X,Y) position.
                      * To establish correct shifting.
                      * */
                     this.rects[rectIdx].startX = isTouch ? event.targetTouches[event.targetTouches.length - 1].pageX : event.pageX;
                     this.rects[rectIdx].startY = isTouch ? event.targetTouches[event.targetTouches.length - 1].pageY : event.pageY;
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
             // Take away extra data.
             delete event.magicElement;

             if (magic) {
                 // On start it will be only one new touch with certainty.
                 touched.splice(isTouch ? event.changedTouches[0].identifier : 0, 1,
                     {
                         magic: magic,
                         idx:   magic.lastTouched
                     }
                 );
             } else if (!touched.length) {
                 return;
             } else {
                 magic = touched;
             }

             if (magic.magic) {
                 magic.callMagicCallback(event, magic.lastTouched, 0);
             } else {
                 if (isTouch) {
                     Array.prototype
                         .splice.call(event.changedTouches,0)
                            .forEach(function (touch_bit, touchIdx) {
                                 var o = touched[touch_bit.identifier];
                                 if (o != undefined) {
                                     o.magic.callMagicCallback(event, o.idx, touchIdx);
                                 }
                     });
                 } else {
                     touched[0].magic.callMagicCallback(event, touched[0].idx, 0);
                 }
             }
         }, false);
     });

     window.touch = touch;
} (window);