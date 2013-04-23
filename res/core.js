
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
            ? document.querySelectorAll(selector)
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
    }

    Touched.prototype.bind = function(props){
        var _touched = this;
        for(var idx in props) if(props.hasOwnProperty(idx)){
            // TODO embedding common event cover.
            var eventName = "on" + (idx == "click" ? "" : master.prefix) + idx;
            _touched.target[ eventName ] = function(_touched, callback){
                return function(event){
                    _touched.eventWrapper.call( _touched, event, callback );
                }
            }(_touched, props[idx]);
        }
    };

    Touched.prototype.getTouch = function(event){
        event = event.originalEvent || event;
        return event.touches ? event.touches[0] : event;
    };

    Touched.prototype.eventWrapper = function(event, eventHandler){
        var touched = this;
        eventHandler(
            touched.getTouch(event)
        );
    };


    return touch;
}();