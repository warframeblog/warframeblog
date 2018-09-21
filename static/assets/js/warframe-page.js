document.addEventListener('DOMContentLoaded', () => {
	const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
	if ($navbarBurgers.length > 0) {
		$navbarBurgers.forEach(el => {
			el.addEventListener('click', () => {
				const target = el.dataset.target;
				const $target = document.getElementById(target);

				el.classList.toggle('is-active');
				$target.classList.toggle('is-active');
			});
		});
	}

	window.addEventListener('scroll', event => {
		event.preventDefault();

		if(window.scrollY > 30) {
			const mainNavbar = document.getElementById('main-navbar');
			mainNavbar.classList.add('is-not-transparent');
		} else {
			const mainNavbar = document.getElementById('main-navbar');
			mainNavbar.classList.remove('is-not-transparent');
		}
	});
});