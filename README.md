# North israel campaign - IDF strategy game
## strategy game server that can connect to interctive front board game

### Install and run
- if you wanna use docker - you can run with:
```
docker-compose up -d
```
* Create your .env file with PORT and MONGO_URI
* Run with 
```
npm install
```
```
npm start
```

### Server Endpoints

server has 6 endpoints:

```
POST /games - Create a new game

body: {playerName: String}
response-status: 201 / 400 (name is not define)
response-data - {
  "id": "game-id",
  "playerName": String,
  "round": 1,
  "phase": "reinforce",
  "status": "playing",
  "winner": null,
  "territories": []
}

GET /games/:id - Load a game

body: null
response-status: 200 / 404 (game not found)
response-data - {
  "id": "game-id",
  "playerName": string,
  "round": 1,
  "phase": "reinforce",
  "status": "playing",
  "winner": null,
  "territories": []
}


POST /games/:id/reinforce - Reinforce territory

body: { "territoryId": Number }
response-status: 200 / 404 (game not found) / 409 (game is not active) / 400
response-data - {
  "game": {
    "id": "game-id",
    "playerName": String,
    "round": Number,
    "phase": "reinforce",
    "status": "playing",
    "winner": null,
    "territories": []
  },
  "playerEvent": null,
  "computerEvents": []
}

POST /games/:id/attack - Attack territory or skip

body: { "fromId": Number, "toId": Number, "soldiers": Number }
response-status: 200 / 404 (game not found) / 409 (game is not active) / 400
response-data - {
  "game": {
    "id": "game-id",
    "playerName": String,
    "round": Number,
    "phase": "reinforce",
    "status": "playing",
    "winner": null,
    "territories": []
  },
  "playerEvent": null,
  "computerEvents": []
}


POST /games/:id/move - Move soldiers and end turn

body: { "fromId": Number, "toId": Number, "soldiers": Number }
response-status: 200 / 404 (game not found) / 409 (game is not active) / 400
response-data - {
  "game": {
    "id": "game-id",
    "playerName": String,
    "round": Number,
    "phase": "reinforce",
    "status": "playing",
    "winner": null,
    "territories": []
  },
  "playerEvent": null,
  "computerEvents": []
}


POST /games/:id/end-turn - End turn without moving

body: { "fromId": Number, "toId": Number, "soldiers": Number }
response-status: 200 / 404 (game not found) / 409 (game is not active) / 400
response-data - {
  "game": {
    "id": "game-id",
    "playerName": String,
    "round": Number,
    "phase": "reinforce",
    "status": "playing",
    "winner": null,
    "territories": []
  },
  "playerEvent": null,
  "computerEvents": []
}
```

if game is over (player or computer captured headquarters) - status will change to 'finished' and winner will change to the winner

### DB
Used mongoDB as database for that project, because we needed store arrays in object, and it's simpler to use noSQL, when start running server it's create map db if not already exists (with ter.json) 