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

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Selecciona un producto --';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    selector.appendChild(defaultOption);

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

const agregarBtn = document.getElementById('agregarBtn');
agregarBtn.addEventListener('click', () => {
  const index = document.getElementById('producto').value;
  const cantidadInput = document.getElementById('cantidad');
  const selector = document.getElementById('producto');

  if (index === '') return;

  const cantidad = parseInt(cantidadInput.value);
  const producto = inventario[index];

  const existente = carrito.find(p => p.nombre === producto.nombre);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ ...producto, cantidad });
  }

  mostrarResumen();

  selector.value = '';
  cantidadInput.value = '1';
});

function mostrarResumen() {
  const contenedor = document.getElementById('resumen');
  contenedor.innerHTML = '';

  carrito.forEach(item => {
    const subtotal = item.precio_venta * item.cantidad;
    const div = document.createElement('div');
    div.innerHTML = `<strong style="font-size: 1.2rem;">${item.nombre}</strong> x${item.cantidad} - Precio: $${item.precio_venta} - Subtotal: $${subtotal}`;
    contenedor.appendChild(div);
  });
}

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
    <p style="color:green;"><strong>Ganancia:</strong> $${totalVenta - totalCosto}</p>
  `;
});

const exportarBtn = document.getElementById('exportarPDF');
exportarBtn.addEventListener('click', () => {
  const doc = new window.jspdf.jsPDF();
  const hoy = new Date().toLocaleDateString();

  doc.setFontSize(16);
  doc.text(`Resumen de Venta - ${hoy}`, 10, 15);

  let y = 30;
  doc.setFontSize(12);
  doc.setTextColor(0);

  doc.setFont(undefined, 'bold');
  doc.text("Producto", 10, y);
  doc.text("Cantidad", 60, y);
  doc.setTextColor(200, 0, 0);
  doc.text("Costo", 90, y);
  doc.setTextColor(0, 150, 0);
  doc.text("Precio Venta", 120, y);
  doc.setTextColor(0);
  doc.text("Subtotal", 160, y);
  doc.setFont(undefined, 'normal');
  y += 8;

  carrito.forEach(item => {
    const subtotal = item.precio_venta * item.cantidad;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(item.nombre, 10, y);
    doc.text(`x${item.cantidad}`, 60, y);
    doc.setTextColor(255, 0, 0);
    doc.text(`$${item.costo}`, 90, y);
    doc.setTextColor(0, 150, 0);
    doc.text(`$${item.precio_venta}`, 120, y);
    doc.setTextColor(0);
    doc.text(`$${subtotal}`, 160, y);
    y += 8;
  });

  let totalVenta = 0;
  let totalCosto = 0;
  carrito.forEach(item => {
    totalVenta += item.precio_venta * item.cantidad;
    totalCosto += item.costo * item.cantidad;
  });
  const ganancia = totalVenta - totalCosto;

  y += 10;
  doc.setFontSize(13);
  doc.setTextColor(0);
  doc.text(`Total vendido: $${totalVenta}`, 10, y);
  y += 8;
  doc.text(`Inversión total: $${totalCosto}`, 10, y);
  y += 8;
  doc.setTextColor(0, 150, 0);
  doc.setFont(undefined, 'bold');
  doc.text(`Ganancia: $${ganancia}`, 10, y);

  doc.save(`liquidacion_${hoy.replace(/\//g, '-')}.pdf`);
});
