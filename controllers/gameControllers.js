import createGameService from "../service/gameService.js"
import gameRepo from "../repository/gameRepo.js"
import mapRepo from "../repository/mapRepo.js"
import { throwError } from "../utils/utils.js"

const gameService = createGameService(gameRepo, mapRepo)

export default {
    newGameCtrl: async (req, res) => {
        if (!req.body) throwError('Request must contain body', 422)
        const {playerName} = req.body
        if (!playerName || playerName.length === 0) throwError("Player name is not valid", 400)
        
        const game = await gameService.createNewGame(playerName.trim())
        return res.status(201).json(game)
    },
    getGameCtrl: async (req, res) => {
        const {id} = req.params
        const game = await gameService.getGame(id)
        return res.json(game)
    },

    reinforceTerCtrl: async (req, res) => {
        const {id} = req.params

        const {territoryId} = req.body || {}

        const result = await gameService.reinforce(id, Number(territoryId), 'player')
        return res.json(result)
    },

    attackCtrl: async (req, res) => {
        const {id} = req.params
        const { fromId, toId, soldiers, skip } = req.body || {}

        const result = await gameService.attack(id, Number(fromId), Number(toId), Number(soldiers), skip)
        return res.json(result)
    },

    moveCtrl: async (req, res) => {
        const {id} = req.params
        const { fromId, toId, soldiers, skip } = req.body || {}

        const result = await gameService.move(id, Number(fromId), Number(toId), Number(soldiers))
        return res.json(result)
    },

    endTurnCtrl: async (req, res) => {
        const {id} = req.params

        const result = await gameService.endTurnWithoutMove(id)
        return res.json(result)
    }
}