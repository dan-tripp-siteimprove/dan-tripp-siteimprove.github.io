
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
		return null;
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
