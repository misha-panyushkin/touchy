var touch = function () {

    var debug = false,
        prefix = "touch";

    function touch (elem) {
        MasterTouch.Newbies.length = 0;
        MasterTouch
            .getElement(elem)
            .forEach(MasterTouch.getTouch);
        return MasterTouch.Newbies;
    }

    var MasterTouch = new function () {
        // Touched elements.
        this.touched = [];
        // Just touched list of elements.
        this.Newbies = [];
        this.Newbies.bind = function (props) {
            this.forEach(function (newbie) {
                newbie.bind(props)
            });
        };
    };

    MasterTouch.getElement = function (selector) {
        return String(selector) === selector
            ? Array.prototype.splice.call( document.querySelectorAll(selector), 0 )
            : selector instanceof HTMLElement || selector instanceof HTMLDocument
            ? [ selector ]
            : selector;
    };

    MasterTouch.getTouch = function (elem) {
        MasterTouch.Newbies.push(
            MasterTouch[elem] = new EventListener(elem)
        );
    };

    var EventListener = function (new_target) {
        var listener = this;
        listener.target = new_target;
        listener.touches = [];
        listener.callbacks = {};
        listener.amount = 0;
        listener.fingers_in_session = 0;
    };

    EventListener.prototype.setNativeCallbacks = function (callbacks_object) {
        var listener = this;
        listener.callbacks = callbacks_object;
    };

    EventListener.prototype.bind = function (props) {
        var listener = this,
            types    = "start move end click".split(" ");
        listener.setNativeCallbacks(props);
        types.forEach(function(type){
            var eventType   = (type == "click" ? "" : prefix) + type,
                callback    = function (listener, type) {
                    return function(event){
                        listener.eventWrapper.call( listener, event, type );
                    }
                }(listener, type);
            listener.target.addEventListener(eventType, callback, false);
        });
    };

    EventListener.prototype.start = function (event) {
        event.preventDefault();
        var listener = this;
        Array.prototype.splice.call(
            event.changedTouches, 0
        ).forEach(function (touch) {
                listener.touches.splice(touch.identifier, 1, new PathFinder);
                listener.touches[touch.identifier].setStartPoint(
                    touch.pageX,
                    touch.pageY
                );
                if (touch.identifier == 0) {
                    listener.credits = event.target.getBoundingClientRect();
                }
            });
    };

    EventListener.prototype.move = function (event) {
        event.preventDefault();
        var listener = this;
        Array.prototype.splice.call(
                event.changedTouches, 0
            ).forEach(function (touch) {
                listener.touches[touch.identifier] &&
                listener.touches[touch.identifier].setPoint(
                    touch.pageX,
                    touch.pageY
                );
            });
        // Smart move solution.
        event.target.style.top  = listener.credits.top + listener.touches[event.targetTouches[0].identifier ].shiftY + "px";
        event.target.style.left = listener.credits.left + listener.touches[event.targetTouches[0].identifier ].shiftX + "px";
    };

    EventListener.prototype.end = function (event) {
        event.preventDefault();
        var listener = this;
        Array.prototype.splice.call(
                event.changedTouches, 0
            ).forEach(function(touch){
                // Touch session save.
                var drop_out = listener.touches.splice(touch.identifier, 1, null)[0];
                // Straight swipes.
                if (drop_out.vector == 12) {
                    console.log("NORTH swipe.")
                } else if (drop_out.vector == 3) {
                    console.log("EAST swipe.")
                } else if (drop_out.vector == 6) {
                    console.log("SOUTH swipe.")
                } else if (drop_out.vector == 9) {
                    console.log("WEST swipe.")
                }
                // Inclined swipes.
                else if (drop_out.vector < 3) {
                    console.log("NORTH EAST swipe.")
                } else if (drop_out.vector > 3 && drop_out.vector < 6) {
                    console.log("SOUTH EAST swipe.")
                } else if (drop_out.vector > 6 && drop_out.vector < 9) {
                    console.log("SOUTH WEST swipe.")
                } else if (drop_out.vector > 9 && drop_out.vector < 12) {
                    console.log("NORTH WEST swipe.")
                }
            });
    };

    EventListener.prototype.cancel = function (event) {
    };

    EventListener.prototype.click = function (event) {
    };

    EventListener.prototype.getEvent = function (event) {
        event = event.originalEvent || event;
        return event;
    };

    EventListener.prototype.eventWrapper = function (event, type) {
        if (event instanceof MouseEvent) {
            throw new TypeError("Not a TouchEvent occurred");
        }
        var listener = this;
        event = listener.getEvent(event);
        listener.fingers_in_session = event.targetTouches.length && event.targetTouches[ event.targetTouches.length - 1 ].identifier + 1;
        console.log(listener.fingers_in_session);
        listener[type] && listener[type]( event );

        var touches_list = function(list){
            listener.touches.forEach(function(touch){
                touch && list.push(touch);
            });
            return list;
        }([]);
        listener.callbacks[type] && listener.callbacks[type](event, touches_list, listener.credits);
    };

    return touch;
}();

var PathFinder = function () {

    var pi = 3.14159265359;

    var PathFinder = function () {
        this.startX = 0;
        this.startY = 0;
        this.shiftX = 0;
        this.shiftY = 0;

        this.angle = 0;
        this.vector = 0;

        this.startTime = 0;
        this.endTime = 0;
        this.speed = 0;
    };

    PathFinder.prototype.setStartPoint = function (X, Y) {
        this.startX    =  X ? X : 0;
        this.startY    =  Y ? Y : 0;
        this.shiftX    = this.shiftY = 0;
        this.startTime = new Date;
    };

    PathFinder.prototype.setPoint = function (X, Y) {
        var t = this;

        t.shiftX   =  X ? X - t.startX : 0;
        t.shiftY   =  Y ? Y - t.startY : 0;

        t.angle    = function(){
            // Browser ordinates axis has opposite direction.
            var atan = t.shiftY == 0 || t.shiftX == 0
                    ? 0
                    : Math.atan( Math.abs( t.shiftX*t.shiftY > 0? t.shiftY/t.shiftX : t.shiftX/t.shiftY ) ),
                angle = atan*180/pi;
            return angle + (t.shiftX >= 0
                ? t.shiftY < 0 ? 0   : 90
                : t.shiftY > 0 ? 180 : 270);
        }();
        t.vector = parseInt(12*t.angle/360) || 12;

        t.endTime = new Date;
        var hypothenuse = Math.sqrt( Math.pow(t.shiftX,2) + Math.pow(t.shiftY,2)),
            time = (t.startTime - t.endTime)/1000;
        t.speed = hypothenuse / time;
    };

    return PathFinder;
}();