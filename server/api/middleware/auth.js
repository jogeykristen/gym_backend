const jwt = require("jsonwebtoken");
const secret = "secret";

module.exports.encode = function (user) {
  return jwt.sign({ userId: user.id }, secret, { expiresIn: "1h" });
};

module.exports.decode = function (req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).send("Unauthorized");

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).send("Unauthorized");
    req.user = decoded;
    next();
  });
};
