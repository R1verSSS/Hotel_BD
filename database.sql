CREATE DATABASE IF NOT EXISTS HotelDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE HotelDB;

CREATE TABLE IF NOT EXISTS RoomTypes (
  TypeId INT AUTO_INCREMENT PRIMARY KEY,
  TypeName VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS RoomFeatures (
  FeatureId INT AUTO_INCREMENT PRIMARY KEY,
  TypeId INT NULL,
  FeatureName VARCHAR(100) NOT NULL,
  FOREIGN KEY (TypeId) REFERENCES RoomTypes(TypeId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Rooms (
  RoomId INT AUTO_INCREMENT PRIMARY KEY,
  RoomNumber VARCHAR(20) NOT NULL UNIQUE,
  TypeId INT NOT NULL,
  FeatureId INT NULL,
  Price DECIMAL(10,2) NOT NULL,
  IsOccupied TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (TypeId) REFERENCES RoomTypes(TypeId),
  FOREIGN KEY (FeatureId) REFERENCES RoomFeatures(FeatureId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Guests (
  GuestId INT AUTO_INCREMENT PRIMARY KEY,
  FullName VARCHAR(255) NOT NULL,
  Passport VARCHAR(50) NOT NULL,
  Phone VARCHAR(50) NOT NULL,
  Address VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Bookings (
  BookingId INT AUTO_INCREMENT PRIMARY KEY,
  GuestId INT NOT NULL,
  RoomId INT NOT NULL,
  CheckIn DATE NOT NULL,
  CheckOut DATE NOT NULL,
  TotalPrice DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (GuestId) REFERENCES Guests(GuestId),
  FOREIGN KEY (RoomId) REFERENCES Rooms(RoomId)
);

INSERT IGNORE INTO RoomTypes (TypeId, TypeName) VALUES
(1, 'Стандарт'), (2, 'Люкс'), (3, 'Семейный'), (4, 'Делюкс');

INSERT IGNORE INTO RoomFeatures (FeatureId, TypeId, FeatureName) VALUES
(1, 1, 'Wi-Fi, TV, кондиционер'),
(2, 2, 'Wi-Fi, TV, мини-бар'),
(3, 3, 'Wi-Fi, TV, дополнительное место'),
(4, 4, 'Wi-Fi, TV, мини-бар, зона отдыха');

INSERT IGNORE INTO Rooms (RoomId, RoomNumber, TypeId, FeatureId, Price, IsOccupied) VALUES
(1, '101', 1, 1, 2500, 0),
(2, '102', 1, 1, 2500, 0),
(3, '201', 2, 2, 5000, 0),
(4, '301', 3, 3, 3500, 0),
(5, '401', 4, 4, 7500, 0);
