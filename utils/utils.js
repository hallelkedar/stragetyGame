export const fightCalculate = (sentSoldiers, defendingSoldier) => {
  attackLuck = 0.6 + Math.random() * 0.4;
  defenseLuck = 0.6 + Math.random() * 0.4;

  attackPower = sentSoldiers * attackLuck;
  defensePower = defendingSoldiers * defenseLuck;

  const winner = attackPower > defensePower ? "attacker" : "defender";
  let survivers;

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

  return {winner, survivers}
};

export const throwError = (msg, status) => {
  const error = new Error(msg)
  error.statusCode = status
  throw error
}