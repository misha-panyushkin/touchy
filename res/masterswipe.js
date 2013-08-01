/*
 * The Swipe Methods Collection.
 *
 * Created by Misha Panyushkin.
 * misha.panyushkin@gmail.com
 *
 * 01.08.2013
 * */

! function (window, undefined) {

    var grasped = [];

    // Private methods.
    function addSwipeEndListener () {
        removeSwipeEndListener.call(this);
        this.target.addEventListener("webkitTransitionEnd", this.callback, false);
    }

    function removeSwipeEndListener () {
        this.target.removeEventListener("webkitTransitionEnd", this.callback);
    }

    function sliding (x, y, z, speed, easing) {

        x = x || 0;
        y = y || 0;
        z = z || 0;

        this.target.style.webkitTransitionProperty  = "-webkit-transform";
        this.target.style.webkitTransitionDuration  = speed + "s";
        this.target.style.webkitTransform = "translate3d(" + x + "px, " + y + "px, " + z + "px)";

    }

    var swipe = function (node) {
        return new swipe.like.magic(node);
    };

    // Public methods.
    swipe.like = {

        constructor: swipe,

        magic: function (target) {
            this.target = target;
            this.setCallback(function () {});
        },

        setCallback: function (f) {
            this.callback = function (swiped) {
                return function () {

                    removeSwipeEndListener.call(swiped);

                    var rect = swiped.target.getBoundingClientRect();

                    swiped.target.style.webkitTransition = "";
                    swiped.target.style.webkitTransform  = "";

                    swiped.target.style.left  = rect.left + swiped.XShift + "px";
                    swiped.target.style.top   = rect.top  + swiped.YShift + "px";

                    //swiped.target.style.webkitTransitionProperty  = "-webkit-transform";
                    //swiped.target.style.webkitTransitionDuration  = 0 + "ms";
                    //swiped.target.style.webkitTransform = "translate3d(" + 0 + "px, " + 0 + "px, " + 0 + "px)";

                    f();
                }
            } (this)
        },

        steer: function (x, y, z, speed, easing) {
            var args = Array.prototype.splice.call(arguments, 0);
            args[3] = args[3] || 0;
            sliding.apply(this, args);
        },

        to: function (x, y, z, speed, easing) {

            this.XShift = x;
            this.YShift = y;
            this.ZShift = z;

            var args = Array.prototype.splice.call(arguments, 0);
            args[3] = !isNaN( args[3] ) && args[3].toString() || 0.2;

            addSwipeEndListener.call(this);

            sliding.apply(this, args);
        }
    };

    swipe.like.magic.prototype = swipe.like;

    window.swipe = swipe;

} (window);