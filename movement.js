var elemt = document.getElementsByClassName("move");
var count = 3;
//console.log(elemt);
for (elm of elemt) {
    //dragElement(elm);
    //console.log(elm);
    elm.addEventListener("mousedown", MouseDown);
}
function resetElemtArr() {
    elemt = document.getElementsByClassName("move");
    for (elm of elemt) {
    elm.addEventListener("mousedown", MouseDown);
    //console.log(elm);
}
return elemt;
}
function dragElement(elem) {
    var x1 = 0; y1 = 0; x2 = 0, y2 = 0;
    elem.onmousedown = MouseDown;
}

function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

function MouseDown(e) {
    //console.log(elmn);
    e = e || window.event;
    //console.log(e);
    e.preventDefault();
    x2 = e.clientX;
    y2 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = moveElement;
}

function moveElement(e) {
    e = e||window.event;
    e.preventDefault();
    x1 = x2 - e.clientX;
    y1 = y2 - e.clientY;
    x2 = e.clientX;
    y2 = e.clientY;
    var er = document.getElementById(e.target.id); 
    //console.log(er);
    er.style.top = Math.abs((er.offsetTop - y1)) + "px";
    er.style.left = Math.abs((er.offsetLeft - x1)) + "px";

}
function addMove() {
    resetElemtArr();
    element = document.getElementById("canvas");
    //console.log('Element: '+element);
    document.getElementById("canvas")
                .innerHTML +=
                `<div class="move" id="Moveable`+count+`">
                    Move`+count+`
            </div>`;
    resetElemtArr();
    count++;
    console.log(elemt);

}
    