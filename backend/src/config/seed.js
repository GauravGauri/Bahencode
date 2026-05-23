const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

const seedData = async () => {
  try {
    // 1. Seed Admin Account
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@behencode.co';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      console.log('Seeding initial admin account...');
      await User.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'BehencodeAdmin123!',
        role: 'admin',
      });
      console.log('Admin account seeded successfully.');
    } else {
      console.log('Admin account already exists. Skipping...');
    }

    // 1.5 Seed Initial Categories Hierarchy
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('Seeding categories hierarchy...');
      
      // Top-level categories
      const men = await Category.create({ name: 'Men', parent: null });
      const women = await Category.create({ name: 'Women', parent: null });
      const tshirtCat = await Category.create({ name: 'T-shirt', parent: null });
      
      // Subcategories under Women
      await Category.create({ name: 'Tops', parent: women._id });
      await Category.create({ name: 'Dresses', parent: women._id });
      await Category.create({ name: 'Coord Sets', parent: women._id });
      await Category.create({ name: 'T-Shirts (Women)', parent: women._id });
      
      // Subcategories under Men
      await Category.create({ name: 'T-Shirts (Men)', parent: men._id });
      await Category.create({ name: 'Bottoms', parent: men._id });
      
      // Subcategories under T-shirt
      await Category.create({ name: 'Polo T-shirts', parent: tshirtCat._id });
      await Category.create({ name: 'Oversized T-shirts', parent: tshirtCat._id });
      
      console.log('Categories hierarchy seeded successfully.');
    } else {
      console.log('Categories already exist. Skipping category seeding...');
    }

    // 2. Seed Initial Clothing Catalog
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding mock clothing products...');
      const sampleProducts = [
        {
          name: "Embroidered Peplum Top",
          description: "A beautifully embroidered peplum top with dynamic puffy sleeves, crafted from 100% premium Indian cotton. Perfect for brunch or casual workdays.",
          price: 1199,
          discountPrice: 899,
          category: "Tops",
          sizes: ["XS", "S", "M", "L", "XL"],
          images: [
            "https://images.unsplash.com/photo-1534126511673-b6899657816a?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"
          ],
          stockQuantity: 15,
          isBestseller: true,
          isNewIn: true,
        },
        {
          name: "Cropped Linen Shirt",
          description: "Effortlessly chic cropped linen shirt in soft sage green. Features a classic collar, drop shoulders, and mother-of-pearl buttons.",
          price: 999,
          discountPrice: 799,
          category: "Tops",
          sizes: ["S", "M", "L"],
          images: [
            "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80"
          ],
          stockQuantity: 20,
          isBestseller: false,
          isNewIn: true,
        },
        {
          name: "Hand-knit Crochet Crop Top",
          description: "Intricately hand-knit crochet crop top featuring floral pattern designs. A true expression of artisan craftsmanship.",
          price: 1499,
          discountPrice: 1299,
          category: "Tops",
          sizes: ["XS", "S", "M"],
          images: [
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80"
          ],
          stockQuantity: 8,
          isBestseller: true,
          isNewIn: false,
        },
        {
          name: "Classic Bell-Bottom Jeans",
          description: "Flattering high-waisted denim with a vintage flare. Features a soft stretch blend that curves in all the right places.",
          price: 1999,
          discountPrice: 1599,
          category: "Bottoms",
          sizes: ["S", "M", "L", "XL"],
          images: [
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=800&auto=format&fit=crop&q=80"
          ],
          stockQuantity: 12,
          isBestseller: true,
          isNewIn: false,
        },
        {
          name: "Lilac Floral Midi Dress",
          description: "Dreamy lilac midi dress covered in vintage wildflowers. Highlights a smocked bodice, adjustable tie sleeves, and a tiered flowy skirt.",
          price: 2499,
          discountPrice: 1999,
          category: "Dresses",
          sizes: ["XS", "S", "M", "L", "XL"],
          images: [
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800&auto=format&fit=crop&q=80"
          ],
          stockQuantity: 18,
          isBestseller: true,
          isNewIn: true,
        },
        {
          name: "Sunset Cotton Coord Set",
          description: "Comfortable double-gauze cotton matching top and trousers set in warm sunset orange. Perfect for travels or relaxed days at home.",
          price: 2999,
          discountPrice: 2499,
          category: "Coord Sets",
          sizes: ["S", "M", "L", "XL"],
          images: [
            "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80"
          ],
          stockQuantity: 10,
          isBestseller: false,
          isNewIn: true,
        },
        {
          name: "Cozy Woollen Turtleneck Sweater",
          description: "Thick, soft woollen knit turtleneck in classic cream. Designed to keep you warm and cozy, featuring drop shoulders and relaxed ribbed cuffs.",
          price: 2199,
          discountPrice: 1799,
          category: "Winter Collection",
          sizes: ["S", "M", "L", "XL"],
          images: [
            "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1574164904299-3a102b110380?w=800&auto=format&fit=crop&q=80"
          ],
          stockQuantity: 14,
          isBestseller: false,
          isNewIn: false,
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log('Mock clothing products seeded successfully.');
    } else {
      console.log('Product catalog is not empty. Seeding skipped.');
    }
  } catch (error) {
    console.error('Seeding database failed:', error.message);
  }
};

module.exports = seedData;
