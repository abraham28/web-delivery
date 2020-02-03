function FileTree(files) {

	function FileObj(file, used = false) {
		this.file = file;
		this.used = used;
	}

	this.fileFromInput = function (input) {
		if (typeof input === "undefined") return null;
		if (typeof input.files === "undefined") return null;

		var files = input.files;
		var output = [];

		for (var i = 0; i < files.length; i++) {
			var fileObj = new FileObj(files[i]);
			output.push(fileObj);
		}
		return output;
	}

	this.files = this.fileFromInput(files);

	this.displayInDOM = function (container) {
		container.innerHTML = "";
		var fileTree = this.files;
		var output = document.createElement("ul");
		output.classList.add("root");
		let current;

		for (let file of fileTree) {
			current = output;
			path = file.file.webkitRelativePath.split("/");
			for (let segment of path) {
				if (segment.trim() !== "") {
					if (segment == path[path.length - 1]) {
						if (file.used) {
							let li = document.createElement("li");
							li.classList.add("files", "used");
							li.innerHTML = segment;
							current.appendChild(li);
						} else {
							let li = document.createElement("li");
							li.classList.add("files", "unused");
							li.innerHTML = segment;
							current.appendChild(li);
						}
					} else {
						var segmentWithoutSpaces = segment.replace(/ /g, "_").replace(/./g, "-");
						let newChild = document.createElement("li");
						let span = document.createElement("span");
						span.classList.add("dir");
						span.innerHTML = segment;
						let ul = document.createElement("ul");
						ul.classList.add("folder", segmentWithoutSpaces);
						newChild.appendChild(span);
						newChild.appendChild(ul);
						if (current.querySelector("ul." + segmentWithoutSpaces) == null) {
							current.appendChild(newChild);
						}
						current = current.querySelector("ul." + segmentWithoutSpaces);
					}
				}
			}
		}
		container.appendChild(output);
		for (let dir of container.getElementsByClassName("dir")) {
			dir.addEventListener("click", function () {
				this.parentElement.querySelector(".folder").classList.toggle("active");
				this.classList.toggle("active");
			});
		}
	}
	return this;
}

function Abra() {

	this.onComplete = function (result) {
		console.log(result);
	}

	this.compareUpdateFiles = function (oldFiles, newFiles, callback) {
		let cleanFiles = new FileTree();
		cleanFiles.files = [];

		for (var i = 0; i < newFiles.files.length; i++) {
			var isModified = true;
			for (var j = 0; j < oldFiles.files.length; j++) {
				if(newFiles.files[i].file.lastModified === oldFiles.files[j].file.lastModified){
					isModified = false;
					break;
				}
			}
			if(isModified) {
				newFiles.files[i].used = true;
				cleanFiles.files.push(newFiles.files[i]);
			}
		}
		if (typeof callback == "function") callback(cleanFiles);
		
//		var cnt = 0;

//		function checkingFile(i) {
//			console.log(newFiles.files[i].file);
//			
//			
//			var fileReader = new FileReader();
//			fileReader.onload = function () {
//				var doc = this.result;
//
//				function checkingFile2(j) {
//					var fileReader2 = new FileReader();
//
//					fileReader2.onload = function () {
//						var changed = false;
//						var doc2 = this.result;
//						changed = doc !== doc2;
//						if (changed) {
//							newFiles.files[i].used = true;
//							cleanFiles.files.push(newFiles.files[i]);
//						};
//
//						if (i + 1 === newFiles.files.length && j + 1 === oldFiles.files.length) {
//							if (typeof callback == "function") callback(cleanFiles);
//						}
//					}
//					fileReader2.readAsText(oldFiles.files[j].file);
//				}
//				var found = false;
//				for (var j = 0; j < oldFiles.files.length; j++) {
//					if (newFiles.files[i].file.webkitRelativePath == oldFiles.files[j].file.webkitRelativePath) {
//						checkingFile2(j);
//						found = true;
//						break;
//					}
//				}
//				if (!found) {
//					newFiles.files[i].used = true;
//					cleanFiles.files.push(newFiles.files[i]);
//				}
//			};
//			fileReader.readAsText(newFiles.files[i].file);
//		}
//		for (var i = 0; i < newFiles.files.length; i++) {
//			checkingFile(i);
//		}

		return null;
	}

}

$(document).ready(function () {
	var oldFilesInput = $("#oldFiles"),
		newFilesInput = $("#newFiles"),
		oldFilesInputBtn = $("#uploadOldFiles"),
		newFilesInputBtn = $("#uploadNewFiles"),
		downloadBtn = $("#downloadBtn"),
		oldDirectory = $("#oldDirectory"),
		newDirectory = $("#newDirectory"),
		cleanDirectory = $("#cleanDirectory"),
		oldFiles,
		newFiles,
		cleanFiles,
		abra = new Abra();

	$(oldFilesInputBtn).click(function () {
		oldFilesInput.click();
	});

	$(newFilesInputBtn).click(function () {
		newFilesInput.click();
	});

	$(oldFilesInput).change(function () {
		oldFiles = new FileTree(this);
		oldFiles.displayInDOM(oldDirectory[0]);
		if (typeof oldFiles !== "undefined" &&
			typeof newFiles !== "undefined")
			abra.compareUpdateFiles(oldFiles, newFiles, function (result) {
				cleanFiles = result;
				cleanFiles.displayInDOM(cleanDirectory[0]);
				newFiles.displayInDOM(newDirectory[0]);
			});
	});

	$(newFilesInput).change(function () {
		newFiles = new FileTree(this);
		newFiles.displayInDOM(newDirectory[0]);
		if (typeof oldFiles !== "undefined" &&
			typeof newFiles !== "undefined")
			abra.compareUpdateFiles(oldFiles, newFiles, function (result) {
				cleanFiles = result;
				cleanFiles.displayInDOM(cleanDirectory[0]);
				newFiles.displayInDOM(newDirectory[0]);
			});
	});

	$(downloadBtn).click(function () {
		cleanDownload();
	});



	function cleanDownload() {
		if(typeof cleanFiles == "undefined" || cleanFiles.files.length < 1) return;
		$("#dlSpinner").show();
		
		var filesToZip = cleanFiles.files,
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
			path = file.file.webkitRelativePath.replace(/ /g, "_").split("/");
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
		$("#" + elementID + " .dir").click(function () {
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
