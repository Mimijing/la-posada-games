(() => {
    "use strict";

    const elements = {};
    let supabase = null;

    document.addEventListener("DOMContentLoaded", initializeLogin);

    async function initializeLogin() {
        elements.form = document.getElementById("owner-login-form");
        elements.email = document.getElementById("owner-email");
        elements.password = document.getElementById("owner-password");
        elements.toggle = document.getElementById("owner-password-toggle");
        elements.submit = document.getElementById("owner-login-submit");
        elements.message = document.getElementById("owner-login-message");

        if (!window.laPosadaSupabaseReady || !window.laPosadaSupabase) {
            showMessage(
                "No se encontró la configuración de Supabase. Revisa ../js/supabase-config.js."
            );
            elements.submit.disabled = true;
            return;
        }

        supabase = window.laPosadaSupabase;

        const { data, error } = await supabase.auth.getSession();

        if (!error && data.session) {
            window.location.replace("panel.html");
            return;
        }

        elements.form.addEventListener("submit", signIn);
        elements.toggle.addEventListener("click", togglePassword);
    }

    async function signIn(event) {
        event.preventDefault();
        clearMessage();

        const email = elements.email.value.trim();
        const password = elements.password.value;

        if (!email || !password) {
            showMessage("Completa el correo y la contraseña.");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Error al iniciar sesión:", error);
            showMessage(
                "No se pudo iniciar sesión. Revisa el correo y la contraseña."
            );
            setLoading(false);
            return;
        }

        window.location.replace("panel.html");
    }

    function togglePassword() {
        const show = elements.password.type === "password";

        elements.password.type = show ? "text" : "password";

        const icon = elements.toggle.querySelector(
            ".material-symbols-outlined"
        );

        icon.textContent = show ? "visibility_off" : "visibility";

        elements.toggle.setAttribute(
            "aria-label",
            show ? "Ocultar contraseña" : "Mostrar contraseña"
        );
    }

    function setLoading(isLoading) {
        elements.submit.disabled = isLoading;

        elements.submit.innerHTML = isLoading
            ? '<span class="owner-button-loader"></span> Ingresando...'
            : '<span class="material-symbols-outlined">login</span> Entrar al panel';
    }

    function showMessage(message) {
        elements.message.textContent = message;
        elements.message.classList.add(
            "owner-login-form__message--visible"
        );
    }

    function clearMessage() {
        elements.message.textContent = "";
        elements.message.classList.remove(
            "owner-login-form__message--visible"
        );
    }
})();
