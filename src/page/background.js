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
        const screenshot_data = captureFullPage(tabId);

        if (screenshot_data !== null) {
            console.log("saving screenshot for: ", message.id)
            saveScreenshot(screenshot_data, message.id)
                .then(() => sendResponse({ success: true }))
                .catch(error => sendResponse({ error: error.message }));
        }

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


function dataURLtoBlob(dataurl) {
    const [header, base64] = dataurl.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
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
                console.log(r)
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
    clearObjectStore();
    const db = await openDB();
    const blob = dataURLtoBlob(dataUrl);

    const transaction = db.transaction("images", "readwrite");
    const store = transaction.objectStore("images");

    const record = {
        id: dataId, // unique key
        blob: blob
    };

    return new Promise((resolve, reject) => {
        const request = store.add(record);
        request.onsuccess = () => resolve(record.id);
        request.onerror = (e) => reject(e);
    });
}

async function getScreenshot(id) {
    const db = await openDB();
    const transaction = db.transaction("images", "readonly");
    const store = transaction.objectStore("images");

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result.blob);
            } else {
                reject("No screenshot found for id " + id);
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

async function captureFullPage(tabId) {
    const target = { tabId };
    await chrome.debugger.attach(target, "1.3");

    try {
        const { data } = await chrome.debugger.sendCommand(target, "Page.captureScreenshot", {
            format: "png",
            captureBeyondViewport: true,
            fromSurface: true
        });

        console.log("Screenshot captured!");

        console.log(data);

        // const url = `data:image/png;base64,${data}`;
        // chrome.downloads.download({ url, filename: "screenshot.png" });

        return data;

    } catch (error) {
        console.error("Failed to capture screenshot:", error);
    } finally {
        chrome.debugger.detach(target);
    }

    return null;
}

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
        chrome.tabs.update(details.tabId, {
            url: chrome.runtime.getURL(`offline_page/page.html?${params.toString()}`)
        });
    }
});