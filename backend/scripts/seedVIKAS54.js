require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize } = require('../config/db');
const { Product } = require('../models');

const products = [
  { product_id:'VIKAS0001', title:'iPhone AIR',               category:'Electronics',    brand:'Apple',          original_price:119900,  price:99000,    rating:4.3, image_url:'https://m.media-amazon.com/images/I/61knPJtYRpL._AC_UY327_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0002', title:'Samsung Galaxy S24 Ultra',  category:'Electronics',    brand:'Samsung',        original_price:129999,  price:114399.1, rating:4.7, image_url:'https://m.media-amazon.com/images/I/311qN0a2liL._SY300_SX300_QL70_FMwebp_.jpg',   is_active:true },
  { product_id:'VIKAS0003', title:'Sony WH-1000XM5',           category:'Electronics',    brand:'Sony',           original_price:29990,   price:25491.5,  rating:4.6, image_url:'https://m.media-amazon.com/images/I/61BGLYEN-xL._SY679_.jpg',                     is_active:true },
  { product_id:'VIKAS0004', title:'Apple Watch Series 9',      category:'Electronics',    brand:'Apple',          original_price:41900,   price:38548,    rating:4.7, image_url:'https://m.media-amazon.com/images/I/71sylumhOYL._AC_UY327_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0005', title:'Dell XPS 13',               category:'Electronics',    brand:'Dell',           original_price:249990,  price:224991,   rating:4.5, image_url:'https://m.media-amazon.com/images/I/712CAwRf6xL._AC_UY327_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0006', title:'boAt Airdopes 141',          category:'Electronics',    brand:'boAt',           original_price:1499,    price:1124.25,  rating:4.3, image_url:'https://m.media-amazon.com/images/I/71oXzCK43NL._AC_UY327_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0007', title:'JBL Flip 6',                category:'Electronics',    brand:'JBL',            original_price:13999,   price:8479,     rating:4.7, image_url:'https://m.media-amazon.com/images/I/81nT721hWGL._AC_UY327_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0008', title:'Kindle Paperwhite',         category:'Electronics',    brand:'Amazon',         original_price:12999,   price:11309.13, rating:4.8, image_url:'https://m.media-amazon.com/images/I/516ioi1kzGL._AC_UY327_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0009', title:'Logitech MX Master 3',      category:'Electronics',    brand:'Logitech',       original_price:15995,   price:12995,    rating:4.8, image_url:'https://m.media-amazon.com/images/I/61T2+HlHHqL._AC_UY327_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0010', title:'HP Monitor',                category:'Electronics',    brand:'HP',             original_price:10499,   price:8924.15,  rating:4.5, image_url:'https://m.media-amazon.com/images/I/71evQH2+lmL._AC_UY327_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0011', title:"Levi's Jeans",              category:'Fashion',        brand:"Levi's",         original_price:2999,    price:2399.2,   rating:4.4, image_url:'https://m.media-amazon.com/images/I/51lq9bjuDLL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0012', title:'Nike Sneakers',             category:'Fashion',        brand:'Nike',           original_price:7495,    price:6595.6,   rating:4.1, image_url:'https://m.media-amazon.com/images/I/61o+sbSxY5L._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0013', title:'Allen Solly Shirt',         category:'Fashion',        brand:'Allen Solly',    original_price:1999,    price:1499.25,  rating:4.3, image_url:'https://m.media-amazon.com/images/I/61CUc-46u-L._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0014', title:'Adidas Jacket',             category:'Fashion',        brand:'Adidas',         original_price:3499,    price:2974.15,  rating:4.5, image_url:'https://m.media-amazon.com/images/I/51QyQSlQe4L._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0015', title:'Puma Shoes',                category:'Fashion',        brand:'Puma',           original_price:3999,    price:3279.18,  rating:4.4, image_url:'https://m.media-amazon.com/images/I/41QCfv9mjAL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0016', title:'BIBA Kurta',                category:'Fashion',        brand:'BIBA',           original_price:2499,    price:1949.22,  rating:4.6, image_url:'https://m.media-amazon.com/images/I/6137a0f-ozL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0017', title:'Lymio T-Shirt',             category:'Fashion',        brand:'Lymio',          original_price:799,     price:559.3,    rating:4.2, image_url:'https://m.media-amazon.com/images/I/61EmpOqn1XL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0018', title:'Bata Shoes',                category:'Fashion',        brand:'Bata',           original_price:2199,    price:1759.2,   rating:4.3, image_url:'https://m.media-amazon.com/images/I/514N4bUR79L._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0019', title:'Inc5 Backpack',             category:'Fashion',        brand:'MOCA',           original_price:1699,    price:1393.18,  rating:4.5, image_url:'https://m.media-amazon.com/images/I/71WXO7tdYqL._AC_UY327_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0020', title:'Symbol Sunglasses',         category:'Fashion',        brand:'Generic',        original_price:1299,    price:974.25,   rating:4.4, image_url:'https://m.media-amazon.com/images/I/31VjW8XKfnL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0021', title:'Prestige Cooker',           category:'Home & Kitchen', brand:'Prestige',       original_price:2499,    price:2049.18,  rating:4.5, image_url:'https://m.media-amazon.com/images/I/51Bl9u494dL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0022', title:'Philips Air Fryer',         category:'Home & Kitchen', brand:'Philips',        original_price:8999,    price:7649.15,  rating:4.6, image_url:'https://m.media-amazon.com/images/I/513r-ytcqDL._AC_UY327_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0023', title:'Milton Bottle',             category:'Home & Kitchen', brand:'Milton',         original_price:899,     price:719.2,    rating:4.4, image_url:'https://m.media-amazon.com/images/I/813dSbp5E4L._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0024', title:'Pigeon Cookware',           category:'Home & Kitchen', brand:'Pigeon',         original_price:1999,    price:1559.22,  rating:4.3, image_url:'https://m.media-amazon.com/images/I/61aZ1CUskVL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0025', title:'LG Microwave',              category:'Home & Kitchen', brand:'LG',             original_price:12999,   price:11439.12, rating:4.6, image_url:'https://m.media-amazon.com/images/I/71X4oAhYufL._AC_UY327_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0026', title:'Usha Fan',                  category:'Home & Kitchen', brand:'Usha',           original_price:2999,    price:2399.2,   rating:4.4, image_url:'https://m.media-amazon.com/images/I/71lhfmtQrXL._AC_UY327_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0027', title:'Havells Mixer',             category:'Home & Kitchen', brand:'Havells',        original_price:4999,    price:4149.17,  rating:4.5, image_url:'https://m.media-amazon.com/images/I/710qWSSMEsL._AC_UY327_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0028', title:'Bedsheet',                  category:'Home & Kitchen', brand:'New Leaf',       original_price:2299,    price:1724.25,  rating:4.2, image_url:'https://m.media-amazon.com/images/I/51RbWWpN0KL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0029', title:'Borosil Glass',             category:'Home & Kitchen', brand:'Borosil',        original_price:999,     price:719.28,   rating:4.5, image_url:'https://m.media-amazon.com/images/I/51ngXKTIJaL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0030', title:'Cotton Towels',             category:'Home & Kitchen', brand:'Comfort Weave',  original_price:1299,    price:909.3,    rating:4.3, image_url:'https://m.media-amazon.com/images/I/717-VAqs51L._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0031', title:'Maybelline Fit Me',         category:'Beauty',         brand:'Maybelline',     original_price:599,     price:491.18,   rating:4.5, image_url:'https://m.media-amazon.com/images/I/41j1labvOOL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0032', title:'Mamaearth Face Wash',       category:'Beauty',         brand:'Mamaearth',      original_price:349,     price:261.75,   rating:4.4, image_url:'https://m.media-amazon.com/images/I/514ozr0WPZL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0033', title:'Nivea Cream',               category:'Beauty',         brand:'Nivea',          original_price:299,     price:239.2,    rating:4.6, image_url:'https://m.media-amazon.com/images/I/61goHe37WzL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0034', title:'WOW Shampoo',               category:'Beauty',         brand:'WOW',            original_price:499,     price:409.18,   rating:4.3, image_url:'https://m.media-amazon.com/images/I/51sl73g0lkL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0035', title:'Minimalist Serum',          category:'Beauty',         brand:'Minimalist',     original_price:699,     price:594.15,   rating:4.5, image_url:'https://m.media-amazon.com/images/I/51bO6zzJj4L._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0036', title:'Loreal Serum',              category:'Beauty',         brand:'Loreal',         original_price:799,     price:663.17,   rating:4.4, image_url:'https://m.media-amazon.com/images/I/51GhOWodz1L._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0037', title:'Body Butter',               category:'Beauty',         brand:'Body Shop',      original_price:1499,    price:1199.2,   rating:4.7, image_url:'https://m.media-amazon.com/images/I/811C-dwowlL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0038', title:'LEGO Classic',              category:'Toys',           brand:'LEGO',           original_price:1999,    price:1699.15,  rating:4.8, image_url:'https://m.media-amazon.com/images/I/61B9dPNRoCL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0039', title:'RC Car',                    category:'Toys',           brand:'ToyZone',        original_price:1499,    price:1199.2,   rating:4.4, image_url:'https://m.media-amazon.com/images/I/81izFLHw7OL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0040', title:'Hot Wheels',                category:'Toys',           brand:'Hot Wheels',     original_price:799,     price:599.25,   rating:4.7, image_url:'https://m.media-amazon.com/images/I/41bPiLtWveL._SY300_SX300_QL70_FMwebp_.jpg', is_active:true },
  { product_id:'VIKAS0041', title:'Rubik Cube',                category:'Toys',           brand:'Rubik',          original_price:299,     price:233.22,   rating:4.5, image_url:'https://m.media-amazon.com/images/I/614ZSur1PYL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0042', title:'Nerf Gun',                  category:'Toys',           brand:'Nerf',           original_price:1299,    price:1104.15,  rating:4.6, image_url:'https://m.media-amazon.com/images/I/61-0r-DOQmL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0043', title:'Funskool Puzzle',           category:'Toys',           brand:'Funskool',       original_price:499,     price:359.28,   rating:4.3, image_url:'https://m.media-amazon.com/images/I/710sy4OE+WL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0044', title:'Fisher Price Toy',          category:'Toys',           brand:'Fisher Price',   original_price:799,     price:639.2,    rating:4.8, image_url:'https://m.media-amazon.com/images/I/61rLKE2i3uL._AC_UL480_FMwebp_QL65_.jpg',    is_active:true },
  { product_id:'VIKAS0045', title:'Play Doh',                  category:'Toys',           brand:'Play Doh',       original_price:699,     price:524.25,   rating:4.5, image_url:'https://m.media-amazon.com/images/I/61ENgNOEUGL._SX522_.jpg',                     is_active:true },
  { product_id:'VIKAS0046', title:'Yonex Badminton Racket',    category:'Sports',         brand:'Yonex',          original_price:2499,    price:1999,     rating:4.6, image_url:'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRlvgj61snHZoHJXhQddCgUHlf1NJo4xdpb6iffN_OUiNKXG1goXtJdGpNAE_AOcZ5pVLpM9-1hmXIMTrpYn_QDYMVyB4s2iBoltwnPPle1lTE0TOGDNKx0Acc', is_active:true },
  { product_id:'VIKAS0047', title:'Cosco Football',            category:'Sports',         brand:'Cosco',          original_price:999,     price:749,      rating:4.4, image_url:'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRbN7qHCQP8W73oXooTY5GAZa8x4YZKm6E68RaGRC2Nreo7EW593SbpaZdMh_jGwNN_joB9isWVnRkQrphldbbtajXZKa2Tt-q9wdAjZCubuH9U7zbGP4BALA', is_active:true },
  { product_id:'VIKAS0048', title:'Foldable Treadmill',        category:'Sports',         brand:'PowerMax',       original_price:29999,   price:25499,    rating:4.5, image_url:'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRBt_GK-A_RbJi-tqv4FxbOFr7sh0pYNJ20gfJzAmp_xFpNwJuDKfJsNx3tAzS48M18uLaXGH812VmEsqn6J_BVxdGhdEPefnwX0iqsHwZklYVkwZDFIg3K', is_active:true },
  { product_id:'VIKAS0049', title:'Boldfit Yoga Mat',          category:'Sports',         brand:'Boldfit',        original_price:799,     price:559,      rating:4.5, image_url:'https://m.media-amazon.com/images/I/71swO3GTDwL.jpg',                              is_active:true },
  { product_id:'VIKAS0050', title:'Kore Dumbbells Set',        category:'Sports',         brand:'Kore',           original_price:3499,    price:2799,     rating:4.4, image_url:'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSkwt2xo20KRvwGbP-MB450BUAeSQGaS26iLEtavsKnAPhPmFXejZDe-elwQ4yEbCbL3MHmqTnQH4H28-4r8eLCEogbmNwUqD5lgJ6ENT9G8W3dWRb9jeu9294a', is_active:true },
  { product_id:'VIKAS0051', title:'Nivia Running Shoes',       category:'Sports',         brand:'Nivia',          original_price:1999,    price:1639,     rating:4.3, image_url:'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQY45Qza84JkDach9iRM_bkIDnzXByI1JPJCGIHCyklPMt3zYkRv_SWcFOsEiJ-Uh2VAvVXXScieXu9PgNDa9tjB-oxY1bm-lQT2I2NuKDLzffVpS8JTd6HYe8', is_active:true },
  { product_id:'VIKAS0052', title:'SG Cricket Bat',            category:'Sports',         brand:'SG',             original_price:3999,    price:3519,     rating:4.7, image_url:'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQBxZTRjDf6D_rH0H8kIGsIA9c7gUZDwdypiq2zzOxNSZgASqOTTIsGnD8mCjZWFlAAh-9cBrYAcOovN7DQPF3kEngjS0OZjmWv7CPhO7qJ3MV4dfA2AG5n', is_active:true },
  { product_id:'VIKAS0053', title:'Vector X Skipping Rope',    category:'Sports',         brand:'Vector X',       original_price:499,     price:374,      rating:4.2, image_url:'https://m.media-amazon.com/images/I/71RxAxdXcvL._SX679_.jpg',                       is_active:true },
  { product_id:'VIKAS0054', title:'Gym Gloves',                category:'Sports',         brand:'Boldfit',        original_price:699,     price:545,      rating:4.4, image_url:'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTOpfBZm0_8wFA859tN-y5ezD6687jfuqDyIOJyFE0bbc4gg7cDlisOL1I7Wb-PpkrtCgYd-W7JHP1htu5G4dzhouKqCB77gaOfetu0VnVg8WpuLPxosZN7Kg', is_active:true },
];

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    let inserted = 0, skipped = 0;

    for (const p of products) {
      const existing = await Product.findOne({ where: { product_id: p.product_id } });
      if (existing) {
        // Update in case fields changed
        await existing.update(p);
        skipped++;
      } else {
        await Product.create(p);
        inserted++;
      }
    }

    console.log(`✅ Done — ${inserted} inserted, ${skipped} already existed (updated)`);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
