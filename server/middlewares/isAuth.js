const jwt = require("jsonwebtoken");

const User = require("../models/user");

async function isAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Please Login",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SEC);

    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({
      message: "Please Login",
    });
  }
}
module.exports = {
  isAuth,
};
