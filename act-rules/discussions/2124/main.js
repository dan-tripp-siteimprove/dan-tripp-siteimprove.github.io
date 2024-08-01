


/* Thanks https://stackoverflow.com/a/2450976 */ 
function shuffle(array_) {
  let currentIndex = array_.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array_[currentIndex], array_[randomIndex]] = [
      array_[randomIndex], array_[currentIndex]];
  }
}
	

async function getUrlOfRandomizedFirstPage() {
	const baseUrl = window.location.href;
	const fileUrl = new URL("page-list.txt", baseUrl).href;
	let response = await fetch(fileUrl);
	if (!response.ok) {
		throw new Error(`HTTP error - status: ${response.status}`);
	}
	let responseText = await response.text();
	let pages = responseText.split(/\s+/).filter(item => item);
	shuffle(pages);
	let urlOfNextPage = getUrlOfNextPage(pages);
	return urlOfNextPage;
}

function getUrlOfNextPageBasedOnCurPage() {
	let curPageUrl = new URL(window.location.href);
	let params = new URLSearchParams(curPageUrl.search);
	let pagesStr = params.get("pages");
	let pages = pagesStr ? pagesStr.split(",") : [];
	if (pages.length == 0) {
		return 'done.html';
	} else {
		let urlOfNextPage = getUrlOfNextPage(pages);
		return urlOfNextPage;
	}
}

function getUrlOfNextPage(pages_) {
	let page0 = pages_[0], page1PlusList = pages_.slice(1);
	let urlOfNextPage = `${page0}?pages=${page1PlusList.join(",")}`;
	return urlOfNextPage;
}

function addLinkToPage(visibleLabel_, accessibleName_) {
	let linkElem = document.createElement("a");
	document.querySelector('body > main').appendChild(linkElem);
	let nextPageUrl = getUrlOfNextPageBasedOnCurPage();
	linkElem.href = nextPageUrl;
	linkElem.innerText = visibleLabel_;
	linkElem.setAttribute('aria-label', accessibleName_);
	return linkElem;
}

function getPrinterIconSvgStr() {
	return `
		<svg aria-hidden="true" fill="#000000" height="32px" width="32px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
			viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
			<g>
				<path d="M57.7881012,14.03125H52.5v-8.0625c0-2.2091999-1.7909012-4-4-4h-33c-2.2091999,0-4,1.7908001-4,4v8.0625H6.2119002
					C2.7871001,14.03125,0,16.8183498,0,20.2431507V46.513649c0,3.4248009,2.7871001,6.2119026,6.2119002,6.2119026h2.3798995
					c0.5527,0,1-0.4472008,1-1c0-0.5527-0.4473-1-1-1H6.2119002C3.8896,50.7255516,2,48.8359489,2,46.513649V20.2431507
					c0-2.3223,1.8896-4.2119007,4.2119002-4.2119007h51.5762024C60.1102982,16.03125,62,17.9208508,62,20.2431507V46.513649
					c0,2.3223-1.8897018,4.2119026-4.2118988,4.2119026H56c-0.5527992,0-1,0.4473-1,1c0,0.5527992,0.4472008,1,1,1h1.7881012
					C61.2128983,52.7255516,64,49.9384499,64,46.513649V20.2431507C64,16.8183498,61.2128983,14.03125,57.7881012,14.03125z
					M13.5,5.96875c0-1.1027999,0.8971996-2,2-2h33c1.1027985,0,2,0.8972001,2,2v8h-37V5.96875z"/>
				<path d="M44,45.0322495H20c-0.5517998,0-0.9990005,0.4472008-0.9990005,0.9990005S19.4482002,47.0302505,20,47.0302505h24
					c0.5517006,0,0.9990005-0.4472008,0.9990005-0.9990005S44.5517006,45.0322495,44,45.0322495z"/>
				<path d="M44,52.0322495H20c-0.5517998,0-0.9990005,0.4472008-0.9990005,0.9990005S19.4482002,54.0302505,20,54.0302505h24
					c0.5517006,0,0.9990005-0.4472008,0.9990005-0.9990005S44.5517006,52.0322495,44,52.0322495z"/>
				<circle cx="7.9590998" cy="21.8405495" r="2"/>
				<circle cx="14.2856998" cy="21.8405495" r="2"/>
				<circle cx="20.6121998" cy="21.8405495" r="2"/>
				<path d="M11,62.03125h42v-26H11V62.03125z M13.4036999,38.4349518h37.1925964v21.1925964H13.4036999V38.4349518z"/>
			</g>
		</svg>
	`;
}

function addButtonToPage(visibleLabel_, accessibleName_) {
	let buttonElem = document.createElement("button");
	document.querySelector('body > main').appendChild(buttonElem);
	let nextPageUrl = getUrlOfNextPageBasedOnCurPage();
	const onClick = () => { window.location.href = nextPageUrl; };
	buttonElem.addEventListener('click', onClick);
	buttonElem.innerText = visibleLabel_;
	buttonElem.setAttribute('aria-label', accessibleName_);
	return buttonElem;
}

function addAriaCheckboxToPage(visibleLabel_, accessibleName_) {
	let mainElem = document.querySelector('body > main');
	mainElem.innerHTML += `
		<ul class="checkboxes">
			<li>
				<div aria-label="${accessibleName_}" role="checkbox" aria-checked="false" tabindex="0">
					${visibleLabel_}
				</div>
				<button class="go-button-after-aria-checkbox">Proceed</button>
			</li>
		</ul>
		`;
	let checkbox = mainElem.querySelector('ul.checkboxes [role="checkbox"]');
	new Checkbox(checkbox);
	let proceedButton = mainElem.querySelector('ul.checkboxes button');
	let nextPageUrl = getUrlOfNextPageBasedOnCurPage();
	const onClickProceedButton = () => { window.location.href = nextPageUrl; };
	proceedButton.addEventListener('click', onClickProceedButton);
}

function createOptionElem(visibleLabel_, accessibleName_, value_) {
	let r = document.createElement("option");
	r.innerText = visibleLabel_;
	r.setAttribute('aria-label', accessibleName_);
	r.value = value_;
	return r;
}

function addSelectToPage(visibleLabel_, accessibleName_) {
	let selectElem = document.createElement("select");

	let placeholderOption = document.createElement("option");
	placeholderOption.innerText = "Select an option";
	placeholderOption.disabled = true;
	placeholderOption.selected = true;
	placeholderOption.id = "placeholder";
	placeholderOption.value = 'placeholder';
	selectElem.setAttribute('aria-labelledby', 'placeholder');
	selectElem.appendChild(placeholderOption);

	selectElem.appendChild(createOptionElem('Option A (does nothing)', 'Option A (does nothing)', 
		"a"));
	selectElem.appendChild(createOptionElem(visibleLabel_, accessibleName_, "b"));
	selectElem.appendChild(createOptionElem('Option C (does nothing)', 'Option C (does nothing)', 
		"c"));

	let proceedButtonElem = document.createElement("button");
	proceedButtonElem.innerText = "Proceed";

	function updateProceedButtonEnabledness() {
		proceedButtonElem.disabled = selectElem.value !== 'b';
	}
	updateProceedButtonEnabledness();
	selectElem.addEventListener('change', updateProceedButtonEnabledness);

	let nextPageUrl = getUrlOfNextPageBasedOnCurPage();
	const onProceedButtonClick = () => { window.location.href = nextPageUrl; };
	proceedButtonElem.addEventListener('click', onProceedButtonClick);

	let mainElem = document.querySelector('body > main');
	mainElem.appendChild(selectElem);
	mainElem.appendChild(document.createTextNode(" "));
	mainElem.appendChild(proceedButtonElem);


}

function addSkipButtonToPage() {
	let buttonElem = document.createElement("button");
	buttonElem.innerText = "Skip";
	let pElem = document.createElement("p");
	pElem.appendChild(buttonElem);
	document.querySelector('body > main').appendChild(pElem);
	let nextPageUrl = getUrlOfNextPageBasedOnCurPage();
	const onClick = () => { window.location.href = nextPageUrl; };
	buttonElem.addEventListener('click', onClick);
}	





/* start of custom checkbox code */
/* See note 87638764373 */

/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:   Checkbox.js
 *
 *   Desc:   Checkbox widget that implements ARIA Authoring Practices
 */

'use strict';

class Checkbox {
  constructor(domNode) {
    this.domNode = domNode;
    this.domNode.tabIndex = 0;

    if (!this.domNode.getAttribute('aria-checked')) {
      this.domNode.setAttribute('aria-checked', 'false');
    }

    this.domNode.addEventListener('keydown', this.onKeydown.bind(this));
    this.domNode.addEventListener('keyup', this.onKeyup.bind(this));
    this.domNode.addEventListener('click', this.onClick.bind(this));
  }

  toggleCheckbox() {
    if (this.domNode.getAttribute('aria-checked') === 'true') {
      this.domNode.setAttribute('aria-checked', 'false');
    } else {
      this.domNode.setAttribute('aria-checked', 'true');
    }
  }

  /* EVENT HANDLERS */

  // Make sure to prevent page scrolling on space down
  onKeydown(event) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  onKeyup(event) {
    var flag = false;

    switch (event.key) {
      case ' ':
        this.toggleCheckbox();
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.stopPropagation();
    }
  }

  onClick() {
    this.toggleCheckbox();
  }
}

/* end of custom checkbox code */







