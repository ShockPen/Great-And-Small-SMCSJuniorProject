let count = 1;
let removeMode = false;
let activeElement = null;

const buttons = document.getElementsByClassName("button");
const removeBtn = document.getElementById("rm");
const clearBtn = document.getElementById("cl");
const canvas = document.getElementById("canvas");

const BUTTON_ANIMATION_STYLING = ['h-[165px]', 'w-[220px]'];
const REMOVE_IMAGE_BUTTON_ANIMATION = ['bg-red-600', 'text-white', 'duration-100', 'east-in-out', 'transition-all'];


init();

function init() {
    clearBtn.addEventListener("click", clearAll);
    removeBtn.addEventListener("click", toggleRemoveMode);

    for (let button of buttons) {
        button.addEventListener('click', () => addImageToCanvas(button));
    }

    canvas.addEventListener('pointerdown', handleSoundButton);
    handledropdown()
}

function clearAll() {
    const images = canvas.querySelectorAll('.move');
    images.forEach(img => img.remove());
}

function toggleRemoveMode() {
    removeMode = !removeMode;
    if (removeMode) {
        removeBtn.classList.add(...REMOVE_IMAGE_BUTTON_ANIMATION);
    } else {
        removeBtn.classList.remove(...REMOVE_IMAGE_BUTTON_ANIMATION);
    }
    updateAllImageBehaviors();
}

function addImageToCanvas(button) {
    const bgImage = button.children[0].src;
    const imageUrl = bgImage;

    const moveDiv = document.createElement('div');
    moveDiv.className = 'move rounded-[30px] border-[3px]';
    moveDiv.id = `Moveable${count}`;

    const canvasRect = canvas.getBoundingClientRect();
    moveDiv.style.left = `${canvasRect.width / 2 - 100}px`;
    moveDiv.style.top = `${canvasRect.height / 2 - 75}px`;

    const soundBtn = document.createElement('button');
    soundBtn.className = 'sound';
    soundBtn.id = `sound${count}`;
    soundBtn.style.backgroundImage = 'url(./images/sound.png)';
    soundBtn.setAttribute('data-image-url', imageUrl);

    const objectImg = document.createElement('img');
    objectImg.src = imageUrl;
    objectImg.classList = "justify-center bg-[rgb(53,53,240)] text-black rounded-[30px] w-[200px] h-[150px]";
    console.log(objectImg.classList)
  
    moveDiv.appendChild(objectImg);
    if (button.id==="buttoncustom"){
        const textfield = document.createElement('textarea');
        textfield.className = 'customtext';
        textfield.id = 'textinp';
        textfield.type = 'text';
        textfield.name = 'custom';
        //textfield.classList.add(['color-black-800','h-[50px]']);
        textfield.style = 'height: 100px; width: 160px; text-align: center; text-justify: center; font-size: 32px';
        moveDiv.appendChild(textfield);;
    }
    if (button.id!="buttoncustom"){
        moveDiv.appendChild(soundBtn);
    }
    canvas.appendChild(moveDiv);

    setupImageBehavior(moveDiv);

    count++;
}

function setupImageBehavior(element) {
    element.onpointerdown = null;

    if (removeMode) {
        element.classList.remove('drag-mode');
        element.classList.add('remove-mode');
        element.onpointerdown = (e) => {
            if (!e.target.classList.contains('sound')) {
                e.preventDefault();
                element.remove();
            }
        };
    } else {
        element.classList.remove('remove-mode');
        element.classList.add('drag-mode');
        element.onpointerdown = (e) => startDrag(e, element);
    }
}

function updateAllImageBehaviors() {
    const images = canvas.querySelectorAll('.move');
    images.forEach(img => setupImageBehavior(img));
}

function startDrag(e, element) {

    if (e.target.classList.contains('sound')) {
        return;
    }
    if (e.target.classList.contains('customtext')) {
        return;
    }

    e.preventDefault();

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    element.setPointerCapture(e.pointerId);
    activeElement = element;

    const rect = element.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    element.classList.add(...BUTTON_ANIMATION_STYLING);

    function onMove(e) {
        if (!activeElement) return;

        e.preventDefault();

        const canvasRect = canvas.getBoundingClientRect();
        const elemRect = element.getBoundingClientRect();

        let newX = e.clientX - offsetX - canvasRect.left;
        let newY = e.clientY - offsetY - canvasRect.top;

        newX = Math.max(0, Math.min(newX, canvasRect.width - elemRect.width));
        newY = Math.max(0, Math.min(newY, canvasRect.height - elemRect.height));

        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;

        
    }

    function onEnd(e) {
        if (!activeElement) return;

        element.releasePointerCapture(e.pointerId);

        element.classList.remove(...BUTTON_ANIMATION_STYLING);

        document.body.style.overflow = '';
        document.body.style.touchAction = '';

        element.removeEventListener('pointermove', onMove);
        element.removeEventListener('pointerup', onEnd);
        element.removeEventListener('pointercancel', onEnd);
        activeElement = null;
    }

    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerup', onEnd);
    element.addEventListener('pointercancel', onEnd);
}

function handleSoundButton(e) {
    if (!e.target.classList.contains('sound')) return;

    e.preventDefault();
    e.stopPropagation();

    const imageUrl = e.target.getAttribute('data-image-url');
    if (!imageUrl) return;

    const filename = imageUrl.split('/').pop().replace(/\.[^.]+$/, '');
    const audioPath = `./audio/${filename}.mp3`;

    const audio = new Audio(audioPath);
    audio.play().catch(err => console.log('Audio playback failed:', err));
}

function handledropdown(){
    var dropdown = document.getElementsByClassName("dropdown");
    var i;

    for (i = 0; i < dropdown.length; i++) {
    dropdown[i].addEventListener("pointerdown", function() {
        var dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === "flex") {
        dropdownContent.style.display = "none";
        } else {
        dropdownContent.style.display = "flex";
        }
    });
}

}