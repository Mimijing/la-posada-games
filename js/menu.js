/* =========================================================
   MENÚ DINÁMICO — LA POSADA GAMES AND DRINKS

   La base de datos se usa solamente para la tabla:
   - public.menu

   Las dos promociones son imágenes fijas en menu.html.
   ========================================================= */

(() => {
    "use strict";

    const FALLBACK_IMAGE = "../img/logo.png";

    const state = {
        products: [],
        visibleProducts: [],
        selectedCategory: ""
    };

    const elements = {};

    document.addEventListener("DOMContentLoaded", initializeMenu);

    function initializeMenu() {
        elements.productsGrid =
            document.getElementById("menu-products-grid");

        elements.productsStatus =
            document.getElementById("menu-status");

        elements.count =
            document.getElementById("menu-count");

        elements.categoryButtons =
            document.querySelectorAll(".menu-category-button");

        bindCategoryButtons();
        loadProducts();
    }

    function bindCategoryButtons() {
        elements.categoryButtons.forEach((button) => {
            button.addEventListener("click", () => {
                state.selectedCategory =
                    button.dataset.category || "";

                elements.categoryButtons.forEach((item) => {
                    const isActive = item === button;

                    item.classList.toggle(
                        "menu-category-button--active",
                        isActive
                    );

                    item.setAttribute(
                        "aria-pressed",
                        String(isActive)
                    );
                });

                applyCategoryFilter();
            });
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
            elements.productsStatus,
            "loading",
            "Consultando el menú en Supabase..."
        );

        const { data, error } =
            await window.laPosadaSupabase
                .from("menu")
                .select(
                    "id,nombre,categoria,descripcion,precio,foto_url,disponible"
                )
                .eq("disponible", true)
                .order("categoria", { ascending: true })
                .order("nombre", { ascending: true });

        if (error) {
            console.error(
                "Error al cargar la tabla menu:",
                error
            );

            showStatus(
                elements.productsStatus,
                "error",
                "No se pudo cargar el menú. Comprueba la columna disponible y las políticas RLS."
            );

            elements.count.textContent =
                "Error al cargar";

            return;
        }

        state.products = Array.isArray(data)
            ? data
            : [];

        applyCategoryFilter();
    }

    function applyCategoryFilter() {
        state.visibleProducts =
            state.products.filter((product) => {
                return (
                    !state.selectedCategory ||
                    product.categoria ===
                        state.selectedCategory
                );
            });

        renderProducts();
    }

    function renderProducts() {
        elements.productsGrid.replaceChildren();

        const total =
            state.visibleProducts.length;

        elements.count.textContent =
            total === 1
                ? "1 producto"
                : `${total} productos`;

        if (total === 0) {
            showStatus(
                elements.productsStatus,
                "empty",
                state.products.length === 0
                    ? "Todavía no hay comidas o bebidas disponibles."
                    : "No hay productos en esta categoría."
            );

            return;
        }

        hideStatus(elements.productsStatus);

        const fragment =
            document.createDocumentFragment();

        state.visibleProducts.forEach((product) => {
            fragment.appendChild(
                createProductCard(product)
            );
        });

        elements.productsGrid.appendChild(fragment);
    }

    function createProductCard(product) {
        const article = document.createElement("article");
        article.className = "menu-product-card";

        const content = document.createElement("div");
        content.className =
            "menu-product-card__content";

        const title = document.createElement("h3");
        title.textContent =
            product.nombre || "Producto sin nombre";

        const description = document.createElement("p");
        description.className =
            "menu-product-card__description";
        description.textContent =
            product.descripcion ||
            "Este producto todavía no tiene una descripción.";

        content.append(title, description);

        const imageWrap = document.createElement("div");
        imageWrap.className =
            "menu-product-card__image-wrap";

        const image = createImage(
            product.foto_url,
            product.nombre
                ? product.nombre
                : "Producto del menú",
            "menu-product-card__image"
        );

        const price = document.createElement("strong");
        price.className =
            "menu-product-card__price";
        price.textContent =
            formatPrice(product.precio);

        imageWrap.append(image, price);
        article.append(content, imageWrap);

        return article;
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
            image.classList.add(
                `${className}--fallback`
            );
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

    function showConfigurationMessage() {
        elements.count.textContent =
            "Conexión pendiente";

        showStatus(
            elements.productsStatus,
            "configuration",
            "Abre js/supabase-config.js y verifica la Project URL y la Publishable key."
        );
    }

    function showStatus(element, type, message) {
        if (!element) {
            return;
        }

        element.className =
            `menu-status menu-status--${type}`;

        element.replaceChildren();

        if (type === "loading") {
            const loader =
                document.createElement("span");

            loader.className = "menu-loader";
            loader.setAttribute(
                "aria-hidden",
                "true"
            );

            element.appendChild(loader);
        } else {
            const icon =
                document.createElement("span");

            icon.className =
                "material-symbols-outlined";

            icon.textContent =
                type === "error"
                    ? "error"
                    : type === "configuration"
                        ? "database"
                        : "restaurant_menu";

            icon.setAttribute(
                "aria-hidden",
                "true"
            );

            element.appendChild(icon);
        }

        const paragraph =
            document.createElement("p");

        paragraph.textContent = message;
        element.appendChild(paragraph);
    }

    function hideStatus(element) {
        if (!element) {
            return;
        }

        element.className =
            "menu-status menu-status--hidden";

        element.replaceChildren();
    }
})();
