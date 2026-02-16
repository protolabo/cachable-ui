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
        saveScreenshot(message.url, message.id)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ error: error.message }));

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
