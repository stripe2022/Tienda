// === Supabase API Configuration ===
const SUPABASE_URL = "https://fzopqkxxueprkppfgypw.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6b3Bx..."; // anon/public key real
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
export async function rebajarStock(idProducto, cantidadVendida) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${idProducto}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stock: {"decrement": cantidadVendida} // Rebaja directa del stock
    })
  });
  return await response.json();
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
