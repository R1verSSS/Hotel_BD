const db = require("./connectController.js");
const pool = db.pool;

exports.index = function(req, res) {
  const query = `
    SELECT r.*, rt.TypeName, rf.FeatureName
    FROM Rooms r
    LEFT JOIN RoomTypes rt ON r.TypeId = rt.TypeId
    LEFT JOIN RoomFeatures rf ON r.FeatureId = rf.FeatureId
    ORDER BY r.Price ASC
  `;

  pool.query(query, (err, rooms) => {
    if (err) return console.log(err);
    res.render("Home/Index", { Rooms: rooms, cartLen: db.cart.length });
  });
};

exports.about = function(req, res) {
  res.render("Home/About");
};
