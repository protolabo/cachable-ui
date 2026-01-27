//document.body.style.pointerEvents = 'none';

is_selection_active = false;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.selection_mode === "active") {
      sendResponse({ code: 0 });
      is_selection_active = true;
    } else if (request.selection_mode === "inactive") {
      sendResponse({ code: 0 });
      is_selection_active = false;
    } else if (request.selection_mode === "ask"){
      sendResponse({ selection_mode: is_selection_active ? "active" : "inactive" });
    }

  }
);

window.onmouseover = function (event) {
        if (is_selection_active) {
                event.target.classList.add("page_element_hovered");
                event.stopPropagation();
        }
};

window.onmouseout = function (event) {
        event.target.classList.remove("page_element_hovered")
        event.stopPropagation();
};
