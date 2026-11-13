document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    if (!form) return;

    let resultContainer = document.getElementById("recruitment-result");
    if (!resultContainer) {
        const resultTemplate = document.getElementById("recruitment-result-template");
        resultContainer = resultTemplate.content.firstElementChild.cloneNode(true);
        form.parentNode.insertBefore(resultContainer, form.nextSibling);
    }

    resultContainer.classList.add("recruitment-result");
    resultContainer.hidden = true;

    let submitBtn = form.querySelector("button[type='submit']");
    if (!submitBtn) {
        const submitTemplate = document.getElementById("recruitment-submit-template");
        submitBtn = submitTemplate.content.firstElementChild.cloneNode(true);
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
            mostrarMensaje("invalid");
            return;
        }

        const cumpleEdad = edad >= 18;
        const cumpleAltura = altura >= 155;
        const alturaMetros = altura / 100;
        const imc = peso / (alturaMetros * alturaMetros);
        const pesoAdecuado = imc >= 18.5 && imc <= 24.9;
        const esApto = cumpleEdad && cumpleAltura && pesoAdecuado;

        if (esApto) {
            mostrarMensaje("approved", { nombre, apellido, id, rama: ramaSeleccionada });
        } else {
            let razones = [];
            if (!cumpleEdad) razones.push("La edad mínima requerida es 18 años.");
            if (!cumpleAltura) razones.push("La altura mínima requerida es de 155 cm.");
            if (!pesoAdecuado) razones.push("Su índice de masa corporal indica que se encuentra fuera del rango de peso adecuado (bajo o sobrepeso).");

            mostrarMensaje("rejected", { nombre, apellido, rama: ramaSeleccionada, razones });
        }
    });

    function mostrarMensaje(tipo, datos = {}) {
        resultContainer.hidden = false;
        resultContainer.classList.toggle("recruitment-result--approved", tipo === "approved");
        resultContainer.classList.toggle("recruitment-result--rejected", tipo !== "approved");

        resultContainer.querySelectorAll("[data-result]").forEach(section => {
            section.hidden = section.dataset.result !== tipo;
        });

        resultContainer.querySelectorAll("[data-candidate-name]").forEach(element => {
            element.textContent = `${datos.nombre} ${datos.apellido}`;
        });
        const candidateId = resultContainer.querySelector("[data-candidate-id]");
        if (candidateId) candidateId.textContent = datos.id;
        const branch = resultContainer.querySelector("[data-branch]");
        if (branch) branch.textContent = datos.rama;

        const reasonsList = resultContainer.querySelector("[data-reasons]");
        if (reasonsList) {
            const reasonTemplate = document.getElementById("recruitment-reason-template");
            reasonsList.replaceChildren();
            (datos.razones || []).forEach(reason => {
                const listItem = reasonTemplate.content.firstElementChild.cloneNode(true);
                listItem.textContent = reason;
                reasonsList.appendChild(listItem);
            });
        }

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

    if (!Array.isArray(datos) || datos.length === 0) {
        const emptyTemplate = document.getElementById("api-cards-empty-template");
        contenedor.replaceChildren(emptyTemplate.content.cloneNode(true));
        return;
    }

    const cardTemplate = document.getElementById("api-card-template");
    contenedor.replaceChildren();

    datos.forEach(item => {
        const tarjeta = cardTemplate.content.firstElementChild.cloneNode(true);

        const nombreRecluta = item.name || item.nombre || "Registro UNSC";
        const apellido = item.apellido || item.lastName || item.lastname || "N/A";
        const edad = item.edad ?? item.age ?? "N/A";
        const peso = item.peso ?? item.weight ?? "N/A";
        const altura = item.altura ?? item.height ?? "N/A";
        const foto = [item.foto, item.photo, item.avatar, item.image, item.imagen]
            .find(valor => typeof valor === "string" && valor.trim());
        const imagen = tarjeta.querySelector('[data-card-field="photo"]');
        const mensajeFoto = tarjeta.querySelector('[data-card-field="photo-placeholder"]');
        imagen.alt = `Foto de ${nombreRecluta}`;

        if (foto) {
            imagen.addEventListener("error", () => {
                imagen.hidden = true;
                mensajeFoto.hidden = false;
            }, { once: true });
            imagen.src = foto.trim();
            imagen.hidden = false;
        } else {
            mensajeFoto.hidden = false;
        }

        tarjeta.querySelector('[data-card-field="name"]').textContent = nombreRecluta;
        tarjeta.querySelector('[data-card-field="id"]').textContent = item.id ?? "N/A";
        tarjeta.querySelector('[data-card-field="surname"]').textContent = apellido;
        tarjeta.querySelector('[data-card-field="age"]').textContent =
            edad === "N/A" ? edad : `${edad} años`;
        tarjeta.querySelector('[data-card-field="weight"]').textContent =
            peso === "N/A" ? peso : `${peso} kg`;
        tarjeta.querySelector('[data-card-field="height"]').textContent =
            altura === "N/A" ? altura : `${altura} cm`;

        if (item.createdAt) {
            tarjeta.querySelector('[data-card-field="created-at"]').textContent =
                new Date(item.createdAt).toLocaleDateString();
            tarjeta.querySelector('[data-card-field="created-at-container"]').hidden = false;
        }

        contenedor.appendChild(tarjeta);
    });
}

document.addEventListener("DOMContentLoaded", () => {

    mostrarTarjetasDesdeAPI();
});