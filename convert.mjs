import { readFileSync, writeFileSync } from "fs";
import path, { join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = join(__dirname, "dop.json");
const OUTPUT_FILE = join(__dirname, "DoPCards.json");

const BASE_IMAGE_URL = "https://shenkeeee.github.io/DoP-TCG/Images/cards";

const oldCards = JSON.parse(readFileSync(INPUT_FILE, "utf8"));

const newCards = {};

for (const card of oldCards) {
  const id = card.id;
  const data = card.data || {};

  const name = data.nev || id;
  const type = data.laptipus || "Unknown";
  const cost = Number(data["mana-koltseg"] || 0);

  newCards[id] = {
    id,
    face: {
      front: {
        name,
        type,
        cost,
        image: `${BASE_IMAGE_URL}/${id}.jpg`,
        isHorizontal: false,
      },
    },

    // Arena top-level fields
    name,
    type,
    cost,

    ...data,
  };
}

writeFileSync(OUTPUT_FILE, JSON.stringify(newCards, null, 2), "utf8");

console.log("Conversion complete → DoPCards.json generated");
