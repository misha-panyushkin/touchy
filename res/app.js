! function (window) {
    var stack   = 3,
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
        .aflat(function (event, rect) {

            event.preventDefault();

            swipe(this).track(rect.distanceX);
        })
        .left(function (event, rect) {

            event.preventDefault();

            var root = parseInt(this.getAttribute("data-at-stage"));

            if (root === stack)
                swipe(this).setCallback(function () {}).offset(0, 0);
            else
                swipe(this)
                    .setCallback(function () {

                        var next = root + 1;
                        this.setAttribute("data-at-stage", next);
                        this.className = "atPage" + next;
                    })
                    .offset(-window.innerWidth);
        })
        .right(function (event, rect) {

            event.preventDefault();

            var root = parseInt(this.getAttribute("data-at-stage"));

            if (root === 1)
                swipe(this).setCallback(function () {}).offset(0,0);
            else
                swipe(this)
                    .setCallback(function () {

                        var previous = root - 1;
                        this.setAttribute("data-at-stage", previous);
                        this.className = "atPage" + previous;
                    })
                    .offset(window.innerWidth);
        });

    touch(".pic_show")
        .start(function (event, rect, first) {
            event.preventDefault();

            if (first) {
                swipe(this).stop(rect.left + rect.distanceX);
                this.style.left = rect.left + rect.distanceX + "px";
            }
        })
        .aflat(function (event, rect, first) {

            event.preventDefault();
            swipe(this).track(rect.distanceX);
        })
        .left(function (event, rect) {

            event.preventDefault();

            if (rect.speed < 100 ) {
                if (rect.left + rect.distanceX < window.innerWidth - rect.width) {
                    swipe(this)
                        .setCallback(function () {
                            this.style.left = window.innerWidth - rect.width + "px";
                        })
                        .offset(window.innerWidth - rect.width - rect.left);
                } else {
                    this.style.left = rect.left + rect.distanceX + "px";
                    swipe(this).stop();
                }
            } else {
                if (rect.left - window.innerWidth < window.innerWidth - rect.width) {
                    swipe(this)
                        .setCallback(function () {
                            this.style.left = window.innerWidth - rect.width + "px";
                        })
                        .offset( window.innerWidth - rect.width - rect.left);
                } else {
                    swipe(this)
                        .setCallback(function () {
                            this.style.left = rect.left - window.innerWidth + "px";
                        })
                        .offset(-window.innerWidth);
                }
            }
        })
        .right(function (event, rect) {

            event.preventDefault();

            if (rect.speed < 100 ) {
                if (rect.left + rect.distanceX >= 0) {
                    swipe(this)
                        .setCallback(function () {
                            this.style.left = "0px";
                        })
                        .offset(-rect.left);
                } else {
                    this.style.left = rect.left + rect.distanceX + "px";
                    swipe(this).stop();
                }
            } else {
                if (rect.left + window.innerWidth >= 0) {
                    swipe(this)
                        .setCallback(function () {
                            this.style.left = "0px";
                        })
                        .offset(-rect.left);
                } else {
                    swipe(this)
                        .setCallback(function () {
                            this.style.left = rect.left + window.innerWidth + "px";
                        })
                        .offset(window.innerWidth);
                }
            }
        });
} (window);