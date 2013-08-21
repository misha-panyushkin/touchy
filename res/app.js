! function (window, undefined) {
    var root    = 1,
        stack   = 3,
        stageSrollTop = 0,
        $stages = [
            $("#stage1"),
            $("#stage2"),
            $("#stage3")
        ],
        classes = ["left", "center", "right"];
    /*
    function getPages (stage, stack) {
        if (stage === 1)
            return [0, 1];
        else if (stage === stack)
            return [stack-2, stack-1];
        else if (stage < stack && stage > 1)
            return [stage-2, stage-1, stage];
    }
    */
   touch("#scene")
        .start(function (event, rect, first) {
            if (first) {
                root = parseInt(this.getAttribute("data-at-stage"));
                stageSrollTop = $stages[root-1].get(0).scrollTop;
            }
        })
        .upright(function (event, rect) {
           var refresher = document.getElementById("refresher");
            if (root === 1 && rect.way === "down" && !stageSrollTop) {
                event.preventDefault();
                swipe(this).track(0, rect.distanceY);
                swipe(refresher).track(0, rect.distanceY);
                if (rect.distanceY > 90)
                    refresher.setAttribute("class", "rotate");
                else
                    refresher.setAttribute("class", "");
            }
        })
        .down(function (event, rect) {
           var refresher = document.getElementById("refresher"),
               that = this;
            if (root === 1 && !stageSrollTop) {
                event.preventDefault();

                if (refresher.className.indexOf("rotate") + 1 > 0) {
                    swipe(this).setCallback(function () {
                        swipe(this).stop(0, 70, 0);
                    }).offset(0, 70, 0, .3, "cubic-bezier(.37,.79,.05,.99)");
                    swipe(refresher).setCallback(function () {
                        swipe(this).stop(0, 90, 0);
                    }).offset(0, 90, 0, .3, "cubic-bezier(.37,.79,.05,.99)");

                    refresher.setAttribute("class", "loader");
                    setTimeout(function () {
                        swipe(that).setCallback(function () {}).offset(0, 0, 0, .3, "cubic-bezier(.37,.79,.05,.99)");
                        swipe(refresher).setCallback(function () {}).offset(0, 0, 0, .3, "cubic-bezier(.37,.79,.05,.99)");
                        refresher.setAttribute("class", "");
                    }, 3000)
                } else {
                    swipe(this).setCallback(function () {}).offset(0, 0, 0, .3, "cubic-bezier(.37,.79,.05,.99)");
                    swipe(refresher).setCallback(function () {}).offset(0, 0, 0, .3, "cubic-bezier(.37,.79,.05,.99)");
                }
            }
        })
        .aflat(function (event, rect) {

            if (root === 1 && rect.way === "right" || root === stack && rect.way === "left")
                return;

            event.preventDefault();

            swipe(this).track(rect.distanceX);
        })
        .left(function (event, rect) {

            event.preventDefault();

            root = parseInt(this.getAttribute("data-at-stage"));

            if (root === stack)
                swipe(this).setCallback(function () {}).offset(0, 0);
            else
                swipe(this)
                    .setCallback(function () {

                        var next = root + 1;
                        this.setAttribute("data-at-stage", next);
                        this.className = "atPage" + next;
                    })
                    .offset(-window.innerWidth, 0, 0, .3, "cubic-bezier(.37,.79,.05,.99)");
        })
        .right(function (event, rect) {

            event.preventDefault();

            root = parseInt(this.getAttribute("data-at-stage"));

            if (root === 1)
                swipe(this).setCallback(function () {}).offset(0, 0);
            else
                swipe(this)
                    .setCallback(function () {

                        var previous = root - 1;
                        this.setAttribute("data-at-stage", previous);
                        this.className = "atPage" + previous;
                    })
                    .offset(window.innerWidth, 0, 0, .3, "cubic-bezier(.37,.79,.05,.99)");
        });

    touch(".pic_show")
        .aflat(function (event, rect, first) {

            event.preventDefault();
            event.stopMagic();

            if (rect.left + rect.distanceX >= 0 && rect.distanceX !== 0)
                swipe(this).track(rect.left + rect.distanceX/(Math.sqrt(Math.abs(rect.distanceX))));
            else if (rect.left + rect.distanceX < window.innerWidth - rect.width && rect.distanceX !== 0)
                swipe(this).track(rect.left + rect.distanceX/(Math.sqrt(Math.abs(rect.distanceX))));
            else
                swipe(this).track(rect.left + rect.distanceX);
        })
        .left(function (event, rect) {

            event.preventDefault();
            event.stopMagic();

            var parentRect = this.parentNode.getBoundingClientRect(),
                extra = 5;

            if (rect.speed < 100 ) {
                if (rect.left + rect.distanceX < parentRect.width - rect.width - extra) {
                    swipe(this)
                        .setCallback(function () {
                            swipe(this).stop(parentRect.width - rect.width - extra, 0, 0);
                        })
                        .offset(parentRect.width - rect.width - extra, 0, 0, .3, "cubic-bezier(.37,.79,.05,.99)");
                } else {
                    swipe(this).stop(rect.left + rect.distanceX, 0, 0);
                }
            } else {
                if (rect.left - parentRect.width < parentRect.width - rect.width - extra) {
                    swipe(this)
                        .setCallback(function () {
                            swipe(this).stop(parentRect.width - rect.width - extra, 0, 0);
                        })
                        .offset(parentRect.width - rect.width - extra, 0, 0, .3, "cubic-bezier(.37,.79,.05,.99)");
                } else {
                    swipe(this)
                        .setCallback(function () {
                            swipe(this).stop(rect.left - parentRect.width, 0, 0);
                        })
                        .offset(rect.left - parentRect.width, 0, 0, .3, "cubic-bezier(.37,.79,.05,.99)");
                }
            }
        })
        .right(function (event, rect) {

            event.preventDefault();
            event.stopMagic();

            var parentRect = this.parentNode.getBoundingClientRect();

            if (rect.speed < 100 ) {
                if (rect.left >= 0) {
                    swipe(this)
                        .setCallback(function () {
                            swipe(this).stop(0, 0, 0);
                        })
                        .offset(0, 0, 0, .3, "cubic-bezier(.37,.79,.05,.99)");
                } else {
                    swipe(this).stop(rect.left + rect.distanceX, 0, 0);
                }
            } else {
                if (rect.left + parentRect.width >= 0) {
                    swipe(this)
                        .setCallback(function () {
                            swipe(this).stop(0, 0, 0);
                        })
                        .offset(0, 0, 0, .3, "cubic-bezier(.37,.79,.05,.99)");
                } else {
                    swipe(this)
                        .setCallback(function () {
                            swipe(this).stop(rect.left + parentRect.width, 0, 0);
                        })
                        .offset(rect.left + parentRect.width, 0, 0, .3, "cubic-bezier(.37,.79,.05,.99)");
                }
            }
        });
} (window);