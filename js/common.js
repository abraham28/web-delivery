$(document).ready(function () {

	$(".navLinks li").click(function () {
		let href = $(this).children("a").attr("href");
		window.location.href = href;
	});
});
