const editor_checkbox = document.getElementById('editor_checkbox')

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { selection_mode: "ask" }, (response) => {
    if (response.selection_mode === "active") {
      editor_checkbox.checked = true;
    } else {
      editor_checkbox.checked = false;
    }
  });
});

editor_checkbox.addEventListener('change', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { selection_mode: (editor_checkbox.checked ? "active" : "inactive") }, (response) => {  
    });
  });
});