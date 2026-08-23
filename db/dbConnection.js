import { MongoClient } from "mongodb";
import "dotenv/config";

const URI = process.env.MONGO_URI;

let client = null;
let db = null;

export default connectToDB = async () => {
  try {
    client = new MongoClient(uri);
    await client.connect();
    if (!db) {
      db = client.db("armyGame");
    }
    return db;
  } catch (error) {
    console.error(error);
  }
};
