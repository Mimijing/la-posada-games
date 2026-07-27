/* =========================================================
   LA POSADA GAMES AND DRINKS
   Configuración de Tailwind e interacciones
   ========================================================= */


/* =========================================================
   CONFIGURACIÓN DE TAILWIND
   ========================================================= */

tailwind.config = {
    darkMode: "class",

    theme: {
        extend: {
            colors: {
                "on-background": "#ffdbcd",
                "on-tertiary": "#4d2600",
                "secondary-fixed": "#f4e483",
                "secondary-fixed-dim": "#d7c86a",
                "inverse-surface": "#ffdbcd",
                "on-surface-variant": "#dcc1ae",
                error: "#ffb4ab",
                "on-secondary": "#383100",
                secondary: "#d7c86a",
                "surface-container-low": "#2b160d",
                "on-surface": "#ffdbcd",
                "tertiary-fixed-dim": "#ffb77d",
                "on-primary": "#5e122a",
                "surface-tint": "#ffb1c0",
                "on-secondary-fixed": "#201c00",
                "secondary-container": "#635800",
                "on-tertiary-fixed": "#2f1500",
                tertiary: "#ffb77d",
                "surface-container-high": "#3c241a",
                outline: "#a48c7a",
                "inverse-on-surface": "#432b20",
                "outline-variant": "#564334",
                "tertiary-fixed": "#ffdcc3",
                "surface-dim": "#220e06",
                primary: "#93000a",
                "error-container": "#93000a",
                "surface-container-highest": "#482f24",
                "on-tertiary-fixed-variant": "#6e3900",
                "surface-variant": "#482f24",
                "on-error-container": "#ffdad6",
                "on-secondary-container": "#decf70",
                "on-tertiary-container": "#633300",
                "on-primary-container": "#722239",
                surface: "#220e06",
                "primary-container": "#f78ba3",
                "tertiary-container": "#e79a58",
                "on-error": "#690005",
                "primary-fixed-dim": "#ffb1c0",
                "on-primary-fixed-variant": "#7c2940",
                "on-secondary-fixed-variant": "#504700",
                "surface-container": "#301a10",
                "surface-bright": "#4d3328",
                "surface-container-lowest": "#1b0903",
                "on-primary-fixed": "#3f0016",
                "inverse-primary": "#9a4157",
                "primary-fixed": "#ffd9df",
                background: "#220e06"
            },

            borderRadius: {
                DEFAULT: "0.125rem",
                lg: "0.25rem",
                xl: "0.5rem",
                full: "9999px"
            },

            spacing: {
                "container-max": "1200px",
                unit: "8px",
                gutter: "24px",
                "margin-desktop": "48px",
                "margin-mobile": "16px"
            },

            fontFamily: {
                "body-lg": ["Literata"],
                "headline-lg": ["EB Garamond"],
                "label-caps": ["EB Garamond"],
                "body-md": ["Literata"],
                "headline-md": ["EB Garamond"],
                "headline-sm": ["EB Garamond"],
                headline: ["EB Garamond"],
                display: ["EB Garamond"],
                body: ["Literata"],
                label: ["EB Garamond"]
            },

            fontSize: {
                "body-lg": [
                    "18px",
                    {
                        lineHeight: "28px",
                        fontWeight: "400"
                    }
                ],

                "headline-lg": [
                    "48px",
                    {
                        lineHeight: "56px",
                        letterSpacing: "-0.02em",
                        fontWeight: "700"
                    }
                ],

                "label-caps": [
                    "14px",
                    {
                        lineHeight: "20px",
                        letterSpacing: "0.1em",
                        fontWeight: "700"
                    }
                ],

                "body-md": [
                    "16px",
                    {
                        lineHeight: "24px",
                        fontWeight: "400"
                    }
                ],

                "headline-md": [
                    "32px",
                    {
                        lineHeight: "40px",
                        fontWeight: "600"
                    }
                ],

                "headline-sm": [
                    "24px",
                    {
                        lineHeight: "32px",
                        fontWeight: "600"
                    }
                ]
            }
        }
    }
};

(() => {
    const root = document.documentElement;

    root.classList.add("icons-loading");

    const mostrarIconos = () => {
        root.classList.remove("icons-loading");
        root.classList.add("icons-ready");
    };

    if (!document.fonts || !document.fonts.load) {
        window.addEventListener(
            "load",
            mostrarIconos,
            { once: true }
        );

        return;
    }

    Promise.race([
        document.fonts.load(
            '24px "Material Symbols Outlined"'
        ),

        new Promise((resolve) => {
            window.setTimeout(resolve, 3000);
        })
    ]).finally(mostrarIconos);
})();
/* =========================================================
   INTERACCIONES DEL MENÚ
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const navigationLinks = document.querySelectorAll(
        ".main-navigation__link"
    );

    /* Mantener en café oscuro el botón de la página actual */
    let currentPage = decodeURIComponent(
        window.location.pathname.split("/").pop() || "index.html"
    ).toLowerCase();

    navigationLinks.forEach((link) => {
        const href = link.getAttribute("href") || "";
        const linkPage = decodeURIComponent(
            href.split("?")[0].split("#")[0].split("/").pop()
        ).toLowerCase();

        const isCurrentPage = linkPage === currentPage;

        link.classList.toggle(
            "main-navigation__link--active",
            isCurrentPage
        );

        if (isCurrentPage) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }

        link.addEventListener("mouseenter", () => {
            const icon = link.querySelector(
                ".material-symbols-outlined"
            );

            if (icon) {
                icon.style.transition =
                    "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                icon.style.transform =
                    "scale(1.15) rotate(-5deg)";
            }
        });

        link.addEventListener("mouseleave", () => {
            const icon = link.querySelector(
                ".material-symbols-outlined"
            );

            if (icon) {
                icon.style.transform = "scale(1) rotate(0deg)";
            }
        });
    });

        /* =====================================================
       SCROLL PARA ANUNCIOS
       Solo se activa cuando existen más de dos anuncios
       ===================================================== */

    const announcementsList = document.querySelector(
        ".announcements-list"
    );

    if (announcementsList) {
        const numberOfAnnouncements =
            announcementsList.children.length;

        if (numberOfAnnouncements > 2) {
            announcementsList.classList.add(
                "announcements-list--scroll"
            );
        }
    }
});