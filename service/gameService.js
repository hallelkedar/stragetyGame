import { throwError, fightCalculate } from "../utils/utils.js";
import { runComputerTurn } from "./computerAlgo.js";

const assertPhase = (game, phase) => {
  if (game.phase !== phase) throwError(`Phase is not ${phase}`, 400);
};

const assertPositiveNumber = (val, key) => {
  if (!Number.isInteger(val) || val < 1)
    throwError(`${key} must be a positive number`, 400);
};

const gameFormat = (gameDoc) => {
  return {
    id: gameDoc._id.toString(),
    playerName: gameDoc.playerName,
    round: gameDoc.round,
    phase: gameDoc.phase,
    status: gameDoc.status,
    winner: gameDoc.winner,
    territories: gameDoc.territories,
  };
};
const findTerritory = (game, id) =>
  game.territories.find((ter) => ter.id === id);

export default (gameRepo, mapRepo) => {
  const requireGame = async (gameId) => {
    const game = await gameRepo.getGameById(gameId);
    if (!game) throwError("Game not found", 404);
    return game;
  };

  const requireActiveGame = async (gameId) => {
    const game = await requireGame(gameId);
    if (game.status !== "playing") throwError("Game is not open", 409);
    return game;
  };

  return {
    getGame: async (gameId) => {
      const game = await requireGame(gameId);
      return gameFormat(game);
    },
    createNewGame: async (playerName) => {
      const map = await mapRepo.getMap();
      const territories = map.map(({ _id, ...ter }) => {
        return {
          ...ter,
          owner: ter.startOwner,
          soldiers: ter.headquarters ? 8 : 4,
        };
      });

      const gameId = await gameRepo.createGame(playerName, territories);
      const game = await gameRepo.getGameById(gameId);
      return gameFormat(game);
    },
    reinforce: async (gameId, territoryId) => {
      const game = await requireActiveGame(gameId);
      assertPhase(game, "reinforce");
      assertPositiveNumber(territoryId, "territoryId");

      const territory = findTerritory(game, territoryId);

      if (!territory || territory.owner !== "player")
        throwError("territory is not valid to reinforce", 400);

      territory.soldiers += 3;
      game.phase = "attack";

      await gameRepo.updateGame(gameId, game);

      return {
        game: gameFormat(game),
        playerEvent: {
          type: "reinforce",
          territoryId,
          soldiersAdded: 3,
        },
        computerEvents: [],
      };
    },

    attack: async (
      gameId,
      sourceId,
      targetId,
      soldiersAmount,
      skip = false,
    ) => {
      const game = await requireActiveGame(gameId);
      assertPhase(game, "attack");

      let playerEvent = [];

      if (!skip) {
        const source = findTerritory(game, sourceId);
        const target = findTerritory(game, targetId);

        if (!source || !target) throwError("source or target not found", 400);
        if (source.owner !== "player")
          throwError("source is not owned by player", 400);
        if (target.owner !== "computer")
          throwError("target is not owned by computer", 400);

        if (!source.neighbors.includes(targetId))
          throwError("source territory has no border with attack target", 400);

        if (source.soldiers <= soldiersAmount)
          throwError(
            "Not enough soldiers in source territory (has no stay at least one)",
            400,
          );

        const { winner, survivors } = fightCalculate(
          soldiersAmount,
          target.soldiers,
        );
        source.soldiers -= soldiersAmount;
        if (winner === "attacker") target.owner = "player";
        playerEvent = {
          type: "attack",
          fromId: sourceId,
          toId: targetId,
          soldiers: soldiersAmount,
          winner: winner === "attacker" ? "player" : "computer",
        };

        if (target.headquarters) {
          game.status = "finished";
          game.winner = "player";
          
          await gameRepo.updateGame(gameId, game);

          return {
            game: gameFormat(game),
            playerEvent,
            computerEvents: [],
          };
        }
      }

      game.phase = "move";
      await gameRepo.updateGame(gameId, game);

      return {
        game: gameFormat(game),
        playerEvent,
        computerEvents: [],
      };
    },

    move: async (gameId, sourceId, targetId, soldiersAmount) => {
      const game = await requireActiveGame(gameId);
      assertPhase(game, "move");

      const source = findTerritory(game, sourceId);
      const target = findTerritory(game, targetId);

      let playerEvent = null;

      if (!source || !target) throwError("source or target not found", 400);
      if (sourceId === targetId)
        throwError("source and target must be different", 400);
      if (source.owner !== "player" || target.owner !== "player")
        throwError("source and target must be player's territory", 400);

      if (source.soldiers <= soldiersAmount)
        throwError(
          "Not enough soldiers in source territory (has no stay at least one)",
          400,
        );
      
      source.soldiers -= soldiersAmount;
      target.soldiers += soldiersAmount;
      playerEvent = {
          type: "move",
          fromId: sourceId,
          toId: targetId,
          soldiers: soldiersAmount,
      }

      const computerEvents = runComputerTurn(game);

      if (game.status === "playing") {
        game.phase = "reinforce";
        game.round += 1;
      }
      await gameRepo.updateGame(gameId, game);

      return {
        game: gameFormat(game),
        playerEvent,
        computerEvents,
      };
    },

    endTurnWithoutMove: async (gameId) => {
      const game = await requireActiveGame(gameId);
      assertPhase(game, "move");

      const computerEvents = runComputerTurn(game);

      if (game.status === "playing") {
        game.phase = "reinforce";
        game.round += 1;
      }

      await updateGame(gameId, game);

      return {
        game: gameFormat(game),
        playerEvent: null,
        computerEvents,
      };
    },
  };
};
