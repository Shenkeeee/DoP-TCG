const https = require("https");
const fs = require("fs");

// URL de l’API YGOProDeck
const API_URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php";

// Fonction fetch simple avec https
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = "";

            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    resolve(JSON.parse(data));
                } catch (err) {
                    reject("JSON parse error: " + err);
                }
            });
        }).on("error", (err) => reject("HTTP error: " + err));
    });
}

async function modifyJsonFile(outputFilePath) {
    console.log("Téléchargement des données YGOProDeck...");

    let jsonObject;
    try {
        jsonObject = await fetchJson(API_URL);
    } catch (err) {
        console.error("Erreur API :", err);
        return;
    }

    if (!jsonObject.data) {
        console.error("Format API invalide");
        return;
    }

    let result = {};
    let errorCount = 0;

    jsonObject.data.forEach((c) => {
        const cardId = c.id;

        // Détection du type
        let type = "Monster";
        const lower = c.type.toLowerCase();

        if (lower.includes("spell")) type = "Spell";
        else if (lower.includes("trap")) type = "Trap";
        else if (lower.includes("skill")) type = "Skill";

        const newCard = {
            id: cardId,
            face: {
                front: {
                    name: c.name,
                    type: type,
                    cost: 0,
                    image: c.card_images?.[0]?.image_url || "",
                    isHorizontal: false,
                },
            },
            name: c.name,
            type: type,
            "Type line": c.humanReadableCardType,
            cost: 0,
            rarity: c.set_rarity,
            race: c.race,
            archetype: c.archetype,
            atk: c.atk,
            def: c.def,
            level: c.level,
            attribute: c.attribute,
        };

        // Gestion des doublons
        if (result[cardId]) {
            console.log("❌ Doublon détecté : " + c.name + " (id " + cardId + ")");
            errorCount++;
        } else {
            result[cardId] = newCard;
        }
    });

    // Sauvegarde dans un fichier
    fs.writeFile(outputFilePath, JSON.stringify(result, null, 2), "utf8", (err) => {
        if (err) {
            console.error("Erreur d'écriture du fichier JSON :", err);
        } else {
            console.log("✔ Fichier sauvegardé sous", outputFilePath);
            console.log(
                `✔ ${Object.keys(result).length} cartes sauvegardées / ${jsonObject.data.length} reçues`
            );
            console.log(`⚠ ${errorCount} erreurs / doublons`);
        }
    });
}

// Exécution
modifyJsonFile("DoPCards.json");
