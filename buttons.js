let count = 1;
let removeMode = false;
let activeElement = null;

const buttons = document.getElementsByClassName("button");
const removeBtn = document.getElementById("rm");
const clearBtn = document.getElementById("cl");
const canvas = document.getElementById("canvas");
const drawing = document.getElementById("draw");
const ctx = drawing.getContext("2d");

const BUTTON_ANIMATION_STYLING = ['h-[165px]', 'w-[220px]'];
const REMOVE_IMAGE_BUTTON_ANIMATION = ['bg-red-600', 'text-white', 'duration-100', 'east-in-out', 'transition-all'];
caches.open('my-app-cache').then((cache) => {
    cache.add('/index.html')
        .then(() => console.log('main.css added to cache'))
        .catch((err) => console.error('Failed to add item:', err));
});

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
        removeBtn.setAttribute('aria-pressed', 'true');
        removeBtn.textContent = 'Remove Image (Active)';
        // Show visual feedback
        canvas.style.borderColor = '#EF4444';
        canvas.style.backgroundColor = '#FEE2E2';
    } else {
        removeBtn.classList.remove(...REMOVE_IMAGE_BUTTON_ANIMATION);
        removeBtn.setAttribute('aria-pressed', 'false');
        removeBtn.textContent = 'Remove Image';
        canvas.style.borderColor = '';
        canvas.style.backgroundColor = '';
    }
    updateAllImageBehaviors();
}

function addImageToCanvas(button) {
    if (button.id!="buttoncustom") {
        const bgImage = button.children[0].src;
        var imageUrl = bgImage;
    }
    const moveDiv = document.createElement('div');
    moveDiv.className = 'move';
    moveDiv.id = `Moveable${count}`;
    moveDiv.setAttribute('role', 'button');
    moveDiv.setAttribute('aria-label', 'Draggable image - click and drag to move, or click remove button to delete');

    const canvasRect = canvas.getBoundingClientRect();
    moveDiv.style.left = `${canvasRect.width / 2 - 100}px`;
    moveDiv.style.top = `${canvasRect.height / 2 - 75}px`;

    const soundBtn = document.createElement('button');
    soundBtn.className = 'sound';
    soundBtn.id = `sound${count}`;
    soundBtn.setAttribute('aria-label', 'Click to hear this item name');
    soundBtn.style.backgroundImage = 'url(./images/sound.png)';
    soundBtn.style.backgroundSize = 'contain';
    soundBtn.style.backgroundRepeat = 'no-repeat';
    
    if (button.id!="buttoncustom") {
        soundBtn.setAttribute('data-image-url', imageUrl);
        const objectImg = document.createElement('img');
        objectImg.src = imageUrl;
        objectImg.style.width = '100%';
        objectImg.style.height = '100%';
        objectImg.style.borderRadius = '8px';
        objectImg.style.objectFit = 'contain';
        moveDiv.appendChild(objectImg);
    }
    if (button.id==="buttoncustom"){
        const textfield = document.createElement('textarea');
        textfield.className = 'customtext';
        textfield.id = 'textinp';
        textfield.type = 'text';
        textfield.name = 'custom';
        textfield.setAttribute('aria-label', 'Custom text input - type your message here');
        textfield.style.height = '130px';
        textfield.style.width = '180px';
        textfield.style.textAlign = 'center';
        textfield.style.fontSize = '24px';
        textfield.style.padding = '8px';
        moveDiv.appendChild(textfield);
    }
    if (button.id!="buttoncustom"){
        moveDiv.appendChild(soundBtn);
    }
    moveDiv.style.touchAction = "none";
    canvas.appendChild(moveDiv);

    setupImageBehavior(moveDiv);

    count++;
}

function setupImageBehavior(element) {
    element.onpointerdown = null;
    element.touchAction = null;
    if (removeMode) {
        element.classList.remove('drag-mode');
        element.classList.add('remove-mode');
        element.style.cursor = 'pointer';
        element.setAttribute('aria-label', 'Click to remove this image');
        element.onpointerdown = (e) => {
            if (!e.target.classList.contains('sound')) {
                e.preventDefault();
                element.remove();
            }
        };
    } else {
        element.classList.remove('remove-mode');
        element.classList.add('drag-mode');
        element.style.cursor = 'grab';
        element.setAttribute('aria-label', 'Draggable image - click and drag to move');
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
    element.style.cursor = 'grabbing';
    element.style.zIndex = '1000';

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
        element.style.cursor = 'grab';
        element.style.zIndex = '';

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
        dropdown[i].addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            var dropdownContent = this.nextElementSibling;
            
            // Close all other dropdowns
            const allContent = document.querySelectorAll('.dropdown-content');
            allContent.forEach(content => {
                if (content !== dropdownContent) {
                    content.classList.remove('show');
                }
            });
            
            // Toggle this dropdown
            dropdownContent.classList.toggle('show');
            
            // Update aria-expanded
            const isOpen = dropdownContent.classList.contains('show');
            this.setAttribute('aria-expanded', isOpen);
        });
        
        // Add keyboard support
        dropdown[i].setAttribute('role', 'button');
        dropdown[i].setAttribute('tabindex', '0');
        dropdown[i].addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
}