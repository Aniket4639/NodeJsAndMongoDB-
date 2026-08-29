const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const user = require("../models/userModel.js");
const sendEmail = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET_TOKEN, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = await user.create({
      name: name,
      email: email,
      password: password,
      passwordConfirm: password,
      //   name: req.body.name,
      //   email: req.body.email,
      //   password: req.body.password,
    });

    // not good if Front-end send 10 request body, it will go directly in database
    // const newUser = await user.create({
    //   req.body
    // });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      token: token,
      requestedAt: req.requestTime,
      data: newUser,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  //1 Check if anyone is empty
  if (!email || !password) {
    //how global error is being handled, need to chck lecture
    //error for now
    return res.status(400).json({
      status: "fail",
      message: "Either username or password is empty",
    });
  }

  //2 Check if anyone is empty
  const foundUser = await user.findOne({ email: email }).select("+password");
  // if no user then next line code is wrong
  //   const checkPassword = await foundUser.correctPassword(
  //     password,
  //     foundUser.password,
  //   );

  if (
    !foundUser ||
    !(await foundUser.correctPassword(password, foundUser.password))
  ) {
    //how global error is being handled, need to chck lecture
    //error for now
    return res.status(400).json({
      status: "fail",
      message: "Either username or password is incorrect",
    });
  }
  //3 if everything is okay
  const token = signToken(foundUser._id);

  res.status(200).json({
    status: "success",
    token: token,
    requestedAt: req.requestTime,
  });
};

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "Token is wrong",
    });
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_TOKEN,
  );

  // {
  //     "status": "success",
  //     "decoded": {
  //         "id": "6a8da59e451267e2f8cd77a2",
  //         "iat": 1787670330, // when this current token was created
  //         "exp": 1787670335
  //     },
  //     "requestedAt": "2026-08-25T15:05:31.822Z"
  // }
  //need to call this because if any very confidential APi is called..alomng with this should also be like updating personal info

  if (!decoded) {
    return res.status(401).json({
      status: "fail",
      message: "decode id is not found.",
    });
  }
  const freshUser = await user.findById(decoded.id);

  // 3. Check if the user still exists because it s used as middle ware..so checking
  if (!freshUser) {
    return res.status(401).json({
      status: "fail",
      message: "The user belonging to this token no longer exists.",
    });
  }

  //4 check if user has changed the password or not
  // if(freshUser.changePasswordAfter(decoded.iat)){
  //   //error
  // }

  req.user = freshUser;
  console.log("freshUser", freshUser);

  next(); //if middleware
};

exports.updatePassword = async (req, res, next) => {
  try {
    const foundUser = await user.findById(req.user.id).select("+password");

    const isCorrect = await foundUser.correctPassword(
      req.body.passwordCurrent,
      foundUser.password,
    );

    if (!isCorrect) {
      return res.status(401).json({
        status: "fail",
        message: "Your current password is incorrect.",
      });
    }

    foundUser.password = req.body.password;
    foundUser.passwordConfirm = req.body.passwordConfirm;

    await foundUser.save();

    // const token = signToken(foundUser._id);

    res.status(200).json({
      status: "success",
      // token,
      message: "Your password has been successfully updated!",
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.restrictTo = (...roles) => {
  //this type of function runs instantly on server starts and keep return (req, res, next) based on condition
  return (req, res, next) => {
    // 1) Check if the user's role is included in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission." });
    }

    // 2) If they have the right role, let them through to the next function
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  const foundUser = await user.findOne({ email: req.body.email });
  if (!foundUser) {
    return res.status(401).json({
      status: "fail",
      message: "forgotPassword: user is not found",
    });
  }

  const resetToken = foundUser.createPasswordResetToken();
  await foundUser.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request to: ${resetURL}.\nThis link expires in 10 minutes. If you did not request this, please ignore this email.`;

  try {
    await sendEmail({
      email: foundUser.email,
      subject: "Your password reset token (valid for 10 min)",
      message: message,
    });
  } catch (err) {
    // Handles errors if email cannot be delivered
  }

  res.status(200).json({
    status: "success",
    message: "Token sent to email!", // Tell the frontend it worked
    requestedAt: req.requestTime,
    resetToken: resetToken,
  });
};

exports.resetPassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const foundUser = await user.findOne({ passwordResetToken: hashedToken });
  if (!foundUser) {
    return res.status(401).json({
      status: "fail",
      message: "resetPassword: user is not found",
    });
  }
  if (foundUser.passwordResetExpires < Date.now()) {
    return res.status(401).json({
      status: "fail",
      message: "resetPassword: token is expired",
    });
  }

  foundUser.password = req.body.password;
  foundUser.passwordConfirm = req.body.passwordConfirm;
  foundUser.passwordResetExpires = undefined;
  foundUser.passwordResetToken = undefined;

  await foundUser.save();

  res.status(200).json({
    status: "success",
    message: "Password reset successful!",
    requestedAt: req.requestTime,
  });
};
