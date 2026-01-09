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
    "Objects": { class: "border-orange-500 bg-orange-100", text: "text-orange-900" },
    "Emotions": { class: "border-blue-500 bg-blue-100", text: "text-blue-900" },
    "Actions": { class: "border-green-500 bg-green-100", text: "text-green-900" },
    "General Communication": { class: "border-yellow-500 bg-yellow-100", text: "text-yellow-900" },
    "Animals": { class: "border-purple-500 bg-purple-100", text: "text-purple-900" }
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
        const colorStyle = colors[item.category] || { class: "border-gray-500 bg-gray-100", text: "text-gray-900" };
        
        const card = document.createElement("button");
        card.className = `pecs-card flex flex-col items-center justify-between p-3 border-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 focus:outline-2 focus:outline-yellow-400 focus:outline-offset-2 ${colorStyle.class} min-h-[160px]`;
        card.setAttribute("aria-label", `Add ${item.name} to message`);
        
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="w-24 h-24 object-contain flex-grow">
            <span class="mt-3 font-black uppercase text-sm tracking-wider text-center ${colorStyle.text} leading-tight">${item.name}</span>
        `;
        
        card.onclick = () => addToSentence(item);
        grid.appendChild(card);
    });
}

// ADD TO STRIP
function addToSentence(item) {
    const wordId = Date.now(); // Unique ID for specific removal
    sentenceWords.push({ id: wordId, name: item.name, image: item.image });

    const wrapper = document.createElement("div");
    wrapper.className = "relative flex-shrink-0";
    wrapper.setAttribute("role", "button");
    wrapper.setAttribute("aria-label", `Remove ${item.name} from message`);
    
    wrapper.innerHTML = `
        <div class="w-24 h-24 bg-white border-4 border-blue-500 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all overflow-hidden focus:outline-2 focus:outline-yellow-400 focus:outline-offset-1">
            <img src="${item.image}" class="h-14 w-14 object-contain flex-grow">
            <span class="text-[11px] font-black uppercase text-center leading-tight mt-1 text-blue-900">${item.name}</span>
            <div class="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-black shadow-md hover:bg-red-600">✕</div>
        </div>
    `;

    wrapper.onclick = () => removeFromSentence(wordId, wrapper);
    wrapper.setAttribute("tabindex", "0");
    wrapper.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            removeFromSentence(wordId, wrapper);
        }
    });
    
    sentenceStrip.appendChild(wrapper);
}

// CUSTOM TEXT
function addCustomText(text) {
    if (!text.trim()) return;
    const wordId = Date.now();
    sentenceWords.push({ id: wordId, name: text });

    const wrapper = document.createElement("div");
    wrapper.className = "relative flex-shrink-0";
    wrapper.setAttribute("role", "button");
    wrapper.setAttribute("aria-label", `Remove "${text}" from message`);
    
    wrapper.innerHTML = `
        <div class="h-24 px-4 bg-blue-600 text-white rounded-lg flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all font-black text-lg leading-tight text-center focus:outline-2 focus:outline-yellow-400 focus:outline-offset-1">
            ${text}
            <div class="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-black shadow-md hover:bg-red-600">✕</div>
        </div>
    `;

    wrapper.onclick = () => removeFromSentence(wordId, wrapper);
    wrapper.setAttribute("tabindex", "0");
    wrapper.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            removeFromSentence(wordId, wrapper);
        }
    });
    
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