const express = require("express");
const path = require("path");
const hbs = require("hbs");

const app = express();

hbs.registerHelper("eq", (a, b) => String(a) === String(b));
hbs.registerHelper("money", (value) => `${Number(value || 0).toLocaleString("ru-RU")} ₽`);
hbs.registerHelper("multiply", (a, b) => Number(a || 0) * Number(b || 0));
hbs.registerHelper("nights", (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Number.isFinite(nights) && nights > 0 ? nights : 1;
});
hbs.registerHelper("formatDate", (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("ru-RU");
});
hbs.registerHelper("roomImage", (typeName) => {
  const map = {
    "Стандарт": "/images/standart-mini.png",
    "Люкс": "/images/lux-mini.png",
    "Семейный": "/images/family-mini.png",
    "Делюкс": "/images/deluxe-mini.png"
  };
  return map[typeName] || "/images/standart-mini.png";
});

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "Views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const homeRouter = require("./Routes/homeRouter.js");
const roomRouter = require("./Routes/roomRouter.js");
const guestRouter = require("./Routes/guestRouter.js");
const bookingRouter = require("./Routes/bookingRouter.js");

app.use("/", homeRouter);
app.use("/rooms", roomRouter);
app.use("/guests", guestRouter);
app.get("/cart.html", (req, res) => res.redirect("/bookings/getCart"));
app.get("/checkout.html", (req, res) => res.redirect("/bookings/checkout"));
app.get("/index.html", (req, res) => res.redirect("/"));
app.get("/room.html", (req, res) => res.render("Rooms/Detail", { typeName: "Стандарт", price: 2500, guests: 2, area: 25, description: "Уютный номер с удобной кроватью и современной мебелью.", main: "/images/standard-main.png", mini: "/images/standart-mini.png", a1: "/images/standard-angle1.png", a2: "/images/standard-angle2.png", bath: "/images/standard-bath.png" }));
app.get("/room1.html", (req, res) => res.render("Rooms/Detail", { typeName: "Люкс", price: 5000, guests: 2, area: 35, description: "Просторный номер с современной мебелью и панорамным видом.", main: "/images/lux-main.png", mini: "/images/lux-mini.png", a1: "/images/lux-angle1.png", a2: "/images/lux-angle2.png", bath: "/images/lux-bath.png" }));
app.get("/room-family.html", (req, res) => res.render("Rooms/Detail", { typeName: "Семейный", price: 3500, guests: 4, area: 50, description: "Просторный номер для семьи с дополнительным спальным местом и зоной отдыха.", main: "/images/family-main.png", mini: "/images/family-mini.png", a1: "/images/family-angle1.png", a2: "/images/family-angle2.png", bath: "/images/family-bath.png" }));
app.get("/room-deluxe.html", (req, res) => res.render("Rooms/Detail", { typeName: "Делюкс", price: 7500, guests: 2, area: 45, description: "Премиальный номер с расширенной зоной отдыха и повышенным уровнем комфорта.", main: "/images/deluxe-main.png", mini: "/images/deluxe-mini.png", a1: "/images/deluxe-angle1.png", a2: "/images/deluxe-angle2.png", bath: "/images/deluxe-bath.png" }));
app.use("/bookings", bookingRouter);

app.use((req, res) => res.status(404).send("Страница не найдена"));

app.listen(3000, () => console.log("Сервер запущен на http://localhost:3000"));
