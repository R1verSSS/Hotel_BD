const pool = require("./connectController.js").pool;

exports.getGuests = (req, res) => {
  let surname = req.query.surname;
  let query = "SELECT * FROM Guests";
  let params = [];

  if (surname) {
    query += " WHERE FullName LIKE ?";
    params.push(surname + "%");
  }

  pool.query(query, params, (err, guests) => {
    if (err) return console.log(err);
    res.render("Guests/Guests", { Guests: guests, curSurname: surname || "" });
  });
};

exports.addGuest = (req, res) => res.render("Guests/addGuest");

exports.postAddGuest = (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const { FullName, Passport, Phone, Address } = req.body;
  pool.query("INSERT INTO Guests (FullName, Passport, Phone, Address) VALUES (?,?,?,?)",
    [FullName, Passport, Phone, Address], (err) => {
      if (err) return console.log(err);
      res.redirect("/guests");
    });
};

exports.editGuest = (req, res) => {
  pool.query("SELECT * FROM Guests WHERE GuestId=?", [req.params.GuestId], (err, g) => {
    if (err) return console.log(err);
    res.render("Guests/editGuest", { guest: g[0] });
  });
};

exports.postEditGuest = (req, res) => {
  const { Phone, Address, GuestId } = req.body;
  pool.query("UPDATE Guests SET Phone=?, Address=? WHERE GuestId=?",
    [Phone, Address, GuestId], (err) => {
      if (err) return console.log(err);
      res.redirect("/guests");
    });
};
