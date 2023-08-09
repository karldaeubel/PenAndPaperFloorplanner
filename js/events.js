// room or furniture mode

document.getElementById("roomButton").addEventListener("click", changeToRoomMode);
document.getElementById("furnitureButton").addEventListener("click", changeToFurnitureMode);

function changeMode(e, mode) {
    const tabContent = document.getElementsByClassName("tabContent mode");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    const tabLinks = document.getElementsByClassName("tabLinks mode");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    settings.mode = mode;

    document.getElementById(mode === Mode.Room ? "roomTab" : "furnitureTab").style.display = "block";
    e.currentTarget.className += " active";

    drawMain();
}

function changeToRoomMode(e) {
    changeMode(e, Mode.Room);
}

function changeToFurnitureMode(e) {
    changeMode(e, Mode.Furniture);
}

// openable type tabs

document.getElementById("leftOpenableButton").addEventListener("click", changeToLeftOpenableType);
document.getElementById("rightOpenableButton").addEventListener("click", changeToRightOpenableType);
document.getElementById("doubleOpenableButton").addEventListener("click", changeToDoubleOpenableType);

function changeOpenableType(e, type) {
    const tabContent = document.getElementsByClassName("tabContent openableType");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    const tabLinks = document.getElementsByClassName("tabLinks openableType");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    settings.openableType = type;

    e.currentTarget.className += " active";

    drawMain();
}

function changeToLeftOpenableType(e) { changeOpenableType(e, OpenableType.Left); }
function changeToRightOpenableType(e) { changeOpenableType(e, OpenableType.Right); }
function changeToDoubleOpenableType(e) { changeOpenableType(e, OpenableType.Double); }

// furniture type tabs

document.getElementById("rectangleButton").addEventListener("click", changeToRectangleType);
document.getElementById("circleButton").addEventListener("click", changeToCircleType);
document.getElementById("LButton").addEventListener("click", changeToLType);
document.getElementById("UButton").addEventListener("click", changeToUType);

function changeFurnitureType(e, type) {
    const tabContent = document.getElementsByClassName("tabContent furnitureType");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    const tabLinks = document.getElementsByClassName("tabLinks furnitureType");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    settings.type = type;

    switch (type) {
        case FurnitureType.Rectangle:
            document.getElementById("rectangleTab").style.display = "contents";
            break;
        case FurnitureType.Circle:
            document.getElementById("circleTab").style.display = "contents";
            break;
        case FurnitureType.L:
            document.getElementById("LTab").style.display = "contents";
            break;
        case FurnitureType.U:
            document.getElementById("UTab").style.display = "contents";
            break;
    }

    e.currentTarget.className += " active";

    drawMain();
}

function changeToRectangleType(e) { changeFurnitureType(e, FurnitureType.Rectangle); }
function changeToCircleType(e) { changeFurnitureType(e, FurnitureType.Circle); }
function changeToLType(e) { changeFurnitureType(e, FurnitureType.L); }
function changeToUType(e) { changeFurnitureType(e, FurnitureType.U); }

function validNumericInput(...values) {
    for (const value of values) {
        if (isNaN(value) || value < 1) {
            return false;
        }
    }
    return true;
}

// Room Mode

document.getElementById("addLabelButton").addEventListener("click", (e) => {
    e.preventDefault();
    const labelName = document.getElementById("labelNameInput").value;
    const labelHeight = document.getElementById("labelHeightInput").valueAsNumber;

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

document.getElementById("addOpenableButton").addEventListener("click", (e) => {
    e.preventDefault();
    const openableWidth = document.getElementById("openableWidthInput").valueAsNumber;

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

document.getElementById("addFurnitureButton").addEventListener("click", (e) => {
    e.preventDefault();

    const furName = document.getElementById("nameInput").value;

    switch (settings.type) {
        case FurnitureType.Rectangle: {
            const furWidth = document.getElementById("widthInput").valueAsNumber;
            const furHeight = document.getElementById("heightInput").valueAsNumber;
            if (!validNumericInput(furWidth, furHeight)) {
                alert(getText(loc.furniture.add.inputError));
                return;
            }
            const start = projection.to({ x: 10, y: 100 });
            furniture.push(new Rectangle(furName, MovableType.Rectangle, start.x, start.y, furWidth, furHeight));
            break;
        }
        case FurnitureType.Circle: {
            const circleWidth = document.getElementById("circleWidthInput").valueAsNumber;
            const circleHeight = document.getElementById("circleHeightInput").valueAsNumber;
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
            const LWidth1 = document.getElementById("LWidthInput1").valueAsNumber;
            const LHeight1 = document.getElementById("LHeightInput1").valueAsNumber;

            const LWidth2 = document.getElementById("LWidthInput2").valueAsNumber;
            const LHeight2 = document.getElementById("LHeightInput2").valueAsNumber;
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
            const UWidth1 = document.getElementById("UWidthInput1").valueAsNumber;
            const UHeight1 = document.getElementById("UHeightInput1").valueAsNumber;

            const UWidth2 = document.getElementById("UWidthInput2").valueAsNumber;
            const UHeight2 = document.getElementById("UHeightInput2").valueAsNumber;

            const UWidth3 = document.getElementById("UWidthInput3").valueAsNumber;
            const UHeight3 = document.getElementById("UHeightInput3").valueAsNumber;

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
    console.log(state);
    if (state !== createState()) {
        e.preventDefault();
        return (e.returnValue = "");
    }
});
