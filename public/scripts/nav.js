(function(){

    $(document).ready(function(){
        $('.nav').fadeOut();
        $('#menuContainer').click(function(){
            $('.nav').fadeIn();
            $('.nav').css('left', '0vw');
            $('#menuContainer').hide();
            $('.page-content .container').css('filter', 'blur(4px)');
            $('footer').css('filter', 'blur(4px)');
            //$('.oglcursor').fadeOut();
        });

        $('.nav .close_button').click(function(){
            $('.nav').css('left', '100vw');
            $('#menuContainer').fadeIn();
            $('.nav').fadeOut();
            $('.page-content .container').css('filter', 'none');
            $('footer').css('filter', 'none');
            $('.oglcursor').fadeIn();
        });//

    });
})();
