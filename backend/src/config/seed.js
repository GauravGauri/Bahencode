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

    // 2. Check if categories already exist
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();

    if (categoryCount === 0) {
      try {
        await Category.collection.dropIndex('name_1');
        console.log('Successfully dropped old unique index name_1');
      } catch (e) {
        // Index might not exist
      }

      console.log('Seeding structured categories hierarchy (Men/Women/Child)...');
      
      // Level 1: Gender/Age categories
      const men = await Category.create({ name: 'Men', parent: null });
      const women = await Category.create({ name: 'Women', parent: null });
      const child = await Category.create({ name: 'Child', parent: null });
      
      // Level 2: Subcategories under Men
      const menTops = await Category.create({ name: 'Tops', parent: men._id });
      const menBottoms = await Category.create({ name: 'Bottoms', parent: men._id });
      const menShoes = await Category.create({ name: 'Shoes', parent: men._id });

      // Level 2: Subcategories under Women
      const womenTops = await Category.create({ name: 'Tops', parent: women._id });
      const womenBottoms = await Category.create({ name: 'Bottoms', parent: women._id });
      const womenShoes = await Category.create({ name: 'Shoes', parent: women._id });

      // Level 2: Subcategories under Child
      const childTops = await Category.create({ name: 'Tops', parent: child._id });
      const childBottoms = await Category.create({ name: 'Bottoms', parent: child._id });
      const childShoes = await Category.create({ name: 'Shoes', parent: child._id });

      // Level 3: Sub-subcategories
      // Men Tops sub-subcategories
      const menTshirts = await Category.create({ name: 'T-Shirts', parent: menTops._id });
      const menShirts = await Category.create({ name: 'Shirts', parent: menTops._id });

      // Men Bottoms sub-subcategories
      const menJeans = await Category.create({ name: 'Jeans', parent: menBottoms._id });
      const menPajamas = await Category.create({ name: 'Pajamas', parent: menBottoms._id });
      const menChinos = await Category.create({ name: 'Chinos', parent: menBottoms._id });

      // Men Shoes sub-subcategories
      const menSneakers = await Category.create({ name: 'Sneakers', parent: menShoes._id });
      const menLoafers = await Category.create({ name: 'Loafers', parent: menShoes._id });

      // Women Tops sub-subcategories
      const womenTopsSub = await Category.create({ name: 'Tops', parent: womenTops._id });
      const womenShirts = await Category.create({ name: 'Shirts', parent: womenTops._id });
      const womenBlouses = await Category.create({ name: 'Blouses', parent: womenTops._id });
      const womenDresses = await Category.create({ name: 'Dresses', parent: womenTops._id }); // Dresses naturally fit here

      // Women Bottoms sub-subcategories
      const womenJeans = await Category.create({ name: 'Jeans', parent: womenBottoms._id });
      const womenPajamas = await Category.create({ name: 'Pajamas', parent: womenBottoms._id });
      const womenSkirts = await Category.create({ name: 'Skirts', parent: womenBottoms._id });

      // Women Shoes sub-subcategories
      const womenHeels = await Category.create({ name: 'Heels', parent: womenShoes._id });
      const womenFlats = await Category.create({ name: 'Flats', parent: womenShoes._id });

      // Child sub-subcategories
      const childTshirts = await Category.create({ name: 'T-Shirts', parent: childTops._id });
      const childJeans = await Category.create({ name: 'Jeans', parent: childBottoms._id });
      const childSneakers = await Category.create({ name: 'Sneakers', parent: childShoes._id });

      console.log('Categories hierarchy seeded successfully.');

      // 3. Seed Initial Clothing Catalog (linked directly to sub-subcategories)
      if (productCount === 0) {
        console.log('Seeding mock clothing products with hierarchical category refs...');
        const sampleProducts = [
          {
            name: "Embroidered Peplum Top",
            description: "A beautifully embroidered peplum top with dynamic puffy sleeves, crafted from 100% premium Indian cotton. Perfect for brunch or casual workdays.",
            price: 1199,
            discountPrice: 899,
            category: womenTopsSub._id,
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
            category: womenShirts._id,
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
            name: "Classic Bell-Bottom Jeans",
            description: "Flattering high-waisted denim with a vintage flare. Features a soft stretch blend that curves in all the right places.",
            price: 1999,
            discountPrice: 1599,
            category: womenJeans._id,
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
            name: "Sleek Black Heels",
            description: "Stunning block-heel pump shoes made from cruelty-free vegan leather. Offers unmatched comfort and confidence.",
            price: 2499,
            discountPrice: 1999,
            category: womenHeels._id,
            sizes: ["S", "M", "L"],
            images: [
              "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80"
            ],
            stockQuantity: 10,
            isBestseller: true,
            isNewIn: true,
          },
          {
            name: "Men's Indigo Denim Jeans",
            description: "Classic raw-indigo denim jeans for men. Heavyweight construction with structured reinforcement stitching.",
            price: 2199,
            discountPrice: 1799,
            category: menJeans._id,
            sizes: ["M", "L", "XL"],
            images: [
              "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80"
            ],
            stockQuantity: 15,
            isBestseller: true,
            isNewIn: true,
          },
          {
            name: "Men's Linen Collar Shirt",
            description: "Breathable linen shirt for hot summer days, in pure optic white.",
            price: 1499,
            discountPrice: 1299,
            category: menShirts._id,
            sizes: ["S", "M", "L", "XL"],
            images: [
              "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80"
            ],
            stockQuantity: 25,
            isBestseller: false,
            isNewIn: false,
          },
          {
            name: "Kids Floral Cotton Pajamas",
            description: "Soft organic cotton sleepwear pajamas for boys and girls.",
            price: 899,
            discountPrice: 699,
            category: childJeans._id,
            sizes: ["XS", "S", "M"],
            images: [
              "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&auto=format&fit=crop&q=80"
            ],
            stockQuantity: 18,
            isBestseller: false,
            isNewIn: true,
          }
        ];

        await Product.insertMany(sampleProducts);
        console.log('Mock clothing products seeded successfully.');
      }
    } else {
      console.log('Database already has categories. Skipping product and category seeding to prevent override.');
    }
  } catch (error) {
    console.error('Seeding database failed:', error.message);
  }
};

module.exports = seedData;
