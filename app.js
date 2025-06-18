// app.js

let inventario = [];
let carrito = [];

// Cargar productos desde productos.json
fetch('productos.json')
  .then(response => response.json())
  .then(data => {
    inventario = data.productos.map(p => ({
      nombre: p.nombre,
      precio_venta: p.precioVenta,
      costo: p.precioCosto
    }));

    const selector = document.getElementById('producto');
    inventario.forEach((item, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = item.nombre;
      selector.appendChild(option);
    });
  })
  .catch(error => {
    alert("No se pudo cargar productos.json");
    console.error("Error:", error);
  });

// Agregar producto al carrito
const agregarBtn = document.getElementById('agregarBtn');
agregarBtn.addEventListener('click', () => {
  const index = document.getElementById('producto').value;
  const cantidad = parseInt(document.getElementById('cantidad').value);
  const producto = inventario[index];

  const existente = carrito.find(p => p.nombre === producto.nombre);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ ...producto, cantidad });
  }

  mostrarResumen();
});

function mostrarResumen() {
  const contenedor = document.getElementById('resumen');
  contenedor.innerHTML = '';

  carrito.forEach(item => {
    const subtotal = item.precio_venta * item.cantidad;
    const div = document.createElement('div');
    div.innerHTML = `<strong>${item.nombre}</strong> x${item.cantidad} - Precio: $${item.precio_venta} - Subtotal: $${subtotal}`;
    contenedor.appendChild(div);
  });
}

// Calcular totales
const calcularBtn = document.getElementById('calcularBtn');
calcularBtn.addEventListener('click', () => {
  let totalVenta = 0;
  let totalCosto = 0;

  carrito.forEach(item => {
    totalVenta += item.precio_venta * item.cantidad;
    totalCosto += item.costo * item.cantidad;
  });

  const totales = document.getElementById('totales');
  totales.innerHTML = `
    <p><strong>Total vendido:</strong> $${totalVenta}</p>
    <p><strong>Inversión total:</strong> $${totalCosto}</p>
    <p><strong>Ganancia:</strong> $${totalVenta - totalCosto}</p>
  `;
});
