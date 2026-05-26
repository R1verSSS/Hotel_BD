const db = require("./connectController.js");
const pool = db.pool;

function getNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end - start;
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Number.isFinite(nights) && nights > 0 ? nights : 1;
}

exports.addToCart = (req, res) => {
  const { typeName, checkIn, checkOut, guests, price, image } = req.body;

  if (!typeName || !checkIn || !checkOut) {
    return res.status(400).json({ ok: false, message: "Не выбраны даты или тип номера" });
  }

  const query = `
    SELECT r.*, rt.TypeName, rf.FeatureName
    FROM Rooms r
    LEFT JOIN RoomTypes rt ON r.TypeId = rt.TypeId
    LEFT JOIN RoomFeatures rf ON r.FeatureId = rf.FeatureId
    WHERE rt.TypeName = ? AND r.IsOccupied = 0
    ORDER BY r.Price ASC, r.RoomNumber ASC
    LIMIT 1
  `;

  pool.query(query, [typeName], (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ ok: false, message: "Ошибка базы данных" });
    }

    if (!rows.length) {
      return res.status(404).json({ ok: false, message: "Свободных номеров данного типа нет" });
    }

    const room = rows[0];
    const roomPrice = Number(price || room.Price || 0);

    db.cart.push({
      RoomId: room.RoomId,
      RoomNumber: room.RoomNumber,
      TypeName: room.TypeName,
      FeatureName: room.FeatureName,
      Price: roomPrice,
      checkIn,
      checkOut,
      guests: Number(guests || 1),
      image: image || ""
    });

    res.json({ ok: true, cartLen: db.cart.length });
  });
};

exports.getCart = (req, res) => {
  const totalPrice = db.cart.reduce((sum, r) => sum + Number(r.Price || 0) * getNights(r.checkIn, r.checkOut), 0);
  res.render("Bookings/Cart", { cartRooms: db.cart, totalPrice, cartLen: db.cart.length });
};

exports.removeFromCart = (req, res) => {
  const index = Number(req.params.index);
  if (Number.isInteger(index) && index >= 0 && index < db.cart.length) db.cart.splice(index, 1);
  res.redirect("/bookings/getCart");
};

exports.getCheckout = (req, res) => {
  if (!db.cart.length) return res.redirect("/bookings/getCart");
  const totalPrice = db.cart.reduce((sum, r) => sum + Number(r.Price || 0) * getNights(r.checkIn, r.checkOut), 0);
  res.render("Bookings/Checkout", { cartRooms: db.cart, totalPrice, cartLen: db.cart.length });
};

exports.processCheckIn = (req, res) => {
    const { fullname, passport, phone, email } = req.body;

    if (!fullname || !passport || !phone || !email || !db.cart.length) {
        return res.redirect("/bookings/getCart");
    }

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Ошибка подключения к базе данных");
        }

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                console.log(err);
                return res.status(500).send("Ошибка транзакции");
            }

            connection.query(
                "SELECT GuestId FROM Guests WHERE Passport = ?",
                [passport],
                (err, rows) => {
                    if (err) return rollback(connection, err, res);

                    const saveBookingsForGuest = (guestId) => {
                        let index = 0;

                        const saveNextRoom = () => {
                            if (index >= db.cart.length) {
                                return connection.commit((err) => {
                                    if (err) return rollback(connection, err, res);

                                    db.cart.length = 0;
                                    connection.release();

                                    return res.render("Bookings/Success", { fullname });
                                });
                            }

                            const room = db.cart[index];
                            const nights = getNights(room.checkIn, room.checkOut);
                            const total = Number(room.Price || 0) * nights;

                            connection.query(
                                "INSERT INTO Bookings (GuestId, RoomId, CheckIn, CheckOut, TotalPrice) VALUES (?,?,?,?,?)",
                                [guestId, room.RoomId, room.checkIn, room.checkOut, total],
                                (err) => {
                                    if (err) return rollback(connection, err, res);

                                    connection.query(
                                        "UPDATE Rooms SET IsOccupied=1 WHERE RoomId=?",
                                        [room.RoomId],
                                        (err) => {
                                            if (err) return rollback(connection, err, res);

                                            index++;
                                            saveNextRoom();
                                        }
                                    );
                                }
                            );
                        };

                        saveNextRoom();
                    };

                    if (rows.length > 0) {
                        saveBookingsForGuest(rows[0].GuestId);
                    } else {
                        connection.query(
                            "INSERT INTO Guests (FullName, Passport, Phone, Address) VALUES (?,?,?,?)",
                            [fullname, passport, phone, email],
                            (err, guestResult) => {
                                if (err) return rollback(connection, err, res);

                                saveBookingsForGuest(guestResult.insertId);
                            }
                        );
                    }
                }
            );
        });
    });
};

function rollback(connection, err, res) {
  console.log(err);
  connection.rollback(() => {
    connection.release();
    res.status(500).send("Ошибка сохранения бронирования");
  });
}

exports.getHistory = (req, res) => {
  pool.query(`SELECT b.BookingId, g.FullName, r.RoomNumber, rt.TypeName, b.CheckIn, b.CheckOut, b.TotalPrice
              FROM Bookings b
              JOIN Guests g ON b.GuestId = g.GuestId
              JOIN Rooms r ON b.RoomId = r.RoomId
              JOIN RoomTypes rt ON r.TypeId = rt.TypeId
              WHERE b.GuestId = ?`, [req.params.GuestId], (err, history) => {
    if(err) return console.log(err);
    res.render("Bookings/History", { History: history });
  });
};
