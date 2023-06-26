/* global canvas settings loc drawMain getText */

// corner node size slider init
document.getElementById("nodeTransSlider").addEventListener("input", setNodeTransSize);
document.getElementById("nodeExtendSlider").addEventListener("input", setNodeExtendSize);

function setNodeTransSize() {
    const transSlider = document.getElementById("nodeTransSlider");
    const extendSlider = document.getElementById("nodeExtendSlider");

    settings.nodeTransSize = transSlider.value;
    settings.nodeExtendSize = Math.max(settings.nodeExtendSize, settings.nodeTransSize);

    extendSlider.value = settings.nodeExtendSize;
}

function setNodeExtendSize() {
    const transSlider = document.getElementById("nodeTransSlider");
    const extendSlider = document.getElementById("nodeExtendSlider");

    settings.nodeExtendSize = extendSlider.value;
    settings.nodeTransSize = Math.min(settings.nodeExtendSize, settings.nodeTransSize);

    transSlider.value = settings.nodeTransSize;
}

function setButtonContent() {
    // room
    document.getElementById("roomButton").textContent = getText(loc.room.category);

    // corner node
    document.getElementById("cornerHead").textContent = getText(loc.room.corner.head);
    document.getElementById("nodeTransSliderLabel").textContent = getText(loc.room.corner.center);
    document.getElementById("nodeExtendSliderLabel").textContent = getText(loc.room.corner.ring);

    // label
    document.getElementById("labelHead").textContent = getText(loc.room.label.head);
    document.getElementById("labelNameInputLabel").textContent = getText(loc.room.label.name);
    document.getElementById("labelNameInput").value = getText(loc.room.label.defaultName);
    document.getElementById("labelHeightInputLabel").textContent = getText(loc.room.label.height);
    document.getElementById("addLabelButton").textContent = getText(loc.room.label.add);

    // furniture
    document.getElementById("furnitureButton").textContent = getText(loc.furniture.category);

    document.getElementById("nameInputLabel").textContent = getText(loc.furniture.add.name);
    document.getElementById("nameInput").value = getText(loc.furniture.add.defaultName);

    document.getElementById("typeInputLabel").textContent = getText(loc.furniture.add.type);

    document.getElementById("widthInputLabel").textContent = getText(loc.furniture.add.width);
    document.getElementById("heightInputLabel").textContent = getText(loc.furniture.add.height);

    document.getElementById("circleWidthInputLabel").textContent = getText(loc.furniture.add.width);

    document.getElementById("LWidthInputLabel").textContent = getText(loc.furniture.add.width);
    document.getElementById("LHeightInputLabel").textContent = getText(loc.furniture.add.height);

    document.getElementById("UWidthInputLabel").textContent = getText(loc.furniture.add.width);
    document.getElementById("UHeightInputLabel").textContent = getText(loc.furniture.add.height);

    document.getElementById("addFurnitureButton").textContent = getText(loc.furniture.add.add);

    // util
    document.getElementById("saveButton").textContent = getText(loc.fileIO.saveButton);
    document.getElementById("loadButton").textContent = getText(loc.fileIO.loadButton);
    document.getElementById("helpButton").textContent = getText(loc.help.helpButton);
}

window.addEventListener("resize", setSize);

function setSize() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight;

    drawMain();
}

init();

function init() {
    if (navigator.language || navigator.userLanguage) {
        settings.language = (navigator.language || navigator.userLanguage).substring(0, 2);
    }
    console.log("language:", settings.language);

    document.getElementById("roomButton").click();

    document.getElementById("rectangleButton").click();

    setNodeTransSize();
    setNodeExtendSize();

    setButtonContent();

    setSize();
}