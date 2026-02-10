const editor_checkbox = document.getElementById('editor_checkbox')
const tab_title = document.getElementById("tab_title");
const tab_favicon = document.getElementById("tab_favicon");
const clear_button = document.getElementById("clear_button");
const clear_icon = document.getElementById("clear_svg_icon");

let current_domain = "blank";
let current_url = "blank";
let current_title = "blank";
let current_favicon = "blank";

editor_checkbox.addEventListener('change', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { selection_mode: (editor_checkbox.checked ? "active" : "inactive") }, (response) => {
    });
  });
});

clear_button.addEventListener('click', () => {
  chrome.storage.local.remove(current_url, () => {
    console.log("[CachableUI] All elements removed from cache");
  });
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { selection_mode: "ask" }, (response) => {
    if (response.selection_mode === "active") {
      editor_checkbox.checked = true;
    } else {
      editor_checkbox.checked = false;
    }
  });
});

(async () => {
  const storage = await chrome.storage.local.get(null);
  update_elements_list(storage);
})();

chrome.storage.onChanged.addListener(async (changes, area_name) => {
  if (area_name === "local") {
    const storage = await chrome.storage.local.get(null);

    update_elements_list(storage)
  }
});

function update_elements_list(storage) {
  let ui_list = document.getElementById("elements_list");
  ui_list.replaceChildren(); // Clear

  if (storage[current_url] != null && storage[current_url] != undefined) {
    Object.entries(storage[current_url]).forEach(([key, value]) => {
      console.log("Adding tile for " + key);

      let child = document.createElement("div");
      child.classList.add("element_tile");
      child.innerHTML = gen_html_for_tile(value);
      ui_list.appendChild(child);
      document.getElementById("erase_elem_" + value.id).addEventListener("click", () => {
        erase_from_storage(value.id);
      })
      document.getElementById("view_elem_" + value.id).addEventListener("click", () => {
        view_element(value.id);
      })
    });
  }
  if (ui_list.childElementCount == 0) {
    let no_child_label = document.createElement("span");
    no_child_label.textContent = "aucun élément dans le cache";
    no_child_label.classList.add("no_child_label");
    ui_list.appendChild(no_child_label);
    clear_button.style.display = "none";
  } else {
    clear_button.style.display = "flex";
  }
}

function gen_html_for_tile(json) {
  return `<span class="element_txt">${json.id}</span>
      <button class="element_btn" id="view_elem_${json.id}">
        <svg class="mdi_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"
          width="16" height="16">
          <title>view</title>
          <path
            d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"/>
        </svg>
      </button>
      <button class="element_btn" id="erase_elem_${json.id}">
        <svg class="mdi_icon del_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
          width="16" height="16">
          <title>delete</title>
          <path
            d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z">
        </svg>
      </button>`
}

async function get_current_tab_info(on_complete) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    var title = activeTab.title;
    var favicon_url = activeTab.favIconUrl;
    const url = activeTab.url;
    var domain = (new URL(url)).hostname;

    on_complete(title, favicon_url, domain, url);
  });
}

get_current_tab_info((title, icon, domain, url) => {
  console.log("On page: " + title);
  current_title = title;
  current_favicon = icon;
  current_domain = domain;
  current_url = url;

  tab_title.textContent = current_title;

  let favicon_img = document.createElement("img");
  favicon_img.id = "tab_favicon"
  favicon_img.src = current_favicon;
  favicon_img.onload = function () {
    tab_div.insertBefore(favicon_img, tab_div.firstChild);
  }
});

function erase_from_storage(element) {
  chrome.storage.local.get(current_url, (result) => {
    if (result[current_url]) {
      const new_data = result[current_url];
      delete new_data[element];

      chrome.storage.local.set({ [current_url]: new_data }, () => {
        console.log('Element removed from cache');
      });
    }
  });
}

function view_element(element) {
  const params = new URLSearchParams();
  params.append("url", current_url);
  params.append("element", element);

  chrome.tabs.create({
    url: `offline_page/page.html?${params.toString()}`
  });
}