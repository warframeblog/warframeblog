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


	var internalPromos = [
		{ full: 'revenant.png', square: '', href: '/how-to-get-revenant/' },
		{ full: 'frame-fighter.jpg', square: '', href: '/frame-fighter/'},
		{ full: 'warframe-fortuna.png', square: '', href: '/fortuna/' }
	];

	var externalPromos = [
		{ full: 'formula.png', square: 'formula-sq.png', href: 'http://www.tkqlhce.com/click-8733974-13426864?sid=formula' },
		{ full: 'doom.jpg', square: '', href: 'http://www.jdoqocy.com/click-8733974-12192354?sid=doom&url=http%3A%2F%2Fwww.kinguin.net%2Fproduct%2F424138%2Fdoom-demon-multiplayer-pack-dlc-steam-cd-key.html&cjsku=BR2016-0905-2241_413229' },
		{ full: 'wow.jpg', square: 'wow-sq.png', href: 'http://www.jdoqocy.com/click-8733974-13425281?sid=wow' },
		{ full: 'midweek.jpg', square: 'midweek-sq.jpg', href: 'http://www.anrdoezrs.net/click-8733974-12193130?sid=kinguin' },
		{ full: 'back-to-school.jpg', square: '', href: 'http://www.anrdoezrs.net/click-8733974-13441653?sid=school'},
		{ full: 'pes2019.jpg', square: 'pes2019-sq.png', href: 'http://www.tkqlhce.com/click-8733974-13433572?sid=pes'}
	];

	function setArticlePromo() {
		var isInternal = getRandomInt(7) === 1 ? true : false;
		var promoNumber = getPromoNumber(isInternal);
		var promo = getPromo(isInternal, promoNumber);

		$('.article-promo img').attr('src', getPromoPrefix(isInternal) + promo.full);
		$('.article-promo a').attr('href', promo.href);
	}

	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}

	function getPromoNumber(isInternal) {
		return isInternal ? getRandomInt(internalPromos.length) : getRandomInt(externalPromos.length);
	}

	function getPromo(isInternal, promoNumber) {
		return isInternal ? internalPromos[promoNumber] : externalPromos[promoNumber];
	}

	function getPromoPrefix(isInternal) {
		return isInternal ? '/images/promo/internal/' : '/images/promo/external/';
	}

	selectVoidTraderInventory();
	setArticlePromo();
});