// const jwt = require("jsonwebtoken");
// const secret = "secret";

// module.exports.encode = function (user) {
//   return jwt.sign({ userId: user.id }, secret, { expiresIn: "1h" });
// };

// module.exports.decode = function (req, res, next) {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   if (!token) return res.status(401).send("Unauthorized");

//   jwt.verify(token, secret, (err, decoded) => {
//     if (err) return res.status(401).send("Unauthorized");
//     req.user = decoded;
//     next();
//   });
// };

const jwt = require("jsonwebtoken");
const secret = "access_secret";
const refreshSecret = "refresh_secret"; // Separate secret for refresh tokens

// Generate Access Token
module.exports.generateAccessToken = function (user) {
  return jwt.sign({ userId: user.id }, secret, { expiresIn: "1h" });
};

// Generate Refresh Token
module.exports.generateRefreshToken = function (user) {
  return jwt.sign({ userId: user.id }, refreshSecret, { expiresIn: "7d" });
};

// Decode and Verify Access Token Middleware
module.exports.decode = function (req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).send("Unauthorized");

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).send("Unauthorized");
    req.user = decoded;
    next();
  });
};

// Verify Refresh Token and Generate New Access Token
module.exports.refreshToken = function (req, res) {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).send("Refresh token is required.");
  }

  jwt.verify(refreshToken, refreshSecret, (err, decoded) => {
    if (err) {
      return res.status(403).send("Invalid refresh token.");
    }

    const newAccessToken = module.exports.generateAccessToken({
      id: decoded.userId,
    });

    return res.status(200).send({
      accessToken: newAccessToken,
    });
  });
};
