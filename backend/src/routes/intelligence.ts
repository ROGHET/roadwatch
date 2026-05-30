import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const NOMINATIM_HEADERS = {
  'User-Agent': 'CrashZero-Hackathon/1.0',
};

function isCountryLevelQuery(city: string) {
  const normalized = city.trim().toLowerCase();
  return !normalized || normalized === 'india' || normalized === 'unknown city' || normalized === 'unknown state';
}

async function forwardGeocode(query: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`,
    { headers: NOMINATIM_HEADERS },
  );

  if (!response.ok) return null;
  const data = (await response.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>;
  if (!Array.isArray(data) || !data[0]?.lat || !data[0]?.lon) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name ?? query,
  };
}

async function reverseGeocode(lat: number, lng: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: NOMINATIM_HEADERS },
  );

  if (!response.ok) return null;
  const data = (await response.json()) as { address?: Record<string, string>; display_name?: string };
  const address = data.address ?? {};

  const locationName =
    address.locality ||
    address.village ||
    address.suburb ||
    address.town ||
    address.city_district ||
    address.road ||
    'Unknown Area';
  const city = address.city || address.town || address.county || address.state_district || 'Unknown City';
  const state = address.state || 'Unknown State';

  return {
    locationName,
    city: city.toLowerCase() === 'india' ? state : city,
    state,
    displayName: data.display_name,
  };
}

async function fetchWeatherSnapshot(lat: number, lng: number) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`,
  );
  if (!response.ok) throw new Error('Weather fetch failed');
  const data = await response.json();
  const current = data.current;

  let condition = 'Clear';
  if (current.weather_code > 50) condition = 'Rain';
  if (current.weather_code > 70) condition = 'Snow';
  if (current.weather_code > 90) condition = 'Thunderstorm';

  return {
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    visibility: '10km',
    condition,
    lastUpdated: current.time,
  };
}

async function fetchAqiSnapshot(lat: number, lng: number) {
  const response = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,us_aqi&timezone=auto`,
  );
  if (!response.ok) throw new Error('AQI fetch failed');
  const data = await response.json();
  const current = data.current;
  const aqi = current.us_aqi;

  let category = 'Good';
  if (aqi > 50) category = 'Moderate';
  if (aqi > 100) category = 'Unhealthy for Sensitive Groups';
  if (aqi > 150) category = 'Unhealthy';
  if (aqi > 200) category = 'Very Unhealthy';
  if (aqi > 300) category = 'Hazardous';

  return {
    aqi,
    category,
    pm25: current.pm2_5,
    pm10: current.pm10,
    no2: current.nitrogen_dioxide,
    o3: current.ozone,
    co: current.carbon_monoxide,
    lastUpdated: current.time,
  };
}

async function fetchTrafficSnapshot(lat: number, lng: number) {
  const latDelta = 0.05;
  const lngDelta = 0.05;

  const activeComplaints = await prisma.complaint.count({
    where: {
      status: { in: ['PENDING', 'ROUTED', 'IN_PROGRESS'] },
      latitude: { gte: lat - latDelta, lte: lat + latDelta },
      longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
    },
  });

  const incidentCount = await prisma.complaint.count({
    where: {
      issueType: 'Accident',
      status: { in: ['PENDING', 'ROUTED', 'IN_PROGRESS'] },
      latitude: { gte: lat - latDelta, lte: lat + latDelta },
      longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
    },
  });

  let score = 20 + activeComplaints * 5 + incidentCount * 15;
  if (score > 100) score = 100;

  let level = 'Low';
  if (score > 40) level = 'Moderate';
  if (score > 70) level = 'High';
  if (score > 90) level = 'Severe';

  return {
    trafficLevel: level,
    congestionScore: score,
    incidents: incidentCount,
    activeComplaintsInArea: activeComplaints,
    estimatedDelayMins: Math.floor(score * 0.4),
    lastUpdated: new Date().toISOString(),
  };
}

router.get('/', async (req, res) => {
  try {
    const cityQuery = typeof req.query.city === 'string' ? req.query.city.trim() : '';
    const stateQuery = typeof req.query.state === 'string' ? req.query.state.trim() : '';
    let lat = parseFloat(String(req.query.lat ?? ''));
    let lng = parseFloat(String(req.query.lng ?? ''));

    if ((Number.isNaN(lat) || Number.isNaN(lng)) && cityQuery && !isCountryLevelQuery(cityQuery)) {
      const geocoded = await forwardGeocode(`${cityQuery}${stateQuery ? `, ${stateQuery}` : ''}, India`);
      if (geocoded) {
        lat = geocoded.lat;
        lng = geocoded.lng;
      }
    }

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        error:
          'Provide valid lat/lng or a specific city name. Country-level queries such as city=India are not supported.',
      });
    }

    const [weather, aqi, traffic, geocode] = await Promise.all([
      fetchWeatherSnapshot(lat, lng),
      fetchAqiSnapshot(lat, lng),
      fetchTrafficSnapshot(lat, lng),
      reverseGeocode(lat, lng),
    ]);

    res.json({
      city: geocode?.city ?? cityQuery,
      state: geocode?.state ?? stateQuery,
      latitude: lat,
      longitude: lng,
      locationName: geocode?.locationName,
      weather,
      aqi,
      traffic,
    });
  } catch (error) {
    console.error('Intelligence summary error:', error);
    res.status(500).json({ error: 'Failed to fetch location intelligence' });
  }
});

// Weather using Open-Meteo (No API Key Required)
router.get('/weather', async (req, res) => {
  try {
    const lat = req.query.lat || 19.0760;
    const lng = req.query.lng || 72.8777;
    
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`);
    
    if (!response.ok) throw new Error('Weather fetch failed');
    const data = await response.json();
    
    const current = data.current;
    
    // Simple weather code mapping
    let condition = "Clear";
    if (current.weather_code > 50) condition = "Rain";
    if (current.weather_code > 70) condition = "Snow";
    if (current.weather_code > 90) condition = "Thunderstorm";
    
    res.json({
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      visibility: '10km', // Mock visibility as open-meteo basic doesn't provide it
      condition: condition,
      lastUpdated: current.time
    });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// AQI using Open-Meteo Air Quality (No API Key Required)
router.get('/aqi', async (req, res) => {
  try {
    const lat = req.query.lat || 19.0760;
    const lng = req.query.lng || 72.8777;
    
    const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,us_aqi&timezone=auto`);
    
    if (!response.ok) throw new Error('AQI fetch failed');
    const data = await response.json();
    
    const current = data.current;
    const aqi = current.us_aqi;
    
    let category = "Good";
    if (aqi > 50) category = "Moderate";
    if (aqi > 100) category = "Unhealthy for Sensitive Groups";
    if (aqi > 150) category = "Unhealthy";
    if (aqi > 200) category = "Very Unhealthy";
    if (aqi > 300) category = "Hazardous";

    res.json({
      aqi: aqi,
      category: category,
      pm25: current.pm2_5,
      pm10: current.pm10,
      no2: current.nitrogen_dioxide,
      o3: current.ozone,
      co: current.carbon_monoxide,
      lastUpdated: current.time
    });
  } catch (error) {
    console.error('AQI API error:', error);
    res.status(500).json({ error: 'Failed to fetch AQI data' });
  }
});

// Traffic (Fallback logic based on DB complaints)
router.get('/traffic', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 19.0760;
    const lng = parseFloat(req.query.lng as string) || 72.8777;
    
    // Find nearby complaints (mock bounding box approach for simplicity)
    const latDelta = 0.05; // Roughly 5km
    const lngDelta = 0.05;
    
    const activeComplaints = await prisma.complaint.count({
      where: {
        status: { in: ['PENDING', 'ROUTED', 'IN_PROGRESS'] },
        latitude: { gte: lat - latDelta, lte: lat + latDelta },
        longitude: { gte: lng - lngDelta, lte: lng + lngDelta }
      }
    });

    const incidentCount = await prisma.complaint.count({
      where: {
        issueType: 'Accident',
        status: { in: ['PENDING', 'ROUTED', 'IN_PROGRESS'] },
        latitude: { gte: lat - latDelta, lte: lat + latDelta },
        longitude: { gte: lng - lngDelta, lte: lng + lngDelta }
      }
    });

    // Derive congestion score (0-100)
    let score = 20 + (activeComplaints * 5) + (incidentCount * 15);
    if (score > 100) score = 100;
    
    let level = "Low";
    if (score > 40) level = "Moderate";
    if (score > 70) level = "High";
    if (score > 90) level = "Severe";

    const delay = Math.floor(score * 0.4); // e.g., 100 score = 40 mins delay

    res.json({
      trafficLevel: level,
      congestionScore: score,
      incidents: incidentCount,
      activeComplaintsInArea: activeComplaints,
      estimatedDelayMins: delay,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Traffic logic error:', error);
    res.status(500).json({ error: 'Failed to calculate traffic intelligence' });
  }
});

router.get('/geocode', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const lat = req.query.lat;
    const lng = req.query.lng;

    if (q) {
      const geocoded = await forwardGeocode(q.includes('India') ? q : `${q}, India`);
      if (!geocoded) {
        return res.status(404).json({ error: 'No matching location found' });
      }

      const place = await reverseGeocode(geocoded.lat, geocoded.lng);
      return res.json({
        label: place?.displayName ?? geocoded.displayName,
        city: place?.city ?? 'Unknown City',
        state: place?.state ?? 'Unknown State',
        latitude: geocoded.lat,
        longitude: geocoded.lng,
      });
    }

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Missing latitude/longitude or search query (q)' });
    }

    const place = await reverseGeocode(parseFloat(String(lat)), parseFloat(String(lng)));
    if (!place) {
      return res.status(500).json({ error: 'Failed to reverse geocode' });
    }

    res.json({
      locationName: place.locationName,
      city: place.city,
      state: place.state,
      label: place.displayName,
      displayName: place.displayName,
    });
  } catch (error) {
    console.error('Geocode API error:', error);
    res.status(500).json({ error: 'Failed to geocode location' });
  }
});

export default router;
