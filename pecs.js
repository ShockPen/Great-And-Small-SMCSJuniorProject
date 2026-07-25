const pecsData = [
    { name: "Blocks", category: "Objects", image: "./images/blocks.jpg" },
    { name: "Bubbles", category: "Objects", image: "./images/bubbles.jpg" },
    { name: "Body Brush", category: "Objects", image: "./images/bodybrush.jpg" },
    { name: "Curry Comb", category: "Objects", image: "./images/currycomb.jpg" },
    { name: "Hay Bale", category: "Objects", image: "./images/haybale.gif" },
    { name: "Hoof Pick", category: "Objects", image: "./images/hoofpickwithbrush.jpg" },
    { name: "Mane & Tail Brush", category: "Objects", image: "./images/maneandtailbrush.png" },

    { name: "Cat", category: "Animals", image: "./images/cat.jpg" },
    { name: "Cow", category: "Animals", image: "./images/cow.jpg" },
    { name: "Dog", category: "Animals", image: "./images/dog.jpg" },
    { name: "Goat", category: "Animals", image: "./images/goat.gif" },
    { name: "Horse", category: "Animals", image: "./images/horse.jpg" },
    { name: "Kid", category: "Animals", image: "./images/kid.png" },
    { name: "Pig", category: "Animals", image: "./images/pig.jpg" },

    { name: "Angry", category: "Emotions", image: "./images/angry.jpg" },
    { name: "Crying", category: "Emotions", image: "./images/crying.jpg" },
    { name: "Excited", category: "Emotions", image: "./images/Excited.jpg" },
    { name: "Happy", category: "Emotions", image: "./images/happy.jpg" },
    { name: "Mad", category: "Emotions", image: "./images/mad.jpg" },
    { name: "Proud", category: "Emotions", image: "./images/proud.jpg" },
    { name: "Sad", category: "Emotions", image: "./images/sad.jpg" },
    { name: "Surprised", category: "Emotions", image: "./images/surprised.gif" },

    { name: "Calm Down", category: "Actions", image: "./images/calmdown.jpg" },
    { name: "Crying", category: "Actions", image: "./images/crying.jpg" },
    { name: "Drinking", category: "Actions", image: "./images/drinking.jpg" },
    { name: "Eat", category: "Actions", image: "./images/eat.jpg" },
    { name: "Fist Bump", category: "Actions", image: "./images/fistbump.jpg" },
    { name: "Good Job", category: "Actions", image: "./images/goodjob.jpg" },
    { name: "High Five", category: "Actions", image: "./images/highfive.jpg" },
    { name: "Listen", category: "Actions", image: "./images/listen.jpg" },
    { name: "Put On Helmet", category: "Actions", image: "./images/putonhelmet.jpg" },
    { name: "Quiet", category: "Actions", image: "./images/quiet.jpg" },
    { name: "Sit", category: "Actions", image: "./images/sit.jpg" },
    { name: "Wait", category: "Actions", image: "./images/wait.jpg" },

    { name: "Yes", category: "General Communication", image: "./images/yes.png" },
    { name: "No", category: "General Communication", image: "./images/no.png" },
    { name: "Good Job", category: "General Communication", image: "./images/goodjob.jpg" },
    { name: "Hello", category: "General Communication", image: "./images/hello.jpg" },
    { name: "I Don't Know", category: "General Communication", image: "./images/idon'tknow.jpg" },
    { name: "I Need Help", category: "General Communication", image: "./images/ineedhelp.jpg" },
    { name: "I Want", category: "General Communication", image: "./images/iwant.jpg" },
    { name: "This One", category: "General Communication", image: "./images/thisone.jpg" },
    { name: "Wait", category: "General Communication", image: "./images/wait.jpg" },
];

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

// Load custom uploaded cards from localStorage
function getCustomCards() {
    try {
        const stored = localStorage.getItem('pecs_custom_cards');
        if (stored) {
            return JSON.parse(stored).map(card => ({
                id: card.id,
                name: card.name,
                category: "Custom Cards",
                image: card.imageSrc,
                audioSrc: card.audioSrc
            }));
        }
    } catch(e) {
        console.error('Error reading custom cards:', e);
    }
    return [];
}

function removeCustomCard(cardId) {
    if (!confirm('Are you sure you want to remove this custom card?')) return;

    try {
        const stored = localStorage.getItem('pecs_custom_cards');
        if (stored) {
            let cards = JSON.parse(stored);
            cards = cards.filter(c => c.id !== cardId);
            localStorage.setItem('pecs_custom_cards', JSON.stringify(cards));
        }
    } catch(e) {
        console.error('Error updating custom cards in localStorage:', e);
    }

    renderImages(categorySelect.value);
}

// RENDER IMAGES
function renderImages(category) {
    grid.innerHTML = "";
    
    let allCards = [...pecsData];
    const customCards = getCustomCards();
    allCards = allCards.concat(customCards);

    const filtered = allCards.filter(item => item.category === category);

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="text-slate-400 italic text-sm mt-8">No cards available in "${category}". Upload custom cards in PECS Studio!</p>`;
        return;
    }

    filtered.forEach(item => {
        const colorClass = colors[item.category] || "border-slate-300 bg-white";
        
        const card = document.createElement("button");
        card.className = `relative flex flex-col items-center justify-between p-2 border-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 ${colorClass} w-[200px] h-[150px] flex-shrink-0 flex-grow-0 group`;
        
        let deleteBtnHTML = '';
        if (item.category === "Custom Cards" && item.id) {
            deleteBtnHTML = `<div class="delete-card-btn absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md cursor-pointer transition transform hover:scale-110" title="Remove custom card">🗑️</div>`;
        }

        card.innerHTML = `
            ${deleteBtnHTML}
            <img src="${item.image}" alt="${item.name}" class="w-full h-[100px] object-contain rounded-xl shadow-inner pointer-events-none">
            <span class="font-bold text-slate-800 uppercase text-xs tracking-wide truncate w-full text-center px-1 py-0.5 pointer-events-none">${item.name}</span>
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

    const wrapper = document.createElement("div");
    wrapper.className = "relative flex-shrink-0 animate-in fade-in zoom-in duration-200";
    
    wrapper.innerHTML = `
        <div class="w-[100px] h-[75px] bg-white border-2 border-blue-500 rounded-xl p-1 flex flex-col items-center justify-between cursor-pointer shadow-md overflow-hidden relative">
            <img src="${item.image}" class="h-[48px] w-full object-contain rounded-md">
            <span class="text-[9px] font-bold uppercase text-center leading-none text-gray-800 truncate w-full px-0.5 pb-0.5">${item.name}</span>
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

    const wrapper = document.createElement("div");
    wrapper.className = "relative flex-shrink-0";
    wrapper.innerHTML = `
        <div class="w-[100px] h-[75px] px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-md font-bold text-xs text-center leading-tight relative overflow-hidden">
            ${text}
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
renderImages("Objects");