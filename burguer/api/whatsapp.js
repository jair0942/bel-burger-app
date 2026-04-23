export default function handler(request, response) {
  // Asegurarnos de que sea una petición POST
  if (request.method !== 'POST') {
    return response.status(405).send('Método No Permitido');
  }

  const message = request.body.message;

  if (!message) {
    return response.status(400).send('Falta el mensaje');
  }

  // Obtenemos el número desde las variables de entorno de Vercel/Netlify.
  // ¡Este número ahora es un secreto de backend y NO está en el código público!
  const phone = process.env.WHATSAPP_NUMBER || '573007787710'; // Valor de reserva

  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${phone}?text=${encodedMsg}`;

  // En lugar de enviar un JSON, forzamos al navegador a redirigirse automáticamente
  // Esto es 100% compatible con iPhone/Safari y salta todos los bloqueos
  return response.redirect(302, waUrl);
}
