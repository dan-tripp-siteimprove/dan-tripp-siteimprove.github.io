#!/usr/bin/env python3

import sys, os

excluded_dirnames = ['.git']
included_file_extensions = ['.html', '.xml', '.ics', '.png', '.jpg', '.jpeg']

os.chdir(os.path.dirname(sys.argv[0]))
filename_of_this_program = os.path.basename(sys.argv[0])
output_index_filename = 'index.html'
excluded_file_relative_paths = ['./'+output_index_filename, './'+filename_of_this_program]

python_script_name = os.path.basename(__file__)

html_file_paths = []

def does_dir_have_dont_index_file(dir_):
	dont_index_file_path = os.path.join(dir_, '.dont-index') # AKA noindex, ignore 
	r = os.path.exists(dont_index_file_path)
	return r

for root, dirs, files in os.walk('.'):
	dirs[:] = [d for d in dirs if d not in excluded_dirnames and not does_dir_have_dont_index_file(os.path.join(root, d))]

	for file in files:
		if any(file.lower().endswith(ext.lower()) for ext in included_file_extensions):
			file_path = os.path.join(root, file)
			if file_path not in excluded_file_relative_paths:
				html_file_paths.append(file_path)

html_file_paths.sort(key=lambda x: os.path.getmtime(x), reverse=True)

with open(output_index_filename, "w") as index_file:
	index_file.write("<!DOCTYPE html>\n")
	index_file.write("<html lang='en'>\n")
	index_file.write("<head>\n")
	index_file.write("  <meta charset=\"UTF-8\">")
	index_file.write("  <meta name=\"viewport\" content=\"width=device-width\"/>")
	index_file.write("  <title>Index</title>\n")
	index_file.write("</head>\n")
	index_file.write("<body>\n")
	index_file.write("  <h1>Index</h1>\n")
	index_file.write("  <p>Sorted by file modification time, most recent first.</p>\n")
	index_file.write("  <ul>\n")

	for html_file_path in html_file_paths:
		index_file.write(f'	<li><a href="{html_file_path }">{html_file_path}</a></li>\n')

	index_file.write("  </ul>\n")
	index_file.write("</body>\n")
	index_file.write("</html>\n")


