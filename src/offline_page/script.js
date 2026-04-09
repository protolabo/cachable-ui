const clear_button = document.getElementById("clear_button");
const params = new URLSearchParams(window.location.search);
const element = params.get('element');
const redirect = params.get('redirect');
let url = params.get('url');

if (!url) {
  url = "blank"
}

if (redirect === "true") {
  document.getElementById("desc").textContent = "Vous êtes hors-ligne. Voici les éléments UI sauvés par Cachable UI:";
  document.getElementById("icon").src = "../res/offline.svg";
} else {
  document.getElementById("desc").textContent = "Voici les éléments UI sauvés par Cachable UI:";
}

function downloadDataURL(dataURL, filename = "image.jpg") {
    // Create a temporary link
    const a = document.createElement("a");
    a.href = dataURL;       // directly use the data URL
    a.download = filename;  // suggested file name

    // Trigger the download
    a.click();
}

chrome.storage.local.get("elements", (result) => {
  if (result.elements[url]) {
    if (element !== null && result.elements[url][element]) {
      const content = result.elements[url][element].content.at(-1).json;
      const top = result.elements[url][element].top;
      const left = result.elements[url][element].left;

      const serialized_element = content;
      const child = domJSON.toDOM(serialized_element);
      document.getElementById("preview_container").replaceChildren(child);
      document.getElementById("preview_container").firstChild.id = "element_preview";
      apply_node(document.getElementById("element_preview"), serialized_element.node);
      document.getElementById("element_preview").style.position = `absolute`;
      document.getElementById("element_preview").style.left = `${left}px`;
      document.getElementById("element_preview").style.top = `${top}px`;
      document.getElementById("element_preview").style.margin = `0`;
      recu_apply_custom_src(child_container.lastChild);
    } else {
      for (key in result.elements[url]) {
        const content = result.elements[url][key].content.at(-1).json;
        const top = result.elements[url][key].top;
        const left = result.elements[url][key].left;

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
        recu_apply_custom_src(child_container.lastChild);
      }
    }
  }
});

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

async function recu_apply_custom_src(node) {
  if (node.childNodes) {
    for (const child of node.childNodes) {
      recu_apply_custom_src(child);
    }
  }

  if (node.nodeType !== 1) {
    return
  }

  if (node.getAttribute("data-cui-src-override")) {
    const dataUrl = (await chrome.runtime.sendMessage({
      type: "GET_FILE",
      id: node.getAttribute("data-cui-src-override")
    })).image;

    if (dataUrl) {
      node.src = dataUrl;
    }
  }
}

async function get_bg() {
  try {
    const img = await chrome.runtime.sendMessage({
      type: "GET_SCREENSHOT",
      id: url
    });
    document.getElementById("whole").style.backgroundImage = `url('${img.image}')`;
  } catch (err) {
    console.error("Error:", err);
  }
}

get_bg()

window.addEventListener('online', () => {
  if (redirect) {
    console.log("[CachableUI] The connection is back");

    document.getElementById("icon").classList.add("blinking_img");
    document.getElementById("desc").style.color = "#97fcb2fc";
    document.getElementById("title").style.color = "#97fcb2fc";
    document.getElementById("desc").textContent = "";
    document.getElementById("desc").innerHTML = "<strong>Connexion rétablie</strong>\nChargement...";
    document.getElementById("icon").src = "../res/online.svg";


    setTimeout(() => {
      window.location.assign(url);
    }, 2500);
  }
});

function update_elements_list(storage) {
  let ui_list = document.getElementById("elements_list");
  ui_list.replaceChildren(); // Clear

  if (storage.elements[url] != null && storage.elements[url] != undefined) {
    Object.entries(storage.elements[url]).forEach(([key, value]) => {
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
  // chrome.storage.local.get(current_url, (result) => {
  //   if (result[current_url]) {
  //     const new_data = result[current_url];
  //     delete new_data[element];

  //     chrome.storage.local.set({ [current_url]: new_data }, () => {
  //       console.log('Element removed from cache');
  //     });
  //   }
  // });

  chrome.storage.local.get("elements", (result) => {
    if (result.elements[current_url]) {
      const new_elements = result.elements || {};
      const new_data = new_elements[current_url];
      if (new_data) {
        delete new_data[element];
      }

      chrome.storage.local.set({ "elements": new_elements }, () => {
        console.log('Element removed from cache');
      });
    }
  });
}

function changeKeyOf(oldKey, newKey) {
  console.log("renaming: " + oldKey + " into " + newKey)
  chrome.storage.local.get("elements", (result) => {
    const elements = result.elements || {};
    const data = elements[current_url];

    if (!data || !(oldKey in data)) return;

    data[newKey] = data[oldKey];
    data[newKey].key = newKey;

    delete data[oldKey];

    chrome.storage.local.set({ "elements": elements }, () => {
      console.log("Key renamed");
    });
  });
}

clear_button.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: "CLEAR_ALL" });
  chrome.storage.local.get("elements", (result) => {
    if (result.elements[current_url]) {
      const new_elements = result.elements || {};
      delete new_elements[current_url];

      chrome.storage.local.set({ "elements": new_elements }, () => {
        console.log("[CachableUI] All elements removed from cache");
      });
    }
  });
});

function downloadBlob(blob, filename = "file.jpg") {
    // Create a blob URL
    const url = URL.createObjectURL(blob);

    // Create a temporary link
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    // Trigger the download
    a.click();

    // Cleanup the blob URL
    URL.revokeObjectURL(url);
}

