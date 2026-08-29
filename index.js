const mongoose = require("mongoose");
const express = require("express");
const morgan = require("morgan");
const Tour = require("./models/tourModel");
const tourRouter = require("./routes/tourRoute");
const userRouter = require("./routes/userRoute");
require("dotenv").config(); //reads that .env file, and parses the keys and values

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // use middleware specially in POST method
app.use(morgan("dev"));

//rate limit from an IP-address
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  max: 5, // 🔢 Maximum 100 requests per IP address
  windowMs: 60 * 60 * 1000, // ⏱️ Time window: 1 hour (in milliseconds)
  message: "Too many requests from this IP, please try again in an hour!", // 🚫 Error message
  legacyHeaders: true, //this parameter is responsible to display X-RateLimit-Limit & X-RateLimit-Remaining
});

// Apply the limiter middleware globally to all routes starting with /api
app.use("/api", limiter);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

const startServer = async () => {
  try {
    const a = await mongoose.connect(process.env.MONGO_URI, {
      //dbName: it will access only this database, if not available in cluster, it will create
      //autoSelectFamily: Forces Node.js to use IPv4 instead of IPv6, if 0.0.0.0/0 then no need
      dbName: "NodeJS1",
      autoSelectFamily: false,
    });
    //1
    // how to get Data from collection without mongoose model/schema
    // const getCollectionData = await mongoose.connection.db
    //   .collection("products")
    //   .find({})
    //   .limit(5)
    //   .toArray();

    // console.log("✅Successfully fetched: getCollectionData", getCollectionData);
    ///////////////////////

    //2 (MOVED TO tourController section)
    // how to get Data from collection second way
    // Fetches first 5 documents
    // const getCollectionDataSecondWay = await TestModel.find({}).limit(5);
    // console.log(
    //   `✅Successfully fetched: getCollectionDataSecondWay`,
    //   getCollectionDataSecondWay,
    // );

    // const newProduct = await TestModel.create({
    //   name: "Mac book",
    //   price: 999,
    //   software: "iOS",
    // });
    // console.log("✅Successfully created new product:", newProduct);
    //////////////////////////

    //3
    //Schema should be kept at the top

    // const testTour = new Tour({
    //   name: "Raghav",
    //   rating: 4.5,
    //   price: 50,
    // });
    // testTour
    //   .save() //save or create both okay
    //   .then((e) => console.log("SAVED BOSS"))
    //   .catch((err) => console.log(err));

    //////////////////////////

    //Method 1
    // app.get("/api/v1/tours", (req, res) => {
    //   res.status(200).json({ status: "success", requestedAt: req.requestTime,  message: JSON.parse(data) });
    // });

    // app.post("/api/v1/tours", (req, res) => {
    //   const reqBody = req.body;
    //   fs.writeFile("./dog.json", JSON.stringify(reqBody), "utf-8", (err) => {
    //     res.status(201).json({ status: "success", message: JSON.parse(data) });
    //   });
    // });

    // app.get("/api/v1/tours/:id", (req, res) => {
    //   const id = req.params.id;
    //   const result = parsedData?.find((e) => e.id == id);
    //   if (id > parsedData.length) {
    //     res.status(400).json({ status: "Failure", message: "NOT FOUND" });
    //   } else {
    //     res.status(200).json({ status: "success", message: result });
    //   }
    // });
    /////////////////////////////////

    //Method 2

    // const getAllTours = (req, res) => {
    //   res.status(200).json({ status: "success", message: JSON.parse(data) });
    // };

    // const getTourById = (req, res) => {
    //   const id = req.params.id;
    //   const result = parsedData?.find((e) => e.id == id);
    //   if (id > parsedData.length) {
    //     res.status(400).json({ status: "Failure", message: "NOT FOUND" });
    //   } else {
    //     res.status(200).json({ status: "success", message: result });
    //   }
    // };

    // const postTour = (req, res) => {
    //   const reqBody = req.body;
    //   fs.writeFile("./dog.json", JSON.stringify(reqBody), "utf-8", (err) => {
    //     res.status(201).json({ status: "success", message: JSON.parse(data) });
    //   });
    // };

    // app.get("/api/v1/tours", getAllTours);
    // app.post("/api/v1/tours", postTour);
    // app.get("/api/v1/tours/:id", getTourById);
    //another approach

    // app.route("/api/v1/tours").get(getAllTours).post(postTour);
    // app.route("/api/v1/tours/:id").get(getTourById);
    ///////////////////////////////////

    // Standard app.listen syntax
    app.listen(3000, () => {
      console.log("🚀 Server running on port 3000");
    });
  } catch (err) {
    console.error("❌ Failed to connect to DB:", err);
    process.exit(1);
  }
  // console.log("process.argv", process.argv); for testing and handing globaly project : node index.js rttu serty
};
startServer();
