import gameRepo from "../repository/gameRepo.js"
import { throwError } from "../utils/utils.js"

export default async (gameId) => {
    const game = await gameRepo.getGameById(gameId)
    if (!game) throwError("Game not found", 400)
    if (game.status !== "playing") throwError("Game is not open", 409)
    return true
}