var touch = function(){

    var debug = true,
        prefix = "touch";

    function touch( elem ){
        MasterTouch.Newbies.length = 0;
        MasterTouch
            .getElement(elem)
            .forEach(MasterTouch.getTouch);
        return MasterTouch.Newbies;
    }

    var MasterTouch = new function(){
        // Touched elements.
        this.touched = [];
        // Just touched list of elements.
        this.Newbies = [];
        this.Newbies.bind = function(props){
            this.forEach(function( newbie ){
                newbie.bind(props)
            });
        };
    };

    MasterTouch.getElement = function(selector){
        return String(selector) === selector
            ? Array.prototype.splice.call( document.querySelectorAll(selector), 0 )
            : selector instanceof HTMLElement || selector instanceof HTMLDocument
            ? [ selector ]
            : selector;
    };

    MasterTouch.getTouch = function(elem){
        MasterTouch.Newbies.push(
            MasterTouch[elem] = new EventListener(elem)
        );
    };

    var EventListener = function (new_target){
        var listener = this;
        listener.target = new_target;
        listener.credits = new PathFinder();
    };

    EventListener.prototype.bind = function(props){
        var listener = this;
        for(var type in props) if(props.hasOwnProperty(type)){
            var eventType   = (type == "click" ? "" : prefix) + type,
                callback    = function(listener, callback, type){
                    return function(event){
                        listener.eventWrapper.call( listener, event, callback, type );
                    }
                }(listener, props[type], type);
            listener.target.addEventListener(eventType, callback, false);
        }
    };

    EventListener.prototype.getEvent = function(event){
        event = event.originalEvent || event;
        return event;
    };

    EventListener.prototype.start = function(event){
        event.preventDefault();
        var listener = this,
            first_touch = event.targetTouches[0];
        listener.credits.setStartPoint(
            first_touch ? first_touch.pageX : 0,
            first_touch ? first_touch.pageY : 0,
            event.targetTouches.length
        );
        listener.credits.rect = event.target.getBoundingClientRect();
    };

    EventListener.prototype.move = function(event){
        event.preventDefault();
        var listener = this,
            first_touch = event.targetTouches[0];
        listener.credits.setPoint(
            first_touch ? first_touch.pageX : 0,
            first_touch ? first_touch.pageY : 0,
            event.targetTouches.length
        );
        event.target.style.top = listener.credits.rect.top + listener.credits.shiftY + "px";
        event.target.style.left = listener.credits.rect.left + listener.credits.shiftX + "px";
    };

    EventListener.prototype.click = function(event){
        event.preventDefault();
    };

    EventListener.prototype.eventWrapper = function(event, eventHandler, type){
        var listener = this;
        event = listener.getEvent(event);
        listener[type] && listener[type]( event );
        eventHandler(event, listener.credits);
        debug && console.log("Start: (%i,%i) Shift: (%i,%i) Touches: %i Angle: %i Vector: %i",
                            listener.credits.startX,
                            listener.credits.startY,
                            listener.credits.shiftX,
                            listener.credits.shiftY,
                            listener.credits.touches,
                            listener.credits.angle,
                            listener.credits.vector
        );
    };

    return touch;
}();

var PathFinder = function(){

    var pi = 3.14159265359;

    var PathFinder = function(){
        this.startX = 0;
        this.startY = 0;
        this.shiftX = 0;
        this.shiftY = 0;

        this.angle = 0;
        this.vector = 0;

        this.touches = 0;
    };

    PathFinder.prototype.setStartPoint = function(X, Y, touches){
        this.startX   =  X ? X : 0;
        this.startY   =  Y ? Y : 0;
        this.touches  = touches;
        this.shiftX   = this.shiftY = 0;
    };

    PathFinder.prototype.setPoint = function(X, Y, touches){
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
        t.touches  = touches;
    };

    return PathFinder;
}();