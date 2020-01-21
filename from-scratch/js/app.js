$(document).ready(function () {
	var files = $("#files");
	var originalCopy = [],
		cleanCopy = [];

	$("#downloadFiles").click(downloadFiles);

	$("#uploadFiles").click(function () {
		files.click();
	});

	$(files).change(function () {
		cleanCopy = [];
		originalCopy = files[0].files;
		removeUnused(originalCopy);
		$("#leftStatus").text(originalCopy.length + " files are ready for cleaning.")
	});

	function FileObj(file, used) {
		this.file = file;
		this.used = used;
	}

	function convertToFileTreeObj(fileArray) {
		var fileDir = {};
		let curFileDir;

		for (let file of fileArray) {
			curFileDir = fileDir;
			path = file.webkitRelativePath.split("/");
			for (let segment of path) {
				if (segment !== "") {
					let fileObj = new FileObj(file, 'false');
					if (!(segment in curFileDir)) {
						if (segment == path[path.length - 1]) {
							curFileDir[segment] = fileObj;
						} else {
							curFileDir[segment] = {};
						}
					}
					curFileDir = curFileDir[segment];
				}
			}
		}
		return fileDir;
	}

	function displayFileTreeObj(fileTree, elementID) {
		var element = $("#" + elementID);
		$(element).empty();
		var output = $("<ul class='root'></ul>");
		let current;

		for (let file of fileTree) {
			current = output;
			path = file.file.webkitRelativePath.replace(/ /g,"_").split("/");
			for (let segment of path) {
				if (segment.trim() !== "") {
					if (segment == path[path.length - 1]) {
						if (file.used) {
							$(current).append("<li class='files used'>" + segment + "</li>");
						} else {
							$(current).append("<li class='files unused'>" + segment + "</li>");
						}
					} else {
						let newChild = $("<li><span class='dir'>" + segment + "</span><ul class='folder " + segment + "'></ul><li>");
						console.log(newChild);
						if (!($(current).find("ul." + segment).length > 0)) {
							$(current).append(newChild[0]);
						}
						current = $(current).find("ul." + segment);
					}
				}
			}
		}
		$(element).append(output);
		$("#"+ elementID + " .dir").click(function () {
			console.log("CLICKED");
			this.parentElement.querySelector(".folder").classList.toggle("active");
			this.classList.toggle("active");
		});
	}

	function removeUnused(fileListResult) {
		var ext_a = [".html", ".htm", ".css", ".php", ".js", ".aspx", ".ascx", ".master", ".cshtml", ".less", ".scss", ".sass", ".json", ".md"],
			ext_b = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".bmp", ".ico", ".js", ".css", ".json", ".otf", ".ttf", ".fnt", ".ttc"],
			filesList = [],
			unusedFilesList = [],
			dot = 0,
			ext = '',
			fileListResultLength = fileListResult.length;
		for (var i = 0; i < fileListResultLength; i++) {
			var dot = fileListResult[i].name.lastIndexOf("."),
				ext = fileListResult[i].name.substring(dot);
			let fileObj = new FileObj(fileListResult[i], false);
			if (ext_a.indexOf(ext) !== -1 || ext_b.indexOf(ext) !== -1) cleanCopy.push(fileObj);
			if (ext_a.indexOf(ext) !== -1) filesList.push(fileObj);
			if (ext_b.indexOf(ext) !== -1) unusedFilesList.push(fileObj);
		}
		originalCopy = cleanCopy;
		compareFiles(filesList, unusedFilesList);
	}

	function compareFiles(callingFilesList, unusedFilesList) {
		function checkingFile(i) {
			var fileReader = new FileReader();
			fileReader.onload = function () {
				var doc = this.result;
				for (var j = 0; j < unusedFilesList.length; j++) {
					var used = false;
					if ((typeof unusedFilesList[j] !== "undefined")) used = new RegExp(unusedFilesList[j].file.name, 'i').test(doc);
					if (used) delete unusedFilesList[j];
				}


				if (i + 1 === callingFilesList.length) {
					unusedFilesListCopy = [];
					$.each(unusedFilesList, function (i, fileObj) {
						if (typeof fileObj !== "undefined") unusedFilesListCopy.push(fileObj);
					});
					cleanCopy = cleanCopy.filter(function (value) {
						return this.indexOf(value) < 0;
					}, unusedFilesListCopy);

					console.log(markUnusedFiles(originalCopy, cleanCopy));

					originalCopy = markUnusedFiles(originalCopy, cleanCopy);
					displayFileTreeObj(originalCopy, "inDirectory");


					$("#rightStatus").text("Removed " + unusedFilesListCopy.length + " unused files.");
					displayFileTreeObj(cleanCopy, "outDirectory");
				}
			};
			fileReader.readAsText(callingFilesList[i].file);
		}
		for (var i = 0; i < callingFilesList.length; i++) {
			checkingFile(i);
		}
	}

	function markUnusedFiles(dirtyArray, cleanArray) {
		for (let i = 0; i < dirtyArray.length; i++) {
			for (let j = 0; j < cleanArray.length; j++) {
				if (dirtyArray[i] == cleanArray[j]) {
					dirtyArray[i].used = true;
					break;
				}
			}
		}
		return dirtyArray;
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
				zip.file(file.file.webkitRelativePath, this.result);
				zippedCount++;
			};
			fileReader.readAsArrayBuffer(file.file);
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
