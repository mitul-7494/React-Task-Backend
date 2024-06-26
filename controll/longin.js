const cmodel = require('../model/customer');
const Customer = cmodel.customer;
const jwt = require('jsonwebtoken')
require('dotenv').config();
const path = require('path');
const ejs = require('ejs')

exports.logout = async (req, res) => {
  res.cookie("jwtc", "", { maxAge: "1" })
  res.cookie("user", "", { maxAge: "1" })
  res.send("ok")
}


// customer login
exports.clogin = async (req, res) => {
  const { username, password } = req.body
  try {
    // Check if username and password is provided
    if (!username || !password) {
      res.send({ message: "Username or Password not present" })
    }
    const custobj = await Customer.findOne({ username, password })
    if (!custobj) {
      res.status(400).json({ message: "Login not successful, User not found" })
    } else {
      const maxAge = 72 * 60 * 60;
      const token = jwt.sign(
        { id: custobj._id, username},
        process.env.HEXC,
        {
          expiresIn: maxAge, // 3hrs in sec
        });
      res.cookie("jwtc", token, {
        httpOnly: true,
        maxAge: maxAge * 1000, // 3hrs in ms
      });
      res.cookie("user", username, {
        httpOnly: true,
        maxAge: maxAge * 1000, // 3hrs in ms
      });
      res.send({message:"Login successfull"});
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    })
  }
}

exports.customerAuth = (req, res, next) => {
  
  const token = req.cookies.jwtc
  if (token) {
    jwt.verify(token, process.env.HEXC, (err) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized"})
      } else {
        next()
      }
    })
  } else {
    res.status(401).json({ message: "Not authorized"})
  }
}