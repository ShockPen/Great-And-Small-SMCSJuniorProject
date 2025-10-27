
dragElement(document.getElementById("Moveable"));

function dragElement(elem) {
    var x1 = 0; y1 = 0; x2 = 0, y2 = 0;
    elem.onmousedown = MouseDown;
}

function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

function MouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    x2 = e.clientX;
    y2 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = moveElement;
}

function moveElement(e) {
    e = e || window.event;
    e.preventDefault();
    x1 = x2 - e.clientX;
    y1 = y2 - e.clientY;
    x2 = e.clientX;
    y2 = e.clientY;
    elem.style.top = (elmnt.offsetTop + y1) + "px";
    elem.style.left = (elmnt.offsetLeft + x1) + "px";
}
    
