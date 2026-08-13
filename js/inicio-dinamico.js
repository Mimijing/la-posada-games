/* Inicio dinámico: anuncios e invitados del catálogo. */
(() => {
    "use strict";

    const FALLBACK_IMAGE = "img/logo.png";
    const elements = {};

    document.addEventListener("DOMContentLoaded", initialize);

    function initialize() {
        elements.announcements =
            document.getElementById("home-announcements-list");
        elements.announcementsStatus =
            document.getElementById("home-announcements-status");
        elements.games =
            document.getElementById("home-featured-games");
        elements.gamesStatus =
            document.getElementById("home-featured-status");

        if (!window.laPosadaSupabaseReady || !window.laPosadaSupabase) {
            showStatus(
                elements.announcementsStatus,
                "configuration",
                "Revisa la conexión."
            );
            showStatus(
                elements.gamesStatus,
                "configuration",
                "Revisa la conexión."
            );
            return;
        }

        loadAnnouncements();
        loadFeaturedGames();
    }

    async function loadAnnouncements() {
        showStatus(
            elements.announcementsStatus,
            "loading",
            "Cargando anuncios..."
        );

        const { data, error } = await window.laPosadaSupabase
            .from("anuncios")
            .select("id,imagen_url")
            .order("id", { ascending: false });

        if (error) {
            console.error("Error al cargar anuncios:", error);
            showStatus(
                elements.announcementsStatus,
                "error",
                "No se pudieron cargar los anuncios."
            );
            return;
        }

        renderAnnouncements(Array.isArray(data) ? data : []);
    }

    function renderAnnouncements(items) {
        elements.announcements.replaceChildren();

        if (items.length === 0) {
            showStatus(
                elements.announcementsStatus,
                "empty",
                "Todavía no hay anuncios publicados."
            );
            return;
        }

        hideStatus(elements.announcementsStatus);

        elements.announcements.classList.toggle(
            "announcements-list--scroll",
            items.length > 2
        );

        const fragment = document.createDocumentFragment();

        items.forEach((item, index) => {
            const article = document.createElement("article");
            article.className = "kingdom-announcement";

            const image = createImage(
                item.imagen_url,
                `Anuncio ${index + 1} de La Posada`,
                "kingdom-announcement__image"
            );

            article.appendChild(image);
            fragment.appendChild(article);
        });

        elements.announcements.appendChild(fragment);
    }

    async function loadFeaturedGames() {
        showStatus(
            elements.gamesStatus,
            "loading",
            "Cargando juegos destacados..."
        );

        const { data, error } = await window.laPosadaSupabase
            .from("catalogo_juegos")
            .select(
                "id,nombre,tipo,descripcion,jugadores_min,jugadores_max,dificultad,duracion_minutos,foto_url,created_at"
            )
            .order("created_at", { ascending: false })
            .limit(2);

        if (error) {
            console.error("Error al cargar juegos destacados:", error);
            showStatus(
                elements.gamesStatus,
                "error",
                "No se pudieron cargar los juegos destacados."
            );
            return;
        }

        renderFeaturedGames(Array.isArray(data) ? data : []);
    }

    function renderFeaturedGames(games) {
        elements.games.replaceChildren();

        if (games.length === 0) {
            showStatus(
                elements.gamesStatus,
                "empty",
                "Todavía no hay juegos en el catálogo."
            );
            return;
        }

        hideStatus(elements.gamesStatus);

        const fragment = document.createDocumentFragment();

        games.forEach((game) => {
            const card = document.createElement("article");
            card.className = "featured-game-card";

            const imageWrap = document.createElement("div");
            imageWrap.className = "featured-game-card__image-wrap";

            const image = createImage(
                game.foto_url,
                game.nombre ? `Juego ${game.nombre}` : "Juego de mesa",
                "featured-game-card__image"
            );

            const type = document.createElement("span");
            type.className = "featured-game-card__type";
            type.textContent = game.tipo || "Juego de mesa";

            imageWrap.append(image, type);

            const content = document.createElement("div");
            content.className = "featured-game-card__content";

            const title = document.createElement("h4");
            title.textContent = game.nombre || "Juego sin nombre";

            const description = document.createElement("p");
            description.className = "featured-game-card__description";
            description.textContent =
                game.descripcion ||
                "Este juego todavía no tiene una descripción.";

            const metadata = document.createElement("div");
            metadata.className = "featured-game-card__metadata";

            metadata.append(
                metadataItem("groups", formatPlayers(game)),
                metadataItem(
                    "timer",
                    game.duracion_minutos
                        ? `${game.duracion_minutos} min`
                        : "Sin dato"
                ),
                metadataItem(
                    "strategy",
                    game.dificultad || "Sin nivel"
                )
            );

            content.append(title, description, metadata);
            card.append(imageWrap, content);
            fragment.appendChild(card);
        });

        elements.games.appendChild(fragment);
    }

    function metadataItem(iconName, text) {
        const item = document.createElement("span");
        const icon = document.createElement("span");

        icon.className = "material-symbols-outlined";
        icon.textContent = iconName;
        icon.setAttribute("aria-hidden", "true");

        item.append(icon, document.createTextNode(text));
        return item;
    }

    function formatPlayers(game) {
        const min = Number(game.jugadores_min) || 0;
        const max = Number(game.jugadores_max) || 0;

        if (!min && !max) return "Sin dato";
        if (!max || min === max) return `${min || max} jugadores`;

        return `${min}–${max} jugadores`;
    }

    function createImage(url, alt, className) {
        const image = document.createElement("img");
        const hasImage =
            typeof url === "string" && url.trim() !== "";

        image.className = className;
        image.src = hasImage ? url.trim() : FALLBACK_IMAGE;
        image.alt = alt;
        image.loading = "lazy";

        if (!hasImage) {
            image.classList.add(`${className}--fallback`);
        }

        image.addEventListener(
            "error",
            () => {
                image.src = FALLBACK_IMAGE;
                image.classList.add(`${className}--fallback`);
            },
            { once: true }
        );

        return image;
    }

    function showStatus(element, type, message) {
        if (!element) return;

        element.className =
            `home-dynamic-status home-dynamic-status--${type}`;
        element.replaceChildren();

        if (type === "loading") {
            const loader = document.createElement("span");
            loader.className = "home-dynamic-loader";
            loader.setAttribute("aria-hidden", "true");
            element.appendChild(loader);
        } else {
            const icon = document.createElement("span");
            icon.className = "material-symbols-outlined";
            icon.textContent =
                type === "error"
                    ? "error"
                    : type === "configuration"
                        ? "database"
                        : "campaign";
            icon.setAttribute("aria-hidden", "true");
            element.appendChild(icon);
        }

        const paragraph = document.createElement("p");
        paragraph.textContent = message;
        element.appendChild(paragraph);
    }

    function hideStatus(element) {
        element.className =
            "home-dynamic-status home-dynamic-status--hidden";
        element.replaceChildren();
    }
})();
