saved_elements_onpage = [];
saved_elements_onoverlay = [];
function updatePosition() {
  for (let i = 0; i < saved_elements_onoverlay.length; i++) {
    const rect = saved_elements_onpage[i].getBoundingClientRect();

    const overlay_box = saved_elements_onoverlay[i];

    overlay_box.style.top = (rect.top) + "px";
    overlay_box.style.left = (rect.left) + "px";
    overlay_box.style.height = (rect.bottom - rect.top) + "px";
    overlay_box.style.width = (rect.right - rect.left) + "px";
  }
}

window.addEventListener("scroll", updatePosition);
window.addEventListener("resize", updatePosition);

// Sign one child and return its signature (string)
async function sign_one(element) {
  if (element.getAttribute("data-cui-processed") === null || element.getAttribute("data-cui-processed") === "false") {
    const elem_x = element.getBoundingClientRect().x + window.scrollX;
    const elem_y = element.getBoundingClientRect().y + window.scrollY;

    const s_prefix = `cui_${elem_x}_${elem_y}_${element.tagName}_`;

    let s_suffix = '';
    if (element.childElementCount == 0) {
      s_suffix = element.textContent;
    } else {
      for (const child of element.children) {
        s_suffix += sign_one(child);
      }
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(s_suffix);
    const hash = await crypto.subtle.digest('SHA-256', data);

    const signature = s_prefix + Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    element.setAttribute("data-cui-signature", signature);
  }

  element.setAttribute('data-cui-processed', 'true');
  return element.getAttribute("data-cui-signature");
}

async function sign_all() {
  await sign_one(document.body)
}
sign_all()

let keymap = {};
async function update_storage_keymap() {
  const storage = await chrome.storage.local.get(null);
  for (elem in storage[document.URL]) {
    keymap[storage[document.URL][elem].signature] = true;
  }
}
update_storage_keymap();

//

is_selection_active = false;

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.selection_mode === "active") {
      sendResponse({ code: 0 });
      add_selection_popup();
      remove_selected_elements(document.body);
      add_selected_elements(document.body);
      console.log("[CachableUI] Selection mode activated");
      is_selection_active = true;
    } else if (request.selection_mode === "inactive") {
      sendResponse({ code: 0 });
      remove_selection_popup();
      remove_selected_elements(document.body);
      console.log("[CachableUI] Selection mode deactivated");
      is_selection_active = false;
    } else if (request.selection_mode === "ask") {
      sendResponse({ selection_mode: is_selection_active ? "active" : "inactive" });
    }

  }
);

async function add_selected_elements(parent) {
  if (parent.getAttribute("data-cui-processed") === "true") {
    if (await storage_contains(parent.getAttribute("data-cui-signature"))) {
      // parent.classList.add("page_element_saved");
      add_box_to_overlay(parent, "saved");
    } else {
      for (child of parent.children) {
        add_selected_elements(child);
      }
    }
  }
}

function remove_box_from_overlay(element) {
  const signature = element.getAttribute("data-cui-signature");
  const root = document.getElementById("i_cachableui_root");

  const el_idx = saved_elements_onpage.indexOf(element);
  if (el_idx > -1) {
    const overlay_box = saved_elements_onoverlay[el_idx];
    saved_elements_onoverlay.splice(el_idx, 1);
    saved_elements_onpage.splice(el_idx, 1);
    overlay_box?.remove();
  }
}

function add_box_to_overlay(element, type) {
  let box_class = "none";
  if (type == "saved") {
    box_class = "box_saved";
  } else if (type == "hovered") {
    box_class = "box_hovered";
  }
  box = document.createElement("div");
  box.classList.add(box_class);

  // const rect_elem = element.getBoundingClientRect();
  // box.style.top = `${rect_elem.top + window.scrollY}px`;
  // box.style.left = `${rect_elem.left + window.scrollX}px`;
  // box.style.width = `${rect_elem.right - rect_elem.left}px`;
  // box.style.height = `${rect_elem.bottom - rect_elem.top}px`;
  box.style.position = "fixed";
  box.setAttribute("data-cui-signature", element.getAttribute("data-cui-signature"));

  document.getElementById("i_cachableui_overlay_second").appendChild(box);

  saved_elements_onoverlay.push(box);
  saved_elements_onpage.push(element);
  updatePosition();
}

async function storage_contains(signature) {
  return keymap[signature] === true;
}

function remove_selected_elements(parent) {
  if (parent.getAttribute("data-cui-processed") === "true") {
    parent.classList.remove("page_element_saved");
    for (child of parent.children) {
      remove_selected_elements(child);
    }
  }
}

function add_selection_popup() {
  const overlay = document.createElement('t_cachableui_overlay');
  overlay.classList.add('cachableui_overlay');
  overlay.id = 'i_cachableui_overlay';

  const overlay_second = document.createElement('t_cachableui_overlay_second');
  overlay_second.classList.add('cachableui_overlay_second');
  overlay_second.id = 'i_cachableui_overlay_second';

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

  // document.body.insertBefore(overlay_second, document.body.firstChild);
  const ext_root = document.createElement("div");
  ext_root.id = "i_cachableui_root";
  ext_root.classList.add("cachableui_root");
  document.documentElement.appendChild(ext_root);
  // const shadow_root = ext_root.attachShadow({ mode: "open" });
  // shadow_root.appendChild(overlay);
  ext_root.appendChild(overlay);
  ext_root.appendChild(overlay_second);

  const root_style = document.createElement("style");
  root_style.innerHTML = `
  .cachableui_overlay {
  width: 100%;
  height: 100%;
  pointer-events: none;
  position: fixed;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  border: #b097fc solid 2px;
  box-sizing: border-box;
}

.cachableui_overlay_content {
  color: white;
  background-color: #957fd6;
  z-index: 1000;
  margin: 8px;
  font-size: 12px;
  border-radius: 50vh;
  font-weight: bold;
  pointer-events: auto;
  display: flex;
  gap: 8px;
  justify-content: center;
  padding-top: 8px;
  padding-left: 16px;
  padding-right: 16px;
  box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.5);
}

.cachableui_overlay_second {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.cachableui_overlay_button {
  background-color: transparent;
  border: none;
  padding: 0;
  padding-bottom: 6px;
}
  `;
  // shadow_root.appendChild(root_style);
  ext_root.appendChild(root_style)
}

function remove_selection_popup() {
  document.getElementById('i_cachableui_root').remove();
}

window.onmouseover = function (event) {
  // console.log(is_selection_active, !String(event.target.id).startsWith("i_cachableui_"), !check_for_stored_parent(event.target))
  if (is_selection_active && !String(event.target.id).startsWith("i_cachableui_")) {
    event.preventDefault();
    // event.target.classList.add("page_element_hovered");
    // console.log(event.target);

    document.getElementById("i_cachableui_overlay_second").replaceChildren();
    add_box_to_overlay(event.target, "hovered");
    add_selected_elements(document.body);
  }
};

// Return True if there is a stored parent
function check_for_stored_parent(child) {
  curr = child;
  while (curr != document.body) {
    if (curr.getAttribute("data-cui-signature") && storage_contains(curr.getAttribute("data-cui-signature"))) {
      console.log("indeed", curr.getAttribute("data-cui-signature"), keymap, keymap[curr.getAttribute("data-cui-signature")], keymap[curr.getAttribute("data-cui-signature")] === true)
      return true;
    }
    curr = child.parentNode;
  }
  return document.body.getAttribute("data-cui-signature") && storage_contains(document.body.getAttribute("data-cui-signature"))
}

window.onmouseout = function (event) {
  // event.target.classList.remove("page_element_hovered");
  // remove_box_from_overlay(event.target);
};

window.onclick = function (event) {
  if (is_selection_active && !String(event.target.id).startsWith("i_cachableui_")) {
    event.preventDefault();
    remove_box_from_overlay(event.target);
    add_element_to_storage(event.target);
    add_box_to_overlay(event.target, "saved");
    return false;
  }
  return true;
};

// IO OPERATIONS

element_default_id = 1

function add_element_to_storage(element) {
  const rect_elem = element.getBoundingClientRect();

  let json_id = element.tagName + "_" + String(element_default_id);
  (element.id);
  if (typeof (element) == HTMLElement && typeof (element.id) == string) {
    json_id = element.id;
  } else if (false /*todo*/) { } else {
    element_default_id++;
  }

  const element_as_string = domJSON.toJSON(element, {
    computedStyle: true
  });
  const data_to_save = {
    id: json_id,
    content: element_as_string,
    top: rect_elem.top + window.scrollY,
    left: rect_elem.left + + window.scrollX,
    signature: element.getAttribute("data-cui-signature")
  };

  chrome.storage.local.get([document.URL], (result) => {
    let current_cache = result[document.URL] || {};
    current_cache[json_id] = data_to_save;
    chrome.storage.local.set({ [document.URL]: current_cache }, () => {
      console.log("[CachableUI] Save to database: " + json_id);
    });
  });

  // Take a screenshot and save it to the DB (remove overlay)
  let old_display = 'inherit';
  if (document.body.firstChild.id === "i_cachableui_overlay") {
    old_display = document.body.firstChild.style.display;
    document.body.firstChild.style.display = "none";
  }
  // html2canvas(document.body).then(async canvas => {
  //   const dataUrl = canvas.toDataURL("image/png", 1);
  //   await chrome.runtime.sendMessage({ type: "SAVE_SCREENSHOT", url: dataUrl, id: document.URL });
  // }).catch((e) => {
  //   console.log("[Html2Canvas] error", e);
  // });
  chrome.runtime.sendMessage({
    type: "SAVE_SCREENSHOT", id: document.URL, scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
    width: window.innerWidth
  });


  if (document.body.firstChild.id === "i_cachableui_overlay") {
    document.body.firstChild.style.display = old_display;
  }

  update_storage_keymap();
}

chrome.storage.onChanged.addListener(
  () => {
    update_storage_keymap();
    add_selected_elements();
  }
);