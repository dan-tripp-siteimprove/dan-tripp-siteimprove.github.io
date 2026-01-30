#!/usr/bin/env python3

import sys, os

excluded_dirnames = ['.git']
included_file_extensions = ['.html', '.xml', '.ics', '.png', '.jpg', '.jpeg', '.txt', '.nvda-addon']


os.chdir(os.path.dirname(sys.argv[0]))
filename_of_this_program = os.path.basename(sys.argv[0])
root_output_index_filename = 'list-of-files.html'
excluded_file_relative_paths = ['./'+root_output_index_filename, './'+filename_of_this_program]

python_script_name = os.path.basename(__file__)

indexed_file_paths = []
dirs_which_need_an_independent_index_file = []

def does_dir_have_independent_index_file(dir_):
	p = os.path.join(dir_, '.independent-index')
	r = os.path.exists(p)
	return r

def does_dir_have_dont_index_file(dir_):
	dont_index_file_path = os.path.join(dir_, '.dont-index') # AKA noindex, ignore 
	r = os.path.exists(dont_index_file_path)
	return r

for root, dirs, files in os.walk('.'):

	for subdir in dirs:
		subdir = os.path.join(root, subdir)
		if does_dir_have_independent_index_file(subdir):
			if does_dir_have_dont_index_file(subdir):
				raise Exception("not supported yet")
			dirs_which_need_an_independent_index_file.append(subdir)

	dirs[:] = [d for d in dirs if d not in excluded_dirnames and not does_dir_have_dont_index_file(os.path.join(root, d))]

	for file in files:
		if any(file.lower().endswith(ext.lower()) for ext in included_file_extensions):
			file_path = os.path.join(root, file)
			if file_path not in excluded_file_relative_paths:
				indexed_file_paths.append(file_path)

indexed_file_paths.sort(key=lambda x: os.path.getmtime(x), reverse=True)

def write_index_file(output_index_file_path_, input_indexed_file_paths_):
	with open(output_index_file_path_, "w") as index_file:
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

		for input_indexed_file_path in input_indexed_file_paths_:
			index_file.write(f'	<li><a href="{input_indexed_file_path }">{input_indexed_file_path}</a></li>\n')

		index_file.write("  </ul>\n")
		index_file.write("</body>\n")
		index_file.write("</html>\n")

write_index_file(root_output_index_filename, indexed_file_paths)

for subdir in dirs_which_need_an_independent_index_file:
	subdir_output_index_filename = os.path.join(subdir, 'index.html')
	subdir_indexed_file_paths = os.listdir(subdir)
	subdir_indexed_file_paths = [f for f in subdir_indexed_file_paths if any(f.lower().endswith(ext.lower()) for ext in included_file_extensions)]
	if 'index.html' in subdir_indexed_file_paths:
		subdir_indexed_file_paths.remove('index.html')
	write_index_file(subdir_output_index_filename, subdir_indexed_file_paths)


