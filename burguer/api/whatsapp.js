export default function handler(request, response) {
  // Asegurarnos de que sea una petición POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método No Permitido' });
  }

  const { message } = request.body;

  if (!message) {
    return response.status(400).json({ error: 'Falta el mensaje' });
  }

  // Obtenemos el número desde las variables de entorno de Vercel/Netlify.
  // ¡Este número ahora es un secreto de backend y NO está en el código público!
  const phone = process.env.WHATSAPP_NUMBER || '573015369702'; // Valor de reserva

  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${phone}?text=${encodedMsg}`;

  // Respondemos al frontend con el link generado
  return response.status(200).json({ url: waUrl });
}
