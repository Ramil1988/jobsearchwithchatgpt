"use strict";

const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const client = new MongoClient(MONGO_URI, options);
const database = client.db("CvGenetator");
const users = database.collection("users");

client.connect();

const createNewUser = async (req, res) => {
  try {
    const { applicantName, applicantPhoneNumber, applicantEmail } = req.body;
    await client.connect();

    const newUser = {
      _id: uuidv4(),
      applicantName,
      applicantPhoneNumber,
      applicantEmail,
    };

    const result = await users.insertOne(newUser);
    const insertedId = result.insertedId;
    const savedUser = await users.findOne({ _id: insertedId });
    res.status(201).json({ success: true, data: savedUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Error creating user" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    await client.connect();

    const allUsers = await users.find().toArray();

    return res.status(200).json({
      status: 200,
      message: "All users retrieved successfully.",
      data: allUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    await client.close();
    return res.status(500).json({
      status: 500,
      message: "An error occurred while fetching users.",
      data: null,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    await client.connect();
    const user = await users.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found.",
        data: null,
      });
    }

    return res.status(200).json({
      status: 200,
      message: "User retrieved successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    await client.close();
    return res.status(500).json({
      status: 500,
      message: "An error occurred while fetching the user by ID.",
      data: null,
    });
  }
};

const deleteAllUsers = async (req, res) => {
  try {
    await client.connect();

    const result = await users.deleteMany({});

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "No users found to delete.",
      });
    }

    return res.status(200).json({
      status: 200,
      message: `${result.deletedCount} users deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting users:", error);
    await client.close();
    return res.status(500).json({
      status: 500,
      message: "An error occurred while deleting the users.",
    });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    await client.connect();

    const result = await users.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    await client.close();
    return res.status(500).json({
      status: 500,
      message: "An error occurred while deleting the user.",
    });
  }
};

module.exports = {
  createNewUser,
  getAllUsers,
  getUserById,
  deleteUserById,
  deleteAllUsers,
};
