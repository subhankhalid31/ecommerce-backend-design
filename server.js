const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err.message));

const Product = mongoose.model("Product", new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    description: String,
    image: String,
    images: [String]
}));

// Home
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "home.html"));
});

// Products with Pagination + Search
app.get("/products", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";

        let query = {};
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const products = await Product.find(query).skip(skip).limit(limit).lean();
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        res.render("products", {
            products,
            search,
            currentPage: page,
            totalPages
        });
    } catch (err) {
        console.error(err);
        res.send("Error loading products");
    }
});

// Product Detail
app.get("/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (!product) return res.send("Product not found");
        res.render("product-detail", { product });
    } catch (err) {
        res.send("Product not found");
    }
});

// Add Product
app.get("/add-product", (req, res) => {
    res.render("add-product");
});

app.post("/add-product", async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});