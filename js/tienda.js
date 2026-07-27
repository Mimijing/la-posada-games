/* =========================================================
   TIENDA DINÁMICA — LA POSADA GAMES AND DRINKS

   Tabla utilizada:
   public.tienda

   El carrito se guarda en localStorage.
   El pedido final se envía por WhatsApp.
   ========================================================= */

(() => {
    "use strict";

    const FALLBACK_IMAGE = "../img/logo.png";
    const WHATSAPP_NUMBER = "59173724060";
    const CART_STORAGE_KEY = "la-posada-shop-cart";
    const PRODUCTS_PER_PAGE = 12;
    const LOW_STOCK_LIMIT = 3;

    const state = {
        products: [],
        visibleProducts: [],
        cart: [],
        currentPage: 1,
        selectedProductId: null,
        selectedProductImages: [],
        selectedImageIndex: 0,
        dialogTouchStartX: 0
    };

    const elements = {};
    let toastTimer = null;

    document.addEventListener("DOMContentLoaded", initializeShop);

    function initializeShop() {
        ensureProductDialog();

        elements.search = document.getElementById("shop-search");
        elements.type = document.getElementById("shop-type");
        elements.difficulty = document.getElementById("shop-difficulty");
        elements.availability = document.getElementById("shop-availability");
        elements.reset = document.getElementById("shop-reset-button");

        elements.grid = document.getElementById("shop-grid");
        elements.status = document.getElementById("shop-status");
        elements.count = document.getElementById("shop-count");
        elements.pagination = document.getElementById("shop-pagination");

        elements.cart = document.getElementById("shop-cart");
        elements.cartButton = document.getElementById("shop-cart-button");
        elements.cartCount = document.getElementById("shop-cart-count");
        elements.cartItems = document.getElementById("shop-cart-items");
        elements.cartEmpty = document.getElementById("shop-cart-empty");
        elements.cartTotal = document.getElementById("shop-cart-total");
        elements.cartClear = document.getElementById("shop-cart-clear");
        elements.cartWhatsApp = document.getElementById("shop-cart-whatsapp");
        elements.toast = document.getElementById("shop-toast");

        elements.dialog = document.getElementById("shop-game-dialog");
        elements.dialogImage = document.getElementById("shop-dialog-image");
        elements.dialogPrevious = document.getElementById("shop-dialog-previous");
        elements.dialogNext = document.getElementById("shop-dialog-next");
        elements.dialogCounter = document.getElementById("shop-dialog-counter");
        elements.dialogThumbnails = document.getElementById("shop-dialog-thumbnails");
        elements.dialogType = document.getElementById("shop-dialog-type");
        elements.dialogAvailability = document.getElementById("shop-dialog-availability");
        elements.dialogTitle = document.getElementById("shop-dialog-title");
        elements.dialogDescription = document.getElementById("shop-dialog-description");
        elements.dialogPlayers = document.getElementById("shop-dialog-players");
        elements.dialogDuration = document.getElementById("shop-dialog-duration");
        elements.dialogDifficulty = document.getElementById("shop-dialog-difficulty");
        elements.dialogStock = document.getElementById("shop-dialog-stock");
        elements.dialogPrice = document.getElementById("shop-dialog-price");
        elements.dialogAdd = document.getElementById("shop-dialog-add");

        restoreCart();
        bindEvents();
        renderCart();
        loadProducts();
    }

    function bindEvents() {
        const filterElements = [
            elements.search,
            elements.type,
            elements.difficulty,
            elements.availability
        ];

        filterElements.forEach((element) => {
            element.addEventListener(
                element.tagName === "INPUT" ? "input" : "change",
                applyFilters
            );
        });

        elements.reset.addEventListener("click", resetFilters);
        elements.cartButton.addEventListener("click", openCart);
        elements.cartClear.addEventListener("click", clearCart);

        document.querySelectorAll("[data-close-cart]").forEach((button) => {
            button.addEventListener("click", closeCart);
        });

        document.querySelectorAll("[data-close-shop-dialog]").forEach((button) => {
            button.addEventListener("click", closeProductDialog);
        });

        elements.dialogPrevious.addEventListener("click", () => {
            showPreviousDialogImage();
        });

        elements.dialogNext.addEventListener("click", () => {
            showNextDialogImage();
        });

        elements.dialogImage.addEventListener("touchstart", (event) => {
            state.dialogTouchStartX =
                event.changedTouches[0]?.clientX || 0;
        }, { passive: true });

        elements.dialogImage.addEventListener("touchend", (event) => {
            const touchEndX =
                event.changedTouches[0]?.clientX || 0;

            const difference = touchEndX - state.dialogTouchStartX;

            if (Math.abs(difference) < 45) {
                return;
            }

            if (difference > 0) {
                showPreviousDialogImage();
            } else {
                showNextDialogImage();
            }
        }, { passive: true });

        elements.dialogAdd.addEventListener("click", () => {
            if (!state.selectedProductId) {
                return;
            }

            addToCart(state.selectedProductId);
            closeProductDialog();
            openCart();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") {
                return;
            }

            if (!elements.dialog.hidden) {
                closeProductDialog();
                return;
            }

            if (!elements.cart.hidden) {
                closeCart();
            }
        });
    }

    async function loadProducts() {
        if (
            !window.laPosadaSupabaseReady ||
            !window.laPosadaSupabase
        ) {
            showConfigurationMessage();
            return;
        }

        showStatus(
            "loading",
            "Consultando la tienda en Supabase..."
        );

        const { data, error } =
            await window.laPosadaSupabase
                .from("tienda")
                .select(
                    "id,nombre,tipo,descripcion,jugadores_min,jugadores_max,dificultad,duracion_minutos,precio,stock,foto_url,tienda_imagenes(id,imagen_url,orden)"
                )
                .order("nombre", { ascending: true });

        if (error) {
            console.error("Error al cargar la tienda:", error);

            showStatus(
                "error",
                "No se pudo cargar la tienda. Revisa la tabla tienda y sus políticas RLS."
            );

            elements.count.textContent = "Error al cargar";
            return;
        }

        state.products = Array.isArray(data)
            ? data.map(normalizeProduct)
            : [];

        synchronizeCartWithStock();
        applyFilters();
        renderCart();
    }

    function normalizeProduct(product) {
        const extraImages = Array.isArray(product.tienda_imagenes)
            ? [...product.tienda_imagenes]
                .sort(
                    (a, b) =>
                        (Number(a.orden) || 0) -
                        (Number(b.orden) || 0)
                )
                .map((item) => item.imagen_url)
                .filter(Boolean)
            : [];

        const images = [
            product.foto_url,
            ...extraImages
        ]
            .filter((url) => typeof url === "string" && url.trim())
            .map((url) => url.trim())
            .filter((url, index, list) => list.indexOf(url) === index)
            .slice(0, 5);

        if (images.length === 0) {
            images.push(FALLBACK_IMAGE);
        }

        return {
            ...product,
            id: String(product.id),
            precio: Number(product.precio) || 0,
            stock: Math.max(0, Number(product.stock) || 0),
            jugadores_min: Number(product.jugadores_min) || 0,
            jugadores_max: Number(product.jugadores_max) || 0,
            duracion_minutos: Number(product.duracion_minutos) || 0,
            images
        };
    }

    function applyFilters() {
        const query = normalizeText(elements.search.value);
        const type = elements.type.value;
        const difficulty = elements.difficulty.value;
        const availability = elements.availability.value;

        state.visibleProducts =
            state.products.filter((product) => {
                const searchable = normalizeText(
                    [
                        product.nombre,
                        product.tipo,
                        product.descripcion
                    ].join(" ")
                );

                const matchesQuery =
                    !query || searchable.includes(query);

                const matchesType =
                    !type || product.tipo === type;

                const matchesDifficulty =
                    !difficulty ||
                    product.dificultad === difficulty;

                const matchesAvailability =
                    !availability ||
                    getAvailabilityKey(product.stock) === availability;

                return (
                    matchesQuery &&
                    matchesType &&
                    matchesDifficulty &&
                    matchesAvailability
                );
            });

        state.currentPage = 1;
        renderProducts();
    }

    function resetFilters() {
        elements.search.value = "";
        elements.type.value = "";
        elements.difficulty.value = "";
        elements.availability.value = "";

        applyFilters();
    }

    function renderProducts() {
        elements.grid.replaceChildren();

        const total = state.visibleProducts.length;

        elements.count.textContent =
            total === 1
                ? "1 juego"
                : `${total} juegos`;

        if (total === 0) {
            elements.pagination.hidden = true;
            elements.pagination.replaceChildren();

            showStatus(
                "empty",
                state.products.length === 0
                    ? "Todavía no hay juegos registrados para la venta."
                    : "No encontramos juegos con esos filtros."
            );

            return;
        }

        hideStatus();

        const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);

        if (state.currentPage > totalPages) {
            state.currentPage = totalPages;
        }

        const start =
            (state.currentPage - 1) * PRODUCTS_PER_PAGE;

        const productsOnPage =
            state.visibleProducts.slice(
                start,
                start + PRODUCTS_PER_PAGE
            );

        const fragment = document.createDocumentFragment();

        productsOnPage.forEach((product) => {
            fragment.appendChild(createProductCard(product));
        });

        elements.grid.appendChild(fragment);
        renderPagination(totalPages);
    }

    function createProductCard(product) {
        const article = document.createElement("article");
        article.className = "shop-card";
        article.tabIndex = 0;
        article.setAttribute("role", "button");
        article.setAttribute(
            "aria-label",
            `Ver detalles de ${product.nombre || "este juego"}`
        );

        const imageWrap = document.createElement("div");
        imageWrap.className = "shop-card__image-wrap";

        const image = createImage(
            product.foto_url,
            product.nombre
                ? `Juego ${product.nombre}`
                : "Juego de mesa",
            "shop-card__image"
        );

        const availabilityKey = getAvailabilityKey(product.stock);

        const availability = document.createElement("span");
        availability.className =
            `shop-card__availability shop-card__availability--${availabilityKey}`;
        availability.textContent = getAvailabilityLabel(product.stock);

        const stock = document.createElement("span");
        stock.className = "shop-card__stock";
        stock.textContent =
            product.stock === 1
                ? "Stock: 1 unidad"
                : `Stock: ${product.stock} unidades`;

        imageWrap.append(image, availability, stock);

        const content = document.createElement("div");
        content.className = "shop-card__content";

        const difficulty = document.createElement("span");
        difficulty.className =
            `shop-card__difficulty shop-card__difficulty--${difficultyClass(product.dificultad)}`;
        difficulty.textContent = product.dificultad || "Sin nivel";

        const title = document.createElement("h3");
        title.textContent = product.nombre || "Juego sin nombre";

        const metadata = document.createElement("div");
        metadata.className = "shop-card__metadata";
        metadata.append(
            createMetadata("groups", formatPlayers(product)),
            createMetadata("timer", formatDuration(product.duracion_minutos))
        );

        const description = document.createElement("p");
        description.className = "shop-card__description";
        description.textContent =
            product.descripcion ||
            "Este pergamino todavía no tiene una descripción.";

        const purchase = document.createElement("div");
        purchase.className = "shop-card__purchase";

        const priceRow = document.createElement("div");
        priceRow.className = "shop-card__price-row";

        const priceLabel = document.createElement("span");
        priceLabel.textContent = "Precio";

        const price = document.createElement("strong");
        price.className = "shop-card__price";
        price.textContent = formatPrice(product.precio);

        priceRow.append(priceLabel, price);

        const button = document.createElement("button");
        button.className = "shop-card__button";
        button.type = "button";
        button.innerHTML = `
            <span>Abrir pergamino</span>
            <span class="material-symbols-outlined" aria-hidden="true">menu_book</span>
        `;

        button.addEventListener("click", (event) => {
            event.stopPropagation();
            openProductDialog(product);
        });

        purchase.append(priceRow, button);
        content.append(
            difficulty,
            title,
            metadata,
            description,
            purchase
        );

        article.append(imageWrap, content);

        article.addEventListener("click", () => {
            openProductDialog(product);
        });

        article.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openProductDialog(product);
            }
        });

        return article;
    }

    function createMetadata(iconName, text) {
        const item = document.createElement("span");

        const icon = document.createElement("span");
        icon.className = "material-symbols-outlined";
        icon.textContent = iconName;
        icon.setAttribute("aria-hidden", "true");

        item.append(icon, document.createTextNode(text));
        return item;
    }

    function difficultyClass(value) {
        const normalized = normalizeText(value);

        if (normalized === "principiante") {
            return "principiante";
        }

        if (normalized === "conocedor") {
            return "conocedor";
        }

        if (normalized === "sabio") {
            return "sabio";
        }

        return "neutral";
    }

    function openProductDialog(product) {
        state.selectedProductId = product.id;
        state.selectedProductImages =
            Array.isArray(product.images) && product.images.length > 0
                ? [...product.images]
                : [product.foto_url || FALLBACK_IMAGE];
        state.selectedImageIndex = 0;

        renderDialogCarousel();

        elements.dialogType.textContent =
            product.tipo || "Juego de mesa";

        const availabilityKey = getAvailabilityKey(product.stock);
        elements.dialogAvailability.className =
            `shop-game-dialog__availability shop-game-dialog__availability--${availabilityKey}`;
        elements.dialogAvailability.textContent =
            getAvailabilityLabel(product.stock);

        elements.dialogTitle.textContent =
            product.nombre || "Juego sin nombre";
        elements.dialogDescription.textContent =
            product.descripcion ||
            "Este juego todavía no tiene una descripción.";
        elements.dialogPlayers.textContent = formatPlayers(product);
        elements.dialogDuration.textContent =
            formatDuration(product.duracion_minutos);
        elements.dialogDifficulty.textContent =
            product.dificultad || "Sin nivel";
        elements.dialogStock.textContent =
            product.stock === 1
                ? "1 unidad"
                : `${product.stock} unidades`;
        elements.dialogPrice.textContent = formatPrice(product.precio);

        elements.dialogAdd.disabled = product.stock <= 0;
        elements.dialogAdd.innerHTML = product.stock > 0
            ? '<span class="material-symbols-outlined" aria-hidden="true">shopping_bag</span><span>Añadir al pedido</span>'
            : '<span class="material-symbols-outlined" aria-hidden="true">block</span><span>Agotado</span>';

        elements.dialog.hidden = false;
        document.body.classList.add("shop-dialog-open");

        requestAnimationFrame(() => {
            elements.dialog.classList.add("shop-game-dialog--open");
            elements.dialog
                .querySelector(".shop-game-dialog__close")
                ?.focus();
        });
    }

    function renderDialogCarousel() {
        const images = state.selectedProductImages;
        const total = images.length;

        if (state.selectedImageIndex >= total) {
            state.selectedImageIndex = 0;
        }

        const currentUrl =
            images[state.selectedImageIndex] || FALLBACK_IMAGE;

        elements.dialogImage.src = currentUrl;
        elements.dialogImage.alt =
            `Imagen ${state.selectedImageIndex + 1} del juego`;
        elements.dialogImage.onerror = () => {
            elements.dialogImage.src = FALLBACK_IMAGE;
        };

        const hasMultiple = total > 1;

        elements.dialogPrevious.hidden = !hasMultiple;
        elements.dialogNext.hidden = !hasMultiple;
        elements.dialogCounter.hidden = !hasMultiple;
        elements.dialogThumbnails.hidden = !hasMultiple;

        elements.dialogCounter.textContent =
            `${state.selectedImageIndex + 1} / ${total}`;

        elements.dialogThumbnails.replaceChildren();

        if (!hasMultiple) {
            return;
        }

        const fragment = document.createDocumentFragment();

        images.forEach((url, index) => {
            const button = document.createElement("button");
            button.className = "shop-game-dialog__thumbnail";
            button.type = "button";
            button.setAttribute(
                "aria-label",
                `Ver imagen ${index + 1}`
            );

            if (index === state.selectedImageIndex) {
                button.classList.add(
                    "shop-game-dialog__thumbnail--active"
                );
                button.setAttribute("aria-current", "true");
            }

            const image = document.createElement("img");
            image.src = url;
            image.alt = "";
            image.addEventListener("error", () => {
                image.src = FALLBACK_IMAGE;
            }, { once: true });

            button.appendChild(image);
            button.addEventListener("click", () => {
                state.selectedImageIndex = index;
                renderDialogCarousel();
            });

            fragment.appendChild(button);
        });

        elements.dialogThumbnails.appendChild(fragment);
    }

    function showPreviousDialogImage() {
        const total = state.selectedProductImages.length;

        if (total <= 1) {
            return;
        }

        state.selectedImageIndex =
            state.selectedImageIndex - 1 < 0
                ? total - 1
                : state.selectedImageIndex - 1;

        renderDialogCarousel();
    }

    function showNextDialogImage() {
        const total = state.selectedProductImages.length;

        if (total <= 1) {
            return;
        }

        state.selectedImageIndex =
            state.selectedImageIndex + 1 >= total
                ? 0
                : state.selectedImageIndex + 1;

        renderDialogCarousel();
    }

    function closeProductDialog() {
        if (!elements.dialog || elements.dialog.hidden) {
            return;
        }

        elements.dialog.classList.remove("shop-game-dialog--open");
        document.body.classList.remove("shop-dialog-open");
        state.selectedProductId = null;
        state.selectedProductImages = [];
        state.selectedImageIndex = 0;

        window.setTimeout(() => {
            elements.dialog.hidden = true;
        }, 190);
    }

    function ensureProductDialog() {
        if (document.getElementById("shop-game-dialog")) {
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "shop-game-dialog";
        wrapper.id = "shop-game-dialog";
        wrapper.hidden = true;
        wrapper.innerHTML = `
            <button
                aria-label="Cerrar detalle"
                class="shop-game-dialog__backdrop"
                data-close-shop-dialog
                type="button"
            ></button>

            <section
                aria-labelledby="shop-dialog-title"
                aria-modal="true"
                class="shop-game-dialog__panel"
                role="dialog"
            >
                <button
                    aria-label="Cerrar detalle"
                    class="shop-game-dialog__close"
                    data-close-shop-dialog
                    type="button"
                >
                    <span class="material-symbols-outlined">close</span>
                </button>

                <div class="shop-game-dialog__image-wrap">
                    <div class="shop-game-dialog__carousel">
                        <img
                            alt=""
                            id="shop-dialog-image"
                            src="${FALLBACK_IMAGE}"
                        />

                        <button
                            aria-label="Imagen anterior"
                            class="shop-game-dialog__carousel-button shop-game-dialog__carousel-button--previous"
                            id="shop-dialog-previous"
                            type="button"
                        >
                            <span class="material-symbols-outlined">chevron_left</span>
                        </button>

                        <button
                            aria-label="Imagen siguiente"
                            class="shop-game-dialog__carousel-button shop-game-dialog__carousel-button--next"
                            id="shop-dialog-next"
                            type="button"
                        >
                            <span class="material-symbols-outlined">chevron_right</span>
                        </button>

                        <span
                            class="shop-game-dialog__counter"
                            id="shop-dialog-counter"
                        ></span>
                    </div>

                    <div
                        aria-label="Imágenes del juego"
                        class="shop-game-dialog__thumbnails"
                        id="shop-dialog-thumbnails"
                    ></div>

                    <div class="shop-game-dialog__image-shade"></div>
                    <span class="shop-game-dialog__type" id="shop-dialog-type"></span>
                    <span
                        class="shop-game-dialog__availability"
                        id="shop-dialog-availability"
                    ></span>
                </div>

                <div class="shop-game-dialog__content">
                    <p class="shop-game-dialog__kicker">Pergamino de venta</p>
                    <h2 id="shop-dialog-title"></h2>
                    <p
                        class="shop-game-dialog__description"
                        id="shop-dialog-description"
                    ></p>

                    <div class="shop-game-dialog__facts">
                        <div class="shop-game-dialog__fact">
                            <span class="material-symbols-outlined">groups</span>
                            <div>
                                <small>Jugadores</small>
                                <strong id="shop-dialog-players"></strong>
                            </div>
                        </div>

                        <div class="shop-game-dialog__fact">
                            <span class="material-symbols-outlined">timer</span>
                            <div>
                                <small>Duración</small>
                                <strong id="shop-dialog-duration"></strong>
                            </div>
                        </div>

                        <div class="shop-game-dialog__fact">
                            <span class="material-symbols-outlined">strategy</span>
                            <div>
                                <small>Dificultad</small>
                                <strong id="shop-dialog-difficulty"></strong>
                            </div>
                        </div>

                        <div class="shop-game-dialog__fact">
                            <span class="material-symbols-outlined">inventory_2</span>
                            <div>
                                <small>Stock</small>
                                <strong id="shop-dialog-stock"></strong>
                            </div>
                        </div>
                    </div>

                    <div class="shop-game-dialog__purchase">
                        <div>
                            <small>Precio</small>
                            <strong id="shop-dialog-price"></strong>
                        </div>

                        <button
                            class="shop-game-dialog__add"
                            id="shop-dialog-add"
                            type="button"
                        ></button>
                    </div>
                </div>
            </section>
        `;

        document.body.appendChild(wrapper);
    }

    function renderPagination(totalPages) {
        elements.pagination.replaceChildren();

        if (totalPages <= 1) {
            elements.pagination.hidden = true;
            return;
        }

        elements.pagination.hidden = false;

        elements.pagination.appendChild(
            createPaginationButton(
                "chevron_left",
                state.currentPage - 1,
                state.currentPage === 1,
                "Página anterior"
            )
        );

        for (let page = 1; page <= totalPages; page += 1) {
            const button = createPaginationButton(
                String(page),
                page,
                false,
                `Ir a la página ${page}`
            );

            if (page === state.currentPage) {
                button.classList.add(
                    "shop-pagination__button--active"
                );
                button.setAttribute("aria-current", "page");
            }

            elements.pagination.appendChild(button);
        }

        elements.pagination.appendChild(
            createPaginationButton(
                "chevron_right",
                state.currentPage + 1,
                state.currentPage === totalPages,
                "Página siguiente"
            )
        );
    }

    function createPaginationButton(
        content,
        page,
        disabled,
        label
    ) {
        const button = document.createElement("button");

        button.className = "shop-pagination__button";
        button.type = "button";
        button.disabled = disabled;
        button.setAttribute("aria-label", label);

        const isIcon =
            content === "chevron_left" ||
            content === "chevron_right";

        if (isIcon) {
            const icon = document.createElement("span");
            icon.className = "material-symbols-outlined";
            icon.textContent = content;
            icon.setAttribute("aria-hidden", "true");

            button.appendChild(icon);
        } else {
            button.textContent = content;
        }

        button.addEventListener("click", () => {
            if (disabled) {
                return;
            }

            state.currentPage = page;
            renderProducts();

            document
                .querySelector(".shop-results__header")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        });

        return button;
    }

    function addToCart(productId) {
        const product = findProduct(productId);

        if (!product || product.stock <= 0) {
            showToast("Este juego ya no tiene stock disponible.");
            return;
        }

        const cartItem =
            state.cart.find((item) => item.id === productId);

        const currentQuantity =
            cartItem ? cartItem.quantity : 0;

        if (currentQuantity >= product.stock) {
            showToast("Ya agregaste todas las unidades disponibles.");
            openCart();
            return;
        }

        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            state.cart.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                foto_url: product.foto_url || "",
                stock: product.stock,
                quantity: 1
            });
        }

        saveCart();
        renderCart();
        showToast(`${product.nombre} se agregó al pedido.`);
    }

    function updateCartQuantity(productId, change) {
        const item =
            state.cart.find((cartItem) => cartItem.id === productId);

        const product = findProduct(productId);

        if (!item) {
            return;
        }

        const stock =
            product ? product.stock : item.stock;

        const nextQuantity = item.quantity + change;

        if (nextQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        if (nextQuantity > stock) {
            showToast("No hay más unidades disponibles.");
            return;
        }

        item.quantity = nextQuantity;
        item.stock = stock;

        saveCart();
        renderCart();
    }

    function removeFromCart(productId) {
        state.cart =
            state.cart.filter((item) => item.id !== productId);

        saveCart();
        renderCart();
    }

    function clearCart() {
        if (state.cart.length === 0) {
            return;
        }

        state.cart = [];
        saveCart();
        renderCart();
        showToast("El carrito quedó vacío.");
    }

    function renderCart() {
        elements.cartItems.replaceChildren();

        const totalUnits =
            state.cart.reduce(
                (sum, item) => sum + item.quantity,
                0
            );

        const totalPrice =
            state.cart.reduce(
                (sum, item) =>
                    sum + item.precio * item.quantity,
                0
            );

        elements.cartCount.textContent = String(totalUnits);
        elements.cartTotal.textContent = formatPrice(totalPrice);

        const isEmpty = state.cart.length === 0;

        elements.cartEmpty.hidden = !isEmpty;
        elements.cartClear.disabled = isEmpty;

        if (isEmpty) {
            elements.cartWhatsApp.removeAttribute("href");
            elements.cartWhatsApp.setAttribute(
                "aria-disabled",
                "true"
            );
            return;
        }

        elements.cartWhatsApp.setAttribute(
            "href",
            buildWhatsAppLink(totalPrice)
        );
        elements.cartWhatsApp.setAttribute(
            "aria-disabled",
            "false"
        );

        const fragment = document.createDocumentFragment();

        state.cart.forEach((item) => {
            fragment.appendChild(createCartItem(item));
        });

        elements.cartItems.appendChild(fragment);
    }

    function createCartItem(item) {
        const article = document.createElement("article");
        article.className = "shop-cart-item";

        const image = createImage(
            item.foto_url,
            item.nombre,
            "shop-cart-item__image"
        );

        const body = document.createElement("div");
        body.className = "shop-cart-item__body";

        const title = document.createElement("h3");
        title.textContent = item.nombre;

        const subtotal = document.createElement("p");
        subtotal.textContent =
            `${formatPrice(item.precio)} c/u · ${formatPrice(item.precio * item.quantity)}`;

        const quantity = document.createElement("div");
        quantity.className = "shop-cart-item__quantity";

        const decrease = createQuantityButton(
            "remove",
            "Disminuir cantidad",
            () => updateCartQuantity(item.id, -1)
        );

        const number = document.createElement("span");
        number.textContent = String(item.quantity);

        const increase = createQuantityButton(
            "add",
            "Aumentar cantidad",
            () => updateCartQuantity(item.id, 1)
        );

        increase.disabled = item.quantity >= item.stock;

        quantity.append(decrease, number, increase);
        body.append(title, subtotal, quantity);

        const remove = document.createElement("button");
        remove.className = "shop-cart-item__remove";
        remove.type = "button";
        remove.setAttribute(
            "aria-label",
            `Eliminar ${item.nombre}`
        );

        const removeIcon = document.createElement("span");
        removeIcon.className = "material-symbols-outlined";
        removeIcon.textContent = "delete";

        remove.appendChild(removeIcon);
        remove.addEventListener("click", () => {
            removeFromCart(item.id);
        });

        article.append(image, body, remove);
        return article;
    }

    function createQuantityButton(iconName, label, handler) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "shop-cart-item__quantity-button";
        button.setAttribute("aria-label", label);
        button.textContent = iconName === "remove" ? "−" : "+";
        button.addEventListener("click", handler);

        return button;
    }

    function buildWhatsAppLink(totalPrice) {
        const lines = [
            "Hola, quisiera consultar por este pedido de juegos de La Posada:",
            ""
        ];

        state.cart.forEach((item) => {
            lines.push(
                `• ${item.quantity} x ${item.nombre} — ${formatPrice(item.precio)} c/u`
            );
        });

        lines.push(
            "",
            `Total estimado: ${formatPrice(totalPrice)}`,
            "",
            "¿Podrían confirmarme el stock y la forma de entrega o recojo?"
        );

        return (
            `https://wa.me/${WHATSAPP_NUMBER}` +
            `?text=${encodeURIComponent(lines.join("\n"))}`
        );
    }

    function openCart() {
        elements.cart.hidden = false;
        document.body.classList.add("shop-cart-open");
        elements.cartButton.setAttribute("aria-expanded", "true");

        requestAnimationFrame(() => {
            elements.cart.classList.add("shop-cart--open");
        });
    }

    function closeCart() {
        elements.cart.classList.remove("shop-cart--open");
        document.body.classList.remove("shop-cart-open");
        elements.cartButton.setAttribute("aria-expanded", "false");

        window.setTimeout(() => {
            elements.cart.hidden = true;
        }, 210);
    }

    function restoreCart() {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            const parsed = stored ? JSON.parse(stored) : [];

            state.cart = Array.isArray(parsed)
                ? parsed
                    .filter((item) => item && item.id)
                    .map((item) => ({
                        id: String(item.id),
                        nombre: String(item.nombre || "Juego"),
                        precio: Number(item.precio) || 0,
                        foto_url: String(item.foto_url || ""),
                        stock: Math.max(0, Number(item.stock) || 0),
                        quantity: Math.max(1, Number(item.quantity) || 1)
                    }))
                : [];
        } catch (error) {
            console.warn("No se pudo recuperar el carrito:", error);
            state.cart = [];
        }
    }

    function saveCart() {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(state.cart)
        );
    }

    function synchronizeCartWithStock() {
        state.cart =
            state.cart
                .map((item) => {
                    const product = findProduct(item.id);

                    if (!product || product.stock <= 0) {
                        return null;
                    }

                    return {
                        ...item,
                        nombre: product.nombre,
                        precio: product.precio,
                        foto_url: product.foto_url || "",
                        stock: product.stock,
                        quantity: Math.min(
                            item.quantity,
                            product.stock
                        )
                    };
                })
                .filter(Boolean);

        saveCart();
    }

    function findProduct(productId) {
        return state.products.find(
            (product) => product.id === String(productId)
        );
    }

    function getAvailabilityKey(stock) {
        if (stock <= 0) {
            return "out";
        }

        if (stock <= LOW_STOCK_LIMIT) {
            return "low";
        }

        return "available";
    }

    function getAvailabilityLabel(stock) {
        const key = getAvailabilityKey(stock);

        if (key === "out") {
            return "Agotado";
        }

        if (key === "low") {
            return "Últimas unidades";
        }

        return "Disponible";
    }

    function formatPlayers(product) {
        const min = product.jugadores_min;
        const max = product.jugadores_max;

        if (!min && !max) {
            return "Sin dato";
        }

        if (!max || min === max) {
            return `${min || max} jugadores`;
        }

        return `${min}–${max} jugadores`;
    }

    function formatDuration(minutes) {
        if (!minutes) {
            return "Sin dato";
        }

        return `${minutes} min`;
    }

    function formatPrice(value) {
        const price = Number(value);

        if (!Number.isFinite(price)) {
            return "Consultar";
        }

        return `Bs ${price.toLocaleString(
            "es-BO",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        )}`;
    }

    function createImage(url, alt, className) {
        const image = document.createElement("img");

        const hasPhoto =
            typeof url === "string" &&
            url.trim() !== "";

        image.className = className;
        image.src = hasPhoto
            ? url.trim()
            : FALLBACK_IMAGE;
        image.alt = alt;
        image.loading = "lazy";

        if (!hasPhoto) {
            image.classList.add(`${className}--fallback`);
        }

        image.addEventListener(
            "error",
            () => {
                image.src = FALLBACK_IMAGE;
                image.classList.add(
                    `${className}--fallback`
                );
            },
            { once: true }
        );

        return image;
    }

    function normalizeText(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function showConfigurationMessage() {
        elements.count.textContent = "Conexión pendiente";

        showStatus(
            "configuration",
            "Abre js/supabase-config.js y verifica la Project URL y la Publishable key."
        );
    }

    function showStatus(type, message) {
        elements.status.className =
            `shop-status shop-status--${type}`;

        elements.status.replaceChildren();

        if (type === "loading") {
            const loader = document.createElement("span");
            loader.className = "shop-loader";
            loader.setAttribute("aria-hidden", "true");

            elements.status.appendChild(loader);
        } else {
            const icon = document.createElement("span");
            icon.className = "material-symbols-outlined";
            icon.textContent =
                type === "error"
                    ? "error"
                    : type === "configuration"
                        ? "database"
                        : "storefront";

            icon.setAttribute("aria-hidden", "true");
            elements.status.appendChild(icon);
        }

        const paragraph = document.createElement("p");
        paragraph.textContent = message;

        elements.status.appendChild(paragraph);
    }

    function hideStatus() {
        elements.status.className =
            "shop-status shop-status--hidden";

        elements.status.replaceChildren();
    }

    function showToast(message) {
        elements.toast.textContent = message;
        elements.toast.classList.add("shop-toast--visible");

        window.clearTimeout(toastTimer);

        toastTimer = window.setTimeout(() => {
            elements.toast.classList.remove(
                "shop-toast--visible"
            );
        }, 2300);
    }
})();
