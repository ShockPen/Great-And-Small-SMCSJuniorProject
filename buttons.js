let count = 1;
let removeMode = false;
let drawMode = true; // Default to drawing mode active
let activeElement = null;

// Drawing & Canvas setup
const clearBtn = document.getElementById("cl");
const removeBtn = document.getElementById("rm");
const drawBtn = document.getElementById("drawset");
const activeToolBadge = document.getElementById("activeToolBadge");
const canvas = document.getElementById("canvas");
const drawing = document.getElementById("draw");
const ctx = drawing.getContext("2d");
const toolCursor = document.getElementById("toolCursor");

let isDrawing = false;
let lineWidth = 3;
let strokeColor = "#000000";

// Color Picker Controls
const sliderR = document.getElementById("sliderR");
const sliderG = document.getElementById("sliderG");
const sliderB = document.getElementById("sliderB");
const valR = document.getElementById("valR");
const valG = document.getElementById("valG");
const valB = document.getElementById("valB");
const colorPreviewHex = document.getElementById("colorPreviewHex");
const lineWidthSlider = document.getElementById("lineWidthSlider");
const sizeLabel = document.getElementById("sizeLabel");
const brushPreview = document.getElementById("brushPreview");
const presetColors = document.querySelectorAll(".preset-color");

// Custom Card Modal Elements
const uploadCardBtn = document.getElementById("uploadCardBtn");
const customCardModal = document.getElementById("customCardModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelCardBtn = document.getElementById("cancelCardBtn");
const saveCardBtn = document.getElementById("saveCardBtn");
const cardImageInput = document.getElementById("cardImageInput");
const cardNameInput = document.getElementById("cardNameInput");
const cardAudioInput = document.getElementById("cardAudioInput");
const cropArea = document.getElementById("cropArea");
const cropCanvas = document.getElementById("cropCanvas");
const cropCtx = cropCanvas.getContext("2d");
const cropZoomLevelText = document.getElementById("cropZoomLevelText");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const resetCropBtn = document.getElementById("resetCropBtn");
const libraryMenu = document.getElementById("libraryMenu");
const customCategoryGroup = document.getElementById("customCategoryGroup");
const noCustomText = document.getElementById("noCustomText");

let rawUploadedImage = null;
let cropZoom = 1;
let cropPanX = 0;
let cropPanY = 0;
let isCroppingDrag = false;
let startCropDragX = 0;
let startCropDragY = 0;
let customCardsStorage = [];

init();

async function init() {
    renderBuiltInCardLibrary();
    await loadSavedCustomCards();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    clearBtn.addEventListener("click", clearAll);
    removeBtn.addEventListener("click", toggleEraserMode);
    drawBtn.addEventListener("click", toggleDrawMode);

    setupDrawingEvents();
    setupColorPicker();
    setupToolCursorOverlay();
    setupCustomCardModal();
    PecsLibrary.setupProfileControls({ onImported: reloadCustomCardLibrary });
    handledropdown();
    attachInitialCardListeners();

    updateToolUI();
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    drawing.width = rect.width;
    drawing.height = rect.height;
    ctx.imageSmoothingEnabled = true;
}

function setupDrawingEvents() {
    drawing.addEventListener('pointerdown', (e) => {
        isDrawing = true;
        const rect = drawing.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });

    drawing.addEventListener('pointerup', () => {
        isDrawing = false;
        ctx.beginPath();
    });

    drawing.addEventListener('pointerleave', () => {
        isDrawing = false;
        ctx.beginPath();
        hideToolCursor();
    });

    drawing.addEventListener('pointermove', (e) => {
        updateToolCursorPosition(e);

        if (!isDrawing) return;

        const rect = drawing.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        if (removeMode) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = lineWidth * 4; // Eraser size multiplier
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            ctx.restore();
        } else if (drawMode) {
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = lineWidth;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = strokeColor;
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            ctx.restore();
        }
    });
}

function setupToolCursorOverlay() {
    drawing.addEventListener('pointerenter', (e) => {
        updateToolCursorPosition(e);
        toolCursor.style.display = 'block';
    });

    drawing.addEventListener('pointermove', (e) => {
        updateToolCursorPosition(e);
    });

    drawing.addEventListener('pointerleave', hideToolCursor);
}

function updateToolCursorPosition(e) {
    if (!toolCursor) return;
    if (!drawMode && !removeMode) {
        toolCursor.style.display = 'none';
        return;
    }
    toolCursor.style.display = 'block';
    toolCursor.style.left = `${e.clientX}px`;
    toolCursor.style.top = `${e.clientY}px`;

    let activeDiameter = drawMode ? lineWidth : (lineWidth * 4);
    activeDiameter = Math.max(8, activeDiameter);

    toolCursor.style.width = `${activeDiameter}px`;
    toolCursor.style.height = `${activeDiameter}px`;

    if (removeMode) {
        toolCursor.style.border = '2px dashed #ef4444';
        toolCursor.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
    } else {
        toolCursor.style.border = '2px solid rgba(255, 255, 255, 0.9)';
        toolCursor.style.backgroundColor = strokeColor;
    }
}

function hideToolCursor() {
    if (toolCursor) {
        toolCursor.style.display = 'none';
    }
}

function toggleDrawMode() {
    if (drawMode) {
        // Turn off drawing mode altogether
        drawMode = false;
    } else {
        drawMode = true;
        removeMode = false;
    }
    updateToolUI();
    updateAllImageBehaviors();
}

function toggleEraserMode() {
    if (removeMode) {
        // Turn off eraser mode altogether
        removeMode = false;
    } else {
        removeMode = true;
        drawMode = false;
    }
    updateToolUI();
    updateAllImageBehaviors();
}

function updateToolUI() {
    if (removeMode) {
        activeToolBadge.textContent = "Eraser Mode";
        activeToolBadge.className = "text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-normal";
        removeBtn.classList.add('ring-2', 'ring-red-400');
        drawBtn.classList.remove('ring-2', 'ring-blue-400');
    } else if (drawMode) {
        activeToolBadge.textContent = "Draw Mode";
        activeToolBadge.className = "text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white font-normal";
        drawBtn.classList.add('ring-2', 'ring-blue-400');
        removeBtn.classList.remove('ring-2', 'ring-red-400');
    } else {
        activeToolBadge.textContent = "Select / Drag";
        activeToolBadge.className = "text-[10px] px-2 py-0.5 rounded bg-gray-600 text-white font-normal";
        drawBtn.classList.remove('ring-2', 'ring-blue-400');
        removeBtn.classList.remove('ring-2', 'ring-red-400');
        hideToolCursor();
    }
}

function setupColorPicker() {
    function updateColorFromSliders() {
        const r = parseInt(sliderR.value);
        const g = parseInt(sliderG.value);
        const b = parseInt(sliderB.value);
        
        valR.textContent = r;
        valG.textContent = g;
        valB.textContent = b;

        const hexR = r.toString(16).padStart(2, '0');
        const hexG = g.toString(16).padStart(2, '0');
        const hexB = b.toString(16).padStart(2, '0');
        strokeColor = `#${hexR}${hexG}${hexB}`;
        
        colorPreviewHex.textContent = strokeColor.toUpperCase();
        colorPreviewHex.style.backgroundColor = strokeColor;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        colorPreviewHex.style.color = brightness > 128 ? 'black' : 'white';
        brushPreview.style.backgroundColor = strokeColor;
    }

    sliderR.addEventListener('input', updateColorFromSliders);
    sliderG.addEventListener('input', updateColorFromSliders);
    sliderB.addEventListener('input', updateColorFromSliders);

    lineWidthSlider.addEventListener('input', (e) => {
        lineWidth = parseInt(e.target.value);
        sizeLabel.textContent = `Brush Size: ${lineWidth}px`;
        brushPreview.style.width = `${Math.min(24, Math.max(6, lineWidth))}px`;
        brushPreview.style.height = `${Math.min(24, Math.max(6, lineWidth))}px`;
    });

    presetColors.forEach(btn => {
        btn.addEventListener('click', () => {
            const hex = btn.getAttribute('data-color');
            setHexColor(hex);
        });
    });

    setHexColor('#000000');
}

function setHexColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    sliderR.value = r;
    sliderG.value = g;
    sliderB.value = b;
    sliderR.dispatchEvent(new Event('input'));
}

function clearAll() {
    const images = canvas.querySelectorAll('.move');
    images.forEach(img => img.remove());
    ctx.clearRect(0, 0, drawing.width, drawing.height);
}

function attachInitialCardListeners() {
    const buttons = document.getElementsByClassName("button");
    for (let button of buttons) {
        button.onclick = (e) => {
            if (e.target.classList.contains('delete-custom-card')) return;
            addImageToCanvas(button);
        };
    }
    canvas.addEventListener('pointerdown', handleSoundButton);
}

function addImageToCanvas(button) {
    const moveDiv = document.createElement('div');
    moveDiv.className = 'move rounded-[20px] border-[3px] border-indigo-400 bg-white shadow-lg flex flex-col items-center justify-between p-1';
    moveDiv.id = `Moveable${count}`;

    const canvasRect = canvas.getBoundingClientRect();
    moveDiv.style.left = `${canvasRect.width / 2 - 100}px`;
    moveDiv.style.top = `${canvasRect.height / 2 - 75}px`;

    if (button.id === "buttoncustom") {
        moveDiv.classList.add('resizable-note');
        moveDiv.style.height = '150px';
        moveDiv.style.width = '200px';

        const textfield = document.createElement('textarea');
        textfield.className = 'customtext w-full h-full p-2 rounded text-black font-semibold text-center border-none focus:outline-none bg-yellow-50 resize-none';
        textfield.placeholder = 'Type custom card note...';
        moveDiv.appendChild(textfield);
    } else {
        const img = button.querySelector('img');
        const customAudio = button.getAttribute('data-custom-audio');
        const customName = button.getAttribute('data-custom-name');
        
        const imageUrl = img ? img.src : '';

        const objectImg = document.createElement('img');
        objectImg.src = imageUrl;
        objectImg.classList = "w-full h-[115px] object-contain bg-white/50 rounded-[14px]";
        moveDiv.appendChild(objectImg);

        if (customName) {
            const labelSpan = document.createElement('span');
            labelSpan.className = "text-xs font-bold text-gray-800 tracking-tight truncate w-full text-center px-1";
            labelSpan.textContent = customName;
            moveDiv.appendChild(labelSpan);
        }

        const soundBtn = document.createElement('button');
        soundBtn.className = 'sound';
        soundBtn.id = `sound${count}`;
        soundBtn.style.backgroundImage = 'url(./images/sound.png)';
        soundBtn.setAttribute('data-image-url', imageUrl);
        if (customAudio) {
            soundBtn.setAttribute('data-custom-audio', customAudio);
        }
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
    if (e.target.classList.contains('sound') || e.target.classList.contains('customtext')) {
        return;
    }

    e.preventDefault();
    element.setPointerCapture(e.pointerId);
    activeElement = element;

    const rect = element.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

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

        try {
            element.releasePointerCapture(e.pointerId);
        } catch(err) {}

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

    const customAudio = e.target.getAttribute('data-custom-audio');
    if (customAudio) {
        const audio = new Audio(customAudio);
        audio.play().catch(err => {
            console.log('Audio playback failed, falling back to TTS:', err);
            speakCardName(e.target);
        });
        return;
    }

    const imageUrl = e.target.getAttribute('data-image-url');
    if (!imageUrl) return;

    const filename = imageUrl.split('/').pop().replace(/\.[^.]+$/, '');
    const audioPath = `./audio/${filename}.mp3`;

    const audio = new Audio(audioPath);
    audio.play().catch(err => {
        console.log('Standard audio missing/failed, using SpeechSynthesis TTS:', err);
        speakCardName(e.target);
    });
}

function speakCardName(soundBtn) {
    const parentCard = soundBtn.closest('.move');
    if (!parentCard) return;

    let textToSpeak = soundBtn.getAttribute('data-custom-name') || '';
    if (!textToSpeak) {
        const labelSpan = parentCard.querySelector('span');
        if (labelSpan) {
            textToSpeak = labelSpan.textContent;
        } else {
            const imageUrl = soundBtn.getAttribute('data-image-url');
            if (imageUrl) {
                textToSpeak = imageUrl.split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
            }
        }
    }

    if (textToSpeak && ('speechSynthesis' in window)) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    }
}

function handledropdown() {
    const dropdowns = document.getElementsByClassName("dropdown");
    for (let i = 0; i < dropdowns.length; i++) {
        dropdowns[i].onclick = function() {
            const dropdownContent = this.nextElementSibling;
            if (dropdownContent.style.display === "flex") {
                dropdownContent.style.display = "none";
            } else {
                dropdownContent.style.display = "flex";
            }
        };
    }
}

// Custom Card Modal & Image Crop Logic
function setupCustomCardModal() {
    uploadCardBtn.addEventListener('click', () => {
        customCardModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', hideModal);
    cancelCardBtn.addEventListener('click', hideModal);

    cardImageInput.addEventListener('change', handleImageUpload);
    saveCardBtn.addEventListener('click', saveCustomCard);

    // Zoom Buttons (Unrestricted / Infinite zoom)
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            cropZoom *= 1.2;
            renderCropPreview();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            cropZoom = Math.max(0.01, cropZoom / 1.2);
            renderCropPreview();
        });
    }

    // Reset crop button event
    if (resetCropBtn) {
        resetCropBtn.addEventListener('click', resetCropState);
    }

    // Canvas Pointer Events for Dragging Image Crop
    if (cropCanvas) {
        cropCanvas.addEventListener('pointerdown', (e) => {
            if (!rawUploadedImage) return;
            isCroppingDrag = true;
            cropCanvas.setPointerCapture(e.pointerId);
            startCropDragX = e.clientX - cropPanX;
            startCropDragY = e.clientY - cropPanY;
        });

        cropCanvas.addEventListener('pointermove', (e) => {
            if (!isCroppingDrag) return;
            cropPanX = e.clientX - startCropDragX;
            cropPanY = e.clientY - startCropDragY;
            renderCropPreview();
        });

        const stopDrag = (e) => {
            if (isCroppingDrag) {
                isCroppingDrag = false;
                try { cropCanvas.releasePointerCapture(e.pointerId); } catch(err) {}
            }
        };

        cropCanvas.addEventListener('pointerup', stopDrag);
        cropCanvas.addEventListener('pointercancel', stopDrag);

        // Unrestricted Wheel Zoom Support on Canvas
        cropCanvas.addEventListener('wheel', (e) => {
            if (!rawUploadedImage) return;
            e.preventDefault();
            const factor = e.deltaY < 0 ? 1.15 : 0.85;
            cropZoom = Math.max(0.001, cropZoom * factor);
            renderCropPreview();
        }, { passive: false });
    }
}

function resetCropState() {
    cropZoom = 1;
    cropPanX = 0;
    cropPanY = 0;
    renderCropPreview();
}

function hideModal() {
    customCardModal.classList.add('hidden');
    cardImageInput.value = '';
    cardNameInput.value = '';
    cardAudioInput.value = '';
    cropArea.classList.add('hidden');
    rawUploadedImage = null;
    resetCropState();
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        rawUploadedImage = new Image();
        rawUploadedImage.onload = () => {
            resetCropState();
        };
        rawUploadedImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function renderCropPreview() {
    if (!rawUploadedImage) return;

    cropCanvas.width = 240;
    cropCanvas.height = 180;

    cropCtx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
    cropCtx.fillStyle = '#0f172a'; // Slate-900 background for clear card canvas boundary
    cropCtx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);

    // Update zoom indicator label if present
    if (cropZoomLevelText) {
        cropZoomLevelText.textContent = `${Math.round(cropZoom * 100)}%`;
    }

    // Initial scale to fit whole image inside 240x180 box
    const fitScale = Math.min(240 / rawUploadedImage.width, 180 / rawUploadedImage.height);
    const scaledWidth = rawUploadedImage.width * fitScale * cropZoom;
    const scaledHeight = rawUploadedImage.height * fitScale * cropZoom;

    // Centered base position + user pan offsets
    const drawX = (240 - scaledWidth) / 2 + cropPanX;
    const drawY = (180 - scaledHeight) / 2 + cropPanY;

    cropCtx.drawImage(rawUploadedImage, drawX, drawY, scaledWidth, scaledHeight);
    cropArea.classList.remove('hidden');
}

function saveCustomCard() {
    const cardName = cardNameInput.value.trim() || 'Custom Card';
    let croppedImageDataUrl = '';

    if (cropCanvas.width > 0 && !cropArea.classList.contains('hidden')) {
        croppedImageDataUrl = cropCanvas.toDataURL('image/jpeg', 0.85);
    } else {
        alert('Please upload an image for the custom card.');
        return;
    }

    const audioFile = cardAudioInput.files[0];
    if (audioFile) {
        const audioReader = new FileReader();
        audioReader.onload = (e) => {
            const audioDataUrl = e.target.result;
            createAndStoreCustomCard(cardName, croppedImageDataUrl, audioDataUrl);
        };
        audioReader.readAsDataURL(audioFile);
    } else {
        createAndStoreCustomCard(cardName, croppedImageDataUrl, null);
    }
}

async function createAndStoreCustomCard(name, imageSrc, audioSrc) {
    const cardData = {
        id: `custom_${Date.now()}`,
        name: name,
        imageSrc: imageSrc,
        audioSrc: audioSrc
    };

    try {
        customCardsStorage = await PecsLibrary.saveCustomCards(customCardsStorage.concat(cardData));
    } catch(e) {
        console.error('Failed saving custom card:', e);
        alert('The card could not be saved to the active profile database.');
        return;
    }

    addCustomCardToDOM(cardData);
    hideModal();
}

async function removeCustomCard(cardId, element) {
    if (!confirm('Are you sure you want to remove this custom card?')) return;

    try {
        customCardsStorage = await PecsLibrary.saveCustomCards(
            customCardsStorage.filter(c => c.id !== cardId)
        );
    } catch(e) {
        console.error('Error updating the active profile database:', e);
        alert('The card could not be removed from the active profile database.');
        return;
    }

    element.remove();

    if (customCardsStorage.length === 0 && noCustomText) {
        noCustomText.style.display = 'block';
    }
}

function addCustomCardToDOM(cardData) {
    if (noCustomText) {
        noCustomText.style.display = 'none';
    }

    const cardBtn = document.createElement('button');
    cardBtn.className = 'button relative flex flex-col items-center p-1 bg-indigo-900/60 hover:bg-indigo-800 rounded-xl border border-indigo-500/40 w-full transition shadow group';
    cardBtn.setAttribute('data-custom-name', cardData.name);
    cardBtn.setAttribute('data-card-id', cardData.id);
    if (cardData.audioSrc) {
        cardBtn.setAttribute('data-custom-audio', cardData.audioSrc);
    }

    const img = document.createElement('img');
    img.src = cardData.imageSrc;
    img.className = "rounded-[12px] w-[200px] h-[125px] object-contain bg-black/20";

    const label = document.createElement('span');
    label.className = "text-xs font-bold text-white mt-1 truncate w-[190px] text-center";
    label.textContent = cardData.name;

    // Delete custom card trash icon button
    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'delete-custom-card absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md cursor-pointer transition transform hover:scale-110';
    deleteBtn.title = 'Remove custom card';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeCustomCard(cardData.id, cardBtn);
    };

    cardBtn.appendChild(img);
    cardBtn.appendChild(label);
    cardBtn.appendChild(deleteBtn);

    cardBtn.onclick = (e) => {
        if (e.target.classList.contains('delete-custom-card')) return;
        addImageToCanvas(cardBtn);
    };

    customCategoryGroup.appendChild(cardBtn);
}

async function loadSavedCustomCards() {
    await reloadCustomCardLibrary();
}

async function reloadCustomCardLibrary() {
    customCardsStorage = await PecsLibrary.getCustomCards();
    customCategoryGroup.replaceChildren(noCustomText);
    noCustomText.style.display = customCardsStorage.length > 0 ? 'none' : 'block';
    customCardsStorage.forEach(card => addCustomCardToDOM(card));
}

function renderBuiltInCardLibrary() {
    const textNoteButton = document.getElementById("buttoncustom");
    let oldGroup = customCategoryGroup.nextElementSibling;
    while (oldGroup && oldGroup !== textNoteButton) {
        const nextGroup = oldGroup.nextElementSibling;
        oldGroup.remove();
        oldGroup = nextGroup;
    }

    PecsLibrary.categories
        .filter(category => category !== "Custom Cards")
        .forEach(category => {
            const dropdown = document.createElement("button");
            dropdown.className = "dropdown justify-between items-center bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg text-sm shadow";

            const title = document.createElement("span");
            title.textContent = category;
            const arrow = document.createElement("span");
            arrow.className = "text-xs";
            arrow.textContent = "▼";
            dropdown.append(title, arrow);

            const group = document.createElement("div");
            group.className = "dropdown-content gap-2 w-full pt-1";
            PecsLibrary.builtInCards
                .filter(card => card.category === category)
                .forEach(card => {
                    const cardButton = document.createElement("button");
                    cardButton.className = "button";
                    cardButton.setAttribute("data-custom-name", card.name);

                    const image = document.createElement("img");
                    image.src = card.image;
                    image.alt = card.name;
                    image.className = "rounded-[15px] w-[200px] h-[130px] object-contain bg-black/20 shadow border border-blue-400/30";
                    cardButton.appendChild(image);
                    group.appendChild(cardButton);
                });

            libraryMenu.insertBefore(dropdown, textNoteButton);
            libraryMenu.insertBefore(group, textNoteButton);
        });
}
