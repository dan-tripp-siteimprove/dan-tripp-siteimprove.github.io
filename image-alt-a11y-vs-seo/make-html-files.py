#!/usr/bin/env python3

import sys, os, re, subprocess, textwrap, time, uuid

os.chdir(os.path.dirname(sys.argv[0]))

MIN_ARGS=0; MAX_ARGS=0
if (len(sys.argv) < MIN_ARGS+1) or (len(sys.argv) == 2 and sys.argv[1] == "--help") or (MAX_ARGS is not None and len(sys.argv) > MAX_ARGS+1):
	nameOfThisProgram = os.path.basename(sys.argv[0])
	print(f"""Usage example(s): 
{nameOfThisProgram} # no args 
""", file=sys.stderr)
	sys.exit(1)



print('''Remember that you probably want to delete all the *.html files before running this program.  This program doesn't do that.''')
time.sleep(3)

for alt in ['absent', 'full-stop', 'quote-quote', 'non-empty']:
	for displayNone in ['absent', 'inline', 'via-selector']:
		for ariaHidden in ['absent', 'true', 'false']:
			for role in ['absent', 'presentation', 'none']:
				imgStr = '<img src="duck.png" '
				imgStr += {'absent':'', 'full-stop':'alt', 'quote-quote':'alt=""', 'non-empty':'alt="goose"'}[alt] + ' '
				imgStr += {'absent':'', 'inline':'style="display: none"', 'via-selector':'class="display-none"'}[displayNone] + ' '
				imgStr += {'absent':'', 'true':'aria-hidden="true"', 'false':'aria-hidden="false"'}[ariaHidden] + ' '
				imgStr += {'absent':'', 'presentation':'role="presentation"', 'none':'role="none"'}[role] + ' '
				imgStr += '>'
				filename = f'alt-{alt}---displayNone-{displayNone}---ariaHidden-{ariaHidden}---role-{role}.html'
				htmlStr = textwrap.dedent(f'''
					<!DOCTYPE html>
					<html lang="en">
						<head>
							<meta charset="UTF-8">
							<meta name="viewport" content="width=device-width">
							<title>x</title>
							<style>

								.display-none {{
									display: none;
								}}

							</style>
						</head>

						<body>
							<main>
							{imgStr}
							</main>
							
							<div style="display: none">
								<!-- this is to prevent the crawler from doing "deduplication" on this page. -->
								{uuid.uuid4()}
							</div>
							
						</body>

					</html>
					''').lstrip()
				with open(filename, 'w') as fout:
					fout.write(htmlStr)
				#print(imgStr)


