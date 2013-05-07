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
    };

    EventListener.prototype.bind = function (props) {
        var listener = this;
        for(var type in props){
            var eventType   = (type == "click" ? "" : prefix) + type,
                callback    = function (listener, callback, type) {
                    return function(event){
                        listener.eventWrapper.call( listener, event, callback, type );
                    }
                }(listener, props[type], type);
            listener.target.addEventListener(eventType, callback, false);
        }
    };

    EventListener.prototype.getEvent = function (event) {
        event = event.originalEvent || event;
        return event;
    };

    EventListener.prototype.start = function (event) {
        console.log("START");
        event.preventDefault();
        var listener = this;
        Array.prototype.splice.call(
            event.changedTouches, 0
        ).forEach(function (touch) {
                listener.touches[touch.identifier] = new PathFinder;
                listener.touches[touch.identifier].setStartPoint(
                    touch.pageX,
                    touch.pageY
                );
                console.log(event.targetTouches.length + " START " + touch.identifier);
            });
        listener.credits = event.target.getBoundingClientRect();
    };

    EventListener.prototype.move = function (event) {
        event.preventDefault();
        var listener = this;
        Array.prototype.splice.call(
                event.changedTouches, 0
            ).forEach(function(touch){
                console.log(event.targetTouches.length + " MOVE " + touch.identifier + " " + listener.touches[touch.identifier]);
                listener.touches[touch.identifier].setPoint(
                    touch.pageX,
                    touch.pageY
                );
            });
        // Smart move solution.
        event.target.style.top = listener.credits.top + listener.touches[ event.targetTouches[0].identifier ].shiftY + "px";
        event.target.style.left = listener.credits.left + listener.touches[ event.targetTouches[0].identifier ].shiftX + "px";
    };

    EventListener.prototype.end = function (event) {
        event.preventDefault();
        var listener = this;
        Array.prototype.splice.call(
                event.changedTouches, 0
            ).forEach(function(touch){
                console.log(event.targetTouches.length + " END " + touch.identifier);
            });
    };

    EventListener.prototype.cancel = function (event) {
        console.log("CANCEL");
    };

    EventListener.prototype.click = function (event) {
        console.log("CLICK");
    };

    EventListener.prototype.eventWrapper = function (event, eventHandler, type) {
        var listener = this;
        event = listener.getEvent(event);
        listener[type] && listener[type]( event );
        eventHandler(event, listener.touches);
        debug && listener.touches.length && console.log("Start: (%i,%i) Shift: (%i,%i) Touches: %i Angle: %i Vector: %i Speed: %i",
                            listener.touches[0].startX,
                            listener.touches[0].startY,
                            listener.touches[0].shiftX,
                            listener.touches[0].shiftY,
                            listener.touches_length,
                            listener.touches[0].angle,
                            listener.touches[0].vector,
                            listener.touches[0].speed
        );
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