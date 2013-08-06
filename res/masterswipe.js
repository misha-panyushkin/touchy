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
        var idx = grasped.length;
        while (idx--) if (grasped[idx].target === node) {
            return grasped[idx];
        }
        return grasped[ grasped.push(new swipe.like.magic(node)) - 1];
    };

    // Public methods.
    swipe.like = {

        constructor: swipe,

        magic: function (target) {
            this.target = target;
            this.setCallback(function () {});
        },

        setCallback: function (f) {
            removeSwipeEndListener.call(this);
            this.callback = function (swiped) {
                return function () {

                    swiped.stop();

                    //swiped.target.style.webkitTransitionProperty  = "-webkit-transform";
                    //swiped.target.style.webkitTransitionDuration  = 0 + "ms";
                    //swiped.target.style.webkitTransform = "translate3d(" + 0 + "px, " + 0 + "px, " + 0 + "px)";

                    f();
                }
            } (this);

            return this;
        },

        stop: function() {
            var f = function (that) {
                return function () {
                    removeSwipeEndListener.call(that);
                    var rect = that.target.getBoundingClientRect();

                    that.target.style.webkitTransition = "";
                    that.target.style.webkitTransform  = "";

                    that.target.style.left  = (!isNaN(that.fromX) && (that.fromX + that.offsetX) || (rect.left + window.scrollX)) + "px";
                    that.target.style.top   = (!isNaN(that.fromY) && (that.fromY + that.offsetY) || (rect.top  + window.scrollY)) + "px";

                    that.fromX = that.fromY = that.fromZ = undefined;
                };
            } (this);

            setTimeout(f, 0);
            return this;
        },

        track: function (x, y, z, speed, easing) {

            var args = Array.prototype.splice.call(arguments, 0);

            this.offsetX = x || 0;
            this.offsetY = y || 0;
            this.offsetZ = z || 0;

            args[3] = args[3] || 0;
            sliding.apply(this, args);

            return this;
        },

        from: function (x, y, z) {

            this.fromX = x || 0;
            this.fromY = y || 0;
            this.fromZ = z || 0;

            return this;
        },

        offset: function (x, y, z, speed, easing) {

            var args = Array.prototype.splice.call(arguments, 0),
                noOffset = this.offsetX === (x || 0) && this.offsetY === (y || 0) && this.offsetZ === (z || 0);

            this.offsetX = x || 0;
            this.offsetY = y || 0;
            this.offsetZ = z || 0;

            args[3] = !isNaN( args[3] ) && args[3].toString() || 0.2;

            if (noOffset) {
                this.callback();
            } else {
                addSwipeEndListener.call(this);
                sliding.apply(this, args);
            }

            return this;
        }
    };

    swipe.like.magic.prototype = swipe.like;

    window.swipe = swipe;

} (window);