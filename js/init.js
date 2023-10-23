"use strict";
// corner node size slider init
document.getElementById("nodeTransSlider").addEventListener("input", setNodeTransSize);
document.getElementById("nodeExtendSlider").addEventListener("input", setNodeExtendSize);
function initNodeSize() {
    const transSlider = document.getElementById("nodeTransSlider");
    const extendSlider = document.getElementById("nodeExtendSlider");
    settings.nodeTransSize = Number(transSlider.value);
    settings.nodeExtendSize = Number(extendSlider.value);
    setNodeTransSize();
    setNodeExtendSize();
}
function setNodeTransSize() {
    const transSlider = document.getElementById("nodeTransSlider");
    const extendSlider = document.getElementById("nodeExtendSlider");
    settings.nodeTransSize = Number(transSlider.value);
    settings.nodeExtendSize = Math.max(settings.nodeExtendSize, settings.nodeTransSize);
    extendSlider.value = String(settings.nodeExtendSize);
    drawMain();
}
function setNodeExtendSize() {
    const transSlider = document.getElementById("nodeTransSlider");
    const extendSlider = document.getElementById("nodeExtendSlider");
    settings.nodeExtendSize = Number(extendSlider.value);
    settings.nodeTransSize = Math.min(settings.nodeExtendSize, settings.nodeTransSize);
    transSlider.value = String(settings.nodeTransSize);
    drawMain();
}
function resetOptions() {
    settings.showEdgeLabels = false;
    document.getElementById("edgeLabelCheckbox").checked = false;
    settings.showRoomSize = false;
    document.getElementById("roomSizeCheckbox").checked = false;
}
function addElem(parent, type, text = null) {
    const elem = document.createElement(type);
    if (text !== null) {
        elem.textContent = getText(text);
    }
    parent.appendChild(elem);
    return elem;
}
function addListEntry(parent, type, head, short) {
    const elem = document.createElement(type);
    const headElem = document.createElement("b");
    headElem.textContent = getText(head) + ": ";
    const shortElem = document.createTextNode(getText(short));
    elem.appendChild(headElem);
    elem.appendChild(shortElem);
    parent.appendChild(elem);
    return headElem;
}
function addAttr(elem, attr) {
    for (const [key, value] of Object.entries(attr)) {
        elem.setAttribute(key, value);
    }
    return elem;
}
function setButtonContent() {
    // floorplan
    document.getElementById("floorplanButton").textContent = getText(loc.floorplan.category);
    document.getElementById("distanceInputLabel").textContent = getText(loc.floorplan.option.distance);
    document.getElementById("loadFloorplanButton").textContent = getText(loc.floorplan.loadButton);
    document.getElementById("clearFloorplanButton").textContent = getText(loc.floorplan.clearButton);
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
    // openable
    document.getElementById("openableHead").textContent = getText(loc.room.openable.head);
    document.getElementById("openableWidthInputLabel").textContent = getText(loc.room.openable.width);
    document.getElementById("openableTypeInputLabel").textContent = getText(loc.room.openable.type);
    document.getElementById("addOpenableButton").textContent = getText(loc.room.openable.add);
    // furniture
    document.getElementById("furnitureButton").textContent = getText(loc.furniture.category);
    document.getElementById("nameInputLabel").textContent = getText(loc.furniture.add.name);
    document.getElementById("nameInput").value = getText(loc.furniture.add.defaultName);
    document.getElementById("typeInputLabel").textContent = getText(loc.furniture.add.type);
    document.getElementById("widthInputLabel").textContent = getText(loc.furniture.add.width);
    document.getElementById("heightInputLabel").textContent = getText(loc.furniture.add.height);
    document.getElementById("circleWidthInputLabel").textContent = getText(loc.furniture.add.width);
    document.getElementById("circleHeightInputLabel").textContent = getText(loc.furniture.add.height);
    document.getElementById("LWidthInputLabel").textContent = getText(loc.furniture.add.width);
    document.getElementById("LHeightInputLabel").textContent = getText(loc.furniture.add.height);
    document.getElementById("UWidthInputLabel").textContent = getText(loc.furniture.add.width);
    document.getElementById("UHeightInputLabel").textContent = getText(loc.furniture.add.height);
    document.getElementById("addFurnitureButton").textContent = getText(loc.furniture.add.add);
    // presentation
    document.getElementById("presentationButton").textContent = getText(loc.presentation.category);
    document.getElementById("presentationOptionsHead").textContent = getText(loc.presentation.option.head);
    document.getElementById("edgeLabelCheckboxLabel").textContent = getText(loc.presentation.option.showEdgeLabel);
    document.getElementById("roomSizeCheckboxLabel").textContent = getText(loc.presentation.option.roomSizeLabel);
    // util
    document.getElementById("saveButton").textContent = getText(loc.fileIO.saveButton);
    document.getElementById("loadButton").textContent = getText(loc.fileIO.loadButton);
    document.getElementById("exportButton").textContent = getText(loc.fileIO.exportButton);
    document.getElementById("printButton").textContent = getText(loc.fileIO.printButton);
    document.getElementById("helpOpen").textContent = getText(loc.help.helpOpen);
    // help
    const helpText = document.getElementById("helpText");
    addElem(helpText, "h2", loc.help.welcome);
    addElem(helpText, "p", loc.help.intro);
    addElem(helpText, "p", loc.help.explanationMode);
    const modeList = addElem(helpText, "ul");
    addAttr(addListEntry(modeList, "li", loc.help.introFloorplan, loc.help.shortFloorplan), { "class": "helpLink" }).addEventListener("click", clickFloorplan);
    addAttr(addListEntry(modeList, "li", loc.help.introRoom, loc.help.shortRoom), { "class": "helpLink" }).addEventListener("click", clickRoom);
    addAttr(addListEntry(modeList, "li", loc.help.introFurniture, loc.help.shortFurniture), { "class": "helpLink" }).addEventListener("click", clickFurniture);
    addAttr(addListEntry(modeList, "li", loc.help.introDisplay, loc.help.shortDisplay), { "class": "helpLink" }).addEventListener("click", clickDisplay);
    addElem(helpText, "p", loc.help.explanationUtil);
    const utilList = addElem(helpText, "ul");
    addListEntry(utilList, "li", loc.fileIO.saveButton, loc.fileIO.saveShort);
    addListEntry(utilList, "li", loc.fileIO.loadButton, loc.fileIO.loadShort);
    addListEntry(utilList, "li", loc.fileIO.exportButton, loc.fileIO.exportShort);
    addListEntry(utilList, "li", loc.fileIO.printButton, loc.fileIO.printShort);
    addAttr(addElem(helpText, "h3", loc.help.introFloorplan), { "class": "helpLink" }).addEventListener("click", clickFloorplan);
    addElem(helpText, "p", loc.help.explanationFloorplan);
    addAttr(addElem(helpText, "h3", loc.help.introRoom), { "class": "helpLink" }).addEventListener("click", clickRoom);
    addElem(helpText, "p", loc.help.explanationRoom);
    addAttr(addElem(helpText, "h3", loc.help.introFurniture), { "class": "helpLink" }).addEventListener("click", clickFurniture);
    addElem(helpText, "p", loc.help.explanationFurniture);
    addAttr(addElem(helpText, "h3", loc.help.introDisplay), { "class": "helpLink" }).addEventListener("click", clickDisplay);
    addElem(helpText, "p", loc.help.explanationDisplay);
    addElem(addElem(helpText, "p"), "b", loc.help.creator);
    document.getElementById("helpClose").textContent = getText(loc.help.helpClose);
}
window.addEventListener("resize", setSize);
function setSize() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight;
    drawMain();
}
function welcome() {
    let message = "";
    message += "\n _____                              _ _____                      ______ _                        _                                            ";
    message += "\n|  __ \\             /\\             | |  __ \\                    |  ____| |                      | |                                        ";
    message += "\n| |__) |__ _ __    /  \\   _ __   __| | |__) |_ _ _ __   ___ _ __| |__  | | ___   ___  _ __ _ __ | | __ _ _ __  _ __   ___ _ __               ";
    message += "\n|  ___/ _ \\ '_ \\  / /\\ \\ | '_ \\ / _` |  ___/ _` | '_ \\ / _ \\ '__|  __| | |/ _ \\ / _ \\| '__| '_ \\| |/ _` | '_ \\| '_ \\ / _ \\ '__|  ";
    message += "\n| |  |  __/ | | |/ ____ \\| | | | (_| | |  | (_| | |_) |  __/ |  | |    | | (_) | (_) | |  | |_) | | (_| | | | | | | |  __/ |                 ";
    message += "\n|_|   \\___|_| |_/_/    \\_\\_| |_|\\__,_|_|   \\__,_| .__/ \\___|_|  |_|    |_|\\___/ \\___/|_|  | .__/|_|\\__,_|_| |_|_| |_|\\___|_|        ";
    message += "\n                                                | |                                       | |                                                 ";
    message += "\n                                                |_|                                       |_|                                                 ";
    message += "\n";
    message += "\nReport issues: https://github.com/karldaeubel/PenAndPaperFloorplanner/issues/new";
    message += "\nFork:          https://github.com/karldaeubel/PenAndPaperFloorplanner/fork";
    message += "\n";
    console.log(message);
}
init();
function init() {
    welcome();
    if (navigator.language) {
        settings.language = navigator.language.substring(0, 2);
    }
    console.log("language:", settings.language);
    document.getElementById("distanceInput").dispatchEvent(new Event("input"));
    clickRoom();
    document.getElementById("leftOpenableButton").click();
    document.getElementById("circleButton").click();
    initNodeSize();
    setButtonContent();
    setState();
    setSize();
    resetOptions();
}
