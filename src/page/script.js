// Libraries

// import domJSON from 'domjson';

// 

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
      console.log("[CachableUI] Selection mode deactivated");
      is_selection_active = false;
    } else if (request.selection_mode === "ask") {
      sendResponse({ selection_mode: is_selection_active ? "active" : "inactive" });
    }

  }
);

function add_selection_popup() {
  const overlay = document.createElement('t_cachableui_overlay');
  overlay.classList.add('cachableui_overlay');
  overlay.id = 'i_cachableui_overlay';

  const overlay_text = document.createElement('span');
  // overlay_text.textContent = 'YOU ARE IN EDITOR MODE';
  overlay_text.textContent = 'VOUS ÊTES EN MODE ÉDITION';
  overlay_text.classList.add('cachableui_overlay_text');
  overlay_text.id = 'i_cachableui_overlay_text';

  const overlay_btn = document.createElement('button');
  overlay_btn.innerHTML = '<svg class="mdi_icon del_icon" id="i_cachableui_delicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><title>close-thick</title><path d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12L20 6.91Z" /></svg>';
  overlay_btn.classList.add('cachableui_overlay_button');
  overlay_btn.id = 'i_cachableui_overlay_button';
  overlay_btn.addEventListener(
    "click", () => {
      remove_selection_popup();
      console.log("[CachableUI] Selection mode activated");
      is_selection_active = false;
    }
  )

  const overlay_content = document.createElement('div');
  overlay_content.classList.add('cachableui_overlay_content');
  overlay_content.id = 'i_cachableui_overlay_content';

  overlay_content.appendChild(overlay_text);
  overlay_content.appendChild(overlay_btn);
  overlay.appendChild(overlay_content);

  document.body.insertBefore(overlay, document.body.firstChild);
}

function remove_selection_popup() {
  document.getElementById('i_cachableui_overlay').remove();
}

window.onmouseover = function (event) {
  if (is_selection_active && !String(event.target.id).startsWith("i_cachableui_")) {
    event.preventDefault();
    event.target.classList.add("page_element_hovered");
  }
};

window.onmouseout = function (event) {
  event.target.classList.remove("page_element_hovered");
};

window.onclick = function (event) {
  if (is_selection_active && !String(event.target.id).startsWith("i_cachableui_")) {
    event.preventDefault();
    event.target.classList.add("page_element_saved");
    add_element_to_storage(event.target);
  }
};

// IO OPERATIONS

element_default_id = 1

function add_element_to_storage(element) {
  const json_id = element.tagName + "_" + String(element_default_id);
  console.log(element.id);
  if (typeof (element) == HTMLElement && typeof (element.id) == string) {
    json_id = element.id;
  } else if (false /*todo*/) { } else {
    element_default_id++;
  }

  const element_as_string = domJSON.toJSON(element);
  const data_to_save = {
    id: json_id,
    content: element_as_string
  };

  chrome.storage.local.get([document.URL], (result) => {
  let current_cache = result[document.URL] || {};
  current_cache[json_id] = data_to_save;
  chrome.storage.local.set({ [document.URL]: current_cache }, () => {
    console.log("[CachableUI] Save to database: " + json_id);
  });
});
}