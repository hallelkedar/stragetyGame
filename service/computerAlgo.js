import { fightCalculate } from "../utils/utils.js";

const findTerritory = (territories, id) =>
  territories.find((ter) => ter.id === id);

const getOwnedBy = (territories, owner) =>
  territories.filter((t) => t.owner === owner);

const isBorderTerritory = (territories, territory) =>
  territory.neighbors.some((neighborId) => {
    const neighbor = findTerritory(territories, neighborId);
    return neighbor && neighbor.owner === "player";
  });

export const isComputerInDefense = (territories) => {
  const playerDistances = getOwnedBy(territories, "player").map(
    (t) => t.distanceFromComputerHQ,
  );
  if (playerDistances.length === 0) return false;
  return Math.min(...playerDistances) <= 2;
};

const pickMinOf = (list, ...keyFns) => {
  let candidates = list;
  for (const keyFn of keyFns) {
    const bestValue = Math.min(...candidates.map(keyFn));
    candidates = candidates.filter((item) => keyFn(item) === bestValue);
  }
  return candidates[0];
};

export const computerReinforce = (territories) => {
  const defense = isComputerInDefense(territories);
  const computerTerritories = getOwnedBy(territories, "computer");
  let border = computerTerritories.filter((t) =>
    isBorderTerritory(territories, t),
  );
  if (border.length === 0) border = computerTerritories;
  if (border.length === 0) return null;

  const chosenTer = defense
    ? pickMinOf(
        border,
        (ter) => ter.distanceFromComputerHQ,
        (ter) => ter.soldiers,
        (t) => t.id,
      )
    : pickMinOf(
        border,
        (t) => t.distanceFromPlayerHQ,
        (t) => -t.soldiers,
        (t) => t.id,
      );

  chosenTer.soldiers += 3;
  return { type: "reinforce", territoryId: chosenTer.id, soldiersAdded: 3 };
};

export const computerAttack = (territories) => {
  const computerTerritories = getOwnedBy(territories, "computer");
  const candidates = [];

  for (const from of computerTerritories) {
    const sentSoldiers = from.soldiers - 1;
    if (sentSoldiers < 1) continue;

    for (const neighborId of from.neighbors) {
      const to = findTerritory(territories, neighborId);
      if (!to || to.owner !== "player") continue;

      const isCandidate = to.headquarters
        ? sentSoldiers > to.soldiers
        : sentSoldiers / to.soldiers >= 1.35;
      if (!isCandidate) continue;

      const progress = from.distanceFromPlayerHQ - to.distanceFromPlayerHQ;
      const soldierAdvantage = sentSoldiers - to.soldiers;
      const protectsHeadquarters =
        Math.max(0, 3 - to.distanceFromComputerHQ) * 25;
      const headquartersScore = to.headquarters ? 1000 : 0;
      const score =
        progress * 10 +
        soldierAdvantage +
        protectsHeadquarters +
        headquartersScore;

      candidates.push({ from, to, sentSoldiers, score });
    }
  }

  if (candidates.length === 0) return null;

  const best = pickMinOf(
    candidates,
    (can) => -can.score,
    (c) => c.to.id,
    (c) => c.from.id,
  );
  const { from, to, sentSoldiers } = best;

  const { winner, survivors } = fightCalculate(sentSoldiers, to.soldiers);
  from.soldiers -= sentSoldiers;
  if (winner === "attacker") to.owner = "computer";
  to.soldiers = survivors;

  const headquartersCaptured = to.headquarters && winner === "attacker";

  return {
    event: {
      type: "attack",
      fromId: from.id,
      toId: to.id,
      soldiers: sentSoldiers,
      winner: winner === "attacker" ? "computer" : "player",
    },
    headquartersCaptured,
  };
};

export const computerMove = (territories) => {
  const defense = isComputerInDefense(territories);
  const computerTerritories = getOwnedBy(territories, "computer");
  const candidates = [];

  for (const from of computerTerritories) {
    if (isBorderTerritory(territories, from)) continue;
    const minToLeave = from.headquarters ? 4 : 1;
    if (from.soldiers <= minToLeave) continue;

    for (const neighborId of from.neighbors) {
      const to = findTerritory(territories, neighborId);
      if (!to || to.owner !== "computer" || to.id === from.id) continue;

      const isCandidate = defense
        ? to.distanceFromComputerHQ < from.distanceFromComputerHQ
        : to.distanceFromPlayerHQ < from.distanceFromPlayerHQ;
      if (!isCandidate) continue;

      candidates.push({ from, to });
    }
  }

  if (candidates.length === 0) return null;

  const best = pickMinOf(
    candidates,
    (c) => -c.from.soldiers,
    (c) => c.to.id,
    (c) => c.from.id,
  );
  const { from, to } = best;
  const moved = from.headquarters ? from.soldiers - 4 : from.soldiers - 1;

  from.soldiers -= moved;
  to.soldiers += moved;

  return { type: "move", fromId: from.id, toId: to.id, soldiers: moved };
};

export const runComputerTurn = (game) => {
  const computerEvents = [];

  const reinforceEvent = computerReinforce(game.territories);
  if (reinforceEvent) computerEvents.push(reinforceEvent);

  const attackResult = computerAttack(game.territories);
  if (attackResult) {
    computerEvents.push(attackResult.event);
    if (attackResult.headquartersCaptured) {
      game.status = "finished";
      game.winner = "computer";
      return computerEvents;
    }
  }

  const moveEvent = computerMove(game.territories);
  if (moveEvent) computerEvents.push(moveEvent);

  return computerEvents;
};
