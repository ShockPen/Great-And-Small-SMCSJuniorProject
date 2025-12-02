var count = 3;
var count2 = 4;
var canRemove = false;

const buttons = document.getElementsByClassName("button");
const rem = document.getElementById("rm");
const clear = document.getElementById("cl");
clear.addEventListener("click", function() {
    let btns = document.querySelectorAll('.move')
    for (let b of btns) {
        b.remove();
    }
});
rem.addEventListener("click", function() {
    if (!canRemove){
    canRemove = true;
    rem.style.backgroundColor = "rgb(255, 92, 92)";
    rem.style.color = "white";
    rem.textContent = "Removing on";
    unyip();
    }else{
        canRemove = false;
        rem.style.backgroundColor = "white";
        rem.style.color = "rgb(255, 92, 92)";
        rem.textContent = "Remove image";
        yip();
    }
});

for(let but of buttons){
    but.addEventListener('click', addMove)
}

function addMove(e) {
    element = document.getElementById("canvas");
    console.log(window.getComputedStyle(event.target).backgroundImage);
    let image = window.getComputedStyle(event.target).backgroundImage.slice(4, -1);
    
    document.getElementById("canvas")
                .innerHTML +=
                `<div class="move" id="Moveable`+count+`">
                     <img src= ${image} id="Moveable`+count2+`">
                     <button class="sound" id="sound`+count+`"></button> 
            </div>`;
    yip()
    count = count + 2;
    count2 = count + 2;
   
    console.log(element.getElementsByTagName('img'))
}

function yip(){
    let btns = document.querySelectorAll('.move') ;
    
    for (let b of btns) {
        let theBtn = /** @type {HTMLButtonElement} */ (b);

        theBtn.onmousedown = (e) => {
            e.preventDefault();
            let offsetX = e.offsetX;
            let offsetY = e.offsetY;
            window.addEventListener('mousemove', function _ref(e){
                e.preventDefault();
                function clamp(x, xMin, xMax) {
                    if (x < xMin)
                        return xMin;
                    if (x > xMax) {
                        return xMax;
                    }
                    return x;
                }
                let cv =  /** @type {HTMLDivElement} */ (document.querySelector('.canvas'))
                let domRect = cv.getBoundingClientRect();
                let newPositionX = e.clientX - offsetX; 
                let newPositionY = e.clientY - offsetY; 
                theBtn.style.top = `${clamp(newPositionY, domRect.top, domRect.bottom-(Math.abs(b.getBoundingClientRect().top-b.getBoundingClientRect().bottom)))}px`;
                theBtn.style.left = `${clamp(newPositionX, domRect.left, domRect.right-(Math.abs(b.getBoundingClientRect().left-b.getBoundingClientRect().right)))}px`;
                window.addEventListener('mouseup', (e)=>{
                    this.window.removeEventListener('mousemove', _ref);
                    
                })
            })
        }
    }
}

function unyip() {
    if (canRemove){
        let btns = document.querySelectorAll('.move') ;
    
    for (let b of btns) {
        let theBtn = /** @type {HTMLButtonElement} */ (b);

        theBtn.onmousedown = (e) => {
            e.preventDefault();
            theBtn.remove();
        }
    }
}
}
