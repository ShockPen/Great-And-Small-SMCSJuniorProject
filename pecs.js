const colors = {
    "Objects": "border-orange-400 bg-orange-50",
    "Emotions": "border-blue-400 bg-blue-50",
    "Actions": "border-green-400 bg-green-50",
    "General Communication": "border-yellow-400 bg-yellow-50",
    "Animals": "border-purple-400 bg-purple-50",
    "Custom Cards": "border-emerald-400 bg-emerald-50"
};

const grid = document.getElementById("imageGrid");
const categorySelect = document.getElementById("Categories");
const sentenceStrip = document.getElementById("sentenceStrip");
const clearBtn = document.getElementById("clearBtn");
const playBtn = document.getElementById("playBtn");
const customTextInput = document.getElementById("customText");
const addTextBtn = document.getElementById("addTextBtn");

let sentenceWords = [];

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function populateCategories() {
    categorySelect.replaceChildren();
    PecsLibrary.categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

async function removeCustomCard(cardId) {
    if (!confirm('Are you sure you want to remove this custom card?')) return;

    try {
        await PecsLibrary.saveCustomCards(
            (await PecsLibrary.getCustomCards()).filter(card => card.id !== cardId)
        );
    } catch (error) {
        console.error('Error updating the active profile database:', error);
        alert('The card could not be removed from the active profile database.');
        return;
    }

    renderImages(categorySelect.value);
}

// RENDER IMAGES
async function renderImages(category) {
    grid.innerHTML = "";
    
    const filtered = (await PecsLibrary.getAllCards()).filter(item => item.category === category);

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="text-slate-400 italic text-sm mt-8">No cards available in "${category}". Upload custom cards in PECS Studio!</p>`;
        return;
    }

    filtered.forEach(item => {
        const colorClass = colors[item.category] || "border-slate-300 bg-white";
        const safeName = escapeHtml(item.name);
        const safeImage = escapeHtml(item.image);
        
        const card = document.createElement("button");
        card.className = `relative flex flex-col items-center justify-between p-2 border-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 ${colorClass} w-[200px] h-[150px] flex-shrink-0 flex-grow-0 group`;
        
        let deleteBtnHTML = '';
        if (item.category === "Custom Cards" && item.id) {
            deleteBtnHTML = `<div class="delete-card-btn absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md cursor-pointer transition transform hover:scale-110" title="Remove custom card">🗑️</div>`;
        }

        card.innerHTML = `
            ${deleteBtnHTML}
            <img src="${safeImage}" alt="${safeName}" class="w-full h-[100px] object-contain rounded-xl shadow-inner pointer-events-none">
            <span class="font-bold text-slate-800 uppercase text-xs tracking-wide truncate w-full text-center px-1 py-0.5 pointer-events-none">${safeName}</span>
        `;
        
        card.onclick = (e) => {
            if (e.target.classList.contains('delete-card-btn')) {
                e.preventDefault();
                e.stopPropagation();
                removeCustomCard(item.id);
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
    sentenceWords.push({ id: wordId, name: item.name, audioSrc: item.audioSrc });
    const safeName = escapeHtml(item.name);
    const safeImage = escapeHtml(item.image);

    const wrapper = document.createElement("div");
    wrapper.className = "relative flex-shrink-0 animate-in fade-in zoom-in duration-200";
    
    wrapper.innerHTML = `
        <div class="w-[100px] h-[75px] bg-white border-2 border-blue-500 rounded-xl p-1 flex flex-col items-center justify-between cursor-pointer shadow-md overflow-hidden relative">
            <img src="${safeImage}" class="h-[48px] w-full object-contain rounded-md">
            <span class="text-[9px] font-bold uppercase text-center leading-none text-gray-800 truncate w-full px-0.5 pb-0.5">${safeName}</span>
            <div class="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md">✕</div>
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
        <div class="w-[100px] h-[75px] px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-md font-bold text-xs text-center leading-tight relative overflow-hidden">
            ${safeText}
            <div class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md">✕</div>
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
clearBtn.addEventListener("click", () => {
    sentenceStrip.innerHTML = "";
    sentenceWords = [];
    speechSynthesis.cancel();
});

playBtn.addEventListener("click", () => {
    if (sentenceWords.length === 0) return;
    const textToSpeak = sentenceWords.map(w => w.name).join(" ");
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.8; 
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
});

addTextBtn.addEventListener("click", () => {
    addCustomText(customTextInput.value);
    customTextInput.value = "";
});

// Initial Render
populateCategories();
PecsLibrary.setupProfileControls({
    onImported: () => renderImages(categorySelect.value)
});
renderImages("Objects");
