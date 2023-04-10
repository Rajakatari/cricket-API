const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
db = null;

//initialize DB And Server

const initializationServerAndDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running...!");
    });
  } catch (e) {
    console.log(`DB error ${e.message}`);
  }
};

initializationServerAndDB();

//converting snake case to camelCase

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const convertDbObjectToResponseObjectwithoutPlayerId = (dbObject) => {
  return {
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get all players API-1
app.get("/players/", async (request, response) => {
  const getAllPlayersDbQuery = `select * from cricket_team order by player_id;`;
  const allPlayers = await db.all(getAllPlayersDbQuery);

  response.send(
    allPlayers.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//Add player API-2
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerDbQuery = `insert into cricket_team (player_name,jersey_number,role) values('${playerName}','${jerseyNumber}','${role}');`;
  const dbResponse = await db.run(addPlayerDbQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//get particular player details API-3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const particularPlayerDBQuery = `select * from cricket_team where player_id = '${playerId}';`;
  const playerDetails = await db.get(particularPlayerDBQuery);
  const result = {
    playerId: parseInt(playerId),
    playerName: playerDetails.player_name,
    jerseyNumber: playerDetails.jersey_number,
    role: playerDetails.role,
  };
  response.send(result);
});

//API -4 update the player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updateQuery = `update cricket_team set player_name = '${playerName}',
    jersey_number = '${jerseyNumber}', role = '${role}' where player_id = '${playerId}';`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//API -5 Delete the Player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `delete from cricket_team where player_id = '${playerId}';`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
