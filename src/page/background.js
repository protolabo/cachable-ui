chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_SCREENSHOT") {
        (async () => {
            try {
                const result = await getScreenshot(message.id);
                const res2 = await blobToDataURL(result);

                sendResponse({ image: res2 });

            } catch (error) {
                console.error("GET error:", error);
                sendResponse({ error: error.message });
            }
        })();

        return true;
    }

    if (message.type === "SAVE_SCREENSHOT") {
        // const tabId = sender.tab.id;
        // console.log(`[CachableUI] Get a SAVE SCREENSHOT request for tab ${tabId}`);

        // (async () => {
        //     try {
        //         const data = await captureFullPage(
        //             tabId,
        //             message.scrollHeight,
        //             message.viewportHeight,
        //             message.width
        //         );

        //         if (data === null) {
        //             sendResponse({ error: "No screenshot data" });
        //             return;
        //         }

        //         await saveScreenshot(data, message.id);

        //         sendResponse({ success: true });

        //     } catch (error) {
        //         console.log(`error: ${error}`);
        //         sendResponse({ error: error.message });
        //     }
        // })();

        return true;
    }

    if (message.type === "GET_FILE") {
        (async () => {
            try {
                const result = await getFile(message.id);
                const res2 = await blobToDataURL(result);

                sendResponse({ image: res2 });

            } catch (error) {
                console.error("GET error:", error);
                sendResponse({ error: error.message });
            }
        })();

        return true;
    }

    if (message.type === "GET_FAVICON") {
        fetch(message.url)
            .then(res => res.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => sendResponse(reader.result);
                reader.readAsDataURL(blob);
            });

        return true;
    }

    if (message.type === "SAVE_FILE" && message.url) {
        const tabId = sender.tab.id;
        console.log(`[CachableUI] Get a SAVE FILE request for tab ${tabId}`);

        (async () => {
            try {
                const data = await downloadData(message.url);
                if (data === null) {
                    sendResponse({ success: false, error: "No file data" });
                    return;
                }

                try {
                    const localurl = await saveFile(data, message.id);
                    sendResponse({ success: true, localurl: localurl });
                } catch (e) {
                    sendResponse({ success: false, localurl: null });
                }
            } catch (error) {
                console.log(`error: ${error}`);
                sendResponse({ error: error.message });
            }
        })();

        return true;
    }

    if (message.type === "CLEAR_ALL") {
        console.log("[CachableUI DB] Reveived a CLEAR request");
        (async () => {
            try {
                await clearFilesStore();
                await clearScreenshotStore();
                sendResponse({ success: true });
            } catch (e) {
                sendResponse({ error: e.message });
            }
        })();

        return true;
    }
});

async function downloadData(url) {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return blob
}

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
        const request = indexedDB.open("CachableUI_DB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("screenshots")) {
                db.createObjectStore("screenshots", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("files")) {
                db.createObjectStore("files", { keyPath: "id" });
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

async function clearScreenshotStore() {
    const db = await openDB();
    const transaction = db.transaction("screenshots", "readwrite");
    const store = transaction.objectStore("screenshots");

    return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => {
            console.log("All records cleared from object store");
            resolve();
        };

        request.onerror = (e) => {
            console.error("Error clearing object store:", e);
            reject(e);
        };
    });
}

async function clearFilesStore() {
    const db = await openDB();
    const transaction = db.transaction("files", "readwrite");
    const store = transaction.objectStore("files");

    return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => {
            console.log("All records cleared from object store");
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
    const blob = await dataUrl;
    console.log("blob: " + blob);
    // console.log("c");

    const transaction = db.transaction("screenshots", "readwrite");
    // console.log("d");
    const store = transaction.objectStore("screenshots");
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

async function hashBlob(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function saveFile(blob) {
    const db = await openDB();

    // const transaction = db.transaction("files", "readwrite");
    // const store = transaction.objectStore("files");

    const record = {
        id: "cachableui-file:" + (await hashBlob(blob)),
        blob: blob
    };

    // return new Promise((resolve, reject) => {
    //     const request = store.put(record);
    //     request.onsuccess = () => {
    //         resolve(record.id)
    //         console.log("Success");
    //     };
    //     request.onerror = (e) => {
    //         console.log("Errrr: " + e);
    //         reject(e)
    //     };
    // });

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("files", "readwrite");
        const store = transaction.objectStore("files");

        const request = store.put(record);

        request.onsuccess = () => {
            console.log("Record queued for saving:", record);
        };

        request.onerror = (e) => {
            console.error("Error saving record:", e.target.error);
            reject(e.target.error);
        };

        // Make sure the transaction actually completes
        transaction.oncomplete = () => {
            console.log("Transaction complete");
            resolve(record.id);
        };

        transaction.onerror = (e) => {
            console.error("Transaction failed:", e.target.error);
            reject(e.target.error);
        };

        transaction.onabort = (e) => {
            console.error("Transaction aborted:", e.target.error);
            reject(e.target.error);
        };
    });
}


async function getScreenshot(id) {

    const db = await openDB();
    const transaction = db.transaction("screenshots", "readonly");
    const store = transaction.objectStore("screenshots");

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

async function getFile(id) {

    const db = await openDB();
    const transaction = db.transaction("files", "readonly");
    const store = transaction.objectStore("files");

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

async function captureFullPage(tabId) {
    const tab = await chrome.tabs.get(tabId);

    // Ask content script for page dimensions
    const pageInfo = await chrome.tabs.sendMessage(tabId, { action: "getPageInfo" });

    const { totalHeight, viewportHeight, devicePixelRatio } = pageInfo;

    let scrollY = 0;
    const images = [];

    while (scrollY < totalHeight) {
        await chrome.tabs.sendMessage(tabId, {
            action: "scrollTo",
            y: scrollY
        });

        await new Promise(r => setTimeout(r, 1000)); // wait for render

        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
            format: "jpeg",
            quality: 20
        });

        images.push({ dataUrl, y: scrollY });

        scrollY += viewportHeight;
    }

    // Stitch images
    const finalImage = await stitchImages(images, pageInfo);

    return finalImage;
}

async function stitchImages(images, pageInfo) {
    const totalHeight = pageInfo.totalHeight;
    const viewportHeight = pageInfo.viewportHeight;
    const width = pageInfo.width;
    const devicePixelRatio = pageInfo.devicePixelRatio;

    // Create an offscreen canvas
    const canvas = new OffscreenCanvas(width * devicePixelRatio, totalHeight * devicePixelRatio);
    const ctx = canvas.getContext('2d');

    // Scale for high-DPI displays
    ctx.scale(devicePixelRatio, devicePixelRatio);

    for (const imgData of images) {
        // Convert base64 data URL to ImageBitmap
        const blob = await (await fetch(imgData.dataUrl)).blob();
        const bitmap = await createImageBitmap(blob);

        // Draw at the correct vertical offset
        ctx.drawImage(bitmap, 0, imgData.y);
    }

    // Convert the canvas to a Blob
    const finalBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 1.0 });

    // // Convert Blob to data URL
    // const finalDataUrl = await new Promise((resolve) => {
    //     const reader = new FileReader();
    //     reader.onloadend = () => resolve(reader.result);
    //     reader.readAsDataURL(finalBlob);
    // });

    return finalBlob;
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
        params.append("redirect", true);
        chrome.tabs.update(details.tabId, {
            url: chrome.runtime.getURL(`offline_page/page.html?${params.toString()}`)
        });
    }
});
