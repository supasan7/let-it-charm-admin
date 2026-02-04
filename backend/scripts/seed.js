const db = require('../config/db');

const images = [
    '/uploads/test-1.png',
    '/uploads/test-2.png',
    '/uploads/test-3.png'
];

const categories = ['Necklace', 'Bracelet', 'Charm'];

const getRandomImage = () => {
    return [images[Math.floor(Math.random() * images.length)]];
};

const products = [
    // Single Products
    {
        title: 'Silver Chain Necklace A',
        description: 'Classic silver chain.',
        category: 'Necklace',
        price: 590,
        stock: 10,
        type: 'single',
        sku: 'N01-CHAIN-A'
    },
    {
        title: 'Gold Plated Bracelet B',
        description: 'Elegant gold plated bracelet.',
        category: 'Bracelet',
        price: 890,
        stock: 5,
        type: 'single',
        sku: 'B01-GOLD-B'
    },
    {
        title: 'Minimalist Ring C',
        description: 'Simple minimalist ring.',
        category: 'Ring',
        price: 390,
        stock: 20,
        type: 'single',
        sku: 'R01-MINI-C'
    },
    // Variant Products
    {
        title: 'Heart Charm D',
        description: 'Cute heart charm in multiple colors.',
        category: 'Charm',
        type: 'variant',
        baseSku: 'C01-HEART',
        options: [
            { name: 'Red', sku: 'C01-HEART-RED', price: 150, stock: 10 },
            { name: 'Pink', sku: 'C01-HEART-PNK', price: 150, stock: 15 },
            { name: 'Blue', sku: 'C01-HEART-BLU', price: 150, stock: 8 }
        ]
    },
    {
        title: 'Flower Pendant E',
        description: 'Flower pendant details.',
        category: 'Necklace',
        type: 'variant',
        baseSku: 'N02-FLOWER',
        options: [
            { name: 'Silver', sku: 'N02-FLOWER-SLV', price: 450, stock: 12 },
            { name: 'Gold', sku: 'N02-FLOWER-GLD', price: 550, stock: 5 }
        ]
    },
    {
        title: 'Leather Wristband F',
        description: 'Genuine leather wristband.',
        category: 'Bracelet',
        type: 'variant',
        baseSku: 'B02-LEATHER',
        options: [
            { name: 'Black', sku: 'B02-LEATHER-BLK', price: 290, stock: 30 },
            { name: 'Brown', sku: 'B02-LEATHER-BRN', price: 290, stock: 25 }
        ]
    },
    {
        title: 'Crystal Earring G',
        description: 'Shiny crystal earrings.',
        category: 'Earring',
        type: 'variant',
        baseSku: 'E01-CRYSTAL',
        options: [
            { name: 'Clear', sku: 'E01-CRYSTAL-CLR', price: 190, stock: 50 },
            { name: 'Rose', sku: 'E01-CRYSTAL-RSE', price: 210, stock: 40 }
        ]
    },
    {
        title: 'Beaded Anklet H',
        description: 'Summer beaded anklet.',
        category: 'Anklet',
        type: 'variant',
        baseSku: 'A01-BEAD',
        options: [
            { name: 'Mix', sku: 'A01-BEAD-MIX', price: 120, stock: 60 }
        ]
    },
    // Bundle Products
    {
        title: 'Valentine Set I',
        description: 'Special set for Valentine.',
        category: 'Bundle',
        price: 990,
        stock: 5, // Logic for bundle stock is usually derived, but we set initial simplified
        type: 'bundle',
        sku: 'SET-VAL-I'
    },
    {
        title: 'Starter Collection J',
        description: 'Best seller starter collection.',
        category: 'Bundle',
        price: 1290,
        stock: 3,
        type: 'bundle',
        sku: 'SET-START-J'
    }
];

async function seed() {
    const connection = await db.getConnection();
    try {
        console.log('Starting seed...');

        for (const p of products) {
            console.log(`Seeding ${p.title}...`);
            await connection.beginTransaction();

            // Insert Product
            const [res] = await connection.query(
                `INSERT INTO products (title, description, category, images, status) VALUES (?, ?, ?, ?, ?)`,
                [p.title, p.description, p.category, JSON.stringify(getRandomImage()), 'active']
            );
            const productId = res.insertId;

            // Insert Variants
            if (p.type === 'single') {
                await connection.query(
                    `INSERT INTO variants (product_id, sku, option_name, price, default_cost, stock_qty, is_bundle) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [productId, p.sku, 'Single', p.price, p.price * 0.4, p.stock, 0]
                );
            } else if (p.type === 'bundle') {
                await connection.query(
                    `INSERT INTO variants (product_id, sku, option_name, price, default_cost, stock_qty, is_bundle) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [productId, p.sku, 'Bundle Set', p.price, 0, p.stock, 1]
                );
            } else if (p.type === 'variant') {
                for (const opt of p.options) {
                    await connection.query(
                        `INSERT INTO variants (product_id, sku, option_name, price, default_cost, stock_qty, is_bundle) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [productId, opt.sku, opt.name, opt.price, opt.price * 0.4, opt.stock, 0]
                    );
                }
            }

            await connection.commit();
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        if (connection) await connection.rollback();
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

seed();
