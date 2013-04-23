
var touch = function(){

    function touch( elem ){
        master.just_touched = [];
        master.getElement(elem)
            .forEach(master.getTouch);
        return master;
    }

    var master = new function Master(){
        this.touched = [];
        this.just_touched = [];
        // TODO desktop events support.
        this.prefix  = "touch";
    };

    master.getElement = function(selector){
        return String(selector) === selector
            ? Array.prototype.splice.call( document.querySelectorAll(selector), 0 )
            : selector instanceof HTMLElement || selector instanceof HTMLDocument
                ? [ selector ]
                : selector;
    };

    master.getTouch = function(elem){
        var idx     = master.touched.length,
            newbie  = new Touched(elem);
        master.just_touched.push(newbie);
        while(idx--) if(master.touched[idx].target === elem){
            master.touched[idx] = newbie;
            return;
        }
        master.touched.push(newbie);
    };

    master.bind = function(props){
        master.just_touched.forEach(function( newbie ){
            newbie.bind(props)
        });
    };

    function Touched(new_target){
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

    Touched.prototype.bind = function(props){
        var newbie = this;
        for(var type in props) if(props.hasOwnProperty(type)){
            var eventType   = (type == "click" ? "" : master.prefix) + type,
                callback    = function(newbie, callback, type){
                    return function(event){
                        newbie.eventWrapper.call( newbie, event, callback, type );
                    }
                }(newbie, props[type], type);
            newbie.target.addEventListener(eventType, callback, false);
        }
    };

    Touched.prototype.getEvent = function(event){
        event = event.originalEvent || event;
        return event;
    };

    Touched.prototype.start = function(event){
        var newbie = this,
            first_touch = event.targetTouches[0];
        newbie.credits.startX =  first_touch ? first_touch.pageX : 0;
        newbie.credits.startY =  first_touch ? first_touch.pageY : 0;
        newbie.credits.touches = event.targetTouches.length;
    };

    Touched.prototype.move = function(event){
        var newbie = this,
            first_touch = event.targetTouches[0];
        newbie.credits.shiftX =  first_touch ? newbie.credits.startX - first_touch.pageX : 0;
        newbie.credits.shiftY =  first_touch ? newbie.credits.startY - first_touch.pageY : 0;
        newbie.credits.touches = event.targetTouches.length;
    };

    Touched.prototype.eventWrapper = function(event, eventHandler, type){
        var newbie = this;
        event = newbie.getEvent(event);
        newbie[type] && newbie[type]( event );
        eventHandler(event, newbie.credits);
        console.log(newbie.credits);
    };

    return touch;
}();