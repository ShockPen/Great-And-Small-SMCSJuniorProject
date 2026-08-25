const grid = document.getElementById("imageGrid");
const categorySelect = document.getElementById("Categories");
const sentenceStrip = document.getElementById("sentenceStrip");
const clearBtn = document.getElementById("clearBtn");
const playBtn = document.getElementById("playBtn");
const customTextInput = document.getElementById("customText");
const addTextBtn = document.getElementById("addTextBtn");

let sentenceWords = [];
let allCards = [];
let playbackVersion = 0;
let currentAudio = null;

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function populateCategories(cards, preferredCategory, categoryOrder) {
    const categories = PecsLibrary.getCategories(cards, categoryOrder);
    categorySelect.replaceChildren();
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    categorySelect.value = categories.includes(preferredCategory)
        ? preferredCategory
        : (categories[0] || "");
}

async function reloadCardLibrary(preferredCategory = categorySelect.value) {
    const [cards, settings] = await Promise.all([
        PecsLibrary.getAllCards(),
        PecsLibrary.getCategorySettings()
    ]);
    allCards = cards;
    populateCategories(allCards, preferredCategory, settings.categories);
    renderImages(categorySelect.value);
}

async function removeCard(cardId) {
    const card = allCards.find(item => item.id === cardId);
    const confirmed = await PecsDialog.confirm({
        title: `Delete “${card ? card.name : "this card"}”?`,
        message: "This card will be permanently removed from the active profile.",
        confirmLabel: "Delete card",
        tone: "danger"
    });
    if (!confirmed) return;

    try {
        await PecsLibrary.saveAllCards(
            (await PecsLibrary.getAllCards()).filter(card => card.id !== cardId)
        );
    } catch (error) {
        console.error('Error updating the active profile database:', error);
        await PecsDialog.notice({
            title: "Card could not be deleted",
            message: "The active profile database could not be updated.",
            tone: "danger"
        });
        return;
    }

    await reloadCardLibrary(categorySelect.value);
}

// RENDER IMAGES
function renderImages(category) {
    grid.innerHTML = "";
    const filtered = allCards.filter(item => item.category === category);

    if (filtered.length === 0) {
        const message = document.createElement("p");
        message.className = "text-slate-400 italic text-sm mt-8";
        message.textContent = category
            ? `No cards available in "${category}". Upload custom cards in PECS Studio!`
            : "No cards are available. Upload custom cards in PECS Studio!";
        grid.appendChild(message);
        return;
    }

    filtered.forEach(item => {
        const safeName = escapeHtml(item.name);
        const safeImage = escapeHtml(item.image);
        
        const card = document.createElement("button");
        card.className = "sentence-card relative flex flex-col items-center justify-between p-2 border bg-white rounded-lg w-[200px] h-[150px] flex-shrink-0 flex-grow-0 group";
        
        let deleteBtnHTML = '';
        deleteBtnHTML = `<div class="delete-card-btn absolute top-2 right-2 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold cursor-pointer" title="Remove card">×</div>`;

        card.innerHTML = `
            ${deleteBtnHTML}
            <img src="${safeImage}" alt="${safeName}" class="w-full h-[100px] object-contain rounded-md pointer-events-none">
            <span class="font-semibold text-slate-800 text-sm truncate w-full text-center px-1 py-0.5 pointer-events-none">${safeName}</span>
        `;
        
        card.onclick = (e) => {
            if (e.target.classList.contains('delete-card-btn')) {
                e.preventDefault();
                e.stopPropagation();
                removeCard(item.id);
                return;
            }
            addToSentence(item);
        };

        grid.appendChild(card);
    });
}

// ADD TO STRIP
function addToSentence(item) {
    const wordId = Date.now();
    sentenceWords.push({ id: wordId, name: item.name, audio: item.audio });
    const safeName = escapeHtml(item.name);
    const safeImage = escapeHtml(item.image);

    const wrapper = document.createElement("div");
    wrapper.className = "relative flex-shrink-0";
    
    wrapper.innerHTML = `
        <div class="sentence-token w-[100px] h-[75px] bg-white border rounded-lg p-1 flex flex-col items-center justify-between cursor-pointer overflow-hidden relative">
            <img src="${safeImage}" class="h-[48px] w-full object-contain rounded-md">
            <span class="text-[10px] font-semibold text-center leading-none text-gray-800 truncate w-full px-0.5 pb-0.5">${safeName}</span>
            <div class="token-remove absolute -top-1 -right-1 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">×</div>
        </div>
    `;

    wrapper.onclick = () => removeFromSentence(wordId, wrapper);
    sentenceStrip.appendChild(wrapper);
}

// CUSTOM TEXT
function addCustomText(text) {
    if (!text.trim()) return;
    const wordId = Date.now();
    sentenceWords.push({ id: wordId, name: text });
    const safeText = escapeHtml(text);

    const wrapper = document.createElement("div");
    wrapper.className = "relative flex-shrink-0";
    wrapper.innerHTML = `
        <div class="sentence-token text-token w-[100px] h-[75px] px-2 rounded-lg flex items-center justify-center cursor-pointer font-bold text-xs text-center leading-tight relative overflow-hidden">
            ${safeText}
            <div class="token-remove absolute -top-1 -right-1 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">×</div>
        </div>
    `;

    wrapper.onclick = () => removeFromSentence(wordId, wrapper);
    sentenceStrip.appendChild(wrapper);
}

function removeFromSentence(id, element) {
    element.remove();
    sentenceWords = sentenceWords.filter(w => w.id !== id);
}

// UTILITIES
categorySelect.addEventListener("change", () => renderImages(categorySelect.value));
clearBtn.addEventListener("click", async () => {
    if (sentenceWords.length === 0) return;
    const confirmed = await PecsDialog.confirm({
        title: "Clear the whole sentence?",
        message: "Every card and custom word in the sentence strip will be removed.",
        confirmLabel: "Clear sentence",
        tone: "danger"
    });
    if (!confirmed) return;
    sentenceStrip.innerHTML = "";
    sentenceWords = [];
    stopSentencePlayback();
});

playBtn.addEventListener("click", async () => {
    if (sentenceWords.length === 0) return;
    const version = ++playbackVersion;
    stopActiveMedia();
    playBtn.disabled = true;

    try {
        for (const word of sentenceWords.slice()) {
            if (version !== playbackVersion) break;
            try {
                if (word.audio) await playAudio(word.audio);
                else await speakWord(word.name);
            } catch (error) {
                if (version === playbackVersion) await speakWord(word.name);
            }
        }
    } finally {
        if (version === playbackVersion) playBtn.disabled = false;
    }
});

function playAudio(audioSource) {
    return new Promise((resolve, reject) => {
        currentAudio = new Audio(audioSource);
        currentAudio.addEventListener("ended", resolve, { once: true });
        currentAudio.addEventListener("error", reject, { once: true });
        currentAudio.play().catch(reject);
    });
}

function speakWord(text) {
    return new Promise(resolve => {
        if (!("speechSynthesis" in window)) {
            resolve();
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.onend = resolve;
        utterance.onerror = resolve;
        speechSynthesis.speak(utterance);
    });
}

function stopActiveMedia() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
}

function stopSentencePlayback() {
    playbackVersion++;
    stopActiveMedia();
    playBtn.disabled = false;
}

addTextBtn.addEventListener("click", () => {
    addCustomText(customTextInput.value);
    customTextInput.value = "";
});

PecsLibrary.setupProfileControls({
    onImported: () => reloadCardLibrary(categorySelect.value)
});
reloadCardLibrary("Objects");
