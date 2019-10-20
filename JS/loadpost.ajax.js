/**
 * WP Reader accepts a user-defined URL and tries to obtain
 * the 10 latest posts at the URL location through the WP REST API.
 *
 */

jQuery( document ).ready(function($){

    // Create global rest_url variable.
    var rest_url;

    // Get user specified URL from form.
    $('#new-url').submit(function(e) {
        // Don't reload page.
        e.preventDefault();
        // Get the URL from the form.
        var raw_url = $('input[name=raw_url]').val();

        // Check if the string entered in the form is a porper URL.
        try {
            $('.error').remove();
            var clean_url = (new URL(raw_url)).protocol + '//' + (new URL(raw_url)).hostname;
            rest_url = clean_url + '/wp-json/wp/v2/';
            // Get the posts from the new URL.
            console.log(rest_url);
            get_post_list();
        }
        // Otherwise, throw an error message.
        catch (e) {
            $('.site-header').append('<div class="error">That didn&rsquo;t work. Try a different URL.</div>');
            console.log('ERROR: User input is not a proper URL.');
        }
    });

    function get_post_list() {

        $('.nav-loader').toggle();
        var json_url = rest_url + 'posts/';

        $.ajax({
            dataType: 'json',
            url: json_url
        })

        .done(function(object){
            create_post_list(object);
        })

        .fail(function() {
            $('.site-header').append('<div class="error">That didn&rsquo;t work. Try a different URL.</div>');
            console.log('ERROR: REST error. Nothing returned for AJAX.');
        })

        .always(function() {
            $('.nav-loader').remove();
        })
    }

    function create_post_list(object) {
        $('.navigation-list').empty().append('<ul></ul>');
        var nav_list_item;

        for(var i=0; i<object.length; i++) {
            nav_list_item =
                '<li>' +
                '<a href="javascript:void(0)" data-id="' + object[i].id + '">' +
                object[i].title.rendered +
                '</a>' +
                '</li>';
            $('.navigation-list ul').append(nav_list_item);
        }
        post_trigger();
    }

    function post_trigger() {
        $('.navigation-list a').on('click', get_post);
        $('.navigation-list a').first().trigger('click');
    }

    // Get the post selected from the navigation list.
    function get_post() {
        $('.navigation-list a').removeClass('current');
        $(this).addClass('current').append('<img src="JS/spinner.svg" class="ajax-loader" />');
        $('.main-area').addClass('loading');

        var post_id = $(this).attr('data-id');

        // Create REST API request.
        var json_url = rest_url + 'posts/' + post_id + '?_embed=true';

        // AJAX the post data
        $.ajax({
            dataType: 'json',
     		url : json_url
     	})

        .done(function(object) {
            // Get the post data.
            the_post_data(object);
        })

        .fail(function() {
            $('.site-header').append('<div class="error">That didn&rsquo;t work. Try slecting a different post or try a new URL.</div>');
            console.log('ERROR: Single post error.');
        })

        .always(function() {
            $('.ajax-loader').remove();
            $('.loading').removeClass('loading');
            console.log( 'Single post AJAX complete' );
        });
    }

    // Get the post data based on AJAX request.
    function the_post_data(object) {

        // Get the featured image ID (0 if no featured image):
        var featured_img_ID = object.featured_media;

        var feat_image;

        build_post();

        // Create HTML for featured image.
        function output_the_image() {
            var theimage = object._embedded['wp:featuredmedia'][0];
            var img_large = '';
            var img_width = theimage.media_details.sizes.full.width;
            var img_height = theimage.media_details.sizes.full.height;
            if (theimage.media_details.sizes.hasOwnProperty("large")) {
                img_large = theimage.media_details.sizes.large.source_url +  ' 1024w, ';
            }
            feat_image = '<div class="featured-image centered">' +
                         '<img src="' + theimage.media_details.sizes.full.source_url + '" ' +
                         'width="' + img_width + '" ' +
                         'height="' + img_height + '" ' +
                         'class="the-featured-image" ' +
                         'alt="" ' +
                         'srcset="' + theimage.media_details.sizes.full.source_url + ' ' + img_width + 'w, ' + img_large + theimage.media_details.sizes.medium.source_url + ' 300w" ' +
                         'sizes="100vw">' +
                         '</div>';
                         console.log('run');
            return feat_image;
        }

        // set up HTML to be added.
        function build_post(){
            $('.skeleton').removeClass('skeleton');
            var date = new Date(object.date);
            if (featured_img_ID !== 0) {
                if ($('.featured-image').length) {
                    $('.featured-image').replaceWith(output_the_image());
                } else {
                    $('.post').before(output_the_image());
                }
            } else {
                $('.featured-image').remove();
            }
            $(".post-title").text(object.title.rendered);
            $(".post-author").text(object._embedded.author[0].name);
            $(".post-date").text(date.toDateString());
            $(".post-link").replaceWith('<span class="post-link">' + '<a href="' + object.link + '" rel="bookmark">Original source</a></span>');
            $(".post-content").replaceWith('<div class="post-content">' + object.content.rendered + '</div>');

        }

    } // END function the_previous_post_data()

});
