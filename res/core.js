
var touch = function(){
    var touched = [],
        // TODO desktop events support.
        prefix  = "touch";

    function touch( elem ){
        getElement(elem)
            .forEach(getTouch);
    }

    function getElement(selector){
        return String(selector) === selector
            ? document.querySelectorAll(selector)
            : selector instanceof HTMLElement
                ? [ selector ]
                : selector;
    }

    function getTouch(elem){
        var idx = touched.length;
        while(idx--) if(touched[idx].target === elem){
            touched[idx] = new Touchy(elem);
            return;
        }
        touched.push(new Touchy(elem));
    }

    return touch;
}();

function Touchy(new_target){
    var newbie = this;
    newbie.target = new_target;
}

Touchy.prototype.bind = function(props){
    var touchy = this;
    for(var idx in props) if(props.hasOwnProperty(props[idx])){
        // TODO embedding common event cover.
        var eventName = "on" + (idx == "click" ? "" : prefix) + idx;
        touchy.target[ eventName ] = function(event){
            touchy[eventName].call( touchy, event, props[idx] );
        }
    }
};

Touchy.prototype.getTouch = function(event){
    event = event.originalEvent || event;
    return event.touches ? event.touches[0] : event;
};

Touchy.prototype.ontouchstart = function(event, eventHandler){
    eventHandler(
        this.getTouch(event)
    );
};