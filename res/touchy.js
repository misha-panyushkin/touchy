var touch = function () {

    var debug = false,
        prefix = "touch";

    function touch (elem) {
        MasterTouch.Newbies.length = 0;
        MasterTouch
            .getElement(elem)
            .forEach(MasterTouch.makeTouch);
        return MasterTouch.Newbies;
    }

    var MasterTouch = new function () {
        var master_touch = this;
        // Touched elements.
        master_touch.touched = [];
        // Just touched list of elements.
        master_touch.Newbies = [];
        master_touch.Newbies.bind = function (props) {
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

    MasterTouch.makeTouch = function (elem) {
        MasterTouch.Newbies.push(
            MasterTouch[elem] = new SensitiveListener (elem)
        );
    };

    var SensitiveListener = function (new_target) {
        var listener = this;
        listener.target = new_target;
        listener.touches = [];
        listener.callbacks = {};
        listener.amount = 0;
        listener.fingers_in_session = 0;
    };

    SensitiveListener.prototype.setNativeCallbacks = function (callbacks_object) {
        var listener = this;
        listener.callbacks = callbacks_object;
    };

    SensitiveListener.prototype.bind = function (props) {
        var listener = this,
            types    = "start move end".split(" ");
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

    SensitiveListener.prototype.start = function (event) {
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

    SensitiveListener.prototype.move = function (event) {
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

    SensitiveListener.prototype.end = function (event) {
        event.preventDefault();
        var listener = this;
        Array.prototype.splice.call(
                event.changedTouches, 0
            ).forEach(function(touch){
                // Touch session save.
                var drop_out = listener.touches.splice (touch.identifier, 1, null);
                // Fire swipe for the last touch in session.
                ! listener.fingers_in_session && drop_out[ 0 ].preferable_way &&
                listener.callbacks[ drop_out[ 0 ].preferable_way ] &&
                listener.callbacks[ drop_out[ 0 ].preferable_way ] (event, drop_out, listener.credits);
            });
    };

    SensitiveListener.prototype.cancel = function (event) {
    };

    SensitiveListener.prototype.click = function (event) {
    };

    SensitiveListener.prototype.getEvent = function (event) {
        event = event.originalEvent || event;
        return event;
    };

    SensitiveListener.prototype.eventWrapper = function (event, type) {
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

    var pi             = 3.14159265359,
        touch_limen    = 10;

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

        this.preferable_plane = 0;
        this.preferable_way = 0;
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

    // Public.
    PathFinder.prototype.setStartPoint = function (X, Y) {
        this.startX    =  X ? X : 0;
        this.startY    =  Y ? Y : 0;
        this.shiftX    = this.shiftY = 0;
        this.startTime = new Date;
        this.preferable_plane = 0;
    };

    PathFinder.prototype.setPoint = function (X, Y) {
        var t = this;

        t.shiftX   =  X ? X - t.startX : 0;
        t.shiftY   =  Y ? Y - t.startY : 0;

        setAngle (t);

        ! t.preferable_plane && setPreferablePlane (t);

        setPreferableWay (t);

        t.vector = parseInt(12*t.angle/360) || 12;

        t.endTime = new Date;

        setSpeed (t);
    };

    return PathFinder;
}();