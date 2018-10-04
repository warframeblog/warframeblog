var $ = jQuery;
$(document).ready(function(){
  // poster frame click event
  $(document).on('click','.js-videoPoster',function(ev) {
    ev.preventDefault();
    var $poster = $(this);
    var $wrapper = $poster.closest('.js-videoWrapper');
    videoPlay($wrapper);
  });

  // play the targeted video (and hide the poster frame)
  function videoPlay($wrapper) {
    var $iframe = $wrapper.find('.js-videoIframe');
    var src = $iframe.data('src');
    // hide poster
    $wrapper.addClass('videoWrapperActive');
    // add iframe src in, starting the video
    $iframe.attr('src',src);
  }

  function selectFortunaFeature() {
    $('.fortuna-features a[data-toggle="tab"]').click(function (e) {
      e.preventDefault();
      $('.fortuna-features li.active').removeClass('active');
      $(this).parent().addClass('active');

      var platformId = $(this).attr('href');
      var activeTabClasses = "in active";
      $('.fortuna-features-content .active').removeClass(activeTabClasses);
      $(platformId).addClass(activeTabClasses);
    });
  }

  selectFortunaFeature();
});