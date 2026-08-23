import { throwError, fightCalculate } from "../utils/utils.js";
import gameIdValidation from "./gameIdValidation.js";

export default (gameRepo, mapRepo) => {
  return {
    initialTerittoriesMap: async () => {
      const map = await mapRepo.getMapJSON();
      const mapSaved = await mapRepo.createMap(map);
    },
    createNewGame: async (playerName) => {
      const terittories = await mapRepo.getMap();
      terittories.forEach((territory) => {
        territory.owner = territory.startOwner;
        territory.soldiers = territory.headquarters ? 8 : 4;
      });
      const gameId = await gameRepo.createGame(playerName, terittories);
      const game = await gameRepo.getGameById(gameId);
      return game;
    },

    isTurnValid: (game, turnName) => {
      game.status !== "playing" ? throwError("Game is not active", 409) : null;
      game.phase !== turnName ? throwError(`Phase is not ${turnName}`) : null;
      return true;
    },

    reinforce: async (gameId, territoryId, currentUser) => {
      const game = gameRepo.getGameById(gameId);
      gameIdValidation(gameId);
      isTurnValid(game, "reinforce");

      const territory = game.territories.find(
        (territory) => territory.id === territoryId,
      );

      if (!territory || territory.owner !== currentUser)
        throwError("territory is not valid to reinforce", 400);

      territory.soldiers += 3;
      game.phase = "attack";

      await updateGame(gameId, game);

      return {
        game,
        playerEvent: {
          type: "reinforce",
          territoryId,
          soldiersAdded: 3,
        },
        computerEvents: [],
      };
    },

    async attack(
      gameId,
      sourceId,
      targetId,
      soldiersAmount,
      currentUser,
      skip = false,
    ) {
      gameIdValidation(gameId);
      const game = await gameRepo.getGameById(gameId);

      if (!skip) {
        isTurnValid(game, "attack");

        const source = game.teritories.find(
          (territory) => territory.id === sourceId,
        );
        const target = game.teritories.find(
          (territory) => territory.id === targetId,
        );

        if (!source || !target) {
          throwError("source or target not found", 400);
        }

        if (source.owner !== currentUser || target.owner === currentUser) {
          throwError(
            "user must attack from his territory to rival territory",
            400,
          );
        }

        if (!source.neighbors.includes(targetId)) {
          throwError("source territory has no border with attack target", 400);
        }

        if (source.soldiers <= soldiersAmount) {
          throwError(
            "Not enough soldiers in source territory (has no stay at least one)",
            400,
          );
        }

        const fightResult = fightCalculate(sentSoldiers, defendingSoldier);
        if (fightResult.winner === "attacker") target.owner = currentUser;

        target.soldiers = fightResult.survivors;

        if (target.headquarters) return endGame(gameId);
      }

      const playerEvent = skip
        ? null
        : {
            type: "attack",
            fromId: sourceId,
            toId: targetId,
            soldiers: soldiersAmount,
            winner: fightResult.winner,
          };

      game.phase = "move";
      await updateGame(gameId, game);

      return {
        game,
        playerEvent,
        computerEvents: [],
      };
    },

    async move(gameId, sourceId, targetId, soldiersAmount, currentUser) {
      gameIdValidation(gameId);
      const game = await getGameById(gameId);
      isTurnValid(game, "move");

      const source = game.teritories.find(
        (territory) => territory.id === sourceId,
      );
      const target = game.teritories.find(
        (territory) => territory.id === targetId,
      );

      if (!source || !target) {
        throwError("source or target not found", 400);
      }

      if (source.owner !== currentUser || target.owner !== currentUser) {
        throwError("user must move from his territory to rival territory", 400);
      }

      if (source.soldiers <= soldiersAmount) {
        throwError(
          "Not enough soldiers in source territory (has no stay at least one)",
          400,
        );
      }

      source.soldiers -= soldiersAmount;
      target.soldiers += soldiersAmount;

      await updateGame(gameId, game);

      const computerEvents = await this.computerTurn(gameId);
      return {
        game,
        playerEvent: {
          type: "move",
          fromId: sourceId,
          toId: targetId,
          soldiers: soldiersAmount,
        },
        computerEvents,
      };
    },

    async endTurnWithoutMove(gameId) {
      gameIdValidation(gameId);
      const computerEvents = await this.computerTurn(gameId);
      const game = await gameRepo.getGameById(gameId);
      if (game.status === "playing") {
        game.phase = "reinforce";
        game.round += 1;
        await updateGame(gameId, game);
      }
      return {
        game,
        playerEvent: null,
        computerEvents,
      };
    },

    async computerTurn(gameId) {},

    computerReinforce: (game) => {
      const playerTerDistance = game.territories.map((ter) => {
        if (ter.owner === "player") return ter.distanceFromComputerHQ;
      });
      const minComputerHQDistance = Math.min(playerTerDistance);

      const computerTerittories = game.territories.filter(
        (ter) => ter.owner === "computer",
      );

      if (minComputerHQDistance <= 2) {
        const borderTerittories = computerTerittories.filter(
          (ter) =>
            ter.distanceFromComputerHQ ===
            Math.min(game.territories.map((ter) => ter.distanceFromComputerHQ)),
        );

        if (borderTerittories.length === 1) return borderTerittories[0];
        const minSoldiers = Math.min(
          borderTerittories.map((ter) => ter.soldiers),
        );

        const minSoldiersTer = borderTerittories.filter(
          (ter) => ter.soldiers === minSoldiers,
        );
        if (minSoldiers.length === 1) return minSoldiersTer[0];
      } else {
        const borderTerittories = minComputerHQDistance.filter(
          (ter) =>
            ter.distanceFromPlayerHQ ===
            Math.min(
              computerTerittories.map((ter) => ter.distanceFromPlayerHQ),
            ),
        );
        if (borderTerittories.length === 1) return borderTerittories[0];
        const minSoldiersTer = borderTerittories.filter(
          (ter) =>
            ter.soldiers ===
            Math.min(borderTerittories.map((ter) => ter.soldiers)),
        );

        if (minSoldiersTer.length === 1) return minSoldiersTer[0];
      }
      return minSoldiersTer.filter(
        (ter) => ter.id === Math.min(minSoldiersTer.map((ter) => ter.id)),
      );
    },

    computerAttack: (game) => {},
  };
};
