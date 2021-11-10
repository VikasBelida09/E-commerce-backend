const expressJWT = require("express-jwt");
const api = process.env.API_PREFIX;
const authJWT = () => {
  return expressJWT({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/category(.*)/, methods: ["GET", "OPTIONS"] },
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
};
const isRevoked = (req, payload, done) => {
  if (!payload.isAdmin) {
    done(null, true);
  }
  done();
};
module.exports = authJWT;
