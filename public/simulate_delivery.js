// Simulate delivery boy moving from warehouse to customer
const axios = require('axios');

// === CONFIGURATION ===
const orderId = 'Order ID: order_Qrl5PeNAo6UJl3'; // e.g., order_QnnL5zuLrMxaiJ
const backendUrl = 'http://localhost:3000/order/delivery/location/' + orderId;
const warehouse = { lat: 28.6139, lng: 77.2090 }; // Delhi
const steps = 20; // Number of steps for animation
const interval = 2000; // ms between updates

// === LINEAR INTERPOLATION ===
function interpolate(start, end, t) {
  return start + (end - start) * t;
}

async function getDestination() {
  // Fetch delivery document to get destination
  const res = await axios.get(backendUrl);
  if (!res.data || !res.data.location) throw new Error('No delivery found');
  // Fetch destination from delivery document
  const deliveryRes = await axios.get(backendUrl.replace('/location/', '/info/'));
  if (!deliveryRes.data || !deliveryRes.data.destination) throw new Error('No destination set');
  return deliveryRes.data.destination;
}

async function moveDeliveryBoy() {
  let destination;
  try {
    destination = await getDestination();
    console.log('Destination:', destination);
  } catch (err) {
    console.error('Failed to fetch destination:', err.message);
    return;
  }
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = interpolate(warehouse.lat, destination.lat, t);
    const lng = interpolate(warehouse.lng, destination.lng, t);
    try {
      await axios.post(backendUrl, { lat, lng });
      console.log(`Moved to (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
    } catch (err) {
      console.error('Failed to update location:', err.message);
      break;
    }
    await new Promise(res => setTimeout(res, interval));
  }
  console.log('Delivery simulation complete!');
}

moveDeliveryBoy(); 
