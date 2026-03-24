const params = new URLSearchParams(window.location.search);
const element = params.get('element');
let url = params.get('url');

if (!url) {
    url = "blank"
}

chrome.storage.local.get([url], (result) => {
    if (result[url]) {
        if (element !== null && result[url][element]) {
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
        } else {
            for (key in result[url]) {
                const content = result[url][key].content;
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

function apply_node(node, json) {
    Object.entries(json.style).forEach(([property, value]) => {
        node.style[property] = value;
    });
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
    console.log("[CachableUI] The connection is back");
    setTimeout(() => {
        window.location.assign(url);
    }, 500);
});