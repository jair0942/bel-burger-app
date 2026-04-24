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
        img: "img-classic.webp",
        tag: "Hamburguesa"
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
function initStoreStatus() {
    function updateStatus() {
        // Obtenemos la hora estricta de Colombia, sin importar dónde esté el cliente
        const bogotaTimeStr = new Date().toLocaleString("en-US", { timeZone: "America/Bogota" });
        const now = new Date(bogotaTimeStr);
        
        const day = now.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
        const hour = now.getHours();

        // Open Friday to Sunday, 16:00 to 23:59 (4 PM to 12 AM)
        if ((day === 5 || day === 6 || day === 0) && hour >= 16 && hour < 24) {
            isStoreOpen = true;
        } else {
            isStoreOpen = false;
        }

        const badge = document.getElementById('store-status-badge');
        const statusText = document.getElementById('status-text');

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
    const grid = document.getElementById('cards-grid');
    if (!grid) return;

    products.forEach(function (p) {
        // Card container
        var card = document.createElement('div');
        card.className = 'product-card';

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

        card.appendChild(imgBox);

        // Body
        var body = document.createElement('div');
        body.className = 'card-body';
        body.style.cursor = 'pointer';
        body.addEventListener('click', function (e) {
            // Prevent double-triggering if they click the button
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
}

// --- Cart Logic ---
function addToCart(id, qty, notes) {
    notes = (notes || '').trim();
    var product = null;
    for (var i = 0; i < products.length; i++) {
        if (products[i].id === id) { product = products[i]; break; }
    }
    if (!product) return;

    var existing = null;
    for (var j = 0; j < cart.length; j++) {
        if (cart[j].id === id && cart[j].notes === notes) { existing = cart[j]; break; }
    }

    if (existing) {
        existing.quantity += qty;
    } else {
        var cartItemId = Date.now().toString() + Math.random().toString();
        cart.push({ cartItemId: cartItemId, id: product.id, name: product.name, price: product.price, quantity: qty, notes: notes });
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

// --- Product Modal Logic ---
let pmQty = 1;
let currentProduct = null;

function openProductModal(p) {
    currentProduct = p;
    pmQty = 1;

    document.getElementById('pm-img').src = p.img;
    document.getElementById('pm-img').alt = p.name;
    document.getElementById('pm-tag').textContent = p.tag;
    document.getElementById('pm-name').textContent = p.name;
    document.getElementById('pm-desc').textContent = p.desc;
    document.getElementById('pm-price').textContent = fmt.format(p.price);
    document.getElementById('pm-notes').value = '';
    document.getElementById('pm-num').textContent = pmQty;

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
        if (pmQty > 1) { pmQty--; document.getElementById('pm-num').textContent = pmQty; }
    });
    document.getElementById('pm-plus').addEventListener('click', function() {
        pmQty++; document.getElementById('pm-num').textContent = pmQty;
    });

    document.getElementById('pm-add').addEventListener('click', function() {
        if (!currentProduct) return;
        var notes = document.getElementById('pm-notes').value.trim();
        addToCart(currentProduct.id, pmQty, notes);
        
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

    btn.addEventListener('click', function() {
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta ubicación automática.");
            return;
        }

        var origText = btn.innerHTML;
        btn.innerHTML = 'Ubicando...';
        btn.disabled = true;

        navigator.geolocation.getCurrentPosition(function(pos) {
            var lat = pos.coords.latitude;
            var lon = pos.coords.longitude;

            // Reverse Geocoding usando Nominatim (100% Gratis, privado y sin API Key)
            fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lon)
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    var address = data.address;
                    if(address) {
                        var barrio = address.neighbourhood || address.suburb || address.city_district || "";
                        var calle = address.road || "";
                        var numero = address.house_number || "";
                        var combinedDir = calle + (numero ? " #" + numero : "");
                        
                        document.getElementById('del-barrio').value = barrio;
                        document.getElementById('del-dir').value = combinedDir;
                    }
                    btn.innerHTML = '¡Ubicación aplicada!';
                    setTimeout(function() {
                        btn.innerHTML = origText;
                        btn.disabled = false;
                    }, 2000);
                })
                .catch(function() {
                    alert("Error al mapear la ubicación. Por favor escríbela a mano.");
                    btn.innerHTML = origText;
                    btn.disabled = false;
                });
        }, function() {
            alert("Permiso de GPS denegado. Puedes escribir la dirección a mano.");
            btn.innerHTML = origText;
            btn.disabled = false;
        });
    });
}

// --- WhatsApp Checkout ---
function initCheckout() {
    document.getElementById('checkout-btn').addEventListener('click', function () {
        if (!isStoreOpen) {
            var continuar = confirm(
                '⚠️ Actualmente estamos CERRADOS.\n\n' +
                'Nuestro horario de atención es:\n' +
                '🕓 Viernes a Domingo, de 4:00 PM a 12:00 AM\n\n' +
                'Tu pedido podría NO ser atendido hasta que abramos.\n\n' +
                '¿Deseas enviarlo de todas formas?'
            );
            if (!continuar) return;
        }

        if (cart.length === 0) {
            alert('Agrega productos al carrito primero.');
            return;
        }

        var barrio = document.getElementById('del-barrio').value.trim();
        var dir = document.getElementById('del-dir').value.trim();
        var ref = document.getElementById('del-ref').value.trim();
        var pago = document.getElementById('del-pago').value;

        if (!barrio || !dir) {
            alert('Por favor, indica un Barrio y una Dirección de entrega antes de pedir.');
            return;
        }

        if (!pago) {
            alert('Por favor, selecciona un Método de Pago antes de pedir.');
            return;
        }

        var msg = '🍔 *NUEVO PEDIDO — BEL BURGER*\n';
        msg += '━━━━━━━━━━━━━━━━━━━━━\n\n';
        msg += '📍 *DATOS DE ENTREGA*\n\n';
        msg += '▸ *Barrio:* ' + barrio + '\n';
        msg += '▸ *Dirección:* ' + dir + '\n';
        if (ref) {
            msg += '▸ *Referencia:* ' + ref + '\n';
        }
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

    // Product Modal
    initProductModal();

    // WhatsApp checkout
    initCheckout();

    // Geolocation
    initGeoLocation();

    // Store Status
    initStoreStatus();
});
