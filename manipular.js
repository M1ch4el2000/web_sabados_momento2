document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    if (!form) return;

    let resultContainer = document.getElementById("recruitment-result");
    if (!resultContainer) {
        resultContainer = document.createElement("div");
        resultContainer.id = "recruitment-result";
        resultContainer.style.marginTop = "1.5rem";
        resultContainer.style.padding = "1.5rem";
        resultContainer.style.borderRadius = "6px";
        resultContainer.style.width = "100%";
        resultContainer.style.textAlign = "center";
        resultContainer.style.display = "none";
        form.parentNode.insertBefore(resultContainer, form.nextSibling);
    }


    let submitBtn = form.querySelector("button[type='submit']");
    if (!submitBtn) {
        submitBtn = document.createElement("button");
        submitBtn.type = "submit";
        submitBtn.textContent = "Enviar Solicitud UNSC";
        submitBtn.style.gridColumn = "1 / -1";
        submitBtn.style.padding = "0.9rem";
        submitBtn.style.backgroundColor = "var(--accent-green)";
        submitBtn.style.color = "var(--text-main)";
        submitBtn.style.border = "1px solid var(--highlight)";
        submitBtn.style.cursor = "pointer";
        submitBtn.style.fontWeight = "bold";
        submitBtn.style.textTransform = "uppercase";
        submitBtn.style.letterSpacing = "1px";
        form.appendChild(submitBtn);
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault(); 
        const id = document.getElementById("id") ? document.getElementById("id").value.trim() : "";
        const nombre = document.getElementById("nombre") ? document.getElementById("nombre").value.trim() : "";
        const apellido = document.getElementById("apellido") ? document.getElementById("apellido").value.trim() : "";
        const edad = parseInt(document.getElementById("edad").value);
        const peso = parseFloat(document.getElementById("peso").value);
        const altura = parseFloat(document.getElementById("altura").value); 
        const selectRama = form.querySelector("select");
        const ramaSeleccionada = selectRama ? selectRama.value : "";

        if (isNaN(edad) || isNaN(peso) || isNaN(altura) || !id || !nombre || !apellido) {
            mostrarMensaje(
                "ADVERTENCIA DE LA UNSC: Por favor, complete todos los campos correctamente con valores numéricos válidos.",
                false
            );
            return;
        }

        const cumpleEdad = edad >= 18;
        const cumpleAltura = altura >= 155;
        const alturaMetros = altura / 100;
        const imc = peso / (alturaMetros * alturaMetros);
        const pesoAdecuado = imc >= 18.5 && imc <= 24.9;
        const esApto = cumpleEdad && cumpleAltura && pesoAdecuado;

        if (esApto) {
            mostrarMensaje(
                `¡ESTADO: APTO PARA SERVIR!<br><br>` +
                `Recluta <strong>${nombre} ${apellido}</strong> (${id}), seleccionado para: <em>${ramaSeleccionada}</em>.<br>` +
                `Usted cumple con los estándares físicos y de edad requeridos por el Mando Espacial.<br>` +
                `<strong>Debe presentarse en la oficina de reclutamiento de la UNSC más cercana que tenga para seguir el proceso.</strong>`,
                true
            );
        } else {
            let razones = [];
            if (!cumpleEdad) razones.puch ? null : razones.push("La edad mínima requerida es 18 años.");
            else if (!cumpleEdad) razones.push("Edad insuficiente.");
            if (!cumpleAltura) razones.push("La altura mínima requerida es de 155 cm.");
            if (!pesoAdecuado) razones.push("Su índice de masa corporal indica que se encuentra fuera del rango de peso adecuado (bajo o sobrepeso).");

            mostrarMensaje(
                `ESTADO: NO APTO EN ESTE MOMENTO<br><br>` +
                `Recluta <strong>${nombre} ${apellido}</strong>, su solicitud para la ${ramaSeleccionada} no ha sido aprobada por los siguientes motivos:<br>` +
                `<ul style="text-align: left; display: inline-block; margin-top: 0.5rem; color: var(--text-muted);">` +
                razones.map(r => `<li>${r}</li>`).join('') +
                `</ul><br><br>` +
                `<strong>Agradecemos sinceramente su interés en servir y proteger a la humanidad. ¡Manténgase firme, Soldado!</strong>`,
                false
            );
        }
    });

    function mostrarMensaje(htmlText, apto) {
        resultContainer.style.display = "block";
        resultContainer.innerHTML = htmlText;
        resultContainer.style.backgroundColor = apto ? "#132617" : "#2a1515";
        resultContainer.style.border = apto ? "1px solid var(--highlight)" : "1px solid #a33";
        resultContainer.style.color = apto ? "var(--text-main)" : "#e2b6b6";
        
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
});