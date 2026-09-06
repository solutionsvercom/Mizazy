import Product from "./models/Product.js";
import Category from "./models/Category.js";
import Review from "./models/Review.js";
import Bundle from "./models/Bundle.js";
import Coupon from "./models/Coupon.js";
import { products, categories, reviews, bundles, coupons } from "./catalog.js";

export async function seedIfEmpty() {
  const [productCount, categoryCount, reviewCount, bundleCount, couponCount] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    Review.countDocuments(),
    Bundle.countDocuments(),
    Coupon.countDocuments(),
  ]);

  if (productCount === 0) {
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);
  }
  if (categoryCount === 0) {
    await Category.insertMany(categories);
    console.log(`Seeded ${categories.length} categories`);
  }
  if (reviewCount === 0) {
    await Review.insertMany(reviews);
    console.log(`Seeded ${reviews.length} reviews`);
  }
  if (bundleCount === 0) {
    await Bundle.insertMany(bundles);
    console.log(`Seeded ${bundles.length} bundles`);
  }
  if (couponCount === 0) {
    await Coupon.insertMany(coupons);
    console.log(`Seeded ${coupons.length} coupons`);
  }
}
