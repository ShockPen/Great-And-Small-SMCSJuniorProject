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

const grid = document.getElementById("imageGrid");
const categorySelect = document.getElementById("Categories");
const sentenceStrip = document.getElementById("sentenceStrip");
const clearBtn = document.getElementById("clearBtn");
const playBtn = document.getElementById("playBtn");
const customTextInput = document.getElementById("customText");
const addTextBtn = document.getElementById("addTextBtn");

let sentenceWords = [];

categorySelect.addEventListener("change", () => {
    renderImages(categorySelect.value);
});

clearBtn.addEventListener("click", () => {
    sentenceStrip.innerHTML = "";
    sentenceWords = [];
    speechSynthesis.cancel();
});

playBtn.addEventListener("click", () => {
    if (sentenceWords.length === 0) return;

    const utterance = new SpeechSynthesisUtterance(
        sentenceWords.join(" ")
    );

    utterance.rate = 0.9;
    utterance.pitch = 1;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
});

addTextBtn.addEventListener("click", () => {
    addCustomText(customTextInput.value);
    customTextInput.value = "";
});


renderImages(categorySelect.value);

//-------------------------------------------------
function renderImages(category) {
    grid.innerHTML = "";

    const filtered = pecsData.filter(item => item.category === category);

    filtered.forEach(item => {
        const button = document.createElement("button");
        button.className = "button";

        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;
        img.className =
            "justify-center bg-[rgb(53,53,240)] text-black rounded-[30px] w-[200px] h-[150px]";

        button.appendChild(img);
        button.onclick = () => addToSentence(item);

        grid.appendChild(button);
    });
}

function addToSentence(item) {
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;
    img.className =
        "bg-[rgb(53,53,240)] rounded-[20px] w-[80px] h-[60px]";

    sentenceStrip.appendChild(img);
    sentenceWords.push(item.name);
}

function addCustomText(text) {
    if (!text.trim()) return;

    const span = document.createElement("span");
    span.textContent = text;
    span.className =
        "bg-[rgb(53,53,240)] text-white px-3 py-2 rounded-[20px] text-sm flex items-center";

    sentenceStrip.appendChild(span);
    sentenceWords.push(text);
}
