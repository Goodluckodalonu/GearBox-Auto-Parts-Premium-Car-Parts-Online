// fix-images.js - Script to fix product images with correct relevance
const fs = require('fs');

// Map keywords to proper Unsplash search queries
const categoryImageMap = {
  battery: 'car battery',
  brake: 'car brake disc',
  clutch: 'car clutch plate',
  engine: 'car engine parts',
  suspension: 'car suspension system',
  light: 'car headlights',
  electrical: 'automotive electrical parts',
  interior: 'car interior parts',
  default: 'automotive spare parts'
};

// Detect correct search query from product title
const getSearchQuery = (product) => {
  const title = (product.title || '').toLowerCase();

  if (title.includes('battery')) return categoryImageMap.battery;
  if (title.includes('brake')) return categoryImageMap.brake;
  if (title.includes('clutch')) return categoryImageMap.clutch;
  if (title.includes('engine')) return categoryImageMap.engine;
  if (title.includes('suspension')) return categoryImageMap.suspension;
  if (title.includes('light')) return categoryImageMap.light;
  if (title.includes('electrical')) return categoryImageMap.electrical;
  if (title.includes('interior')) return categoryImageMap.interior;

  return categoryImageMap.default;
};

// Build Unsplash search-based image URL (relevant images)
const buildImageUrl = (query) =>
  `https://source.unsplash.com/800x800/?${encodeURIComponent(query)}`;

// Read products.json safely
let productsData;
try {
  productsData = JSON.parse(fs.readFileSync('products.json', 'utf8'));
} catch (error) {
  console.error('❌ Failed to read products.json:', error.message);
  process.exit(1);
}

// Fix each product
productsData.products.forEach((product) => {
  // Ensure images array exists
  if (!Array.isArray(product.images)) {
    product.images = [];
  }

  // Remove invalid images
  product.images = product.images.filter(
    img => typeof img === 'string' && img.startsWith('http')
  );

  // Assign correct images if missing
  if (product.images.length === 0) {
    const query = getSearchQuery(product);

    product.images = [
      buildImageUrl(query),
      buildImageUrl(`${query}, close up`),
      buildImageUrl(`${query}, automotive`)
    ];
  }
});

// Save fixed file
fs.writeFileSync(
  'products-fixed.json',
  JSON.stringify(productsData, null, 2)
);

console.log('✅ Products images fixed with correct relevance (products-fixed.json)');
