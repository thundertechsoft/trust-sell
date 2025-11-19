// ===== TRUST SELL - COMPLETE JAVASCRIPT =====

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBJ9mLHHQxnJKtixZrOYy_Vtf-TuwED2dE",
    authDomain: "trustsell-78c18.firebaseapp.com",
    databaseURL: "https://trustsell-78c18-default-rtdb.firebaseio.com",
    projectId: "trustsell-78c18",
    storageBucket: "trustsell-78c18.firebasestorage.app",
    messagingSenderId: "909095926042",
    appId: "1:909095926042:web:3c6eee4f055d21fda794a3",
    measurementId: "G-4V0DBSRYKW"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
} catch (error) {
    console.log('Firebase already initialized');
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Global State Management
const AppState = {
    currentUser: null,
    isLoggedIn: false,
    userData: null,
    currentLocation: 'All Pakistan',
    favorites: [],
    cart: [],
    currentProduct: null,
    currentChat: null
};

// Voice Recognition
let recognition = null;

// AI Security Features
const AISecurity = {
    // Simulate AI content moderation
    moderateContent: async (content) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate AI analysis
                const hasBadWords = /(scam|fraud|fake|spam)/i.test(content);
                resolve({
                    safe: !hasBadWords,
                    score: hasBadWords ? 0.2 : 0.9,
                    flags: hasBadWords ? ['suspicious_language'] : []
                });
            }, 1000);
        });
    },

    // Simulate AI image analysis
    analyzeImage: async (imageUrl) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate AI image analysis
                resolve({
                    safe: true,
                    score: 0.95,
                    categories: ['product_image'],
                    flags: []
                });
            }, 1500);
        });
    },

    // Simulate AI fraud detection
    detectFraud: async (userData, productData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate fraud detection
                const riskScore = Math.random();
                resolve({
                    riskLevel: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
                    score: riskScore,
                    recommendations: riskScore > 0.7 ? ['verify_identity'] : []
                });
            }, 2000);
        });
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('🚀 Trust Sell App Initializing...');
    
    checkAuthStatus();
    initializeLocation();
    loadUserPreferences();
    initializeVoiceSearch();
    setupEventListeners();
    
    // Page-specific initializations
    const currentPage = window.location.pathname.split('/').pop();
    switch(currentPage) {
        case 'index.html':
        case '':
            loadCategories();
            loadFeaturedProducts();
            break;
        case 'products.html':
            loadProducts();
            setupFilters();
            break;
        case 'product-detail.html':
            loadProductDetail();
            break;
        case 'auth.html':
            setupAuthForms();
            break;
        case 'post-ad.html':
            setupPostAdForm();
            break;
        case 'profile.html':
            loadUserProfile();
            break;
        case 'chat.html':
            setupChat();
            break;
    }
}

function checkAuthStatus() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            AppState.currentUser = user;
            AppState.isLoggedIn = true;
            
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    AppState.userData = userDoc.data();
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
            
            updateAuthUI();
        } else {
            AppState.currentUser = null;
            AppState.isLoggedIn = false;
            AppState.userData = null;
            updateAuthUI();
        }
    });
}

function updateAuthUI() {
    const authLinks = document.querySelectorAll('.auth-link');
    const authIcons = document.querySelectorAll('.auth-link .fa-user');
    
    authIcons.forEach(icon => {
        if (AppState.isLoggedIn) {
            icon.className = 'fas fa-user';
        } else {
            icon.className = 'far fa-user';
        }
    });
    
    authLinks.forEach(link => {
        if (AppState.isLoggedIn) {
            link.innerHTML = '<i class="fas fa-user"></i>';
            link.href = 'profile.html';
        } else {
            link.innerHTML = '<i class="far fa-user"></i>';
            link.href = 'auth.html';
        }
    });
}

function setupEventListeners() {
    // Global event listeners
    setupSearch();
    setupNavigation();
    setupVoiceSearch();
    setupModals();
}

function setupSearch() {
    const searchInputs = document.querySelectorAll('.search-bar input');
    searchInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });

        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    searchProducts(query);
                }
            }
        });
    });
}

function setupNavigation() {
    // Logo click
    const logos = document.querySelectorAll('.logo');
    logos.forEach(logo => {
        logo.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    });
    
    // Bottom nav active states
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function setupVoiceSearch() {
    const voiceButtons = document.querySelectorAll('.voice-search');
    voiceButtons.forEach(button => {
        button.addEventListener('click', startVoiceRecognition);
    });

    const stopVoiceBtn = document.getElementById('stopVoiceBtn');
    if (stopVoiceBtn) {
        stopVoiceBtn.addEventListener('click', stopVoiceRecognition);
    }
}

function setupModals() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });

    // Close modals with close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
}

// ===== VOICE SEARCH =====
function initializeVoiceSearch() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            showVoiceModal();
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            processVoiceResult(transcript);
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            showNotification('Voice search error: ' + event.error, 'error');
            hideVoiceModal();
        };
        
        recognition.onend = function() {
            hideVoiceModal();
        };
    } else {
        console.warn('Voice search not supported in this browser');
    }
}

function startVoiceRecognition() {
    if (recognition) {
        recognition.start();
    } else {
        showNotification('Voice search not supported in your browser', 'warning');
    }
}

function stopVoiceRecognition() {
    if (recognition) {
        recognition.stop();
    }
    hideVoiceModal();
}

function showVoiceModal() {
    const modal = document.getElementById('voiceModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function hideVoiceModal() {
    const modal = document.getElementById('voiceModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function processVoiceResult(transcript) {
    const searchInputs = document.querySelectorAll('.search-bar input');
    searchInputs.forEach(input => {
        input.value = transcript;
    });
    
    const voiceResult = document.getElementById('voiceResult');
    if (voiceResult) {
        voiceResult.innerHTML = `<p>You said: <strong>${transcript}</strong></p>`;
    }
    
    setTimeout(() => {
        searchProducts(transcript);
    }, 1000);
}

// ===== LOCATION SYSTEM =====
function initializeLocation() {
    const savedLocation = localStorage.getItem('trustSell_location');
    if (savedLocation) {
        AppState.currentLocation = savedLocation;
    } else {
        // Try to get approximate location
        getApproximateLocation();
    }
    updateLocationUI();
}

function getApproximateLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // This is a simplified version - in production, you'd use a geocoding service
                    const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];
                    const randomCity = cities[Math.floor(Math.random() * cities.length)];
                    AppState.currentLocation = randomCity;
                    updateLocationUI();
                    localStorage.setItem('trustSell_location', randomCity);
                } catch (error) {
                    console.error('Error getting location:', error);
                    setDefaultLocation();
                }
            },
            () => {
                setDefaultLocation();
            }
        );
    } else {
        setDefaultLocation();
    }
}

function setDefaultLocation() {
    AppState.currentLocation = 'All Pakistan';
    updateLocationUI();
    localStorage.setItem('trustSell_location', 'All Pakistan');
}

function updateLocationUI() {
    const locationElements = document.querySelectorAll('#currentLocation');
    locationElements.forEach(element => {
        if (element) {
            element.textContent = AppState.currentLocation;
        }
    });
}

function changeLocation(province, city) {
    const newLocation = city ? `${city}, ${province}` : province;
    AppState.currentLocation = newLocation;
    localStorage.setItem('trustSell_location', newLocation);
    updateLocationUI();
    showNotification(`Location changed to ${newLocation}`, 'success');
}

// ===== CATEGORIES =====
function loadCategories() {
    const categories = [
        { name: 'Cars', icon: 'car', count: '15K' },
        { name: 'Mobiles', icon: 'mobile-alt', count: '25K' },
        { name: 'Bikes', icon: 'motorcycle', count: '8K' },
        { name: 'Property', icon: 'home', count: '12K' },
        { name: 'Jobs', icon: 'briefcase', count: '5K' },
        { name: 'Electronics', icon: 'laptop', count: '18K' },
        { name: 'Fashion', icon: 'tshirt', count: '22K' },
        { name: 'Furniture', icon: 'couch', count: '7K' },
        { name: 'Services', icon: 'tools', count: '3K' },
        { name: 'Animals', icon: 'paw', count: '4K' },
        { name: 'Books', icon: 'book', count: '2K' },
        { name: 'Sports', icon: 'futbol', count: '6K' }
    ];

    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = '';

    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.addEventListener('click', () => filterByCategory(category.name.toLowerCase()));
        
        categoryCard.innerHTML = `
            <div class="category-icon">
                <i class="fas fa-${category.icon}"></i>
            </div>
            <h4>${category.name}</h4>
            <small>${category.count}+</small>
        `;
        
        categoriesGrid.appendChild(categoryCard);
    });
}

function filterByCategory(category) {
    window.location.href = `products.html?category=${category}`;
}

// ===== PRODUCTS =====
async function loadFeaturedProducts() {
    showLoading('Loading featured products...');
    
    try {
        const productsSnapshot = await db.collection('products')
            .where('status', '==', 'active')
            .where('features', 'array-contains', 'featured')
            .orderBy('createdAt', 'desc')
            .limit(8)
            .get();

        const products = [];
        productsSnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data()
            });
        });

        displayProducts(products, 'featuredProducts');
    } catch (error) {
        console.error('Error loading featured products:', error);
        showNotification('Error loading featured products', 'error');
    } finally {
        hideLoading();
    }
}

async function loadProducts(filters = {}) {
    showLoading('Loading products...');
    
    try {
        let query = db.collection('products').where('status', '==', 'active');
        
        // Apply filters
        if (filters.category) {
            query = query.where('category', '==', filters.category);
        }
        
        if (filters.maxPrice) {
            query = query.where('price', '<=', parseInt(filters.maxPrice));
        }
        
        if (filters.location) {
            query = query.where('city', '==', filters.location.toLowerCase());
        }
        
        if (filters.sellerVerified) {
            query = query.where('sellerVerified', '==', true);
        }
        
        const querySnapshot = await query.orderBy('createdAt', 'desc').limit(50).get();
        const products = [];
        
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        displayProducts(products, 'productsGrid');
        updateResultsCount(products.length);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
    } finally {
        hideLoading();
    }
}

function displayProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="grid-column: 1/-1; padding: 3rem; color: #666;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: #ddd;"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search filters</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.addEventListener('click', () => viewProduct(product.id));
        
        productCard.innerHTML = `
            <div class="product-image">
                <i class="fas fa-${getCategoryIcon(product.category)}"></i>
                ${product.sellerVerified ? '<div class="product-badge">Verified</div>' : ''}
                ${product.features && product.features.includes('featured') ? '<div class="product-badge premium-badge">Featured</div>' : ''}
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-location">
                    <i class="fas fa-map-marker-alt"></i> 
                    ${product.city ? product.city.charAt(0).toUpperCase() + product.city.slice(1) : product.location}
                </div>
                <div class="product-meta">
                    <div class="seller-info">
                        <div class="seller-avatar">${getInitials(product.sellerName)}</div>
                        <span>${product.sellerName}</span>
                        ${product.sellerVerified ? '<i class="fas fa-badge-check verified-icon"></i>' : ''}
                    </div>
                    <div class="product-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); toggleFavorite('${product.id}')">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(productCard);
    });
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `${count} products found`;
    }
}

function setupFilters() {
    const filterToggle = document.getElementById('filterToggle');
    const closeFilters = document.getElementById('closeFilters');
    const applyFilters = document.getElementById('applyFilters');
    const resetFilters = document.getElementById('resetFilters');
    
    if (filterToggle) {
        filterToggle.addEventListener('click', () => {
            document.getElementById('filtersSidebar').classList.add('active');
        });
    }
    
    if (closeFilters) {
        closeFilters.addEventListener('click', () => {
            document.getElementById('filtersSidebar').classList.remove('active');
        });
    }
    
    if (applyFilters) {
        applyFilters.addEventListener('click', applyProductFilters);
    }
    
    if (resetFilters) {
        resetFilters.addEventListener('click', resetProductFilters);
    }
    
    // Load categories for filter
    loadFilterCategories();
}

function loadFilterCategories() {
    const categories = [
        'Cars & Vehicles',
        'Mobiles & Tablets', 
        'Property',
        'Jobs',
        'Bikes',
        'Electronics',
        'Fashion',
        'Furniture',
        'Services',
        'Animals',
        'Books',
        'Sports'
    ];

    const categoriesContainer = document.getElementById('categoriesFilter');
    if (!categoriesContainer) return;

    categoriesContainer.innerHTML = '';

    categories.forEach(category => {
        const label = document.createElement('label');
        label.className = 'filter-option';
        label.innerHTML = `
            <input type="checkbox" value="${category.toLowerCase()}" class="category-filter">
            <span class="checkmark"></span>
            <span>${category}</span>
        `;
        categoriesContainer.appendChild(label);
    });
}

function applyProductFilters() {
    const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
        .map(cb => cb.value);
    const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice').value) || 1000000;
    const province = document.getElementById('provinceFilter').value;
    const city = document.getElementById('cityFilter').value;
    const selectedConditions = Array.from(document.querySelectorAll('.condition-filter:checked'))
        .map(cb => cb.value);
    const verifiedOnly = document.getElementById('verifiedSeller').checked;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    const filters = {
        category: selectedCategories.length > 0 ? selectedCategories[0] : null,
        maxPrice: maxPrice,
        location: city || province,
        sellerVerified: verifiedOnly
    };

    loadProducts(filters);
    document.getElementById('filtersSidebar').classList.remove('active');
}

function resetProductFilters() {
    // Reset all filter inputs
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('minPrice').value = '0';
    document.getElementById('maxPrice').value = '1000000';
    document.getElementById('priceRange').value = '500000';
    document.getElementById('provinceFilter').value = '';
    document.getElementById('cityFilter').value = '';
    document.getElementById('searchInput').value = '';
    
    // Reset quick filters
    document.querySelectorAll('.quick-filter').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.quick-filter').classList.add('active');
    
    loadProducts({});
    document.getElementById('filtersSidebar').classList.remove('active');
}

// ===== PRODUCT DETAILS =====
async function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        showError('Product not found');
        return;
    }

    showLoading('Loading product details...');

    try {
        const productDoc = await db.collection('products').doc(productId).get();
        
        if (!productDoc.exists) {
            throw new Error('Product not found');
        }

        AppState.currentProduct = {
            id: productDoc.id,
            ...productDoc.data()
        };

        // Update view count
        await updateViewCount(productId);

        // Load seller data
        await loadSellerData(AppState.currentProduct.sellerId);

        // Check if product is in favorites
        if (AppState.isLoggedIn) {
            await checkIfFavorite();
        }

        // Display product data
        displayProductDetail();
        
        // Load similar products
        loadSimilarProducts();

        // Hide loading, show content
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('productMain').style.display = 'block';
        document.getElementById('productSidebar').style.display = 'block';
        document.getElementById('mobileActions').style.display = 'grid';

    } catch (error) {
        console.error('Error loading product:', error);
        showError('Product not found');
    } finally {
        hideLoading();
    }
}

async function updateViewCount(productId) {
    try {
        await db.collection('products').doc(productId).update({
            views: firebase.firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error('Error updating view count:', error);
    }
}

async function loadSellerData(sellerId) {
    try {
        const sellerDoc = await db.collection('users').doc(sellerId).get();
        if (sellerDoc.exists) {
            AppState.sellerData = sellerDoc.data();
            
            // Load seller stats
            const productsSnapshot = await db.collection('products')
                .where('sellerId', '==', sellerId)
                .where('status', '==', 'active')
                .get();
            
            AppState.sellerData.productsCount = productsSnapshot.size;
        }
    } catch (error) {
        console.error('Error loading seller data:', error);
    }
}

async function checkIfFavorite() {
    try {
        const favoriteDoc = await db.collection('favorites')
            .doc(`${AppState.currentUser.uid}_${AppState.currentProduct.id}`)
            .get();
        
        AppState.isFavorite = favoriteDoc.exists;
        updateFavoriteButton();
    } catch (error) {
        console.error('Error checking favorite:', error);
    }
}

function displayProductDetail() {
    if (!AppState.currentProduct) return;

    // Basic product info
    document.getElementById('productTitle').textContent = AppState.currentProduct.title;
    document.getElementById('productPrice').textContent = formatPrice(AppState.currentProduct.price);
    document.getElementById('productLocation').textContent = AppState.currentProduct.city ? 
        `${AppState.currentProduct.city.charAt(0).toUpperCase() + AppState.currentProduct.city.slice(1)}, ${AppState.currentProduct.province?.charAt(0).toUpperCase() + AppState.currentProduct.province?.slice(1)}` : 
        AppState.currentProduct.location;
    document.getElementById('productDate').textContent = formatDate(AppState.currentProduct.createdAt);
    document.getElementById('productViews').textContent = `${AppState.currentProduct.views || 1} views`;
    document.getElementById('productCategory').textContent = AppState.currentProduct.category ? 
        AppState.currentProduct.category.charAt(0).toUpperCase() + AppState.currentProduct.category.slice(1) : 'General';
    document.getElementById('productDescription').textContent = AppState.currentProduct.description || 'No description provided.';

    // Contact number
    const contactNumber = document.getElementById('contactNumber');
    if (contactNumber) {
        contactNumber.textContent = AppState.currentProduct.contactNumber || 'Not available';
    }

    // Seller info
    if (AppState.sellerData) {
        document.getElementById('sellerName').textContent = AppState.sellerData.name;
        document.getElementById('sellerAvatar').innerHTML = `<i class="fas fa-user"></i>`;
        document.getElementById('sellerJoinDate').textContent = `Member since ${formatDate(AppState.sellerData.createdAt)}`;
        document.getElementById('sellerProducts').textContent = AppState.sellerData.productsCount || 0;

        if (AppState.sellerData.verified) {
            document.getElementById('sellerVerified').style.display = 'flex';
        }
    }

    // Setup event listeners for product actions
    setupProductActions();
}

function setupProductActions() {
    const contactSellerBtn = document.getElementById('contactSellerBtn');
    const favoriteBtn = document.getElementById('favoriteBtn');
    const mobileFavoriteBtn = document.getElementById('mobileFavoriteBtn');
    const sendMessageBtn = document.getElementById('sendMessageBtn');

    if (contactSellerBtn) {
        contactSellerBtn.addEventListener('click', showContactModal);
    }

    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', toggleFavoriteProduct);
    }

    if (mobileFavoriteBtn) {
        mobileFavoriteBtn.addEventListener('click', toggleFavoriteProduct);
    }

    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessageToSeller);
    }
}

async function toggleFavoriteProduct() {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to add favorites', 'warning');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 2000);
        return;
    }

    try {
        const favoriteRef = db.collection('favorites').doc(`${AppState.currentUser.uid}_${AppState.currentProduct.id}`);
        
        if (AppState.isFavorite) {
            await favoriteRef.delete();
            AppState.isFavorite = false;
            showNotification('Removed from favorites', 'success');
        } else {
            await favoriteRef.set({
                userId: AppState.currentUser.uid,
                productId: AppState.currentProduct.id,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            AppState.isFavorite = true;
            showNotification('Added to favorites', 'success');
        }

        updateFavoriteButton();

    } catch (error) {
        console.error('Error toggling favorite:', error);
        showNotification('Error updating favorites', 'error');
    }
}

function updateFavoriteButton() {
    const favoriteBtns = document.querySelectorAll('#favoriteBtn, #mobileFavoriteBtn');
    favoriteBtns.forEach(btn => {
        if (AppState.isFavorite) {
            btn.innerHTML = '<i class="fas fa-heart"></i>';
            btn.style.color = 'var(--danger)';
        } else {
            btn.innerHTML = '<i class="far fa-heart"></i>';
            btn.style.color = '';
        }
    });
}

function showContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.add('active');
    }
}

async function sendMessageToSeller() {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to send messages', 'warning');
        window.location.href = 'auth.html';
        return;
    }

    if (AppState.currentProduct) {
        const chatId = await startNewChat(AppState.currentProduct.sellerId, AppState.currentProduct.id);
        if (chatId) {
            window.location.href = `chat.html?chat=${chatId}`;
        }
    }
    
    hideContactModal();
}

async function loadSimilarProducts() {
    if (!AppState.currentProduct) return;

    try {
        const similarProductsSnapshot = await db.collection('products')
            .where('category', '==', AppState.currentProduct.category)
            .where('status', '==', 'active')
            .where('sellerId', '!=', AppState.currentProduct.sellerId)
            .orderBy('createdAt', 'desc')
            .limit(4)
            .get();

        const similarContainer = document.getElementById('similarProducts');
        if (!similarContainer) return;

        similarContainer.innerHTML = '';

        if (similarProductsSnapshot.empty) {
            similarContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #666;">
                    <p>No similar products found</p>
                </div>
            `;
            return;
        }

        similarProductsSnapshot.forEach((doc) => {
            const product = doc.data();
            const similarCard = document.createElement('div');
            similarCard.className = 'similar-card';
            similarCard.addEventListener('click', () => viewProduct(doc.id));
            
            similarCard.innerHTML = `
                <div class="similar-image">
                    <i class="fas fa-${getCategoryIcon(product.category)}"></i>
                </div>
                <div class="similar-content">
                    <div class="similar-title">${product.title}</div>
                    <div class="similar-price">${formatPrice(product.price)}</div>
                </div>
            `;
            
            similarContainer.appendChild(similarCard);
        });

    } catch (error) {
        console.error('Error loading similar products:', error);
    }
}

// ===== AUTHENTICATION =====
function setupAuthForms() {
    // Tab switching
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchAuthTab(tabName);
        });
    });

    // User type selection
    const userTypes = document.querySelectorAll('.user-type');
    userTypes.forEach(type => {
        type.addEventListener('click', function() {
            userTypes.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            AppState.selectedUserType = this.getAttribute('data-type');
        });
    });

    // Password toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });

    // Province change handler
    const provinceSelect = document.getElementById('signupProvince');
    if (provinceSelect) {
        provinceSelect.addEventListener('change', function() {
            updateCities(this.value);
        });
    }

    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

function switchAuthTab(tabName) {
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.auth-tab[data-tab="${tabName}"]`).classList.add('active');

    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(tabName + 'Form').classList.add('active');
}

function updateCities(province) {
    const citySelect = document.getElementById('signupCity');
    if (!citySelect) return;

    citySelect.innerHTML = '<option value="">Select City</option>';
    
    const cities = {
        'sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas'],
        'punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala'],
        'kpk': ['Peshawar', 'Abbottabad', 'Mardan', 'Swat', 'Kohat'],
        'balochistan': ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Chaman'],
        'islamabad': ['Islamabad'],
        'gilgit': ['Gilgit', 'Skardu', 'Hunza'],
        'ajk': ['Muzaffarabad', 'Mirpur', 'Kotli']
    };
    
    if (cities[province]) {
        cities[province].forEach(city => {
            const option = document.createElement('option');
            option.value = city.toLowerCase();
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');

    // Show loading
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    loginBtn.disabled = true;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        showNotification('Login successful!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification(getAuthErrorMessage(error), 'error');
    } finally {
        // Hide loading
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        loginBtn.disabled = false;
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const province = document.getElementById('signupProvince').value;
    const city = document.getElementById('signupCity').value;
    const signupBtn = document.getElementById('signupBtn');
    const btnText = signupBtn.querySelector('.btn-text');
    const btnLoading = signupBtn.querySelector('.btn-loading');

    // Validation
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (!province || !city) {
        showNotification('Please select your location', 'error');
        return;
    }

    // AI Security Check
    const securityCheck = await AISecurity.moderateContent(name + ' ' + email);
    if (!securityCheck.safe) {
        showNotification('Account creation failed security check. Please use different information.', 'error');
        return;
    }

    // Show loading
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    signupBtn.disabled = true;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Save user data to Firestore
        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            phone: phone,
            province: province,
            city: city,
            userType: AppState.selectedUserType || 'individual',
            verified: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        showNotification('Account created successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(getAuthErrorMessage(error), 'error');
    } finally {
        // Hide loading
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        signupBtn.disabled = false;
    }
}

function getAuthErrorMessage(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        default:
            return error.message || 'An error occurred. Please try again.';
    }
}

// ===== POST AD =====
function setupPostAdForm() {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to post an ad', 'warning');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 2000);
        return;
    }

    // Load categories
    loadPostAdCategories();

    // Step navigation
    setupStepNavigation();

    // Image upload
    setupImageUpload();

    // Form validation
    setupFormValidation();

    // Province change handler
    const provinceSelect = document.getElementById('adProvince');
    if (provinceSelect) {
        provinceSelect.addEventListener('change', function() {
            updatePostAdCities(this.value);
        });
    }

    // Character counters
    const titleInput = document.getElementById('adTitle');
    const descInput = document.getElementById('adDescription');

    if (titleInput) {
        titleInput.addEventListener('input', function() {
            document.getElementById('titleCount').textContent = this.value.length;
        });
    }

    if (descInput) {
        descInput.addEventListener('input', function() {
            document.getElementById('descCount').textContent = this.value.length;
        });
    }
}

function loadPostAdCategories() {
    const categories = [
        { name: 'Cars', icon: 'car', sub: 'Cars & Vehicles' },
        { name: 'Mobiles', icon: 'mobile-alt', sub: 'Mobiles & Tablets' },
        { name: 'Bikes', icon: 'motorcycle', sub: 'Motorcycles' },
        { name: 'Property', icon: 'home', sub: 'Houses & Apartments' },
        { name: 'Jobs', icon: 'briefcase', sub: 'Employment' },
        { name: 'Electronics', icon: 'laptop', sub: 'Electronics & Appliances' },
        { name: 'Fashion', icon: 'tshirt', sub: 'Clothing & Accessories' },
        { name: 'Furniture', icon: 'couch', sub: 'Home Furniture' },
        { name: 'Services', icon: 'tools', sub: 'Local Services' },
        { name: 'Animals', icon: 'paw', sub: 'Pets & Animals' },
        { name: 'Books', icon: 'book', sub: 'Books & Education' },
        { name: 'Sports', icon: 'futbol', sub: 'Sports & Fitness' }
    ];

    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = '';

    categories.forEach(category => {
        const categoryOption = document.createElement('div');
        categoryOption.className = 'category-option';
        categoryOption.addEventListener('click', () => selectCategory(categoryOption, category.name.toLowerCase()));
        
        categoryOption.innerHTML = `
            <div class="category-icon">
                <i class="fas fa-${category.icon}"></i>
            </div>
            <div style="font-size: 0.8rem; font-weight: 600;">${category.name}</div>
            <div style="font-size: 0.7rem; color: #666;">${category.sub}</div>
        `;
        
        categoriesGrid.appendChild(categoryOption);
    });
}

function selectCategory(element, category) {
    document.querySelectorAll('.category-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    AppState.selectedCategory = category;
}

function setupStepNavigation() {
    // Next buttons
    document.getElementById('nextStep1')?.addEventListener('click', validateStep1);
    document.getElementById('nextStep2')?.addEventListener('click', validateStep2);
    document.getElementById('nextStep3')?.addEventListener('click', validateStep3);
    document.getElementById('nextStep4')?.addEventListener('click', validateStep4);

    // Previous buttons
    document.getElementById('prevStep2')?.addEventListener('click', () => showStep(1));
    document.getElementById('prevStep3')?.addEventListener('click', () => showStep(2));
    document.getElementById('prevStep4')?.addEventListener('click', () => showStep(3));
    document.getElementById('prevStep5')?.addEventListener('click', () => showStep(4));

    // Submit button
    document.getElementById('submitAd')?.addEventListener('click', submitAd);
}

function showStep(step) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('step' + step).classList.add('active');

    // Update step indicators
    document.querySelectorAll('.step').forEach(stepEl => {
        stepEl.classList.remove('active', 'completed');
        if (parseInt(stepEl.dataset.step) === step) {
            stepEl.classList.add('active');
        }
        if (parseInt(stepEl.dataset.step) < step) {
            stepEl.classList.add('completed');
        }
    });

    // Update preview if we're on the review step
    if (step === 5) {
        updateAdPreview();
    }
}

function validateStep1() {
    if (!AppState.selectedCategory) {
        showNotification('Please select a category', 'error');
        return;
    }
    showStep(2);
}

function validateStep2() {
    const title = document.getElementById('adTitle').value.trim();
    const description = document.getElementById('adDescription').value.trim();
    const price = document.getElementById('adPrice').value;
    const condition = document.getElementById('adCondition').value;

    if (!title || title.length < 10) {
        showNotification('Title must be at least 10 characters', 'error');
        return;
    }

    if (!description || description.length < 50) {
        showNotification('Description must be at least 50 characters', 'error');
        return;
    }

    if (!price || price < 1) {
        showNotification('Please enter a valid price', 'error');
        return;
    }

    if (!condition) {
        showNotification('Please select condition', 'error');
        return;
    }

    showStep(3);
}

function validateStep3() {
    const province = document.getElementById('adProvince').value;
    const city = document.getElementById('adCity').value;

    if (!province) {
        showNotification('Please select province', 'error');
        return;
    }

    if (!city) {
        showNotification('Please select city', 'error');
        return;
    }

    showStep(4);
}

function validateStep4() {
    if (AppState.uploadedImages.length === 0) {
        showNotification('Please upload at least one image', 'error');
        return;
    }
    showStep(5);
}

function updatePostAdCities(province) {
    const citySelect = document.getElementById('adCity');
    if (!citySelect) return;

    citySelect.innerHTML = '<option value="">Select City</option>';
    
    const cities = {
        'sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas'],
        'punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala'],
        'kpk': ['Peshawar', 'Abbottabad', 'Mardan', 'Swat', 'Kohat'],
        'balochistan': ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Chaman'],
        'islamabad': ['Islamabad'],
        'gilgit': ['Gilgit', 'Skardu', 'Hunza'],
        'ajk': ['Muzaffarabad', 'Mirpur', 'Kotli']
    };
    
    if (cities[province]) {
        cities[province].forEach(city => {
            const option = document.createElement('option');
            option.value = city.toLowerCase();
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

function setupImageUpload() {
    const imageUpload = document.getElementById('imageUpload');
    const imageInput = document.getElementById('imageInput');

    if (imageUpload && imageInput) {
        imageUpload.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', handleImageUpload);
    }

    AppState.uploadedImages = [];
}

function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    
    if (files.length + AppState.uploadedImages.length > 12) {
        showNotification('Maximum 12 images allowed', 'error');
        return;
    }

    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = {
                    file: file,
                    url: e.target.result
                };
                AppState.uploadedImages.push(imageData);
                displayImagePreview(imageData, AppState.uploadedImages.length - 1);
            };
            reader.readAsDataURL(file);
        }
    });
}

function displayImagePreview(imageData, index) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;

    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.innerHTML = `
        <img src="${imageData.url}" alt="Preview">
        <button class="remove-image" onclick="removeImage(${index})">
            <i class="fas fa-times"></i>
        </button>
    `;
    preview.appendChild(previewItem);
}

function removeImage(index) {
    AppState.uploadedImages.splice(index, 1);
    const preview = document.getElementById('imagePreview');
    if (preview) {
        preview.innerHTML = '';
        AppState.uploadedImages.forEach((image, i) => displayImagePreview(image, i));
    }
}

function setupFormValidation() {
    // Feature selection
    const featureOptions = document.querySelectorAll('.feature-option');
    featureOptions.forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('active');
            const feature = this.getAttribute('data-feature');
            
            if (!AppState.selectedFeatures) {
                AppState.selectedFeatures = [];
            }
            
            if (this.classList.contains('active')) {
                AppState.selectedFeatures.push(feature);
            } else {
                const index = AppState.selectedFeatures.indexOf(feature);
                if (index > -1) AppState.selectedFeatures.splice(index, 1);
            }
        });
    });
}

function updateAdPreview() {
    document.getElementById('previewTitle').textContent = document.getElementById('adTitle').value;
    document.getElementById('previewPrice').textContent = formatPrice(document.getElementById('adPrice').value);
    document.getElementById('previewDescription').textContent = document.getElementById('adDescription').value;
    
    const province = document.getElementById('adProvince').options[document.getElementById('adProvince').selectedIndex]?.text;
    const city = document.getElementById('adCity').options[document.getElementById('adCity').selectedIndex]?.text;
    document.getElementById('previewLocation').textContent = `${city}, ${province}`;

    // Update features preview
    const featuresContainer = document.getElementById('previewFeatures');
    if (featuresContainer) {
        featuresContainer.innerHTML = '';
        if (AppState.selectedFeatures) {
            AppState.selectedFeatures.forEach(feature => {
                const featureBadge = document.createElement('div');
                featureBadge.className = 'preview-feature';
                featureBadge.textContent = feature.charAt(0).toUpperCase() + feature.slice(1);
                featuresContainer.appendChild(featureBadge);
            });
        }
    }
}

async function submitAd() {
    const contact = document.getElementById('adContact').value.trim();
    const agreeTerms = document.getElementById('agreeTerms').checked;

    if (!contact) {
        showNotification('Please enter contact number', 'error');
        return;
    }

    if (!agreeTerms) {
        showNotification('Please agree to the terms and conditions', 'error');
        return;
    }

    // AI Security Check
    const title = document.getElementById('adTitle').value;
    const description = document.getElementById('adDescription').value;
    const securityCheck = await AISecurity.moderateContent(title + ' ' + description);
    
    if (!securityCheck.safe) {
        showNotification('Your ad failed security check. Please modify the content.', 'error');
        return;
    }

    const submitBtn = document.getElementById('submitAd');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Show loading
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled = true;

    try {
        // Upload images to Firebase Storage
        const imageUrls = [];
        for (const imageData of AppState.uploadedImages) {
            const imageUrl = await uploadImage(imageData.file);
            imageUrls.push(imageUrl);
        }

        // Get user data
        const user = AppState.currentUser;
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();

        // Save product data to Firestore
        const productData = {
            title: document.getElementById('adTitle').value,
            description: document.getElementById('adDescription').value,
            price: parseInt(document.getElementById('adPrice').value),
            category: AppState.selectedCategory,
            condition: document.getElementById('adCondition').value,
            province: document.getElementById('adProvince').value,
            city: document.getElementById('adCity').value,
            area: document.getElementById('adArea').value,
            address: document.getElementById('adAddress').value,
            contactNumber: contact,
            contactEmail: document.getElementById('adEmail').value,
            images: imageUrls,
            features: AppState.selectedFeatures || [],
            sellerId: user.uid,
            sellerName: userData.name,
            sellerVerified: userData.verified || false,
            status: 'active',
            views: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('products').add(productData);
        
        showNotification('Ad published successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 2000);

    } catch (error) {
        console.error('Error publishing ad:', error);
        showNotification('Error publishing ad. Please try again.', 'error');
        
        // Reset button
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

async function uploadImage(file) {
    const storageRef = storage.ref();
    const imageRef = storageRef.child(`products/${Date.now()}_${file.name}`);
    await imageRef.put(file);
    return await imageRef.getDownloadURL();
}

// ===== PROFILE =====
async function loadUserProfile() {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to view profile', 'warning');
        window.location.href = 'auth.html';
        return;
    }

    showLoading('Loading profile...');

    try {
        // Load user ads
        const adsSnapshot = await db.collection('products')
            .where('sellerId', '==', AppState.currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get();

        const userAds = [];
        adsSnapshot.forEach((doc) => {
            userAds.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Load favorites
        const favoritesSnapshot = await db.collection('favorites')
            .where('userId', '==', AppState.currentUser.uid)
            .get();

        const favoriteIds = [];
        favoritesSnapshot.forEach((doc) => {
            favoriteIds.push(doc.data().productId);
        });

        // Load favorite products
        const favoriteProducts = [];
        for (const productId of favoriteIds) {
            const productDoc = await db.collection('products').doc(productId).get();
            if (productDoc.exists) {
                favoriteProducts.push({
                    id: productDoc.id,
                    ...productDoc.data()
                });
            }
        }

        // Display profile data
        displayProfileData(userAds, favoriteProducts);

        // Setup profile tabs
        setupProfileTabs();

    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Error loading profile', 'error');
    } finally {
        hideLoading();
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('profileContent').style.display = 'block';
    }
}

function displayProfileData(userAds, favoriteProducts) {
    // Basic profile info
    document.getElementById('profileName').textContent = AppState.userData?.name || 'User';
    document.getElementById('profileEmail').textContent = AppState.currentUser?.email || '';
    document.getElementById('profileJoinDate').textContent = `Member since ${formatDate(AppState.userData?.createdAt)}`;

    if (AppState.userData?.verified) {
        document.getElementById('profileVerified').style.display = 'flex';
    }

    // Stats
    document.getElementById('totalAds').textContent = userAds.length;
    document.getElementById('activeAds').textContent = userAds.filter(ad => ad.status === 'active').length;
    document.getElementById('soldItems').textContent = userAds.filter(ad => ad.status === 'sold').length;
    document.getElementById('rating').textContent = '4.8'; // This would come from reviews in a real app

    // Display user ads
    displayUserAds(userAds);

    // Display favorites
    displayFavorites(favoriteProducts);
}

function displayUserAds(ads) {
    const adsGrid = document.getElementById('myAdsGrid');
    const noAds = document.getElementById('noAds');

    if (!adsGrid || !noAds) return;

    adsGrid.innerHTML = '';

    if (ads.length === 0) {
        noAds.style.display = 'block';
        return;
    }

    noAds.style.display = 'none';

    ads.forEach(ad => {
        const adCard = document.createElement('div');
        adCard.className = 'product-card';
        adCard.addEventListener('click', () => viewProduct(ad.id));
        
        adCard.innerHTML = `
            <div class="product-image">
                <i class="fas fa-${getCategoryIcon(ad.category)}"></i>
                ${ad.sellerVerified ? '<div class="product-badge">Verified</div>' : ''}
            </div>
            <div class="product-content">
                <h3 class="product-title">${ad.title}</h3>
                <div class="product-price">${formatPrice(ad.price)}</div>
                <div class="product-location">
                    <i class="fas fa-map-marker-alt"></i> 
                    ${ad.city ? ad.city.charAt(0).toUpperCase() + ad.city.slice(1) : ad.location}
                </div>
                <div class="product-meta">
                    <div class="product-status ${ad.status}">
                        ${ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                    </div>
                </div>
            </div>
        `;
        
        adsGrid.appendChild(adCard);
    });
}

function displayFavorites(favorites) {
    const favoritesGrid = document.getElementById('favoritesGrid');
    const noFavorites = document.getElementById('noFavorites');

    if (!favoritesGrid || !noFavorites) return;

    favoritesGrid.innerHTML = '';

    if (favorites.length === 0) {
        noFavorites.style.display = 'block';
        return;
    }

    noFavorites.style.display = 'none';

    favorites.forEach(product => {
        const favoriteCard = document.createElement('div');
        favoriteCard.className = 'product-card';
        favoriteCard.addEventListener('click', () => viewProduct(product.id));
        
        favoriteCard.innerHTML = `
            <div class="product-image">
                <i class="fas fa-${getCategoryIcon(product.category)}"></i>
                ${product.sellerVerified ? '<div class="product-badge">Verified</div>' : ''}
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-location">
                    <i class="fas fa-map-marker-alt"></i> 
                    ${product.city ? product.city.charAt(0).toUpperCase() + product.city.slice(1) : product.location}
                </div>
                <div class="product-meta">
                    <div class="seller-info">
                        <div class="seller-avatar">${getInitials(product.sellerName)}</div>
                        <span>${product.sellerName}</span>
                    </div>
                </div>
            </div>
        `;
        
        favoritesGrid.appendChild(favoriteCard);
    });
}

function setupProfileTabs() {
    const profileTabs = document.querySelectorAll('.profile-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    profileTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update tabs
            profileTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabName) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Setup settings actions
    setupProfileActions();
}

function setupProfileActions() {
    // Edit profile
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEdit = document.getElementById('cancelEdit');
    const saveProfile = document.getElementById('saveProfile');

    if (editProfileBtn && editProfileModal) {
        editProfileBtn.addEventListener('click', () => {
            // Populate form with current data
            document.getElementById('editName').value = AppState.userData?.name || '';
            document.getElementById('editEmail').value = AppState.currentUser?.email || '';
            document.getElementById('editPhone').value = AppState.userData?.phone || '';
            editProfileModal.classList.add('active');
        });
    }

    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => {
            editProfileModal.classList.remove('active');
        });
    }

    if (cancelEdit) {
        cancelEdit.addEventListener('click', () => {
            editProfileModal.classList.remove('active');
        });
    }

    if (saveProfile) {
        saveProfile.addEventListener('click', async (e) => {
            e.preventDefault();
            // Save profile logic would go here
            showNotification('Profile updated successfully', 'success');
            editProfileModal.classList.remove('active');
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
}

// ===== CHAT =====
function setupChat() {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to view chats', 'warning');
        window.location.href = 'auth.html';
        return;
    }

    loadUserChats();
    setupChatEventListeners();
}

async function loadUserChats() {
    showLoading('Loading chats...');

    try {
        const chatsSnapshot = await db.collection('chats')
            .where('participants', 'array-contains', AppState.currentUser.uid)
            .orderBy('lastMessageTime', 'desc')
            .get();

        const chats = [];
        chatsSnapshot.forEach((doc) => {
            chats.push({
                id: doc.id,
                ...doc.data()
            });
        });

        displayChatList(chats);

        // Check if a specific chat is requested
        const urlParams = new URLSearchParams(window.location.search);
        const chatId = urlParams.get('chat');
        if (chatId) {
            await loadChat(chatId);
        }

    } catch (error) {
        console.error('Error loading chats:', error);
        showNotification('Error loading chats', 'error');
    } finally {
        hideLoading();
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('chatContent').style.display = 'flex';
    }
}

function displayChatList(chats) {
    const chatList = document.getElementById('chatList');
    const noChats = document.getElementById('noChats');

    if (!chatList || !noChats) return;

    chatList.innerHTML = '';

    if (chats.length === 0) {
        noChats.style.display = 'block';
        return;
    }

    noChats.style.display = 'none';

    chats.forEach(chat => {
        const otherParticipantId = chat.participants.find(id => id !== AppState.currentUser.uid);
        const otherParticipant = chat.participantsData[otherParticipantId];

        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.addEventListener('click', () => loadChat(chat.id));
        
        chatItem.innerHTML = `
            <div class="chat-avatar">
                ${getInitials(otherParticipant.name)}
            </div>
            <div class="chat-details">
                <div class="chat-user">${otherParticipant.name}</div>
                <div class="chat-preview">${chat.lastMessage || 'No messages yet'}</div>
            </div>
            <div class="chat-meta">
                <div class="chat-time">${formatTime(chat.lastMessageTime)}</div>
            </div>
        `;
        
        chatList.appendChild(chatItem);
    });
}

async function loadChat(chatId) {
    try {
        const chatDoc = await db.collection('chats').doc(chatId).get();
        if (!chatDoc.exists) {
            throw new Error('Chat not found');
        }

        AppState.currentChat = {
            id: chatDoc.id,
            ...chatDoc.data()
        };

        // Load messages
        const messagesSnapshot = await db.collection('chats')
            .doc(chatId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .get();

        const messages = [];
        messagesSnapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });

        displayChat(messages);

        // Show active chat on mobile
        document.querySelector('.chat-main').classList.add('active');

    } catch (error) {
        console.error('Error loading chat:', error);
        showNotification('Error loading chat', 'error');
    }
}

function displayChat(messages) {
    const messagesContainer = document.getElementById('messages');
    const chatWelcome = document.getElementById('chatWelcome');
    const activeChat = document.getElementById('activeChat');

    if (!messagesContainer || !chatWelcome || !activeChat) return;

    chatWelcome.style.display = 'none';
    activeChat.style.display = 'flex';

    messagesContainer.innerHTML = '';

    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.senderId === AppState.currentUser.uid ? 'sent' : 'received'}`;
        
        messageElement.innerHTML = `
            <div class="message-text">${message.message}</div>
            <div class="message-time">${formatTime(message.timestamp)}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
    });

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Setup message sending
    setupMessageSending();
}

function setupMessageSending() {
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');

    if (messageInput && sendMessageBtn) {
        const sendMessage = () => {
            const message = messageInput.value.trim();
            if (message && AppState.currentChat) {
                sendChatMessage(AppState.currentChat.id, message);
                messageInput.value = '';
            }
        };

        sendMessageBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

async function sendChatMessage(chatId, message) {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to send messages', 'warning');
        return;
    }

    try {
        await db.collection('chats').doc(chatId).collection('messages').add({
            senderId: AppState.currentUser.uid,
            senderName: AppState.userData.name,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update last message in chat document
        await db.collection('chats').doc(chatId).update({
            lastMessage: message,
            lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
        });

    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Error sending message', 'error');
    }
}

function setupChatEventListeners() {
    // New chat button
    const newChatBtn = document.getElementById('newChatBtn');
    const newChatModal = document.getElementById('newChatModal');
    const closeNewChatModal = document.getElementById('closeNewChatModal');

    if (newChatBtn && newChatModal) {
        newChatBtn.addEventListener('click', () => {
            newChatModal.classList.add('active');
        });
    }

    if (closeNewChatModal) {
        closeNewChatModal.addEventListener('click', () => {
            newChatModal.classList.remove('active');
        });
    }
}

async function startNewChat(sellerId, productId = null) {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to start a chat', 'warning');
        return null;
    }

    try {
        // Check if chat already exists
        const existingChat = await db.collection('chats')
            .where('participants', 'array-contains', AppState.currentUser.uid)
            .get();

        let chatId = null;
        existingChat.forEach(doc => {
            const chat = doc.data();
            if (chat.participants.includes(sellerId)) {
                chatId = doc.id;
            }
        });

        if (!chatId) {
            // Get seller data
            const sellerDoc = await db.collection('users').doc(sellerId).get();
            const sellerData = sellerDoc.data();
            
            // Create new chat
            const chatData = {
                participants: [AppState.currentUser.uid, sellerId],
                participantsData: {
                    [AppState.currentUser.uid]: {
                        name: AppState.userData.name,
                        avatar: getInitials(AppState.userData.name)
                    },
                    [sellerId]: {
                        name: sellerData.name,
                        avatar: getInitials(sellerData.name)
                    }
                },
                lastMessage: '',
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
                productId: productId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const chatRef = await db.collection('chats').add(chatData);
            chatId = chatRef.id;
        }
        
        return chatId;
    } catch (error) {
        console.error('Error starting chat:', error);
        showNotification('Error starting chat', 'error');
        return null;
    }
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showLoading(message = 'Loading...') {
    let loadingSpinner = document.getElementById('loadingSpinner');
    
    if (!loadingSpinner) {
        loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'loading-spinner';
        loadingSpinner.id = 'loadingSpinner';
        loadingSpinner.innerHTML = `
            <div class="spinner"></div>
        `;
        document.body.appendChild(loadingSpinner);
    }
    
    loadingSpinner.classList.add('active');
}

function hideLoading() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.classList.remove('active');
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatPrice(price) {
    if (!price) return 'Rs 0';
    return 'Rs ' + parseInt(price).toLocaleString();
}

function formatDate(timestamp) {
    if (!timestamp) return 'Recently';
    try {
        const date = timestamp.toDate();
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return date.toLocaleDateString();
    } catch (error) {
        return 'Recently';
    }
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    try {
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        return '';
    }
}

function getCategoryIcon(category) {
    const icons = {
        'cars': 'car',
        'mobiles': 'mobile-alt',
        'property': 'home',
        'jobs': 'briefcase',
        'bikes': 'motorcycle',
        'electronics': 'laptop',
        'fashion': 'tshirt',
        'furniture': 'couch',
        'services': 'tools',
        'animals': 'paw',
        'books': 'book',
        'sports': 'futbol'
    };
    
    if (!category) return 'tag';
    
    for (const [key, icon] of Object.entries(icons)) {
        if (category.toLowerCase().includes(key)) {
            return icon;
        }
    }
    return 'tag';
}

function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

function searchProducts(query) {
    if (query.trim()) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
}

async function logoutUser() {
    try {
        await auth.signOut();
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error logging out', 'error');
    }
}

function loadUserPreferences() {
    const savedPreferences = localStorage.getItem('trustSell_preferences');
    if (savedPreferences) {
        try {
            const preferences = JSON.parse(savedPreferences);
            Object.assign(AppState, preferences);
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }
}

function saveUserPreferences() {
    try {
        const preferences = {
            currentLocation: AppState.currentLocation,
            favorites: AppState.favorites
        };
        localStorage.setItem('trustSell_preferences', JSON.stringify(preferences));
    } catch (error) {
        console.error('Error saving preferences:', error);
    }
}

function showError(message) {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--danger);"></i>
            <h3>${message}</h3>
            <p>Please try again later</p>
            <button class="btn btn-primary" onclick="window.location.href='products.html'" style="margin-top: 1rem;">
                Back to Products
            </button>
        `;
    }
}

// ===== GLOBAL EXPORTS =====
window.TrustSell = {
    AppState,
    AISecurity,
    auth,
    db,
    storage,
    
    // Utility Functions
    showNotification,
    showLoading,
    hideLoading,
    formatPrice,
    formatDate,
    getCategoryIcon,
    getInitials,
    
    // Product Functions
    loadProducts,
    displayProducts,
    toggleFavorite: toggleFavoriteProduct,
    viewProduct,
    searchProducts,
    filterByCategory,
    
    // Auth Functions
    handleLogin,
    handleSignup,
    logoutUser,
    
    // Chat Functions
    sendChatMessage,
    startNewChat,
    
    // Voice Search
    startVoiceRecognition,
    stopVoiceRecognition
};

console.log('✅ Trust Sell JavaScript loaded successfully!');

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
