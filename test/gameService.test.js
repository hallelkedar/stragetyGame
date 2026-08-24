import { describe, it, mock } from "node:test";
import assert from "node:assert";
import gameService from "../service/gameService.js";

let game;

const createMockRepo = (gameDetails = {}) => {
  const game = {
    _id: { toString: () => 1 },
    phase: "reinforce",
    status: "playing",
    winner: null,
    territories: [
      {
        id: 1,
        neighbors: [2, 3],
        distanceFromComputerHQ: 1,
        distanceFromPlayerHQ: 6,
        owner: "player",
      },
      {
        id: 2,
        neighbors: [1, 3],
        distanceFromComputerHQ: 1,
        distanceFromPlayerHQ: 6,
        owner: "computer",
      },
    ],
    ...gameDetails,
  };
  return {
    getGameById: mock.fn(async (id) => game),
    updateGame: mock.fn(async () => null),
  };
};

describe("game service function test", () => {
  describe("check for reinforce phase", () => {
    it("should add 3 soldiers to correct selected territory", async () => {
      const mockRepo = createMockRepo();
      const service = gameService(mockRepo, {});

      const result = await service.reinforce(1, 1);

      assert.strictEqual(result.playerEvent.soldiersAdded, 3);
    });

    it("should throw error - reinforce on non player owner ter", async () => {
      const mockRepo = createMockRepo({
        territories: [
          {
            id: 1,
            neighbors: [2, 3],
            distanceFromComputerHQ: 1,
            distanceFromPlayerHQ: 6,
            owner: "computer",
          },
        ],
      });
      const service = gameService(mockRepo, {});

      await assert.rejects(service.reinforce(1, 1), (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "territory is not valid to reinforce");
        return true;
      });
    });

    it("should throw error - territory id is not a number", async () => {
      const gameRepo = createMockRepo();
      const service = gameService(gameRepo, {});

      await assert.rejects(service.reinforce(1, "e"), (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(
          err.message,
          "territoryId must be a positive number",
        );
        return true;
      });
    });
  });

  describe("check for attack phase", () => {
    it("should attack territory successfully", async () => {
      const mockRepo = createMockRepo({
        phase: "attack",
        territories: [
          {
            id: 1,
            neighbors: [2, 3],
            distanceFromComputerHQ: 1,
            distanceFromPlayerHQ: 6,
            owner: "player",
          },
          {
            id: 2,
            neighbors: [1, 3],
            distanceFromComputerHQ: 1,
            distanceFromPlayerHQ: 6,
            owner: "computer",
          },
        ],
      });
      const sevrice = gameService(mockRepo, {});

      const result = await sevrice.attack(1, 1, 2, 2);
      assert.ok(result.playerEvent);
    });

    it("should throw error - target not found", async () => {
      const mockRepo = createMockRepo({ phase: "attack" });
      const service = gameService(mockRepo, {});

      await assert.rejects(service.attack(1, 1, 8, 3), (err) => {
        assert.strictEqual(err.statusCode, 400);
        return true;
      });
    });
  });

  describe("check for move phase", () => {
    it("should move soldiers successfully", async () => {
      const mockRepo = createMockRepo({
        phase: "move",
        territories: [
          {
            id: 1,
            neighbors: [2, 3],
            distanceFromComputerHQ: 1,
            distanceFromPlayerHQ: 6,
            owner: "player",
          },
          {
            id: 2,
            neighbors: [1, 3],
            distanceFromComputerHQ: 1,
            distanceFromPlayerHQ: 6,
            owner: "player",
          },
        ],
      });
      const service = gameService(mockRepo, {});

      const result = await service.move(1, 1, 2, 1);
      assert.ok(result.playerEvent);
    });

    it("should throw error - source and target are the same", async () => {
      const mockRepo = createMockRepo({
        phase: "move",
      });
      const service = gameService(mockRepo, {});

      await assert.rejects(service.move(1, 2, 2, 2), (e) => {
        assert.strictEqual(e.statusCode, 400);
        return true;
      });
    });
  });
});
