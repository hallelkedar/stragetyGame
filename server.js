import express from "express";
import cors from "cors";
import "dotenv/config";
import gameControllers from "./controllers/gameControllers.js";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./middlewares/logger.js";
import mapRepo from "./repository/mapRepo.js";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use(logger);

app.post("/games", gameControllers.newGameCtrl);
app.get("/games/:id", gameControllers.getGameCtrl);
app.post("/games/:id/reinforce", gameControllers.reinforceTerCtrl);
app.post("/games/:id/attack", gameControllers.attackCtrl);
app.post("/games/:id/move", gameControllers.moveCtrl);
app.post("/games/:id/end-turn", gameControllers.endTurnCtrl);

app.use(errorHandler);

const start = () => {
  mapRepo.createMapIfNotExists();
  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT} \n`);
  });
};

start()
