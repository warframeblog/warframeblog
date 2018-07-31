jQuery( document ).ready(function ( $ ) {
	function selectVoidTraderInventory() {
		$('.trader a[data-toggle="tab"]').click(function (e) {
			e.preventDefault();
			$('.trader li.active').removeClass('active');
			$(this).parent().addClass('active');

			var platformId = $(this).attr('href');
			var activeTabClasses = "in active";
			$('.trader-content .active').removeClass(activeTabClasses);
			$(platformId).addClass(activeTabClasses);
		});
	}

	selectVoidTraderInventory();
});