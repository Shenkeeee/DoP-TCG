import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const INPUT_FILE = join(__dirname, "dop.json");
const OUTPUT_FILE = join(__dirname, "DoPCards.json");

const BASE_IMAGE_URL =
  "https://github.com/Shenkeeee/deckbuilder/tree/master/src/assets/pics/cards";

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
        image: `${BASE_IMAGE_URL}/${id}.webp`,
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
