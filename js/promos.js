/* =========================================================
   PROMOCIONES DINÁMICAS — LA POSADA GAMES AND DRINKS

   Tabla utilizada:
   public.promociones

   Datos visibles:
   - imagen_url
   - titulo
   - descripcion

   Datos de administración:
   - activo
   - orden
   ========================================================= */

(() => {
    "use strict";

    const FALLBACK_IMAGE = "../img/logo.png";
    const AUTO_PLAY_DELAY = 5500;

    const state = {
        promotions: [],
        currentIndex: 0,
        autoPlayTimer: null,
        touchStartX: 0
    };

    const elements = {};

    document.addEventListener(
        "DOMContentLoaded",
        initializePromotions
    );

    function initializePromotions() {
        elements.status =
            document.getElementById("promos-status");

        elements.carousel =
            document.getElementById("promos-carousel");

        elements.track =
            document.getElementById("promos-carousel-track");

        elements.previous =
            document.getElementById("promos-previous");

        elements.next =
            document.getElementById("promos-next");

        elements.counter =
            document.getElementById("promos-counter");

        elements.dots =
            document.getElementById("promos-dots");

        elements.notices =
            document.getElementById("promos-notices-grid");

        bindCarouselEvents();
        loadPromotions();
    }

    function bindCarouselEvents() {
        elements.previous.addEventListener(
            "click",
            () => showPrevious(true)
        );

        elements.next.addEventListener(
            "click",
            () => showNext(true)
        );

        elements.carousel.addEventListener(
            "keydown",
            (event) => {
                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    showPrevious(true);
                }

                if (event.key === "ArrowRight") {
                    event.preventDefault();
                    showNext(true);
                }
            }
        );

        elements.carousel.addEventListener(
            "mouseenter",
            stopAutoPlay
        );

        elements.carousel.addEventListener(
            "mouseleave",
            startAutoPlay
        );

        elements.carousel.addEventListener(
            "focusin",
            stopAutoPlay
        );

        elements.carousel.addEventListener(
            "focusout",
            startAutoPlay
        );

        elements.carousel.addEventListener(
            "touchstart",
            (event) => {
                state.touchStartX =
                    event.changedTouches[0]?.clientX || 0;
            },
            { passive: true }
        );

        elements.carousel.addEventListener(
            "touchend",
            (event) => {
                const touchEndX =
                    event.changedTouches[0]?.clientX || 0;

                const difference =
                    touchEndX - state.touchStartX;

                if (Math.abs(difference) < 45) {
                    return;
                }

                if (difference > 0) {
                    showPrevious(true);
                } else {
                    showNext(true);
                }
            },
            { passive: true }
        );

        document.addEventListener(
            "visibilitychange",
            () => {
                if (document.hidden) {
                    stopAutoPlay();
                } else {
                    startAutoPlay();
                }
            }
        );
    }

    async function loadPromotions() {
        if (
            !window.laPosadaSupabaseReady ||
            !window.laPosadaSupabase
        ) {
            showStatus(
                "configuration",
                "Abre js/supabase-config.js y verifica la Project URL y la Publishable key."
            );

            return;
        }

        showStatus(
            "loading",
            "Consultando las promociones en Supabase..."
        );

        const { data, error } =
            await window.laPosadaSupabase
                .from("promociones")
                .select(
                    "id,titulo,descripcion,imagen_url,activo,orden"
                )
                .eq("activo", true)
                .order("orden", { ascending: true })
                .order("created_at", { ascending: false });

        if (error) {
            console.error(
                "Error al cargar promociones:",
                error
            );

            showStatus(
                "error",
                "No se pudieron cargar las promociones. Ejecuta el SQL incluido y revisa las políticas RLS."
            );

            return;
        }

        state.promotions =
            Array.isArray(data) ? data : [];

        renderPromotions();
    }

    function renderPromotions() {
        elements.track.replaceChildren();
        elements.dots.replaceChildren();
        elements.notices.replaceChildren();

        if (state.promotions.length === 0) {
            elements.carousel.hidden = true;

            showStatus(
                "empty",
                "Todavía no hay promociones activas para mostrar."
            );

            return;
        }

        hideStatus();
        elements.carousel.hidden = false;

        const slidesFragment =
            document.createDocumentFragment();

        const dotsFragment =
            document.createDocumentFragment();

        const noticesFragment =
            document.createDocumentFragment();

        state.promotions.forEach((promotion, index) => {
            slidesFragment.appendChild(
                createSlide(promotion, index)
            );

            dotsFragment.appendChild(
                createDot(promotion, index)
            );

            noticesFragment.appendChild(
                createNotice(promotion, index)
            );
        });

        elements.track.appendChild(slidesFragment);
        elements.dots.appendChild(dotsFragment);
        elements.notices.appendChild(noticesFragment);

        state.currentIndex = 0;
        updateCarousel(false);
        startAutoPlay();
    }

    function createSlide(promotion, index) {
        const article = document.createElement("article");

        article.className = "promos-slide";
        article.setAttribute("role", "group");
        article.setAttribute(
            "aria-roledescription",
            "diapositiva"
        );
        article.setAttribute(
            "aria-label",
            `${index + 1} de ${state.promotions.length}: ${promotion.titulo}`
        );

        const image = createImage(
            promotion.imagen_url,
            promotion.titulo
                ? `Promoción: ${promotion.titulo}`
                : "Promoción de La Posada",
            "promos-slide__image"
        );

        const shade = document.createElement("div");
        shade.className = "promos-slide__shade";
        shade.setAttribute("aria-hidden", "true");

        article.append(image, shade);

        return article;
    }

    function createDot(promotion, index) {
        const button = document.createElement("button");

        button.className = "promos-carousel__dot";
        button.type = "button";
        button.setAttribute(
            "aria-label",
            `Mostrar promoción ${index + 1}: ${promotion.titulo}`
        );

        button.addEventListener("click", () => {
            showSlide(index, true);
        });

        return button;
    }

    function createNotice(promotion, index) {
        const button = document.createElement("button");

        button.className = "promos-note";
        button.type = "button";
        button.setAttribute(
            "aria-label",
            `Ver imagen de ${promotion.titulo}`
        );

        const title = document.createElement("h3");
        title.textContent =
            promotion.titulo || "Promoción sin título";

        const description = document.createElement("p");
        description.textContent =
            promotion.descripcion ||
            "Esta promoción todavía no tiene una descripción.";

        button.append(title, description);

        button.addEventListener("click", () => {
            showSlide(index, true);

            elements.carousel.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });

        return button;
    }

    function showPrevious(userInitiated = false) {
        const nextIndex =
            state.currentIndex - 1 < 0
                ? state.promotions.length - 1
                : state.currentIndex - 1;

        showSlide(nextIndex, userInitiated);
    }

    function showNext(userInitiated = false) {
        const nextIndex =
            state.currentIndex + 1 >=
            state.promotions.length
                ? 0
                : state.currentIndex + 1;

        showSlide(nextIndex, userInitiated);
    }

    function showSlide(index, userInitiated = false) {
        if (
            index < 0 ||
            index >= state.promotions.length
        ) {
            return;
        }

        state.currentIndex = index;
        updateCarousel(true);

        if (userInitiated) {
            restartAutoPlay();
        }
    }

    function updateCarousel(animate = true) {
        if (!animate) {
            elements.track.style.transition = "none";
        }

        elements.track.style.transform =
            `translateX(-${state.currentIndex * 100}%)`;

        const dots =
            elements.dots.querySelectorAll(
                ".promos-carousel__dot"
            );

        dots.forEach((dot, index) => {
            const isActive =
                index === state.currentIndex;

            dot.classList.toggle(
                "promos-carousel__dot--active",
                isActive
            );

            dot.setAttribute(
                "aria-current",
                isActive ? "true" : "false"
            );
        });

        const notes =
            elements.notices.querySelectorAll(
                ".promos-note"
            );

        notes.forEach((note, index) => {
            note.classList.toggle(
                "promos-note--active",
                index === state.currentIndex
            );
        });

        elements.counter.textContent =
            `${state.currentIndex + 1} / ${state.promotions.length}`;

        const hasMultiple =
            state.promotions.length > 1;

        elements.previous.hidden = !hasMultiple;
        elements.next.hidden = !hasMultiple;
        elements.dots.hidden = !hasMultiple;
        elements.counter.hidden = !hasMultiple;

        if (!animate) {
            requestAnimationFrame(() => {
                elements.track.style.transition = "";
            });
        }
    }

    function startAutoPlay() {
        stopAutoPlay();

        if (
            state.promotions.length <= 1 ||
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            return;
        }

        state.autoPlayTimer =
            window.setInterval(
                () => showNext(false),
                AUTO_PLAY_DELAY
            );
    }

    function stopAutoPlay() {
        if (state.autoPlayTimer) {
            window.clearInterval(
                state.autoPlayTimer
            );

            state.autoPlayTimer = null;
        }
    }

    function restartAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    function createImage(url, alt, className) {
        const image = document.createElement("img");

        const hasImage =
            typeof url === "string" &&
            url.trim() !== "";

        image.className = className;
        image.src = hasImage
            ? url.trim()
            : FALLBACK_IMAGE;

        image.alt = alt;
        image.loading = "lazy";

        if (!hasImage) {
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

    function showStatus(type, message) {
        elements.status.className =
            `promos-status promos-status--${type}`;

        elements.status.replaceChildren();

        if (type === "loading") {
            const loader =
                document.createElement("span");

            loader.className = "promos-loader";
            loader.setAttribute(
                "aria-hidden",
                "true"
            );

            elements.status.appendChild(loader);
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
                        : "local_offer";

            icon.setAttribute(
                "aria-hidden",
                "true"
            );

            elements.status.appendChild(icon);
        }

        const paragraph =
            document.createElement("p");

        paragraph.textContent = message;
        elements.status.appendChild(paragraph);
    }

    function hideStatus() {
        elements.status.className =
            "promos-status promos-status--hidden";

        elements.status.replaceChildren();
    }
})();
