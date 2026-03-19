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
  keymap = {};
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
  if (type === "saved") {
    // <svg class="svg_hovered_saved" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/></svg>

    const signature = element.getAttribute("data-cui-signature");
    const uuid = element.getAttribute("data-cui-uuid");
    let displayed_key = uuid ? uuid : signature;
    if (displayed_key === signature) {
      const id_list = displayed_key.split("_");
      displayed_key = `${id_list[3]}  x:${Math.ceil(parseFloat(id_list[1]))} y:${Math.ceil(parseFloat(id_list[2]))}`;
    }
    box.innerHTML = `
    <span class="label_saved">${displayed_key}</span>
    <svg class="svg_saved" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32L64 32zm32 96c0-17.7 14.3-32 32-32l160 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-160 0c-17.7 0-32-14.3-32-32l0-64zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
    `;
  }
  box.classList.add(box_class);

  // const rect_elem = element.getBoundingClientRect();
  // box.style.top = `${rect_elem.top + window.scrollY}px`;
  // box.style.left = `${rect_elem.left + window.scrollX}px`;
  // box.style.width = `${rect_elem.right - rect_elem.left}px`;
  // box.style.height = `${rect_elem.bottom - rect_elem.top}px`;
  box.style.position = "fixed";
  box.setAttribute("data-cui-signature", element.getAttribute("data-cui-signature"));
  box.setAttribute("data-cui-overlaytype", type);

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
  * {
    font-family: sans-serif;
  }

  .cachableui_overlay {
  width: 100%;
  height: 100%;
  pointer-events: none;
  position: fixed;
  z-index: 1003;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  border: #8666e4 solid 2px;
  box-sizing: border-box;
}

.cachableui_overlay_content {
  color: white;
  background-color: #8666e4;
  z-index: 1000;
  font-size: 12px;
  border-radius: 50vh;
  font-weight: bold;
  pointer-events: auto;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 8px;
  box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.5);
}

.cachableui_overlay_second {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  transform: translateY(4px);
}

.cachableui_overlay_button {
  background-color: transparent;
  border: none;
  padding: 0px;
  transform: translateY(2px);
}

.cachableui_overlay_text {
  padding: 0px;
  transform: translateY(2px);
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
    const par_element = parents_saved(event.target);

    document.getElementById("i_cachableui_overlay_second").replaceChildren();
    add_box_to_overlay(par_element ? par_element : event.target, "hovered");
    add_selected_elements(document.body);
  }
};

document.addEventListener('mouseleave', () => {
  const overlay = document.getElementById("i_cachableui_overlay_second");
  if (overlay) {
    for (const box of overlay.children) {
      if (box.getAttribute("data-cui-overlaytype") === "hovered") {
        box.remove();
      }
    }
  }
})

window.onclick = async function (event) {
  if (is_selection_active && !String(event.target.id).startsWith("i_cachableui_")) {
    event.preventDefault();

    const par_element = parents_saved(event.target);
    const chld_elements = children_saved(event.target);
    if (par_element === null) {
      // Adding a parent remove all children from storage
      await remove_multiple_from_storage(chld_elements);

      remove_box_from_overlay(event.target);
      add_element_to_storage(event.target);
      // add_box_to_overlay(event.target, "saved");
    } else {
      remove_from_storage(par_element);
    }
    return false;
  }
  return true;
};

// IO OPERATIONS

function remove_from_storage(element) {
  let json_id = element.getAttribute("data-cui-signature");

  chrome.storage.local.get([document.URL], (result) => {
    const data = result[document.URL];
    if (data && data[json_id] !== undefined) {
      delete data[json_id];
      chrome.storage.local.set({ [document.URL]: data }, () => {
        console.log(`[CachableUI] Deleted ${json_id} from storage ${document.URL}`);
      });
    }
  });
}

async function remove_multiple_from_storage(elements) {
  if (elements.length === 0) {
    return;
  }

  await chrome.storage.local.get([document.URL]).then((result) => {
    const data = result[document.URL];

    for (const element of elements) {
      let json_id = element.getAttribute("data-cui-signature");
      if (data && data[json_id] !== undefined) {
        delete data[json_id];
      }
    }

    chrome.storage.local.set({ [document.URL]: data }, () => {
      console.log(`[CachableUI] Deleted multiple from storage ${document.URL}`);
    });
  });
}

function add_element_to_storage(element) {
  const rect_elem = element.getBoundingClientRect();

  const element_signature = element.getAttribute("data-cui-signature");
  const element_uuid = element.getAttribute("data-cui-uuid");
  const element_key = element_uuid ? element_uuid : element_signature;
  console.log("key is " + element_key);
  const element_as_string = domJSON.toJSON(element, {
    computedStyle: true
  });
  const data_to_save = {
    key: element_key,
    signature: element_signature,
    uuid: element_uuid,
    content: element_as_string,
    top: rect_elem.top + window.scrollY,
    left: rect_elem.left + + window.scrollX,
  };

  chrome.storage.local.get([document.URL], (result) => {
    let current_cache = result[document.URL] || {};
    current_cache[element_key] = data_to_save;
    chrome.storage.local.set({ [document.URL]: current_cache }, () => {
      console.log("[CachableUI] Save to database: " + element_key);
    });
  });

  // Take a screenshot and save it to the DB (remove overlay)
  let old_display = 'inherit';
  if (document.body.firstChild.id === "i_cachableui_overlay") {
    old_display = document.body.firstChild.style.display;
    document.body.firstChild.style.display = "none";
  }
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
  async () => {
    const old_keymap = structuredClone(keymap);
    await update_storage_keymap();
    document.getElementById("i_cachableui_overlay_second")?.replaceChildren();
    add_selected_elements(document.body);
  }
);

function parents_saved(element) {
  let curr = element;
  while (curr) {
    if (curr.getAttribute("data-cui-signature") in keymap) {
      return curr;
    }
    curr = curr.parentElement;
  }

  return null;
}

function children_saved(element) {
  // Establish a list of all saved children for an element
  let ret = [];

  if (element.getAttribute("data-cui-signature") in keymap) {
    ret.push(element);
  } else {
    for (const child of element.children) {
      ret.push(...children_saved(child));
    }
  }

  return ret;
}