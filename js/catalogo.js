/* =========================================================
   CATÁLOGO DINÁMICO — LA POSADA GAMES AND DRINKS
   Obtiene los juegos desde la tabla public.catalogo_juegos.
   ========================================================= */

(() => {
    "use strict";

    const WHATSAPP_NUMBER = "59173724060";
    const FALLBACK_IMAGE = "../img/logo.png";

    const state = {
        games: [],
        visibleGames: [],
        currentPage: 1,
        gamesPerPage: 21,
        selectedFormat: ""
    };

    const elements = {};

    document.addEventListener("DOMContentLoaded", initializeCatalog);

    function initializeCatalog() {
        elements.grid = document.getElementById("catalog-grid");
        elements.status = document.getElementById("catalog-status");
        elements.count = document.getElementById("catalog-count");
        elements.pagination = document.getElementById("catalog-pagination");
        elements.search = document.getElementById("catalog-search");
        elements.headerSearch = document.getElementById("catalog-header-search");
        elements.type = document.getElementById("catalog-type");
        elements.difficulty = document.getElementById("catalog-difficulty");
        elements.players = document.getElementById("catalog-players");
        elements.formatButtons = Array.from(document.querySelectorAll("[data-catalog-format]"));
        elements.reset = document.getElementById("catalog-reset");
        elements.dialog = document.getElementById("game-dialog");
        elements.dialogPanel = elements.dialog?.querySelector(".game-dialog__panel");
        elements.closeButtons = document.querySelectorAll("[data-close-dialog]");

        bindFilters();
        bindDialog();
        loadGames();
    }

    function bindFilters() {
        const filterElements = [
            elements.search,
            elements.type,
            elements.difficulty,
            elements.players
        ];

        filterElements.forEach((element) => {
            element?.addEventListener("input", applyFilters);
            element?.addEventListener("change", applyFilters);
        });

        elements.headerSearch?.addEventListener("input", () => {
            elements.search.value = elements.headerSearch.value;
            applyFilters();
        });

        elements.search?.addEventListener("input", () => {
            if (elements.headerSearch) {
                elements.headerSearch.value = elements.search.value;
            }
        });

        elements.formatButtons.forEach((button) => {
            button.addEventListener("click", () => {
                state.selectedFormat = button.dataset.catalogFormat || "";
                updateFormatButtons();
                applyFilters();
            });
        });

        elements.reset?.addEventListener("click", () => {
            elements.search.value = "";
            elements.type.value = "";
            elements.difficulty.value = "";
            elements.players.value = "";
            state.selectedFormat = "";
            updateFormatButtons();

            if (elements.headerSearch) {
                elements.headerSearch.value = "";
            }

            applyFilters();
            elements.search.focus();
        });
    }

    function updateFormatButtons() {
        elements.formatButtons.forEach((button) => {
            const isActive = (button.dataset.catalogFormat || "") === state.selectedFormat;
            button.classList.toggle("catalog-format-tab--active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    function bindDialog() {
        elements.closeButtons.forEach((button) => {
            button.addEventListener("click", closeDialog);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !elements.dialog.hidden) {
                closeDialog();
            }
        });
    }

    async function loadGames() {
        if (!window.laPosadaSupabaseReady || !window.laPosadaSupabase) {
            showConfigurationMessage();
            return;
        }

        showStatus("loading", "Consultando los pergaminos de La posada");

        const { data, error } = await window.laPosadaSupabase
            .from("catalogo_juegos")
            .select(
                "id,nombre,tipo,descripcion,jugadores_min,jugadores_max,dificultad,duracion_minutos,foto_url,formato,juego_base_requerido"
            )
            .order("nombre", { ascending: true });

        if (error) {
            console.error("Error al cargar catalogo_juegos:", error);
            showStatus(
                "error",
                "No se pudo cargar el catálogo."
            );
            elements.count.textContent = "Error al cargar";
            return;
        }

        state.games = Array.isArray(data) ? data : [];
        applyFilters();
    }

    function applyFilters() {
        const searchText = normalizeText(elements.search?.value || "");
        const selectedType = elements.type?.value || "";
        const selectedDifficulty = elements.difficulty?.value || "";
        const selectedPlayers = Number(elements.players?.value || 0);
        const selectedFormat = state.selectedFormat;

        state.visibleGames = state.games.filter((game) => {
            const searchableText = normalizeText(
                [game.nombre, game.tipo, game.descripcion, game.dificultad]
                    .filter(Boolean)
                    .join(" ")
            );

            const matchesSearch = !searchText || searchableText.includes(searchText);
            const matchesType = !selectedType || game.tipo === selectedType;
            const matchesDifficulty =
                !selectedDifficulty || game.dificultad === selectedDifficulty;
            const gameFormat = game.formato || "Juego";
            const matchesFormat = !selectedFormat || gameFormat === selectedFormat;

            let matchesPlayers = true;
            if (selectedPlayers) {
                if (selectedPlayers >= 7) {
                    matchesPlayers = Number(game.jugadores_max) >= 7;
                } else {
                    matchesPlayers =
                        Number(game.jugadores_min) <= selectedPlayers &&
                        Number(game.jugadores_max) >= selectedPlayers;
                }
            }

            return (
                matchesSearch &&
                matchesType &&
                matchesDifficulty &&
                matchesPlayers &&
                matchesFormat
            );
        });
        state.currentPage = 1;
        renderGames();
    }

    function renderGames() {
        elements.grid.replaceChildren();

        const total = state.visibleGames.length;

        elements.count.textContent =
            total === 1
                ? "1 juego"
                : `${total} juegos`;

        if (total === 0) {
            elements.pagination.hidden = true;
            elements.pagination.replaceChildren();

            showStatus(
                "empty",
                state.games.length === 0
                    ? "Todavía no hay juegos registrados"
                    : "No encontramos juegos con esos filtros."
            );

            return;
        }

        hideStatus();

        const totalPages = Math.ceil(
            total / state.gamesPerPage
        );

        if (state.currentPage > totalPages) {
            state.currentPage = totalPages;
        }

        const startIndex =
            (state.currentPage - 1) *
            state.gamesPerPage;

        const endIndex =
            startIndex + state.gamesPerPage;

        const gamesOnCurrentPage =
            state.visibleGames.slice(
                startIndex,
                endIndex
            );

        const fragment =
            document.createDocumentFragment();

        gamesOnCurrentPage.forEach((game) => {
            fragment.appendChild(
                createGameCard(game)
            );
        });

        elements.grid.appendChild(fragment);

        renderPagination(totalPages);
    }
    function renderPagination(totalPages) {
    elements.pagination.replaceChildren();

    if (totalPages <= 1) {
        elements.pagination.hidden = true;
        return;
    }

    elements.pagination.hidden = false;

    const previousButton = createPaginationButton(
        "chevron_left",
        state.currentPage - 1,
        state.currentPage === 1,
        "Página anterior"
    );

    elements.pagination.appendChild(previousButton);

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {
        const button = createPaginationButton(
            String(page),
            page,
            false,
            `Ir a la página ${page}`
        );

        if (page === state.currentPage) {
            button.classList.add(
                "catalog-pagination__button--active"
            );

            button.setAttribute(
                "aria-current",
                "page"
            );
        }

        elements.pagination.appendChild(button);
    }

    const nextButton = createPaginationButton(
        "chevron_right",
        state.currentPage + 1,
        state.currentPage === totalPages,
        "Página siguiente"
    );

    elements.pagination.appendChild(nextButton);
}

    function createPaginationButton(
        content,
        page,
        disabled,
        label
    ) {
        const button =
            document.createElement("button");

        button.className =
            "catalog-pagination__button";

        button.type = "button";
        button.disabled = disabled;
        button.setAttribute("aria-label", label);

        const isIcon =
            content === "chevron_left" ||
            content === "chevron_right";

        if (isIcon) {
            const icon =
                document.createElement("span");

            icon.className =
                "material-symbols-outlined";

            icon.textContent = content;
            icon.setAttribute(
                "aria-hidden",
                "true"
            );

            button.appendChild(icon);
        } else {
            button.textContent = content;
        }

        button.addEventListener("click", () => {
            if (disabled) {
                return;
            }

            state.currentPage = page;
            renderGames();

            document
                .querySelector(".catalog-results__header")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        });

        return button;
    }
    function createGameCard(game) {
        const card = document.createElement("article");
        card.className = "catalog-game-card";
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `Ver detalles de ${game.nombre}`);

        const imageFrame = document.createElement("div");
        imageFrame.className = "catalog-game-card__image-frame";

        const image = document.createElement("img");
        image.className = "catalog-game-card__image";

        const hasGamePhoto =
            typeof game.foto_url === "string" &&
            game.foto_url.trim() !== "";

        image.src = hasGamePhoto
            ? game.foto_url.trim()
            : FALLBACK_IMAGE;

        if (!hasGamePhoto) {
            image.classList.add("catalog-game-card__image--fallback");
        }

        image.alt = game.nombre ? `Juego ${game.nombre}` : "Juego de mesa";
        image.loading = "lazy";

        image.addEventListener("error", () => {
            image.src = FALLBACK_IMAGE;
            image.classList.add("catalog-game-card__image--fallback");
        }, { once: true });

        const typeBadge = document.createElement("span");
        typeBadge.className = "catalog-game-card__type";
        typeBadge.textContent = shortType(game.tipo);

        imageFrame.append(image, typeBadge);

        const parchment = document.createElement("div");
        parchment.className = "catalog-game-card__parchment";

        const isExpansion = normalizeText(game.formato) === "expansion";
        let formatBadge = null;

        if (isExpansion) {
            formatBadge = document.createElement("span");
            formatBadge.className = "catalog-game-card__format";
            formatBadge.textContent = "Expansión";
        }

        const difficulty = document.createElement("span");
        difficulty.className = `catalog-game-card__difficulty catalog-game-card__difficulty--${difficultyClass(game.dificultad)}`;
        difficulty.textContent = game.dificultad || "Sin nivel";

        const title = document.createElement("h3");
        title.textContent = game.nombre || "Juego sin nombre";

        const metadata = document.createElement("div");
        metadata.className = "catalog-game-card__metadata";
        metadata.append(
            createMeta("groups", formatPlayers(game)),
            createMeta("timer", formatDuration(game.duracion_minutos))
        );

        const description = document.createElement("p");
        description.className = "catalog-game-card__description";
        description.textContent =
            game.descripcion || "Este pergamino todavía no tiene una descripción.";

        const button = document.createElement("button");
        button.className = "catalog-game-card__button";
        button.type = "button";
        button.innerHTML = `
            <span>Abrir pergamino</span>
            <span class="material-symbols-outlined" aria-hidden="true">menu_book</span>
        `;

        if (formatBadge) {
            parchment.appendChild(formatBadge);
        }

        parchment.append(difficulty, title, metadata, description, button);
        card.append(imageFrame, parchment);

        const open = () => openDialog(game);
        card.addEventListener("click", open);
        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                open();
            }
        });

        return card;
    }

    function createMeta(iconName, text) {
        const item = document.createElement("span");
        item.innerHTML = `
            <span class="material-symbols-outlined" aria-hidden="true">${iconName}</span>
            <span></span>
        `;
        item.lastElementChild.textContent = text;
        return item;
    }

    function openDialog(game) {
        const image = document.getElementById("dialog-game-image");

        image.src = game.foto_url || FALLBACK_IMAGE;
        image.alt = game.nombre
            ? `Juego ${game.nombre}`
            : "Juego de mesa";

        image.onerror = () => {
            image.src = FALLBACK_IMAGE;
        };

        document.getElementById("dialog-game-type").textContent =
            game.tipo || "Juego de mesa";

        document.getElementById("dialog-game-title").textContent =
            game.nombre || "Juego sin nombre";

        document.getElementById("dialog-game-description").textContent =
            game.descripcion ||
            "Este juego todavía no tiene una descripción.";

        const baseGame = document.getElementById("dialog-game-base");
        const requiredGame = String(game.juego_base_requerido || "").trim();

        if (normalizeText(game.formato) === "expansion" && requiredGame) {
            baseGame.textContent = `Requiere el juego base: ${requiredGame}`;
            baseGame.hidden = false;
        } else {
            baseGame.textContent = "";
            baseGame.hidden = true;
        }

        document.getElementById("dialog-game-players").textContent =
            formatPlayers(game);

        document.getElementById("dialog-game-duration").textContent =
            formatDuration(game.duracion_minutos);

        document.getElementById("dialog-game-difficulty").textContent =
            game.dificultad || "Sin nivel";

        elements.dialog.hidden = false;
        document.body.classList.add("dialog-open");

        requestAnimationFrame(() => {
            elements.dialog.classList.add("game-dialog--open");

            elements.dialog
                .querySelector(".game-dialog__close")
                ?.focus();
        });
    }

    function closeDialog() {
        if (!elements.dialog || elements.dialog.hidden) {
            return;
        }

        elements.dialog.classList.remove("game-dialog--open");
        document.body.classList.remove("dialog-open");

        window.setTimeout(() => {
            elements.dialog.hidden = true;
        }, 180);
    }

    function showConfigurationMessage() {
        elements.count.textContent = "Conexión pendiente";
        elements.status.className = "catalog-status catalog-status--configuration";
        elements.status.innerHTML = `
            <span class="material-symbols-outlined" aria-hidden="true">database</span>
            <div>
                <strong>Falta conectar</strong>
                <p>
                    Abre <code>js/supabase-config.js</code> y pega la Project URL
                    y la Publishable key de tu proyecto.
                </p>
            </div>
        `;
    }

    function showStatus(type, message) {
        elements.status.className = `catalog-status catalog-status--${type}`;
        elements.status.replaceChildren();

        if (type === "loading") {
            const loader = document.createElement("span");
            loader.className = "catalog-loader";
            loader.setAttribute("aria-hidden", "true");
            elements.status.appendChild(loader);
        } else {
            const icon = document.createElement("span");
            icon.className = "material-symbols-outlined";
            icon.textContent = type === "error" ? "error" : "search_off";
            icon.setAttribute("aria-hidden", "true");
            elements.status.appendChild(icon);
        }

        const paragraph = document.createElement("p");
        paragraph.textContent = message;
        elements.status.appendChild(paragraph);
    }

    function hideStatus() {
        elements.status.className = "catalog-status catalog-status--hidden";
        elements.status.replaceChildren();
    }

    function normalizeText(value) {
        return String(value)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function shortType(type) {
        return String(type || "Juego de mesa")
            .replace(/^Juegos de\s+/i, "")
            .replace(/^Juego de\s+/i, "");
    }

    function difficultyClass(difficulty) {
        const value = normalizeText(difficulty);
        if (value === "principiante") return "principiante";
        if (value === "conocedor") return "conocedor";
        if (value === "sabio") return "sabio";
        return "neutral";
    }

    function formatPlayers(game) {
        const minimum = Number(game.jugadores_min);
        const maximum = Number(game.jugadores_max);

        if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) {
            return "Sin especificar";
        }

        if (minimum === maximum) {
            return minimum === 1 ? "1 jugador" : `${minimum} jugadores`;
        }

        return `${minimum} a ${maximum} jugadores`;
    }

    function formatDuration(minutes) {
        const value = Number(minutes);
        if (!Number.isFinite(value) || value <= 0) {
            return "Sin especificar";
        }

        if (value < 60) {
            return `${value} min`;
        }

        const hours = Math.floor(value / 60);
        const remainingMinutes = value % 60;

        if (remainingMinutes === 0) {
            return hours === 1 ? "1 hora" : `${hours} horas`;
        }

        return `${hours} h ${remainingMinutes} min`;
    }
})();
