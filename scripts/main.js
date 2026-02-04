document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Age Verification Logic ---
    const ageGate = document.getElementById('age-gate');
    const isVerified = localStorage.getItem('age-verified');

    if (ageGate) {
        if (isVerified === 'true') {
            ageGate.style.display = 'none';
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }

    window.verifyAge = (isOfAge) => {
        if (isOfAge) {
            localStorage.setItem('age-verified', 'true');
            if (ageGate) {
                ageGate.style.opacity = '0';
                setTimeout(() => {
                    ageGate.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 400);
            }
        } else {
            window.location.href = 'https://www.google.com';
        }
    };

    // --- 2. Header & Nav Toggle ---
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            if (window.lucide) lucide.createIcons();
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.setAttribute('data-lucide', 'menu');
                if (window.lucide) lucide.createIcons();
            });
        });
    }

    // --- 3. Cart Logic ---
    const cartDrawer = document.getElementById('cart-drawer');
    const openCartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountBadge = document.querySelector('.cart-count');
    const cartTotalValue = document.getElementById('cart-total-value');
    const addButtons = document.querySelectorAll('.add-btn');

    let cart = JSON.parse(localStorage.getItem('cart-preview')) || [];

    const toggleCart = () => {
        if (cartDrawer) {
            cartDrawer.classList.toggle('open');
            // Close mobile menu if cart is opened
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const menuIcon = menuToggle.querySelector('i');
                if (menuIcon) menuIcon.setAttribute('data-lucide', 'menu');
                if (window.lucide) lucide.createIcons();
            }
        }
    };

    if (openCartBtn) openCartBtn.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);

    // Close cart with "Seguir Comprando" buttons
    document.querySelectorAll('.close-cart-btn').forEach(btn => {
        btn.addEventListener('click', toggleCart);
    });

    const updateCartUI = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountBadge) cartCountBadge.textContent = totalItems;

        if (cartItemsContainer) {
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
                if (cartTotalValue) cartTotalValue.textContent = '$0 MXN';
                return;
            }

            cartItemsContainer.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.price} MXN x ${item.quantity}</p>
                    </div>
                    <button onclick="removeFromCart(${index})" class="remove-item-btn">Eliminar</button>
                </div>
            `).join('');
        }

        const total = cart.reduce((sum, item) => {
            const price = parseInt(item.price.replace(/[^0-9]/g, ''));
            return sum + (price * item.quantity);
        }, 0);
        if (cartTotalValue) cartTotalValue.textContent = `$${total.toLocaleString()} MXN`;

        localStorage.setItem('cart-preview', JSON.stringify(cart));
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCartUI();
    };

    window.addToCartManual = (name, price, quantity = 1) => {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ name, price, quantity });
        }
        updateCartUI();
        if (cartDrawer && !cartDrawer.classList.contains('open')) toggleCart();
    };

    if (addButtons) {
        addButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card');
                if (!card) return;
                const name = card.querySelector('.product-title').textContent;
                const price = card.querySelector('.product-price').textContent;

                window.addToCartManual(name, price, 1);

                const originalText = btn.textContent;
                btn.textContent = '¡Añadido!';
                btn.style.backgroundColor = 'var(--accent-neon)';
                btn.style.color = 'var(--bg-primary)';

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                }, 1000);
            });
        });
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Tu carrito está vacío.');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }

    updateCartUI();

    // --- 4. Smoke Particles System ---
    const initSmoke = () => {
        const canvas = document.getElementById('smoke-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 40;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 100;
                this.size = Math.random() * 100 + 50;
                this.speedY = Math.random() * 0.5 + 0.2;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.3;
                this.life = 0;
                this.maxLife = Math.random() * 500 + 500;
            }
            update() {
                this.y -= this.speedY;
                this.x += this.speedX;
                this.life++;
                if (this.life >= this.maxLife || this.y < -100) {
                    this.reset();
                }
            }
            draw() {
                ctx.beginPath();
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                gradient.addColorStop(0, `rgba(200, 200, 200, ${this.opacity * (1 - this.life / this.maxLife)})`);
                gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
                ctx.fillStyle = gradient;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();
    };

    initSmoke();
});
