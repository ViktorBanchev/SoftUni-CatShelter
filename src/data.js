import fs from "fs/promises"

const dbSerialized = await fs.readFile("./src/db.json");
const db = JSON.parse(dbSerialized);

export async function getCats() {
    return db.cats;
}


export async function saveCat(cat) {
    db.cats.push(cat);

    const dbSerialized = JSON.stringify(db, null, 2);

    await fs.writeFile("./src/db.json", dbSerialized, {encoding: "utf-8"});
}