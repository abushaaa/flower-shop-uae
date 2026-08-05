import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  { nameEn: 'Flowers', nameAr: 'زهور', slug: 'flowers', sortOrder: 1 },
  { nameEn: 'Roses', nameAr: 'ورود', slug: 'roses', sortOrder: 2, parentId: 'flowers' },
  { nameEn: 'Bouquets', nameAr: 'باقات', slug: 'bouquets', sortOrder: 3, parentId: 'flowers' },
  { nameEn: 'Luxury Boxes', nameAr: 'باقات فاخرة', slug: 'luxury-boxes', sortOrder: 4, parentId: 'flowers' },
  { nameEn: 'Flowers in Vase', nameAr: 'زهور في مزهرية', slug: 'flowers-in-vase', sortOrder: 5, parentId: 'flowers' },
  { nameEn: 'Chocolates', nameAr: 'شوكولاتة', slug: 'chocolates', sortOrder: 10 },
  { nameEn: 'Cakes', nameAr: 'كيك', slug: 'cakes', sortOrder: 11 },
  { nameEn: 'Perfumes', nameAr: 'عطور', slug: 'perfumes', sortOrder: 12 },
  { nameEn: 'Candles', nameAr: 'شموع', slug: 'candles', sortOrder: 13 },
  { nameEn: 'Plants', nameAr: 'نباتات', slug: 'plants', sortOrder: 14 },
  { nameEn: 'Balloons', nameAr: 'بالونات', slug: 'balloons', sortOrder: 15 },
  { nameEn: 'Teddy Bears', nameAr: 'دمى', slug: 'teddy-bears', sortOrder: 16 },
  { nameEn: 'Gift Boxes', nameAr: 'صناديق هدايا', slug: 'gift-boxes', sortOrder: 17 },
  { nameEn: 'Birthday Gifts', nameAr: 'هدايا عيد الميلاد', slug: 'birthday-gifts', sortOrder: 20 },
  { nameEn: 'Anniversary Gifts', nameAr: 'هدايا الذكرى السنوية', slug: 'anniversary-gifts', sortOrder: 21 },
  { nameEn: 'Gifts for Her', nameAr: 'هدايا لها', slug: 'gifts-for-her', sortOrder: 22 },
  { nameEn: 'Gifts for Him', nameAr: 'هدايا له', slug: 'gifts-for-him', sortOrder: 23 },
  { nameEn: 'Baby Gifts', nameAr: 'هدايا المواليد', slug: 'baby-gifts', sortOrder: 24 },
  { nameEn: 'Premium Gifts', nameAr: 'هدايا فاخرة', slug: 'premium-gifts', sortOrder: 25 },
  { nameEn: 'Same Day Delivery', nameAr: 'توصيل في نفس اليوم', slug: 'same-day-delivery', sortOrder: 30 },
];



// ============================================================
// النسخة المعدّلة: بتستخدم بس الـ 10 صور الموجودة فعليًا في public/images/
// استبدل بيها مصفوفتي BANNERS و PRODUCTS في prisma/seed.ts
// ============================================================

const BANNERS = [
  { titleEn: 'Same Day Delivery Across UAE', titleAr: 'توصيل في نفس اليوم في جميع الإمارات', subtitleEn: 'Order by 2 PM for same-day flower delivery', subtitleAr: 'اطلب قبل الساعة ٢ ظهراً للتوصيل في نفس اليوم', image: '/images/banner-hero-2.jpg', position: 'hero', sortOrder: 1, link: '/shop?same_day=true' },
  { titleEn: 'Valentine Special', titleAr: 'عرض عيد الحب', subtitleEn: 'Up to 30% off on romantic bouquets', subtitleAr: 'خصم يصل إلى ٣٠٪ على الباقات الرومانسية', image: '/images/banner-hero-3.jpg', position: 'hero', sortOrder: 2, link: '/shop?occasion=valentine' },
  { titleEn: 'Free Delivery Over AED 200', titleAr: 'توصيل مجاني فوق ٢٠٠ د.إ', subtitleEn: 'Shop now and save on delivery', subtitleAr: 'تسوق الآن ووفّر على التوصيل', image: '/images/royal-garden-1.jpg', position: 'homepage', sortOrder: 1, link: '/shop' },
  { titleEn: 'Birthday Collection', titleAr: 'مجموعة عيد الميلاد', subtitleEn: 'Make their day special', subtitleAr: 'اجعل يومهم مميزاً', image: '/images/pink-roses-1.jpg', position: 'homepage', sortOrder: 2, link: '/shop?occasion=birthday' },
];

const PRODUCTS = [
  // Roses
  { nameEn: 'Classic Red Rose Bouquet', nameAr: 'باقة ورود حمراء كلاسيكية', slug: 'classic-red-roses', sku: 'BLM-ROSE-001', price: 149, salePrice: 129, categoryId: 'roses', stock: 50, occasion: 'anniversary', color: 'red', isBestSeller: true, isFeatured: true, sameDayDelivery: true, rating: 4.8, reviewCount: 124, tags: '["red","roses","romantic"]', descriptionEn: 'A stunning bouquet of 25 premium red roses, beautifully wrapped in luxury packaging. Perfect for expressing love and passion.', descriptionAr: 'باقة رائعة من ٢٥ وردة حمراء فاخرة، ملفوفة بتغليف فاخر. مثالية للتعبير عن الحب والشغف.', images: '["/images/rose-red-1.jpg","/images/rose-red-5.jpg"]' },
  { nameEn: 'Pink Rose Collection', nameAr: 'مجموعة الورود الوردية', slug: 'pink-roses', sku: 'BLM-ROSE-002', price: 169, categoryId: 'roses', stock: 35, occasion: 'birthday', color: 'pink', isNewArrival: true, sameDayDelivery: true, rating: 4.9, reviewCount: 89, tags: '["pink","roses","elegant"]', descriptionEn: 'Elegant pink roses arranged in a modern style with eucalyptus accents.', descriptionAr: 'ورود وردية أنيقة مرتبة بأسلوب عصري مع لمسات من الأوكالبتوس.', images: '["/images/pink-roses-1.jpg","/images/white-rose-box-1.jpg"]' },
  { nameEn: 'White Rose Luxury Box', nameAr: 'صندوق ورود بيضاء فاخر', slug: 'white-rose-box', sku: 'BLM-ROSE-003', price: 249, categoryId: 'roses', stock: 20, occasion: 'wedding', color: 'white', isFeatured: true, rating: 4.7, reviewCount: 56, tags: '["white","roses","luxury","wedding"]', descriptionEn: 'Pristine white roses in a premium velvet box, perfect for weddings and elegant occasions.', descriptionAr: 'ورود بيضاء ناصعة في صندوق مخمل فاخر، مثالية للأعراس والمناسبات الأنيقة.', images: '["/images/white-rose-box-1.jpg","/images/banner-hero-2.jpg"]' },

  // Bouquets
  { nameEn: 'Sunset Paradise Bouquet', nameAr: 'باقة جنة الغروب', slug: 'sunset-paradise', sku: 'BLM-BOUQ-001', price: 199, salePrice: 179, categoryId: 'bouquets', stock: 30, occasion: 'birthday', color: 'mixed', isBestSeller: true, isFeatured: true, sameDayDelivery: true, rating: 4.9, reviewCount: 201, tags: '["mixed","bouquet","colorful","best-seller"]', descriptionEn: 'A vibrant mix of sunflowers, roses, and seasonal blooms that captures the beauty of a UAE sunset.', descriptionAr: 'مزيج نابض بالحياة من دوار الشمس والورود والزهور الموسمية يجسد جمال غروب الإمارات.', images: '["/images/banner-hero-2.jpg","/images/banner-hero-3.jpg"]' },
  { nameEn: 'Lavender Dreams Bouquet', nameAr: 'باقة أحلام اللافندر', slug: 'lavender-dreams', sku: 'BLM-BOUQ-002', price: 179, categoryId: 'bouquets', stock: 25, occasion: 'thank_you', color: 'purple', isNewArrival: true, sameDayDelivery: true, rating: 4.6, reviewCount: 67, tags: '["purple","lavender","bouquet","aromatic"]', descriptionEn: 'Calming lavender-toned arrangement with dried lavender sprigs and soft purple blooms.', descriptionAr: 'ترتيب مهدئ بدرجات اللافندر مع فروع لافندر مجفف وزهور بنفسجية ناعمة.', images: '["/images/lavender-dreams-1.jpg","/images/choco-rose-combo-1.jpg"]' },
  { nameEn: 'Royal Garden Bouquet', nameAr: 'باقة الحديقة الملكية', slug: 'royal-garden', sku: 'BLM-BOUQ-003', price: 299, categoryId: 'bouquets', stock: 15, occasion: 'anniversary', color: 'mixed', isFeatured: true, rating: 4.8, reviewCount: 45, tags: '["luxury","bouquet","royal","premium"]', descriptionEn: 'An extravagant arrangement featuring premium blooms sourced from the finest gardens.', descriptionAr: 'ترتيب فخم يضم زهوراً فاخرة من أجمل الحدائق.', images: '["/images/royal-garden-1.jpg","/images/oud-royal-perfume-1.jpg"]' },

  // Luxury Boxes
  { nameEn: 'Grand Luxe Flower Box', nameAr: 'صندوق الزهور الكبير الفاخر', slug: 'grand-luxe-box', sku: 'BLM-LUX-001', price: 399, categoryId: 'luxury-boxes', stock: 10, occasion: 'anniversary', color: 'red', isFeatured: true, rating: 5.0, reviewCount: 34, tags: '["luxury","box","premium","red"]', descriptionEn: 'A show-stopping luxury flower box with 50 premium roses arranged in a signature velvet box.', descriptionAr: 'صندوق زهور فاخر مبهر يضم ٥٠ وردة فاخرة مرتبة في صندوق مخمل مميز.', images: '["/images/rose-red-1.jpg","/images/rose-red-5.jpg"]' },
  { nameEn: 'Elegant Bloom Box', nameAr: 'صندوق الزهور الأنيق', slug: 'elegant-bloom-box', sku: 'BLM-LUX-002', price: 279, categoryId: 'luxury-boxes', stock: 18, occasion: 'birthday', color: 'pink', isBestSeller: true, sameDayDelivery: true, rating: 4.7, reviewCount: 78, tags: '["luxury","box","elegant","pink"]', descriptionEn: 'Sophisticated arrangement of pink and white blooms in a premium hat box.', descriptionAr: 'ترتيب راقٍ من الزهور الوردية والبيضاء في صندوق قبعات فاخر.', images: '["/images/pink-roses-1.jpg","/images/white-rose-box-1.jpg"]' },

  // Flowers in Vase
  { nameEn: 'Crystal Vase Arrangement', nameAr: 'ترتيب مزهرية الكريستال', slug: 'crystal-vase', sku: 'BLM-VASE-001', price: 229, categoryId: 'flowers-in-vase', stock: 12, occasion: 'congratulations', color: 'mixed', isNewArrival: true, sameDayDelivery: true, rating: 4.8, reviewCount: 42, tags: '["vase","crystal","arrangement","elegant"]', descriptionEn: 'Beautiful mixed flowers arranged in a crystal vase, ready to display.', descriptionAr: 'زهور مختلطة جميلة مرتبة في مزهرية كريستال، جاهزة للعرض.', images: '["/images/banner-hero-2.jpg","/images/banner-hero-3.jpg"]' },

  // Chocolates
  { nameEn: 'Premium Chocolate Collection', nameAr: 'مجموعة شوكولاتة فاخرة', slug: 'premium-chocolates', sku: 'BLM-CHO-001', price: 99, categoryId: 'chocolates', stock: 100, occasion: 'birthday', color: 'brown', isBestSeller: true, sameDayDelivery: true, rating: 4.6, reviewCount: 156, tags: '["chocolate","premium","gift","belgian"]', descriptionEn: 'Handpicked Belgian chocolates in an elegant gift box. 24 pieces of pure indulgence.', descriptionAr: 'شوكولاتة بلجيكية مختارة بعناية في صندوق هدايا أنيق. ٢٤ قطعة من المتعة البحتة.', images: '["/images/choco-rose-combo-1.jpg","/images/lavender-dreams-1.jpg"]' },
  { nameEn: 'Chocolate & Rose Combo', nameAr: 'شوكولاتة وورود', slug: 'choco-rose-combo', sku: 'BLM-CHO-002', price: 199, categoryId: 'chocolates', stock: 40, occasion: 'valentine', color: 'red', isFeatured: true, sameDayDelivery: true, rating: 4.9, reviewCount: 203, tags: '["chocolate","roses","combo","romantic"]', descriptionEn: 'The perfect pairing of premium chocolates and red roses in a luxury gift set.', descriptionAr: 'المزيج المثالي من الشوكولاتة الفاخرة والورود الحمراء في مجموعة هدايا فاخرة.', images: '["/images/choco-rose-combo-1.jpg","/images/rose-red-1.jpg"]' },

  // Cakes
  { nameEn: 'Luxury Chocolate Cake', nameAr: 'كيك الشوكولاتة الفاخر', slug: 'luxury-chocolate-cake', sku: 'BLM-CK-001', price: 149, categoryId: 'cakes', stock: 20, occasion: 'birthday', color: 'brown', isBestSeller: true, sameDayDelivery: true, rating: 4.7, reviewCount: 178, tags: '["cake","chocolate","luxury","birthday"]', descriptionEn: 'Decadent three-layer chocolate cake with rich ganache and edible gold accents.', descriptionAr: 'كيك شوكولاتة فاخر من ثلاث طبقات مع غاناش غني ولمسات ذهبية صالحة للأكل.', images: '["/images/oud-royal-perfume-1.jpg","/images/royal-garden-1.jpg"]' },
  { nameEn: 'Floral Heart Cake', nameAr: 'كيك القلب الزهري', slug: 'floral-heart-cake', sku: 'BLM-CK-002', price: 179, categoryId: 'cakes', stock: 15, occasion: 'valentine', color: 'pink', isNewArrival: true, sameDayDelivery: true, rating: 4.8, reviewCount: 65, tags: '["cake","floral","heart","romantic"]', descriptionEn: 'Heart-shaped vanilla cake decorated with fresh edible flowers and buttercream.', descriptionAr: 'كيك فانيلا على شكل قلب مزين بزهور صالحة للأكل وكريمة الزبدة.', images: '["/images/pink-roses-1.jpg","/images/white-rose-box-1.jpg"]' },

  // Perfumes
  { nameEn: 'Oud Royal Perfume', nameAr: 'عطر العود الملكي', slug: 'oud-royal-perfume', sku: 'BLM-PERF-001', price: 349, categoryId: 'perfumes', stock: 30, occasion: 'birthday', color: 'gold', isFeatured: true, rating: 4.9, reviewCount: 92, tags: '["perfume","oud","luxury","arabian"]', descriptionEn: 'Authentic Arabian oud perfume with notes of saffron, rose, and amber. 100ml.', descriptionAr: 'عطر عود عربي أصلي مع نغمات الزعفران والورد والعنبر. ١٠٠ مل.', images: '["/images/oud-royal-perfume-1.jpg","/images/banner-hero-2.jpg"]' },
  { nameEn: 'Floral Bouquet Perfume', nameAr: 'عطر باقة الزهور', slug: 'floral-perfume', sku: 'BLM-PERF-002', price: 249, categoryId: 'perfumes', stock: 25, occasion: 'birthday', color: 'pink', isNewArrival: true, rating: 4.7, reviewCount: 54, tags: '["perfume","floral","feminine","elegant"]', descriptionEn: 'Delicate floral fragrance inspired by fresh blooms. 50ml Eau de Parfum.', descriptionAr: 'عطر زهري رقيق مستوحى من الزهور الطازجة. ٥٠ مل أو دو بارفان.', images: '["/images/banner-hero-3.jpg","/images/royal-garden-1.jpg"]' },

  // Plants
  { nameEn: 'Lucky Bamboo Plant', nameAr: 'نبات الخيزران المحظوظ', slug: 'lucky-bamboo', sku: 'BLM-PLT-001', price: 89, categoryId: 'plants', stock: 45, occasion: 'congratulations', color: 'green', isBestSeller: true, sameDayDelivery: true, rating: 4.5, reviewCount: 112, tags: '["plant","bamboo","lucky","indoor"]', descriptionEn: 'Beautiful lucky bamboo arrangement in a ceramic pot. Symbol of good fortune.', descriptionAr: 'ترتيب خيزران محظوظ جميل في أصيص سيراميك. رمز للحظ السعيد.', images: '["/images/pink-roses-1.jpg","/images/rose-red-1.jpg"]' },
  { nameEn: 'Orchid in Ceramic Pot', nameAr: 'أوركيد في أصيص سيراميك', slug: 'orchid-ceramic', sku: 'BLM-PLT-002', price: 159, categoryId: 'plants', stock: 20, occasion: 'thank_you', color: 'white', isFeatured: true, sameDayDelivery: true, rating: 4.8, reviewCount: 76, tags: '["plant","orchid","luxury","elegant"]', descriptionEn: 'Elegant white Phalaenopsis orchid in a premium ceramic pot.', descriptionAr: 'أوركيد أبيض أنيق في أصيص سيراميك فاخر.', images: '["/images/rose-red-5.jpg","/images/royal-garden-1.jpg"]' },

  // Balloons
  { nameEn: 'Birthday Balloon Bouquet', nameAr: 'باقة بالونات عيد الميلاد', slug: 'birthday-balloons', sku: 'BLM-BAL-001', price: 79, categoryId: 'balloons', stock: 60, occasion: 'birthday', color: 'mixed', sameDayDelivery: true, rating: 4.4, reviewCount: 88, tags: '["balloons","birthday","party","celebration"]', descriptionEn: 'Set of 10 helium-filled foil balloons with birthday wishes.', descriptionAr: 'مجموعة من ١٠ بالونات رقائق مملوءة بالهيليوم مع أمنيات عيد ميلاد.', images: '["/images/oud-royal-perfume-1.jpg","/images/white-rose-box-1.jpg"]' },

  // Teddy Bears
  { nameEn: 'Giant Teddy Bear', nameAr: 'دبة محشوة عملاقة', slug: 'giant-teddy', sku: 'BLM-TED-001', price: 129, categoryId: 'teddy-bears', stock: 25, occasion: 'valentine', color: 'brown', isBestSeller: true, sameDayDelivery: true, rating: 4.8, reviewCount: 145, tags: '["teddy","bear","gift","soft","cuddly"]', descriptionEn: 'Adorable 80cm premium teddy bear made from ultra-soft plush material.', descriptionAr: 'دبة محشوة مميزة بطول ٨٠ سم مصنوعة من مادة مخملية فائقة النعومة.', images: '["/images/banner-hero-2.jpg","/images/banner-hero-3.jpg"]' },

  // Gift Boxes
  { nameEn: 'Ultimate Gift Hamper', nameAr: 'سلة الهدايا الشاملة', slug: 'ultimate-hamper', sku: 'BLM-GFT-001', price: 499, salePrice: 449, categoryId: 'gift-boxes', stock: 15, occasion: 'anniversary', color: 'gold', isFeatured: true, rating: 4.9, reviewCount: 67, tags: '["gift","hamper","luxury","premium","ultimate"]', descriptionEn: 'A premium gift hamper featuring chocolates, perfume, candles, and a handwritten card.', descriptionAr: 'سلة هدايا فاخرة تضم شوكولاتة وعطراً وشموعاً وبطاقة مكتوبة بخط اليد.', images: '["/images/choco-rose-combo-1.jpg","/images/lavender-dreams-1.jpg"]' },
  { nameEn: 'New Baby Gift Set', nameAr: 'طقم هدايا المولود الجديد', slug: 'baby-gift-set', sku: 'BLM-GFT-002', price: 199, categoryId: 'baby-gifts', stock: 30, occasion: 'baby_arrival', color: 'pastel', isNewArrival: true, sameDayDelivery: true, rating: 4.7, reviewCount: 53, tags: '["baby","gift","newborn","welcome"]', descriptionEn: 'Thoughtful gift set for newborns including soft blanket, teddy bear, and baby essentials.', descriptionAr: 'مجموعة هدايا متأنية للمواليد تشمل بطانية ناعمة ودمية محشوة ومستلزمات الطفل.', images: '["/images/oud-royal-perfume-1.jpg","/images/royal-garden-1.jpg"]' },
];
const COUPONS = [
  { code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 100, maxUses: 1000, expiresAt: '2026-12-31T23:59:59Z' },
  { code: 'FIRST25', type: 'fixed', value: 25, minOrder: 150, maxUses: 500, expiresAt: '2026-12-31T23:59:59Z' },
  { code: 'RAMADAN15', type: 'percentage', value: 15, minOrder: 200, maxUses: null, expiresAt: '2026-12-31T23:59:59Z' },
];

async function main() {
  console.log('Seeding database...');

  // Create super admin user
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@bloomgift.ae' },
    update: {},
    create: {
      email: 'superadmin@bloomgift.ae',
      name: 'Super Admin',
      password: 'superadmin123',
      role: 'super_admin',
      isVerified: true,
      isActive: true,
    },
  });

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bloomgift.ae' },
    update: {},
    create: {
      email: 'admin@bloomgift.ae',
      name: 'Admin User',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      isActive: true,
    },
  });

  // Create florist user
  const florist = await prisma.user.upsert({
    where: { email: 'florist@bloomgift.ae' },
    update: {},
    create: {
      email: 'florist@bloomgift.ae',
      name: 'Sara Florist',
      password: 'florist123',
      phone: '+971505551234',
      role: 'florist',
      isVerified: true,
      isActive: true,
    },
  });

  // Create demo customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Ahmed Al Maktoum',
      password: 'customer123',
      phone: '+971501234567',
      role: 'customer',
      isVerified: true,
      isActive: true,
    },
  });

  // Create categories
  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const data: Record<string, unknown> = {
      nameEn: cat.nameEn,
      nameAr: cat.nameAr,
      slug: cat.slug,
      sortOrder: cat.sortOrder,
    };
    if (cat.parentId && categoryMap[cat.parentId]) {
      data.parentId = categoryMap[cat.parentId];
    }
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: data,
    });
    categoryMap[cat.slug] = created.id;
  }

  // Create products
  for (const prod of PRODUCTS) {
    const catId = categoryMap[prod.categoryId];
    if (!catId) {
      console.warn(`Category ${prod.categoryId} not found, skipping product ${prod.sku}`);
      continue;
    }
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: {
        nameEn: prod.nameEn,
        nameAr: prod.nameAr,
        slug: prod.slug,
        sku: prod.sku,
        price: prod.price,
        salePrice: prod.salePrice || null,
        categoryId: catId,
        stock: prod.stock,
        occasion: prod.occasion,
        color: prod.color,
        isFeatured: prod.isFeatured || false,
        isNewArrival: prod.isNewArrival || false,
        isBestSeller: prod.isBestSeller || false,
        sameDayDelivery: prod.sameDayDelivery || false,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        descriptionEn: prod.descriptionEn,
        descriptionAr: prod.descriptionAr,
        images: prod.images,
        tags: prod.tags,
      },
    });
  }

  // Create banners
  for (const banner of BANNERS) {
    await prisma.banner.create({
      data: {
        titleEn: banner.titleEn,
        titleAr: banner.titleAr,
        subtitleEn: banner.subtitleEn || null,
        subtitleAr: banner.subtitleAr || null,
        image: banner.image,
        link: banner.link,
        position: banner.position as 'hero' | 'homepage' | 'sidebar',
        sortOrder: banner.sortOrder,
      },
    });
  }

  // Create coupons
  for (const coupon of COUPONS) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxUses: coupon.maxUses,
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt) : null,
      },
    });
  }

  // Create sample order
  const products = await prisma.product.findMany({ take: 2 });
  if (products.length >= 2) {
    await prisma.order.create({
      data: {
        orderNumber: 'BG-2024-001',
        userId: customer.id,
        status: 'delivered',
        paymentMethod: 'cod',
        paymentStatus: 'paid',
        subtotal: products[0].price + products[1].price,
        deliveryFee: 25,
        total: products[0].price + products[1].price + 25,
        recipientName: 'Fatima Al Hashmi',
        recipientPhone: '+971509876543',
        deliveryCity: 'Dubai',
        deliveryArea: 'Downtown Dubai',
        deliveryStreet: 'Sheikh Mohammed Blvd',
        deliveryDate: '2024-12-20',
        deliveryTime: 'evening',
        giftWrap: true,
        giftWrapPrice: 15,
        items: {
          create: [
            {
              productId: products[0].id,
              productName: products[0].nameEn,
              productImage: JSON.parse(products[0].images)[0] as string,
              price: products[0].price,
              quantity: 1,
              total: products[0].price,
            },
            {
              productId: products[1].id,
              productName: products[1].nameEn,
              productImage: JSON.parse(products[1].images)[0] as string,
              price: products[1].price,
              quantity: 1,
              total: products[1].price,
            },
          ],
        },
      },
    });
  }

  // Create sample reviews
  const allProducts = await prisma.product.findMany({ take: 5 });
  for (const product of allProducts) {
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: customer.id,
        rating: 5,
        comment: 'Absolutely beautiful! Delivered on time and the quality exceeded my expectations. Will definitely order again!',
      },
    });
  }

  console.log('Database seeded successfully!');
  console.log(`Created ${CATEGORIES.length} categories`);
  console.log(`Created ${PRODUCTS.length} products`);
  console.log(`Created ${BANNERS.length} banners`);
  console.log(`Created ${COUPONS.length} coupons`);
  console.log(`Super Admin: superadmin@bloomgift.ae / superadmin123`);
  console.log(`Admin: admin@bloomgift.ae / admin123`);
  console.log(`Florist: florist@bloomgift.ae / florist123`);
  console.log(`Customer: customer@example.com / customer123`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
