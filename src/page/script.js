//document.body.style.pointerEvents = 'none';

is_selection_active = false;

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.selection_mode === "active") {
      sendResponse({ code: 0 });
      add_selection_popup();
      console.log("[CachableUI] Selection mode activated");
      is_selection_active = true;
    } else if (request.selection_mode === "inactive") {
      sendResponse({ code: 0 });
      remove_selection_popup();
      is_selection_active = false;
    } else if (request.selection_mode === "ask") {
      sendResponse({ selection_mode: is_selection_active ? "active" : "inactive" });
    }

  }
);

function add_selection_popup() {
  const overlay = document.createElement('i_cachableui_overlay');
  overlay.textContent = 'YOU ARE IN EDITOR MODE';
  overlay.classList.add('cachableui_overlay');
  overlay.id = 'i_cachableui_overlay';
  document.body.insertBefore(overlay, document.body.firstChild);
}

function remove_selection_popup() {
  document.getElementById('i_cachableui_overlay').remove();
}

window.onmouseover = function (event) {
  if (is_selection_active) {
    event.target.classList.add("page_element_hovered");
  }
};

window.onmouseout = function (event) {
  event.target.classList.remove("page_element_hovered");
};

// window.onmouseclick = function (event) {
//   if (is_selection_active) {
//     let target = event.target

//     chrome.storage.local.get(["key"]).then((result) => {
//       console.log("[Cachable UI] Retrieve in storage ${");
//     });

//     chrome.storage.local.set({ key: value }).then(() => {
//       console.log("[Cachable UI]");
//     });
//   }
// };