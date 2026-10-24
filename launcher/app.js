!function(){
  "use strict";

  function tr(s, p) {
    return window.HomeI18n ? HomeI18n.t(s, p) : s.replace(/\{(\w+)\}/g, function(m, k) {
      return p && p[k] !== undefined ? p[k] : m;
    });
  }

  function ht(s) {
    return window.HomeI18n ? HomeI18n.html(s) : s;
  }

  var toastTimer,
      cols = Math.max(4, (window.CONFIG && CONFIG.columns) || 6),
      userName = (window.CONFIG && CONFIG.userName) || "AL-GHANI",
      cardW = 208,
      cardH = 118,
      gap = 20,
      pad = 20,
      KEY_OK = 13,
      KEY_BACK = 461,
      l = function(id) { return document.getElementById(id); },
      stage = l("stage"),
      tiles = l("tiles"),
      dockBand = l("dockBand"),
      dockTooltip = l("dockTooltip"),
      glass = l("glass"),
      heroEyebrow = l("heroEyebrow"),
      heroTitle = l("heroTitle"),
      heroHint = l("heroHint"),
      heroAction = l("heroAction"),
      heroActionText = l("heroActionText"),
      ambient = [l("ambientA"), l("ambientB")],
      ambientIdx = 0,
      prevColor = null,
      topChips = [l("chipWeather"), l("chipPrayer"), l("chipAsk"), l("chipInputs"), l("chipAvatar")],
      inputsPanel = l("inputsPanel"),
      y = [],
      x = "grid", // "grid" (dock/launchpad), "hero", "top", "inputs"
      L = 0,
      b = 0,
      C = 0,
      inputRows = [],
      stageY = 0,
      holding = false,
      holdTimer = null,
      movingItem = null,
      services = [];

  function callLuna(uri, params, cb) {
    try {
      var bridge = new PalmServiceBridge();
      bridge.onservicecallback = function(raw) {
        var res;
        try { res = JSON.parse(raw); } catch (e) { res = { returnValue: false }; }
        cb && cb(res);
        if (!params || !params.subscribe) {
          var idx = services.indexOf(bridge);
          if (idx >= 0) services.splice(idx, 1);
        }
      };
      services.push(bridge);
      bridge.call(uri, JSON.stringify(params || {}));
    } catch (e) {
      cb && cb({ returnValue: false, errorText: String(e) });
    }
  }

  function launchApp(id, title, params) {
    callLuna("luna://com.webos.applicationManager/launch", { id: id, params: params || {} }, function(res) {
      if (res && res.returnValue === false) {
        showToast(tr("Can't open {app}", { app: title || id }));
      }
    });
  }

  function showToast(text) {
    var toast = l("toast");
    toast.textContent = text;
    toast.classList.add("shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
      toast.classList.remove("shown");
    }, 2400);
  }

  // App library & customization
  var library, hideButton, editHint, picker, pickerList, pickerStatus, pickerClose;
  var pickerOpen = false, pickerGeneration = 0, pickerIndex = 0, pickerButtons = [];
  var hideSelected = false, undoState = null, undoBar, undoButton, pointerTimer = null, suppressClick = false;

  function screenIds() {
    return y.filter(function(item) { return !item.add; }).map(function(item) { return item.app.id; });
  }

  function saveScreen(hidden) {
    try {
      library.save(screenIds(), hidden || library.hidden());
      return true;
    } catch (err) {
      showToast(tr("Couldn't save changes. Please try again."));
      return false;
    }
  }

  function rebuild(focusId) {
    tiles.innerHTML = "";
    y = library.visible().map(createTile);

    var addEl = document.createElement("div");
    addEl.className = "item add-app";
    addEl.setAttribute("role", "button");
    addEl.setAttribute("aria-label", tr("Add app"));
    addEl.innerHTML = ht('<div class="card"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></div><div class="name">' + tr("Add app") + '</div>');

    var addItem = { add: true, app: { title: tr("Add app") }, el: addEl, color: [60, 65, 75] };
    addEl.addEventListener("mouseover", function() {
      if (!movingItem && !pickerOpen && !undoState) j(y.length - 1);
    });
    addEl.addEventListener("click", function() {
      if (!movingItem) openPicker();
    });
    tiles.appendChild(addEl);
    y.push(addItem);

    layoutTiles();
    y.forEach(function(tile) { tile.el.classList.add("shown"); });
    switchZone("grid");
    var targetIdx = Math.max(0, y.findIndex(function(tile) { return tile.app.id === focusId; }));
    j(targetIdx);
  }

  function activateTile(item) {
    if (!item) return;
    if (item.add) openPicker();
    else launchApp(item.app.id, item.app.title);
  }

  function cancelHold() {
    clearTimeout(holdTimer);
    holdTimer = null;
    clearTimeout(pointerTimer);
    pointerTimer = null;
    holding = false;
  }

  function beginMoving(item) {
    if (!item || item.add || movingItem || pickerOpen || undoState) return;
    movingItem = { item: item, snapshot: y.slice() };
    item.el.classList.add("moving");
    document.body.classList.add("editing");
    hideButton.hidden = false;
    editHint.hidden = false;
    hideButton.classList.remove("focused");
    hideSelected = false;
    j(y.indexOf(item));
  }

  function pointerMove(item) {
    if (!movingItem || item.add) return;
    hideSelected = false;
    hideButton.classList.remove("focused");
    reorderTile(y.indexOf(item));
  }

  function bindHold(item) {
    item.el.addEventListener("mousedown", function(e) {
      if (e.button !== 0 || movingItem || pickerOpen || undoState) return;
      j(y.indexOf(item));
      clearTimeout(pointerTimer);
      suppressClick = false;
      pointerTimer = setTimeout(function() {
        pointerTimer = null;
        suppressClick = true;
        beginMoving(item);
      }, 600);
    });
    item.el.addEventListener("mouseleave", function() {
      clearTimeout(pointerTimer);
      pointerTimer = null;
    });
  }

  function tileClick(item) {
    if (suppressClick) { suppressClick = false; return; }
    if (pickerOpen || undoState) return;
    if (movingItem) { pointerMove(item); commitMoving(true); }
    else activateTile(item);
  }

  function selectHide() {
    if (!movingItem) return;
    hideSelected = true;
    hideButton.classList.add("focused");
    hideButton.focus();
  }

  function hideApp() {
    if (!movingItem) return;
    var item = movingItem.item,
        snapshot = movingItem.snapshot.slice(),
        oldHidden = library.hidden(),
        previous = y.slice();
    y = y.filter(function(tile) { return tile !== item; });
    if (!saveScreen(oldHidden.concat(item.app.id))) {
      y = previous;
      return;
    }
    movingItem = null;
    hideSelected = false;
    item.el.classList.remove("moving");
    document.body.classList.remove("editing");
    hideButton.hidden = true;
    editHint.hidden = true;
    item.el.remove();
    layoutTiles();
    switchZone("grid");
    j(Math.min(L, y.length - 1));
    undoState = {
      ids: snapshot.filter(function(tile) { return !tile.add; }).map(function(tile) { return tile.app.id; }),
      hidden: oldHidden,
      id: item.app.id
    };
    undoBar.hidden = false;
    undoButton.focus();
  }

  function dismissUndo() {
    if (!undoState) return;
    undoState = null;
    undoBar.hidden = true;
    j(L);
  }

  function undoHide() {
    if (!undoState) return;
    try {
      var id = undoState.id;
      library.save(undoState.ids, undoState.hidden);
      dismissUndo();
      rebuild(id);
    } catch (e) {
      showToast(tr("Couldn't restore app. Please try again."));
    }
  }

  function closePicker() {
    if (!pickerOpen) return;
    pickerOpen = false;
    pickerGeneration++;
    picker.hidden = true;
    cancelHold();
    switchZone("grid");
    j(y.length - 1);
  }

  function focusPicker(index) {
    pickerIndex = Math.max(0, Math.min(index, pickerButtons.length - 1));
    pickerButtons[pickerIndex].focus();
    pickerButtons[pickerIndex].scrollIntoView({ block: "nearest" });
  }

  function renderPicker(apps) {
    pickerList.innerHTML = "";
    pickerButtons = [];
    apps.forEach(function(app) {
      var btn = document.createElement("button");
      btn.className = "app-choice";
      btn.dataset.appId = app.id;
      var icon = document.createElement("img");
      icon.src = app.icon || "";
      icon.alt = "";
      icon.onerror = function() { icon.style.visibility = "hidden"; };
      var title = document.createElement("span");
      title.textContent = app.title;
      btn.appendChild(icon);
      btn.appendChild(title);
      btn.addEventListener("focus", function() { pickerIndex = pickerButtons.indexOf(btn); });
      btn.addEventListener("click", function() {
        try {
          library.add(app.id);
          closePicker();
          rebuild(app.id);
          showToast(tr("{app} added", { app: app.title }));
        } catch (e) {
          pickerStatus.textContent = tr("Couldn't save changes. Please try again.");
        }
      });
      pickerList.appendChild(btn);
      pickerButtons.push(btn);
    });
    pickerButtons.push(pickerClose);
    focusPicker(0);
  }

  function openPicker() {
    if (movingItem || pickerOpen) return;
    dismissUndo();
    cancelHold();
    pickerOpen = true;
    var gen = ++pickerGeneration;
    picker.hidden = false;
    pickerStatus.textContent = tr("Checking installed apps…");
    pickerList.innerHTML = "";
    pickerButtons = [pickerClose];
    focusPicker(0);
    switchZone("picker");
    AppLibrary.installed(function(apps) {
      if (!pickerOpen || gen !== pickerGeneration) return;
      if (apps !== null) library.refresh(apps);
      var choices = library.available();
      pickerStatus.textContent = apps === null ?
        tr("Showing the saved list. Could not refresh apps from the TV.") :
        choices.length ? tr("Choose an app to add to Home.") : tr("All installed apps are already on Home.");
      renderPicker(choices);
    });
  }

  function initializeApps() {
    library = AppLibrary.create(localStorage, window.TV_APPS && TV_APPS.apps || [], CONFIG);
    hideButton = document.createElement("button");
    hideButton.id = "hideApp";
    hideButton.hidden = true;
    hideButton.innerHTML = ht('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10 5.2c5.5-1 10 6.8 10 6.8a20 20 0 0 1-3 3M6 6C3.4 8 2 12 2 12s4 7 10 7c1.4 0 2.7-.4 4-1M9 9a4.2 4.2 0 0 0 6 6"/></svg><span>Hide from Home</span>');
    hideButton.addEventListener("mouseover", selectHide);
    hideButton.addEventListener("click", hideApp);
    document.body.appendChild(hideButton);

    editHint = document.createElement("div");
    editHint.id = "editHint";
    editHint.hidden = true;
    editHint.textContent = tr("← ↑ ↓ → Move   ·   OK Place   ·   Back Cancel   ·   ↓ Below last row to hide");
    document.body.appendChild(editHint);

    undoBar = document.createElement("div");
    undoBar.id = "appUndo";
    undoBar.hidden = true;
    undoBar.setAttribute("role", "status");
    var undoMsg = document.createElement("span");
    undoMsg.textContent = tr("App hidden. Add it back with +.");
    undoBar.appendChild(undoMsg);
    undoButton = document.createElement("button");
    undoButton.textContent = tr("Undo");
    undoButton.addEventListener("click", undoHide);
    undoBar.appendChild(undoButton);
    document.body.appendChild(undoBar);

    picker = document.createElement("section");
    picker.id = "appPicker";
    picker.hidden = true;
    picker.setAttribute("role", "dialog");
    picker.setAttribute("aria-modal", "true");
    picker.setAttribute("aria-labelledby", "appPickerTitle");
    picker.innerHTML = ht('<div class="app-picker-card"><h2 id="appPickerTitle">' + tr("Add app") + '</h2><p id="appPickerStatus" role="status"></p><div id="appPickerList"></div><button id="appPickerClose">' + tr("Back to Home") + '</button></div>');
    document.body.appendChild(picker);
    pickerList = l("appPickerList");
    pickerStatus = l("appPickerStatus");
    pickerClose = l("appPickerClose");
    pickerClose.addEventListener("click", closePicker);

    document.addEventListener("mouseup", function() {
      clearTimeout(pointerTimer);
      pointerTimer = null;
      setTimeout(function() { suppressClick = false; }, 0);
    });
    window.addEventListener("blur", cancelHold);
    document.addEventListener("visibilitychange", function() {
      if (document.hidden) { cancelHold(); if (movingItem) commitMoving(false); }
    });

    document.addEventListener("keydown", function(e) {
      var key = e.keyCode;
      if (pickerOpen) {
        e.preventDefault(); e.stopImmediatePropagation();
        if (key === 27 || key === KEY_BACK) closePicker();
        else if (key === KEY_OK && !e.repeat) pickerButtons[pickerIndex].click();
        else if (key === 38 || key === 37) focusPicker(pickerIndex - 1);
        else if (key === 40 || key === 39) focusPicker(pickerIndex + 1);
        else if (key === 9) focusPicker((pickerIndex + (e.shiftKey ? -1 : 1) + pickerButtons.length) % pickerButtons.length);
      } else if (undoState) {
        e.preventDefault(); e.stopImmediatePropagation();
        if (key === KEY_OK && !e.repeat) undoHide();
        else if (key === 27 || key === KEY_BACK || (key >= 37 && key <= 40)) dismissUndo();
      } else if (movingItem && hideSelected) {
        e.preventDefault(); e.stopImmediatePropagation();
        if (key === KEY_OK && !e.repeat) hideApp();
        else if (key === 27 || key === KEY_BACK) commitMoving(false);
        else if (key === 38) {
          hideSelected = false;
          hideButton.classList.remove("focused");
          hideButton.blur();
          j(L);
        }
      }
    }, true);

    document.addEventListener("keyup", function(e) {
      if (pickerOpen || undoState || hideSelected) {
        cancelHold();
        e.stopImmediatePropagation();
      }
    }, true);

    rebuild();
  }

  // Brand card logo generators matching 03-hero-aksi.jpg
  function getBrandLogo(app) {
    var id = (app.id || "").toLowerCase();
    var title = (app.title || "").toLowerCase();
    if (id.indexOf("youtube") >= 0 || title.indexOf("youtube") >= 0) {
      return '<div class="brand-card brand-youtube"><svg viewBox="0 0 160 40" width="150" height="38"><g transform="translate(10, 6)"><path d="M33.7 3.8a4.2 4.2 0 0 0-3-3C28.1 0 17.2 0 17.2 0S6.3 0 3.7.8A4.2 4.2 0 0 0 .7 3.8C0 6.5 0 12 0 12s0 5.5.7 8.2a4.2 4.2 0 0 0 3 3C6.3 24 17.2 24 17.2 24s10.9 0 13.5-.8a4.2 4.2 0 0 0 3-3c.7-2.7.7-8.2.7-8.2s0-5.5-.7-8.2z" fill="#FF0000"/><polygon points="13.8,7 13.8,17 22.4,12" fill="#FFFFFF"/></g><text x="54" y="27" font-family="Outfit, sans-serif" font-weight="800" font-size="22" fill="#0F0F0F" letter-spacing="-0.04em">YouTube</text></svg></div>';
    }
    if (id.indexOf("netflix") >= 0 || title.indexOf("netflix") >= 0) {
      return '<div class="brand-card brand-netflix"><svg viewBox="0 0 160 44" width="150" height="40"><text x="80" y="32" font-family="Outfit, sans-serif" font-weight="900" font-size="28" fill="#E50914" text-anchor="middle" letter-spacing="0.08em">NETFLIX</text></svg></div>';
    }
    if (id.indexOf("vidio") >= 0 || title.indexOf("vidio") >= 0) {
      return '<div class="brand-card brand-vidio"><svg viewBox="0 0 160 44" width="140" height="42"><text x="80" y="32" font-family="Outfit, sans-serif" font-weight="900" font-style="italic" font-size="34" fill="#FFFFFF" text-anchor="middle">Vidio</text></svg></div>';
    }
    if (id.indexOf("spotify") >= 0 || title.indexOf("spotify") >= 0) {
      return '<div class="brand-card brand-spotify"><svg viewBox="0 0 160 44" width="140" height="38"><circle cx="24" cy="22" r="16" fill="#1DB954"/><path d="M14 17.5a12 12 0 0 1 19 2.5M15.5 22a9.5 9.5 0 0 1 15 2M17.5 26a7 7 0 0 1 11 1.5" stroke="#121212" stroke-width="2.6" stroke-linecap="round" fill="none"/><text x="48" y="29" font-family="Outfit, sans-serif" font-weight="700" font-size="22" fill="#1DB954">Spotify</text></svg></div>';
    }
    if (id.indexOf("tiktok") >= 0 || title.indexOf("tiktok") >= 0) {
      return '<div class="brand-card brand-tiktok"><svg viewBox="0 0 160 44" width="140" height="40"><g transform="translate(12, 6)"><path d="M21 7a6 6 0 0 0 6 5v4a10 10 0 0 1-6-2.2V26a8 8 0 1 1-8-8c.9 0 1.8.2 2.6.5V23a4 4 0 1 0 1.4 3V7h4z" fill="#FFFFFF"/><path d="M20 6a6 6 0 0 0 6 5v1a10 10 0 0 1-6-2V25a8 8 0 1 1-8-8v4a4 4 0 1 0 4 4V6h4z" fill="#25F4EE" opacity="0.6"/></g><text x="48" y="30" font-family="Outfit, sans-serif" font-weight="800" font-size="23" fill="#FFFFFF">TikTok</text></svg></div>';
    }
    if (id.indexOf("smarters") >= 0 || id.indexOf("bittv") >= 0) {
      return '<div class="brand-card" style="background:#1b637a;"><svg viewBox="0 0 140 44" width="130" height="40"><text x="22" y="32" font-family="Outfit, sans-serif" font-weight="800" font-size="32" fill="#FFFFFF">bit</text><g transform="translate(70, 9)"><rect x="0" y="0" width="34" height="23" rx="6" fill="none" stroke="#FFFFFF" stroke-width="3"/><text x="17" y="16" font-family="Outfit, sans-serif" font-weight="800" font-size="13" fill="#FFFFFF" text-anchor="middle">TV</text></g></svg></div>';
    }
    return null;
  }

  function createTile(app) {
    var itemEl = document.createElement("div");
    itemEl.className = "item";
    itemEl.dataset.appId = app.id;
    itemEl.setAttribute("role", "button");
    itemEl.setAttribute("aria-label", app.title);

    var cardEl = document.createElement("div");
    cardEl.className = "card";

    var tileObj = { app: app, el: itemEl, card: cardEl, color: null };

    var brandHtml = getBrandLogo(app);
    if (brandHtml) {
      cardEl.innerHTML = brandHtml;
      tileObj.color = parseColor(app.iconColor) || [40, 45, 55];
    } else {
      var img = document.createElement("img");
      img.onload = function() {
        if (app.iconColor) cardEl.style.backgroundColor = parseHex(app.iconColor) || "#1c1c1e";
        tileObj.color = parseColor(app.iconColor) || [50, 60, 70];
        if (y[L] === tileObj) updateAmbient(tileObj.color);
      };
      img.onerror = function() {
        img.style.display = "none";
        cardEl.classList.add("missing-icon");
        cardEl.setAttribute("data-initial", (app.title || "A").charAt(0));
      };
      img.src = app.icon || "missing-icon";
      cardEl.appendChild(img);
      tileObj.color = parseColor(app.iconColor) || [50, 60, 70];
    }

    itemEl.appendChild(cardEl);

    var nameEl = document.createElement("div");
    nameEl.className = "name";
    nameEl.textContent = app.title;
    itemEl.appendChild(nameEl);

    itemEl.addEventListener("mouseover", function() {
      if (x === "inputs" || pickerOpen || undoState) return;
      if (movingItem) pointerMove(tileObj);
      else j(y.indexOf(tileObj));
    });
    itemEl.addEventListener("click", function() {
      tileClick(tileObj);
    });

    bindHold(tileObj);
    tiles.appendChild(itemEl);
    return tileObj;
  }

  function parseHex(c) {
    if (!c || typeof c !== "string") return null;
    return c.charAt(0) === "#" ? c : "#" + c;
  }

  function parseColor(c) {
    var match = /^#?([0-9a-f]{6})$/i.exec(c || "");
    if (!match) return null;
    var n = parseInt(match[1], 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }

  function tileRow(index) {
    return Math.floor(index / cols);
  }

  function layoutTiles() {
    var dockCount = Math.min(cols, y.length);
    var bandW = dockCount * cardW + Math.max(0, dockCount - 1) * gap + 2 * pad;
    var bandH = cardH + 2 * pad;
    var bandLeft = Math.round((1920 - bandW) / 2);
    var bandTop = 1080 - 40 - bandH;

    dockBand.style.display = dockCount ? "block" : "none";
    dockBand.style.left = bandLeft + "px";
    dockBand.style.top = bandTop + "px";
    dockBand.style.width = bandW + "px";
    dockBand.style.height = bandH + "px";

    y.forEach(function(tile, i) {
      tiles.appendChild(tile.el);
      var r = tileRow(i);
      tile.el.classList.toggle("dock", r === 0);
      var col = i % cols;
      var posX = bandLeft + pad + col * (cardW + gap);
      var posY;
      if (r === 0) {
        posY = bandTop + pad;
      } else {
        // Place row >= 1 safely off-screen below the 1080p viewport when at rest
        posY = bandTop + pad + r * (cardH + gap + 36) + 80;
      }
      tile.el.style.left = posX + "px";
      tile.el.style.top = posY + "px";
    });
  }

  function j(index) {
    if (!y.length) return;
    index = Math.max(0, Math.min(index, y.length - 1));
    switchZone("grid");

    if (y[L]) y[L].el.classList.remove("focused");
    L = index;
    var focusedTile = y[index];
    focusedTile.el.classList.add("focused");

    var r = tileRow(index);
    if (r === 0 && !movingItem) {
      stageY = 0;
      document.body.classList.remove("scrolled");
    } else {
      stageY = (r * (cardH + gap + 36) + 80) - 20;
      document.body.classList.add("scrolled");
    }
    stage.style.transform = "translateY(" + (-stageY) + "px)";

    // Update Hero text block
    var app = focusedTile.app;
    if (focusedTile.add) {
      heroEyebrow.textContent = tr("Add app").toUpperCase();
      heroTitle.textContent = tr("Add app");
      heroHint.textContent = tr("Choose an app to add to Home.");
      heroActionText.textContent = tr("Add app");
    } else {
      var isSys = !app.id || app.id.indexOf("com.webos.app.") === 0 || app.id.indexOf("youtube") >= 0 || app.id.indexOf("netflix") >= 0;
      heroEyebrow.textContent = (isSys ? tr("System app") : tr("In dock")).toUpperCase();
      heroTitle.textContent = app.title;
      heroHint.textContent = tr("Hold OK for options");
      heroActionText.textContent = tr("Open {app}", { app: app.title });
    }

    // Dock Tooltip
    if (r === 0 && !movingItem) {
      dockTooltip.textContent = app.title;
      var curLeft = focusedTile.el.offsetLeft + cardW / 2;
      var curTop = focusedTile.el.offsetTop - 52;
      dockTooltip.style.left = curLeft + "px";
      dockTooltip.style.top = curTop + "px";
      dockTooltip.classList.add("shown");
    } else {
      dockTooltip.classList.remove("shown");
    }

    updateAmbient(focusedTile.color);
  }

  function updateAmbient(color) {
    if (!color) return;
    var str = color.join(",");
    if (str === prevColor) return;
    prevColor = str;
    var nextAmbient = ambient[1 - ambientIdx];
    nextAmbient.style.background = "radial-gradient(circle 1100px at 30% 45%, rgba(" + str + ",0.35) 0%, rgba(" + str + ",0.12) 50%, rgba(" + str + ",0) 100%)";
    nextAmbient.style.opacity = "1";
    ambient[ambientIdx].style.opacity = "0";
    ambientIdx = 1 - ambientIdx;
  }

  function switchZone(zone) {
    if (x === zone) return;
    if (x === "top" && topChips[b]) topChips[b].classList.remove("focused");
    if (x === "hero") heroAction.classList.remove("focused");
    if (x === "grid" && y[L]) {
      y[L].el.classList.remove("focused");
      dockTooltip.classList.remove("shown");
    }
    x = zone;
  }

  function focusTopChip(index) {
    switchZone("top");
    document.body.classList.remove("scrolled");
    if (topChips[b]) topChips[b].classList.remove("focused");
    b = Math.max(0, Math.min(index, topChips.length - 1));
    topChips[b].classList.add("focused");
  }

  function focusHero() {
    switchZone("hero");
    heroAction.classList.add("focused");
    // Keep active tile in dock highlighted without zoom
    if (y[L]) {
      y[L].el.classList.add("focused");
      dockTooltip.classList.remove("shown");
    }
  }

  function reorderTile(targetIndex) {
    if (targetIndex < 0 || targetIndex >= y.length - 1 || targetIndex === L) return;
    y.splice(targetIndex, 0, y.splice(L, 1)[0]);
    L = targetIndex;
    layoutTiles();
    j(targetIndex);
  }

  function commitMoving(commit) {
    var item = movingItem.item;
    if (commit && !saveScreen()) return;
    if (!commit) y = movingItem.snapshot;
    movingItem = null;
    item.el.classList.remove("moving");
    document.body.classList.remove("editing");
    hideSelected = false;
    hideButton.hidden = true;
    editHint.hidden = true;
    layoutTiles();
    j(y.indexOf(item));
  }

  function activateTopChip(index) {
    if (index === 0) {
      showToast(tr("Weather") + " · " + ((window.CONFIG && CONFIG.city) || "Samarinda") + " · 29° · " + tr("Partly cloudy"));
    } else if (index === 1) {
      showToast(tr("Prayer") + " · " + ((window.CONFIG && CONFIG.city) || "Samarinda") + " · Dzuhur 11.56 · Ashar 15.14 · Maghrib 17.59");
    } else if (index === 2) {
      showToast("✦ " + tr("Ask") + ": " + tr("Assistant"));
    } else if (index === 3) {
      toggleInputsPanel();
    } else if (index === 4) {
      if (window.RenewalPanel) window.RenewalPanel.open();
    }
  }

  function toggleInputsPanel() {
    inputsPanel.innerHTML = "";
    inputRows = [];
    var inputs = (window.TV_APPS && TV_APPS.inputs) || [];
    inputs.forEach(function(item) {
      createInputRow("M18,7V4c0,-1.1 -0.9,-2 -2,-2H8C6.9,2 6,2.9 6,4v3H5v6l3,6v3h8v-3l3,-6V7H18zM8,4h8v3h-2V5h-1v2h-2V5h-1v2H8V4z", item.label, item.appId);
    });
    if (CONFIG && CONFIG.liveTvApp) {
      if (inputRows.length) {
        var sep = document.createElement("div");
        sep.className = "separator";
        inputsPanel.appendChild(sep);
      }
      createInputRow("M21,6h-7.59l3.29,-3.29L16,2l-4,4l-4,-4l-0.71,0.71L10.59,6H3c-1.1,0 -2,0.89 -2,2v12c0,1.1 0.9,2 2,2h18c1.1,0 2,-0.89 2,-2V8C23,6.89 22.1,6 21,6zM21,20H3V8h18V20zM9,10v8l7,-4L9,10z", tr("Live TV"), CONFIG.liveTvApp);
    }
    if (inputRows.length) {
      var chipRect = topChips[3].getBoundingClientRect();
      inputsPanel.style.right = (1920 - chipRect.right) + "px";
      inputsPanel.style.top = (chipRect.bottom + 16) + "px";
      inputsPanel.style.minWidth = "280px";
      inputsPanel.classList.remove("hidden");
      topChips[b].classList.remove("focused");
      x = "inputs";
      focusInputRow(0);
    } else {
      showToast(tr("No inputs found"));
    }
  }

  function createInputRow(svgPath, label, appId) {
    var row = document.createElement("div");
    row.className = "inputRow";
    row.innerHTML = ht('<svg viewBox="0 0 24 24"><path d="' + svgPath + '"/></svg>') + '<span>' + label + '</span>';
    var idx = inputRows.length;
    row.addEventListener("mouseover", function() { focusInputRow(idx); });
    row.addEventListener("click", function() {
      closeInputsPanel();
      launchApp(appId, label);
    });
    row.appId = appId;
    row.label = label;
    inputRows.push(row);
    inputsPanel.appendChild(row);
  }

  function focusInputRow(index) {
    if (inputRows[C]) inputRows[C].classList.remove("focused");
    C = Math.max(0, Math.min(index, inputRows.length - 1));
    inputRows[C].classList.add("focused");
  }

  function closeInputsPanel() {
    inputsPanel.classList.add("hidden");
    focusTopChip(3);
  }

  function updateClockAndGreeting() {
    var now = new Date();
    var h = now.getHours();
    var m = ("0" + now.getMinutes()).slice(-2);
    l("clock").textContent = h + "." + m;

    var g = h < 4 ? "Selamat malam" : h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
    l("greeting").textContent = g.toUpperCase() + ", " + userName;
  }

  function refreshLiveData() {
    // Open-Meteo weather fetch for configured coordinates
    try {
      var lat = (CONFIG && CONFIG.latitude) || "-0.4948";
      var lon = (CONFIG && CONFIG.longitude) || "117.1436";
      var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m,weather_code,is_day&timezone=auto";
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.timeout = 8000;
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            if (data && data.current && data.current.temperature_2m !== undefined) {
              l("weatherText").textContent = Math.round(data.current.temperature_2m) + "°";
            }
          } catch (_) {}
        }
      };
      xhr.send();
    } catch (_) {}
  }

  // Key Event Listeners
  document.addEventListener("keyup", function(e) {
    if (window.RenewalPanel && window.RenewalPanel.isOpen()) {
      holding = false;
      return;
    }
    if (e.keyCode === KEY_OK && !holding) {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
      if (x === "grid" && y[L] && !movingItem) {
        activateTile(y[L]);
      } else if (x === "hero" && y[L]) {
        activateTile(y[L]);
      }
    }
    holding = false;
  });

  document.addEventListener("keydown", function(e) {
    var key = e.keyCode;
    if (key !== KEY_OK && holdTimer) cancelHold();

    if (key === KEY_OK) {
      if (holding) { e.preventDefault(); return; }
      holding = true;
    }

    if (movingItem) {
      if (key === 37) reorderTile(L - 1);
      else if (key === 39) reorderTile(L + 1);
      else if (key === 38) reorderTile(L - cols);
      else if (key === 40) {
        if (tileRow(L) >= tileRow(y.length - 2)) selectHide();
        else reorderTile(Math.min(L + cols, y.length - 2));
      } else if (key === KEY_OK) commitMoving(true);
      else if (key === KEY_BACK || key === 27) commitMoving(false);
      e.preventDefault();
      return;
    }

    if (x === "inputs") {
      if (key === 38) focusInputRow(C - 1);
      else if (key === 40) focusInputRow(C + 1);
      else if (key === KEY_OK) {
        var sel = inputRows[C];
        closeInputsPanel();
        launchApp(sel.appId, sel.label);
      } else if (key === KEY_BACK || key === 27 || key === 37 || key === 39) {
        closeInputsPanel();
      }
      e.preventDefault();
      return;
    }

    if (x === "top") {
      if (key === 37) focusTopChip(b - 1);
      else if (key === 39) focusTopChip(b + 1);
      else if (key === 40) focusHero();
      else if (key === KEY_OK) activateTopChip(b);
      else if (key === KEY_BACK || key === 27) j(L);
      e.preventDefault();
      return;
    }

    if (x === "hero") {
      if (key === 38) focusTopChip(b);
      else if (key === 40) { switchZone("grid"); j(L); }
      else if (key === 37) { switchZone("grid"); j(Math.max(0, L - 1)); }
      else if (key === 39) { switchZone("grid"); j(Math.min(y.length - 1, L + 1)); }
      else if (key === KEY_OK) activateTile(y[L]);
      else if (key === KEY_BACK || key === 27) { switchZone("grid"); j(L); }
      e.preventDefault();
      return;
    }

    // Default "grid" zone
    var curRow = tileRow(L);
    var colInRow = L % cols;
    var maxIdx = y.length - 1;

    if (key === 37) {
      if (colInRow > 0) j(L - 1);
    } else if (key === 39) {
      if (colInRow < cols - 1 && L < maxIdx) j(L + 1);
    } else if (key === 38) {
      if (curRow === 0) focusHero();
      else j(L - cols);
    } else if (key === 40) {
      if (curRow < tileRow(maxIdx)) j(Math.min(L + cols, maxIdx));
    } else if (key === KEY_OK) {
      holdTimer = setTimeout(function() {
        holdTimer = null;
        beginMoving(y[L]);
      }, 600);
    } else if (key === KEY_BACK || key === 27) {
      if (curRow > 0) j(0);
    }

    e.preventDefault();
  });

  // Top Chips mouse listeners
  topChips.forEach(function(chip, idx) {
    if (!chip) return;
    chip.addEventListener("mouseover", function() {
      if (x !== "inputs" && !movingItem && !pickerOpen && !undoState) focusTopChip(idx);
    });
    chip.addEventListener("click", function() {
      if (!movingItem && !pickerOpen && !undoState) activateTopChip(idx);
    });
  });

  // Hero Action Button mouse listeners
  heroAction.addEventListener("mouseover", function() {
    if (x !== "inputs" && !movingItem && !pickerOpen && !undoState) focusHero();
  });
  heroAction.addEventListener("click", function() {
    if (!movingItem && !pickerOpen && !undoState && y[L]) activateTile(y[L]);
  });

  function resetView() {
    cancelHold();
    closePicker();
    dismissUndo();
    if (movingItem) commitMoving(false);
    updateClockAndGreeting();
    if (x === "inputs") inputsPanel.classList.add("hidden");
    topChips.forEach(function(c) { if (c) c.classList.remove("focused"); });
    switchZone("grid");
    j(L);
  }

  document.addEventListener("webOSRelaunch", resetView);
  document.addEventListener("visibilitychange", function() {
    if (!document.hidden) resetView();
  });

  initializeApps();
  layoutTiles();
  updateClockAndGreeting();
  setInterval(updateClockAndGreeting, 10000);
  refreshLiveData();
  setInterval(refreshLiveData, 30 * 60000);

  // Initial focus: if query has hero focus, or default to dock
  j(0);
  window.RootLauncherRendered = true;
}();
