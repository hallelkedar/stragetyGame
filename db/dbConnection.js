import { MongoClient } from "mongodb";
import "dotenv/config";

const URI = process.env.MONGO_URI;

let client = null;
let db = null;

export const connectToDB = async () => {
  try {
    client = new MongoClient(URI);
    await client.connect();
    if (db) {
      return db;
    }
    db = client.db("armyGame");
    console.log(`Connected to mongoDB - armyGame db`);
    return db;
  } catch (error) {
    console.error(error);
  }
};
