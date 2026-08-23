export default createService = (gameRepo, mapRepo) => {
  return {
    createNewGame: async (name) => {
      const teritories = await mapRepo.get();
      teritories.forEach((territory) => {
        territory.owner = territory.startOwner;
        territory.soldiers = 3;
      });
      const gameId = gameRepo.createGame(name, teritories);
      const game = gameRepo.getGameById(gameId);
      return game;
    },

    isTurnValid: (game, turnName) => {
      if (game.status !== "playing") {
        return { success: false, message: "Game is not active" };
      }
      if (game.phase !== turnName) {
        return { success: false, message: `Phase is not ${turnName}` };
      }
      return { success: true };
    },

    reinforce: async (gameId, territoryId, currentUser) => {
      const game = gameRepo.getGameById(gameId);
      const validation = isTurnValid(game, "reinforce");
      if (!validation.success) {
        return validation;
      }

      const territory = game.territories.find(
        (territory) => territory.id === territoryId,
      );

      if (!territory || territory.owner !== currentUser)
        return {
          success: false,
          message: "territory is not valid to reinforce",
        };

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

    async attack(gameId, sourceId, targetId, soldiersAmount, currentUser) {
      const game = await gameRepo.getGameById(gameId);
      const validation = isTurnValid(game, "attack");
      if (!validation.success) {
        return validation;
      }

      const source = game.teritories.find(
        (territory) => territory.id === sourceId,
      );
      const target = game.teritories.find(
        (territory) => territory.id === targetId,
      );

      if (!source || !target) {
        return {
          success: false,
          message: "source or target not found",
        };
      }

      if (source.owner !== currentUser || target.owner === currentUser) {
        return {
          success: false,
          message: "user must attack from his territory to rival territory",
        };
      }

      if (!source.neighbors.includes(targetId)) {
        return {
          success: false,
          message: "source territory has no border with attack target",
        };
      }

      if (source.soldiers <= soldiersAmount) {
        return {
          success: false,
          message:
            "Not enough soldiers in source territory (has no stay at least one)",
        };

        const fightResult = fightCalculate(sentSoldiers, defendingSoldier);
        if (fightResult.winner === "attacker") target.owner = currentUser;

        target.soldiers = fightResult.survivors;

        if (target.headquarters) return endGame(gameId);

        game.phase = "move";
        await updateGame(gameId, game);

        return {
          game,
          playerEvent: {
            type: "attack",
            fromId: sourceId,
            toId: targetId,
            soldiers: soldiersAmount,
            winner: fightResult.winner,
          },
          computerEvents: [],
        };
      }
    },

    async move(gameId, sourceId, targetId, soldiersAmount, currentUser) {
      const game = await getGameById(gameId);
      const validation = isTurnValid(game, "move");
      if (!validation.success) {
        return validation;
      }

      const source = game.teritories.find(
        (territory) => territory.id === sourceId,
      );
      const target = game.teritories.find(
        (territory) => territory.id === targetId,
      ); 

      if (!source || !target) {
        return {
          success: false,
          message: "source or target not found",
        };
      }

      if (source.owner !== currentUser || target.owner !== currentUser) {
        return {
          success: false,
          message: "user must attack from his territory to rival territory",
        };
      }

      if (source.soldiers <= soldiersAmount) {
        return {
          success: false,
          message:
            "Not enough soldiers in source territory (has no stay at least one)",
        };
    }
      
      source.soldiers -= soldiersAmount
      target.soldiers += soldiersAmount

      await updateGame(gameId, game)

      const computerEvents = await computerTurn(gameId)
      return {
        game,
        playerEvent: {
            type: "move",
            fromId: sourceId,
            toId: targetId,
            soldiers: soldiersAmount
        },
        computerEvents
      }
    },

    async endTurnWithoutMove (gameId) {
        const computerEvents = await computerTurn(gameId)
        const game = await gameRepo.getGameById(gameId)
        if (game.status === 'playing') {
            game.phase = 'reinforce'
            game.round += 1
            await updateGame(gameId, game)
        }
        return {
            game,
            playerEvent: null,
            computerEvents
        }
    },
  }
}
