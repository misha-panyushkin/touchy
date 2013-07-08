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
                 // In case the touched element is Document itself make hack for proper event order chain.
                 element.addEventListener(eventsChain[0], magic.magicClosure(magic, element instanceof HTMLDocument), element instanceof HTMLDocument);
                 magic.length++;
             });

             // Where will be event callbacks live.
             this.callbacks = {};

             return this;
         },

         magicClosure: function (target, iAmDoc) {
             return function (event) {
                 if (iAmDoc) {
                     event.touchedEdgeDocument = target;
                 } else {
                     event.touchedEdgeNode = event.touchedEdgeNode || target;
                 }
             };
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

             var magic = event.touchedEdgeNode || event.touchedEdgeDocument;
             if (magic) {
                 touched.push(magic);
             } else if (!touched.length) {
                 return;
             } else {
                 magic = touched;
             }

             var eventName = isTouch
                 ? event.type.substr("touch".length)
                 : event.type.substr("mouse".length);

             if (eventName === "down") {
                 eventName = "start";
             } else if (eventName === "up") {
                 eventName = "end";
             }

             function callMagicCallback(magic) {
                 typeof magic.callbacks[eventName] === typeof function () {}
                 && magic.callbacks[eventName].call(event);
             }

             if (!magic.magic) {
                 magic.forEach(callMagicCallback);
             } else {
                 callMagicCallback(magic);
             }

             if (eventName == "end") {
                 // Here we should work around situation with list of changedTouches.
                 touched.splice(isTouch ? event.changedTouches[0].identifier : 0, 1);
             }
         }, false);
     });

     window.touch = touch;
} (window);