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

    // ORDENAR ALFABÉTICAMENTE POR NOMBRE
inventario.sort((a, b) => a.nombre.localeCompare(b.nombre));

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
    document.getElementById('totalProductos').textContent = `${inventario.length} productos`;

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

    const card = document.createElement('div');
    card.style.marginBottom = '1rem';

    const linea1 = document.createElement('div');
    linea1.style.display = 'flex';
    linea1.style.justifyContent = 'space-between';
    linea1.style.alignItems = 'center';

    const titulo = document.createElement('strong');
    titulo.style.fontSize = '1.1rem';
    titulo.textContent = `${item.nombre} x${item.cantidad}`;

    const boton = document.createElement('button');
    boton.className = 'btn-borrar';
    boton.textContent = 'X';

    boton.title = 'Eliminar';
    boton.dataset.nombre = item.nombre;

    boton.addEventListener('click', (e) => {
      const nombre = e.target.dataset.nombre;
      carrito = carrito.filter(p => p.nombre !== nombre);
      mostrarResumen();
    });

    linea1.appendChild(titulo);
    linea1.appendChild(boton);

    const linea2 = document.createElement('div');
    linea2.style.marginLeft = '0.5rem';
    linea2.textContent = `Precio: $${item.precio_venta} - Subtotal: $${subtotal}`;

    card.appendChild(linea1);
    card.appendChild(linea2);
    contenedor.appendChild(card);
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
    const splitNombre = doc.splitTextToSize(item.nombre, 45);
    const lineHeight = splitNombre.length * 6;

    // 🔁 SALTO DE PÁGINA SI PASAMOS DEL LÍMITE
    if (y + lineHeight + 8 > 270) {
      doc.addPage();
      y = 30;

      doc.setFontSize(12);
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
    }

    // ✏️ DATOS DEL PRODUCTO
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(splitNombre, 10, y);
    doc.text(`x${item.cantidad}`, 60, y);
    doc.setTextColor(255, 0, 0);
    doc.text(`$${item.costo}`, 90, y);
    doc.setTextColor(0, 150, 0);
    doc.text(`$${item.precio_venta}`, 120, y);
    doc.setTextColor(0);
    doc.text(`$${subtotal}`, 160, y);

    y += lineHeight;

    // ➖ LÍNEA DIVISORA
    doc.setDrawColor(200);
    doc.line(10, y, 200, y);
    y += 5;
  });

  // ✅ TOTALES FINALES
  let totalVenta = 0;
  let totalCosto = 0;
  carrito.forEach(item => {
    totalVenta += item.precio_venta * item.cantidad;
    totalCosto += item.costo * item.cantidad;
  });
  const ganancia = totalVenta - totalCosto;

  if (y > 250) {
    doc.addPage();
    y = 30;
  }

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

  // 💾 GUARDAR PDF
  doc.save(`liquidacion_${hoy.replace(/\//g, '-')}.pdf`);
});


const limpiarBtn = document.getElementById('limpiarBtn');
limpiarBtn.addEventListener('click', () => {
  if (confirm("¿Estás seguro que deseas borrar todo el reporte actual?")) {
    carrito = [];
    document.getElementById('resumen').innerHTML = '';
    document.getElementById('totales').innerHTML = '';
    document.getElementById('producto').value = '';
    document.getElementById('cantidad').value = '1';
  }
});
