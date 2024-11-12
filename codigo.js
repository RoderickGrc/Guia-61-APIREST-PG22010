let productos = [];
let orden = 0;

const API_URL = 'https://retoolapi.dev/3xT68m/productos'; 

function codigoCat(catstr) {
    switch(catstr) {
        case "caballeros": return "c1";
        case "joyeria": return "c2";
        case "electronicos": return "c3";
        case "damas": return "c4";
        default: return "null";
    }
}

const precioHeader = document.getElementById("price");
const listado = document.getElementById("listado");
const tbody = document.getElementById("tbody");
const mensajeError = document.getElementById("mensajeError");
const formAgregarProducto = document.getElementById("formAgregarProducto");
const agregarProductoSection = document.getElementById("agregarProducto");
const btnObtener = document.querySelector(".btn-obtener");

function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    setTimeout(() => {
        mensajeError.textContent = '';
    }, 5000); 
}

function listarProductos(productos) {
    
    const c1 = document.getElementById("c1").checked;
    const c2 = document.getElementById("c2").checked;
    const c3 = document.getElementById("c3").checked;
    const c4 = document.getElementById("c4").checked;

    let productosFiltrados = productos.filter(producto => {
        const catCode = codigoCat(producto.category);
        switch(catCode) {
            case "c1": return c1;
            case "c2": return c2;
            case "c3": return c3;
            case "c4": return c4;
            default: return false;
        }
    });

    if (orden === 1) {
        productosFiltrados.sort((a, b) => a.price - b.price);
        precioHeader.textContent = "Costo ↑";
        precioHeader.style.color = "darkgreen";
    } else if (orden === -1) {
        productosFiltrados.sort((a, b) => b.price - a.price);
        precioHeader.textContent = "Costo ↓";
        precioHeader.style.color = "blue";
    } else {
        precioHeader.textContent = "Costo ⇅";
        precioHeader.style.color = "#2C3E50"; 
    }

    tbody.innerHTML = "";

    productosFiltrados.forEach(producto => {
        const tr = document.createElement("tr");
        tr.className = codigoCat(producto.category);

        tr.innerHTML = `
            <td class="id">${producto.id}</td>
            <td class="foto"><img src="${producto.image}" alt="${producto.title}" /></td>
            <td class="title">${producto.title}</td>
            <td class="price">$${producto.price.toFixed(2)}</td>
            <td class="description">${producto.description}</td>
            <td class="category">${producto.category}</td>
            <td class="acciones"><button class="btn-eliminar">Eliminar</button></td>
        `;

        tr.querySelector("img").addEventListener("click", () => {
            window.open(producto.image, '_blank');
        });

        tr.querySelector(".btn-eliminar").addEventListener("click", () => {
            eliminarProducto(producto.id);
        });

        tbody.appendChild(tr);
    });

    listado.classList.remove("oculto");
    agregarProductoSection.classList.remove("oculto");
}

async function obtenerProductos() {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) {
            throw new Error(`Error al obtener productos: ${respuesta.status} ${respuesta.statusText}`);
        }
        const data = await respuesta.json();
        data.forEach(producto => {
            producto.price = parseFloat(producto.price);
        });
        productos = data;
        listarProductos(productos);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        mostrarError(error.message);
    }
}

formAgregarProducto.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const title = document.getElementById("title").value.trim();
    const price = parseFloat(document.getElementById("priceInput").value);
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value;
    const image = document.getElementById("image").value.trim();

    if (!title || isNaN(price) || !description || !category || !image) {
        mostrarError("Por favor, completa todos los campos correctamente.");
        return;
    }

    const nuevoProducto = { title, price, description, category, image };

    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoProducto)
        });

        if (!respuesta.ok) {
            throw new Error(`Error al agregar producto: ${respuesta.status} ${respuesta.statusText}`);
        }

        const productoAgregado = await respuesta.json();
        productos.push(productoAgregado);
        listarProductos(productos);

        formAgregarProducto.reset();
        mostrarError("Producto añadido exitosamente.");
    } catch (error) {
        console.error('Error al añadir el producto:', error);
        mostrarError(error.message);
    }
});

async function eliminarProducto(id) {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este producto?");
    if (!confirmacion) return;

    console.log(`Intentando eliminar el producto con ID: ${id}`); // Para depuración

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        console.log(`Respuesta de DELETE: `, respuesta); // Para depuración

        if (!respuesta.ok) {
            throw new Error(`Error al eliminar producto: ${respuesta.status} ${respuesta.statusText}`);
        }

        productos = productos.filter(producto => producto.id !== id);
        listarProductos(productos);
        mostrarError("Producto eliminado exitosamente.");
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        mostrarError(error.message);
    }
}

precioHeader.addEventListener("click", () => {
    orden = (orden === 0) ? 1 : (orden === 1) ? -1 : 0;
    listarProductos(productos);
});

const filtros = document.querySelectorAll('#filtroprods input[type="checkbox"]');
filtros.forEach(filtro => {
    filtro.addEventListener("change", () => {
        listarProductos(productos);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // Puedes agregar funcionalidades adicionales al cargar la página
});
