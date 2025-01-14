const openButton = document.getElementById("openWindow");
const myWindow = document.getElementById("myWindow");
const textInput = document.getElementById("vertical_textInput");

let isDragging = false;
let offsetX, offsetY;

// console.log("openButton", openButton);
openButton.addEventListener("click", function () {
  const selectedObject = canvas.getActiveObject();
  if (selectedObject && selectedObject.type === "verticalText") {
    textInput.value = selectedObject._objects.map((obj) => obj.text).join("");
  } else {
    textInput.value = "";
  }

  myWindow.style.display = "block";
});

function closeWindow() {
  myWindow.style.display = "none";
}

const header = myWindow.querySelector(".header");
header.addEventListener("mousedown", function (e) {
  offsetX = e.clientX - myWindow.offsetLeft;
  offsetY = e.clientY - myWindow.offsetTop;
  isDragging = true;
});

document.addEventListener("mousemove", function (e) {
  if (isDragging) {
    myWindow.style.left = `${e.clientX - offsetX}px`;
    myWindow.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener("mouseup", function () {
  isDragging = false;
});


fabric.VerticalText = fabric.util.createClass(fabric.Group, {
  type: 'verticalText',

  initialize: function(elements, options) {
    this.callSuper('initialize', elements, options);
  },

  toObject: function() {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      type: 'verticalText'
    });
  },

  setGradientFill: function(gradient) {
    this.getObjects().forEach(function(obj) {
      obj.set('fill', gradient);
    });
  }
});


fabric.VerticalText.fromObject = function(object, callback) {
  fabric.util.enlivenObjects(object.objects, function(enlivenedObjects) {
    delete object.objects;
    callback(new fabric.VerticalText(enlivenedObjects, object));
  });
};

fabric.Object.prototype.verticalText = fabric.VerticalText;



let textGroup;
function createVerticalText(textString, options) {
  var selectedFont = document.getElementById('fontSelector').value;
  const ignoreRegex = /[･･･…ー（）｛｝「」(){}『』【】[\]]/;
  // move a little to the right
  const reverceRegex = /[、。，A-Za-z0-9!"#$%&'()=~{`+*}_?><]/;

  const chars = textString.split("");
  const groupItems = [];
  let offsetX = options.left || 0;
  let offsetY = options.top || 0;
  const lineHeight = options.fontSize * 1.2;

  isUndoRedoOperation = true;
  chars.forEach((char, index) => {
    const isIgnored = ignoreRegex.test(char);
    const isReverce = reverceRegex.test(char);
    const text = new fabric.Text(char, {
      left: offsetX,
      top: offsetY,
      fontSize: options.fontSize,
      originX: isIgnored ? "right" : "left",
      originY: "bottom",
      fill: options.color,
      fontFamily: selectedFont, 
      angle: isIgnored ? 90 : 0,
      stroke: document.getElementById("textOutlineColorPicker").value,
      strokeWidth: 1,
    });

    canvas.add(text);
    const textWidth = text.width * text.scaleX;
    const actualHeight = text.height * text.scaleY;
    text.set({ top: offsetY + actualHeight });
    text.set({ left: isReverce ? offsetX + textWidth / 2 : offsetX });
    groupItems.push(text);
    canvas.remove(text);

    if (char === "\n") {
      offsetX -= lineHeight;
      offsetY = options.top || 0;
    } else {
      offsetY += actualHeight;
    }
  });
  isUndoRedoOperation = false;

  const group = new fabric.VerticalText(groupItems, {
    selectable: true,
    type: 'verticalText'
  });


  // グループレベルでコントロールの可視性を設定
  group.setControlsVisibility({
    mt: false,
    mb: false,
    ml: false,
    mr: false,
  });

  return group;
}

function updateVerticalText() {
  const textString = document.getElementById("vertical_textInput").value;
  const selectedObject = canvas.getActiveObject();

  if ( isVerticalText(selectedObject) ) {
    canvas.remove(selectedObject);

    let firstText = selectedObject.getObjects('text')[0];
    let inheritedFontSize = firstText ? firstText.fontSize : parseInt(document.getElementById('fontSizeSlider').value);
    let inheritedColor = firstText ? firstText.fill : document.getElementById("textColorPicker").value;

    console.log("selectedObject.left", selectedObject.left);
    console.log("selectedObject.top", selectedObject.top);

    const newTextGroup = createVerticalText(textString, {
      left: selectedObject.left,
      top: selectedObject.top,
      fontSize: inheritedFontSize,
      color: inheritedColor
    });
    canvas.add(newTextGroup);
  } else {
    const newTextGroup = createVerticalText(textString, {
      top: 50,
      left: 300,
      fontSize: parseInt(document.getElementById('fontSizeSlider').value),
      color: document.getElementById("textColorPicker").value
    });
    canvas.add(newTextGroup);
  }
  
  closeWindow();
}

document.getElementById("cancelButton").addEventListener("click", closeWindow);
document.getElementById("updateButton").addEventListener("click", updateVerticalText);

function openModalForEditing() {
  const selectedObject = canvas.getActiveObject();
  if (isVerticalText(selectedObject)) {
    textInput.value = selectedObject._objects.map((obj) => obj.text).join("");
    myWindow.style.display = "block";
  } else {
    textInput.value = "";
    myWindow.style.display = "block";
  }
}

canvas.on("selection:created", function () {
  const selectedObject = canvas.getActiveObject();
  if (isVerticalText(selectedObject)) {
    openModalForEditing();
  } else {
    myWindow.style.display = "none";
  }
});

canvas.on("selection:updated", function () {
  const selectedObject = canvas.getActiveObject();
  if (isVerticalText(selectedObject)) {
    openModalForEditing();
  } else {
    myWindow.style.display = "none";
  }
});

canvas.on("selection:cleared", closeWindow);
