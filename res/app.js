! function (window) {
    var stack   = 3,
        $stages = [
            $("#stage1"),
            $("#stage2"),
            $("#stage3")
        ],
        classes = ["left", "center", "right"];

    function getPages (stage, stack) {
        if (stage === 1)
            return [0, 1];
        else if (stage === stack)
            return [stack-2, stack-1];
        else if (stage < stack && stage > 1)
            return [stage-2, stage-1, stage];
    }

    touch("#scene")
        .start(function (event, rect, first) {

            if (first) {
                swipe(this).stop(rect.left - this.offsetLeft);
            }
        })
        .aflat(function (event, rect) {

            event.preventDefault();

            var root = parseInt(this.getAttribute("data-at-stage"));

            getPages(root, stack).forEach(function (idx) {
                $stages[idx].removeClass("hide");
            });

            swipe(this).track(rect.distanceX);
        })
        .left(function (event, rect) {

            event.preventDefault();

            var root = parseInt(this.getAttribute("data-at-stage")),
                that = this;

            if (root === stack)
                swipe(this).setCallback(function () {}).offset(0, 0);
            else
                swipe(this)
                    .setCallback(function () {

                        var next = root + 1;
                        that.setAttribute("data-at-stage", next);

                        getPages(root, stack).forEach(function (is, idx, arr) {

                            if (arr.length === idx + 1)
                                $stages[is].removeClass(classes.join(" ")).addClass(classes[1]);
                            else
                                $stages[is].removeClass(classes.join(" ")).addClass(classes[0] + " hide");
                        });

                        //alert($(".center").hasClass("hide"));
                    })
                    .offset(-window.innerWidth);
        })
        .right(function (event, rect) {

            event.preventDefault();

            var root = parseInt(this.getAttribute("data-at-stage")),
                that = this;

            if (root === 1)
                swipe(this).setCallback(function () {}).offset(0,0);
            else
                swipe(this)
                    .setCallback(function () {

                        var previous = root - 1;
                        that.setAttribute("data-at-stage", previous);

                        getPages(root, stack).forEach(function (is, idx) {

                            if (idx === 0)
                                $stages[is].removeClass(classes.join(" ")).addClass(classes[1]);
                            else
                                $stages[is].removeClass(classes.join(" ")).addClass(classes[2] + " hide");
                        });
                    })
                    .offset(window.innerWidth);
        });
} (window);