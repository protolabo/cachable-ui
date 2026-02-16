const params = new URLSearchParams(window.location.search);
const element = params.get('element');
let url = params.get('url');

if (element) {
    // document.getElementById("element_title").textContent = "View saved element: " + element;
}
if (!url) {
    url = "blank"
}
// document.getElementById("url_title").textContent = "For page: " + url;


chrome.storage.local.get([url], (result) => {
    if (result[url] && result[url][element]) {
        const content = result[url][element].content;
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
        console.log(document.getElementById("element_preview").style.top);
        console.log(document.getElementById("element_preview").style.left);
    }
});

function apply_node(node, json) {
    Object.entries(json.style).forEach(([property, value]) => {
        node.style[property] = value;
    });
    // node.style = json.style;
    // if (json.style) {
    //     node.style = json.style;
    // }
    // for (const attr_key in json) {
    //     if (node[attr_key]) {
    //         for (const v_key in json[attr_key]) {
    //             try {
    //                 node[attr_key][v_key] = json[attr_key][v_key];
    //             } catch (e) {
    //                 console.error(`Could not apply ${v_key}:`, e);
    //             }
    //         }
    //     }
    // }
}

async function get_bg() {
    console.log("Retrieve screenshot");
    try {
        const blob = await chrome.runtime.sendMessage({
            type: "GET_SCREENSHOT",
            id: element
        });
        // chrome.tabs.create({ url: blob.image });
        document.getElementById("whole").style.backgroundImage = `url('${blob.image}')`;
    } catch (err) {
        console.error("Error:", err);
    }
}

get_bg()

