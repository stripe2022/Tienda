// === Supabase API Configuration ===
const SUPABASE_URL = "https://fzopqkxxueprkppfgypw.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6b3Bxa3h4dWVwcmtwcGZneXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTg4MTQsImV4cCI6MjA2NTgzNDgxNH0.AMXqVIOmo8rqlxrqNWjmXiEp72kqLbIWQjke9bZ12Qg"; // anon/public key real
const TABLE = "productos_stock";

// === Leer productos (GET) ===
export async function obtenerProductos() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=*`, {
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`
    }
  });

  const data = await response.json();
  console.log('Productos recibidos desde Supabase:', data);

  if (!Array.isArray(data)) {
    console.error("❌ Supabase no devolvió un array:", data);
    return [];
  }

  return data;
}

// === Rebajar stock desde la app de liquidación (PATCH) ===
export async function rebajarStock(id, cantidadVendida) {
  // Obtener el stock actual
  const responseGet = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${id}&select=stock`, {
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`
    }
  });

  const data = await responseGet.json();
  const stockActual = data[0]?.stock ?? 0;

  const nuevoStock = Math.max(0, stockActual - cantidadVendida); // evita stock negativo

  // Enviar actualización
  const responseUpdate = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({ stock: nuevoStock })
  });

  const result = await responseUpdate.json();
  console.log('📉 Stock actualizado:', result);
  return result;
}


// === Actualizar un producto desde Barylie (PUT o PATCH) ===
export async function actualizarProducto(idProducto, camposActualizados) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${idProducto}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(camposActualizados)
  });
  return await response.json();
}
