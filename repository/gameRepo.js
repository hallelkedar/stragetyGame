import { ObjectId } from "mongodb";
import {connectToDB} from "../db/dbConnection.js";

const db = await connectToDB()
const collection = db.collection("games");

export default {
  createGame: async (playerName, territories) => {
    const result = await collection.insertOne({
      playerName,
      territories,
      round: 1,
      phase: "reinforce",
      status: "playing",
      winner: null,
    });
   return result.insertedId
  },
  getGameById: async (gameId) => {
    return await collection.findOne({_id: gameId})
  },
  updateGame: async (gameId, gameData) => {
    const result = await collection.updateOne({_id: gameId}, gameData)
    return result.modifiedCount > 0
  }
};
