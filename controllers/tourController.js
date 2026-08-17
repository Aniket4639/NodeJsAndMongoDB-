const fs = require("fs");

const Tour = require("../models/tourModel.js");

const transformQuery = (query) => {
  const result = {};

  for (const key in query) {
    const value = query[key];

    // Match: age[gt] OR age[$gt]
    const match = key.match(/^(\w+)\[(\$?\w+)\]$/);

    if (match) {
      const field = match[1];
      let operator = match[2];

      // ✅ Fix: avoid double $
      if (!operator.startsWith("$")) {
        operator = `$${operator}`;
      }

      if (!result[field]) {
        result[field] = {};
      }

      result[field][operator] = isNaN(value) ? value : Number(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};

exports.getAllTours = async (req, res) => {
  // const getCollectionData = await Tour.find().lean();
  let queryObj = { ...req.query }; // this will handle even if there is no query
  queryObj = transformQuery(queryObj); // to handle greater or equal than filter, rating[gt]=4.5 gte|gt|lte|lt
  console.log("Aniket getAllTours", queryObj);
  // 2. Advanced: Exclude special API control fields from your database filter
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  //Advanced filtereing
  console.log("Aniket: finalQuery", queryObj);
  // 3. Execute the Mongoose query with the filter object
  const tours = await Tour.find(queryObj);
  console.log("Aniket: tours", tours);
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    result: tours.length,
    data: tours,
  });
};
// exports.createTour = (req, res) => {
//   const id = tourSimpleJSON.length;
//   const newTour = Object.assign({ id: id }, req.body);
//   tourSimpleJSON.push(newTour);
//   fs.writeFile(
//     "./4-natours/after-section-06/dev-data/data/tours-simple.json",
//     JSON.stringify(tourSimpleJSON),
//     (err) => {
//       res.status(201).json({
//         status: "success",
//         data: newTour,
//       });
//     },
//   );
// };

exports.createTour = async (req, res) => {
  try {
    // const newDoc = await Information.create(req.body); It will go post body paramter of postman
    const newDoc = await Tour.create({
      name: "Kumari NeelamHira",
      rating: 2.5,
      price: 124,
    });
    res.status(201).json({
      status: "success",
      requestedAt: req.requestTime,
      data: newDoc,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// exports.getTourById = (req, res) => {
//   const id = req.params.id;
//   const filterData = tourSimpleJSON.find((e) => e.id == id);
//   if (!filterData) {
//     res.status(404).json({
//       status: "Failure",
//       message: "Id is not found",
//     });
//   }
//   res.status(200).json({
//     status: "success",
//     requestedAt: req.requesTime,
//     data: filterData,
//   });
// };

exports.getTourById = async (req, res) => {
  const index = req.params.id;
  try {
    // const TourById = await Tour.findById(id);
    const getCollectionData = await Tour.find().lean();
    const TourByIndex = getCollectionData[index];

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      data: TourByIndex,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getTourByQueryParameter = async (req, res) => {
  const query = req.query;
  try {
    // const TourById = await Tour.findById(id);
    const getCollectionData = await Tour.find(query).lean();
    const TourByQueryParameter = getCollectionData[index];

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      data: TourByIndex,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// exports.updateTour = (req, res) => {
//   const id = req.params.id;
//   const index = tourSimpleJSON.findIndex((e) => e.id == id);
//   tourSimpleJSON[index] = { ...tourSimpleJSON[index], ...req.body };

//   if (!index) {
//     res.status(404).json({
//       status: "Failure",
//       message: "Id is not found",
//     });
//   }
//   fs.writeFile(
//     "./4-natours/after-section-06/dev-data/data/tours-simple.json",
//     JSON.stringify(tourSimpleJSON),
//     (err) => {
//       res.status(200).json({
//         status: "success",
//         data: tourSimpleJSON[index],
//       });
//     },
//   );
// };

exports.updateTour = async (req, res) => {
  const id = req.params.id;
  const data = { firstName: "Tejanshi1234" };
  const newDoc = await Information.findByIdAndUpdate(id, data, { new: true });
  res.status(200).json({
    status: "success",
    data: newDoc,
  });
};

exports.deleteTour = async (req, res) => {
  const id = req.params.id;
  const data = { firstName: "Tejanshi" };
  const newDoc = await Information.findByIdAndDelete(id);
  res.status(200).json({
    status: "success",
    data: newDoc,
  });
};
