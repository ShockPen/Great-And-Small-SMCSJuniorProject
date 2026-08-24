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
let strokeColor = "#202421";

// Simple drawing controls
const lineWidthSlider = document.getElementById("lineWidthSlider");
const sizeLabel = document.getElementById("sizeLabel");
const brushPreview = document.getElementById("brushPreview");
const presetColors = document.querySelectorAll(".preset-color");

// Custom Card Modal Elements
const uploadCardBtn = document.getElementById("uploadCardBtn");
const manageCategoriesBtn = document.getElementById("manageCategoriesBtn");
const resetDefaultsBtn = document.getElementById("resetDefaultsBtn");
const customCardModal = document.getElementById("customCardModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelCardBtn = document.getElementById("cancelCardBtn");
const saveCardBtn = document.getElementById("saveCardBtn");
const cardImageInput = document.getElementById("cardImageInput");
const cardNameInput = document.getElementById("cardNameInput");
const cardCategoryInput = document.getElementById("cardCategoryInput");
const cardAudioInput = document.getElementById("cardAudioInput");
const cropArea = document.getElementById("cropArea");
const cropCanvas = document.getElementById("cropCanvas");
const cropCtx = cropCanvas.getContext("2d");
const cropZoomLevelText = document.getElementById("cropZoomLevelText");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const resetCropBtn = document.getElementById("resetCropBtn");
const libraryMenu = document.getElementById("libraryMenu");
const textNoteButton = document.getElementById("buttoncustom");
const categoryManagerModal = document.getElementById("categoryManagerModal");
const closeCategoryManagerBtn = document.getElementById("closeCategoryManagerBtn");
const doneCategoryManagerBtn = document.getElementById("doneCategoryManagerBtn");
const newCategoryInput = document.getElementById("newCategoryInput");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const categoryManagerError = document.getElementById("categoryManagerError");
const categoryEditorList = document.getElementById("categoryEditorList");

let rawUploadedImage = null;
let cropZoom = 1;
let cropPanX = 0;
let cropPanY = 0;
let isCroppingDrag = false;
let startCropDragX = 0;
let startCropDragY = 0;
init();

async function init() {
    await reloadCardLibrary();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    clearBtn.addEventListener("click", clearAll);
    removeBtn.addEventListener("click", toggleEraserMode);
    drawBtn.addEventListener("click", toggleDrawMode);

    setupDrawingEvents();
    setupColorPicker();
    setupToolCursorOverlay();
    setupCustomCardModal();
    setupCategoryManager();
    resetDefaultsBtn.addEventListener("click", resetLibraryToDefaults);
    PecsLibrary.setupProfileControls({ onImported: reloadCardLibrary });
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
        activeToolBadge.textContent = "Erase";
        activeToolBadge.className = "status-badge";
        removeBtn.classList.add('active');
        drawBtn.classList.remove('active');
    } else if (drawMode) {
        activeToolBadge.textContent = "Draw";
        activeToolBadge.className = "status-badge";
        drawBtn.classList.add('active');
        removeBtn.classList.remove('active');
    } else {
        activeToolBadge.textContent = "Move";
        activeToolBadge.className = "status-badge";
        drawBtn.classList.remove('active');
        removeBtn.classList.remove('active');
        hideToolCursor();
    }
}

function setupColorPicker() {
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

    setHexColor('#202421');
}

function setHexColor(hex) {
    strokeColor = hex;
    brushPreview.style.backgroundColor = hex;
    presetColors.forEach(button => {
        const selected = button.getAttribute('data-color') === hex;
        button.classList.toggle('selected', selected);
        button.setAttribute('aria-pressed', String(selected));
    });
}

function clearAll() {
    const images = canvas.querySelectorAll('.move');
    images.forEach(img => img.remove());
    ctx.clearRect(0, 0, drawing.width, drawing.height);
}

function attachInitialCardListeners() {
    textNoteButton.onclick = () => addImageToCanvas(textNoteButton);
    canvas.addEventListener('pointerdown', handleSoundButton);
}

function addImageToCanvas(button) {
    const moveDiv = document.createElement('div');
    moveDiv.className = 'move rounded-lg border bg-white flex flex-col items-center justify-between p-1';
    moveDiv.id = `Moveable${count}`;

    const canvasRect = canvas.getBoundingClientRect();
    moveDiv.style.left = `${canvasRect.width / 2 - 100}px`;
    moveDiv.style.top = `${canvasRect.height / 2 - 75}px`;

    if (button.id === "buttoncustom") {
        moveDiv.classList.add('resizable-note');
        moveDiv.style.height = '150px';
        moveDiv.style.width = '200px';

        const textfield = document.createElement('textarea');
        textfield.className = 'customtext w-full h-full p-2 rounded text-black font-semibold text-center border-none focus:outline-none bg-white resize-none';
        textfield.placeholder = 'Type custom card note...';
        moveDiv.appendChild(textfield);
    } else {
        const img = button.querySelector('img');
        const cardAudio = button.getAttribute('data-card-audio');
        const cardName = button.getAttribute('data-card-name');
        
        const imageUrl = img ? img.src : '';

        const objectImg = document.createElement('img');
        objectImg.src = imageUrl;
        objectImg.classList = "w-full h-[115px] object-contain bg-white/50 rounded-[14px]";
        moveDiv.appendChild(objectImg);

        if (cardName) {
            const labelSpan = document.createElement('span');
            labelSpan.className = "text-xs font-bold text-gray-800 tracking-tight truncate w-full text-center px-1";
            labelSpan.textContent = cardName;
            moveDiv.appendChild(labelSpan);
        }

        const soundBtn = document.createElement('button');
        soundBtn.className = 'sound';
        soundBtn.id = `sound${count}`;
        soundBtn.style.backgroundImage = 'url(./images/sound.png)';
        soundBtn.setAttribute('data-card-name', cardName || '');
        if (cardAudio) soundBtn.setAttribute('data-card-audio', cardAudio);
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

    const cardAudio = e.target.getAttribute('data-card-audio');
    if (cardAudio) {
        const audio = new Audio(cardAudio);
        audio.play().catch(err => {
            console.log('Audio playback failed, falling back to TTS:', err);
            speakCardName(e.target);
        });
        return;
    }

    speakCardName(e.target);
}

function speakCardName(soundBtn) {
    const parentCard = soundBtn.closest('.move');
    if (!parentCard) return;

    let textToSpeak = soundBtn.getAttribute('data-card-name') || '';
    if (!textToSpeak) {
        const labelSpan = parentCard.querySelector('span');
        if (labelSpan) {
            textToSpeak = labelSpan.textContent;
        }
    }

    if (textToSpeak && ('speechSynthesis' in window)) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    }
}

// Custom Card Modal & Image Crop Logic
function setupCustomCardModal() {
    uploadCardBtn.addEventListener('click', async () => {
        await populateCardCategoryOptions();
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

async function populateCardCategoryOptions(preferredCategory = cardCategoryInput.value) {
    const settings = await PecsLibrary.getCategorySettings();
    cardCategoryInput.replaceChildren();
    settings.categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        cardCategoryInput.appendChild(option);
    });
    cardCategoryInput.value = settings.categories.includes(preferredCategory)
        ? preferredCategory
        : (settings.categories.includes("Custom Cards") ? "Custom Cards" : settings.categories[0]);
}

function setupCategoryManager() {
    manageCategoriesBtn.addEventListener("click", openCategoryManager);
    closeCategoryManagerBtn.addEventListener("click", hideCategoryManager);
    doneCategoryManagerBtn.addEventListener("click", hideCategoryManager);
    addCategoryBtn.addEventListener("click", addCategory);
    newCategoryInput.addEventListener("keydown", event => {
        if (event.key === "Enter") addCategory();
    });
    categoryManagerModal.addEventListener("click", event => {
        if (event.target === categoryManagerModal) hideCategoryManager();
    });
}

async function openCategoryManager() {
    categoryManagerModal.classList.remove("hidden");
    newCategoryInput.value = "";
    clearCategoryManagerError();
    await renderCategoryManager();
}

function hideCategoryManager() {
    categoryManagerModal.classList.add("hidden");
    clearCategoryManagerError();
}

function showCategoryManagerError(message) {
    categoryManagerError.textContent = message;
    categoryManagerError.classList.remove("hidden");
}

function clearCategoryManagerError() {
    categoryManagerError.textContent = "";
    categoryManagerError.classList.add("hidden");
}

async function resetLibraryToDefaults() {
    if (!window.confirm("Reset every card and category to the original defaults? Imported and custom cards will be removed.")) return;
    resetDefaultsBtn.disabled = true;
    try {
        await PecsLibrary.resetToDefaults();
        await reloadCardLibrary();
        await populateCardCategoryOptions();
        if (!categoryManagerModal.classList.contains("hidden")) await renderCategoryManager();
        window.alert("The original default cards and categories have been restored.");
    } catch (error) {
        console.error("Failed resetting the card library:", error);
        window.alert("The card library could not be reset.");
    } finally {
        resetDefaultsBtn.disabled = false;
    }
}

async function applyCategorySettings(settings) {
    try {
        settings.assignments = {};
        await PecsLibrary.saveCategorySettings(settings);
        await reloadCardLibrary();
        await populateCardCategoryOptions();
        clearCategoryManagerError();
        await renderCategoryManager();
        return true;
    } catch (error) {
        console.error("Failed saving category settings:", error);
        showCategoryManagerError("The category changes could not be saved.");
        return false;
    }
}

async function applyLibraryState(cards, settings) {
    try {
        await PecsLibrary.saveAllCards(cards);
        await PecsLibrary.saveCategorySettings(settings);
        await reloadCardLibrary();
        await populateCardCategoryOptions();
        clearCategoryManagerError();
        await renderCategoryManager();
        return true;
    } catch (error) {
        console.error("Failed saving the card library:", error);
        showCategoryManagerError("The card or category changes could not be saved.");
        return false;
    }
}

async function addCategory() {
    const name = newCategoryInput.value.trim();
    if (!name) {
        showCategoryManagerError("Enter a category name first.");
        return;
    }

    const settings = await PecsLibrary.getCategorySettings();
    if (settings.categories.some(category => category.toLowerCase() === name.toLowerCase())) {
        showCategoryManagerError(`A category named “${name}” already exists.`);
        return;
    }

    settings.categories.push(name);
    if (await applyCategorySettings(settings)) newCategoryInput.value = "";
}

async function renameCategory(oldName, newName, cards, settings) {
    const name = newName.trim();
    if (!name) {
        showCategoryManagerError("Category names cannot be blank.");
        return;
    }
    if (name === oldName) return;
    if (settings.categories.some(category => category !== oldName && category.toLowerCase() === name.toLowerCase())) {
        showCategoryManagerError(`A category named “${name}” already exists.`);
        return;
    }

    const categoryIndex = settings.categories.indexOf(oldName);
    settings.categories[categoryIndex] = name;
    cards.forEach(card => {
        if (card.category === oldName) card.category = name;
    });
    settings.assignments = {};
    await applyLibraryState(cards, settings);
}

async function deleteCategory(category, settings) {
    if (!window.confirm(`Delete the empty “${category}” category?`)) return;
    settings.categories = settings.categories.filter(name => name !== category);
    settings.assignments = {};
    await applyCategorySettings(settings);
}

async function moveCategory(category, direction, settings) {
    const currentIndex = settings.categories.indexOf(category);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= settings.categories.length) return;
    [settings.categories[currentIndex], settings.categories[nextIndex]] = [
        settings.categories[nextIndex],
        settings.categories[currentIndex]
    ];
    await applyCategorySettings(settings);
}

async function renderCategoryManager() {
    const [settings, cards] = await Promise.all([
        PecsLibrary.getCategorySettings(),
        PecsLibrary.getAllCards()
    ]);
    cards.forEach(card => {
        if (!settings.categories.includes(card.category)) settings.categories.push(card.category);
    });
    categoryEditorList.replaceChildren();

    settings.categories.forEach(category => {
        const categoryCards = cards.filter(card => card.category === category);
        const section = document.createElement("section");
        section.className = "bg-indigo-950/70 border border-indigo-700/60 rounded-xl p-3 flex flex-col gap-3";

        const heading = document.createElement("div");
        heading.className = "flex flex-wrap items-center gap-2";
        const nameInput = document.createElement("input");
        nameInput.value = category;
        nameInput.className = "flex-1 min-w-[220px] px-3 py-2 bg-slate-900 border border-indigo-600 rounded-lg text-sm font-semibold text-white focus:outline-none focus:border-indigo-400";
        const count = document.createElement("span");
        count.className = "text-xs text-indigo-300";
        count.textContent = `${categoryCards.length} card${categoryCards.length === 1 ? "" : "s"}`;
        const renameButton = document.createElement("button");
        renameButton.className = "px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg";
        renameButton.textContent = "Rename";
        renameButton.onclick = () => renameCategory(category, nameInput.value, cards, settings);
        nameInput.addEventListener("keydown", event => {
            if (event.key === "Enter") renameButton.click();
        });
        const deleteButton = document.createElement("button");
        deleteButton.className = "px-3 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg";
        deleteButton.textContent = "Delete";
        deleteButton.disabled = categoryCards.length > 0 || settings.categories.length === 1;
        deleteButton.title = categoryCards.length > 0 ? "Move all cards out of this category before deleting it." : "Delete category";
        deleteButton.onclick = () => deleteCategory(category, settings);
        const moveUpButton = document.createElement("button");
        moveUpButton.className = "px-3 py-2 bg-indigo-700 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg";
        moveUpButton.textContent = "↑";
        moveUpButton.title = "Move category up";
        moveUpButton.disabled = settings.categories.indexOf(category) === 0;
        moveUpButton.onclick = () => moveCategory(category, -1, settings);
        const moveDownButton = document.createElement("button");
        moveDownButton.className = moveUpButton.className;
        moveDownButton.textContent = "↓";
        moveDownButton.title = "Move category down";
        moveDownButton.disabled = settings.categories.indexOf(category) === settings.categories.length - 1;
        moveDownButton.onclick = () => moveCategory(category, 1, settings);
        heading.append(moveUpButton, moveDownButton, nameInput, count, renameButton, deleteButton);
        section.appendChild(heading);

        if (categoryCards.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "text-xs italic text-slate-400";
            emptyMessage.textContent = "No cards in this category yet.";
            section.appendChild(emptyMessage);
        } else {
            const cardList = document.createElement("div");
            cardList.className = "grid grid-cols-1 md:grid-cols-2 gap-2";
            categoryCards.forEach(card => {
                const row = document.createElement("div");
                row.className = "flex items-center gap-2 bg-slate-900/80 rounded-lg p-2 border border-slate-700";
                const image = document.createElement("img");
                image.src = card.image;
                image.alt = "";
                image.className = "w-12 h-10 object-contain rounded bg-white";
                const label = document.createElement("div");
                label.className = "flex-1 min-w-0";
                const cardName = document.createElement("p");
                cardName.className = "text-xs font-semibold text-white truncate";
                cardName.textContent = card.name;
                const cardType = document.createElement("p");
                cardType.className = "text-[10px] text-slate-400";
                cardType.textContent = card.isDefault ? "Default card" : "Profile card";
                label.append(cardName, cardType);
                const destination = document.createElement("select");
                destination.className = "max-w-[180px] px-2 py-1.5 bg-indigo-900 border border-indigo-600 rounded text-xs text-white";
                settings.categories.forEach(categoryName => {
                    const option = document.createElement("option");
                    option.value = categoryName;
                    option.textContent = categoryName;
                    destination.appendChild(option);
                });
                destination.value = category;
                destination.onchange = async () => {
                    card.category = destination.value;
                    settings.assignments = {};
                    await applyLibraryState(cards, settings);
                };
                row.append(image, label, destination);
                cardList.appendChild(row);
            });
            section.appendChild(cardList);
        }

        categoryEditorList.appendChild(section);
    });
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
    const cardCategory = cardCategoryInput.value || 'Custom Cards';
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
            createAndStoreCustomCard(cardName, cardCategory, croppedImageDataUrl, audioDataUrl);
        };
        audioReader.readAsDataURL(audioFile);
    } else {
        createAndStoreCustomCard(cardName, cardCategory, croppedImageDataUrl, null);
    }
}

async function createAndStoreCustomCard(name, category, image, audio) {
    const cardData = {
        id: `custom_${Date.now()}`,
        name,
        category,
        image,
        audio
    };

    try {
        const cards = await PecsLibrary.getAllCards();
        await PecsLibrary.saveAllCards(cards.concat(cardData));
    } catch(e) {
        console.error('Failed saving custom card:', e);
        alert('The card could not be saved to the active profile database.');
        return;
    }

    await reloadCardLibrary();
    hideModal();
}

async function removeCard(cardId) {
    if (!confirm('Are you sure you want to remove this card?')) return;

    try {
        await PecsLibrary.saveAllCards(
            (await PecsLibrary.getAllCards()).filter(card => card.id !== cardId)
        );
    } catch(e) {
        console.error('Error removing the card from the active profile database:', e);
        alert('The card could not be removed from the active profile database.');
        return;
    }

    await reloadCardLibrary();
}

async function reloadCardLibrary() {
    const [cards, settings] = await Promise.all([
        PecsLibrary.getAllCards(),
        PecsLibrary.getCategorySettings()
    ]);
    renderCardLibrary(cards, settings.categories);
}

function renderCardLibrary(cards, categoryOrder) {
    libraryMenu.querySelectorAll('[data-library-generated]').forEach(element => element.remove());

    PecsLibrary.groupCardsByCategory(cards, categoryOrder).forEach((categoryCards, category) => {
        const dropdown = document.createElement("button");
        dropdown.className = "dropdown library-category justify-between items-center font-semibold py-2 px-3 text-sm";
        dropdown.dataset.libraryGenerated = "true";

        const title = document.createElement("span");
        title.textContent = category;
        const arrow = document.createElement("span");
        arrow.className = "text-xs";
        arrow.textContent = "▼";
        dropdown.append(title, arrow);

        const group = document.createElement("div");
        group.className = "dropdown-content gap-2 w-full pt-1";
        group.dataset.libraryGenerated = "true";
        dropdown.onclick = () => {
            group.style.display = group.style.display === "flex" ? "none" : "flex";
        };

        categoryCards.forEach(card => {
            const cardButton = document.createElement("button");
            cardButton.className = "button library-card relative flex flex-col items-center p-2 w-full group";
            cardButton.setAttribute("data-card-name", card.name);
            if (card.audio) cardButton.setAttribute("data-card-audio", card.audio);

            const image = document.createElement("img");
            image.src = card.image;
            image.alt = card.name;
            image.className = "rounded-md w-[200px] h-[130px] object-contain bg-white border";
            cardButton.appendChild(image);

            const label = document.createElement("span");
            label.className = "text-xs font-semibold mt-2 truncate w-[190px] text-center";
            label.textContent = card.name;
            cardButton.appendChild(label);

            const deleteButton = document.createElement("div");
            deleteButton.className = "delete-card absolute top-2 right-2 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold cursor-pointer";
            deleteButton.title = "Remove card";
            deleteButton.textContent = "×";
            deleteButton.onclick = event => {
                event.preventDefault();
                event.stopPropagation();
                removeCard(card.id);
            };
            cardButton.appendChild(deleteButton);

            cardButton.onclick = event => {
                if (!event.target.classList.contains("delete-card")) addImageToCanvas(cardButton);
            };
            group.appendChild(cardButton);
        });

        libraryMenu.insertBefore(dropdown, textNoteButton);
        libraryMenu.insertBefore(group, textNoteButton);
    });
}
