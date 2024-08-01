


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
}

function addButtonToPage(visibleLabel_, accessibleName_) {
	let buttonElem = document.createElement("button");
	document.querySelector('body > main').appendChild(buttonElem);
	let nextPageUrl = getUrlOfNextPageBasedOnCurPage();
	const onClick = () => { window.location.href = nextPageUrl; };
	buttonElem.addEventListener('click', onClick);
	buttonElem.innerText = visibleLabel_;
	buttonElem.setAttribute('aria-label', accessibleName_);
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
	let divElem = document.createElement("div");
	divElem.appendChild(buttonElem);
	document.querySelector('body > main').appendChild(divElem);
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







