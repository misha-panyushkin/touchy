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
        // Hash based map of touched elements.
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
        var hash = elem.getAttribute('data-touch-id') || Math.random().toString().substr(2);
        MasterTouch.Newbies.push(
            MasterTouch[hash] = new EventListener(elem)
        );
    };


    function EventListener(new_target){
        var newbie = this;
        newbie.target = new_target;
        newbie.credits = {
            startX:     0,
            startY:     0,
            shiftX:     0,
            shiftY:     0,
            touches:    0
        };
    }

    EventListener.prototype.bind = function(props){
        var newbie = this;
        for(var type in props) if(props.hasOwnProperty(type)){
            var eventType   = (type == "click" ? "" : prefix) + type,
                callback    = function(newbie, callback, type){
                    return function(event){
                        newbie.eventWrapper.call( newbie, event, callback, type );
                    }
                }(newbie, props[type], type);
            newbie.target.addEventListener(eventType, callback, false);
            }
    };

    EventListener.prototype.getEvent = function(event){
        event = event.originalEvent || event;
        return event;
    };

    EventListener.prototype.start = function(event){
        var newbie = this,
            first_touch = event.targetTouches[0];
        newbie.credits.startX   =  first_touch ? first_touch.pageX : 0;
        newbie.credits.startY   =  first_touch ? first_touch.pageY : 0;
        newbie.credits.touches  = event.targetTouches.length;
        newbie.credits.shiftX   = newbie.credits.shiftY = 0;
    };

    EventListener.prototype.move = function(event){
        var newbie = this,
            first_touch = event.targetTouches[0];
        newbie.credits.shiftX   =  first_touch ? newbie.credits.startX - first_touch.pageX : 0;
        newbie.credits.shiftY   =  first_touch ? newbie.credits.startY - first_touch.pageY : 0;
        newbie.credits.touches  = event.targetTouches.length;
    };

    EventListener.prototype.eventWrapper = function(event, eventHandler, type){
        var newbie = this;
        event = newbie.getEvent(event);
        newbie[type] && newbie[type]( event );
        eventHandler(event, newbie.credits);
        debug && console.log(newbie.credits);
    };

    return touch;
}();