function addPopoverTooltips() {
  document.querySelectorAll(".textForPopoverTooltip").forEach((el__) => {
    const widgetParent = el__.parentElement;

    el__.prepend(document.createTextNode('\u00a0')); // without this we would have a bug with NVDA on chrome which I don't understand.  NVDA would audibly announce (and the NVDA speech viewer agreed) the accName like there was no space between the visible text and the tooltip text.  NVDA on firefox didn't have this problem.  the accName looked find in chrome devtools.  the bug didn't happen if I used a div instead of a span eg. <div class="textForPopoverTooltip">the first letter of the alphabet</div>
	
	const tooltip = document.createElement("div");
    tooltip.classList.add("popoverTooltip");
    tooltip.setAttribute("popover", "");
    tooltip.setAttribute("aria-hidden", "true");
    tooltip.textContent = el__.textContent;
    widgetParent.appendChild(tooltip);

    widgetParent.addEventListener("mouseover", () => {
      tooltip.showPopover({ source: widgetParent });
    });

    widgetParent.addEventListener("mouseout", () => {
      tooltip.hidePopover();
    });

    widgetParent.addEventListener("focus", () => {
      tooltip.showPopover({ source: widgetParent });
    });

    widgetParent.addEventListener("blur", () => {
      tooltip.hidePopover();
    });
  });
}
