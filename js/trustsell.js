// TrustSell JavaScript - Complete Functionality with Firebase Integration

// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPhoneNumber,
    RecaptchaVerifier
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    update, 
    remove, 
    push,
    onValue,
    query,
    orderByChild,
    equalTo,
    limitToFirst
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { 
    getStorage, 
    ref as storageRef, 
    uploadBytes, 
    getDownloadURL,
    deleteObject 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Global State
let currentUser = null;
let listings = [];
let categories = [];
let locations = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthentication();
    loadInitialData();
});

// Initialize Application
function initializeApp() {
    console.log('TrustSell initialized');
    
    // Initialize analytics
    logAnalyticsEvent('page_view', {
        page_title: document.title,
        page_location: window.location.href
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Search functionality
    const searchInputs = document.querySelectorAll('#searchInput, .search-input');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    });

    const searchButtons = document.querySelectorAll('.search-btn');
    searchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const searchInput = this.closest('.search-bar')?.querySelector('input') || 
                              document.querySelector('#searchInput');
            if (searchInput) {
                performSearch(searchInput.value);
            }
        });
    });

    // Bottom navigation active state
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

    // Category selection
    const categoryItems = document.querySelectorAll('.category-item, .category-card');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const categoryName = this.querySelector('.category-name')?.textContent || 
                               this.textContent.trim();
            selectCategory(categoryName);
        });
    });

    // FAQ functionality
    setupFAQ();

    // Login form handlers
    setupLoginForms();

    // Chat and message functionality
    setupChat();

    // Listing interactions
    setupListings();

    // Filter functionality
    setupFilters();
}

// Authentication Functions
function checkAuthentication() {
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        updateUIForAuthState(user);
        
        if (user) {
            logAnalyticsEvent('login', {
                method: user.providerData[0]?.providerId || 'email'
            });
        }
    });
}

function updateUIForAuthState(user) {
    const loginButtons = document.querySelectorAll('a[href="login.html"]');
    const accountElements = document.querySelectorAll('.account-specific');
    
    if (user) {
        // User is logged in
        loginButtons.forEach(btn => {
            btn.style.display = 'none';
        });
        accountElements.forEach(el => {
            el.style.display = 'block';
        });
        
        // Update user info in account page
        updateUserProfile(user);
    } else {
        // User is logged out
        loginButtons.forEach(btn => {
            btn.style.display = 'block';
        });
        accountElements.forEach(el => {
            el.style.display = 'none';
        });
    }
}

function updateUserProfile(user) {
    const profileName = document.querySelector('.profile-info h3');
    const profileAvatar = document.querySelector('.profile-avatar');
    
    if (profileName && user.displayName) {
        profileName.textContent = user.displayName;
    }
    
    if (profileAvatar && user.displayName) {
        const initials = user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
        profileAvatar.textContent = initials;
    }
}

// Login Form Handlers
function setupLoginForms() {
    // Email login form
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', handleEmailLogin);
    }

    // Phone login form
    const phoneForm = document.getElementById('phoneForm');
    if (phoneForm) {
        phoneForm.addEventListener('submit', handlePhoneLogin);
    }

    // Social login buttons
    const googleLoginBtn = document.querySelector('.google-login');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }

    const facebookLoginBtn = document.querySelector('.facebook-login');
    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', handleFacebookLogin);
    }

    // Signup form
    const signupForm = document.getElementById('signupFormElement');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

async function handleEmailLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in:', userCredential.user);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message, 'error');
    }
}

async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log('Google login successful:', result.user);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Google login error:', error);
        showNotification(error.message, 'error');
    }
}

async function handleFacebookLogin() {
    const provider = new FacebookAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log('Facebook login successful:', result.user);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Facebook login error:', error);
        showNotification(error.message, 'error');
    }
}

async function handlePhoneLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const phoneNumber = formData.get('phone');

    // Note: Phone authentication requires additional setup with Recaptcha
    showNotification('Phone authentication requires additional configuration', 'info');
}

async function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile with display name
        await updateProfile(user, { displayName: name });
        
        // Save additional user data to database
        await set(ref(database, 'users/' + user.uid), {
            name: name,
            email: email,
            phone: phone,
            createdAt: new Date().toISOString(),
            verified: false
        });

        console.log('User created:', user);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(error.message, 'error');
    }
}

// Data Loading Functions
async function loadInitialData() {
    await loadCategories();
    await loadLocations();
    await loadFeaturedListings();
}

async function loadCategories() {
    try {
        const categoriesRef = ref(database, 'categories');
        const snapshot = await get(categoriesRef);
        
        if (snapshot.exists()) {
            categories = snapshot.val();
        } else {
            // Load default categories if none exist
            await initializeDefaultCategories();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function initializeDefaultCategories() {
    const defaultCategories = {
        'mobiles': {
            name: 'Mobiles',
            subcategories: {
                'smartphones': 'Smartphones',
                'feature-phones': 'Feature Phones',
                'tablets': 'Tablets',
                'smartwatches': 'Smartwatches',
                'accessories': 'Accessories'
            }
        },
        'vehicles': {
            name: 'Vehicles',
            subcategories: {
                'cars': 'Cars',
                'bikes': 'Bikes',
                'rickshaws': 'Rickshaws',
                'commercial': 'Commercial Vehicles',
                'spare-parts': 'Spare Parts',
                'tyres-rims': 'Tyres & Rims'
            }
        }
        // Add more default categories as needed
    };

    try {
        await set(ref(database, 'categories'), defaultCategories);
        categories = defaultCategories;
    } catch (error) {
        console.error('Error initializing categories:', error);
    }
}

async function loadLocations() {
    try {
        const locationsRef = ref(database, 'locations');
        const snapshot = await get(locationsRef);
        
        if (snapshot.exists()) {
            locations = snapshot.val();
        } else {
            await initializeDefaultLocations();
        }
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

async function initializeDefaultLocations() {
    const defaultLocations = {
        'punjab': {
            name: 'Punjab',
            cities: {
                'lahore': {
                    name: 'Lahore',
                    areas: ['Model Town', 'Johar Town', 'Gulberg', 'Bahria Town', 'DHA', 'Cantt']
                },
                'faisalabad': {
                    name: 'Faisalabad',
                    areas: ['Civic Center', 'Madina Town', 'Jinnah Colony']
                }
            }
        },
        'sindh': {
            name: 'Sindh',
            cities: {
                'karachi': {
                    name: 'Karachi',
                    areas: ['DHA', 'Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad', 'Saddar']
                }
            }
        }
        // Add more locations as needed
    };

    try {
        await set(ref(database, 'locations'), defaultLocations);
        locations = defaultLocations;
    } catch (error) {
        console.error('Error initializing locations:', error);
    }
}

async function loadFeaturedListings() {
    try {
        const listingsRef = query(
            ref(database, 'listings'),
            orderByChild('featured'),
            equalTo(true),
            limitToFirst(20)
        );
        
        const snapshot = await get(listingsRef);
        if (snapshot.exists()) {
            listings = snapshot.val();
            displayListings(listings, 'featuredListings');
        } else {
            // Show placeholder or load recent listings
            await loadRecentListings();
        }
    } catch (error) {
        console.error('Error loading featured listings:', error);
    }
}

async function loadRecentListings() {
    try {
        const listingsRef = query(
            ref(database, 'listings'),
            orderByChild('createdAt'),
            limitToFirst(20)
        );
        
        const snapshot = await get(listingsRef);
        if (snapshot.exists()) {
            listings = snapshot.val();
            displayListings(listings, 'featuredListings');
        }
    } catch (error) {
        console.error('Error loading recent listings:', error);
    }
}

// Display Functions
function displayListings(listingsData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    Object.entries(listingsData).forEach(([id, listing]) => {
        const listingElement = createListingElement(listing, id);
        container.appendChild(listingElement);
    });
}

function createListingElement(listing, id) {
    const div = document.createElement('div');
    div.className = 'listing-card';
    div.innerHTML = `
        <img src="${listing.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxpc3RpbmcgSW1hZ2U8L3RleHQ+PC9zdmc+'}" 
             alt="${listing.title}" class="listing-image">
        <div class="listing-info">
            <h3 class="listing-title">${listing.title}</h3>
            <div class="listing-price">Rs ${formatPrice(listing.price)}</div>
            <div class="listing-meta">
                <span>${listing.location}</span>
                <span>${formatTime(listing.createdAt)}</span>
            </div>
        </div>
    `;

    div.addEventListener('click', () => {
        viewListing(id);
    });

    return div;
}

// Search Functionality
function performSearch(query) {
    if (!query.trim()) return;

    logAnalyticsEvent('search', {
        search_term: query
    });

    // For now, redirect to search results page
    window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
}

// Category Selection
function selectCategory(categoryName) {
    logAnalyticsEvent('select_category', {
        category_name: categoryName
    });

    // For now, redirect to search results filtered by category
    window.location.href = `search-results.html?category=${encodeURIComponent(categoryName)}`;
}

// FAQ Functionality
function setupFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });

    // Category tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active tab
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.faq-category-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${category}-faq`).classList.add('active');
        });
    });
}

// Chat Functionality
function setupChat() {
    // Chat tabs
    const chatTabs = document.querySelectorAll('.chat-tabs .tab, .inbox-tabs .tab');
    chatTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabType = this.getAttribute('data-tab');
            
            // Update active tab
            this.parentElement.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Filter chat/messages based on tab
            filterChats(tabType);
        });
    });

    // Chat filters
    const chatFilters = document.querySelectorAll('.chat-filters .filter-btn');
    chatFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            chatFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            const filterType = this.textContent.toLowerCase();
            filterChatsByStatus(filterType);
        });
    });
}

function filterChats(tabType) {
    const chatItems = document.querySelectorAll('.chat-item, .message-item');
    
    chatItems.forEach(item => {
        switch(tabType) {
            case 'all':
                item.style.display = 'flex';
                break;
            case 'buying':
            case 'selling':
            case 'unread':
            case 'important':
                // Implement actual filtering logic based on data attributes
                const itemType = item.getAttribute('data-type');
                if (itemType === tabType) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
                break;
        }
    });
}

function filterChatsByStatus(status) {
    // Implement status-based filtering
    console.log('Filtering by status:', status);
}

// Listing Interactions
function setupListings() {
    // Favorite functionality
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFavorite(this);
        });
    });

    // Share functionality
    const shareBtns = document.querySelectorAll('.share-btn');
    shareBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            shareListing(this);
        });
    });
}

function toggleFavorite(button) {
    const isFavorited = button.classList.contains('favorited');
    
    if (isFavorited) {
        button.classList.remove('favorited');
        button.textContent = '🤍';
    } else {
        button.classList.add('favorited');
        button.textContent = '❤️';
    }
    
    logAnalyticsEvent('toggle_favorite', {
        listing_id: button.closest('.listing-card')?.getAttribute('data-id')
    });
}

function shareListing(button) {
    const listingElement = button.closest('.listing-detail') || button.closest('.listing-card');
    const listingTitle = listingElement?.querySelector('h1, .listing-title')?.textContent;
    const listingUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: listingTitle,
            url: listingUrl
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(listingUrl).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        });
    }
    
    logAnalyticsEvent('share_listing', {
        listing_title: listingTitle
    });
}

function viewListing(listingId) {
    window.location.href = `listing.html?id=${listingId}`;
}

// Filter Functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.textContent.toLowerCase();
            applyFilters(filterValue);
        });
    });

    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const viewType = this.getAttribute('data-view');
            toggleView(viewType);
        });
    });
}

function applyFilters(filterType) {
    console.log('Applying filter:', filterType);
    // Implement actual filtering logic based on the filter type
}

function toggleView(viewType) {
    const resultsGrid = document.querySelector('.results-grid');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (viewType === 'list') {
        resultsGrid.classList.add('list-view');
    } else {
        resultsGrid.classList.remove('list-view');
    }
}

// Utility Functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-PK').format(price);
}

function formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = (now - time) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
    } else {
        return `${Math.floor(diffInHours / 24)} days ago`;
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#0078d4'
    };
    notification.style.background = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function logAnalyticsEvent(eventName, parameters = {}) {
    // Log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`Analytics Event: ${eventName}`, parameters);
    }
    
    // Send to Firebase Analytics
    analytics.logEvent(eventName, parameters);
}

// Login Page Specific Functions
function showEmailLogin() {
    document.getElementById('emailLoginForm').classList.remove('hidden');
    document.querySelector('.login-card').classList.add('hidden');
}

function hideEmailLogin() {
    document.getElementById('emailLoginForm').classList.add('hidden');
    document.querySelector('.login-card').classList.remove('hidden');
}

function showPhoneLogin() {
    document.getElementById('phoneLoginForm').classList.remove('hidden');
    document.querySelector('.login-card').classList.add('hidden');
}

function hidePhoneLogin() {
    document.getElementById('phoneLoginForm').classList.add('hidden');
    document.querySelector('.login-card').classList.remove('hidden');
}

function showSignup() {
    document.getElementById('signupForm').classList.remove('hidden');
    document.querySelector('.login-card').classList.add('hidden');
}

function hideSignup() {
    document.getElementById('signupForm').classList.add('hidden');
    document.querySelector('.login-card').classList.remove('hidden');
}

// Export functions for global access
window.showEmailLogin = showEmailLogin;
window.hideEmailLogin = hideEmailLogin;
window.showPhoneLogin = showPhoneLogin;
window.hidePhoneLogin = hidePhoneLogin;
window.showSignup = showSignup;
window.hideSignup = hideSignup;
window.selectCategory = selectCategory;

// Service Worker Registration for PWA (Future Enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}
