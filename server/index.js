const express = require("express");
const morgan = require("morgan");
var cors = require("cors");

const PORT = 3000;

const {
  createNewUser,
  getAllUsers,
  getUserById,
  deleteAllUsers,
  deleteUserById,
} = require("./handlers");

express()
  .use(morgan("tiny"))
  .use(cors())
  .use(express.json())
  

  .post("/user", createNewUser)
  .get("/allUsers", getAllUsers)
  .get("/user/:id", getUserById)
  .delete("/allUsers", deleteAllUsers)
  .delete("/user/:id", deleteUserById)

  .listen(PORT, () => console.info(`Listening on port ${PORT}`));
