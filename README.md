# web-delivery
Copies websites while removing orphaned files and retaining only the changed/added files

# scratch existing process
1. Upload Folder
2. Get all files from folder and put into a Copy
3. Make 2 group of files
	a. Files that can potentially include files and are usually stand-alone e.g. (.html, .css, .js)
	b. Files that are usually imported and could be unused (images, .js, .css)
4. Compare all files of B from each files in A
5. Remove any files in B that is used by A
6. Filter Copy and remove all matches that are left from B
7. Show manual add/remove of files
8. Zip all files from Copy
9. Save As

# from scratch rules
1. Remove all orphaned files


# update process
1. Upload Original Folder
2. Upload Updated Folder
3. Remove all Unused files (use the from scratch process
4. Remove all files that has that exact content as original files
5. show manual add/remove of files
6. Zip files
7. Save as

# bonus css Sorter
1. upload or copy/paste css
2. sort css based on rules
3. show download or textbox for copy/paste