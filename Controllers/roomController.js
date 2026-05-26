const db = require("./connectController.js");
const pool = db.pool;

exports.getRooms = (req, res) => {
  let query = `
    SELECT r.*, rt.TypeName, rf.FeatureName
    FROM Rooms r
    LEFT JOIN RoomTypes rt ON r.TypeId = rt.TypeId
    LEFT JOIN RoomFeatures rf ON r.FeatureId = rf.FeatureId
  `;
  const filters = [];
  const params = [];

  let typeId = req.query.typeId;
  let featureId = req.query.featureId;
  if (typeId == 0) typeId = undefined;
  if (featureId == 0) featureId = undefined;

  if (typeId) {
    filters.push("r.TypeId = ?");
    params.push(typeId);
  }
  if (featureId) {
    filters.push("r.FeatureId = ?");
    params.push(featureId);
  }
  if (filters.length) query += " WHERE " + filters.join(" AND ");
  query += " ORDER BY r.RoomNumber";

  pool.query("SELECT * FROM RoomTypes", (err, types) => {
    if (err) return console.log(err);
    pool.query("SELECT * FROM RoomFeatures" + (typeId ? " WHERE TypeId = ?" : ""), typeId ? [typeId] : [], (err, features) => {
      if (err) return console.log(err);
      pool.query(query, params, (err, rooms) => {
        if (err) return console.log(err);
        res.render("Rooms/Rooms", {
          RoomTypes: types,
          RoomFeatures: features,
          Rooms: rooms,
          curTypeId: typeId,
          curFeatureId: featureId,
          cartLen: db.cart.length
        });
      });
    });
  });
};

exports.addRoom = (req, res) => {
  pool.query("SELECT * FROM RoomTypes", (err, types) => {
    if (err) return console.log(err);
    pool.query("SELECT * FROM RoomFeatures", (err, features) => {
      if (err) return console.log(err);
      res.render("Rooms/addRoom", { RoomTypes: types, RoomFeatures: features });
    });
  });
};

exports.postAddRoom = (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const { RoomNumber, TypeId, FeatureId, Price } = req.body;
  pool.query("INSERT INTO Rooms (RoomNumber, TypeId, FeatureId, Price, IsOccupied) VALUES (?,?,?,?,0)",
    [RoomNumber, TypeId, FeatureId, Price], (err) => {
      if(err) return console.log(err);
      res.redirect("/rooms");
    });
};

exports.editRoom = (req, res) => {
  pool.query("SELECT * FROM Rooms WHERE RoomId=?", [req.params.RoomId], (err, r) => {
    if(err) return console.log(err);
    res.render("Rooms/editRoom", { room: r[0] });
  });
};

exports.postEditRoom = (req, res) => {
  const { Price, IsOccupied, RoomId } = req.body;
  pool.query("UPDATE Rooms SET Price=?, IsOccupied=? WHERE RoomId=?",
    [Price, IsOccupied, RoomId], (err) => {
      if(err) return console.log(err);
      res.redirect("/rooms");
    });
};

exports.deleteRoom = (req, res) => {
  pool.query("DELETE FROM Rooms WHERE RoomId=?", [req.params.RoomId], (err) => {
    if(err) return console.log(err);
    res.redirect("/rooms");
  });
};
