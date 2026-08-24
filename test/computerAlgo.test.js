import fs from "fs/promises";
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  computerAttack,
  computerMove,
  computerReinforce,
  runComputerTurn,
} from "../service/computerAlgo.js";

const getCleanTerritories = async () => {
  const mapFile = await fs.readFile("./repository/ter.json", "utf-8");
  const ters = JSON.parse(mapFile);
  return ters.map((ter) => {
    return {
      ...ter,
      owner: ter.startOwner,
      soldiers: ter.headquarters ? 8 : 4,
    };
  });
};

const findTerritory = (territories, id) =>
  territories.find((ter) => ter.id === id);

describe("Computer algorithm tests", () => {
  it("should add 3 soldiers to territory 2 (computer is prottecting his HQ)", async () => {
    const map = await getCleanTerritories();

    const tsidon = findTerritory(map, 4);
    tsidon.owner = "player";
    tsidon.soldiers = 10;

    const result = computerReinforce(map);

    assert.ok(result, "should successfully return computerEvent");
    assert.strictEqual(result.territoryId, 2);
    assert.strictEqual(result.soldiersAdded, 3);
  });

  it("should return victory to computer bc computer wil winning attack on jerusalem", async () => {
    const map = await getCleanTerritories();

    const afula = findTerritory(map, 16);
    afula.owner = "computer";
    afula.soldiers = 20;

    const jerusalem = findTerritory(map, 17);
    jerusalem.soldiers = 3;

    const result = computerAttack(map);

    assert.ok(result, "actually attack and not decide to skip");
    assert.ok(
      result.headquartersCaptured,
      "a hq is captured and computer is winning",
    );
  });

  it("should only do a reinforce and not attack", async () => {
    const map = await getCleanTerritories();

    map.forEach(
      (ter) => (ter.soldiers = ter.owner === "player" ? 20 : ter.soldiers),
    );

    const reinforceResult = computerReinforce(map);
    const attackResult = computerAttack(map);

    assert.ok(reinforceResult);
    assert.ok(!attackResult);
  });

  it("should move soldiers only from back (not border ter)", async () => {
    const map = await getCleanTerritories();

    const computerTer = map.filter((ter) => ter.owner === "computer");
    const nonBorderTers = computerTer.filter((ter) =>
      ter.neighbors.filter((id) => findTerritory(map, id).owner !== "player"),
    );
    const nonBorderIds = nonBorderTers.map((t) => t.id);

    const game = {
      territories: map,
    };
    const result = runComputerTurn(game);
    const moveFrom = result[2].fromId;

    assert.ok(result[2]);
    assert.ok(nonBorderIds.includes(moveFrom));
  });
});
