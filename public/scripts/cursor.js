(function(){

    $(document).ready(function() {
        $('.content-section p a').each(function(){
            if(!$(this).hasClass('hoverable')){$(this).addClass('hoverable');}
        });
    });
    
    $(document).ready(function() {
        const $bigBall = document.querySelector('.cursor__ball--big');
        const $smallBall = document.querySelector('.cursor__ball--small');
        const $hoverables = document.querySelectorAll('.hoverable');
    
        // Listeners
        document.body.addEventListener('mousemove', onMouseMove);
    
        for (let i = 0; i < $hoverables.length; i++) {
        $hoverables[i].addEventListener('mouseenter', onMouseHover);
        $hoverables[i].addEventListener('mouseleave', onMouseHoverOut);
        }
       
        console.log($(window).height());
        // Move the cursor
        function onMouseMove(e) {
        TweenMax.to($bigBall, .4, {
            x: e.pageX - 15,
            y: e.clientY - 15
        })
        TweenMax.to($smallBall, .1, {
            x: e.pageX - 5,
            y: e.clientY - 7
        })
        //console.log("scrolly: " + scrollPos + " , cursory: " + e.pageY + " , total: " + (e.pageY + scrollPos) + " , screenY: " + e.screenY + " bigbally: " + $bigBall.y);
        }
    
        // Hover an element
        function onMouseHover() {
        TweenMax.to($bigBall, .3, {
            scale: 3
        });
        TweenMax.to($smallBall, .5, {
            scale: 2
        });
        }
        function onMouseHoverOut() {
        TweenMax.to($bigBall, .3, {
            scale: 1
        });
        TweenMax.to($smallBall, .5, {
            scale: 1
        });
        }
    });
    })();