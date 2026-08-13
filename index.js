const mongoose = require("mongoose");
const express = require("express");
require("dotenv").config(); //reads that .env file, and parses the keys and values

const app = express();

// 1. Define schema with flexible strict setting
const testModelSchema = new mongoose.Schema({}, { strict: false });

// If 3 arguments, first argument, NodeJSDummy is dummy
const TestModel = mongoose.model("NodeJSDummy", testModelSchema, "products");

const startServer = async () => {
  try {
    const a = await mongoose.connect(process.env.MONGO_URI, {
      //dbName: it will access only this database, if not available in cluster, it will create
      //autoSelectFamily: Forces Node.js to use IPv4 instead of IPv6, if 0.0.0.0/0 then no need
      dbName: "NodeJS1",
      autoSelectFamily: false,
    });
    //1
    // how to get Data from collection without mongoose model
    const getCollectionData = await mongoose.connection.db
      .collection("products")
      .find({})
      .limit(5)
      .toArray();

    console.log("✅Successfully fetched: getCollectionData", getCollectionData);
    ///////////////////////

    //2
    // how to get Data from collection second way
    // Fetches first 5 documents
    const getCollectionDataSecondWay = await TestModel.find({}).limit(5);
    console.log(
      `✅Successfully fetched: getCollectionDataSecondWay`,
      getCollectionDataSecondWay,
    );

    const newProduct = await TestModel.create({
      name: "Mac book",
      price: 999,
      software: "iOS",
    });
    console.log("✅Successfully created new product:", newProduct);
    //////////////////////////

    //3
    //Schema should be kept at the top
    const tourSchema = new mongoose.Schema({
      name: {
        type: String,
        required: [true, "A tour must have a name"],
        // unique: true,
        default: "",
      },
      rating: Number,
      price: {
        type: Number,
        required: [true, "A tour must have a name"],
      },
    });

    const Tour = mongoose.model("Tour", tourSchema);
    const testTour = new Tour({
      name: "Raghav",
      rating: 4.5,
      price: 50,
    });
    testTour
      .save()
      .then((e) => console.log("SAVED BOSS"))
      .catch((err) => console.log(err));

    //////////////////////////

    // Standard app.listen syntax
    app.listen(3000, () => {
      console.log("🚀 Server running on port 3000");
    });
  } catch (err) {
    console.error("❌ Failed to connect to DB:", err);
    process.exit(1);
  }
};
startServer();
