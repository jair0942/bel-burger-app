/* ===========================================
   BEL BURGER — App Logic
   Cards · Cart · WhatsApp · Scroll Effects
   =========================================== */

// --- Products (Menú real BEL BURGER) ---
var products = [
    {
        id: 1,
        name: "Hamburguesa BEL Tradicional",
        desc: "Pan artesanal, carne de la casa, salsa de la casa, mermelada de tocineta, queso cheddar, lechuga crespa, pepinillos y cebolla crispy. (+Papas)",
        price: 23000,
        img: "img-classic.png",
        tag: "Hamburguesa"
    },
    {
        id: 2,
        name: "Perro BEL Tradicional",
        desc: "Pan artesanal, salchicha americana, salsa de la casa, queso mozzarella, mermelada de tocineta y tocineta crunchy. (+Papas)",
        price: 18000,
        img: "perro_tradicional.png",
        tag: "Perro"
    },
    {
        id: 3,
        name: "Salchipapa BEL Sencilla",
        desc: "Papas a la francesa, salsa de la casa, salsa de piña, salsa tártara, queso costeño, salchicha, tocineta crunchy.",
        price: 14000,
        img: "salchipapa_sencilla.png",
        tag: "Salchipapa"
    },
    {
        id: 4,
        name: "Salchipapa BEL Tradicional",
        desc: "Papas a la francesa, salsa de la casa, salsa de piña, salsa tártara, queso costeño, salchicha, queso mozzarella, tocineta crunchy + cebolla crispy.",
        price: 20000,
        img: "salchipapa_tradicional.png",
        tag: "Salchipapa"
    }
];

// --- Formatter ---
const fmt = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

// --- State ---
let cart = [];

// --- Render Product Cards ---
function renderCards() {
    const grid = document.getElementById('cards-grid');
    if (!grid) return;

    products.forEach(function (p) {
        // Card container
        var card = document.createElement('div');
        card.className = 'product-card';

        // Image box
        var imgBox = document.createElement('div');
        imgBox.className = 'card-img-box';

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

        card.appendChild(imgBox);

        // Body
        var body = document.createElement('div');
        body.className = 'card-body';

        var name = document.createElement('h3');
        name.className = 'card-name';
        name.textContent = p.name;
        body.appendChild(name);

        var desc = document.createElement('p');
        desc.className = 'card-desc';
        desc.textContent = p.desc;
        body.appendChild(desc);

        // Bottom row
        var bottom = document.createElement('div');
        bottom.className = 'card-bottom';

        var price = document.createElement('span');
        price.className = 'card-price';
        price.textContent = fmt.format(p.price);
        bottom.appendChild(price);

        var controls = document.createElement('div');
        controls.className = 'card-controls';

        // Qty
        var qtyBox = document.createElement('div');
        qtyBox.className = 'qty-box';

        var minus = document.createElement('button');
        minus.className = 'qty-btn';
        minus.textContent = '−';
        minus.type = 'button';

        var numSpan = document.createElement('span');
        numSpan.className = 'qty-num';
        numSpan.textContent = '1';

        var plus = document.createElement('button');
        plus.className = 'qty-btn';
        plus.textContent = '+';
        plus.type = 'button';

        var qty = 1;
        minus.addEventListener('click', function () {
            if (qty > 1) { qty--; numSpan.textContent = qty; }
        });
        plus.addEventListener('click', function () {
            qty++;
            numSpan.textContent = qty;
        });

        qtyBox.appendChild(minus);
        qtyBox.appendChild(numSpan);
        qtyBox.appendChild(plus);
        controls.appendChild(qtyBox);

        // Add button
        var addBtn = document.createElement('button');
        addBtn.className = 'add-btn';
        addBtn.textContent = 'Agregar';
        addBtn.type = 'button';

        addBtn.addEventListener('click', function () {
            addToCart(p.id, qty);
            addBtn.classList.add('done');
            addBtn.textContent = '¡Listo!';
            setTimeout(function () {
                addBtn.classList.remove('done');
                addBtn.textContent = 'Agregar';
            }, 1200);
        });

        controls.appendChild(addBtn);
        bottom.appendChild(controls);
        body.appendChild(bottom);
        card.appendChild(body);
        grid.appendChild(card);
    });
}

// --- Cart Logic ---
function addToCart(id, qty) {
    var product = null;
    for (var i = 0; i < products.length; i++) {
        if (products[i].id === id) { product = products[i]; break; }
    }
    if (!product) return;

    var existing = null;
    for (var j = 0; j < cart.length; j++) {
        if (cart[j].id === id) { existing = cart[j]; break; }
    }

    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: qty });
    }

    updateCartUI();

    // Badge pop
    var badge = document.getElementById('cart-count');
    if (badge) {
        badge.classList.remove('pop');
        badge.offsetWidth; // reflow
        badge.classList.add('pop');
    }
}

function removeFromCart(id) {
    var newCart = [];
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id !== id) newCart.push(cart[i]);
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

            var priceDiv = document.createElement('div');
            priceDiv.className = 'cart-item-price';
            priceDiv.textContent = fmt.format(sub);
            info.appendChild(priceDiv);

            row.appendChild(info);

            var del = document.createElement('button');
            del.className = 'item-del';
            del.textContent = '✕';
            del.type = 'button';
            (function (itemId) {
                del.addEventListener('click', function () { removeFromCart(itemId); });
            })(item.id);

            row.appendChild(del);
            listEl.appendChild(row);
        }
    }

    totalEl.textContent = fmt.format(totalPrice);
}

// --- Cart Panel Open/Close ---
function openCart() {
    document.getElementById('cart-panel').classList.add('open');
    document.getElementById('cart-overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    document.getElementById('cart-panel').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('show');
    document.body.style.overflow = '';
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

// --- WhatsApp Checkout ---
function initCheckout() {
    document.getElementById('checkout-btn').addEventListener('click', function () {
        if (cart.length === 0) {
            alert('Agrega productos al carrito primero.');
            return;
        }

        var msg = '🍔 *NUEVO PEDIDO — BEL BURGER*\n';
        msg += '━━━━━━━━━━━━━━━━━━━━━\n';

        var total = 0;
        for (var i = 0; i < cart.length; i++) {
            var sub = cart[i].price * cart[i].quantity;
            total += sub;
            msg += '▸ ' + cart[i].quantity + 'x ' + cart[i].name + ' — ' + fmt.format(sub) + '\n';
        }

        msg += '━━━━━━━━━━━━━━━━━━━━━\n';
        msg += '💰 *TOTAL: ' + fmt.format(total) + '*\n\n';
        msg += '¡Por favor confirmen mi pedido! 🙏';

        var btn = document.getElementById('checkout-btn');
        var originalText = btn.innerHTML;
        btn.innerHTML = 'Conectando...';
        btn.disabled = true;

        // Apple/Safari en iPhone restringe enlaces a apps (como WhatsApp) 
        // si se generan mediante 'fetch'. Para saltarnos ese bloqueo con un 100% 
        // de éxito, simulamos subir un formulario nativo:
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = '/api/whatsapp';
        // 'target="_blank"' le indica al teléfono que dedique una nueva pestaña 
        // temporal que brincará directo a WhatsApp.
        form.target = '_blank';
        form.style.display = 'none';

        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'message';
        input.value = msg;

        form.appendChild(input);
        document.body.appendChild(form);
        
        // Ejecución nativa instantánea (Safari confía en esto)
        form.submit();

        // Limpiamos el botón
        setTimeout(function() {
            btn.innerHTML = originalText;
            btn.disabled = false;
            document.body.removeChild(form);
        }, 1000);
    });
}

// --- Init Everything ---
document.addEventListener('DOMContentLoaded', function () {
    // Render cards first
    renderCards();

    // Update cart display
    updateCartUI();

    // Cart open/close events
    document.getElementById('cart-toggle').addEventListener('click', openCart);
    document.getElementById('cart-close').addEventListener('click', closeCart);
    document.getElementById('cart-overlay').addEventListener('click', closeCart);

    // Escape key closes cart
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeCart();
    });

    // Scroll effects
    initScroll();

    // TrueFocus text
    initTrueFocus();

    // WhatsApp checkout
    initCheckout();
});
