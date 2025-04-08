const urlInput = document.getElementById("urlInput");
const goButton = document.getElementById("goButton");
const backButton = document.getElementById("backButton");
const forwardButton = document.getElementById("forwardButton");
const webview = document.getElementById("webview");
const toolbarWrapper = document.getElementById("toolbar-wrapper");
const toolbar = document.getElementById("toolbar");
const toggleArrow = document.getElementById("toggleArrow");
const menuBtn = document.getElementById("menuButton");
const dropdownMenu = document.getElementById("menuButtonContainer");
const historyItem = document.getElementById("historyDropdown");
const historyPopup = document.getElementById("historyPopup");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
let isToolbarVisible = true;

function formatURL(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    if (url.startsWith("www.")) {
      url = "https://" + url;
    } else if (url.includes(".")) {
      url = "https://www." + url;
    } else {
      url = "https://www.google.com/search?q=" + encodeURIComponent(url);
    }
    return url;
  }
  return url;
}

function setLoadingState(isLoading) {
  if (isLoading) {
    goButton.disabled = true;
    goButton.innerHTML = `<span class="loader"></span>`;
  } else {
    goButton.disabled = false;
    goButton.innerText = "GO";
  }
}

function updateNavButtons() {
  backButton.disabled = !webview.canGoBack();
  forwardButton.disabled = !webview.canGoForward();
  if (backButton.disabled) {
    backButton.innerHTML = '<span style="color: grey;">⬅</span>';
  } else {
    backButton.innerHTML = "⬅";
  }
  if (forwardButton.disabled) {
    forwardButton.innerHTML = '<span style="color: grey;">➡</span>';
  } else {
    forwardButton.innerHTML = "➡";
  }
}

function getHistory() {
  return JSON.parse(localStorage.getItem("browserHistory") || "[]");
}

function addToHistory(url, title) {
  webview
    .executeJavaScript(
      `
		(function() {
		  const links = document.querySelectorAll("link[rel~='icon']");
		  if (links.length > 0) return links[0].href;
		  return '/favicon.ico';
		})();
	  `
    )
    .then((icon) => {
      const history = JSON.parse(
        localStorage.getItem("browserHistory") || "[]"
      );
      if (history.length === 0 || history[history.length - 1].url !== url) {
        history.push({ url, title, icon });
        localStorage.setItem("browserHistory", JSON.stringify(history));
      }
    });
}

function populateHistoryPopup() {
  const popup = document.getElementById("historyPopup");
  const list = document.getElementById("historyList");
  const history = getHistory();

  list.innerHTML = ""; // Clear previous

  if (history.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No history available.";
    empty.style.color = "#aaa";
    empty.style.textAlign = "center";
    empty.style.fontStyle = "italic";
    list.appendChild(empty);
  } else {
    history.forEach((entry) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.flexDirection = "row";
      row.style.alignItems = "flex-start";
      row.style.padding = "6px";
      row.style.gap = "4px";
      row.style.marginBottom = "8px";
      row.style.padding = "8px";
      row.style.borderRadius = "4px";
      row.style.backgroundColor = "#505050";

      const iconImg = document.createElement("img");
      iconImg.src =
        entry.icon ||
        `https://www.google.com/s2/favicons?sz=64&domain_url=${
          new URL(entry.url).origin
        }`; // Fetch favicon from main website
      iconImg.style.width = "14px";
      iconImg.style.height = "14px";
      iconImg.style.marginRight = "8px";
      iconImg.style.marginTop = "2px"; // Align with text
      row.prepend(iconImg);

      const title = document.createElement("span");
      title.textContent = entry.title || entry.url;
      title.style.flex = "1";
      title.style.marginRight = "10px";
      title.style.color = "#FAFAFA";
      title.style.fontSize = "14px";
      title.style.whiteSpace = "normal"; // Allow wrapping
      title.style.overflowWrap = "break-word"; // Wrap long URLs
      title.style.lineHeight = "1.4"; // Improve readability
      title.style.marginBottom = "4px"; // Space from button if multiline

      const btn = document.createElement("button");
      btn.textContent = "Go";
      btn.style.padding = "6px 12px";
      btn.style.border = "none";
      btn.style.borderRadius = "4px";
      btn.style.backgroundColor = "#007BFF";
      btn.style.color = "#fff";
      btn.style.cursor = "pointer";
      btn.style.fontSize = "14px";
      btn.style.padding = "4px 10px";
      btn.style.transition = "background-color 0.2s ease";
      btn.onmouseover = () => (btn.style.backgroundColor = "#0056b3");
      btn.onmouseout = () => (btn.style.backgroundColor = "#007BFF");
      btn.onclick = () => {
        webview.loadURL(entry.url);
        popup.style.display = "none";
        webview.focus(); // Close popup after click
      };

      row.appendChild(title);
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  popup.style.display = "flex"; // Show popup
}

const updateToolbarState = () => {
  const toolbarHeight = toolbar.scrollHeight;
  document.documentElement.style.setProperty(
    "--toolbar-height",
    `${toolbarHeight}px`
  );
  if (isToolbarVisible) {
    toolbarWrapper.style.height = `${toolbarHeight}px`;
    toggleArrow.innerText = "⬆";
    toggleArrow.style.top = `${toolbarHeight - 12}px`;
  } else {
    toolbarWrapper.style.height = "0px";
    toggleArrow.innerText = "⬇";
    toggleArrow.style.top = "-12px";
  }
};
toggleArrow.addEventListener("click", () => {
  isToolbarVisible = !isToolbarVisible;
  updateToolbarState();
});
window.addEventListener("DOMContentLoaded", () => {
  updateToolbarState();
});
goButton.addEventListener("click", () => {
  webview.loadURL(formatURL(urlInput.value));
});
backButton.addEventListener("click", () => {
  if (webview.canGoBack()) {
    webview.goBack();
  }
});
forwardButton.addEventListener("click", () => {
  if (webview.canGoForward()) {
    webview.goForward();
  }
});
urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    webview.loadURL(formatURL(urlInput.value));
  }
});
const updateUrlBar = (event) => {
  urlInput.value = event.url;
};
menuBtn.addEventListener("click", () => {
  historyItem.classList.toggle("show");
});

historyItem.addEventListener("click", () => {
	populateHistoryPopup();
});

historyPopup.addEventListener("click", (e) => {
	if (e.target.id === "historyPopup") {
		e.target.style.display = "none";
		webview.focus(); // Close popup when clicking outside
	}
});
clearHistoryBtn.addEventListener("click", () => {
	if (confirm("Clear all browsing history?")) {
		localStorage.removeItem("browserHistory");
		populateHistoryPopup();
	}
});
document.addEventListener("click", (e) => {
  if (!menuBtn.contains(e.target) && !historyItem.contains(e.target)) {
	historyItem.classList.remove("show");
	webview.focus(); // Focus webview when clicking outside
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && historyPopup.style.display === "flex") {
    historyPopup.style.display = "none";
    webview.focus(); // Close popup on Escape
  }
});
webview.addEventListener("did-navigate", (e) => {
  urlInput.value = e.url;
  updateUrlBar(e);
  updateNavButtons(e);
  webview.executeJavaScript("document.title").then((title) => {
    addToHistory(e.url, title || e.url);
  });
});
// Update on various navigation events
webview.addEventListener("did-navigate-in-page", (e) => {
  updateUrlBar(e);
  updateNavButtons(e);
});
webview.addEventListener("did-start-loading", () => {
  // Optional: show loading indicator
  setLoadingState(true);
});
webview.addEventListener("did-stop-loading", () => {
  // Optional: hide loading indicator
  setLoadingState(false);
});
webview.addEventListener("did-fail-load", (e) => {
  console.error("Failed to load:", e.errorDescription);
  setLoadingState(false);
});
webview.addEventListener("dom-ready", updateNavButtons);
