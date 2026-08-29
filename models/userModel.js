const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { worker } = require("cluster");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name"],
      default: "XXX",
    },
    email: {
      type: String,
      required: [true, "A user must have a valid email"],
    },
    password: {
      type: String,
      required: [true, "A user must have a password"],
      minlength: 2,
      select: false, // 👈 CRITICAL: Check if you have this line! otherwise founduser will show password for any get type, HACKER issue we need to hide it
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    passWordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  //If some paramter is not in schema, It works. if strict is true, will throw error
  //  , { strict: false, versionKey: false }
);

//when user.create or user.save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // need to check

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.passWordChangedAt = Date.now() - 1000; //wrong
});

// userSchema.pre("save", function () {
//   if (!this.isModified("password") || !isNew) return; // need to check

//   this.passWordChangedAt = Date.now();
// });

// This method sits on the user document itself
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  // using in this file, can handle multi lpaces like, login, updating, deleting
  return await bcrypt.compare(candidatePassword, userPassword);
};

//need to work in change password check lecture 132
// when user chnage password in FE function need to call user.save()

userSchema.methods.changePasswordAfter = async function (
  candidatePassword,
  userPassword,
) {
  // using in this file, can handle multi lpaces like, login, updating, deleting
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const user = mongoose.model("user", userSchema);
user.cleanIndexes(); //suppose you add unique paramter and first time run, mongoose save internally..even if you remove later..mongoose has internally saved this data...to resolve thi issue, we are using user.cleanIndexes();
module.exports = user;



// Need to worke

// userSchema.pre("save", async function (next) { // 1. Always pass 'next'
//   if (!this.isModified("password")) return next(); 

//   this.password = await bcrypt.hash(this.password, 12);
//   this.passwordConfirm = undefined;

//   // 2. ✅ ONLY apply the timestamp if this is an OLD user updating their account
//   // If they are brand new (this.isNew is true), skip this block entirely!
//   if (!this.isNew) {
//     this.passWordChangedAt = Date.now() - 1000; 
//   }

//   next(); // 3. Keep the Express chain moving safely
// });

