import db from "../db/dbConnection.js";

const collection = db.collection("games");

export default {
  createGame: async (name, teritories) => {
    const result = await collection.insertOne({
      name,
      teritories,
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
