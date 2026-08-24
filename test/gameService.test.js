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

      assert.rejects(service.reinforce(1, 1), "territory is not valid to reinforce")
    });

    it("should throw error - territory id is not a number", async () => {
      const gameRepo = createMockRepo()
      const service = gameService(gameRepo, {})

      assert.rejects(service.reinforce(1, "e"))
    });
  });

  describe("check for attack phase", () => {
    it("should attack territory successfully", async () => {
      
    });

    it("should throw error - target is not in neihbors", async () => {});
  });

  describe("check for move phase", () => {
    it("should move soldiers successfully", async () => {});

    it("should throw error - source and target are the same", async () => {});
  });
});
