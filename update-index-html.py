#!/usr/bin/env python3

import sys, os

excluded_dirnames = ['.git']
included_file_extensions = ['.html', '.xml']

os.chdir(os.path.dirname(sys.argv[0]))
filename_of_this_program = os.path.basename(sys.argv[0])
output_index_filename = 'index.html'
excluded_file_relative_paths = ['./'+output_index_filename, './'+filename_of_this_program]

python_script_name = os.path.basename(__file__)

html_file_paths = []

for root, dirs, files in os.walk('.'):
	dirs[:] = [d for d in dirs if d not in excluded_dirnames]

	for file in files:
		if any(file.lower().endswith(ext.lower()) for ext in included_file_extensions):
			file_path = os.path.join(root, file)
			if file_path not in excluded_file_relative_paths:
				html_file_paths.append(file_path)

html_file_paths.sort(key=lambda x: os.path.getmtime(x), reverse=True)

with open(output_index_filename, "w") as index_file:
	index_file.write("<!DOCTYPE html>\n")
	index_file.write("<html>\n")
	index_file.write("<head>\n")
	index_file.write("  <title>Index</title>\n")
	index_file.write("</head>\n")
	index_file.write("<body>\n")
	index_file.write("  <h1>Index</h1>\n")
	index_file.write("  <ul>\n")

	for html_file_path in html_file_paths:
		index_file.write(f'	<li><a href="{html_file_path }">{html_file_path}</a></li>\n')

	index_file.write("  </ul>\n")
	index_file.write("</body>\n")
	index_file.write("</html>\n")


