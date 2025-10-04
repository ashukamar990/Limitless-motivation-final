// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyAeB7VzIxJaNYagUPoKd-kN5HXmLbS2-Vw",
  authDomain: "videomanager-23d98.firebaseapp.com",
  databaseURL: "https://videomanager-23d98-default-rtdb.firebaseio.com",
  projectId: "videomanager-23d98",
  storageBucket: "videomanager-23d98.firebasestorage.app",
  messagingSenderId: "847321523576",
  appId: "1:847321523576:web:bda3f5026e3e163603548d",
  measurementId: "G-YBSJ1KMPV4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Realtime Database and Authentication
const realtimeDB = firebase.database();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

/***********************
 * Global Variables
 ***********************/
let PRODUCTS = [];
let productsLoaded = false;
let recentlyViewed = [];
let currentUser = null;
let users = [];
let selectedProduct = null;
let selectedSize = 'S';
let selectedQty = 1;
let userInfo = {};

// NEW: Advertisement banners and categories
let AD_BANNERS = [];
let CATEGORIES = [];

// Product image slider variables
let currentDetailImageIndex = 0;
let currentDetailProduct = null;
let currentOrderImageIndex = 0;
let currentOrderProduct = null;

// Advertisement banner variables
let currentAdIndex = 0;
let adInterval;

/***********************
 * Load Data Functions
 ***********************/

// Load products from Realtime Database with offline support
function loadProductsFromRealtimeDB() {
  // First try to load from localStorage
  const cachedProducts = localStorage.getItem('cached_products');
  if (cachedProducts) {
    try {
      PRODUCTS = JSON.parse(cachedProducts);
      renderHomePreview();
      renderProductSlider();
      productsLoaded = true;
    } catch (e) {
      console.error("Error parsing cached products:", e);
    }
  }

  // Then try to load from Realtime Database
  const productsRef = realtimeDB.ref('products');
  productsRef.on('value', (snapshot) => {
    const products = [];
    snapshot.forEach((childSnapshot) => {
      const productData = childSnapshot.val();
      // Map the product data to the expected structure
      products.push({
        id: childSnapshot.key,
        title: productData.name || 'No Name',
        price: productData.price || 0,
        desc: productData.description || '',
        fullDesc: productData.fullDesc || productData.description || '',
        images: productData.images ? productData.images : (productData.image ? [productData.image] : []),
        sizes: productData.sizes || ['S', 'M', 'L'],
        category: productData.category || 'Uncategorized',
        // Additional product properties
        sku: productData.sku || 'SKU-' + childSnapshot.key,
        stock: productData.stock || Math.floor(Math.random() * 50) + 10,
        // Featured and trending flags from admin panel
        featured: productData.featured || false,
        trending: productData.trending || false,
        // Minimum quantity from admin panel
        minQty: productData.minQty || 1
      });
    });
    
    // Update the PRODUCTS array
    PRODUCTS = products;
    
    // Cache to localStorage
    localStorage.setItem('cached_products', JSON.stringify(PRODUCTS));
    
    // Update UI if not already loaded
    if (!productsLoaded) {
      renderHomePreview();
      renderProductSlider();
      productsLoaded = true;
    } else {
      // Update the product slider with new data
      renderProductSlider();
    }
  }, (error) => {
    console.error("Error loading products:", error);
    // If we have cached products, use them
    if (PRODUCTS.length === 0) {
      loadDemoProducts();
    }
  });
}

// Load demo products as fallback
function loadDemoProducts() {
  PRODUCTS = [
    {
      id: '1',
      title: 'Men\'s Casual T-Shirt',
      price: 599,
      desc: 'Comfortable cotton t-shirt for daily wear',
      fullDesc: 'This premium cotton t-shirt offers ultimate comfort for daily wear. Made from 100% cotton, it features a regular fit and is perfect for casual outings.',
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      category: 'Men',
      sku: 'TS-MEN-BLK-001',
      stock: 25,
      featured: true,
      trending: true,
      minQty: 1
    },
    {
      id: '2',
      title: 'Women\'s Summer Dress',
      price: 1299,
      desc: 'Elegant floral print dress for summer',
      fullDesc: 'Beautiful floral print dress made from breathable fabric. Perfect for summer outings and special occasions.',
      images: [
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      ],
      sizes: ['S', 'M', 'L'],
      category: 'Women',
      sku: 'DR-WOM-FLR-002',
      stock: 15,
      featured: true,
      trending: false,
      minQty: 1
    },
    {
      id: '3',
      title: 'Wireless Earbuds',
      price: 2499,
      desc: 'Premium sound quality with noise cancellation',
      fullDesc: 'Experience crystal clear audio with these wireless earbuds. Features noise cancellation and 20-hour battery life.',
      images: [
        'https://images.unsplash.com/photo-1590658165737-15a047b8b5e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      ],
      sizes: ['One Size'],
      category: 'Electronics',
      sku: 'EB-AUD-BLK-003',
      stock: 30,
      featured: false,
      trending: true,
      minQty: 1
    },
    {
      id: '4',
      title: 'Kids\' Cartoon T-Shirt',
      price: 399,
      desc: 'Fun cartoon print for kids',
      fullDesc: 'Colorful cartoon print t-shirt made from soft cotton. Perfect for everyday wear and play.',
      images: [
        'https://images.unsplash.com/photo-1503454534315-4d87d5ac91e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      ],
      sizes: ['XS', 'S', 'M'],
      category: 'Kids',
      sku: 'TS-KID-CRT-004',
      stock: 40,
      featured: false,
      trending: false,
      minQty: 1
    },
    {
      id: '5',
      title: 'Men\'s Formal Shirt',
      price: 899,
      desc: 'Classic fit formal shirt for office wear',
      fullDesc: 'Premium quality formal shirt with a classic fit. Made from breathable cotton blend fabric.',
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      category: 'Men',
      sku: 'SH-MEN-FRM-005',
      stock: 20,
      featured: true,
      trending: false,
      minQty: 1
    },
    {
      id: '6',
      title: 'Women\'s Handbag',
      price: 1599,
      desc: 'Stylish leather handbag for women',
      fullDesc: 'Elegant leather handbag with multiple compartments. Perfect for work and casual outings.',
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      ],
      sizes: ['One Size'],
      category: 'Accessories',
      sku: 'BG-WOM-LTH-006',
      stock: 12,
      featured: false,
      trending: true,
      minQty: 1
    }
  ];
  
  // Cache to localStorage
  localStorage.setItem('cached_products', JSON.stringify(PRODUCTS));
  
  // Update UI
  renderHomePreview();
  renderProductSlider();
  productsLoaded = true;
}

// Load categories from Realtime Database
function loadCategories() {
  const categoriesRef = realtimeDB.ref('categories');
  categoriesRef.on('value', (snapshot) => {
    const categories = [];
    snapshot.forEach((childSnapshot) => {
      const categoryData = childSnapshot.val();
      categories.push({
        id: childSnapshot.key,
        name: categoryData.name,
        logo: categoryData.logo || '🛍️' // Default icon if no logo
      });
    });
    
    CATEGORIES = categories;
    renderCategories(categories);
    renderCategorySection(categories);
  }, (error) => {
    console.error("Error loading categories:", error);
    // If categories fail to load, use default ones
    const defaultCategories = [
      { id: '1', name: 'Men', logo: '👔' },
      { id: '2', name: 'Women', logo: '👗' },
      { id: '3', name: 'Kids', logo: '👶' },
      { id: '4', name: 'Electronics', logo: '📱' },
      { id: '5', name: 'Home', logo: '🏠' },
      { id: '6', name: 'Accessories', logo: '👜' }
    ];
    CATEGORIES = defaultCategories;
    renderCategories(defaultCategories);
    renderCategorySection(defaultCategories);
  });
}

// NEW: Load advertisement banners from Realtime Database
function loadAdBanners() {
  const bannersRef = realtimeDB.ref('adBanners');
  bannersRef.on('value', (snapshot) => {
    const banners = [];
    snapshot.forEach((childSnapshot) => {
      const bannerData = childSnapshot.val();
      banners.push({
        id: childSnapshot.key,
        image: bannerData.image,
        title: bannerData.title,
        link: bannerData.link || '#'
      });
    });
    
    AD_BANNERS = banners;
    renderAdBanners(banners);
  }, (error) => {
    console.error("Error loading ad banners:", error);
    // If banners fail to load, hide the section
    document.getElementById('adBannerSection').style.display = 'none';
  });
}

/***********************
 * Rendering Functions
 ***********************/

// Render categories for products page
function renderCategories(categories) {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Add "All" category
  const allPill = document.createElement('div');
  allPill.className = 'category-pill active';
  allPill.textContent = 'All';
  allPill.onclick = () => {
    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.classList.remove('active');
    });
    allPill.classList.add('active');
    renderProductGrid();
  };
  container.appendChild(allPill);
  
  categories.forEach(category => {
    const pill = document.createElement('div');
    pill.className = 'category-pill';
    pill.textContent = category.name;
    pill.onclick = () => filterProductsByCategory(category.name);
    container.appendChild(pill);
  });
}

// NEW: Render category section for home page
function renderCategorySection(categories) {
  const container = document.getElementById('categoryContainer');
  const section = document.getElementById('categorySection');
  
  if (!container || categories.length === 0) {
    if (section) section.style.display = 'none';
    return;
  }
  
  container.innerHTML = '';
  section.style.display = 'block';
  
  categories.forEach(category => {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.onclick = () => {
      showPage('productsPage');
      // Set active category in products page
      setTimeout(() => {
        document.querySelectorAll('.category-pill').forEach(pill => {
          pill.classList.remove('active');
          if (pill.textContent === category.name) {
            pill.classList.add('active');
          }
        });
        filterProductsByCategory(category.name);
      }, 100);
    };
    
    categoryItem.innerHTML = `
      <div class="category-logo">
        ${category.logo}
      </div>
      <div class="category-name">${category.name}</div>
    `;
    
    container.appendChild(categoryItem);
  });
}

// NEW: Render advertisement banners
function renderAdBanners(banners) {
  const container = document.getElementById('adBannerTrack');
  const navContainer = document.getElementById('adBannerNav');
  const section = document.getElementById('adBannerSection');
  
  if (!container || banners.length === 0) {
    if (section) section.style.display = 'none';
    return;
  }
  
  container.innerHTML = '';
  navContainer.innerHTML = '';
  section.style.display = 'block';
  
  banners.forEach((banner, index) => {
    // Create banner slide
    const slide = document.createElement('div');
    slide.className = 'ad-banner-slide';
    slide.style.backgroundImage = `url('${banner.image}')`;
    slide.onclick = () => {
      if (banner.link && banner.link !== '#') {
        window.open(banner.link, '_blank');
      }
    };
    container.appendChild(slide);
    
    // Create navigation dot
    const dot = document.createElement('div');
    dot.className = `ad-banner-dot ${index === 0 ? 'active' : ''}`;
    dot.onclick = () => {
      currentAdIndex = index;
      updateAdBanner();
    };
    navContainer.appendChild(dot);
  });
  
  // Initialize ad banner slider
  initAdBannerSlider();
}

// NEW: Initialize ad banner slider
function initAdBannerSlider() {
  const track = document.getElementById('adBannerTrack');
  const prevBtn = document.querySelector('.ad-banner-arrow.prev');
  const nextBtn = document.querySelector('.ad-banner-arrow.next');
  const dots = document.querySelectorAll('.ad-banner-dot');
  
  if (!track || AD_BANNERS.length <= 1) return;
  
  // Previous button
  prevBtn.onclick = () => {
    currentAdIndex = (currentAdIndex - 1 + AD_BANNERS.length) % AD_BANNERS.length;
    updateAdBanner();
  };
  
  // Next button
  nextBtn.onclick = () => {
    currentAdIndex = (currentAdIndex + 1) % AD_BANNERS.length;
    updateAdBanner();
  };
  
  // Auto-advance banners
  clearInterval(adInterval);
  adInterval = setInterval(() => {
    currentAdIndex = (currentAdIndex + 1) % AD_BANNERS.length;
    updateAdBanner();
  }, 5000);
  
  // Add touch support for mobile
  let startX = 0;
  let endX = 0;
  
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });
  
  track.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const diff = startX - endX;
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        // Swipe left - next
        currentAdIndex = (currentAdIndex + 1) % AD_BANNERS.length;
      } else {
        // Swipe right - previous
        currentAdIndex = (currentAdIndex - 1 + AD_BANNERS.length) % AD_BANNERS.length;
      }
      updateAdBanner();
    }
  }
}

function updateAdBanner() {
  const track = document.getElementById('adBannerTrack');
  const dots = document.querySelectorAll('.ad-banner-dot');
  
  if (!track) return;
  
  track.style.transform = `translateX(-${currentAdIndex * 100}%)`;
  
  // Update dots
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentAdIndex);
  });
}

// Filter products by category
function filterProductsByCategory(category) {
  // Highlight selected category
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.classList.remove('active');
    if (pill.textContent === category) {
      pill.classList.add('active');
    }
  });
  
  // Filter products
  const filtered = category === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === category);
  renderProductGrid(filtered);
}

// Render home page product preview
function renderHomePreview() {
  const container = document.getElementById('homeProductGrid');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Show only featured products on home page
  const featuredProducts = PRODUCTS.filter(p => p.featured).slice(0, 6);
  
  featuredProducts.forEach(product => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
}

// Render product grid for products page
function renderProductGrid(products = PRODUCTS) {
  const container = document.getElementById('productGrid');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (products.length === 0) {
    container.innerHTML = '<div class="card-panel center">No products found matching your criteria.</div>';
    return;
  }
  
  products.forEach(product => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
}

// Create product card element - FIXED to avoid "object object" issue
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-id', product.id);
  
  // Get the first image or placeholder
  const firstImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
  
  // Product card with image slider
  card.innerHTML = `
    <div class="product-img-slider-container">
      <div class="product-img-slider" style="background-image: url('${firstImage}')"></div>
      <button class="product-card-control prev">&#10094;</button>
      <button class="product-card-control next">&#10095;</button>
      <div class="product-card-dots"></div>
    </div>
    <div class="card-body">
      <div class="title">${product.title}</div>
      <div class="price">₹${product.price}</div>
      <div class="badge">${product.desc}</div>
      <div style="margin-top:auto;display:flex;gap:8px">
        <button class="btn" style="flex:1" onclick="orderProduct('${product.id}')">Order Now</button>
        <button class="btn secondary wishlist-btn" data-id="${product.id}">♡</button>
      </div>
    </div>
  `;
  
  // Initialize image slider for product card
  if (product.images && product.images.length > 1) {
    initProductCardSlider(card, product);
  }
  
  // Add click event to open product detail
  card.addEventListener('click', (e) => {
    // Don't trigger if clicked on buttons
    if (!e.target.closest('button')) {
      showProductDetail(product.id);
    }
  });
  
  // Add wishlist button event
  const wishlistBtn = card.querySelector('.wishlist-btn');
  wishlistBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  });
  
  return card;
}

// Initialize image slider for product cards - FIXED to work properly
function initProductCardSlider(card, product) {
  const slider = card.querySelector('.product-img-slider');
  const prevBtn = card.querySelector('.product-card-control.prev');
  const nextBtn = card.querySelector('.product-card-control.next');
  const dotsContainer = card.querySelector('.product-card-dots');
  
  let currentIndex = 0;
  
  // Create dots
  product.images.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = `product-card-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = index;
      updateCardSlider();
    });
    dotsContainer.appendChild(dot);
  });
  
  // Previous button
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + product.images.length) % product.images.length;
    updateCardSlider();
  });
  
  // Next button
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % product.images.length;
    updateCardSlider();
  });
  
  function updateCardSlider() {
    slider.style.backgroundImage = `url('${product.images[currentIndex]}')`;
    
    // Update dots
    dotsContainer.querySelectorAll('.product-card-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }
  
  // Add touch support for mobile
  let startX = 0;
  let endX = 0;
  
  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });
  
  slider.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const diff = startX - endX;
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        // Swipe left - next
        currentIndex = (currentIndex + 1) % product.images.length;
      } else {
        // Swipe right - previous
        currentIndex = (currentIndex - 1 + product.images.length) % product.images.length;
      }
      updateCardSlider();
    }
  }
}

// Render product slider for trending products
function renderProductSlider() {
  const container = document.getElementById('productSlider');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Show trending products in the slider
  const trendingProducts = PRODUCTS.filter(p => p.trending).slice(0, 8);
  
  trendingProducts.forEach(product => {
    const slideItem = document.createElement('div');
    slideItem.className = 'slider-item';
    slideItem.setAttribute('data-id', product.id);
    
    const firstImage = product.images && product.images.length > 0 
      ? product.images[0] 
      : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    slideItem.innerHTML = `
      <div class="slider-item-img" style="background-image: url('${firstImage}')"></div>
      <div class="slider-item-body">
        <div class="slider-item-title">${product.title}</div>
        <div class="slider-item-price">₹${product.price}</div>
      </div>
    `;
    
    slideItem.addEventListener('click', () => {
      showProductDetail(product.id);
    });
    
    container.appendChild(slideItem);
  });
}

// NEW: Render recently viewed products
function renderRecentlyViewed() {
  const container = document.getElementById('recentlyViewedSlider');
  const section = document.getElementById('recentlyViewedSection');
  
  if (!container || recentlyViewed.length === 0) {
    if (section) section.style.display = 'none';
    return;
  }
  
  container.innerHTML = '';
  section.style.display = 'block';
  
  // Show recently viewed products (limit to 6)
  recentlyViewed.slice(0, 6).forEach(productId => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    
    const slideItem = document.createElement('div');
    slideItem.className = 'slider-item';
    slideItem.setAttribute('data-id', product.id);
    
    const firstImage = product.images && product.images.length > 0 
      ? product.images[0] 
      : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    slideItem.innerHTML = `
      <div class="slider-item-img" style="background-image: url('${firstImage}')"></div>
      <div class="slider-item-body">
        <div class="slider-item-title">${product.title}</div>
        <div class="slider-item-price">₹${product.price}</div>
      </div>
    `;
    
    slideItem.addEventListener('click', () => {
      showProductDetail(product.id);
    });
    
    container.appendChild(slideItem);
  });
}

/***********************
 * Product Detail Functions
 ***********************/

// Show product detail page
function showProductDetail(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  // Add to recently viewed
  addToRecentlyViewed(productId);
  
  // Update breadcrumb
  document.getElementById('breadcrumbProductName').textContent = product.title;
  
  // Update main product details
  document.getElementById('detailTitle').textContent = product.title;
  document.getElementById('detailPrice').textContent = `₹${product.price}`;
  document.getElementById('detailDesc').textContent = product.desc;
  document.getElementById('detailFullDesc').textContent = product.fullDesc;
  document.getElementById('detailSku').textContent = `SKU: ${product.sku}`;
  
  // NEW: Generate and display shareable product link
  const productLink = generateProductLink(productId);
  document.getElementById('productShareLink').textContent = productLink;
  
  // Update stock status
  const stockStatus = document.getElementById('detailStockStatus');
  if (product.stock > 10) {
    stockStatus.textContent = 'In Stock';
    stockStatus.className = 'stock-status in-stock';
  } else if (product.stock > 0) {
    stockStatus.textContent = 'Low Stock';
    stockStatus.className = 'stock-status low-stock';
  } else {
    stockStatus.textContent = 'Out of Stock';
    stockStatus.className = 'stock-status out-of-stock';
  }
  
  // Update product meta
  const metaContainer = document.getElementById('detailMeta');
  metaContainer.innerHTML = `
    <p><strong>Category:</strong> ${product.category}</p>
    <p><strong>Available Sizes:</strong> ${product.sizes.join(', ')}</p>
    <p><strong>Available Stock:</strong> ${product.stock} units</p>
  `;
  
  // Update product images
  updateProductDetailImages(product);
  
  // Update similar products
  updateSimilarProducts(product);
  
  // Update order and wishlist buttons
  document.getElementById('detailOrderBtn').onclick = () => orderProduct(productId);
  document.getElementById('detailWishlistBtn').onclick = () => toggleWishlist(productId);
  
  // Update wishlist button state
  updateWishlistButtonState(productId);
  
  // Show the product detail page
  showPage('productDetailPage');
}

// NEW: Add product to recently viewed
function addToRecentlyViewed(productId) {
  // Remove if already exists
  recentlyViewed = recentlyViewed.filter(id => id !== productId);
  
  // Add to beginning
  recentlyViewed.unshift(productId);
  
  // Limit to 10 products
  if (recentlyViewed.length > 10) {
    recentlyViewed = recentlyViewed.slice(0, 10);
  }
  
  // Save to localStorage
  localStorage.setItem('recently_viewed', JSON.stringify(recentlyViewed));
  
  // Update UI
  renderRecentlyViewed();
}

// NEW: Generate shareable product link
function generateProductLink(productId) {
  const baseUrl = window.location.href.split('?')[0];
  return `${baseUrl}?product=${productId}`;
}

// NEW: Check for product ID in URL parameters
function checkUrlForProduct() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product');
  
  if (productId) {
    // Check if product exists
    const product = PRODUCTS.find(p => p.id === productId);
    if (product) {
      showProductDetail(productId);
      return true;
    }
  }
  return false;
}

// NEW: Update product detail images with carousel
function updateProductDetailImages(product) {
  const mainImage = document.getElementById('detailMainImage');
  const thumbnails = document.getElementById('detailThumbnails');
  
  // Clear previous content
  thumbnails.innerHTML = '';
  
  // Set main image
  if (product.images && product.images.length > 0) {
    mainImage.style.backgroundImage = `url('${product.images[0]}')`;
    
    // Create thumbnails
    product.images.forEach((image, index) => {
      const thumb = document.createElement('div');
      thumb.className = `product-detail-thumbnail ${index === 0 ? 'active' : ''}`;
      thumb.style.backgroundImage = `url('${image}')`;
      thumb.addEventListener('click', () => {
        // Update main image
        mainImage.style.backgroundImage = `url('${image}')`;
        
        // Update active thumbnail
        document.querySelectorAll('.product-detail-thumbnail').forEach(t => {
          t.classList.remove('active');
        });
        thumb.classList.add('active');
        
        // Update carousel index
        currentDetailImageIndex = index;
      });
      thumbnails.appendChild(thumb);
    });
    
    // Initialize carousel controls if multiple images
    if (product.images.length > 1) {
      initDetailCarousel(product);
    } else {
      // Hide controls if only one image
      mainImage.querySelector('.prev').style.display = 'none';
      mainImage.querySelector('.next').style.display = 'none';
      mainImage.querySelector('.detail-carousel-dots').style.display = 'none';
    }
  } else {
    // Use placeholder if no images
    mainImage.style.backgroundImage = `url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')`;
    mainImage.querySelector('.prev').style.display = 'none';
    mainImage.querySelector('.next').style.display = 'none';
    mainImage.querySelector('.detail-carousel-dots').style.display = 'none';
  }
}

// NEW: Initialize detail page image carousel
function initDetailCarousel(product) {
  currentDetailProduct = product;
  currentDetailImageIndex = 0;
  
  const mainImage = document.getElementById('detailMainImage');
  const prevBtn = mainImage.querySelector('.prev');
  const nextBtn = mainImage.querySelector('.next');
  const dotsContainer = mainImage.querySelector('.detail-carousel-dots');
  
  // Clear previous dots
  dotsContainer.innerHTML = '';
  
  // Create dots
  product.images.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = `detail-carousel-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      currentDetailImageIndex = index;
      updateDetailCarousel();
    });
    dotsContainer.appendChild(dot);
  });
  
  // Previous button
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentDetailImageIndex = (currentDetailImageIndex - 1 + product.images.length) % product.images.length;
    updateDetailCarousel();
  });
  
  // Next button
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentDetailImageIndex = (currentDetailImageIndex + 1) % product.images.length;
    updateDetailCarousel();
  });
  
  // Show controls
  prevBtn.style.display = 'flex';
  nextBtn.style.display = 'flex';
  dotsContainer.style.display = 'flex';
}

function updateDetailCarousel() {
  if (!currentDetailProduct) return;
  
  const mainImage = document.getElementById('detailMainImage');
  const dotsContainer = mainImage.querySelector('.detail-carousel-dots');
  
  // Update main image
  mainImage.style.backgroundImage = `url('${currentDetailProduct.images[currentDetailImageIndex]}')`;
  
  // Update dots
  dotsContainer.querySelectorAll('.detail-carousel-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === currentDetailImageIndex);
  });
  
  // Update thumbnails
  document.querySelectorAll('.product-detail-thumbnail').forEach((thumb, index) => {
    thumb.classList.toggle('active', index === currentDetailImageIndex);
  });
}

// NEW: Update similar products
function updateSimilarProducts(product) {
  const container = document.getElementById('similarProductsSlider');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Find similar products (same category, excluding current product)
  const similarProducts = PRODUCTS.filter(p => 
    p.category === product.category && p.id !== product.id
  ).slice(0, 6);
  
  similarProducts.forEach(similarProduct => {
    const slideItem = document.createElement('div');
    slideItem.className = 'slider-item';
    slideItem.setAttribute('data-id', similarProduct.id);
    
    const firstImage = similarProduct.images && similarProduct.images.length > 0 
      ? similarProduct.images[0] 
      : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    slideItem.innerHTML = `
      <div class="slider-item-img" style="background-image: url('${firstImage}')"></div>
      <div class="slider-item-body">
        <div class="slider-item-title">${similarProduct.title}</div>
        <div class="slider-item-price">₹${similarProduct.price}</div>
      </div>
    `;
    
    slideItem.addEventListener('click', () => {
      showProductDetail(similarProduct.id);
    });
    
    container.appendChild(slideItem);
  });
}

/***********************
 * Authentication Functions
 ***********************/

// Initialize authentication state
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in
    currentUser = user;
    updateUserUI(user);
    
    // Load user data from database
    loadUserData(user.uid);
  } else {
    // User is signed out
    currentUser = null;
    updateUserUI(null);
  }
});

// Load user data from database
function loadUserData(userId) {
  const userRef = realtimeDB.ref('users/' + userId);
  userRef.once('value').then(snapshot => {
    const userData = snapshot.val();
    if (userData) {
      // User data exists, update UI accordingly
      updateUserProfile(userData);
    } else {
      // User data doesn't exist, create it
      createUserData(userId);
    }
  });
}

// Create user data in database
function createUserData(userId) {
  const userData = {
    uid: userId,
    name: currentUser.displayName || 'User',
    email: currentUser.email,
    photoURL: currentUser.photoURL || '',
    createdAt: new Date().toISOString(),
    orders: [],
    wishlist: [],
    addresses: []
  };
  
  realtimeDB.ref('users/' + userId).set(userData);
  updateUserProfile(userData);
}

// Update user profile in database
function updateUserProfile(userData) {
  // Update UI with user data
  document.getElementById('userName').textContent = userData.name;
  document.getElementById('mobileUserName').textContent = userData.name;
  document.getElementById('profileName').textContent = userData.name;
  document.getElementById('profileEmail').textContent = userData.email;
  document.getElementById('profileEmailInput').value = userData.email;
  document.getElementById('profileFullName').value = userData.name;
  
  if (userData.phone) {
    document.getElementById('profilePhone').value = userData.phone;
  }
  
  if (userData.photoURL) {
    document.getElementById('userAvatar').innerHTML = `<img src="${userData.photoURL}" style="width:32px;height:32px;border-radius:50%;">`;
    document.getElementById('profileAvatar').style.backgroundImage = `url('${userData.photoURL}')`;
    document.getElementById('profileAvatar').innerHTML = '';
  } else {
    const initial = userData.name.charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = initial;
    document.getElementById('profileAvatar').textContent = initial;
  }
  
  // Update orders and wishlist counts
  if (userData.orders && userData.orders.length > 0) {
    document.getElementById('ordersNotification').textContent = userData.orders.length;
    document.getElementById('ordersNotification').style.display = 'flex';
  } else {
    document.getElementById('ordersNotification').style.display = 'none';
  }
  
  // Update saved addresses
  if (userData.addresses) {
    renderSavedAddresses(userData.addresses);
  }
}

// Update UI based on authentication state
function updateUserUI(user) {
  const loginBtn = document.getElementById('openLoginTop');
  const userProfile = document.getElementById('userProfile');
  const userProfileBtn = document.getElementById('openUserProfileTop');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const mobileUserProfile = document.getElementById('mobileUserProfile');
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
  
  if (user) {
    // User is logged in
    loginBtn.style.display = 'none';
    userProfile.style.display = 'flex';
    userProfileBtn.style.display = 'inline-flex';
    mobileLoginBtn.style.display = 'none';
    mobileUserProfile.style.display = 'flex';
    mobileLogoutBtn.style.display = 'flex';
    
    // Update user info
    document.getElementById('userName').textContent = user.displayName || 'User';
    document.getElementById('mobileUserName').textContent = user.displayName || 'User';
    
    if (user.photoURL) {
      document.getElementById('userAvatar').innerHTML = `<img src="${user.photoURL}" style="width:32px;height:32px;border-radius:50%;">`;
    } else {
      const initial = (user.displayName || 'User').charAt(0).toUpperCase();
      document.getElementById('userAvatar').textContent = initial;
    }
  } else {
    // User is logged out
    loginBtn.style.display = 'inline-flex';
    userProfile.style.display = 'none';
    userProfileBtn.style.display = 'none';
    mobileLoginBtn.style.display = 'flex';
    mobileUserProfile.style.display = 'none';
    mobileLogoutBtn.style.display = 'none';
  }
}

// NEW: Show login modal
function showLoginModal() {
  document.getElementById('authModal').classList.add('active');
}

// NEW: Close login modal
function closeLoginModal() {
  document.getElementById('authModal').classList.remove('active');
}

// NEW: Switch between login and signup tabs
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.toggle('active', form.id === tab + 'Form');
  });
}

// NEW: Show forgot password modal
function showForgotPassword() {
  document.getElementById('authModal').classList.remove('active');
  document.getElementById('forgotPasswordModal').classList.add('active');
}

// NEW: Handle forgot password form submission
document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('forgotPasswordEmail').value;
  
  auth.sendPasswordResetEmail(email)
    .then(() => {
      showToast('Password reset email sent! Check your inbox.', 'success');
      document.getElementById('forgotPasswordModal').classList.remove('active');
      document.getElementById('forgotPasswordEmail').value = '';
    })
    .catch((error) => {
      showToast('Error: ' + error.message, 'error');
    });
});

// Handle email/password login
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      showToast('Login successful!', 'success');
      closeLoginModal();
    })
    .catch((error) => {
      showToast('Login failed: ' + error.message, 'error');
    });
});

// Handle email/password signup
document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }
  
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      
      // Update profile with name
      return user.updateProfile({
        displayName: name
      }).then(() => {
        showToast('Account created successfully!', 'success');
        closeLoginModal();
      });
    })
    .catch((error) => {
      showToast('Signup failed: ' + error.message, 'error');
    });
});

// Handle Google Sign-In
document.getElementById('googleSignInBtn').addEventListener('click', function() {
  auth.signInWithPopup(provider)
    .then((result) => {
      // Signed in with Google
      showToast('Signed in with Google!', 'success');
      closeLoginModal();
    })
    .catch((error) => {
      showToast('Google Sign-In failed: ' + error.message, 'error');
    });
});

// Handle logout
function logoutUser() {
  auth.signOut()
    .then(() => {
      showToast('Logged out successfully', 'success');
      showPage('homePage');
    })
    .catch((error) => {
      showToast('Logout failed: ' + error.message, 'error');
    });
}

/***********************
 * User Profile Functions
 ***********************/

// NEW: Render saved addresses
function renderSavedAddresses(addresses) {
  const container = document.getElementById('savedAddresses');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (addresses.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center;">No saved addresses yet.</p>';
    return;
  }
  
  addresses.forEach((address, index) => {
    const addressCard = document.createElement('div');
    addressCard.className = 'address-card';
    if (index === 0) addressCard.classList.add('active'); // Mark first address as active
    
    addressCard.innerHTML = `
      <div><strong>${address.name}</strong></div>
      <div>${address.mobile}</div>
      <div>${address.house}, ${address.city}, ${address.state} - ${address.pincode}</div>
      <div class="address-actions">
        <button class="btn secondary" onclick="editAddress(${index})">Edit</button>
        <button class="btn error" onclick="deleteAddress(${index})">Delete</button>
      </div>
    `;
    
    container.appendChild(addressCard);
  });
}

// NEW: Show add address form
function showAddAddressForm() {
  document.getElementById('addAddressModal').classList.add('active');
}

// NEW: Save new address
document.getElementById('saveNewAddress').addEventListener('click', function() {
  const name = document.getElementById('newAddressName').value;
  const mobile = document.getElementById('newAddressMobile').value;
  const pincode = document.getElementById('newAddressPincode').value;
  const city = document.getElementById('newAddressCity').value;
  const state = document.getElementById('newAddressState').value;
  const house = document.getElementById('newAddressHouse').value;
  
  if (!name || !mobile || !pincode || !city || !state || !house) {
    showToast('Please fill all fields', 'error');
    return;
  }
  
  if (!currentUser) {
    showToast('Please login to save addresses', 'error');
    return;
  }
  
  const userRef = realtimeDB.ref('users/' + currentUser.uid);
  
  userRef.once('value').then(snapshot => {
    const userData = snapshot.val();
    const addresses = userData.addresses || [];
    
    addresses.push({
      name,
      mobile,
      pincode,
      city,
      state,
      house
    });
    
    userRef.update({ addresses: addresses });
    
    showToast('Address saved successfully', 'success');
    document.getElementById('addAddressModal').classList.remove('active');
    
    // Reset form
    document.getElementById('newAddressName').value = '';
    document.getElementById('newAddressMobile').value = '';
    document.getElementById('newAddressPincode').value = '';
    document.getElementById('newAddressCity').value = '';
    document.getElementById('newAddressState').value = '';
    document.getElementById('newAddressHouse').value = '';
    
    // Update UI
    renderSavedAddresses(addresses);
  });
});

// NEW: Cancel add address
document.getElementById('cancelAddAddress').addEventListener('click', function() {
  document.getElementById('addAddressModal').classList.remove('active');
});

// NEW: Save profile information
document.getElementById('saveProfileInfo').addEventListener('click', function() {
  if (!currentUser) return;
  
  const name = document.getElementById('profileFullName').value;
  const phone = document.getElementById('profilePhone').value;
  
  const userRef = realtimeDB.ref('users/' + currentUser.uid);
  
  userRef.update({
    name: name,
    phone: phone
  }).then(() => {
    showToast('Profile updated successfully', 'success');
    
    // Update UI
    document.getElementById('userName').textContent = name;
    document.getElementById('mobileUserName').textContent = name;
    document.getElementById('profileName').textContent = name;
  }).catch(error => {
    showToast('Error updating profile: ' + error.message, 'error');
  });
});

// NEW: Edit address (placeholder function)
function editAddress(index) {
  showToast('Edit address functionality coming soon', 'success');
}

// NEW: Delete address (placeholder function)
function deleteAddress(index) {
  if (!currentUser) return;
  
  if (confirm('Are you sure you want to delete this address?')) {
    const userRef = realtimeDB.ref('users/' + currentUser.uid);
    
    userRef.once('value').then(snapshot => {
      const userData = snapshot.val();
      const addresses = userData.addresses || [];
      
      addresses.splice(index, 1);
      
      userRef.update({ addresses: addresses });
      
      showToast('Address deleted successfully', 'success');
      renderSavedAddresses(addresses);
    });
  }
}

// NEW: Change password (placeholder function)
function changePassword() {
  showToast('Change password functionality coming soon', 'success');
}

/***********************
 * Auto-save User Information
 ***********************/

// NEW: Auto-save user information when filling the form
function setupAutoSave() {
  const userInfoFields = ['fullname', 'mobile', 'pincode', 'city', 'state', 'house'];
  
  userInfoFields.forEach(field => {
    const input = document.getElementById(field);
    if (input) {
      input.addEventListener('blur', function() {
        if (currentUser && this.value) {
          saveUserInfoToDatabase();
        }
      });
    }
  });
}

// NEW: Save user information to database
function saveUserInfoToDatabase() {
  if (!currentUser) return;
  
  const fullname = document.getElementById('fullname').value;
  const mobile = document.getElementById('mobile').value;
  const pincode = document.getElementById('pincode').value;
  const city = document.getElementById('city').value;
  const state = document.getElementById('state').value;
  const house = document.getElementById('house').value;
  
  // Only save if all fields are filled
  if (!fullname || !mobile || !pincode || !city || !state || !house) {
    return;
  }
  
  const userRef = realtimeDB.ref('users/' + currentUser.uid);
  
  userRef.once('value').then(snapshot => {
    const userData = snapshot.val();
    const addresses = userData.addresses || [];
    
    // Check if this address already exists
    const existingAddress = addresses.find(addr => 
      addr.name === fullname && 
      addr.mobile === mobile && 
      addr.pincode === pincode && 
      addr.city === city && 
      addr.state === state && 
      addr.house === house
    );
    
    if (!existingAddress) {
      // Add new address
      addresses.push({
        name: fullname,
        mobile: mobile,
        pincode: pincode,
        city: city,
        state: state,
        house: house
      });
      
      userRef.update({ addresses: addresses });
    }
  });
}

/***********************
 * Wishlist Functions
 ***********************/

// Toggle product in wishlist
function toggleWishlist(productId) {
  // Check if user is logged in
  if (!currentUser) {
    showAlert('Please login to add items to your wishlist');
    return;
  }
  
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  const userRef = realtimeDB.ref('users/' + currentUser.uid);
  
  userRef.once('value').then(snapshot => {
    const userData = snapshot.val();
    let wishlist = userData.wishlist || [];
    
    // Check if product is already in wishlist
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
      // Remove from wishlist
      wishlist.splice(index, 1);
      showToast('Removed from wishlist', 'success');
    } else {
      // Add to wishlist
      wishlist.push(productId);
      showToast('Added to wishlist', 'success');
    }
    
    // Update database
    userRef.update({ wishlist: wishlist });
    
    // Update UI
    updateWishlistButtonState(productId);
    renderWishlistPage();
  });
}

// Update wishlist button state
function updateWishlistButtonState(productId) {
  if (!currentUser) return;
  
  const userRef = realtimeDB.ref('users/' + currentUser.uid);
  
  userRef.once('value').then(snapshot => {
    const userData = snapshot.val();
    const wishlist = userData.wishlist || [];
    
    const isInWishlist = wishlist.includes(productId);
    
    // Update all wishlist buttons for this product
    document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`).forEach(btn => {
      if (isInWishlist) {
        btn.classList.add('active');
        btn.textContent = '❤️';
      } else {
        btn.classList.remove('active');
        btn.textContent = '♡';
      }
    });
    
    // Update detail page wishlist button
    const detailBtn = document.getElementById('detailWishlistBtn');
    if (detailBtn) {
      if (isInWishlist) {
        detailBtn.classList.add('active');
        detailBtn.textContent = 'Remove from Wishlist';
      } else {
        detailBtn.classList.remove('active');
        detailBtn.textContent = 'Add to Wishlist';
      }
    }
  });
}

// Render wishlist page
function renderWishlistPage() {
  // Check if user is logged in
  if (!currentUser) {
    document.getElementById('noWishlist').style.display = 'block';
    document.getElementById('wishlistGrid').style.display = 'none';
    return;
  }
  
  const userRef = realtimeDB.ref('users/' + currentUser.uid);
  
  userRef.once('value').then(snapshot => {
    const userData = snapshot.val();
    const wishlist = userData.wishlist || [];
    
    const container = document.getElementById('wishlistGrid');
    const noWishlist = document.getElementById('noWishlist');
    
    if (wishlist.length === 0) {
      container.style.display = 'none';
      noWishlist.style.display = 'block';
      return;
    }
    
    container.style.display = 'grid';
    noWishlist.style.display = 'none';
    container.innerHTML = '';
    
    // Get wishlist products
    const wishlistProducts = PRODUCTS.filter(p => wishlist.includes(p.id));
    
    wishlistProducts.forEach(product => {
      const card = createProductCard(product);
      container.appendChild(card);
    });
  });
}

/***********************
 * Order Flow Functions
 ***********************/

// Start order process for a product
function orderProduct(productId) {
  // Check if user is logged in
  if (!currentUser) {
    showAlert('Please login to place an order');
    return;
  }
  
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  // Store selected product
  selectedProduct = product;
  selectedSize = 'S'; // Default size
  selectedQty = 1; // Default quantity
  
  // Update order page with product details
  document.getElementById('spTitle').textContent = product.title;
  document.getElementById('spPrice').textContent = `₹${product.price}`;
  document.getElementById('spDesc').textContent = product.desc;
  document.getElementById('spFullDesc').textContent = product.fullDesc;
  
  // Update gallery
  updateOrderGallery(product);
  
  // Reset size selection
  document.querySelectorAll('.size-option').forEach(option => {
    option.classList.toggle('selected', option.dataset.value === 'S');
  });
  
  // Reset quantity
  document.getElementById('qtySelect').value = 1;
  
  // Show order page
  showPage('orderPage');
  updateStepPills('order');
}

// Update order gallery with carousel
function updateOrderGallery(product) {
  const gallery = document.getElementById('galleryMain');
  
  if (product.images && product.images.length > 0) {
    gallery.style.backgroundImage = `url('${product.images[0]}')`;
    
    // Initialize carousel if multiple images
    if (product.images.length > 1) {
      initOrderCarousel(product);
    } else {
      // Hide controls if only one image
      gallery.querySelector('.prev').style.display = 'none';
      gallery.querySelector('.next').style.display = 'none';
      gallery.querySelector('.carousel-dots').style.display = 'none';
    }
  } else {
    // Use placeholder if no images
    gallery.style.backgroundImage = `url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')`;
    gallery.querySelector('.prev').style.display = 'none';
    gallery.querySelector('.next').style.display = 'none';
    gallery.querySelector('.carousel-dots').style.display = 'none';
  }
}

// Initialize order page image carousel
function initOrderCarousel(product) {
  currentOrderProduct = product;
  currentOrderImageIndex = 0;
  
  const gallery = document.getElementById('galleryMain');
  const prevBtn = gallery.querySelector('.prev');
  const nextBtn = gallery.querySelector('.next');
  const dotsContainer = gallery.querySelector('.carousel-dots');
  
  // Clear previous dots
  dotsContainer.innerHTML = '';
  
  // Create dots
  product.images.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      currentOrderImageIndex = index;
      updateOrderCarousel();
    });
    dotsContainer.appendChild(dot);
  });
  
  // Previous button
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentOrderImageIndex = (currentOrderImageIndex - 1 + product.images.length) % product.images.length;
    updateOrderCarousel();
  });
  
  // Next button
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentOrderImageIndex = (currentOrderImageIndex + 1) % product.images.length;
    updateOrderCarousel();
  });
  
  // Show controls
  prevBtn.style.display = 'flex';
  nextBtn.style.display = 'flex';
  dotsContainer.style.display = 'flex';
}

function updateOrderCarousel() {
  if (!currentOrderProduct) return;
  
  const gallery = document.getElementById('galleryMain');
  const dotsContainer = gallery.querySelector('.carousel-dots');
  
  // Update main image
  gallery.style.backgroundImage = `url('${currentOrderProduct.images[currentOrderImageIndex]}')`;
  
  // Update dots
  dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === currentOrderImageIndex);
  });
}

/***********************
 * Page Navigation Functions
 ***********************/

// Show specific page
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
  
  // Special handling for specific pages
  if (pageId === 'productsPage') {
    renderProductGrid();
  } else if (pageId === 'wishlistPage') {
    renderWishlistPage();
  } else if (pageId === 'homePage') {
    renderHomePreview();
  } else if (pageId === 'userProfilePage' && currentUser) {
    // Load user data when profile page is shown
    loadUserData(currentUser.uid);
  }
}

// Update step pills
function updateStepPills(step) {
  const steps = ['products', 'order', 'user', 'pay'];
  const currentIndex = steps.indexOf(step);
  
  steps.forEach((s, index) => {
    const pill = document.getElementById(`pill-${s}`);
    if (index <= currentIndex) {
      pill.classList.remove('disabled');
    } else {
      pill.classList.add('disabled');
    }
  });
}

/***********************
 * Toast notification
 ***********************/

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  toastMessage.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/***********************
 * Alert modal
 ***********************/

function showAlert(message) {
  document.getElementById('alertMessage').textContent = message;
  document.getElementById('alertModal').classList.add('active');
}

/***********************
 * Image zoom functionality
 ***********************/

function openImageZoom() {
  if (!currentDetailProduct) return;
  
  const zoomedImage = document.getElementById('zoomedImage');
  zoomedImage.src = currentDetailProduct.images[currentDetailImageIndex];
  zoomedImage.style.transform = 'scale(1)';
  
  document.getElementById('imageZoomModal').classList.add('active');
}

function closeImageZoom() {
  document.getElementById('imageZoomModal').classList.remove('active');
}

function zoomIn() {
  const zoomedImage = document.getElementById('zoomedImage');
  const currentScale = parseFloat(zoomedImage.style.transform.replace('scale(', '').replace(')', '')) || 1;
  zoomedImage.style.transform = `scale(${currentScale + 0.2})`;
}

function zoomOut() {
  const zoomedImage = document.getElementById('zoomedImage');
  const currentScale = parseFloat(zoomedImage.style.transform.replace('scale(', '').replace(')', '')) || 1;
  if (currentScale > 0.4) {
    zoomedImage.style.transform = `scale(${currentScale - 0.2})`;
  }
}

function resetZoom() {
  document.getElementById('zoomedImage').style.transform = 'scale(1)';
}

/***********************
 * Search functionality
 ***********************/

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const homeSearchInput = document.getElementById('homeSearchInput');
  const homeSearchResults = document.getElementById('homeSearchResults');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      if (query.length > 2) {
        const filtered = PRODUCTS.filter(p => 
          p.title.toLowerCase().includes(query) || 
          p.desc.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
        renderProductGrid(filtered);
      } else if (query.length === 0) {
        renderProductGrid();
      }
    });
  }
  
  if (homeSearchInput && homeSearchResults) {
    homeSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      if (query.length > 2) {
        const filtered = PRODUCTS.filter(p => 
          p.title.toLowerCase().includes(query) || 
          p.desc.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
        
        homeSearchResults.style.display = 'grid';
        homeSearchResults.innerHTML = '';
        
        filtered.forEach(product => {
          const card = createProductCard(product);
          homeSearchResults.appendChild(card);
        });
      } else {
        homeSearchResults.style.display = 'none';
      }
    });
  }
}

/***********************
 * Initialize the Application
 ***********************/

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Load products, categories, and advertisements
  loadProductsFromRealtimeDB();
  loadCategories();
  loadAdBanners();
  
  // Setup search
  setupSearch();
  
  // Load recently viewed from localStorage
  const storedRecentlyViewed = localStorage.getItem('recently_viewed');
  if (storedRecentlyViewed) {
    recentlyViewed = JSON.parse(storedRecentlyViewed);
    renderRecentlyViewed();
  }
  
  // Setup auto-save for user information
  setupAutoSave();
  
  // Check URL for product parameter
  if (!checkUrlForProduct()) {
    // Show home page if no product in URL
    showPage('homePage');
  }
  
  // Setup event listeners for auth modal
  document.getElementById('authModalClose').addEventListener('click', closeLoginModal);
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
  });
  
  // Setup event listeners for login buttons
  document.getElementById('openLoginTop').addEventListener('click', showLoginModal);
  document.getElementById('openUserProfileTop').addEventListener('click', function() {
    showPage('userProfilePage');
  });
  
  // Setup event listener for copy link button
  document.getElementById('copyLinkBtn').addEventListener('click', function() {
    const link = document.getElementById('productShareLink').textContent;
    navigator.clipboard.writeText(link).then(() => {
      showToast('Link copied to clipboard!', 'success');
    }).catch(() => {
      // Fallback for older browsers
      const tempInput = document.createElement('input');
      tempInput.value = link;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      showToast('Link copied to clipboard!', 'success');
    });
  });
  
  // Setup event listeners for forgot password modal
  document.getElementById('forgotPasswordClose').addEventListener('click', function() {
    document.getElementById('forgotPasswordModal').classList.remove('active');
  });
  
  // Setup mobile menu
  document.getElementById('menuIcon').addEventListener('click', openMenu);
  document.getElementById('menuClose').addEventListener('click', closeMenu);
  document.getElementById('menuOverlay').addEventListener('click', closeMenu);
  
  // Setup order flow event listeners
  document.getElementById('toUserInfo').addEventListener('click', function() {
    // Check if size is selected
    if (!selectedSize) {
      document.getElementById('sizeValidationError').classList.add('show');
      return;
    }
    document.getElementById('sizeValidationError').classList.remove('show');
    
    showPage('userPage');
    updateStepPills('user');
  });
  
  document.getElementById('backToProducts').addEventListener('click', function() {
    showPage('productsPage');
    updateStepPills('products');
  });
  
  document.getElementById('toPayment').addEventListener('click', function() {
    // Validate user info
    const fullname = document.getElementById('fullname').value;
    const mobile = document.getElementById('mobile').value;
    const pincode = document.getElementById('pincode').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const house = document.getElementById('house').value;
    
    if (!fullname || !mobile || !pincode || !city || !state || !house) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    
    // Save user info
    userInfo = { fullname, mobile, pincode, city, state, house };
    
    // Update payment summary
    updatePaymentSummary();
    
    showPage('paymentPage');
    updateStepPills('pay');
  });
  
  document.getElementById('editOrder').addEventListener('click', function() {
    showPage('orderPage');
    updateStepPills('order');
  });
  
  document.getElementById('payBack').addEventListener('click', function() {
    showPage('userPage');
    updateStepPills('user');
  });
  
  // Setup size selection
  document.querySelectorAll('.size-option').forEach(option => {
    option.addEventListener('click', function() {
      document.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
      selectedSize = this.dataset.value;
    });
  });
  
  // Setup quantity controls
  document.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.parentNode.querySelector('input');
      let value = parseInt(input.value);
      if (value > 1) {
        input.value = value - 1;
        selectedQty = value - 1;
        updatePaymentSummary();
      }
    });
  });
  
  document.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.parentNode.querySelector('input');
      let value = parseInt(input.value);
      input.value = value + 1;
      selectedQty = value + 1;
      updatePaymentSummary();
    });
  });
  
  // Setup order confirmation
  document.getElementById('confirmOrder').addEventListener('click', function() {
    // Check if user is logged in
    if (!currentUser) {
      showAlert('Please login to place an order');
      return;
    }
    
    // Create order
    createOrder();
    
    // Show success page
    showPage('successPage');
  });
  
  // Setup success page buttons
  document.getElementById('goHome').addEventListener('click', function() {
    showPage('homePage');
    updateStepPills('products');
  });
  
  document.getElementById('viewOrders').addEventListener('click', function() {
    showMyOrders();
    showPage('myOrdersPage');
  });
  
  // Setup alert modal buttons
  document.getElementById('alertModalCancel').addEventListener('click', function() {
    document.getElementById('alertModal').classList.remove('active');
  });
  
  document.getElementById('alertModalConfirm').addEventListener('click', function() {
    document.getElementById('alertModal').classList.remove('active');
    showLoginModal();
  });
  
  // Setup contact button
  document.getElementById('openContactTop').addEventListener('click', function() {
    showPage('contactPage');
  });
  
  // Setup my orders button
  document.getElementById('openMyOrdersTop').addEventListener('click', function() {
    showMyOrders();
    showPage('myOrdersPage');
  });
  
  // Setup social sharing
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const platform = this.dataset.platform;
      shareProduct(platform);
    });
  });
  
  // Setup newsletter subscription
  document.getElementById('subscribeBtn').addEventListener('click', function() {
    const email = document.getElementById('newsletterEmail').value;
    if (email && validateEmail(email)) {
      showToast('Thank you for subscribing!', 'success');
      document.getElementById('newsletterEmail').value = '';
    } else {
      showToast('Please enter a valid email address', 'error');
    }
  });
  
  // Setup price filter
  setupPriceFilter();
  
  // Rotating hero messages
  rotateHeroMessages();
});

// Update payment summary
function updatePaymentSummary() {
  if (!selectedProduct) return;
  
  const productPrice = selectedProduct.price * selectedQty;
  const deliveryCharge = 50;
  const total = productPrice + deliveryCharge;
  
  document.getElementById('sumProduct').textContent = selectedProduct.title;
  document.getElementById('sumQty').textContent = selectedQty;
  document.getElementById('sumPrice').textContent = `₹${productPrice}`;
  document.getElementById('sumDel').textContent = `₹${deliveryCharge}`;
  document.getElementById('sumTotal').textContent = `₹${total}`;
}

// Create order and save to database
function createOrder() {
  if (!selectedProduct || !currentUser) return;
  
  const orderId = 'ORD' + Date.now();
  const productPrice = selectedProduct.price * selectedQty;
  const deliveryCharge = 50;
  const total = productPrice + deliveryCharge;
  
  const order = {
    id: orderId,
    productId: selectedProduct.id,
    productTitle: selectedProduct.title,
    productPrice: selectedProduct.price,
    quantity: selectedQty,
    size: selectedSize,
    total: total,
    status: 'confirmed',
    orderDate: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    customerInfo: userInfo
  };
  
  // Save order to user's orders in database
  const userRef = realtimeDB.ref('users/' + currentUser.uid);
  
  userRef.once('value').then(snapshot => {
    const userData = snapshot.val();
    const orders = userData.orders || [];
    orders.push(order);
    
    userRef.update({ orders: orders });
    
    // Show success message
    showToast('Order placed successfully!', 'success');
    
    // Update orders notification
    document.getElementById('ordersNotification').textContent = orders.length;
    document.getElementById('ordersNotification').style.display = 'flex';
  });
}

// Show my orders
function showMyOrders() {
  // Check if user is logged in
  if (!currentUser) {
    showAlert('Please login to view your orders');
    return;
  }
  
  const userRef = realtimeDB.ref('users/' + currentUser.uid);
  
  userRef.once('value').then(snapshot => {
    const userData = snapshot.val();
    const orders = userData.orders || [];
    
    const ordersList = document.getElementById('ordersList');
    const noOrders = document.getElementById('noOrders');
    
    if (orders.length === 0) {
      ordersList.style.display = 'none';
      noOrders.style.display = 'block';
      return;
    }
    
    ordersList.style.display = 'block';
    noOrders.style.display = 'none';
    ordersList.innerHTML = '';
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    orders.forEach(order => {
      const orderCard = document.createElement('div');
      orderCard.className = 'order-card';
      orderCard.setAttribute('data-id', order.id);
      
      const product = PRODUCTS.find(p => p.id === order.productId);
      const productImage = product && product.images && product.images.length > 0 
        ? product.images[0] 
        : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
      
      const statusClass = `status-${order.status}`;
      const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
      
      orderCard.innerHTML = `
        <div class="order-header">
          <div>
            <div class="order-id">Order #${order.id}</div>
            <div class="order-date">Placed on ${new Date(order.orderDate).toLocaleDateString()}</div>
            <div class="order-estimated">Estimated delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}</div>
          </div>
          <div class="order-status ${statusClass}">${statusText}</div>
        </div>
        <div class="order-details">
          <div class="order-product-image" style="background-image: url('${productImage}')"></div>
          <div class="order-product-info">
            <div class="order-product-title">${order.productTitle}</div>
            <div class="order-product-price">₹${order.total}</div>
            <div class="order-product-meta">Size: ${order.size} | Qty: ${order.quantity}</div>
          </div>
        </div>
        <div class="order-actions">
          <button class="btn secondary" onclick="viewOrderDetail('${order.id}')">View Details</button>
          ${order.status === 'confirmed' ? `<button class="btn error" onclick="cancelOrder('${order.id}')">Cancel Order</button>` : ''}
        </div>
      `;
      
      ordersList.appendChild(orderCard);
    });
  });
}

// View order detail
function viewOrderDetail(orderId) {
  if (!currentUser) return;
  
  const userRef = realtimeDB.ref('users/' + currentUser.uid);
  
  userRef.once('value').then(snapshot => {
    const userData = snapshot.val();
    const orders = userData.orders || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const product = PRODUCTS.find(p => p.id === order.productId);
    const productImage = product && product.images && product.images.length > 0 
      ? product.images[0] 
      : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    const statusClass = `status-${order.status}`;
    const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
    
    const orderDetailContent = document.getElementById('orderDetailContent');
    orderDetailContent.innerHTML = `
      <div class="order-detail-section">
        <div class="order-detail-label">Order ID</div>
        <div class="order-detail-value">${order.id}</div>
      </div>
      
      <div class="order-detail-section">
        <div class="order-detail-label">Order Status</div>
        <div class="order-detail-value"><span class="order-status ${statusClass}">${statusText}</span></div>
      </div>
      
      <div class="order-detail-section">
        <div class="order-detail-label">Order Date</div>
        <div class="order-detail-value">${new Date(order.orderDate).toLocaleDateString()}</div>
      </div>
      
      <div class="order-detail-section">
        <div class="order-detail-label">Estimated Delivery</div>
        <div class="order-detail-value">${new Date(order.estimatedDelivery).toLocaleDateString()}</div>
      </div>
      
      <div class="order-detail-section">
        <div class="order-detail-label">Product</div>
        <div class="order-detail-product">
          <div class="order-detail-image" style="background-image: url('${productImage}')"></div>
          <div class="order-detail-product-info">
            <div class="order-product-title">${order.productTitle}</div>
            <div class="order-product-price">₹${order.total}</div>
            <div class="order-product-meta">Size: ${order.size} | Qty: ${order.quantity}</div>
          </div>
        </div>
      </div>
      
      <div class="order-detail-section">
        <div class="order-detail-label">Customer Information</div>
        <div class="order-detail-value">
          <p><strong>Name:</strong> ${order.customerInfo.fullname}</p>
          <p><strong>Mobile:</strong> ${order.customerInfo.mobile}</p>
          <p><strong>Address:</strong> ${order.customerInfo.house}, ${order.customerInfo.city}, ${order.customerInfo.state} - ${order.customerInfo.pincode}</p>
        </div>
      </div>
      
      <div class="order-detail-section">
        <div class="order-detail-label">Order Summary</div>
        <div class="order-detail-value">
          <p><strong>Product Price:</strong> ₹${order.productPrice} x ${order.quantity} = ₹${order.productPrice * order.quantity}</p>
          <p><strong>Delivery Charge:</strong> ₹50</p>
          <p><strong>Total Amount:</strong> ₹${order.total}</p>
        </div>
      </div>
      
      <div class="order-actions">
        ${order.status === 'confirmed' ? `<button class="btn error" onclick="cancelOrder('${order.id}')">Cancel Order</button>` : ''}
        ${order.status === 'delivered' ? `<button class="btn secondary" onclick="requestRefund('${order.id}')">Request Refund</button>` : ''}
      </div>
    `;
    
    showPage('orderDetailPage');
  });
}

// Cancel order
function cancelOrder(orderId) {
  if (!currentUser) return;
  
  // Show cancellation modal
  document.getElementById('cancellationModal').classList.add('active');
  
  // Store the order ID for later use
  document.getElementById('cancelModalNext').dataset.orderId = orderId;
}

// Request refund
function requestRefund(orderId) {
  if (!currentUser) return;
  
  // Show refund modal
  document.getElementById('refundModal').classList.add('active');
  
  // Store the order ID for later use
  document.getElementById('refundModalConfirm').dataset.orderId = orderId;
}

// Setup price filter
function setupPriceFilter() {
  const minPriceSlider = document.getElementById('minPriceSlider');
  const maxPriceSlider = document.getElementById('maxPriceSlider');
  const minPriceInput = document.getElementById('minPrice');
  const maxPriceInput = document.getElementById('maxPrice');
  const minPriceValue = document.getElementById('minPriceValue');
  const maxPriceValue = document.getElementById('maxPriceValue');
  const applyBtn = document.getElementById('applyPriceFilter');
  const resetBtn = document.getElementById('resetPriceFilter');
  
  if (!minPriceSlider || !maxPriceSlider) return;
  
  // Initialize values
  minPriceSlider.value = 0;
  maxPriceSlider.value = 5000;
  minPriceInput.value = 0;
  maxPriceInput.value = 5000;
  minPriceValue.textContent = '₹0';
  maxPriceValue.textContent = '₹5000';
  
  // Update slider values when inputs change
  minPriceInput.addEventListener('input', function() {
    minPriceSlider.value = this.value;
    minPriceValue.textContent = `₹${this.value}`;
  });
  
  maxPriceInput.addEventListener('input', function() {
    maxPriceSlider.value = this.value;
    maxPriceValue.textContent = `₹${this.value}`;
  });
  
  // Update input values when sliders change
  minPriceSlider.addEventListener('input', function() {
    minPriceInput.value = this.value;
    minPriceValue.textContent = `₹${this.value}`;
  });
  
  maxPriceSlider.addEventListener('input', function() {
    maxPriceInput.value = this.value;
    maxPriceValue.textContent = `₹${this.value}`;
  });
  
  // Apply filter
  applyBtn.addEventListener('click', function() {
    const min = parseInt(minPriceInput.value) || 0;
    const max = parseInt(maxPriceInput.value) || 5000;
    
    const filtered = PRODUCTS.filter(p => p.price >= min && p.price <= max);
    renderProductGrid(filtered);
  });
  
  // Reset filter
  resetBtn.addEventListener('click', function() {
    minPriceSlider.value = 0;
    maxPriceSlider.value = 5000;
    minPriceInput.value = 0;
    maxPriceInput.value = 5000;
    minPriceValue.textContent = '₹0';
    maxPriceValue.textContent = '₹5000';
    
    renderProductGrid();
  });
}

// Rotate hero messages
function rotateHeroMessages() {
  const messages = document.querySelectorAll('#heroMessages span');
  let currentIndex = 0;
  
  setInterval(() => {
    messages.forEach(msg => msg.classList.remove('active'));
    currentIndex = (currentIndex + 1) % messages.length;
    messages[currentIndex].classList.add('active');
  }, 4000);
}

// Mobile menu functions
function openMenu() {
  document.getElementById('mobileMenu').classList.add('active');
  document.getElementById('menuOverlay').classList.add('active');
}

function closeMenu() {
  document.getElementById('mobileMenu').classList.remove('active');
  document.getElementById('menuOverlay').classList.remove('active');
}

// Share product
function shareProduct(platform) {
  if (!currentDetailProduct) return;
  
  const productTitle = currentDetailProduct.title;
  const productUrl = window.location.href.split('?')[0] + '?product=' + currentDetailProduct.id;
  
  let shareUrl = '';
  
  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(productTitle)}&url=${encodeURIComponent(productUrl)}`;
      break;
    case 'whatsapp':
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(productTitle + ' ' + productUrl)}`;
      break;
  }
  
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
}

// Validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Setup cancellation modal
document.getElementById('cancelModalClose').addEventListener('click', function() {
  document.getElementById('cancellationModal').classList.remove('active');
});

document.getElementById('cancelModalNext').addEventListener('click', function() {
  const orderId = this.dataset.orderId;
  const selectedReason = document.querySelector('input[name="cancelReason"]:checked');
  
  if (!selectedReason) {
    showToast('Please select a cancellation reason', 'error');
    return;
  }
  
  // Close cancellation modal
  document.getElementById('cancellationModal').classList.remove('active');
  
  // Show confirmation modal with payment gateway charges
  showCancelConfirmation(orderId);
});

// Show cancellation confirmation with payment gateway charges
function showCancelConfirmation(orderId) {
  if (!currentUser) return;
  
  const userRef = realtimeDB.ref('users/' + currentUser.uid);
  
  userRef.once('value').then(snapshot => {
    const userData = snapshot.val();
    const orders = userData.orders || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const orderTotal = order.total;
    const gatewayCharges = Math.round(orderTotal * 0.028);
    const refundAmount = orderTotal - gatewayCharges;
    
    document.getElementById('orderTotalAmount').textContent = orderTotal;
    document.getElementById('gatewayCharges').textContent = gatewayCharges;
    document.getElementById('refundAmount').textContent = refundAmount;
    
    document.getElementById('cancelConfirmModal').classList.add('active');
    document.getElementById('cancelConfirmFinal').dataset.orderId = orderId;
  });
}

// Setup cancellation confirmation modal
document.getElementById('cancelConfirmClose').addEventListener('click', function() {
  document.getElementById('cancelConfirmModal').classList.remove('active');
});

document.getElementById('cancelConfirmFinal').addEventListener('click', function() {
  const orderId = this.dataset.orderId;
  
  if (!currentUser) return;
  
  const userRef = realtimeDB.ref('users/' + currentUser.uid);
  
  userRef.once('value').then(snapshot => {
    const userData = snapshot.val();
    const orders = userData.orders || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return;
    
    // Update order status to cancelled
    orders[orderIndex].status = 'cancelled';
    orders[orderIndex].cancelledAt = new Date().toISOString();
    
    userRef.update({ orders: orders });
    
    // Close modal
    document.getElementById('cancelConfirmModal').classList.remove('active');
    
    // Show success message
    showToast('Order cancelled successfully', 'success');
    
    // Refresh orders view
    if (document.getElementById('myOrdersPage').classList.contains('active')) {
      showMyOrders();
    }
    
    if (document.getElementById('orderDetailPage').classList.contains('active')) {
      viewOrderDetail(orderId);
    }
  });
});

// Setup refund modal
document.getElementById('refundModalClose').addEventListener('click', function() {
  document.getElementById('refundModal').classList.remove('active');
});

document.getElementById('refundModalConfirm').addEventListener('click', function() {
  const orderId = this.dataset.orderId;
  const reason = document.getElementById('refundReason').value;
  const details = document.getElementById('refundDetails').value;
  
  if (!reason) {
    showToast('Please select a refund reason', 'error');
    return;
  }
  
  // In a real app, you would send this to your backend
  showToast('Refund request submitted successfully', 'success');
  document.getElementById('refundModal').classList.remove('active');
  
  // Reset form
  document.getElementById('refundReason').value = '';
  document.getElementById('refundDetails').value = '';
});