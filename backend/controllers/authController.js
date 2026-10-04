const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../db");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const pool = await poolPromise;

    const existingUser = await pool.request()
      .input("email", sql.VarChar(255), email)
      .query("SELECT Id FROM Users WHERE Email = @email");

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.request()
      .input("name", sql.VarChar(100), name)
      .input("email", sql.VarChar(255), email)
      .input("passwordHash", sql.VarChar(255), passwordHash)
      .query(`
        INSERT INTO Users (Name, Email, PasswordHash)
        VALUES (@name, @email, @passwordHash)
      `);

    res.status(201).json({
      success: true,
      message: "Account created successfully"
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("email", sql.VarChar(255), email)
      .query(`
        SELECT Id, Name, Email, PasswordHash
        FROM Users
        WHERE Email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = result.recordset[0];

    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { userId: user.Id, email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.Id,
        name: user.Name,
        email: user.Email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { signup, login };