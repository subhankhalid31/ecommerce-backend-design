const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = "eglantosupersecretkey12345";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err.message));

// Models
const Product = mongoose.model("Product", new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    description: String,
    image: String,
    images: [String]
}));

const User = mongoose.model("User", new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
}));

// Authentication Middleware
const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect(`/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
    }
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.clearCookie("token");
        return res.redirect(`/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
    }
};

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "home.html"));
});

app.get("/products", async (req, res) => {
    try {
        const search = req.query.search || "";
        let query = search ? { name: { $regex: search, $options: "i" } } : {};
        const products = await Product.find(query).lean();
        res.render("products", { products, search });
    } catch (err) {
        res.send("Error loading products");
    }
});

app.get("/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (!product) return res.send("Product not found");
        res.render("product-detail", { product });
    } catch (err) {
        res.send("Product not found");
    }
});

// Protected Add Product
app.get("/add-product", authenticate, (req, res) => {
    res.render("add-product");
});

app.post("/add-product", authenticate, async (req, res) => {
    try {
        const { name, price, category, description, image } = req.body;
        await Product.create({
            name,
            price: parseFloat(price),
            category,
            description,
            image: image || "https://picsum.photos/id/1015/600/700",
            images: [image || "https://picsum.photos/id/1015/800/900"]
        });
        res.redirect("/products");
    } catch (err) {
        res.send("Error saving product");
    }
});

// Auth Routes
app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });
        res.redirect("/login");
    } catch (err) {
        res.send("Username already exists");
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.send("Invalid credentials");
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" });
        res.cookie("token", token, { httpOnly: true });

        const returnTo = req.query.returnTo || "/";
        res.redirect(returnTo);
    } catch (err) {
        res.send("Login error");
    }
});

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});