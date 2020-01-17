
$("#start").click(function() {
	$("#result").empty();
	let css = $("#css").val().trim();
	let output = sortCSS(css);
	$("#result").append(output);
	$("#resultz").val(output);
});