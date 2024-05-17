document.addEventListener('DOMContentLoaded', () => {
    fetch('/listas')
        .then(response => response.json())
        .then(data => {
            const listaSelect = document.getElementById('lista');
            data.forEach(lista => {
                const option = document.createElement('option');
                option.value = lista.list_name_encoded;
                option.textContent = lista.display_name;
                option.dataset.oldestDate = lista.oldest_published_date;
                option.dataset.newestDate = lista.newest_published_date;
                option.dataset.updated = lista.updated;
                listaSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error:', error));
});

function actualizarFechas() {
    const listaSelect = document.getElementById('lista');
    const selectedOption = listaSelect.options[listaSelect.selectedIndex];
    const oldestDate = selectedOption.dataset.oldestDate;
    const newestDate = selectedOption.dataset.newestDate;
    const updated = selectedOption.dataset.updated;

    fetch(`/fechas?oldest_date=${oldestDate}&newest_date=${newestDate}&updated=${updated}`)
        .then(response => response.json())
        .then(data => {
            const fechaSelect = document.getElementById('fecha');
            fechaSelect.innerHTML = '';
            data.forEach(fecha => {
                const option = document.createElement('option');
                option.value = fecha;
                option.textContent = fecha;
                fechaSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error:', error));
}

let librosGlobal = [];

function consultarBestSellers() {
    const lista = document.getElementById('lista').value;
    const fecha = document.getElementById('fecha').value || 'current';
    const url = `/libros?lista=${lista}&fecha=${fecha}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            librosGlobal = data;
            actualizarGrupoEdad();
            actualizarRangoPrecios();
            mostrarLibros(librosGlobal);
        })
        .catch(error => console.error('Error:', error));
}

function actualizarGrupoEdad() {
    const grupoEdadSet = new Set();
    librosGlobal.forEach(libro => {
        if (libro.age_group) {
            grupoEdadSet.add(libro.age_group);
        }
    });

    const edadSelect = document.getElementById('edad');
    edadSelect.innerHTML = '<option value="">Todos</option>';
    grupoEdadSet.forEach(edad => {
        const option = document.createElement('option');
        option.value = edad;
        option.textContent = edad;
        edadSelect.appendChild(option);
    });
}

function actualizarRangoPrecios() {
    const rangoPreciosSet = new Set();
    librosGlobal.forEach(libro => {
        const precio = parseFloat(libro.price);
        if (!isNaN(precio)) {
            const rango = Math.floor(precio / 10) * 10; // Agrupar precios en rangos de 10
            rangoPreciosSet.add(`${rango}-${rango + 9.99}`);
        }
    });

    const precioSelect = document.getElementById('precio');
    precioSelect.innerHTML = '<option value="">Todos</option>';
    rangoPreciosSet.forEach(rango => {
        const option = document.createElement('option');
        option.value = rango;
        option.textContent = rango;
        precioSelect.appendChild(option);
    });
}

function filtrarLibros() {
    const edadSeleccionada = document.getElementById('edad').value;
    const precioSeleccionado = document.getElementById('precio').value;

    const librosFiltrados = librosGlobal.filter(libro => {
        const coincideEdad = edadSeleccionada === '' || libro.age_group === edadSeleccionada;
        const precio = parseFloat(libro.price);
        const coincidePrecio = precioSeleccionado === '' || (
            !isNaN(precio) && precio >= parseFloat(precioSeleccionado.split('-')[0]) && precio <= parseFloat(precioSeleccionado.split('-')[1])
        );

        return coincideEdad && coincidePrecio;
    });
    mostrarLibros(librosFiltrados);
}

function mostrarLibros(libros) {
    const tbody = document.getElementById('resultados').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    libros.forEach(libro => {
        const tr = document.createElement('tr');
        
        const tdTitle = document.createElement('td');
        tdTitle.textContent = libro.title;
        tr.appendChild(tdTitle);
        
        const tdAuthor = document.createElement('td');
        tdAuthor.textContent = libro.author;
        tr.appendChild(tdAuthor);
        
        const tdDescription = document.createElement('td');
        tdDescription.textContent = libro.description;
        tr.appendChild(tdDescription);
        
        const tdReview = document.createElement('td');
        const reviewLink = libro.book_review_link ? `<a href="${libro.book_review_link}" target="_blank">Review</a>` : 'N/A';
        tdReview.innerHTML = reviewLink;
        tr.appendChild(tdReview);
        
        const tdBuy = document.createElement('td');
        const buyLink = libro.buy_links.length > 0 ? `<a href="${libro.buy_links[0].url}" target="_blank">Buy</a>` : 'N/A';
        tdBuy.innerHTML = buyLink;
        tr.appendChild(tdBuy);
        
        const tdAgeGroup = document.createElement('td');
        tdAgeGroup.textContent = libro.age_group || 'N/A';
        tr.appendChild(tdAgeGroup);
        
        const tdPrice = document.createElement('td');
        tdPrice.textContent = libro.price || 'N/A';
        tr.appendChild(tdPrice);
        
        tbody.appendChild(tr);
    });
}
