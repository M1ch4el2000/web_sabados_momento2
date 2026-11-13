document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    if (!form) return;

    let resultContainer = document.getElementById("recruitment-result");
    if (!resultContainer) {
        resultContainer = document.createElement("div");
        resultContainer.id = "recruitment-result";
        form.parentNode.insertBefore(resultContainer, form.nextSibling);
    }

    resultContainer.classList.add("recruitment-result");
    resultContainer.hidden = true;

    let submitBtn = form.querySelector("button[type='submit']");
    if (!submitBtn) {
        submitBtn = document.createElement("button");
        submitBtn.type = "submit";
        submitBtn.textContent = "Enviar";
        form.appendChild(submitBtn);
    }
    submitBtn.classList.add("recruitment-submit");

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
            if (!cumpleEdad) razones.push ? null : razones.push("La edad mínima requerida es 18 años.");
            else if (!cumpleEdad) razones.push("Edad insuficiente.");
            if (!cumpleAltura) razones.push("La altura mínima requerida es de 155 cm.");
            if (!pesoAdecuado) razones.push("Su índice de masa corporal indica que se encuentra fuera del rango de peso adecuado (bajo o sobrepeso).");

            mostrarMensaje(
                `ESTADO: NO APTO EN ESTE MOMENTO<br><br>` +
                `Recluta <strong>${nombre} ${apellido}</strong>, su solicitud para la ${ramaSeleccionada} no ha sido aprobada por los siguientes motivos:<br>` +
                `<ul class="recruitment-reasons">` +
                razones.map(r => `<li>${r}</li>`).join('') +
                `</ul><br><br>` +
                `<strong>Agradecemos sinceramente su interés en servir y proteger a la humanidad. ¡Manténgase firme, Soldado!</strong>`,
                false
            );
        }
    });

    function mostrarMensaje(htmlText, apto) {
        resultContainer.hidden = false;
        resultContainer.classList.toggle("recruitment-result--approved", apto);
        resultContainer.classList.toggle("recruitment-result--rejected", !apto);
        resultContainer.innerHTML = htmlText;
        
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
});


async function getContent(endpoint) {
    const URL = "https://6aef5cfbb9925b27ce16dbea.mockapi.io/data";
    try {
        const response = await fetch(`${URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("No se pudieron obtener los datos de la API:", error);
        return [];
    }
}

async function mostrarTarjetasDesdeAPI() {
    const datos = await getContent("tomas");
    
    const contenedor = document.getElementById("api-cards-container");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!Array.isArray(datos) || datos.length === 0) {
        const mensajeVacio = document.createElement("p");
        mensajeVacio.className = "api-cards-empty";
        mensajeVacio.textContent = "No hay registros disponibles en la red de la UNSC.";
        contenedor.appendChild(mensajeVacio);
        return;
    }

    datos.forEach(item => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "api-card";

        const nombreRecluta = item.name || item.nombre || "Registro UNSC";
        const apellido = item.apellido || item.lastName || item.lastname || "N/A";
        const edad = item.edad ?? item.age ?? "N/A";
        const peso = item.peso ?? item.weight ?? "N/A";
        const altura = item.altura ?? item.height ?? "N/A";
        const foto = [item.foto, item.photo, item.avatar, item.image, item.imagen]
            .find(valor => typeof valor === "string" && valor.trim());
        const contenedorFoto = document.createElement("div");
        contenedorFoto.className = "api-card__photo";
        const imagen = document.createElement("img");
        imagen.alt = `Foto de ${nombreRecluta}`;
        imagen.className = "api-card__image";

        const mostrarFotoNoDisponible = () => {
            const mensajeFoto = document.createElement("p");
            mensajeFoto.className = "api-card__photo-placeholder";
            mensajeFoto.textContent = "Foto no disponible";
            contenedorFoto.replaceChildren(mensajeFoto);
        };

        if (foto) {
            imagen.addEventListener("error", mostrarFotoNoDisponible, { once: true });
            imagen.src = foto.trim();
            contenedorFoto.appendChild(imagen);
        } else {
            mostrarFotoNoDisponible();
        }

        tarjeta.innerHTML = `
            <h3 class="api-card__title">
                ${nombreRecluta}
            </h3>
            <p class="api-card__field">
                <strong>ID de Registro:</strong> ${item.id || "N/A"}
            </p>
            <p class="api-card__field">
                <strong>Apellido:</strong> ${apellido}
            </p>
            <p class="api-card__field">
                <strong>Edad:</strong> ${edad} ${edad === "N/A" ? "" : "años"}
            </p>
            <p class="api-card__field">
                <strong>Peso:</strong> ${peso} ${peso === "N/A" ? "" : "kg"}
            </p>
            <p class="api-card__field">
                <strong>Altura:</strong> ${altura} ${altura === "N/A" ? "" : "cm"}
            </p>
            <p class="api-card__date">
                ${item.createdAt ? `<strong>Fecha de Alta:</strong> ${new Date(item.createdAt).toLocaleDateString()}` : ""}
            </p>
        `;

        tarjeta.prepend(contenedorFoto);
        contenedor.appendChild(tarjeta);
    });
}

document.addEventListener("DOMContentLoaded", () => {

    mostrarTarjetasDesdeAPI();
});