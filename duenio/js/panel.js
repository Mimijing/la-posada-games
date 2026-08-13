/* =========================================================
   PANEL DEL DUEÑO — LA POSADA GAMES AND DRINKS

   CRUD:
   - catalogo_juegos
   - menu
   - tienda
   - promociones
   - anuncios

   Imágenes:
   - Bucket público imagenes-la-posada
   ========================================================= */

(() => {
    "use strict";

    const BUCKET = "imagenes-la-posada";
    const FALLBACK_IMAGE = "../img/logo.png";
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const MAX_EXTRA_STORE_IMAGES = 4;

    const GAME_TYPES = [
        "Juegos de estrategia",
        "Juegos de conquista",
        "Juegos en equipo",
        "Juegos de party",
        "Juegos de mentir",
        "Juegos de cartas sencillos",
        "Destreza y rapidez"
    ];

    const DIFFICULTIES = [
        "Principiante",
        "Conocedor",
        "Sabio"
    ];

    const TABLES = {
        catalogo_juegos: {
            label: "Catálogo de juegos",
            singular: "juego del catálogo",
            eyebrow: "Biblioteca pública",
            listTitle: "Juegos registrados",
            description:
                "Añade, edita o elimina los juegos disponibles para jugar en el local.",
            icon: "casino",
            titleField: "nombre",
            imageField: "foto_url",
            orderBy: "created_at",
            fields: [
                field("nombre", "Nombre", "text", {
                    required: true,
                    placeholder: "Ej. Catan"
                }),
                selectField(
                    "formato",
                    "Formato",
                    ["Juego", "Expansión"],
                    {
                        required: true,
                        defaultValue: "Juego"
                    }
                ),
                field(
                    "juego_base_requerido",
                    "Juego base requerido",
                    "text",
                    {
                        placeholder: "Ej. Coffee Rush",
                        showWhen: {
                            name: "formato",
                            values: ["Expansión"]
                        },
                        requiredWhenVisible: true
                    }
                ),
                selectField("tipo", "Tipo de juego", GAME_TYPES, {
                    required: true
                }),
                field("descripcion", "Descripción", "textarea", {
                    placeholder: "Descripción breve del juego"
                }),
                field("jugadores_min", "Jugadores mínimos", "number", {
                    required: true,
                    min: 1
                }),
                field("jugadores_max", "Jugadores máximos", "number", {
                    required: true,
                    min: 1
                }),
                selectField(
                    "dificultad",
                    "Dificultad",
                    DIFFICULTIES,
                    { required: true }
                ),
                field(
                    "duracion_minutos",
                    "Duración en minutos",
                    "number",
                    { required: true, min: 1 }
                )
            ],
            meta(record) {
                return [
                    record.formato === "Expansión"
                        ? "Expansión"
                        : null,
                    record.tipo,
                    formatPlayers(record),
                    formatDuration(record.duracion_minutos),
                    record.dificultad
                ].filter(Boolean);
            }
        },

        menu: {
            label: "Menú",
            singular: "producto del menú",
            eyebrow: "Cocina de la Posada",
            listTitle: "Comidas y bebidas",
            description:
                "Administra los productos que aparecen en la carta del local.",
            icon: "restaurant_menu",
            titleField: "nombre",
            imageField: "foto_url",
            orderBy: "created_at",
            fields: [
                field("nombre", "Nombre", "text", {
                    required: true,
                    placeholder: "Ej. Sonsitos de queso"
                }),
                selectField(
                    "categoria",
                    "Categoría",
                    ["Comida", "Bebida"],
                    { required: true }
                ),
                field("descripcion", "Descripción", "textarea", {
                    placeholder: "Descripción breve del producto"
                }),
                field("precio", "Precio en Bs", "number", {
                    required: true,
                    min: 0,
                    step: 0.01
                }),
                field("disponible", "Disponible", "checkbox", {
                    defaultValue: true
                })
            ],
            meta(record) {
                return [
                    record.categoria,
                    formatPrice(record.precio),
                    record.disponible ? "Disponible" : "Oculto"
                ];
            }
        },

        tienda: {
            label: "Tienda",
            singular: "producto de la tienda",
            eyebrow: "Mercado de la Posada",
            listTitle: "Productos en venta",
            description:
                "Controla la información, el precio y el stock de los productos en venta.",
            icon: "storefront",
            titleField: "nombre",
            imageField: "foto_url",
            orderBy: "created_at",
            fields: [
                field("nombre", "Nombre", "text", {
                    required: true
                }),
                selectField(
                    "clase_producto",
                    "Clase de producto",
                    ["Juego", "Expansión", "Fundas"],
                    {
                        required: true,
                        defaultValue: "Juego"
                    }
                ),
                field(
                    "juego_base_requerido",
                    "Juego base requerido",
                    "text",
                    {
                        placeholder: "Ej. Coffee Rush",
                        showWhen: {
                            name: "clase_producto",
                            values: ["Expansión"]
                        },
                        requiredWhenVisible: true
                    }
                ),
                selectField("tipo", "Tipo de juego", GAME_TYPES, {
                    required: true,
                    showWhen: {
                        name: "clase_producto",
                        values: ["Juego", "Expansión"]
                    }
                }),
                field("descripcion", "Descripción", "textarea"),
                field("jugadores_min", "Jugadores mínimos", "number", {
                    required: true,
                    min: 1,
                    showWhen: {
                        name: "clase_producto",
                        values: ["Juego", "Expansión"]
                    }
                }),
                field("jugadores_max", "Jugadores máximos", "number", {
                    required: true,
                    min: 1,
                    showWhen: {
                        name: "clase_producto",
                        values: ["Juego", "Expansión"]
                    }
                }),
                selectField(
                    "dificultad",
                    "Dificultad",
                    DIFFICULTIES,
                    {
                        required: true,
                        showWhen: {
                            name: "clase_producto",
                            values: ["Juego", "Expansión"]
                        }
                    }
                ),
                field(
                    "duracion_minutos",
                    "Duración en minutos",
                    "number",
                    {
                        required: true,
                        min: 1,
                        showWhen: {
                            name: "clase_producto",
                            values: ["Juego", "Expansión"]
                        }
                    }
                ),
                field(
                    "ancho_funda_mm",
                    "Ancho de funda (mm)",
                    "number",
                    {
                        min: 0.01,
                        step: 0.01,
                        showWhen: {
                            name: "clase_producto",
                            values: ["Fundas"]
                        },
                        requiredWhenVisible: true
                    }
                ),
                field(
                    "alto_funda_mm",
                    "Alto de funda (mm)",
                    "number",
                    {
                        min: 0.01,
                        step: 0.01,
                        showWhen: {
                            name: "clase_producto",
                            values: ["Fundas"]
                        },
                        requiredWhenVisible: true
                    }
                ),
                field(
                    "cantidad_fundas",
                    "Cantidad de fundas",
                    "number",
                    {
                        min: 1,
                        step: 1,
                        showWhen: {
                            name: "clase_producto",
                            values: ["Fundas"]
                        },
                        requiredWhenVisible: true
                    }
                ),
                field(
                    "compatibilidad",
                    "Compatibilidad",
                    "textarea",
                    {
                        placeholder: "Ej. Coffee Rush, Catan o cartas de 63,5 × 88 mm",
                        showWhen: {
                            name: "clase_producto",
                            values: ["Fundas"]
                        }
                    }
                ),
                field("precio", "Precio en Bs", "number", {
                    required: true,
                    min: 0,
                    step: 0.01
                }),
                field("stock", "Stock", "number", {
                    required: true,
                    min: 0,
                    defaultValue: 0
                })
            ],
            meta(record) {
                const productClass =
                    record.clase_producto || "Juego";

                const detail =
                    productClass === "Fundas" &&
                    record.ancho_funda_mm &&
                    record.alto_funda_mm
                        ? `${record.ancho_funda_mm} × ${record.alto_funda_mm} mm`
                        : record.tipo;

                return [
                    productClass,
                    detail,
                    formatPrice(record.precio),
                    `Stock: ${Number(record.stock) || 0}`,
                    getStockLabel(record.stock)
                ].filter(Boolean);
            }
        },

        promociones: {
            label: "Promociones",
            singular: "promoción",
            eyebrow: "Ofertas del reino",
            listTitle: "Promociones publicadas",
            description:
                "Administra las imágenes, títulos y descripciones de la página de promociones.",
            icon: "local_offer",
            titleField: "titulo",
            imageField: "imagen_url",
            orderBy: "orden",
            ascending: true,
            fields: [
                field("titulo", "Título", "text", {
                    required: true
                }),
                field("descripcion", "Descripción", "textarea", {
                    required: true
                }),
                field("orden", "Orden", "number", {
                    required: true,
                    min: 1,
                    defaultValue: 1
                }),
                field("activo", "Promoción activa", "checkbox", {
                    defaultValue: true
                })
            ],
            meta(record) {
                return [
                    `Orden: ${record.orden}`,
                    record.activo ? "Activa" : "Oculta"
                ];
            }
        },

        anuncios: {
            label: "Anuncios del Reino",
            singular: "anuncio",
            eyebrow: "Tablón principal",
            listTitle: "Imágenes publicadas",
            description:
                "Añade o elimina las imágenes que aparecen en Anuncios del Reino.",
            icon: "campaign",
            titleField: null,
            imageField: "imagen_url",
            orderBy: "id",
            ascending: false,
            fields: [],
            meta(record) {
                return [`ID: ${record.id}`];
            }
        }
    };

    const state = {
        supabase: null,
        session: null,
        activeTable: "catalogo_juegos",
        records: [],
        filteredRecords: [],
        currentRecord: null,
        uploadedObjectPath: null,
        galleryItems: [],
        galleryDeleted: [],
        galleryUploadedPaths: [],
        toastTimer: null
    };

    const elements = {};

    document.addEventListener("DOMContentLoaded", initializePanel);

    async function initializePanel() {
        cacheElements();

        if (!window.laPosadaSupabaseReady || !window.laPosadaSupabase) {
            window.alert(
                "No se encontró la configuración de Supabase."
            );
            window.location.replace("login.html");
            return;
        }

        state.supabase = window.laPosadaSupabase;

        const { data, error } = await state.supabase.auth.getSession();

        if (error || !data.session) {
            window.location.replace("login.html");
            return;
        }

        state.session = data.session;
        elements.userEmail.textContent =
            state.session.user.email || "Dueño";

        state.supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT" || !session) {
                window.location.replace("login.html");
            }
        });

        bindEvents();
        updateSection();
        await loadRecords();
    }

    function cacheElements() {
        elements.navButtons =
            document.querySelectorAll(".owner-nav-button");
        elements.sidebar =
            document.querySelector(".owner-sidebar");
        elements.sidebarBackdrop =
            document.getElementById("owner-sidebar-backdrop");
        elements.menuToggle =
            document.getElementById("owner-menu-toggle");
        elements.logout =
            document.getElementById("owner-logout");
        elements.userEmail =
            document.getElementById("owner-user-email");

        elements.sectionTitle =
            document.getElementById("owner-section-title");
        elements.sectionEyebrow =
            document.getElementById("owner-section-eyebrow");
        elements.listTitle =
            document.getElementById("owner-list-title");
        elements.sectionDescription =
            document.getElementById("owner-section-description");
        elements.summaryIcon =
            document.getElementById("owner-summary-icon");
        elements.recordCount =
            document.getElementById("owner-record-count");

        elements.newRecord =
            document.getElementById("owner-new-record");
        elements.search =
            document.getElementById("owner-search");
        elements.refresh =
            document.getElementById("owner-refresh");
        elements.status =
            document.getElementById("owner-status");
        elements.records =
            document.getElementById("owner-records");

        elements.editor =
            document.getElementById("owner-editor");
        elements.editorForm =
            document.getElementById("owner-editor-form");
        elements.editorEyebrow =
            document.getElementById("owner-editor-eyebrow");
        elements.editorTitle =
            document.getElementById("owner-editor-title");
        elements.formFields =
            document.getElementById("owner-form-fields");
        elements.editorMessage =
            document.getElementById("owner-editor-message");
        elements.saveRecord =
            document.getElementById("owner-save-record");

        elements.imageEditor =
            document.getElementById("owner-image-editor");
        elements.imageFile =
            document.getElementById("owner-image-file");
        elements.imageUrl =
            document.getElementById("owner-image-url");
        elements.imagePreview =
            document.getElementById("owner-image-preview");
        elements.imagePreviewEmpty =
            document.getElementById("owner-image-preview-empty");
        elements.imageRemove =
            document.getElementById("owner-image-remove");
        elements.imageRemoveWrap =
            document.getElementById("owner-image-remove-wrap");

        elements.galleryEditor =
            document.getElementById("owner-gallery-editor");
        elements.galleryCount =
            document.getElementById("owner-gallery-count");
        elements.galleryItems =
            document.getElementById("owner-gallery-items");
        elements.galleryAdd =
            document.getElementById("owner-gallery-add");
        elements.galleryFiles =
            document.getElementById("owner-gallery-files");
        elements.galleryUrl =
            document.getElementById("owner-gallery-url");
        elements.galleryUrlAdd =
            document.getElementById("owner-gallery-url-add");

        elements.toast =
            document.getElementById("owner-toast");
    }

    function bindEvents() {
        elements.navButtons.forEach((button) => {
            button.addEventListener("click", async () => {
                state.activeTable = button.dataset.table;
                state.currentRecord = null;
                elements.search.value = "";

                elements.navButtons.forEach((item) => {
                    item.classList.toggle(
                        "owner-nav-button--active",
                        item === button
                    );
                });

                closeSidebar();
                updateSection();
                await loadRecords();
            });
        });

        elements.newRecord.addEventListener("click", () => {
            openEditor(null);
        });

        elements.refresh.addEventListener("click", loadRecords);
        elements.search.addEventListener("input", filterRecords);
        elements.logout.addEventListener("click", logout);

        elements.menuToggle.addEventListener("click", toggleSidebar);
        elements.sidebarBackdrop.addEventListener("click", closeSidebar);

        document.querySelectorAll("[data-close-editor]").forEach((button) => {
            button.addEventListener("click", closeEditor);
        });

        elements.editorForm.addEventListener("submit", saveRecord);
        elements.imageFile.addEventListener("change", previewSelectedFile);
        elements.imageUrl.addEventListener("input", previewUrl);
        elements.imageRemove.addEventListener("change", handleRemoveImage);
        elements.galleryFiles.addEventListener(
            "change",
            addGalleryFiles
        );
        elements.galleryUrlAdd.addEventListener(
            "click",
            addGalleryUrl
        );
        elements.galleryUrl.addEventListener(
            "keydown",
            (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    addGalleryUrl();
                }
            }
        );

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !elements.editor.hidden) {
                closeEditor();
            }
        });
    }

    function updateSection() {
        const config = currentConfig();

        elements.sectionTitle.textContent = config.label;
        elements.sectionEyebrow.textContent = config.eyebrow;
        elements.listTitle.textContent = config.listTitle;
        elements.sectionDescription.textContent = config.description;
        elements.summaryIcon.textContent = config.icon;
        elements.newRecord.innerHTML =
            `<span class="material-symbols-outlined">add</span> Añadir ${config.singular}`;
    }

    async function loadRecords() {
        const config = currentConfig();

        showStatus("loading", `Cargando ${config.label.toLowerCase()}...`);
        elements.records.replaceChildren();

        let query = state.supabase
            .from(state.activeTable)
            .select("*");

        if (config.orderBy) {
            query = query.order(config.orderBy, {
                ascending: config.ascending ?? false
            });
        }

        const { data, error } = await query;

        if (error) {
            console.error(
                `Error al cargar ${state.activeTable}:`,
                error
            );

            showStatus(
                "error",
                "No se pudieron cargar los registros. Revisa las políticas RLS y que tu usuario esté registrado como dueño."
            );
            return;
        }

        state.records = Array.isArray(data) ? data : [];
        state.filteredRecords = [...state.records];

        renderRecords();
    }

    function filterRecords() {
        const query = normalizeText(elements.search.value);

        if (!query) {
            state.filteredRecords = [...state.records];
        } else {
            state.filteredRecords = state.records.filter((record) => {
                return normalizeText(
                    Object.values(record)
                        .filter((value) => value !== null)
                        .join(" ")
                ).includes(query);
            });
        }

        renderRecords();
    }

    function renderRecords() {
        elements.records.replaceChildren();
        elements.recordCount.textContent = String(state.records.length);

        if (state.filteredRecords.length === 0) {
            showStatus(
                "empty",
                state.records.length === 0
                    ? "Todavía no hay registros en esta sección."
                    : "No se encontraron coincidencias."
            );
            return;
        }

        hideStatus();

        const fragment = document.createDocumentFragment();

        state.filteredRecords.forEach((record) => {
            fragment.appendChild(createRecordCard(record));
        });

        elements.records.appendChild(fragment);
    }

    function createRecordCard(record) {
        const config = currentConfig();
        const article = document.createElement("article");

        article.className = "owner-record-card";

        const imageWrap = document.createElement("div");
        imageWrap.className = "owner-record-card__image-wrap";

        const image = createImage(
            record[config.imageField],
            record[config.titleField] || `${config.singular} ${record.id}`,
            "owner-record-card__image"
        );

        imageWrap.appendChild(image);

        const body = document.createElement("div");
        body.className = "owner-record-card__body";

        const title = document.createElement("h3");
        title.textContent = config.titleField
            ? record[config.titleField] || `Sin ${config.titleField}`
            : `Anuncio #${record.id}`;

        const metadata = document.createElement("div");
        metadata.className = "owner-record-card__meta";

        config.meta(record).forEach((value) => {
            const span = document.createElement("span");
            span.textContent = value;
            metadata.appendChild(span);
        });

        body.append(title, metadata);

        const actions = document.createElement("div");
        actions.className = "owner-record-card__actions";

        const edit = actionButton(
            "edit",
            "Editar",
            "owner-record-card__edit",
            () => openEditor(record)
        );

        const remove = actionButton(
            "delete",
            "Eliminar",
            "owner-record-card__delete",
            () => deleteRecord(record)
        );

        actions.append(edit, remove);
        article.append(imageWrap, body, actions);

        return article;
    }

    function actionButton(iconName, text, className, handler) {
        const button = document.createElement("button");

        button.className = className;
        button.type = "button";
        button.innerHTML =
            `<span class="material-symbols-outlined">${iconName}</span>${text}`;

        button.addEventListener("click", handler);

        return button;
    }

    async function openEditor(record) {
        const config = currentConfig();

        state.currentRecord = record ? { ...record } : null;
        state.uploadedObjectPath = null;
        resetGalleryState();

        elements.editorEyebrow.textContent =
            record ? "Editar registro" : "Nuevo registro";

        elements.editorTitle.textContent =
            record
                ? `Editar ${config.singular}`
                : `Añadir ${config.singular}`;

        elements.formFields.replaceChildren();
        clearEditorMessage();

        config.fields.forEach((definition) => {
            elements.formFields.appendChild(
                createFormField(definition, record)
            );
        });

        bindConditionalFields();
        updateConditionalFields();

        const imageUrl =
            record?.[config.imageField] || "";

        elements.imageFile.value = "";
        elements.imageUrl.value = imageUrl;
        elements.imageRemove.checked = false;
        elements.imageRemoveWrap.hidden = !imageUrl;

        setImagePreview(imageUrl);

        const isStore = state.activeTable === "tienda";
        elements.galleryEditor.hidden = !isStore;

        if (isStore && record?.id) {
            await loadStoreGallery(record.id);
        } else {
            renderGalleryEditor();
        }

        elements.editor.hidden = false;
        document.body.classList.add("owner-editor-open");

        requestAnimationFrame(() => {
            elements.editor.classList.add("owner-editor--open");

            elements.formFields
                .querySelector("input, select, textarea")
                ?.focus();
        });
    }

    function createFormField(definition, record) {
        if (definition.type === "checkbox") {
            const label = document.createElement("label");
            label.className = "owner-checkbox owner-checkbox--field";
            label.dataset.ownerFieldName = definition.name;

            const input = document.createElement("input");
            input.type = "checkbox";
            input.name = definition.name;

            const value = record
                ? record[definition.name]
                : definition.defaultValue;

            input.checked = Boolean(value);

            const text = document.createElement("span");
            text.textContent = definition.label;

            label.append(input, text);
            return label;
        }

        const label = document.createElement("label");
        label.className = "owner-field";
        label.dataset.ownerFieldName = definition.name;

        const text = document.createElement("span");
        text.className = "owner-field__label";
        text.textContent = definition.label;

        const value =
            record?.[definition.name] ??
            definition.defaultValue ??
            "";

        let input;

        if (definition.type === "textarea") {
            input = document.createElement("textarea");
            input.rows = 4;
            input.value = value;
        } else if (definition.type === "select") {
            input = document.createElement("select");

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Seleccionar...";
            placeholder.disabled = definition.required;
            placeholder.selected = value === "";

            input.appendChild(placeholder);

            definition.options.forEach((optionValue) => {
                const option = document.createElement("option");
                option.value = optionValue;
                option.textContent = optionValue;
                option.selected = optionValue === value;
                input.appendChild(option);
            });
        } else {
            input = document.createElement("input");
            input.type = definition.type;
            input.value = value;
        }

        input.name = definition.name;
        input.required = Boolean(definition.required);

        if (definition.placeholder) {
            input.placeholder = definition.placeholder;
        }

        if (definition.min !== undefined) {
            input.min = String(definition.min);
        }

        if (definition.max !== undefined) {
            input.max = String(definition.max);
        }

        if (definition.step !== undefined) {
            input.step = String(definition.step);
        }

        label.append(text, input);
        return label;
    }

    function bindConditionalFields() {
        const controllers = elements.formFields.querySelectorAll(
            '[name="formato"], [name="clase_producto"]'
        );

        controllers.forEach((controller) => {
            controller.addEventListener(
                "change",
                updateConditionalFields
            );
        });
    }

    function updateConditionalFields() {
        const config = currentConfig();

        config.fields.forEach((definition) => {
            const wrapper = elements.formFields.querySelector(
                `[data-owner-field-name="${definition.name}"]`
            );

            if (!wrapper) {
                return;
            }

            const input = wrapper.querySelector(
                `[name="${definition.name}"]`
            );

            if (!input) {
                return;
            }

            let visible = true;

            if (definition.showWhen) {
                const controller = elements.formFields.querySelector(
                    `[name="${definition.showWhen.name}"]`
                );

                const controllerValue =
                    controller?.value || "";

                visible =
                    definition.showWhen.values.includes(
                        controllerValue
                    );
            }

            wrapper.hidden = !visible;
            input.disabled = !visible;

            input.required =
                visible &&
                Boolean(
                    definition.required ||
                    definition.requiredWhenVisible
                );
        });
    }

    function closeEditor() {
        if (elements.saveRecord.disabled) {
            return;
        }

        elements.editor.classList.remove("owner-editor--open");
        document.body.classList.remove("owner-editor-open");

        window.setTimeout(() => {
            elements.editor.hidden = true;
            elements.editorForm.reset();
            state.currentRecord = null;
            state.uploadedObjectPath = null;
            resetGalleryState();
        }, 190);
    }

    async function saveRecord(event) {
        event.preventDefault();
        clearEditorMessage();

        const config = currentConfig();
        const formData = new FormData(elements.editorForm);
        const payload = {};

        for (const definition of config.fields) {
            const input = elements.formFields.querySelector(
                `[name="${definition.name}"]`
            );

            if (input?.disabled) {
                payload[definition.name] = null;
                continue;
            }

            if (definition.type === "checkbox") {
                payload[definition.name] = input.checked;
                continue;
            }

            const rawValue = formData.get(definition.name);

            if (definition.type === "number") {
                payload[definition.name] =
                    rawValue === null || rawValue === ""
                        ? null
                        : Number(rawValue);
            } else {
                payload[definition.name] =
                    typeof rawValue === "string"
                        ? rawValue.trim()
                        : rawValue;
            }
        }

        const oldImageUrl =
            state.currentRecord?.[config.imageField] || "";

        let newImageUrl = elements.imageUrl.value.trim();
        const selectedFile = elements.imageFile.files[0];
        let savedRecordId = state.currentRecord?.id || null;
        let createdNewRecord = false;

        state.galleryUploadedPaths = [];
        setSaving(true);

        try {
            if (elements.imageRemove.checked) {
                newImageUrl = "";
            } else if (selectedFile) {
                const upload = await uploadImage(
                    selectedFile,
                    state.activeTable
                );

                newImageUrl = upload.publicUrl;
                state.uploadedObjectPath = upload.path;
            }

            if (!newImageUrl && state.activeTable === "anuncios") {
                throw new Error(
                    "Selecciona una imagen para publicar el anuncio."
                );
            }

            payload[config.imageField] =
                newImageUrl || null;

            if (state.currentRecord) {
                const { error } = await state.supabase
                    .from(state.activeTable)
                    .update(payload)
                    .eq("id", state.currentRecord.id);

                if (error) {
                    throw error;
                }
            } else {
                const { data, error } = await state.supabase
                    .from(state.activeTable)
                    .insert(payload)
                    .select("id")
                    .single();

                if (error) {
                    throw error;
                }

                savedRecordId = data.id;
                createdNewRecord = true;
            }

            if (state.activeTable === "tienda") {
                await saveStoreGallery(savedRecordId);
            }

            if (
                oldImageUrl &&
                oldImageUrl !== newImageUrl
            ) {
                await removeStoredImage(oldImageUrl);
            }

            showToast(
                state.currentRecord
                    ? "Registro actualizado correctamente."
                    : "Registro añadido correctamente."
            );

            setSaving(false);
            closeEditor();
            await loadRecords();
        } catch (error) {
            console.error("Error al guardar:", error);

            const rollbackPaths = [
                state.uploadedObjectPath,
                ...state.galleryUploadedPaths
            ].filter(Boolean);

            if (rollbackPaths.length > 0) {
                await state.supabase.storage
                    .from(BUCKET)
                    .remove(rollbackPaths);
            }

            if (createdNewRecord && savedRecordId) {
                await state.supabase
                    .from(state.activeTable)
                    .delete()
                    .eq("id", savedRecordId);
            }

            state.uploadedObjectPath = null;
            state.galleryUploadedPaths = [];

            showEditorMessage(
                error.message ||
                "No se pudo guardar el registro."
            );

            setSaving(false);
        }
    }

    async function deleteRecord(record) {
        const config = currentConfig();

        const title = config.titleField
            ? record[config.titleField]
            : `Anuncio #${record.id}`;

        const confirmed = window.confirm(
            `¿Eliminar "${title}"?\n\nEsta acción no se puede deshacer.`
        );

        if (!confirmed) {
            return;
        }

        let storeGallery = [];

        if (state.activeTable === "tienda") {
            const { data } = await state.supabase
                .from("tienda_imagenes")
                .select("imagen_url")
                .eq("tienda_id", record.id);

            storeGallery = Array.isArray(data) ? data : [];
        }

        const { error } = await state.supabase
            .from(state.activeTable)
            .delete()
            .eq("id", record.id);

        if (error) {
            console.error("Error al eliminar:", error);

            showToast(
                "No se pudo eliminar el registro.",
                true
            );
            return;
        }

        await removeStoredImage(record[config.imageField]);

        for (const image of storeGallery) {
            await removeStoredImage(image.imagen_url);
        }

        showToast("Registro eliminado.");
        await loadRecords();
    }

    function resetGalleryState() {
        state.galleryItems.forEach((item) => {
            if (item.kind === "pending" && item.previewUrl) {
                URL.revokeObjectURL(item.previewUrl);
            }
        });

        state.galleryItems = [];
        state.galleryDeleted = [];
        state.galleryUploadedPaths = [];

        if (elements.galleryFiles) {
            elements.galleryFiles.value = "";
        }

        if (elements.galleryUrl) {
            elements.galleryUrl.value = "";
        }

        if (elements.galleryItems) {
            elements.galleryItems.replaceChildren();
        }
    }

    async function loadStoreGallery(storeId) {
        showEditorMessage("Cargando las imágenes adicionales...");

        const { data, error } = await state.supabase
            .from("tienda_imagenes")
            .select("id,tienda_id,imagen_url,orden")
            .eq("tienda_id", storeId)
            .order("orden", { ascending: true });

        clearEditorMessage();

        if (error) {
            console.error("Error al cargar la galería:", error);
            showEditorMessage(
                "No se pudieron cargar las imágenes adicionales."
            );
            renderGalleryEditor();
            return;
        }

        state.galleryItems = (Array.isArray(data) ? data : [])
            .slice(0, MAX_EXTRA_STORE_IMAGES)
            .map((item) => ({
                kind: "existing",
                id: item.id,
                imagen_url: item.imagen_url,
                orden: Number(item.orden) || 1
            }));

        renderGalleryEditor();
    }

    function addGalleryFiles() {
        if (state.activeTable !== "tienda") {
            return;
        }

        const selected = Array.from(
            elements.galleryFiles.files || []
        );

        const available =
            MAX_EXTRA_STORE_IMAGES - state.galleryItems.length;

        if (available <= 0) {
            showEditorMessage(
                "Este producto ya alcanzó el máximo de 5 imágenes."
            );
            elements.galleryFiles.value = "";
            return;
        }

        const accepted = [];

        for (const file of selected.slice(0, available)) {
            try {
                validateImage(file);
                accepted.push(file);
            } catch (error) {
                showEditorMessage(error.message);
            }
        }

        accepted.forEach((file) => {
            state.galleryItems.push({
                kind: "pending",
                tempId:
                    crypto.randomUUID?.() ||
                    `${Date.now()}-${Math.random()}`,
                file,
                previewUrl: URL.createObjectURL(file)
            });
        });

        if (selected.length > accepted.length) {
            showEditorMessage(
                "Solo se añadieron las imágenes disponibles hasta completar el máximo de 5."
            );
        } else if (accepted.length > 0) {
            clearEditorMessage();
        }

        elements.galleryFiles.value = "";
        renderGalleryEditor();
    }

    function addGalleryUrl() {
        if (state.activeTable !== "tienda") {
            return;
        }

        const value = elements.galleryUrl.value.trim();

        if (!value) {
            showEditorMessage(
                "Pega el enlace público de una imagen."
            );
            return;
        }

        let parsedUrl;

        try {
            parsedUrl = new URL(value);
        } catch {
            showEditorMessage(
                "El enlace de la imagen no es válido."
            );
            return;
        }

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            showEditorMessage(
                "El enlace debe comenzar con http:// o https://."
            );
            return;
        }

        if (state.galleryItems.length >= MAX_EXTRA_STORE_IMAGES) {
            showEditorMessage(
                "Este producto ya alcanzó el máximo de 5 imágenes."
            );
            return;
        }

        const normalizedUrl = parsedUrl.href;
        const mainImageUrl = elements.imageUrl.value.trim();

        const alreadyExists =
            normalizedUrl === mainImageUrl ||
            state.galleryItems.some((item) => {
                return item.imagen_url === normalizedUrl;
            });

        if (alreadyExists) {
            showEditorMessage(
                "Esa imagen ya está agregada."
            );
            return;
        }

        state.galleryItems.push({
            kind: "url",
            tempId:
                crypto.randomUUID?.() ||
                `${Date.now()}-${Math.random()}`,
            imagen_url: normalizedUrl
        });

        elements.galleryUrl.value = "";
        clearEditorMessage();
        renderGalleryEditor();
    }

    function renderGalleryEditor() {
        if (!elements.galleryEditor) {
            return;
        }

        const isStore = state.activeTable === "tienda";
        elements.galleryEditor.hidden = !isStore;

        if (!isStore) {
            return;
        }

        elements.galleryItems.replaceChildren();

        const fragment = document.createDocumentFragment();

        state.galleryItems.forEach((item, index) => {
            fragment.appendChild(
                createGalleryItem(item, index)
            );
        });

        elements.galleryItems.appendChild(fragment);

        const totalImages =
            (hasMainImage() ? 1 : 0) + state.galleryItems.length;

        elements.galleryCount.textContent =
            `${totalImages} de 5 imágenes`;

        const full =
            state.galleryItems.length >= MAX_EXTRA_STORE_IMAGES;

        elements.galleryAdd.classList.toggle(
            "owner-gallery-add--disabled",
            full
        );

        elements.galleryFiles.disabled = full;
        elements.galleryUrl.disabled = full;
        elements.galleryUrlAdd.disabled = full;

        elements.galleryAdd.querySelector("strong").textContent =
            full
                ? "Límite de imágenes alcanzado"
                : "Añadir imágenes";
    }

    function createGalleryItem(item, index) {
        const article = document.createElement("article");
        article.className = "owner-gallery-item";

        const image = document.createElement("img");
        image.alt = `Imagen adicional ${index + 1}`;
        image.src =
            item.kind === "pending"
                ? item.previewUrl
                : item.imagen_url;

        image.addEventListener("error", () => {
            image.src = FALLBACK_IMAGE;
        }, { once: true });

        const order = document.createElement("span");
        order.className = "owner-gallery-item__order";
        order.textContent = String(index + 2);
        order.title = "Posición dentro del carrusel";

        const remove = document.createElement("button");
        remove.className = "owner-gallery-item__remove";
        remove.type = "button";
        remove.setAttribute(
            "aria-label",
            `Eliminar imagen adicional ${index + 1}`
        );
        remove.innerHTML =
            '<span class="material-symbols-outlined">delete</span>';
        remove.addEventListener("click", () => {
            removeGalleryItem(index);
        });

        const controls = document.createElement("div");
        controls.className = "owner-gallery-item__controls";

        const previous = createGalleryMoveButton(
            "arrow_back",
            "Mover imagen a la izquierda",
            index === 0,
            () => moveGalleryItem(index, -1)
        );

        const next = createGalleryMoveButton(
            "arrow_forward",
            "Mover imagen a la derecha",
            index === state.galleryItems.length - 1,
            () => moveGalleryItem(index, 1)
        );

        controls.append(previous, next);
        article.append(image, order, remove, controls);

        return article;
    }

    function createGalleryMoveButton(
        iconName,
        label,
        disabled,
        handler
    ) {
        const button = document.createElement("button");
        button.className = "owner-gallery-item__move";
        button.type = "button";
        button.disabled = disabled;
        button.setAttribute("aria-label", label);
        button.innerHTML =
            `<span class="material-symbols-outlined">${iconName}</span>`;
        button.addEventListener("click", handler);

        return button;
    }

    function removeGalleryItem(index) {
        const [item] = state.galleryItems.splice(index, 1);

        if (!item) {
            return;
        }

        if (item.kind === "pending") {
            URL.revokeObjectURL(item.previewUrl);
        } else if (item.kind === "existing") {
            state.galleryDeleted.push(item);
        }

        clearEditorMessage();
        renderGalleryEditor();
    }

    function moveGalleryItem(index, change) {
        const destination = index + change;

        if (
            destination < 0 ||
            destination >= state.galleryItems.length
        ) {
            return;
        }

        const [item] = state.galleryItems.splice(index, 1);
        state.galleryItems.splice(destination, 0, item);
        renderGalleryEditor();
    }

    function hasMainImage() {
        if (elements.imageRemove.checked) {
            return false;
        }

        return Boolean(
            elements.imageFile.files[0] ||
            elements.imageUrl.value.trim() ||
            state.currentRecord?.[currentConfig().imageField]
        );
    }

    async function saveStoreGallery(storeId) {
        if (!storeId) {
            throw new Error(
                "No se pudo identificar el producto para guardar su galería."
            );
        }

        if (state.galleryItems.length > MAX_EXTRA_STORE_IMAGES) {
            throw new Error(
                "Solo se permiten cuatro imágenes adicionales."
            );
        }

        const deletedIds = state.galleryDeleted
            .map((item) => item.id)
            .filter(Boolean);

        if (deletedIds.length > 0) {
            const { error } = await state.supabase
                .from("tienda_imagenes")
                .delete()
                .in("id", deletedIds);

            if (error) {
                throw new Error(
                    `No se pudieron eliminar imágenes anteriores: ${error.message}`
                );
            }
        }

        const deletedUrls = state.galleryDeleted
            .map((item) => item.imagen_url)
            .filter(Boolean);

        for (const url of deletedUrls) {
            await removeStoredImage(url);
        }

        for (let index = 0; index < state.galleryItems.length; index += 1) {
            const item = state.galleryItems[index];
            const order = index + 1;

            if (item.kind === "existing") {
                const { error } = await state.supabase
                    .from("tienda_imagenes")
                    .update({ orden: order })
                    .eq("id", item.id);

                if (error) {
                    throw new Error(
                        `No se pudo ordenar la galería: ${error.message}`
                    );
                }

                continue;
            }

            if (item.kind === "url") {
                const { error } = await state.supabase
                    .from("tienda_imagenes")
                    .insert({
                        tienda_id: storeId,
                        imagen_url: item.imagen_url,
                        orden: order
                    });

                if (error) {
                    throw new Error(
                        `No se pudo registrar el enlace de la galería: ${error.message}`
                    );
                }

                continue;
            }

            const upload = await uploadImage(
                item.file,
                `tienda/${storeId}/galeria`
            );

            state.galleryUploadedPaths.push(upload.path);

            const { error } = await state.supabase
                .from("tienda_imagenes")
                .insert({
                    tienda_id: storeId,
                    imagen_url: upload.publicUrl,
                    orden: order
                });

            if (error) {
                throw new Error(
                    `No se pudo registrar una imagen de la galería: ${error.message}`
                );
            }
        }
    }

    async function uploadImage(file, tableName) {
        validateImage(file);

        const extension =
            file.name.split(".").pop()?.toLowerCase() || "jpg";

        const randomId =
            crypto.randomUUID?.() ||
            `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const path =
            `${tableName}/${Date.now()}-${randomId}.${extension}`;

        const { error } = await state.supabase.storage
            .from(BUCKET)
            .upload(path, file, {
                cacheControl: "3600",
                contentType: file.type,
                upsert: false
            });

        if (error) {
            throw new Error(
                `No se pudo subir la imagen: ${error.message}`
            );
        }

        const { data } = state.supabase.storage
            .from(BUCKET)
            .getPublicUrl(path);

        if (!data?.publicUrl) {
            throw new Error(
                "La imagen se subió, pero no se pudo obtener su URL pública."
            );
        }

        return {
            path,
            publicUrl: data.publicUrl
        };
    }

    function validateImage(file) {
        const allowed = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowed.includes(file.type)) {
            throw new Error(
                "Solo se permiten imágenes JPG, PNG o WEBP."
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            throw new Error(
                "La imagen supera el máximo de 5 MB."
            );
        }
    }

    async function removeStoredImage(url) {
        const path = extractStoragePath(url);

        if (!path) {
            return;
        }

        const { error } = await state.supabase.storage
            .from(BUCKET)
            .remove([path]);

        if (error) {
            console.warn(
                "No se pudo borrar la imagen anterior:",
                error
            );
        }
    }

    function extractStoragePath(url) {
        if (!url || typeof url !== "string") {
            return null;
        }

        const marker =
            `/storage/v1/object/public/${BUCKET}/`;

        const index = url.indexOf(marker);

        if (index === -1) {
            return null;
        }

        return decodeURIComponent(
            url
                .slice(index + marker.length)
                .split("?")[0]
        );
    }

    function previewSelectedFile() {
        const file = elements.imageFile.files[0];

        if (!file) {
            setImagePreview(elements.imageUrl.value.trim());
            renderGalleryEditor();
            return;
        }

        try {
            validateImage(file);
        } catch (error) {
            showEditorMessage(error.message);
            elements.imageFile.value = "";
            return;
        }

        elements.imageRemove.checked = false;

        const reader = new FileReader();

        reader.addEventListener("load", () => {
            setImagePreview(reader.result);
            renderGalleryEditor();
        });

        reader.readAsDataURL(file);
    }

    function previewUrl() {
        if (elements.imageFile.files.length > 0) {
            return;
        }

        elements.imageRemove.checked = false;
        setImagePreview(elements.imageUrl.value.trim());
        renderGalleryEditor();
    }

    function handleRemoveImage() {
        if (elements.imageRemove.checked) {
            elements.imageFile.value = "";
            elements.imageUrl.value = "";
            setImagePreview("");
            renderGalleryEditor();
        } else {
            const config = currentConfig();

            setImagePreview(
                state.currentRecord?.[config.imageField] || ""
            );
            renderGalleryEditor();
        }
    }

    function setImagePreview(url) {
        const hasImage = Boolean(url);

        elements.imagePreview.src =
            hasImage ? url : FALLBACK_IMAGE;

        elements.imagePreview.classList.toggle(
            "owner-image-preview__image--empty",
            !hasImage
        );

        elements.imagePreviewEmpty.hidden = hasImage;
    }

    async function logout() {
        elements.logout.disabled = true;

        const { error } = await state.supabase.auth.signOut();

        if (error) {
            console.error("Error al cerrar sesión:", error);
            elements.logout.disabled = false;
            showToast(
                "No se pudo cerrar la sesión.",
                true
            );
        }
    }

    function toggleSidebar() {
        const open =
            elements.sidebar.classList.toggle(
                "owner-sidebar--open"
            );

        elements.sidebarBackdrop.hidden = !open;
    }

    function closeSidebar() {
        elements.sidebar.classList.remove(
            "owner-sidebar--open"
        );

        elements.sidebarBackdrop.hidden = true;
    }

    function setSaving(isSaving) {
        elements.saveRecord.disabled = isSaving;

        elements.saveRecord.innerHTML = isSaving
            ? '<span class="owner-button-loader"></span> Guardando...'
            : '<span class="material-symbols-outlined">save</span> Guardar';
    }

    function showStatus(type, message) {
        elements.status.className =
            `owner-status owner-status--${type}`;

        elements.status.replaceChildren();

        if (type === "loading") {
            const loader = document.createElement("span");
            loader.className = "owner-loader";
            elementAriaHidden(loader);
            elements.status.appendChild(loader);
        } else {
            const icon = document.createElement("span");
            icon.className = "material-symbols-outlined";
            icon.textContent =
                type === "error"
                    ? "error"
                    : type === "empty"
                        ? "inventory_2"
                        : "info";
            elementAriaHidden(icon);
            elements.status.appendChild(icon);
        }

        const paragraph = document.createElement("p");
        paragraph.textContent = message;
        elements.status.appendChild(paragraph);
    }

    function hideStatus() {
        elements.status.className =
            "owner-status owner-status--hidden";

        elements.status.replaceChildren();
    }

    function showEditorMessage(message) {
        elements.editorMessage.textContent = message;
        elements.editorMessage.classList.add(
            "owner-editor-form__message--visible"
        );
    }

    function clearEditorMessage() {
        elements.editorMessage.textContent = "";
        elements.editorMessage.classList.remove(
            "owner-editor-form__message--visible"
        );
    }

    function showToast(message, isError = false) {
        elements.toast.textContent = message;
        elements.toast.classList.toggle(
            "owner-toast--error",
            isError
        );
        elements.toast.classList.add(
            "owner-toast--visible"
        );

        window.clearTimeout(state.toastTimer);

        state.toastTimer = window.setTimeout(() => {
            elements.toast.classList.remove(
                "owner-toast--visible"
            );
        }, 2600);
    }

    function currentConfig() {
        return TABLES[state.activeTable];
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

    function field(name, label, type, options = {}) {
        return {
            name,
            label,
            type,
            ...options
        };
    }

    function selectField(name, label, options, settings = {}) {
        return field(
            name,
            label,
            "select",
            {
                options,
                ...settings
            }
        );
    }

    function formatPlayers(record) {
        const min = Number(record.jugadores_min) || 0;
        const max = Number(record.jugadores_max) || 0;

        if (!min && !max) {
            return "Sin jugadores";
        }

        if (!max || min === max) {
            return `${min || max} jugadores`;
        }

        return `${min}–${max} jugadores`;
    }

    function formatDuration(minutes) {
        const value = Number(minutes) || 0;

        return value ? `${value} min` : "Sin duración";
    }

    function formatPrice(value) {
        const price = Number(value);

        if (!Number.isFinite(price)) {
            return "Sin precio";
        }

        return `Bs ${price.toLocaleString(
            "es-BO",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        )}`;
    }

    function getStockLabel(stockValue) {
        const stock = Number(stockValue) || 0;

        if (stock <= 0) {
            return "Agotado";
        }

        if (stock <= 3) {
            return "Últimas unidades";
        }

        return "Disponible";
    }

    function normalizeText(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function elementAriaHidden(element) {
        element.setAttribute("aria-hidden", "true");
    }
})();
