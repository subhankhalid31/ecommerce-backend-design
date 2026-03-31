const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB for seeding...'))
    .catch(err => console.error('Connection error:', err));

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    description: String,
    image: String,
    images: [String]
});

const Product = mongoose.model('Product', productSchema);

const sampleProducts = [
    {
        name: "Eternal Star Pendant",
        price: 425,
        category: "Necklace",
        description: "18k gold pendant with a brilliant star-cut diamond that catches light beautifully from every angle. Timeless piece for everyday elegance.",
        image: "https://picsum.photos/id/1015/600/700",
        images: [
            "https://picsum.photos/id/1015/800/900",
            "https://picsum.photos/id/1016/800/900",
            "https://picsum.photos/id/133/800/900"
        ]
    },
    {
        name: "Lumina Diamond Ring",
        price: 895,
        category: "Ring",
        description: "Exquisite solitaire diamond ring set in 18k white gold. A symbol of eternal commitment and luxury.",
        image: "https://picsum.photos/id/201/600/700",
        images: [
            "https://picsum.photos/id/201/800/900",
            "https://picsum.photos/id/202/800/900",
            "https://picsum.photos/id/203/800/900"
        ]
    },
    {
        name: "Golden Whisper Earrings",
        price: 320,
        category: "Earrings",
        description: "Delicate 18k gold hoop earrings with subtle diamond accents. Perfect for everyday luxury.",
        image: "https://picsum.photos/id/180/600/700",
        images: [
            "https://picsum.photos/id/180/800/900",
            "https://picsum.photos/id/181/800/900"
        ]
    },
    {
        name: "Velvet Moon Bracelet",
        price: 245,
        category: "Bracelet",
        description: "Luxurious velvet cord bracelet featuring a crescent moon charm with diamond detail.",
        image: "https://picsum.photos/id/251/600/700",
        images: [
            "https://picsum.photos/id/251/800/900",
            "https://picsum.photos/id/252/800/900"
        ]
    }
];

async function seedDatabase() {
    try {
        await Product.deleteMany({}); // Clear existing products
        await Product.insertMany(sampleProducts);
        console.log('✅ Successfully seeded 4 luxury products into MongoDB!');
        console.log('You can now close this and run the server.');
        mongoose.connection.close();
    } catch (error) {
        console.error('Seeding error:', error);
    }
}

seedDatabase();