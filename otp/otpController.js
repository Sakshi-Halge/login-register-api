require("dotenv").config();
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const Otp = require("./otpSchema");
const User = require("../auth/userSchema");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//send otp on email provided
router.post("/emailSend", (req, res) => {
  User.findOne({ email: req.body.email }, (err, data) => {
    const responseObj = {};

    if (data) {
      const ueserName = data.name;
      let otpCode = Math.floor(Math.random() * 100000 + 1);
      Otp.create(
        {
          email: req.body.email,
          code: otpCode,
          expireIn: new Date().getTime() + 300 * 1000, //Expires after 5 min
        },
        (err, data) => {
          if (err) res.status(500).send("Error");
          responseObj.statusText = "Success";
          mailer(req.body.email, ueserName, otpCode);
          responseObj.message = "Success, Please check your inbox";
          responseObj.isExists = true;
          res.status(200).send(responseObj);
        }
      );
    } else {
      responseObj.statusText = "Error";
      responseObj.message = "Email Id doesn't exists";
      responseObj.isExists = false;
      res.status(400).send(responseObj);
    }
  });
});

const mailer = (email, name, otp) => {
  let transportor = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const ejs = require("ejs");
  const data = {
    otpCode: otp,
    userName: name,
  };

  ejs.renderFile(
    __dirname + "/views/ForgetPassEmail.ejs",
    { data: data },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        let mailOptions = {
          from: "halgesakshi2@gmail.com",
          to: email,
          subject: "Reset your Edumato password",
          html: data,
        };

        transportor.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Mail sent!!!");
          }
        });
      }
    }
  );
};

router.post("/changepassword", (req, res) => {
  Otp.findOne(
    { email: req.body.email, code: req.body.otpCode },
    (err, data) => {
      const response = {};
      if (data) {
        let currentTime = new Date().getTime();
        let diff = data.expireIn - currentTime;
        if (diff < 0) {
          response.message = "Token Expired";
          response.statusText = "Error";
          res.status(400).send(response);
        } else {
          let hasPassword = bcrypt.hashSync(req.body.newPassword, 8);

          User.findOneAndUpdate(
            { email: req.body.email },
            {password : hasPassword},
            null,
            (err, userdata) => {
              console.log(req.body.newPassword);
              response.message = "Password changed successfully";
              response.statusText = "Success";
              res.status(200).send(response);
            }
          );
        }
      } else {
        response.message = "Invalid OTP";
        response.statusText = "Error";
        res.status(400).send(response);
      }
    }
  );
});

module.exports = router;
