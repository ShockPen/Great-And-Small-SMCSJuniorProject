(function () {
    const STORAGE_KEY = "pecs_custom_cards";
    const DATABASE_NAME = "great_and_small_pecs";
    const DATABASE_STORE = "profile_data";
    const LEGACY_CUSTOM_CARDS_DATABASE_KEY = "custom_cards";
    const ACTIVE_CARDS_DATABASE_KEY = "active_cards";
    const CATEGORY_DATABASE_KEY = "category_settings";
    const PROFILE_FORMAT = "great-and-small-pecs-profile";
    const PROFILE_VERSION = 3;
    const ZIP_MIME_TYPE = "application/zip";
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();

    const builtInCards = [
        { name: "Blocks", category: "Objects", image: "./images/blocks.jpg", audio: "./audio/blocks.mp3" },
        { name: "Bubbles", category: "Objects", image: "./images/bubbles.jpg", audio: "./audio/bubbles.mp3" },
        { name: "Body Brush", category: "Objects", image: "./images/bodybrush.jpg", audio: "./audio/bodybrush.mp3" },
        { name: "Curry Comb", category: "Objects", image: "./images/currycomb.jpg", audio: "./audio/currycumb.mp3" },
        { name: "Hay Bale", category: "Objects", image: "./images/haybale.gif", audio: "./audio/haybale.mp3" },
        { name: "Hoof Pick", category: "Objects", image: "./images/hoofpickwithbrush.jpg", audio: "./audio/hoofpickwithbrush.mp3" },
        { name: "Mane & Tail Brush", category: "Objects", image: "./images/maneandtailbrush.png", audio: "./audio/maneandtailbrush.mp3" },

        { name: "Cat", category: "Animals", image: "./images/cat.jpg", audio: "./audio/cat.mp3" },
        { name: "Cow", category: "Animals", image: "./images/cow.jpg", audio: "./audio/cow.mp3" },
        { name: "Dog", category: "Animals", image: "./images/dog.jpg", audio: "./audio/dog.mp3" },
        { name: "Goat", category: "Animals", image: "./images/goat.gif", audio: "./audio/goat.mp3" },
        { name: "Horse", category: "Animals", image: "./images/horse.jpg", audio: "./audio/horse.mp3" },
        { name: "Kid", category: "Animals", image: "./images/kid.png", audio: null },
        { name: "Pig", category: "Animals", image: "./images/pig.jpg", audio: "./audio/pig.mp3" },

        { name: "Angry", category: "Emotions", image: "./images/angry.jpg", audio: "./audio/angry.mp3" },
        { name: "Crying", category: "Emotions", image: "./images/crying.jpg", audio: "./audio/crying.mp3" },
        { name: "Excited", category: "Emotions", image: "./images/excited.jpg", audio: "./audio/excited.mp3" },
        { name: "Happy", category: "Emotions", image: "./images/happy.jpg", audio: "./audio/happy.mp3" },
        { name: "Mad", category: "Emotions", image: "./images/mad.jpg", audio: "./audio/mad.mp3" },
        { name: "Proud", category: "Emotions", image: "./images/proud.jpg", audio: "./audio/proud.mp3" },
        { name: "Sad", category: "Emotions", image: "./images/sad.jpg", audio: "./audio/sad.mp3" },
        { name: "Surprised", category: "Emotions", image: "./images/surprised.gif", audio: "./audio/surprised.mp3" },

        { name: "Calm Down", category: "Actions", image: "./images/calmdown.jpg", audio: "./audio/calmdown.mp3" },
        { name: "Crying", category: "Actions", image: "./images/crying.jpg", audio: "./audio/crying.mp3" },
        { name: "Drinking", category: "Actions", image: "./images/drinking.jpg", audio: "./audio/drinking.mp3" },
        { name: "Eat", category: "Actions", image: "./images/eat.jpg", audio: "./audio/eat.mp3" },
        { name: "Fist Bump", category: "Actions", image: "./images/fistbump.jpg", audio: "./audio/fistbump.mp3" },
        { name: "Good Job", category: "Actions", image: "./images/goodjob.jpg", audio: "./audio/goodjob.mp3" },
        { name: "High Five", category: "Actions", image: "./images/highfive.jpg", audio: "./audio/highfive.mp3" },
        { name: "Listen", category: "Actions", image: "./images/listen.jpg", audio: "./audio/listen.mp3" },
        { name: "Put On Helmet", category: "Actions", image: "./images/putonhelmet.jpg", audio: "./audio/putonhelmet.mp3" },
        { name: "Quiet", category: "Actions", image: "./images/quiet.jpg", audio: "./audio/quiet.mp3" },
        { name: "Sit", category: "Actions", image: "./images/sit.jpg", audio: "./audio/sit.mp3" },
        { name: "Wait", category: "Actions", image: "./images/wait.jpg", audio: "./audio/wait.mp3" },

        { name: "Yes", category: "General Communication", image: "./images/yes.svg", audio: null },
        { name: "No", category: "General Communication", image: "./images/no.svg", audio: null },
        { name: "Good Job", category: "General Communication", image: "./images/goodjob.jpg", audio: "./audio/goodjob.mp3" },
        { name: "Hello", category: "General Communication", image: "./images/hello.jpg", audio: "./audio/hello.mp3" },
        { name: "I Don't Know", category: "General Communication", image: "./images/idon'tknow.jpg", audio: "./audio/idon'tknow.mp3" },
        { name: "I Need Help", category: "General Communication", image: "./images/ineedhelp.jpg", audio: "./audio/ineedhelp.mp3" },
        { name: "I Want", category: "General Communication", image: "./images/iwant.jpg", audio: "./audio/iwant.mp3" },
        { name: "This One", category: "General Communication", image: "./images/thisone.jpg", audio: "./audio/thisone.mp3" },
        { name: "Wait", category: "General Communication", image: "./images/wait.jpg", audio: "./audio/wait.mp3" },
    ];

    function normalizeStoredCard(card, index) {
        if (!card || typeof card !== "object") return null;

        const name = typeof card.name === "string" ? card.name.trim() : "";
        const category = typeof card.category === "string" && card.category.trim()
            ? card.category.trim()
            : "Custom Cards";
        const image = typeof card.image === "string"
            ? card.image
            : (typeof card.imageSrc === "string" ? card.imageSrc : "");
        const audio = typeof card.audio === "string"
            ? card.audio
            : (typeof card.audioSrc === "string" ? card.audioSrc : null);
        if (!name || !image) return null;

        return {
            id: typeof card.id === "string" && card.id ? card.id : `custom_imported_${Date.now()}_${index}`,
            name,
            category,
            image,
            audio
        };
    }

    function normalizeActiveCard(card, index) {
        const normalized = normalizeStoredCard(card, index);
        if (!normalized) return null;
        return {
            id: typeof card.id === "string" && card.id
                ? card.id
                : `card_${Date.now()}_${index}`,
            name: normalized.name,
            category: normalized.category,
            image: normalized.image,
            audio: normalized.audio
        };
    }

    let databasePromise = null;
    let memoryFallbackCards = [];
    let memoryFallbackActiveCards = null;
    let memoryFallbackCategorySettings = null;

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

    async function readDatabaseValue(key) {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const request = database.transaction(DATABASE_STORE, "readonly")
                .objectStore(DATABASE_STORE)
                .get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error("The active profile could not be read."));
        });
    }

    async function writeDatabaseValue(key, value) {
        const database = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(DATABASE_STORE, "readwrite");
            transaction.objectStore(DATABASE_STORE).put(value, key);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error || new Error("The active profile could not be saved."));
            transaction.onabort = () => reject(transaction.error || new Error("Saving the active profile was interrupted."));
        });
    }

    const readDatabaseCards = () => readDatabaseValue(LEGACY_CUSTOM_CARDS_DATABASE_KEY);
    const writeDatabaseCards = cards => writeDatabaseValue(LEGACY_CUSTOM_CARDS_DATABASE_KEY, cards);

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

    function builtInCardKey(card) {
        return `built-in:${card.category}|${card.name}|${card.image}`;
    }

    function customCardKey(card) {
        return `custom:${card.id}`;
    }

    function defaultCards() {
        return builtInCards.map(card => ({
            id: builtInCardKey(card),
            ...card
        }));
    }

    function defaultCategorySettings() {
        return {
            categories: Array.from(new Set(builtInCards.map(card => card.category).concat("Custom Cards"))),
            assignments: {}
        };
    }

    function normalizeCategorySettings(settings) {
        const fallback = defaultCategorySettings();
        if (!settings || typeof settings !== "object") return fallback;

        const categories = [];
        const addCategory = category => {
            const name = typeof category === "string" ? category.trim() : "";
            if (name && !categories.includes(name)) categories.push(name);
        };
        if (Array.isArray(settings.categories)) settings.categories.forEach(addCategory);

        const assignments = {};
        if (settings.assignments && typeof settings.assignments === "object") {
            Object.entries(settings.assignments).forEach(([cardKey, category]) => {
                const name = typeof category === "string" ? category.trim() : "";
                if (!cardKey || !name) return;
                assignments[cardKey] = name;
                addCategory(name);
            });
        }

        if (categories.length === 0) return fallback;
        return { categories, assignments };
    }

    async function getCategorySettings() {
        try {
            let settings = await readDatabaseValue(CATEGORY_DATABASE_KEY);
            settings = normalizeCategorySettings(settings);
            memoryFallbackCategorySettings = settings;
            return {
                categories: settings.categories.slice(),
                assignments: { ...settings.assignments }
            };
        } catch (error) {
            console.error("Failed loading category settings from IndexedDB:", error);
            const settings = memoryFallbackCategorySettings || defaultCategorySettings();
            return {
                categories: settings.categories.slice(),
                assignments: { ...settings.assignments }
            };
        }
    }

    async function saveCategorySettings(settings) {
        const normalized = normalizeCategorySettings(settings);
        memoryFallbackCategorySettings = normalized;
        await writeDatabaseValue(CATEGORY_DATABASE_KEY, normalized);
        window.dispatchEvent(new CustomEvent("pecs:categories-changed", { detail: normalized }));
        return {
            categories: normalized.categories.slice(),
            assignments: { ...normalized.assignments }
        };
    }

    function decorateCard(card) {
        return {
            ...card,
            cardKey: card.id,
            isDefault: card.id.startsWith("built-in:"),
            isCustom: !card.id.startsWith("built-in:")
        };
    }

    async function getAllCards() {
        try {
            let activeCards = await readDatabaseValue(ACTIVE_CARDS_DATABASE_KEY);
            if (activeCards === undefined) {
                const [legacyCustomCards, settings] = await Promise.all([
                    getCustomCards(),
                    getCategorySettings()
                ]);
                activeCards = defaultCards().map(card => ({
                    ...card,
                    category: settings.assignments[card.id] || card.category
                })).concat(legacyCustomCards.map(card => ({
                    ...card,
                    category: settings.assignments[customCardKey(card)] || card.category
                })));
                activeCards = await saveAllCards(activeCards);
            } else {
                activeCards = Array.isArray(activeCards)
                    ? activeCards.map(normalizeActiveCard).filter(Boolean)
                    : [];
            }
            memoryFallbackActiveCards = activeCards.map(card => ({ ...card }));
            return activeCards.map(decorateCard);
        } catch (error) {
            console.error("Failed loading the active card catalog from IndexedDB:", error);
            const cards = memoryFallbackActiveCards || defaultCards().concat(memoryFallbackCards);
            return cards.map(normalizeActiveCard).filter(Boolean).map(decorateCard);
        }
    }

    async function saveAllCards(cards) {
        const normalizedCards = Array.isArray(cards)
            ? cards.map(normalizeActiveCard).filter(Boolean)
            : [];
        memoryFallbackActiveCards = normalizedCards.map(card => ({ ...card }));
        await writeDatabaseValue(ACTIVE_CARDS_DATABASE_KEY, normalizedCards);
        window.dispatchEvent(new CustomEvent("pecs:cards-changed", { detail: normalizedCards }));
        return normalizedCards.map(decorateCard);
    }

    async function resetToDefaults() {
        const cards = await saveAllCards(defaultCards());
        const settings = await saveCategorySettings(defaultCategorySettings());
        return { cards, settings };
    }

    function groupCardsByCategory(cards, categoryOrder = []) {
        const discoveredGroups = (Array.isArray(cards) ? cards : []).reduce((groups, card) => {
            if (!card || !card.category) return groups;
            if (!groups.has(card.category)) groups.set(card.category, []);
            groups.get(card.category).push(card);
            return groups;
        }, new Map());
        const orderedGroups = new Map();
        (Array.isArray(categoryOrder) ? categoryOrder : []).forEach(category => {
            if (discoveredGroups.has(category)) {
                orderedGroups.set(category, discoveredGroups.get(category));
                discoveredGroups.delete(category);
            }
        });
        discoveredGroups.forEach((categoryCards, category) => orderedGroups.set(category, categoryCards));
        return orderedGroups;
    }

    function getCategories(cards, categoryOrder) {
        return Array.from(groupCardsByCategory(cards, categoryOrder).keys());
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

    async function mediaSourceToFile(source, fallbackMimeType) {
        if (source.startsWith("data:")) return dataUrlToFile(source);
        const response = await fetch(source);
        if (!response.ok) throw new Error(`The media file “${source}” could not be loaded for export.`);
        const responseMimeType = response.headers.get("content-type");
        const mimeType = responseMimeType
            ? responseMimeType.split(";")[0]
            : mimeTypeForFileName(source, fallbackMimeType);
        return {
            mimeType,
            bytes: new Uint8Array(await response.arrayBuffer())
        };
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
        const [storedCards, categorySettings] = await Promise.all([
            getAllCards(),
            getCategorySettings()
        ]);
        const entries = [];
        const profileCards = [];

        for (let index = 0; index < storedCards.length; index++) {
            const card = storedCards[index];
            const image = await mediaSourceToFile(card.image, "application/octet-stream");
            const baseName = `${String(index + 1).padStart(3, "0")}-${safeFileName(card.name)}`;
            const imageFile = `images/${baseName}.${extensionForMimeType(image.mimeType, "bin")}`;
            entries.push({ name: imageFile, data: image.bytes });

            let audioFile = null;
            let audioMimeType = null;
            if (card.audio) {
                const audio = await mediaSourceToFile(card.audio, "application/octet-stream");
                audioMimeType = audio.mimeType;
                audioFile = `audio/${baseName}.${extensionForMimeType(audio.mimeType, "bin")}`;
                entries.push({ name: audioFile, data: audio.bytes });
            }

            profileCards.push({
                id: card.id,
                name: card.name,
                category: card.category,
                imageFile,
                imageMimeType: image.mimeType,
                audioFile,
                audioMimeType
            });
        }

        const profile = {
            format: PROFILE_FORMAT,
            version: PROFILE_VERSION,
            name,
            exportedAt: new Date().toISOString(),
            catalogVersion: 2,
            categorySettings: {
                categories: categorySettings.categories,
                assignments: {}
            },
            cards: profileCards
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

        if (!profile || profile.format !== PROFILE_FORMAT || ![2, PROFILE_VERSION].includes(profile.version)) {
            throw new Error("That file is not a supported PECS profile.");
        }
        const profileCards = Array.isArray(profile.cards) ? profile.cards : profile.customCards;
        if (!Array.isArray(profileCards)) {
            throw new Error("The profile does not contain a card list.");
        }

        const cards = [];
        const cardIds = new Set();
        for (let index = 0; index < profileCards.length; index++) {
            const card = profileCards[index];
            const name = card && typeof card.name === "string" ? card.name.trim() : "";
            const imageFile = card && typeof card.imageFile === "string" ? card.imageFile : "";
            if (!name || !imageFile || !entries.has(imageFile)) {
                throw new Error(`Card ${index + 1} is invalid or is missing its image file.`);
            }

            const imageMimeType = typeof card.imageMimeType === "string"
                ? card.imageMimeType
                : mimeTypeForFileName(imageFile, "application/octet-stream");
            if (!imageMimeType.startsWith("image/")) {
                throw new Error(`Card ${index + 1} does not contain a supported image.`);
            }
            const audioFile = typeof card.audioFile === "string" && card.audioFile ? card.audioFile : null;
            if (audioFile && !entries.has(audioFile)) {
                throw new Error(`Card ${index + 1} is missing its audio file.`);
            }
            const audioMimeType = audioFile
                ? (typeof card.audioMimeType === "string"
                    ? card.audioMimeType
                    : mimeTypeForFileName(audioFile, "application/octet-stream"))
                : null;
            if (audioMimeType && !audioMimeType.startsWith("audio/")) {
                throw new Error(`Card ${index + 1} does not contain supported audio.`);
            }

            const id = typeof card.id === "string" && card.id ? card.id : `imported_${Date.now()}_${index}`;
            if (cardIds.has(id)) throw new Error(`Card ${index + 1} has a duplicate ID.`);
            cardIds.add(id);
            const legacyAssignments = profile.categorySettings && profile.categorySettings.assignments;
            const assignedCategory = legacyAssignments && (
                legacyAssignments[id] || legacyAssignments[`custom:${id}`]
            );
            cards.push({
                id,
                name,
                category: typeof assignedCategory === "string" && assignedCategory.trim()
                    ? assignedCategory.trim()
                    : (typeof card.category === "string" && card.category.trim()
                    ? card.category.trim()
                    : "Custom Cards"),
                image: await bytesToDataUrl(entries.get(imageFile), imageMimeType),
                audio: audioFile
                    ? await bytesToDataUrl(
                        entries.get(audioFile),
                        audioMimeType
                    )
                    : null
            });
        }

        const importedCategories = profile.categorySettings && Array.isArray(profile.categorySettings.categories)
            ? profile.categorySettings.categories
            : [];
        cards.forEach(card => {
            if (!importedCategories.includes(card.category)) importedCategories.push(card.category);
        });
        await saveAllCards(cards);
        await saveCategorySettings({ categories: importedCategories, assignments: {} });
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
                window.alert(`Exported “${result.profile.name}” with ${result.cardCount} card(s).`);
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
            if (!window.confirm("Importing this profile will completely replace the current cards and category organization on both pages. Continue?")) {
                fileInput.value = "";
                return;
            }

            try {
                const result = await importProfile(file);
                if (typeof options.onImported === "function") await options.onImported(result);
                window.alert(`Imported “${result.profile.name || "PECS Profile"}” with ${result.cards.length} card(s).`);
            } catch (error) {
                window.alert(error.message || "The profile could not be imported.");
            } finally {
                fileInput.value = "";
            }
        });
    }

    window.PecsLibrary = Object.freeze({
        STORAGE_KEY,
        builtInCards: Object.freeze(builtInCards.map(card => Object.freeze({ ...card }))),
        getCustomCards,
        saveCustomCards,
        getCategorySettings,
        saveCategorySettings,
        getAllCards,
        saveAllCards,
        resetToDefaults,
        getCategories,
        groupCardsByCategory,
        exportProfile,
        importProfile,
        setupProfileControls
    });
})();
