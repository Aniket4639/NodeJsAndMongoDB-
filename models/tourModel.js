const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      // unique: true,
      default: "XXX",
    },
    rating: Number,
    price: {
      type: Number,
      required: [true, "A tour must have a name"],
    },
  },
  //If some paramter is not in schema, It works. if strict is true, will throw error
  //  , { strict: false, versionKey: false }
);

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
