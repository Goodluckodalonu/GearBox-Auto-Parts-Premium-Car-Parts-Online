// fix-images.js - Script to fix product images
const fs = require('fs');

// Valid Unsplash image IDs for auto parts (these are known to work)
const validImageIds = [
    '1556909114-f6e7ad7d3136', // brake parts
    '1563720223481-8f6d4f9c8c3b', // engine parts
    '1593941707882-a5bba533899f', // tools
    '1549399542-7e3f8b79c341', // car parts
    '1553440569-bcc63803a83d', // suspension
    '1503376780353-7e6692767b70', // lighting
    '1620916566398-39f1143ab7be', // fluids
    '1555212697-194d092e3b8f', // electrical
    '1544256718-3bcf2371021c'  // interior
];

// Read your current products.json
const productsData = JSON.parse(fs.readFileSync('products.json', 'utf8'));

// Fix each product
productsData.products.forEach((product, index) => {
    // Ensure product has images array
    if (!product.images) {
        product.images = [];
    }
    
    // If no images, create some
    if (product.images.length === 0) {
        // Use category to determine appropriate images
        let imageIndex = index % validImageIds.length;
        product.images = [
            `https://images.unsplash.com/photo-${validImageIds[imageIndex]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
            `https://images.unsplash.com/photo-${validImageIds[(imageIndex + 1) % validImageIds.length]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
            `https://images.unsplash.com/photo-${validImageIds[(imageIndex + 2) % validImageIds.length]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`
        ];
    }
    
    // Remove any undefined or null images
    product.images = product.images.filter(img => img && img !== 'undefined');
    
    // Ensure we have at least one image
    if (product.images.length === 0) {
        product.images = ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];
    }
});

// Save fixed products.json
fs.writeFileSync('products-fixed.json', JSON.stringify(productsData, null, 2));
console.log('Fixed products.json created as products-fixed.json');