chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_SCREENSHOT") {
        console.log("[CachableUI DB] Reveived a GET request");
        getScreenshot(message.id)
            .then(result => {
                blobToDataURL(result).then(res2 => {
                    sendResponse({
                        image: (res2)
                    });
                }).catch(err2 => {
                    console.error("Blob to Data error:", err2);
                });
            })
            .catch(error => {
                console.error("BG error:", error);
                sendResponse({ error: error.message });
            });

        return true;
    }

    if (message.type === "SAVE_SCREENSHOT") {
        console.log("[CachableUI DB] Reveived a SAVE request");

        const tabId = sender.tab.id;
        captureFullPage(tabId, message.scrollHeight, message.viewportHeight, message.width).then(data => {
            if (data !== null) {
                console.log("saving screenshot for: ", message.id)
                saveScreenshot(data, message.id)
                    .then(() => sendResponse({ success: true }))
                    .catch(error => sendResponse({ error: error.message }));
            }
        });

        return true;
    }

    if (message.type === "CLEAR_ALL") {
        console.log("[CachableUI DB] Reveived a CLEAR request");
        clearObjectStore();
        return true;
    }
});

// Screenshot_save

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // result is the Data URL
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}


async function dataURLtoBlob(dataurl) {
    // const [header, base64] = dataurl.split(',');
    // const mime = header.match(/:(.*?);/)[1];
    // const binary = atob(base64);
    // const array = new Uint8Array(binary.length);
    // for (let i = 0; i < binary.length; i++) {
    //     array[i] = binary.charCodeAt(i);
    // }
    // return new Blob([array], { type: mime });
    console.log("b1");
    const response = await fetch(dataurl);
    console.log("b2");
    return await response.blob();
}

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ScreenshotsDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("images")) {
                db.createObjectStore("images", { keyPath: "id" });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

async function clearObjectStore() {
    const db = await openDB(); // use your openDB() function
    const transaction = db.transaction("images", "readwrite");
    const store = transaction.objectStore("images");

    return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => {
            console.log("All records cleared from object store");
            listAllKeys().then(r => {
                // console.log(r)
            });
            resolve();
        };

        request.onerror = (e) => {
            console.error("Error clearing object store:", e);
            reject(e);
        };
    });
}

async function saveScreenshot(dataUrl, dataId) {
    // console.log("a");
    const db = await openDB();
    // console.log("b " + dataUrl);
    // const blob = await dataURLtoBlob(dataUrl);
    const blob = dataUrl;
    // console.log("c");

    const transaction = db.transaction("images", "readwrite");
    // console.log("d");
    const store = transaction.objectStore("images");
    // console.log("e");

    const record = {
        id: dataId, // unique key
        blob: blob
    };

    console.log("saving: " + JSON.stringify(record));

    return new Promise((resolve, reject) => {
        const request = store.add(record);
        request.onsuccess = () => resolve(record.id);
        request.onerror = (e) => reject(e);
    });
}

async function getScreenshot(id) {
    const keys = await listAllKeys();

    const db = await openDB();
    const transaction = db.transaction("images", "readonly");
    const store = transaction.objectStore("images");

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result.blob);
            } else {
                reject("No screenshot found for id " + id + " (we only have " + JSON.stringify(keys) + ")");
            }
        };
        request.onerror = (e) => reject(e);
    });
}

// Screenshot loading

async function listAllKeys() {
    const db = await openDB(); // your function to open the DB
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("images", "readonly");
        const store = transaction.objectStore("images");

        const request = store.getAllKeys(); // <-- gets all keys
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e);
    });
}

// async function captureFullPage(tabId) {
//     // const screenshot = await chrome.tabs.captureVisibleTab(null, {});
//     await chrome.debugger.attach({ tabId }, "1.3");
//     const screenshot = await chrome.debugger.sendCommand({ tabId }, "Page.captureScreenshot", {
//         format: "jpeg",
//         fromSurface: true,
//         quality: 60,
//     });
//     return screenshot.data;
// }

async function captureFullPage(tabId) {
    await chrome.debugger.attach({ tabId }, "1.3");
    const screenshot = await chrome.debugger.sendCommand({ tabId }, "Page.captureScreenshot", {
        format: "jpeg",
        fromSurface: true,
        quality: 60,
    });

    // Prepend the header to make it a valid Data URL
    const dataUrl = `data:image/jpeg;base64,${screenshot.data}`;

    const response = await fetch(dataUrl);
    return await response.blob();
}

// async function captureFullPage(tabId, scrollHeight, viewportHeight, width) {
//     const canvas = new OffscreenCanvas(width, scrollHeight);
//     const ctx = canvas.getContext("2d");
//     let currentScroll = 0;

//     while (currentScroll < scrollHeight) {
//         // 2. Scroll to the next segment
//         await chrome.tabs.sendMessage(tabId, { action: "scrollTo", y: currentScroll });

//         // Wait for the browser to finish rendering the scroll (adjust as needed)
//         await new Promise(resolve => setTimeout(resolve, 300));

//         // 3. Capture the visible area
//         const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: "png" });
//         const blob = await (await fetch(dataUrl)).blob();
//         const bitmap = await createImageBitmap(blob);

//         // 4. Stitch the segment into the canvas
//         ctx.drawImage(bitmap, 0, currentScroll);
//         currentScroll += viewportHeight;
//     }

//     // 5. Export final full image
//     const finalBlob = await canvas.convertToBlob();
//     return new Promise((resolve) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.readAsDataURL(finalBlob);
//     });
// }

// Detect no internet

async function get_current_url() {
    let options = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(options);
    return tab?.url;
}

chrome.webNavigation.onErrorOccurred.addListener(async (details) => {
    if (details.frameId === 0 && details.error === "net::ERR_INTERNET_DISCONNECTED") {
        const current_url = await get_current_url();
        const params = new URLSearchParams();
        params.append("url", current_url);
        params.append("redirect", true);
        chrome.tabs.update(details.tabId, {
            url: chrome.runtime.getURL(`offline_page/page.html?${params.toString()}`)
        });
    }
});