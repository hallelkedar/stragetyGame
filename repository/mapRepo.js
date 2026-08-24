import { connectToDB } from "../db/dbConnection.js";
import fs from "fs/promises";

const db = await connectToDB();
const collection = db.collection("map");

export default {
  getMap: async () => {
    return await collection.find().toArray();
  },
  createMapIfNotExists: async () => {
    const mapDB = await await collection.find().toArray();
    if (mapDB.length > 0) return null;

    const mapFile = await fs.readFile("./repository/ter.json", "utf-8");
    const map = JSON.stringify(mapFile);

    await collection.insertMany(map);
    return true;
  },
};
