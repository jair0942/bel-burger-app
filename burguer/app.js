/* ===========================================
   BEL BURGER — App Logic
   Cards · Cart · WhatsApp · Scroll Effects · Security
   =========================================== */

// --- Security: Sanitize user input ---
function sanitizeInput(str, maxLen) {
    maxLen = maxLen || 300;
    if (typeof str !== 'string') return '';
    // Remove HTML tags and trim
    return str.replace(/<[^>]*>/g, '').replace(/[<>"'`]/g, '').trim().slice(0, maxLen);
}

// --- Toast notification system ---
var toastTimers = [];
function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 2800;
    var container = document.getElementById('toast-container');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    var icon = { success: '✓', error: '✕', info: '🍔', warning: '⚠️' }[type] || '';
    toast.textContent = (icon ? icon + '  ' : '') + message;
    container.appendChild(toast);
    var timer = setTimeout(function() {
        toast.classList.add('toast-out');
        setTimeout(function() { if(toast.parentNode) toast.parentNode.removeChild(toast); }, 320);
    }, duration);
    toastTimers.push(timer);
}

// --- Products (Menú real BEL BURGER) ---
var products = [
    {
        id: 1,
        name: "Hamburguesa BEL Tradicional",
        desc: "Pan artesanal, carne de la casa, salsa de la casa, mermelada de tocineta, queso cheddar, lechuga crespa, pepinillos y cebolla crispy. (+Papas)",
        price: 23000,
        img: "img-classic.webp",
        tag: "Hamburguesa"
    },
    {
        id: 6,
        name: "Hamburguesa Doble BEL",
        desc: "Pan brioche, salsa especial de la casa, lechuga crespa, aros de cebolla apanados, doble carne de la casa, doble cheddar, tocineta ahumada, salsa tártara de la casa. (+Papas). ¡También disponible mixta (pollo + carne) por $29.000!",
        price: 28000,
        priceAlt: 29000,
        priceAltLabel: "Mixta (Pollo + Carne)",
        img: "burgerneuva.png",
        tag: "Hamburguesa",
        isNew: true
    },
    {
        id: 5,
        name: "Chicken BEL Tradicional",
        desc: "Pan brioche, salsa chipotle, pechuga de pollo apanada, queso mozzarella, salsa ensalada especial de la casa, tocineta ahumada. (+Papas)",
        price: 23000,
        img: "hamburguesa_chiken.webp",
        tag: "Chicken"
    },
    {
        id: 7,
        name: "Salchi Ranch Tradicional",
        desc: "Papas a la francesa, lechuga, queso costeño, salsa tártara, salsa de piña, pechuga de pollo en salsa BBQ, salchicha ahumada, ranchera, chongo, queso mozzarella.",
        price: 25000,
        img: "salchi.png",
        tag: "Salchipapa",
        isNew: true
    },
    {
        id: 3,
        name: "Salchipapa BEL Sencilla",
        desc: "Papas a la francesa, salsa de la casa, salsa de piña, salsa tártara, queso costeño, salchicha, tocineta crunchy.",
        price: 14000,
        img: "salchipapa_sencilla.webp",
        tag: "Salchipapa"
    },
    {
        id: 4,
        name: "Salchipapa BEL Tradicional",
        desc: "Papas a la francesa, salsa de la casa, salsa de piña, salsa tártara, queso costeño, salchicha, queso mozzarella, tocineta crunchy + cebolla crispy.",
        price: 20000,
        img: "salchipapa_tradicional.webp",
        tag: "Salchipapa"
    },
    {
        id: 2,
        name: "Perro BEL Tradicional",
        desc: "Pan artesanal, salchicha americana, salsa de la casa, queso mozzarella, mermelada de tocineta y tocineta crunchy. (+Papas)",
        price: 18000,
        img: "perro_tradicional.webp",
        tag: "Perro"
    }
];

// --- Adicionales ---
var adicionales = [
    { name: "Maíz",                price: 5000 },
    { name: "Gratinado (mozzarella)", price: 5000 },
    { name: "Loncha (mozzarella)",  price: 2000 },
    { name: "Queso costeño",        price: 4000 },
    { name: "Suiza",                price: 8000 },
    { name: "Ranchera",             price: 6000 },
    { name: "Grille",               price: 4000 },
    { name: "Porción de papas",     price: 8000 },
    { name: "Pollo",                price: 10000 },
    { name: "Butifarra",            price: 6000 },
    { name: "Tocineta",             price: 5000 }
];

// --- Formatter ---
const fmt = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

// --- State ---
let cart = [];
let isStoreOpen = false;

// --- Store Status ---

// Semana especial: del lunes 27-Apr-2026 al domingo 03-May-2026
// Jueves: 7 PM – 11:59 PM  |  Viernes–Domingo: horario normal (4 PM – 12 AM)
var SPECIAL_WEEK_START = new Date('2026-04-27T00:00:00-05:00'); // lunes
var SPECIAL_WEEK_END   = new Date('2026-05-04T00:00:00-05:00'); // lunes siguiente (exclusivo)

function isSpecialWeek(now) {
    return now >= SPECIAL_WEEK_START && now < SPECIAL_WEEK_END;
}

function checkIsOpen(now) {
    var day  = now.getDay();  // 0=Dom, 1=Lun … 4=Jue, 5=Vie, 6=Sáb
    var hour = now.getHours();

    if (isSpecialWeek(now)) {
        // Jueves especial: 7 PM – 11:59 PM
        if (day === 4 && hour >= 19 && hour < 24) return true;
        // Viernes–Domingo: horario normal 4 PM – 11:59 PM
        if ((day === 5 || day === 6 || day === 0) && hour >= 16 && hour < 24) return true;
        return false;
    }

    // Horario normal: Viernes–Domingo, 4 PM – 11:59 PM
    return (day === 5 || day === 6 || day === 0) && hour >= 16 && hour < 24;
}

function initStoreStatus() {
    function updateStatus() {
        // Hora estricta de Colombia, sin importar dónde esté el cliente
        var bogotaTimeStr = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' });
        var now = new Date(bogotaTimeStr);

        isStoreOpen = checkIsOpen(now);

        var badge      = document.getElementById('store-status-badge');
        var statusText = document.getElementById('status-text');

        if (badge && statusText) {
            if (isStoreOpen) {
                badge.classList.remove('closed');
                badge.classList.add('open');
                statusText.textContent = 'Abierto';
            } else {
                badge.classList.remove('open');
                badge.classList.add('closed');
                statusText.textContent = 'Cerrado';
            }
        }
    }

    updateStatus();
    setInterval(updateStatus, 60000); // Check every minute
}

// --- Render Product Cards ---
function renderCards() {
    var skeleton = document.getElementById('skeleton-grid');
    var grid = document.getElementById('cards-grid');
    if (!grid) return;

    products.forEach(function (p) {
        // Card container
        var card = document.createElement('div');
        card.className = 'product-card' + (p.isNew ? ' product-card--new' : '');
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', p.name);

        // Keyboard open modal
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openProductModal(p);
            }
        });

        // Image box
        var imgBox = document.createElement('div');
        imgBox.className = 'card-img-box';
        imgBox.style.cursor = 'pointer';
        imgBox.addEventListener('click', function () { openProductModal(p); });

        var img = document.createElement('img');
        img.className = 'card-img';
        img.src = p.img;
        img.alt = p.name;
        img.loading = 'lazy';
        imgBox.appendChild(img);

        var tag = document.createElement('span');
        tag.className = 'card-tag';
        tag.textContent = p.tag;
        imgBox.appendChild(tag);

        // Badge NUEVO
        if (p.isNew) {
            var newBadge = document.createElement('span');
            newBadge.className = 'card-new-badge';
            newBadge.textContent = '✦ NUEVO';
            imgBox.appendChild(newBadge);
        }

        card.appendChild(imgBox);

        // Body
        var body = document.createElement('div');
        body.className = 'card-body';
        body.style.cursor = 'pointer';
        body.addEventListener('click', function (e) {
            if(e.target.tagName !== 'BUTTON') {
                openProductModal(p);
            }
        });

        var name = document.createElement('h3');
        name.className = 'card-name';
        name.textContent = p.name;
        body.appendChild(name);

        var desc = document.createElement('p');
        desc.className = 'card-desc';
        desc.textContent = p.desc;
        body.appendChild(desc);

        // Precio alternativo (ej. mixta)
        if (p.priceAlt) {
            var altPriceNote = document.createElement('p');
            altPriceNote.className = 'card-price-alt';
            altPriceNote.textContent = '⚡ ' + p.priceAltLabel + ': ' + fmt.format(p.priceAlt);
            body.appendChild(altPriceNote);
        }

        // Bottom row
        var bottom = document.createElement('div');
        bottom.className = 'card-bottom';

        var price = document.createElement('span');
        price.className = 'card-price';
        price.textContent = fmt.format(p.price);
        bottom.appendChild(price);

        var controls = document.createElement('div');
        controls.className = 'card-controls';

        // Add button
        var addBtn = document.createElement('button');
        addBtn.className = 'add-btn';
        addBtn.textContent = 'Seleccionar';
        addBtn.type = 'button';

        addBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            openProductModal(p);
        });

        controls.appendChild(addBtn);
        bottom.appendChild(controls);
        body.appendChild(bottom);
        card.appendChild(body);
        grid.appendChild(card);
    });

    // Reveal cards, hide skeleton
    if (skeleton) skeleton.style.display = 'none';
    grid.style.display = '';
}

// --- Render Adicionales ---
function renderAdicionales() {
    var grid = document.getElementById('adicionales-grid');
    if (!grid) return;

    adicionales.forEach(function (a) {
        var pill = document.createElement('div');
        pill.className = 'adicional-pill';

        var pillName = document.createElement('span');
        pillName.className = 'adicional-name';
        pillName.textContent = a.name;

        var pillPrice = document.createElement('span');
        pillPrice.className = 'adicional-price';
        pillPrice.textContent = '+' + fmt.format(a.price);

        pill.appendChild(pillName);
        pill.appendChild(pillPrice);
        grid.appendChild(pill);
    });
}

// --- Cart Logic ---
function addToCart(id, qty, notes, unitPrice) {
    notes = (notes || '').trim();
    var product = null;
    for (var i = 0; i < products.length; i++) {
        if (products[i].id === id) { product = products[i]; break; }
    }
    if (!product) return;

    var finalPrice = (typeof unitPrice === 'number') ? unitPrice : product.price;

    var existing = null;
    for (var j = 0; j < cart.length; j++) {
        if (cart[j].id === id && cart[j].notes === notes && cart[j].price === finalPrice) { existing = cart[j]; break; }
    }

    if (existing) {
        existing.quantity += qty;
    } else {
        var cartItemId = Date.now().toString() + Math.random().toString();
        cart.push({ cartItemId: cartItemId, id: product.id, name: product.name, price: finalPrice, quantity: qty, notes: notes });
    }

    updateCartUI();

    // Badge pop animation
    var badge = document.getElementById('cart-count');
    if (badge) {
        badge.classList.remove('pop');
        void badge.offsetWidth; // reflow
        badge.classList.add('pop');
    }

    showToast('¡' + product.name.split(' ')[0] + ' agregado al pedido!', 'success', 2000);
}

function removeFromCart(cartItemId) {
    var newCart = [];
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].cartItemId !== cartItemId) newCart.push(cart[i]);
    }
    cart = newCart;
    updateCartUI();
}

function updateCartUI() {
    var countEl = document.getElementById('cart-count');
    var listEl = document.getElementById('cart-list');
    var totalEl = document.getElementById('cart-total-price');

    var totalItems = 0;
    var totalPrice = 0;

    for (var i = 0; i < cart.length; i++) {
        totalItems += cart[i].quantity;
        totalPrice += cart[i].price * cart[i].quantity;
    }

    countEl.textContent = totalItems;
    listEl.innerHTML = '';

    if (cart.length === 0) {
        var empty = document.createElement('p');
        empty.className = 'cart-empty';
        empty.textContent = 'Tu carrito está vacío';
        listEl.appendChild(empty);
    } else {
        for (var j = 0; j < cart.length; j++) {
            var item = cart[j];
            var sub = item.price * item.quantity;

            var row = document.createElement('div');
            row.className = 'cart-item';

            var info = document.createElement('div');
            info.className = 'cart-item-info';

            var h4 = document.createElement('h4');
            h4.textContent = item.quantity + 'x ' + item.name;
            info.appendChild(h4);

            if (item.notes) {
                var pNotes = document.createElement('p');
                pNotes.className = 'cart-item-notes';
                pNotes.textContent = item.notes;
                info.appendChild(pNotes);
            }

            var priceDiv = document.createElement('div');
            priceDiv.className = 'cart-item-price';
            priceDiv.textContent = fmt.format(sub);
            info.appendChild(priceDiv);

            row.appendChild(info);

            var del = document.createElement('button');
            del.className = 'item-del';
            del.textContent = '✕';
            del.type = 'button';
            (function (cItemId) {
                del.addEventListener('click', function () { removeFromCart(cItemId); });
            })(item.cartItemId);

            row.appendChild(del);
            listEl.appendChild(row);
        }
    }

    totalEl.textContent = fmt.format(totalPrice);
}

// --- Cart Panel Open/Close ---
function openCart() {
    var panel = document.getElementById('cart-panel');
    var overlay = document.getElementById('cart-overlay');
    panel.classList.add('open');
    overlay.classList.add('show');
    overlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    // Scroll to top of cart on each open
    setTimeout(function() {
        var scroll = document.getElementById('cart-scroll');
        if (scroll) scroll.scrollTop = 0;
    }, 420);
}

function closeCart() {
    var panel = document.getElementById('cart-panel');
    var overlay = document.getElementById('cart-overlay');
    panel.classList.remove('open');
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Return focus to cart toggle
    var toggle = document.getElementById('cart-toggle');
    if (toggle) toggle.focus();
}

// --- Scroll: Navbar + Hero parallax ---
function initScroll() {
    var navbar = document.getElementById('navbar');
    var logoArea = document.getElementById('hero-logo-area');
    var ticking = false;

    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            var y = window.scrollY;
            var vh = window.innerHeight;

            // Navbar
            if (y > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hero parallax
            if (logoArea && y < vh) {
                var pct = y / (vh * 0.55);
                pct = Math.min(pct, 1);
                var op = 1 - pct * 0.8;
                var blur = pct * 6;
                var translateY = y * 0.3;
                var scale = 1 - pct * 0.06;
                logoArea.style.opacity = op;
                logoArea.style.transform = 'translateY(' + translateY + 'px) scale(' + scale + ')';
                logoArea.style.filter = 'blur(' + blur + 'px)';
            }

            ticking = false;
        });
    }, { passive: true });
}

// --- TrueFocus ---
function initTrueFocus() {
    var container = document.getElementById('true-focus-container');
    if (!container) return;

    container.innerHTML = '';

    var sentence = 'Una experiencia para tu paladar';
    var words = sentence.split(' ');
    var blurAmt = 4;
    var animTime = 0.4;
    var pause = 1.2;
    var pad = 8; // padding around the frame
    var current = 0;
    var wordEls = [];

    // Create frame — uses left/top positioning, NOT transform
    var frame = document.createElement('div');
    frame.className = 'focus-frame';
    frame.innerHTML =
        '<span class="corner top-left"></span>' +
        '<span class="corner top-right"></span>' +
        '<span class="corner bottom-left"></span>' +
        '<span class="corner bottom-right"></span>';

    // Create word spans
    for (var i = 0; i < words.length; i++) {
        var span = document.createElement('span');
        span.className = 'focus-word';
        span.textContent = words[i];
        span.style.filter = 'blur(' + blurAmt + 'px)';
        span.style.opacity = '0.3';
        span.style.transition = 'filter ' + animTime + 's ease, opacity ' + animTime + 's ease';
        container.appendChild(span);
        wordEls.push(span);
    }
    container.appendChild(frame);

    function update() {
        // Blur all words
        for (var j = 0; j < wordEls.length; j++) {
            wordEls[j].style.filter = 'blur(' + blurAmt + 'px)';
            wordEls[j].style.opacity = '0.3';
        }
        // Focus the current word
        var active = wordEls[current];
        active.style.filter = 'blur(0px)';
        active.style.opacity = '1';

        // Position frame precisely using left/top (not transform)
        var cRect = container.getBoundingClientRect();
        var aRect = active.getBoundingClientRect();

        var x = aRect.left - cRect.left - pad;
        var y = aRect.top - cRect.top - pad;
        var w = aRect.width + pad * 2;
        var h = aRect.height + pad * 2;

        frame.style.left = x + 'px';
        frame.style.top = y + 'px';
        frame.style.width = w + 'px';
        frame.style.height = h + 'px';
        frame.style.opacity = '1';

        current = (current + 1) % words.length;
    }

    // Wait for fonts to be ready before first measurement
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
            setTimeout(update, 200);
        });
    } else {
        setTimeout(update, 600);
    }
    setInterval(update, (animTime + pause) * 1000);
}

// --- Product Modal Logic ---
let pmQty = 1;
let currentProduct = null;
let currentVariantPrice = 0;
let selectedAdicionalesMap = {};

function computeModalUnitPrice() {
    var total = currentVariantPrice;
    var keys = Object.keys(selectedAdicionalesMap);
    for (var k = 0; k < keys.length; k++) total += selectedAdicionalesMap[keys[k]];
    return total;
}

function updateModalPrice() {
    var unit = computeModalUnitPrice();
    var el = document.getElementById('pm-price');
    if (pmQty > 1) {
        el.innerHTML = fmt.format(unit) + ' <span class="pm-price-hint">× ' + pmQty + ' = ' + fmt.format(unit * pmQty) + '</span>';
    } else {
        el.textContent = fmt.format(unit);
    }
}

function updateQtyControls() {
    var hasAdic = Object.keys(selectedAdicionalesMap).length > 0;
    var minus = document.getElementById('pm-minus');
    var plus  = document.getElementById('pm-plus');
    var hint  = document.getElementById('pm-qty-hint');
    if (hasAdic) {
        pmQty = 1;
        document.getElementById('pm-num').textContent = pmQty;
        minus.disabled = true;
        plus.disabled  = true;
        minus.classList.add('qty-btn--disabled');
        plus.classList.add('qty-btn--disabled');
        if (hint) hint.classList.add('pm-qty-hint--visible');
    } else {
        minus.disabled = false;
        plus.disabled  = false;
        minus.classList.remove('qty-btn--disabled');
        plus.classList.remove('qty-btn--disabled');
        if (hint) hint.classList.remove('pm-qty-hint--visible');
    }
    updateModalPrice();
}

function buildVariantBtn(label, price, isActive) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pm-variant-btn' + (isActive ? ' pm-variant-btn--active' : '');
    var lbl = document.createElement('span');
    lbl.className = 'pm-variant-label';
    lbl.textContent = label;
    var prc = document.createElement('span');
    prc.className = 'pm-variant-price';
    prc.textContent = fmt.format(price);
    btn.appendChild(lbl);
    btn.appendChild(prc);
    btn.addEventListener('click', function() {
        document.querySelectorAll('.pm-variant-btn').forEach(function(b) { b.classList.remove('pm-variant-btn--active'); });
        btn.classList.add('pm-variant-btn--active');
        currentVariantPrice = price;
        updateModalPrice();
    });
    return btn;
}

function buildAdicionalBtn(a) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pm-adic-item';
    var nameEl = document.createElement('span');
    nameEl.className = 'pm-adic-name';
    nameEl.textContent = a.name;
    var priceEl = document.createElement('span');
    priceEl.className = 'pm-adic-price';
    priceEl.textContent = '+' + fmt.format(a.price);
    var checkEl = document.createElement('span');
    checkEl.className = 'pm-adic-check';
    checkEl.textContent = '+';
    btn.appendChild(nameEl);
    btn.appendChild(priceEl);
    btn.appendChild(checkEl);
    var active = false;
    btn.addEventListener('click', function() {
        active = !active;
        if (active) {
            btn.classList.add('pm-adic-item--active');
            checkEl.textContent = '✓';
            selectedAdicionalesMap[a.name] = a.price;
        } else {
            btn.classList.remove('pm-adic-item--active');
            checkEl.textContent = '+';
            delete selectedAdicionalesMap[a.name];
        }
        updateQtyControls();
    });
    return btn;
}

function openProductModal(p) {
    currentProduct = p;
    pmQty = 1;
    selectedAdicionalesMap = {};
    currentVariantPrice = p.price;

    document.getElementById('pm-img').src = p.img;
    document.getElementById('pm-img').alt = p.name;
    document.getElementById('pm-tag').textContent = p.tag;
    document.getElementById('pm-name').textContent = p.name;
    document.getElementById('pm-desc').textContent = p.desc;
    document.getElementById('pm-notes').value = '';
    document.getElementById('pm-num').textContent = pmQty;

    // Variant selector
    var variantBox = document.getElementById('pm-variant');
    var variantOpts = document.getElementById('pm-variant-options');
    variantOpts.innerHTML = '';
    if (p.priceAlt) {
        variantBox.style.display = 'block';
        variantOpts.appendChild(buildVariantBtn('Doble Carne', p.price, true));
        variantOpts.appendChild(buildVariantBtn(p.priceAltLabel, p.priceAlt, false));
    } else {
        variantBox.style.display = 'none';
    }

    // Adicionales
    var adicList = document.getElementById('pm-adicionales-list');
    adicList.innerHTML = '';
    adicionales.forEach(function(a) { adicList.appendChild(buildAdicionalBtn(a)); });

    // Reset qty controls (no adicionales selected on open)
    var minus = document.getElementById('pm-minus');
    var plus  = document.getElementById('pm-plus');
    var hint  = document.getElementById('pm-qty-hint');
    if (minus) { minus.disabled = false; minus.classList.remove('qty-btn--disabled'); }
    if (plus)  { plus.disabled  = false; plus.classList.remove('qty-btn--disabled'); }
    if (hint)  { hint.classList.remove('pm-qty-hint--visible'); }

    updateModalPrice();
    document.getElementById('product-modal-window').classList.add('open');
}

function closeProductModal() {
    document.getElementById('product-modal-window').classList.remove('open');
}

function initProductModal() {
    document.getElementById('pm-close').addEventListener('click', closeProductModal);
    document.getElementById('product-modal-window').addEventListener('click', function(e) {
        if (e.target === this) closeProductModal();
    });

    document.getElementById('pm-minus').addEventListener('click', function() {
        if (pmQty > 1) { pmQty--; document.getElementById('pm-num').textContent = pmQty; updateModalPrice(); }
    });
    document.getElementById('pm-plus').addEventListener('click', function() {
        pmQty++; document.getElementById('pm-num').textContent = pmQty; updateModalPrice();
    });

    document.getElementById('pm-add').addEventListener('click', function() {
        if (!currentProduct) return;
        var notes = document.getElementById('pm-notes').value.trim();
        var unitPrice = computeModalUnitPrice();

        // Build variant label
        var parts = [];
        if (currentProduct.priceAlt) {
            var activeBtn = document.querySelector('.pm-variant-btn--active .pm-variant-label');
            if (activeBtn) parts.push('Variante: ' + activeBtn.textContent);
        }
        // Build adicionales label
        var adicNames = Object.keys(selectedAdicionalesMap);
        if (adicNames.length > 0) parts.push('Adicionales: ' + adicNames.join(', '));
        if (notes) parts.push(notes);
        var fullNotes = parts.join(' | ');

        addToCart(currentProduct.id, pmQty, fullNotes, unitPrice);

        var btn = document.getElementById('pm-add');
        btn.classList.add('done');
        btn.textContent = '¡Agregado!';
        setTimeout(function() {
            btn.classList.remove('done');
            btn.textContent = 'Agregar al pedido';
            closeProductModal();
            openCart();
        }, 600);
    });
}

function initGeoLocation() {
    var btn = document.getElementById('btn-gps');
    if (!btn) return;

    var geoDebounce = null;

    btn.addEventListener('click', function() {
        if (geoDebounce) return; // prevent double-tap

        if (!navigator.geolocation) {
            showToast('Tu navegador no soporta ubicación automática.', 'warning');
            return;
        }

        var origHTML = btn.innerHTML;
        btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg> Ubicando...';
        btn.disabled = true;

        geoDebounce = setTimeout(function() { geoDebounce = null; }, 5000);

        var geoOpts = { timeout: 8000, enableHighAccuracy: true, maximumAge: 30000 };

        navigator.geolocation.getCurrentPosition(function(pos) {
            var lat = pos.coords.latitude;
            var lon = pos.coords.longitude;

            fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lon, {
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined
            })
                .then(function(r) {
                    if (!r.ok) throw new Error('Nominatim error');
                    return r.json();
                })
                .then(function(data) {
                    var address = data.address;
                    if (address) {
                        var barrio = address.neighbourhood || address.suburb || address.city_district || '';
                        var calle  = address.road || '';
                        var numero = address.house_number || '';
                        var combinedDir = calle + (numero ? ' #' + numero : '');

                        document.getElementById('del-barrio').value = barrio;
                        document.getElementById('del-dir').value = combinedDir;

                        // Visual ok feedback
                        if (barrio) document.getElementById('del-barrio').classList.add('input-ok');
                        if (combinedDir) document.getElementById('del-dir').classList.add('input-ok');
                    }
                    showToast('¡Ubicación aplicada!', 'success', 2000);
                    btn.innerHTML = origHTML;
                    btn.disabled = false;
                })
                .catch(function() {
                    showToast('Error al obtener dirección. Escríbela manualmente.', 'error');
                    btn.innerHTML = origHTML;
                    btn.disabled = false;
                });
        }, function(err) {
            var msg = err.code === 1
                ? 'Permiso de GPS denegado. Escribe la dirección a mano.'
                : 'No se pudo obtener la ubicación. Inténtalo de nuevo.';
            showToast(msg, 'warning');
            btn.innerHTML = origHTML;
            btn.disabled = false;
        }, geoOpts);
    });
}

function initCheckout() {
    // Payment toggle buttons
    var paymentBtns = document.querySelectorAll('.payment-btn');
    paymentBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            paymentBtns.forEach(function(b) { b.classList.remove('payment-btn--active'); });
            btn.classList.add('payment-btn--active');
            document.getElementById('del-pago').value = btn.getAttribute('data-value');
        });
    });

    document.getElementById('checkout-btn').addEventListener('click', function () {
        if (!isStoreOpen) {
            var bogotaTimeStr = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' });
            var nowCheck = new Date(bogotaTimeStr);
            var horarioMsg;

            if (isSpecialWeek(nowCheck)) {
                horarioMsg =
                    '⭐ SOLO POR ESTA SEMANA — Horario especial:\n' +
                    '🕖 Jueves: 7:00 PM a 12:00 AM\n' +
                    '🕓 Viernes a Domingo: 4:00 PM a 12:00 AM';
            } else {
                horarioMsg =
                    '🕓 Nuestro horario de atención es:\n' +
                    'Viernes a Domingo, de 4:00 PM a 12:00 AM';
            }

            var continuar = confirm(
                '⚠️ Actualmente estamos CERRADOS.\n\n' +
                horarioMsg + '\n\n' +
                'Tu pedido podría NO ser atendido hasta que abramos.\n\n' +
                '¿Deseas enviarlo de todas formas?'
            );
            if (!continuar) return;
        }

        if (cart.length === 0) {
            showToast('Agrega productos al carrito primero.', 'warning');
            return;
        }

        // Validate & sanitize fields
        var nombreRaw  = document.getElementById('del-nombre').value;
        var barrioRaw  = document.getElementById('del-barrio').value;
        var dirRaw     = document.getElementById('del-dir').value;
        var refRaw     = document.getElementById('del-ref').value;
        var telRaw     = document.getElementById('del-telefono').value;
        var pago       = document.getElementById('del-pago').value;

        var nombre  = sanitizeInput(nombreRaw, 60);
        var barrio  = sanitizeInput(barrioRaw, 80);
        var dir     = sanitizeInput(dirRaw, 150);
        var ref     = sanitizeInput(refRaw, 150);
        var tel     = sanitizeInput(telRaw, 15).replace(/[^0-9+\-() ]/g, '');

        // Shake & highlight empty required fields
        var hasErrors = false;
        function markField(id, valid) {
            var el = document.getElementById(id);
            if (!el) return;
            el.classList.remove('input-error', 'input-ok');
            if (!valid) {
                el.classList.add('input-error');
                // Reset after animation
                setTimeout(function() { el.classList.remove('input-error'); }, 600);
                hasErrors = true;
            } else {
                el.classList.add('input-ok');
            }
        }

        markField('del-nombre', nombre.length > 0);
        markField('del-barrio', barrio.length > 0);
        markField('del-dir', dir.length > 0);

        if (!nombre) {
            showToast('Por favor, escribe tu nombre.', 'error');
            document.getElementById('del-nombre').focus();
            return;
        }

        if (!barrio || !dir) {
            showToast('Indica el Barrio y la Dirección de entrega.', 'error');
            if (!barrio) document.getElementById('del-barrio').focus();
            else document.getElementById('del-dir').focus();
            return;
        }

        if (!pago) {
            showToast('Selecciona un Método de Pago.', 'error');
            document.getElementById('payment-options').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
        }

        // Build WhatsApp message
        var msg = '🍔 *NUEVO PEDIDO — BEL BURGER*\n';
        msg += '━━━━━━━━━━━━━━━━━━━━━\n\n';
        msg += '👤 *CLIENTE*\n';
        msg += '▸ *Nombre:* ' + nombre + '\n';
        if (tel) msg += '▸ *Teléfono:* ' + tel + '\n';
        msg += '\n';
        msg += '📍 *DATOS DE ENTREGA*\n\n';
        msg += '▸ *Barrio:* ' + barrio + '\n';
        msg += '▸ *Dirección:* ' + dir + '\n';
        if (ref) msg += '▸ *Referencia:* ' + ref + '\n';
        msg += '▸ *Pago:* ' + pago + '\n\n';
        msg += '━━━━━━━━━━━━━━━━━━━━━\n\n';

        var total = 0;
        for (var i = 0; i < cart.length; i++) {
            var sub = cart[i].price * cart[i].quantity;
            total += sub;
            msg += '*' + (i + 1) + '. ' + cart[i].name + '*\n';
            msg += '▸ Cantidad: ' + cart[i].quantity + '\n';
            if (cart[i].notes) {
                msg += '▸ *Notas:* ' + cart[i].notes + '\n';
            }
            msg += '▸ Subtotal: ' + fmt.format(sub) + '\n\n';
        }

        msg += '━━━━━━━━━━━━━━━━━━━━━\n';
        msg += '💰 *TOTAL: ' + fmt.format(total) + '*\n\n';
        msg += '¡Por favor confirmen mi pedido! 🙏';

        var btn = document.getElementById('checkout-btn');
        var originalHTML = btn.innerHTML;
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Conectando...';
        btn.disabled = true;

        // Native form submit — iOS Safari compatible
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = '/api/whatsapp';
        form.target = '_blank';
        form.style.display = 'none';

        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'message';
        input.value = msg;

        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();

        setTimeout(function() {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            if (form.parentNode) document.body.removeChild(form);
            showToast('¡Pedido enviado! Revisa WhatsApp.', 'success', 3500);
        }, 1200);
    });
}

// --- Init Everything ---
document.addEventListener('DOMContentLoaded', function () {
    // Render cards (shows skeleton first, then reveals)
    renderCards();

    // Render adicionales section
    renderAdicionales();

    // Update cart display
    updateCartUI();

    // Cart open/close events
    document.getElementById('cart-toggle').addEventListener('click', openCart);
    document.getElementById('cart-close').addEventListener('click', closeCart);
    document.getElementById('cart-overlay').addEventListener('click', closeCart);

    // Escape key closes modals
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            var modal = document.getElementById('product-modal-window');
            if (modal && modal.classList.contains('open')) {
                closeProductModal();
            } else {
                closeCart();
            }
        }
    });

    // Scroll effects
    initScroll();

    // TrueFocus text
    initTrueFocus();

    // Product Modal
    initProductModal();

    // WhatsApp checkout
    initCheckout();

    // Geolocation
    initGeoLocation();

    // Store Status
    initStoreStatus();
});
