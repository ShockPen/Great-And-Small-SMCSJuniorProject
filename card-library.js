(function () {
    const STORAGE_KEY = "pecs_custom_cards";
    const DATABASE_NAME = "great_and_small_pecs";
    const DATABASE_STORE = "profile_data";
    const DATABASE_KEY = "custom_cards";
    const PROFILE_FORMAT = "great-and-small-pecs-profile";
    const PROFILE_VERSION = 2;
    const ZIP_MIME_TYPE = "application/zip";
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();

    const categories = [
        "Objects",
        "Animals",
        "Emotions",
        "Actions",
        "General Communication",
        "Custom Cards"
    ];

    const builtInCards = [
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
        { name: "Excited", category: "Emotions", image: "./images/excited.jpg" },
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

        { name: "Yes", category: "General Communication", image: "./images/yes.svg" },
        { name: "No", category: "General Communication", image: "./images/no.svg" },
        { name: "Good Job", category: "General Communication", image: "./images/goodjob.jpg" },
        { name: "Hello", category: "General Communication", image: "./images/hello.jpg" },
        { name: "I Don't Know", category: "General Communication", image: "./images/idon'tknow.jpg" },
        { name: "I Need Help", category: "General Communication", image: "./images/ineedhelp.jpg" },
        { name: "I Want", category: "General Communication", image: "./images/iwant.jpg" },
        { name: "This One", category: "General Communication", image: "./images/thisone.jpg" },
        { name: "Wait", category: "General Communication", image: "./images/wait.jpg" }
    ];

    function normalizeStoredCard(card, index) {
        if (!card || typeof card !== "object") return null;

        const name = typeof card.name === "string" ? card.name.trim() : "";
        const imageSrc = typeof card.imageSrc === "string" ? card.imageSrc : "";
        const audioSrc = typeof card.audioSrc === "string" ? card.audioSrc : null;
        if (!name || !imageSrc) return null;

        return {
            id: typeof card.id === "string" && card.id ? card.id : `custom_imported_${Date.now()}_${index}`,
            name,
            imageSrc,
            audioSrc
        };
    }

    let databasePromise = null;
    let memoryFallbackCards = [];

    function openDatabase() {
        if (!databasePromise) {
            databasePromise = new Promise((resolve, reject) => {
                if (!("indexedDB" in window)) {
                    reject(new Error("IndexedDB is unavailable."));
                    return;
                }

                const request = indexedDB.open(DATABASE_NAME, 1);
                request.onupgradeneeded = () => {
                    if (!request.result.objectStoreNames.contains(DATABASE_STORE)) {
                        request.result.createObjectStore(DATABASE_STORE);
                    }
                };
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error || new Error("The profile database could not be opened."));
            });
        }
        return databasePromise;
    }

    async function readDatabaseCards() {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const request = database.transaction(DATABASE_STORE, "readonly")
                .objectStore(DATABASE_STORE)
                .get(DATABASE_KEY);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error("The active profile could not be read."));
        });
    }

    async function writeDatabaseCards(cards) {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(DATABASE_STORE, "readwrite");
            transaction.objectStore(DATABASE_STORE).put(cards, DATABASE_KEY);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error || new Error("The active profile could not be saved."));
            transaction.onabort = () => reject(transaction.error || new Error("Saving the active profile was interrupted."));
        });
    }

    function readLegacyCards() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed)
                ? parsed.map(normalizeStoredCard).filter(Boolean)
                : [];
        } catch (error) {
            console.error("Failed loading stored custom cards:", error);
            return [];
        }
    }

    async function getCustomCards() {
        try {
            let storedCards = await readDatabaseCards();
            if (storedCards === undefined) {
                storedCards = readLegacyCards();
                await writeDatabaseCards(storedCards);
            }
            return Array.isArray(storedCards)
                ? storedCards.map(normalizeStoredCard).filter(Boolean)
                : [];
        } catch (error) {
            console.error("Failed loading the active profile from IndexedDB:", error);
            return memoryFallbackCards.map(card => ({ ...card }));
        }
    }

    async function saveCustomCards(cards) {
        const normalizedCards = Array.isArray(cards)
            ? cards.map(normalizeStoredCard).filter(Boolean)
            : [];
        memoryFallbackCards = normalizedCards.map(card => ({ ...card }));
        await writeDatabaseCards(normalizedCards);
        return normalizedCards;
    }

    async function getAllCards() {
        const customCards = (await getCustomCards()).map(card => ({
            id: card.id,
            name: card.name,
            category: "Custom Cards",
            image: card.imageSrc,
            audioSrc: card.audioSrc
        }));
        return builtInCards.concat(customCards);
    }

    function safeFileName(name) {
        return name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "pecs-profile";
    }

    function extensionForMimeType(mimeType, fallback) {
        const extensions = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/gif": "gif",
            "image/webp": "webp",
            "image/svg+xml": "svg",
            "audio/mpeg": "mp3",
            "audio/mp4": "m4a",
            "audio/ogg": "ogg",
            "audio/wav": "wav",
            "audio/webm": "webm"
        };
        return extensions[mimeType] || fallback;
    }

    function mimeTypeForFileName(fileName, fallback) {
        const extension = fileName.split(".").pop().toLowerCase();
        const mimeTypes = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            gif: "image/gif",
            webp: "image/webp",
            svg: "image/svg+xml",
            mp3: "audio/mpeg",
            m4a: "audio/mp4",
            ogg: "audio/ogg",
            wav: "audio/wav",
            webm: "audio/webm"
        };
        return mimeTypes[extension] || fallback;
    }

    function dataUrlToFile(dataUrl) {
        const separatorIndex = dataUrl.indexOf(",");
        if (!dataUrl.startsWith("data:") || separatorIndex < 0) {
            throw new Error("A card contains image or audio data that cannot be exported.");
        }

        const header = dataUrl.slice(5, separatorIndex);
        const mimeType = header.split(";")[0] || "application/octet-stream";
        const encodedData = dataUrl.slice(separatorIndex + 1);
        let bytes;

        if (header.split(";").includes("base64")) {
            const binary = atob(encodedData);
            bytes = new Uint8Array(binary.length);
            for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
        } else {
            bytes = textEncoder.encode(decodeURIComponent(encodedData));
        }

        return { mimeType, bytes };
    }

    function bytesToDataUrl(bytes, mimeType) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("A media file in the profile could not be read."));
            reader.readAsDataURL(new Blob([bytes], { type: mimeType }));
        });
    }

    const crcTable = (() => {
        const table = new Uint32Array(256);
        for (let number = 0; number < 256; number++) {
            let value = number;
            for (let bit = 0; bit < 8; bit++) {
                value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
            }
            table[number] = value >>> 0;
        }
        return table;
    })();

    function crc32(bytes) {
        let crc = 0xffffffff;
        for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
        return (crc ^ 0xffffffff) >>> 0;
    }

    function dosDateTime(date) {
        const year = Math.max(1980, date.getFullYear());
        return {
            time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
            date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
        };
    }

    function writeUint16(view, offset, value) {
        view.setUint16(offset, value, true);
    }

    function writeUint32(view, offset, value) {
        view.setUint32(offset, value >>> 0, true);
    }

    function createZip(entries) {
        const now = dosDateTime(new Date());
        const preparedEntries = entries.map(entry => {
            const nameBytes = textEncoder.encode(entry.name);
            const data = entry.data instanceof Uint8Array ? entry.data : new Uint8Array(entry.data);
            return { ...entry, nameBytes, data, crc: crc32(data), offset: 0 };
        });

        const localSize = preparedEntries.reduce((total, entry) => total + 30 + entry.nameBytes.length + entry.data.length, 0);
        const centralSize = preparedEntries.reduce((total, entry) => total + 46 + entry.nameBytes.length, 0);
        const bytes = new Uint8Array(localSize + centralSize + 22);
        const view = new DataView(bytes.buffer);
        let offset = 0;

        for (const entry of preparedEntries) {
            entry.offset = offset;
            writeUint32(view, offset, 0x04034b50);
            writeUint16(view, offset + 4, 20);
            writeUint16(view, offset + 6, 0x0800);
            writeUint16(view, offset + 8, 0);
            writeUint16(view, offset + 10, now.time);
            writeUint16(view, offset + 12, now.date);
            writeUint32(view, offset + 14, entry.crc);
            writeUint32(view, offset + 18, entry.data.length);
            writeUint32(view, offset + 22, entry.data.length);
            writeUint16(view, offset + 26, entry.nameBytes.length);
            writeUint16(view, offset + 28, 0);
            bytes.set(entry.nameBytes, offset + 30);
            bytes.set(entry.data, offset + 30 + entry.nameBytes.length);
            offset += 30 + entry.nameBytes.length + entry.data.length;
        }

        const centralOffset = offset;
        for (const entry of preparedEntries) {
            writeUint32(view, offset, 0x02014b50);
            writeUint16(view, offset + 4, 20);
            writeUint16(view, offset + 6, 20);
            writeUint16(view, offset + 8, 0x0800);
            writeUint16(view, offset + 10, 0);
            writeUint16(view, offset + 12, now.time);
            writeUint16(view, offset + 14, now.date);
            writeUint32(view, offset + 16, entry.crc);
            writeUint32(view, offset + 20, entry.data.length);
            writeUint32(view, offset + 24, entry.data.length);
            writeUint16(view, offset + 28, entry.nameBytes.length);
            writeUint16(view, offset + 30, 0);
            writeUint16(view, offset + 32, 0);
            writeUint16(view, offset + 34, 0);
            writeUint16(view, offset + 36, 0);
            writeUint32(view, offset + 38, 0);
            writeUint32(view, offset + 42, entry.offset);
            bytes.set(entry.nameBytes, offset + 46);
            offset += 46 + entry.nameBytes.length;
        }

        writeUint32(view, offset, 0x06054b50);
        writeUint16(view, offset + 4, 0);
        writeUint16(view, offset + 6, 0);
        writeUint16(view, offset + 8, preparedEntries.length);
        writeUint16(view, offset + 10, preparedEntries.length);
        writeUint32(view, offset + 12, centralSize);
        writeUint32(view, offset + 16, centralOffset);
        writeUint16(view, offset + 20, 0);
        return bytes;
    }

    function readZip(arrayBuffer) {
        const bytes = new Uint8Array(arrayBuffer);
        const view = new DataView(arrayBuffer);
        const minimumOffset = Math.max(0, bytes.length - 65557);
        let endOffset = -1;
        for (let offset = bytes.length - 22; offset >= minimumOffset; offset--) {
            if (view.getUint32(offset, true) === 0x06054b50) {
                endOffset = offset;
                break;
            }
        }
        if (endOffset < 0) throw new Error("That file is not a valid ZIP profile.");

        const entryCount = view.getUint16(endOffset + 10, true);
        const centralOffset = view.getUint32(endOffset + 16, true);
        if (entryCount > 1000 || centralOffset >= bytes.length) throw new Error("The ZIP profile is invalid or too large.");

        const entries = new Map();
        let offset = centralOffset;
        let totalSize = 0;
        for (let index = 0; index < entryCount; index++) {
            if (offset + 46 > bytes.length || view.getUint32(offset, true) !== 0x02014b50) {
                throw new Error("The ZIP profile directory is damaged.");
            }

            const compression = view.getUint16(offset + 10, true);
            const expectedCrc = view.getUint32(offset + 16, true);
            const compressedSize = view.getUint32(offset + 20, true);
            const uncompressedSize = view.getUint32(offset + 24, true);
            const nameLength = view.getUint16(offset + 28, true);
            const extraLength = view.getUint16(offset + 30, true);
            const commentLength = view.getUint16(offset + 32, true);
            const localOffset = view.getUint32(offset + 42, true);
            const nameEnd = offset + 46 + nameLength;
            if (nameEnd > bytes.length) throw new Error("The ZIP profile contains an invalid file name.");
            const name = textDecoder.decode(bytes.subarray(offset + 46, nameEnd));

            if (compression !== 0 || compressedSize !== uncompressedSize) {
                throw new Error("This profile uses ZIP compression that is not supported. Import the original ZIP exported by this app.");
            }
            if (!name || name.startsWith("/") || name.includes("..") || name.includes("\\") || entries.has(name)) {
                throw new Error("The ZIP profile contains an unsafe or duplicate file path.");
            }
            if (localOffset + 30 > bytes.length || view.getUint32(localOffset, true) !== 0x04034b50) {
                throw new Error("A file in the ZIP profile is damaged.");
            }

            const localNameLength = view.getUint16(localOffset + 26, true);
            const localExtraLength = view.getUint16(localOffset + 28, true);
            const dataStart = localOffset + 30 + localNameLength + localExtraLength;
            const dataEnd = dataStart + compressedSize;
            if (dataEnd > bytes.length) throw new Error("A file in the ZIP profile is incomplete.");
            const data = bytes.slice(dataStart, dataEnd);
            if (crc32(data) !== expectedCrc) throw new Error(`The ZIP entry “${name}” failed its integrity check.`);

            totalSize += data.length;
            if (totalSize > 250 * 1024 * 1024) throw new Error("The ZIP profile is larger than the 250 MB import limit.");
            entries.set(name, data);
            offset = nameEnd + extraLength + commentLength;
        }
        return entries;
    }

    async function exportProfile(profileName) {
        const name = profileName.trim() || "PECS Profile";
        const storedCards = await getCustomCards();
        const entries = [];
        const profileCards = [];

        storedCards.forEach((card, index) => {
            const image = dataUrlToFile(card.imageSrc);
            const baseName = `${String(index + 1).padStart(3, "0")}-${safeFileName(card.name)}`;
            const imageFile = `images/${baseName}.${extensionForMimeType(image.mimeType, "bin")}`;
            entries.push({ name: imageFile, data: image.bytes });

            let audioFile = null;
            let audioMimeType = null;
            if (card.audioSrc) {
                const audio = dataUrlToFile(card.audioSrc);
                audioMimeType = audio.mimeType;
                audioFile = `audio/${baseName}.${extensionForMimeType(audio.mimeType, "bin")}`;
                entries.push({ name: audioFile, data: audio.bytes });
            }

            profileCards.push({
                id: card.id,
                name: card.name,
                imageFile,
                imageMimeType: image.mimeType,
                audioFile,
                audioMimeType
            });
        });

        const profile = {
            format: PROFILE_FORMAT,
            version: PROFILE_VERSION,
            name,
            exportedAt: new Date().toISOString(),
            catalogVersion: 1,
            customCards: profileCards
        };
        entries.unshift({ name: "profile.json", data: textEncoder.encode(JSON.stringify(profile, null, 2)) });

        const blob = new Blob([createZip(entries)], { type: ZIP_MIME_TYPE });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${safeFileName(name)}.pecs-profile.zip`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 0);
        return { profile, cardCount: storedCards.length };
    }

    async function importProfile(file) {
        if (!file) throw new Error("Choose a profile file first.");

        let entries;
        try {
            entries = readZip(await file.arrayBuffer());
        } catch (error) {
            throw new Error(error.message || "That file is not a valid ZIP profile.");
        }

        const profileBytes = entries.get("profile.json");
        if (!profileBytes) throw new Error("The ZIP does not contain profile.json.");

        let profile;
        try {
            profile = JSON.parse(textDecoder.decode(profileBytes));
        } catch (error) {
            throw new Error("The profile.json file inside the ZIP is not valid JSON.");
        }

        if (!profile || profile.format !== PROFILE_FORMAT || profile.version !== PROFILE_VERSION) {
            throw new Error("That file is not a supported PECS profile.");
        }
        if (!Array.isArray(profile.customCards)) {
            throw new Error("The profile does not contain a custom-card list.");
        }

        const cards = [];
        for (let index = 0; index < profile.customCards.length; index++) {
            const card = profile.customCards[index];
            const name = card && typeof card.name === "string" ? card.name.trim() : "";
            const imageFile = card && typeof card.imageFile === "string" ? card.imageFile : "";
            if (!name || !imageFile || !entries.has(imageFile)) {
                throw new Error(`Custom card ${index + 1} is invalid or is missing its image file.`);
            }

            const imageMimeType = typeof card.imageMimeType === "string"
                ? card.imageMimeType
                : mimeTypeForFileName(imageFile, "application/octet-stream");
            if (!imageMimeType.startsWith("image/")) {
                throw new Error(`Custom card ${index + 1} does not contain a supported image.`);
            }
            const audioFile = typeof card.audioFile === "string" && card.audioFile ? card.audioFile : null;
            if (audioFile && !entries.has(audioFile)) {
                throw new Error(`Custom card ${index + 1} is missing its audio file.`);
            }
            const audioMimeType = audioFile
                ? (typeof card.audioMimeType === "string"
                    ? card.audioMimeType
                    : mimeTypeForFileName(audioFile, "application/octet-stream"))
                : null;
            if (audioMimeType && !audioMimeType.startsWith("audio/")) {
                throw new Error(`Custom card ${index + 1} does not contain supported audio.`);
            }

            cards.push({
                id: typeof card.id === "string" && card.id ? card.id : `custom_imported_${Date.now()}_${index}`,
                name,
                imageSrc: await bytesToDataUrl(entries.get(imageFile), imageMimeType),
                audioSrc: audioFile
                    ? await bytesToDataUrl(
                        entries.get(audioFile),
                        audioMimeType
                    )
                    : null
            });
        }

        await saveCustomCards(cards);
        window.dispatchEvent(new CustomEvent("pecs:profile-imported", {
            detail: { profile, cards }
        }));
        return { profile, cards };
    }

    function setupProfileControls(options = {}) {
        const exportButton = document.getElementById(options.exportButtonId || "exportProfileBtn");
        const importButton = document.getElementById(options.importButtonId || "importProfileBtn");
        const fileInput = document.getElementById(options.fileInputId || "profileFileInput");
        if (!exportButton || !importButton || !fileInput) return;

        exportButton.addEventListener("click", async () => {
            const suggestedName = `PECS Profile ${new Date().toLocaleDateString()}`;
            const profileName = window.prompt("Name this PECS profile:", suggestedName);
            if (profileName === null) return;
            exportButton.disabled = true;
            try {
                const result = await exportProfile(profileName);
                window.alert(`Exported “${result.profile.name}” with ${result.cardCount} custom card(s).`);
            } catch (error) {
                window.alert(error.message || "The ZIP profile could not be exported.");
            } finally {
                exportButton.disabled = false;
            }
        });

        importButton.addEventListener("click", () => {
            fileInput.value = "";
            fileInput.click();
        });

        fileInput.addEventListener("change", async () => {
            const file = fileInput.files && fileInput.files[0];
            if (!file) return;
            if (!window.confirm("Importing this profile will replace the current custom cards on both pages. Continue?")) {
                fileInput.value = "";
                return;
            }

            try {
                const result = await importProfile(file);
                if (typeof options.onImported === "function") await options.onImported(result);
                window.alert(`Imported “${result.profile.name || "PECS Profile"}” with ${result.cards.length} custom card(s).`);
            } catch (error) {
                window.alert(error.message || "The profile could not be imported.");
            } finally {
                fileInput.value = "";
            }
        });
    }

    window.PecsLibrary = Object.freeze({
        STORAGE_KEY,
        categories: Object.freeze(categories.slice()),
        builtInCards: Object.freeze(builtInCards.map(card => Object.freeze({ ...card }))),
        getCustomCards,
        saveCustomCards,
        getAllCards,
        exportProfile,
        importProfile,
        setupProfileControls
    });
})();
