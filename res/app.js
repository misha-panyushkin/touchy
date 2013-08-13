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
} (window);