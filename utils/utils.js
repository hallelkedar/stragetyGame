export const fightCalculate = (sentSoldiers, defendingSoldier) => {
  const attackLuck = 0.6 + Math.random() * 0.4;
  const defenseLuck = 0.6 + Math.random() * 0.4;

  const attackPower = sentSoldiers * attackLuck;
  const defensePower = defendingSoldiers * defenseLuck;

  const winner = attackPower > defensePower ? "attacker" : "defender";
  let survivors;

  if (winner === "attacker") {
    survivors = Math.max(
      1,
      Math.ceil((sentSoldiers * (attackPower - defensePower)) / attackPower),
    );
  }

  if (winner === "defender") {
    survivors = Math.max(
      1,
      Math.ceil(
        (defendingSoldiers * (defensePower - attackPower)) / defensePower,
      ),
    );
  }

  return {winner, survivors}
};

export const throwError = (msg, status) => {
  const error = new Error(msg)
  error.statusCode = status
  throw error
}