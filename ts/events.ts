// utils
function resetElements(type: string) {
    const tabContents = document.getElementsByClassName("tabContent " + type);
    for (const tabContent of tabContents) {
        (tabContent as HTMLDivElement).style.display = "none";
    }

    const tabLinks = document.getElementsByClassName("tabLinks " + type);
    for (const tabLink of tabLinks) {
        tabLink.className = tabLink.className.replace(" active", "");
    }
}

// room or furniture mode
document.getElementById("floorplanButton")!.addEventListener("click", changeToFloorplanMode);
document.getElementById("roomButton")!.addEventListener("click", changeToRoomMode);
document.getElementById("furnitureButton")!.addEventListener("click", changeToFurnitureMode);
document.getElementById("presentationButton")!.addEventListener("click", changeToPresentationMode);

function clickFloorplan() { document.getElementById("floorplanButton")!.click(); }
function clickRoom() { document.getElementById("roomButton")!.click(); }
function clickFurniture() { document.getElementById("furnitureButton")!.click(); }
function clickDisplay() { document.getElementById("presentationButton")!.click(); }

function changeMode(e: MouseEvent, mode: Mode) {
    resetElements("mode");

    settings.mode = mode;

    switch (mode) {
        case Mode.Floorplan: {
            document.getElementById("floorplanTab")!.style.display = "block";
            break;
        }
        case Mode.Room: {
            document.getElementById("roomTab")!.style.display = "block";
            break;
        }
        case Mode.Furniture: {
            document.getElementById("furnitureTab")!.style.display = "block";
            break;
        }
        case Mode.Presentation: {
            document.getElementById("presentationTab")!.style.display = "block";
            break;
        }
    }
    (e.currentTarget as HTMLButtonElement).className += " active";

    drawMain();
}

function changeToFloorplanMode(e: MouseEvent) { changeMode(e, Mode.Floorplan); }
function changeToRoomMode(e: MouseEvent) { changeMode(e, Mode.Room); }
function changeToFurnitureMode(e: MouseEvent) { changeMode(e, Mode.Furniture); }
function changeToPresentationMode(e: MouseEvent) { changeMode(e, Mode.Presentation); }

// openable type tabs

document.getElementById("leftOpenableButton")!.addEventListener("click", changeToLeftOpenableType);
document.getElementById("rightOpenableButton")!.addEventListener("click", changeToRightOpenableType);
document.getElementById("doubleOpenableButton")!.addEventListener("click", changeToDoubleOpenableType);

function changeOpenableType(e: MouseEvent, type: OpenableType) {
    resetElements("openableType");

    settings.openableType = type;

    (e.currentTarget as HTMLButtonElement).className += " active";

    drawMain();
}

function changeToLeftOpenableType(e: MouseEvent) { changeOpenableType(e, OpenableType.Left); }
function changeToRightOpenableType(e: MouseEvent) { changeOpenableType(e, OpenableType.Right); }
function changeToDoubleOpenableType(e: MouseEvent) { changeOpenableType(e, OpenableType.Double); }

// furniture type tabs

document.getElementById("rectangleButton")!.addEventListener("click", changeToRectangleType);
document.getElementById("circleButton")!.addEventListener("click", changeToCircleType);
document.getElementById("LButton")!.addEventListener("click", changeToLType);
document.getElementById("UButton")!.addEventListener("click", changeToUType);

function changeFurnitureType(e: MouseEvent, type: FurnitureType) {
    resetElements("furnitureType");

    settings.type = type;

    switch (type) {
        case FurnitureType.Rectangle:
            document.getElementById("rectangleTab")!.style.display = "contents";
            break;
        case FurnitureType.Circle:
            document.getElementById("circleTab")!.style.display = "contents";
            break;
        case FurnitureType.L:
            document.getElementById("LTab")!.style.display = "contents";
            break;
        case FurnitureType.U:
            document.getElementById("UTab")!.style.display = "contents";
            break;
    }

    (e.currentTarget as HTMLBRElement).className += " active";

    drawMain();
}

function changeToRectangleType(e: MouseEvent) { changeFurnitureType(e, FurnitureType.Rectangle); }
function changeToCircleType(e: MouseEvent) { changeFurnitureType(e, FurnitureType.Circle); }
function changeToLType(e: MouseEvent) { changeFurnitureType(e, FurnitureType.L); }
function changeToUType(e: MouseEvent) { changeFurnitureType(e, FurnitureType.U); }

function validNumericInput(...values: number[]) {
    for (const value of values) {
        if (isNaN(value) || value < 1) {
            return false;
        }
    }
    return true;
}

// Floorplan Mode

document.getElementById("distanceInput")!.addEventListener("input", (e) => {
    const dist = (e.target as HTMLInputElement).valueAsNumber;

    if (!validNumericInput(dist)) {
        alert(getText(loc.floorplan.option.inputError));
        return;
    }
    floorplanImage.distance = dist;

    drawMain();
});

document.getElementById("loadFloorplan")!.addEventListener("change", (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    const file = files?.item(0);

    if (!file) {
        return;
    }

    let img = new Image();
    img.onload = (onLoadResult) => {
        const image = onLoadResult.target as HTMLImageElement;
        floorplanImage.image = image;
        drawMain();
    };
    img.onerror = () => {
        alert(getText(loc.fileIO.errorAtFile) + " " + file.name + ".");
    };
    img.src = URL.createObjectURL(file);
});

document.getElementById("clearFloorplanButton")!.addEventListener("click", () => {
    floorplanImage.reset();

    drawMain();
});

// Room Mode

document.getElementById("addLabelButton")!.addEventListener("click", (e) => {
    e.preventDefault();
    const labelName = (document.getElementById("labelNameInput") as HTMLInputElement).value;
    const labelHeight = (document.getElementById("labelHeightInput") as HTMLInputElement).valueAsNumber;

    if (!validNumericInput(labelHeight) || !labelName) {
        alert(getText(loc.room.label.inputError));
        return;
    }
    const start = projection.to({ x: 10, y: 100 });
    setFontSize(labelHeight);
    labels.push(new Rectangle(labelName, MovableType.Rectangle, start.x, start.y, ctx.measureText(labelName).width, labelHeight));
    console.log("add Label:", labelName);
    drawMain();
});

document.getElementById("addOpenableButton")!.addEventListener("click", (e) => {
    e.preventDefault();
    const openableWidth = (document.getElementById("openableWidthInput") as HTMLInputElement).valueAsNumber;

    if (!validNumericInput(openableWidth)) {
        alert(getText(loc.room.openable.inputError));
        return;
    }

    const start = projection.to({ x: 10, y: 100 });
    openables.push(new Openable(settings.openableType, start.x, start.y, openableWidth, 180));
    console.log("add Openable:", settings.openableType);
    drawMain();
});

// Furniture Mode

document.getElementById("addFurnitureButton")!.addEventListener("click", (e) => {
    e.preventDefault();

    const furName = (document.getElementById("nameInput") as HTMLInputElement).value;

    switch (settings.type) {
        case FurnitureType.Rectangle: {
            const furWidth = (document.getElementById("widthInput") as HTMLInputElement).valueAsNumber;
            const furHeight = (document.getElementById("heightInput") as HTMLInputElement).valueAsNumber;
            if (!validNumericInput(furWidth, furHeight)) {
                alert(getText(loc.furniture.add.inputError));
                return;
            }
            const start = projection.to({ x: 10, y: 100 });
            furniture.push(new Rectangle(furName, MovableType.Rectangle, start.x, start.y, furWidth, furHeight));
            break;
        }
        case FurnitureType.Circle: {
            const circleWidth = (document.getElementById("circleWidthInput") as HTMLInputElement).valueAsNumber;
            const circleHeight = (document.getElementById("circleHeightInput") as HTMLInputElement).valueAsNumber;
            if (!validNumericInput(circleWidth, circleHeight)) {
                alert(getText(loc.furniture.add.inputError));
                return;
            }
            const start = projection.to({ x: 10, y: 100 });
            furniture.push(circleWidth === circleHeight ?
                new Circle(furName, start.x + circleWidth / 2, start.y + circleWidth / 2, circleWidth / 2) :
                new Ellipse(furName, start.x + circleWidth / 2, start.y + circleHeight / 2, circleWidth / 2, circleHeight / 2));
            break;
        }
        case FurnitureType.L: {
            const LWidth1 = (document.getElementById("LWidthInput1") as HTMLInputElement).valueAsNumber;
            const LHeight1 = (document.getElementById("LHeightInput1") as HTMLInputElement).valueAsNumber;

            const LWidth2 = (document.getElementById("LWidthInput2") as HTMLInputElement).valueAsNumber;
            const LHeight2 = (document.getElementById("LHeightInput2") as HTMLInputElement).valueAsNumber;
            if (!validNumericInput(LWidth1, LHeight1, LWidth2, LHeight2)) {
                alert(getText(loc.furniture.add.inputError));
                return;
            }
            const start = projection.to({ x: 10, y: 100 });
            let newRect = new Rectangle(furName, MovableType.L, start.x, start.y, LWidth1, LHeight1);
            newRect.dims.push({ w: LWidth2, h: LHeight2 });
            furniture.push(newRect);
            break;
        }
        case FurnitureType.U: {
            const UWidth1 = (document.getElementById("UWidthInput1") as HTMLInputElement).valueAsNumber;
            const UHeight1 = (document.getElementById("UHeightInput1") as HTMLInputElement).valueAsNumber;

            const UWidth2 = (document.getElementById("UWidthInput2") as HTMLInputElement).valueAsNumber;
            const UHeight2 = (document.getElementById("UHeightInput2") as HTMLInputElement).valueAsNumber;

            const UWidth3 = (document.getElementById("UWidthInput3") as HTMLInputElement).valueAsNumber;
            const UHeight3 = (document.getElementById("UHeightInput3") as HTMLInputElement).valueAsNumber;

            if (!validNumericInput(UWidth1, UHeight1, UWidth2, UHeight2, UWidth3, UHeight3)) {
                alert(getText(loc.furniture.add.inputError));
                return;
            }
            const start = projection.to({ x: 10, y: 100 });
            let newRect = new Rectangle(furName, MovableType.U, start.x, start.y, UWidth1, UHeight1);
            newRect.dims.push({ w: UWidth2, h: UHeight2 });
            newRect.dims.push({ w: UWidth3, h: UHeight3 });
            furniture.push(newRect);
            break;
        }
    }

    console.log("add %s: %s", settings.type, furName);
    drawMain();
});

window.addEventListener("beforeunload", (e) => {
    if (state !== createState()) {
        e.preventDefault();
        return (e.returnValue = "");
    }
    return true;
});

document.getElementById("edgeLabelCheckbox")!.addEventListener("change", (e) => {
    settings.showEdgeLabels = (e.target as HTMLInputElement).checked;

    drawMain();
});
