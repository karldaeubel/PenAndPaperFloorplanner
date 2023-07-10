function getText(element) {
    return settings.language in element ? element[settings.language] : element.en;
}

const loc = {
    help: {
        helpButton: {
            en: "Help",
            de: "Hilfe"
        },
        findHelp: {
            en: "More Help At The Bottom Right Corner.",
            de: "Mehr Hilfe am unteren rechten Rand."
        },
        welcome: {
            en: "Welcome to the Pen And Paper Floorplanner. An easy to use 2D floorplanner webapp with no overhead or registration.",
            de: "Wilkommen zum Pen And Paper Floorplanner. Einem einfachen 2D Raumplaner ohne Schnickschnack und ohne Registrierung, direkt im Browser."
        },
        intro: {
            en: "This tool is designed to create floor plans and arrange furniture into created rooms.",
            de: "Mit Hilfe dieser Anwendung können Grundrisse erstellt und mit Möbeln eingerichtet werden."
        },
        explanation: {
            en: "There are two modes to choose from. The room mode lets you create a floor plan and the furniture mode can be used to decorate the created rooms.",
            de: "Es gibt zwei Modi zwischen denen man wählen kann. " + 
            "Zum einen der Raum-Modus: Hier können Grundrisse erstellen werden. " + 
            "Und zum anderen der Möbel-Modus: Hier können die erstellten Grundrisse eingerichtet werden."
        },
        introRoom: {
            en: "Room-Mode:",
            de: "Raum-Modus:"
        },
        explanationRoom: {
            en: "The two main elements in this mode are corners and walls. " +
            "A corner can be created with a double click and moved by clicking its center and draging the mouse. " +
            "Two corners can be merged together by placing a corner onto an existing corner. " +
            "Walls can be created between corners by clicking the outer circle of a corner. " +
            "The wall can then be connected to an existing corner or create a new corner at the current cursor location. " +
            "Corners snap to other corners that are located vertically or horizontally. " +
            "The snap distance is determined by the size of the outer circle. " +
            "The size of the center and the outer circle can be adjusted in the right menu. " +
            "Corners droped at the garbage bin at the top right corner will be removed. " +
            "In this mode it is furthermore possible to create labels to name rooms for example. Labels can be deleted if droped in the garbage bin. " +
            "It is also possible to place doors and windows, openables for short. " +
            "Openables have a width and can be of three different types, anchored left, anchored right or doubled. " +
            "They can be moved and rotated with the handle above the door/window. Openables snap to walls by placing them close to one. " +
            "The angle is then adjusted automatically. A snaped openable will move together with walls. Openables can be removed by dropping them in the garbage bin. ",
            de: "Die beiden Hauptelemente in diesem Modus sind Ecken und Wände. Eine Ecke kann durch einen Doppelklick erstellt werden. " + 
            "Eine Ecke besteht aus einem inneren und einem äußeren Kreis. " +
            "Durch einen Klick auf den inneren Kreis kann eine Ecke verschoben werden. " +
            "Wände können zwischen Ecken erstellt werden indem man auf den äußeren Kreis einer Start-Ecke klickt. " +
            "Die erstellte Wand kann anschließend mit einer existierenden End-Ecke verbunden werden oder es kann eine neune End-Ecke bei der aktuellen Maus position erstellt werden. " +
            "Ecken können automatisch anhand von anderen Ecken horizontal oder vertikal ausgerichtet werden. " +
            "Die Entfernung dieser automatischen Fixierung ist von der größe des äußeren Kreises abhängig. " +
            "Die größe der Kreise einer Ecke kann im rechten Menü eingestellt werden. " +
            "Ecken die in der Mülltonne abgelegt werden, der rote Bereich am oberen rechten Bildschirmrand, werden gelöscht. " +
            "In diesem Modus können außerdem Aufschriften erstellt werden um zum Beispiel Räume zu benennen. Eine Aufschrift kann gelöscht werden indem diese in die Mülltonne verschoben wird. " +
            "Weiterhin erlaubt dieser Modus das Erstellen von Türen und Fenstern. " +
            "Diese haben eine Breite und sind einem von drei Typen zugeordnet: Linksbündig, Rechtsbündig oder Doppelt. " +
            "Türen und Fenster können durch den Bereich darüber verschoben und rotiert werden. " +
            "Sie können an Wänden ausgerichtet werden und positionieren sich anschießend automatisch. Türen/Fenster können gelöscht werden indem diese in die Mülltonne verschoben werden. ",
        },
        introFurniture: {
            en: "Furniture-Mode:",
            de: "Möbel-Modus:"
        },
        explanationFurniture: {
            en: "In this mode furniture can be created, dragged and rotated. " +
            "Furniture can be created in the right menu by clicking the 'Add' button. There are 4 different types of furniture. " +
            "The ellipse is determined by a width and a height. The rectangle also requires width and height. The L-Shape has two block segments, both defined by width and height. The overall width is the sum of the two segment widths. The U-Shape behaves similarly but has three segments instead of two. " +
            "All types of furniture can have a name. " +
            "Furniture can be rotated by clicking the small circle within a piece of furniture. " +
            "Furniture dropped at the grabage bin at the top right corner will be removed. ",
            de: "In diesem Modus können Möbel erstellt, verschoben und rotiert werden. " +
            "Möbel können im rechten Menü erstellt werden. Es gibt 4 verschiedene Typen von Möbeln. " +
            "Die Ellipse ist durch eine Breite und eine Höhe definiert. Das Rechteck benötigt ebenfalls eine Breite und eine Höhe. Die L-Form besteht aus zwei Blöcken, die jeweils durch eine Breite und eine Höhe definiert sind. Die Gesamtbreite ergibt sich aus der Summe der einzelnen Blöcke. Die U-Form verhält sich ähnlich, hat allerdings drei Blöcke anstatt zwei. " + 
            "Möbel können einen Namen erhalten. " +
            "Möbel können rotiert werden indem man in den kleinen Kreis innerhalb jedes Möbelstücks klickt. " +
            "Möbelstücke die man in der Mülltonne ablegt, der rote Bereich am oberen rechten Bildschirmrand, werden gelöscht. "
        },
        creator: {
            en: "Created by: Karl Däubel",
            de: "Author: Karl Däubel"
        }
    },
    fileIO: {
        saveButton: {
            en: "Save",
            de: "Speichern"
        },
        loadButton: {
            en: "Load",
            de: "Laden"
        },
        errorAtFile: {
            en: "There was an error while loading file:",
            de: "Beim Lesen folgender Datei ist ein Fehler aufgetreten:"
        },
        errorMessage: {
            en: "Error Message:",
            de: "Fehlermeldung:"
        }
    },
    room: {
        category: {
            en: "Room",
            de: "Raum"
        },
        help: {
            en: "Double Click Here!",
            de: "Hier Doppelklicken!"
        },
        corner: {
            head: {
                en: "Corner Size",
                de: "Ecken Größe"
            },
            center: {
                en: "Center:",
                de: "Zentrum:"
            },
            ring: {
                en: "Ring:",
                de: "Ring:"
            }
        },
        label: {
            head: {
                en: "Label",
                de: "Beschriftung"
            },
            name: {
                en: "Name:",
                de: "Name:"
            },
            defaultName: {
                en: "Livingroom",
                de: "Wohnzimmer"
            },
            height: {
                en: "Height (mm):",
                de: "Höhe (mm):"
            },
            add: {
                en: "Add",
                de: "Hinzufügen"
            },
            inputError: {
                en: "Please input only positive numbers for height and a non empty string for the name.",
                de: "Bitte geben Sie nur positive Zahlen für die Höhe und eine nicht leere Zeichenkette für den Namen ein."
            },
        },
        openable: {
            head: {
                en: "Door/Window",
                de: "Tür/Fenster"
            },
            width: {
                en: "Width (mm):",
                de: "Breite (mm):"
            },
            type: {
                en: "Type:",
                de: "Typ:"
            },
            add: {
                en: "Add",
                de: "Hinzufügen"
            },
            inputError: {
                en: "Please input only positive numbers for width.",
                de: "Bitte geben Sie nur positive Zahlen für die Breite ein."
            },
        },
    },
    furniture: {
        category: {
            en: "Furniture",
            de: "Möbel"
        },
        help: {
            en: "Add Furniture On The Right.",
            de: "Füge Möbel rechts hinzu."
        },
        add: {
            name: {
                en: "Name:",
                de: "Name:"
            },
            type: {
                en: "Type:",
                de: "Typ:"
            },
            defaultName: {
                en: "Table",
                de: "Tisch"
            },
            width: {
                en: "Width (mm):",
                de: "Breite (mm):"
            },
            height: {
                en: "Height (mm):",
                de: "Höhe (mm):"
            },
            add: {
                en: "Add",
                de: "Hinzufügen"
            },
            inputError: {
                en: "Please input only positive numbers for width and height.",
                de: "Bitte geben Sie nur positive Zahlen für die Breite und Höhe ein."
            },
        },
    }
};