const params = new URLSearchParams(window.location.search);
const element = params.get('element');
let url = params.get('url');

if (element) {
    document.getElementById("element_title").textContent = "View saved element: " + element;
}
if (!url) {
    url = "blank"
}
document.getElementById("url_title").textContent = "For page: " + url;


chrome.storage.local.get([url], (result) => {
    if (result[url] && result[url][element]) {
        const serialized_element = result[url][element].content;
        const child = domJSON.toDOM(serialized_element);
        document.getElementById("element_preview").replaceChildren(child);
        apply_node(document.getElementById("element_preview").firstElementChild, serialized_element.node);
        // document.getElementById("element_json").textContent = JSON.stringify(serialized_element);
    }
});

function apply_node(node, json) {
    for (const attr_key in json) {
        if (node[attr_key]) {
            for (const v_key in json[attr_key]) {
                try {
                    node[attr_key][v_key] = json[attr_key][v_key];
                } catch (e) {
                    console.error(`Could not apply ${v_key}:`, e);
                }
            }
        }
    }
}