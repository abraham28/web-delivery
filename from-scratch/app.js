$(document).ready(function () {
	var files = $("#files");
	var originalCopy = [],
		cleanCopy = [];

	$("#downloadFiles").click(downloadFiles);

	$("#uploadFiles").click(function () {
		files.click();
	});

	$(files).change(function () {
		console.log(files);
		originalCopy = files[0].files;

		removeUnused(originalCopy);

		console.log("original");
		console.log(originalCopy);
		$("#leftStatus").text(originalCopy.length + " files are ready for cleaning.")
	});


	function removeUnused(fileListResult) {
		var ext_a = [".html", ".htm", ".css", ".php", ".js", ".aspx", ".ascx", ".master", ".cshtml", ".less", ".scss", ".sass", ".json", ".md"],
			ext_b = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".bmp", ".ico", ".js", ".css", ".json"],
			filesList = [],
			unusedFilesList = [],
			dot = 0,
			ext = '',
			fileListResultLength = fileListResult.length;

		for (var i = 0; i < fileListResultLength; i++) {
			cleanCopy.push(fileListResult[i]);
			var dot = fileListResult[i].name.lastIndexOf("."),
				ext = fileListResult[i].name.substring(dot);
			if (ext_a.indexOf(ext) !== -1) filesList.push(fileListResult[i]);
			if (ext_b.indexOf(ext) !== -1) unusedFilesList.push(fileListResult[i]);
		}
		compareFiles(filesList, unusedFilesList);
	}

	function compareFiles(callingFilesList, unusedFilesList) {
		function checkingFile(i) {
			var fileReader = new FileReader();
			fileReader.onload = function () {
				var doc = this.result;
				for (var j = 0; j < unusedFilesList.length; j++) {
					var used = false;
					if ((typeof unusedFilesList[j] !== "undefined")) used = new RegExp(unusedFilesList[j]["name"], 'i').test(doc);
					if (used) delete unusedFilesList[j];
				}


				if (i + 1 === callingFilesList.length) {
					unusedFilesListCopy = [];
					$.each(unusedFilesList, function (i, file) {
						if (typeof file !== "undefined") unusedFilesListCopy.push(file);
					});

					console.log("unused");
					console.log(unusedFilesListCopy);
					cleanCopy = cleanCopy.filter(function (value) {
						return this.indexOf(value) < 0;
					}, unusedFilesListCopy);
					$("#rightStatus").text("Removed " + unusedFilesListCopy.length + " unused files.");
					console.log("clean");
					console.log(cleanCopy);
				}
			};
			fileReader.readAsText(callingFilesList[i]);
		}
		for (var i = 0; i < callingFilesList.length; i++) {
			checkingFile(i);
		}
	}

	function downloadFiles() {
		if (cleanCopy.length < 1) return;
		$("#dlSpinner").show();

		var filesToZip = cleanCopy,
			numOfFiles = filesToZip.length,
			zippedCount = 0,
			zip = new JSZip();

		$.each(filesToZip, function (i, file) {
			var fileReader = new FileReader();
			fileReader.onload = function () {
				zip.file(file.webkitRelativePath, this.result);
				zippedCount++;
			};
			fileReader.readAsArrayBuffer(file);
		});

		window.setInterval(function () {
			if (numOfFiles == 0) return;
			$("#rightStatus").text("Zipped " + zippedCount + " of " + numOfFiles);
			if (numOfFiles == zippedCount) {
				$("#rightStatus").text("Zipped " + zippedCount + " of " + numOfFiles + "  Please wait...");
				numOfFiles = 0;
				window.clearInterval(this);
				zip.generateAsync({
						type: "blob"
					})
					.then(function (content) {
						saveAs(content, "delivery.zip");
						$("#rightStatus").text("Zipped Successfully!");
						$("#dlSpinner").hide();
					});
			}
		}, 100);
	}

});
