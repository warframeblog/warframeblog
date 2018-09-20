var $ = jQuery;
$(document).ready(function(){
  init();

  $('.builds input').on('change', function() {
    init();
  });

  $('.warframes li').click(function(event) {
    if(!$(this).hasClass('active') || !$(this).attr('data-basics')) {
        return;
    }
    var image = $(this).attr('data-image');
    var title = $(this).children('h2').text();
    var basics = $(this).attr('data-basics') || '';
    var builds = $(this).attr('data-builds') || '';
    $('.overlay-content .warframe-image').css('background-image', 'url(' + image + ')');
    $('.warframe-info p.title').text(title);
    $('.description p.basics').text(basics);
    $('.description p.builds-info').html(builds);
    $('body').css('overflow','hidden');
    $('.overlay').fadeToggle(200);
  });

  $('.overlay .btn-close').on('click', function(){
    $('body').css('overflow','auto');
    $('.overlay').fadeToggle(200);   
  });
});

function init() {
  var checkedRole = $('input[name=role]:checked', '.builds').attr('id');
  $('.warframes li.active').removeClass('active');
  $('.warframes li[data-roles*=' + checkedRole + ']').addClass('active');
}