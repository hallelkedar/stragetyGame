import { connectToDB } from "../db/dbConnection.js";
import fs from "fs/promises";

const db = await connectToDB();
const collection = db.collection("map");

export default {
  getMap: async () => {
    return await collection.find().toArray();
  },
  createMap: async (map) => {
    if (await collection.find().toArray().length === 0) {
    await collection.insertMany(map);
    return true;
    }
    return null
  },
  getMapJSON: async () => {
    return await fs.readFile("./repository/ter.json", "utf-8");
  },
};
