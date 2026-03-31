const params = new URLSearchParams(window.location.search);
const element = params.get('element');
const redirect = params.get('redirect');
let url = params.get('url');

if (!url) {
  url = "blank"
}

if (redirect === "true") {
  document.getElementById("desc").textContent = "Vous êtes hors-ligne. Voici les éléments UI sauvé par Cachable UI:";
} else {
  document.getElementById("desc").textContent = "Voici les éléments UI sauvé par Cachable UI:";
}

chrome.storage.local.get([url], (result) => {
  if (result[url]) {
    if (element !== null && result[url][element]) {
      const content = result[url][element].content.at(-1).json;
      const top = result[url][element].top;
      const left = result[url][element].left;

      const serialized_element = content;
      const child = domJSON.toDOM(serialized_element);
      document.getElementById("preview_container").replaceChildren(child);
      document.getElementById("preview_container").firstChild.id = "element_preview";
      apply_node(document.getElementById("element_preview"), serialized_element.node);
      document.getElementById("element_preview").style.position = `absolute`;
      document.getElementById("element_preview").style.left = `${left}px`;
      document.getElementById("element_preview").style.top = `${top}px`;
    } else {
      for (key in result[url]) {
        const content = result[url][key].content.at(-1).json;
        const top = result[url][key].top;
        const left = result[url][key].left;

        const serialized_element = content;
        const child = domJSON.toDOM(serialized_element);
        const child_container = document.createElement("div");
        child_container.classList.add("child_container");
        child_container.appendChild(child);
        document.getElementById("preview_container").appendChild(child_container);
        child_container.lastChild.id = `element_preview_${key}`;
        apply_node(document.getElementById(`element_preview_${key}`), serialized_element.node);
        child_container.style.position = `absolute`;
        child_container.style.left = `${left}px`;
        child_container.style.top = `${top}px`;
        child_container.firstChild.style.margin = "0";
        // document.getElementById(`element_preview_${key}`).style.outline = `white 1px dashed`;
      }
    }
  }
});

// function apply_node(node, json) {
//     Object.entries(json.style).forEach(([property, value]) => {
//         node.style[property] = value;
//     });
// }

function apply_node(node, json) {
  //console.log("APPLY NODE FOR: " + JSON.stringify(json));
  if (json && json.style) {
    const n_children = (!json.childNodes || !node.childNodes) ? 0 : json.childNodes < node.childNodes.length ? json.childNodes.length : node.childNodes.length;
    Object.entries(json.style).forEach(([property, value]) => {
      node.style[property] = value;
    });

    for (let i = 0; i < n_children; ++i) {
      apply_node(node.childNodes[i], json.childNodes[i]);
    }
  }
}

async function get_bg() {
  // const key = (element !== null) ? element : "blank";
  try {
    const img = await chrome.runtime.sendMessage({
      type: "GET_SCREENSHOT",
      id: url
    });
    // console.log("ret is: " + JSON.stringify(img));
    // console.log("img is " + img.image);
    document.getElementById("whole").style.backgroundImage = `url('${img.image}')`;
  } catch (err) {
    console.error("Error:", err);
  }
}

get_bg()

window.addEventListener('online', () => {
  if (redirect) {
    console.log("[CachableUI] The connection is back");
    document.getElementById("desc").style.color = "#97fcb2fc";
    document.getElementById("desc").textContent = "";
    document.getElementById("desc").innerHTML = "<strong>Connexion rétablie</strong>\nChargement...";


    setTimeout(() => {
      window.location.assign(url);
    }, 2500);
  }
});

function update_elements_list(storage) {
  let ui_list = document.getElementById("elements_list");
  ui_list.replaceChildren(); // Clear

  if (storage[url] != null && storage[url] != undefined) {
    Object.entries(storage[url]).forEach(([key, value]) => {
      console.log("Adding tile for " + key);

      let child = document.createElement("div");
      child.classList.add("element_tile");
      child.innerHTML = gen_html_for_tile(value);
      ui_list.appendChild(child);
      document.getElementById("erase_elem_" + value.key).addEventListener("click", () => {
        erase_from_storage(value.key);
      })
      document.getElementById("input_" + value.key).addEventListener("change", (e) => {
        const oldKey = e.target.getAttribute("data-cui-key");
        const newKey = e.target.value;

        if (oldKey && newKey !== oldKey) {
          changeKeyOf(oldKey, newKey);
        }
      });
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
  let displayed_key = json.key;
  if (json.key === json.signature) {
    const id_list = json.key.split("_");
    displayed_key = `${id_list[3]}  x:${Math.ceil(parseFloat(id_list[1]))} y:${Math.ceil(parseFloat(id_list[2]))} ${id_list[4]}`;
  }

  return `<input type="text" class="element_txt" value="${displayed_key}" data-cui-key="${json.key}" id="input_${json.key}"/>
      <button class="element_btn" id="view_elem_${json.key}">
        <svg class="mdi_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"
          width="16" height="16">
          <title>view</title>
          <path
            d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"/>
        </svg>
      </button>
      <button class="element_btn" id="erase_elem_${json.key}">
        <svg class="mdi_icon del_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
          width="16" height="16">
          <title>delete</title>
          <path
            d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z">
        </svg>
      </button>`
}

(async () => {
  const storage = await chrome.storage.local.get(null);
  update_elements_list(storage);
})();

// DRAG OVERLAY

const draggable = document.getElementById("overlay_body"); // The fixed div
const topbar = document.getElementById("topbar");       // The handle

let offsetX, offsetY;

topbar.addEventListener("mousedown", (e) => {
  // Calculate where the mouse clicked relative to the div's top-left corner
  offsetX = e.clientX - draggable.offsetLeft;
  offsetY = e.clientY - draggable.offsetTop;

  // Add listeners to the document so dragging continues even if the mouse leaves the handle
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});

function onMouseMove(e) {
  // Update the position of the fixed div based on current mouse position
  draggable.style.left = (e.clientX - offsetX) + "px";
  draggable.style.top = (e.clientY - offsetY) + "px";
}

function onMouseUp() {
  // Stop tracking when the mouse button is released
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
}

function erase_from_storage(element) {
  chrome.storage.local.get(url, (result) => {
    if (result[url]) {
      const new_data = result[url];
      delete new_data[element];

      chrome.storage.local.set({ [url]: new_data }, () => {
        console.log('Element removed from cache');
        window.location.reload();
      });
    }
  });
}

function changeKeyOf(oldKey, newKey) {
  console.log("renaming: " + oldKey + " into " + newKey)
  chrome.storage.local.get([url], (result) => {
    const data = result[url];

    if (!data || !(oldKey in data)) return;

    data[newKey] = data[oldKey];
    data[newKey].key = newKey;

    delete data[oldKey];

    chrome.storage.local.set({ [url]: data }, () => {
      console.log("Key renamed");
    });
  });
}