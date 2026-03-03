
export const KNOWLEDGE_TEXT_FILE_RELATIVE_URL = "knowledge.txt";

function ourHardAssert(bool_) {
	if(!bool_) throw new Error();
}

function escapeRegex(str_) {
	return str_.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getEntriesFromKnowledgeTextFile(fileContents_) {
	let entries = [];
	let lines = fileContents_.split(/\r?\n/);
	let i = 0;

	while (i < lines.length) {
		let line = lines[i].trim();
		function throwError(errMsg__) {
			throw new Error(`There's a problem in ${KNOWLEDGE_TEXT_FILE_RELATIVE_URL} line ${i+1}: ${errMsg__}.  Text of line ${i+1}: "${lines[i].trim()}"`);
		}

		if (line.startsWith('[[[') && line.endsWith(']]]')) {
			let keywordLine = lines[i];
			i++;

			let extraProps = null, notes = null, body = null;
			let sectionOrder = [];

			while (i < lines.length) {
				if (lines[i].trim() === '') {
					i++;
					continue;
				}

				let blockStart = lines[i].trim();

				if (blockStart === '<<<') {
					if (extraProps !== null) throwError('duplicate extraProps section');
					if (sectionOrder.length > 0) throwError('extraProps section must come before notes or body');
					sectionOrder.push('extraProps');
					i++;
					let extraPropsLines = [];
					while (i < lines.length && lines[i].trim() !== '>>>') {
						extraPropsLines.push(lines[i]);
						i++;
					}
					if (lines[i]?.trim() === '>>>') i++;
					extraProps = extraPropsLines.join('\n');
					continue;
				}

				if (blockStart === '(((') {
					if (notes !== null) throwError('duplicate notes section');
					if (sectionOrder.includes('body')) throwError('notes section must come before body');
					sectionOrder.push('notes');
					i++;
					let notesLines = [];
					while (i < lines.length && lines[i].trim() !== ')))') {
						notesLines.push(lines[i]);
						i++;
					}
					if (lines[i]?.trim() === ')))') i++;
					notes = notesLines.join('\n');
					continue;
				}

				if (blockStart === '{{{') {
					if (body !== null) throwError('duplicate body section');
					sectionOrder.push('body');
					i++;
					let bodyLines = [];
					while (i < lines.length && lines[i].trim() !== '}}}') {
						bodyLines.push(lines[i]);
						i++;
					}
					if (lines[i]?.trim() === '}}}') i++;
					body = bodyLines.join('\n');
					continue;
				}

				if (blockStart.startsWith('[[[') && blockStart.endsWith(']]]')) {
					break; // next entry
				}

				throwError('we found some junk');
				i++;
			}

			let errMsgPreamble = `There's a problem in ${KNOWLEDGE_TEXT_FILE_RELATIVE_URL} in the entry before line ${i+1}.  keywordLine of entry: "${keywordLine}".  `;
			if (!notes && !body) {
				throw new Error(errMsgPreamble+'entry has neither notes nor body.');
			}

			keywordLine = keywordLine.replace(/^\[\[\[/, '').replace(/\]\]\] *$/, '');
			let entry = {keywordLine, notes, body};
			if(extraProps != null) {
				try {
					extraProps = parseJsonishExtraProps(extraProps);
				} catch(e) {
					throw new Error(errMsgPreamble+'  error parsing extraProps.  '+e.message+'\n'+e.stack);
				}
				let entryNumPropsBeforeExtraProps = Object.keys(entry).length;
				let numExtraProps = Object.keys(extraProps).length;
				Object.assign(entry, extraProps);
				let entryNumPropsAfterExtraProps = Object.keys(entry).length;
				if(entryNumPropsAfterExtraProps != entryNumPropsBeforeExtraProps + numExtraProps) {
					throw new Error(`extraProps contains one or more keys that are reserved.`);
				}
			}
			try {
				checkEntry(entry);
			} catch(e) {
				throw new Error(`problem in ${KNOWLEDGE_TEXT_FILE_RELATIVE_URL} in the entry before line ${i+1}.  ${e.message}`);
			}
			entries.push(entry);

		} else if (lines[i].trim() === '') {
			i++;
		} else {
			throwError('we found some junk');
		}
	}

	return entries;
}

function checkEntry(entry_) {
	checkEntryForProbablyTypoedDelimiterLines(entry_);
}

function checkEntryForProbablyTypoedDelimiterLines(entry_) {
	const DELIMITERS = ['[[[', ']]]', '(((', ')))', '{{{', '}}}', '<<<', '>>>'];
	for(let propName of ['notes', 'body']) {
		let propValue = entry_[propName];
		if(!propValue) continue;
		let propValueLines = propValue.split('\n');
		for(let propValueLine of propValueLines) {
			propValueLine = propValueLine.trim();
			if(DELIMITERS.includes(propValueLine)) {
				throw new Error(`while checking entry, we found a probable typo / misuse of delimiters.  the problem line, trimmed, is "${propValueLine}".  the entry's keywordLine is "${entry_.keywordLine}".`);
			}
		}
	}


}


export function getEntryByUUID(entries_, uuid_) {
	let r = null;
	for(let entry of entries_) {
		if(entry.uuid === uuid_) {
			r = entry;
			break;
		}
	}
	if(r === null) {
		throw new Error(`no entry found with UUID "${uuid_}"`);
	}
	return r;
}

/* "JSON-ish": it's like JSON, but with backtick strings.  and comments. */
function parseJsonishExtraProps(str_) {
	return (new Function(`"use strict"; return (${str_});`))();
}

async function sha256(str_) {
	let encoder = new TextEncoder();
	let data = encoder.encode(str_);
	let hashBuffer = await crypto.subtle.digest("SHA-256", data);
	let hashArray = Array.from(new Uint8Array(hashBuffer));
	let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
}

function jsonStringifyJsMap(map_) {
	let r = JSON.stringify(Object.fromEntries(map_), null, '\t');
	return r;
}

function makeRegexFromKeywordLineSearchTerms(searchString_) {
	let terms = searchString_.trim().split(/\s+/);
	ourHardAssert(terms.length > 0);

	/* The reason for this max num terms is because above it, our search gets very slow, b/c the regex gets very long b/c of all the permutations that we create.  I've let it run for > 30 seconds then gave up and killed the tab.  */
	const MAX_TERMS = 5;
	if(terms.length > MAX_TERMS) {
		throw new Error(`Sorry, the max number of search terms is ${MAX_TERMS}.  You specified ${terms.length}.`);
	}

	function permute(array__) {
		ourHardAssert(array__.length > 0);
		if (array__.length === 1) return [array__];
		let result = [];
		for (let i = 0; i < array__.length; i++) {
			let rest = array__.slice(0, i).concat(array__.slice(i + 1));
			for (let sub of permute(rest)) {
				result.push([array__[i], ...sub]);
			}
		}
		return result;
	}

	let permutations = permute(terms);
	let alternates = permutations.map(p => p.join('.*'));
	let r = `(?:${alternates.join('|')})`;
	r = new RegExp(r, 'i');
	return r;
}

function searchEntries(searchString_, entries_) {
	let t0 = performance.now();
	let r = [];
	let regex = makeRegexFromKeywordLineSearchTerms(searchString_);
	for(let entry of entries_) {
		if(entry.keywordLine.match(regex)) {
			r.push(entry);
		}
	}
	let t1 = performance.now();
	return r;
}

/* the "text element" could be an <input> or a <textarea> */
function bindTextElementToLocalStorage(textElementId_) {
	let elem = document.getElementById(textElementId_);
	if(!elem) throw new Error();
	let localStorageKey = `text-element-with-id-${textElementId_}`;
	let saved = localStorage.getItem(localStorageKey);
	if(saved !== null) {
		elem.value = saved;
	}
	elem.addEventListener('input', () => {
		localStorage.setItem(localStorageKey, elem.value);
	});
}

async function initSearch() {
	let response = await fetch(KNOWLEDGE_TEXT_FILE_RELATIVE_URL);
	if(!response.ok) throw new Error("HTTP " + response.status);
	const allEntries = getEntriesFromKnowledgeTextFile(await response.text());

	let searchInput = document.getElementById('searchInput');
	bindTextElementToLocalStorage('searchInput');

	let searchButton = document.getElementById('search');
	searchInput.addEventListener('keydown', function(event) {
		if (event.key === 'Enter') {
			searchButton.click();
		}
	});
	searchButton.addEventListener("click", function() {
		try {
			let searchString = searchInput.value;
			let searchResultEntries = searchEntries(searchString, allEntries);
			showResults(searchResultEntries);
		} catch (e) {
			alert(`Error: ${e.message}\n\nStack:\n${e.stack}`);
		}
	});

	searchInput.focus();
}

/* @returns empty string if all checks passed.  returns a non-empty string if one or more checks failed.  */
export function checkRejectionComment(str_) {
	let r = '';
	let forbiddenRegexes = [
		'___[^ ]+___', '___', '<<<', '>>>', 'botched', 'gotcha', 'guidance',
		'snippet', '\\bcanned\\b',
		'overrideFocus', // from /home/dtr/dan-bin/focus-bookmarklet-load.js or /home/dtr/mt-tools/focus.js  
		'cust ', 'customer', 
		'\\s\\+\\=\\s', '^\\s*let\\s+r\\b', // probably indicates javascript 
		'for siteimprove internal use', // inicates approval ID 
	];

	for(let regexStr of forbiddenRegexes) {
		let regex = new RegExp(regexStr, 'im');
		let match = str_.match(regex);
		if(match) {
			r += `Check failed on string "${match[0]}".  `;
		}
	}

	return r;
	
}

export function filterRejectionComment(str_) {

	// "Escape" HTML tags (eg. replace <a> with < a >) so that they'll be accepted 
	// by the platform.  i.e. avoid the "Changing approval state failed" error. 
	let r = str_;
	r = r.replace(/<(?! )/g, '< ');
	r = r.replace(/(?<! )>/g, ' >');
	r = r.trim();

	return r;
	
}

function filterAndCheckRejectionComment(str_) {
	let r = filterRejectionComment(str_);
	let failedChecksStr = checkRejectionComment(r);
	if(failedChecksStr) {
		r = `Check(s) failed.  ${failedChecksStr}`;
	}
	return r;
}


function getCurrentTimeAsString() {
	let now = new Date();

	let yyyy = now.getFullYear();
	let MM = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
	let dd = String(now.getDate()).padStart(2, '0');
	let HH = String(now.getHours()).padStart(2, '0');
	let mm = String(now.getMinutes()).padStart(2, '0');
	let ss = String(now.getSeconds()).padStart(2, '0');
	let SSS = String(now.getMilliseconds()).padStart(3, '0');

	return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}.${SSS}`;
}

function runRunnerInputAsJavascript() {
	delete window.r; /* if we don't do this and the user's code used "r = 'xyz';" (i.e. didn't use the "let" keyword) then "r" will persist across runs, which would be bad. */

	let runnerOutput = document.getElementById("runnerOutput");
	let runnerInput = document.getElementById("runnerInput");
	let userCode = runnerInput.value;

	/* We do it this way to 1) get "let r = " to work (not just "r = "), 2) to get line numbers (if there's an exception).  and we cram the first line so that the stack trace line numbers correspond to the user's code (not our wrap function code). */
	let wrapped = `(() => { try { ${userCode}
				return { success: true, valueOfR: typeof r !== 'undefined' ? r : 'r is not defined' };
			} catch (e) {
				return { success: false, errorMessage: e.message, errorStack: e.stack };
			}
		})()`;

	try {
		let result = [eval][0](wrapped); // [eval][0] is not here for this repo.  it's here for the si-web-tools repo.  [eval][0] is an "indirect eval" and it makes an esbuild warning go away.  https://esbuild.github.io/content-types/#direct-eval .  this code is "imported" via esbuild into the si-web-tools repo.  
		if (result.success) {
			let valueOfR = String(result.valueOfR);
			valueOfR = filterAndCheckRejectionComment(valueOfR);
			runnerOutput.value = valueOfR;
		} else { // ==> script threw an exception, or our code has a bug.  we assume the former. 
			runnerOutput.value = `Error on line ${getTopLineNumberFromStack(result.errorStack) || `(line number unknown - sometimes this happens because the code did an old-style "throw 'xyz'" instead of a new-style "throw new Error('xyz')".)`}.  Message: "${result.errorMessage}".\n\nStack:\n${result.errorStack}`;
		}
	} catch (error) { 
		/* ==> syntax error.  it would be ideal if we could tell the user the line number (of their code) on which that syntax error happened.  ~ 2025-05-29 I (Dan) spent about 20 minutes attempting that and I failed. */
		runnerOutput.value = `Error: "${error.message}".`;
	}

}

function getTopLineNumberFromStack(stackStr_) {
	if(!stackStr_) {
		return null;
	}
	let lines = stackStr_.split('\n');
	for(let line of lines) {
		let m1 = line.match(/:(\d+):\d+\)?$/); // Chrome eg. "at eval (eval at runRunnerInputAsJavascript (http://localhost:9198/:232:16), <anonymous>:5:7)" 
		if(m1) return parseInt(m1[1]);

		let m2 = line.match(/:(\d+):\d+$/); // Firefox eg. "@http://localhost:9198/ line 241 > eval:5:7" 
		if(m2) return parseInt(m2[1]);
	}
	return null;
}


function runRunnerInputAsPlainText() {
	let runnerInputPlainText = document.getElementById("runnerInput").value;
	try {
		let outputText = filterAndCheckRejectionComment(runnerInputPlainText);
		document.getElementById("runnerOutput").value = outputText;
	} catch (error) {
		runnerOutput.value = "Error: " + error.message;
	}
}

function updateRunnerTimestamp() {
	let outputTimestamp = document.getElementById("runnerOutputTimestamp");
	outputTimestamp.textContent = `(last run was at ${getCurrentTimeAsString()})`;
}

function doesRunnerInputContainJavascript() {
	let runnerInputStr = document.getElementById("runnerInput").value;
	let r = /^\/\/ *javascript.*/.test(runnerInputStr);
	return r;
}

function runRunner() {
	updateRunnerTimestamp();
	if(doesRunnerInputContainJavascript()) {
		runRunnerInputAsJavascript();
	} else {
		runRunnerInputAsPlainText();
	}
}

function copyRunnerOutputToClipboard() {
	let runnerOutput = document.getElementById("runnerOutput");
	navigator.clipboard.writeText(runnerOutput.value);
}

function initRunner() {
	let runnerInput = document.getElementById("runnerInput");
	bindTextElementToLocalStorage('runnerInput');
	runnerInput.addEventListener("input", runRunner);
	document.getElementById("runnerCopyToClipboardButton").addEventListener("click", copyRunnerOutputToClipboard);
	runRunner();

}

export function initForMainPage() {
	window.addEventListener("DOMContentLoaded", async function(event) {
		document.getElementById("linkToTextFile").href = KNOWLEDGE_TEXT_FILE_RELATIVE_URL;
		// await initSearch();
		initRunner();
	});
}

function escapeForHtml(str_) {
	if(!str_) return str_;
    return str_.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#39;");
}

function getBodyStrFromButtonEvent(event_) {
	let button = event_.target;
	let div = button.closest('div');
	let p = div.nextElementSibling;
	let bodyStr = p.textContent;
	return bodyStr;
}

function copyBodyToClipboard(event_) {
	navigator.clipboard.writeText(getBodyStrFromButtonEvent(event_));
}

function copyBodyToRunner(event_) {
	let bodyStr = getBodyStrFromButtonEvent(event_);
	let runnerInput = document.getElementById('runnerInput');
	runnerInput.value = bodyStr;
	runRunner();
	runnerInput.scrollIntoView();
	runnerInput.setSelectionRange(0, 0);
	runnerInput.focus();
	runnerInput.scrollTop = 0;
}

function showResults(searchResultEntries_) {
	let div = document.getElementById('searchResults');
	let html = `<p>Num results: ${searchResultEntries_.length}</p>`;
	if(searchResultEntries_.length > 0) {
		html += '<ol>\n';
		for(let entry of searchResultEntries_) {
			let {keywordLine, notes, body} = entry;
			html += `<li>
				<strong>Keyword line: ${escapeForHtml(keywordLine)}</strong><br><br>
				<div><strong>Notes:</strong></div>
				<p style="white-space: pre-wrap; margin-left: 1.5em;">${notes ? escapeForHtml(notes) : '(Absent)'}</p>
				<div>
					<strong>Body:</strong> 
					<button data-name="copy-to-clipboard">Copy body to clipboard</button> 
					<button data-name="copy-to-runner">Copy body to runner</button> 
				</div>
				<p style="white-space: pre-wrap; font-family: monospace; margin-left: 1.5em; border: solid 0.1em grey; padding: 1em; border-radius: 0.3em;">${body ? escapeForHtml(body) : '(Absent)'}</p>
				<hr>
				<br>
			</li>\n`;
		}
		html += '</ol>\n';
	}
	div.innerHTML = html;
	
	div.querySelectorAll('button[data-name="copy-to-clipboard"]').forEach((button) => button.addEventListener('click', copyBodyToClipboard));
	div.querySelectorAll('button[data-name="copy-to-runner"]').forEach((button) => button.addEventListener('click', copyBodyToRunner));
}
