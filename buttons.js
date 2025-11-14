var count = 3;
var count2 = 4;

function addMove() {
    element = document.getElementById("canvas");
    //console.log('Element: '+element);
    document.getElementById("canvas")
                .innerHTML +=
                `<div class="move" id="Moveable`+count+`">
                     <img src="./images/horse.jpg" id="Moveable`+count2+ `"> 
            </div>`;
    yip()
    count = count + 2;
    count2 = count + 2;
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