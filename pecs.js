const pecsData = [
    { name: "Blocks", category: "Objects", image: "./images/blocks.jpg" },
    { name: "Bubbles", category: "Objects", image: "./images/bubbles.jpg" },
    { name: "Body Brush", category: "Objects", image: "./images/bodybrush.jpg" },
    { name: "Curry Comb", category: "Objects", image: "./images/currycomb.jpg" },
    { name: "Hay Bale", category: "Objects", image: "./images/haybale.gif" },
    { name: "Hoof Pick", category: "Objects", image: "./images/hoofpickwithbrush.jpg" },
    { name: "Happy", category: "Emotions", image: "./images/happy.png" },
    { name: "Sad", category: "Emotions", image: "./images/sad.png" },
    { name: "Eat", category: "Actions", image: "./images/eat.png" },
    { name: "Play", category: "Actions", image: "./images/play.png" },
    { name: "Yes", category: "General Communication", image: "./images/yes.png" },
    { name: "No", category: "General Communication", image: "./images/no.png" }
];

// Color mapping for neurodivergent focus (Fitzgerald Key inspired)
const colors = {
    "Objects": "border-orange-400 bg-orange-50",
    "Emotions": "border-blue-400 bg-blue-50",
    "Actions": "border-green-400 bg-green-50",
    "General Communication": "border-yellow-400 bg-yellow-50",
    "Animals": "border-purple-400 bg-purple-50"
};

const grid = document.getElementById("imageGrid");
const categorySelect = document.getElementById("Categories");
const sentenceStrip = document.getElementById("sentenceStrip");
const clearBtn = document.getElementById("clearBtn");
const playBtn = document.getElementById("playBtn");
const customTextInput = document.getElementById("customText");
const addTextBtn = document.getElementById("addTextBtn");

let sentenceWords = [];

// RENDER IMAGES
function renderImages(category) {
    grid.innerHTML = "";
    const filtered = pecsData.filter(item => item.category === category);

    filtered.forEach(item => {
        const colorClass = colors[item.category] || "border-slate-300 bg-white";
        
        const card = document.createElement("button");
        card.className = `flex flex-col items-center p-2 border-4 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 ${colorClass}`;
        
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="w-full h-24 object-contain rounded-lg">
            <span class="mt-2 font-bold text-slate-800 uppercase text-xs tracking-wide">${item.name}</span>
        `;
        
        card.onclick = () => addToSentence(item);
        grid.appendChild(card);
    });
}

// ADD TO STRIP
function addToSentence(item) {
    const wordId = Date.now(); // Unique ID for specific removal
    sentenceWords.push({ id: wordId, name: item.name });

    const wrapper = document.createElement("div");
    wrapper.className = "relative flex-shrink-0 animate-in fade-in zoom-in duration-200";
    
    wrapper.innerHTML = `
        <div class="w-20 h-20 bg-white border-2 border-blue-500 rounded-lg p-1 flex flex-col items-center justify-center cursor-pointer shadow-sm overflow-hidden">
            <img src="${item.image}" class="h-12 w-12 object-contain">
            <span class="text-[10px] font-bold uppercase text-center leading-none mt-1">${item.name}</span>
            <div class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">✕</div>
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

    const wrapper = document.createElement("div");
    wrapper.className = "relative flex-shrink-0";
    wrapper.innerHTML = `
        <div class="h-20 px-4 bg-blue-600 text-white rounded-lg flex items-center justify-center cursor-pointer shadow-md font-bold">
            ${text}
            <div class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">✕</div>
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
    const utterance = new SpeechSynthesisUtterance(sentenceWords.map(w => w.name).join(" "));
    utterance.rate = 0.8; 
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
});

addTextBtn.addEventListener("click", () => {
    addCustomText(customTextInput.value);
    customTextInput.value = "";
});

// Init
renderImages("Objects");