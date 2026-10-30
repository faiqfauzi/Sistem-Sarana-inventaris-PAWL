const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const token = req.cookies?.inventaris_token;

  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({
      message: "Silakan login terlebih dahulu.",
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Sesi login tidak valid atau sudah berakhir.",
    });
  }
};
