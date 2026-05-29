import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

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

// Reverse Geocoding using Nominatim (No API Key Required)
// Rate Limit Note: 1 req/sec max per Nominatim TOS.
router.get('/geocode', async (req, res) => {
  try {
    const lat = req.query.lat;
    const lng = req.query.lng;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Missing latitude or longitude' });
    }
    
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
      headers: {
        'User-Agent': 'CrashZero-Hackathon/1.0'
      }
    });
    
    if (!response.ok) throw new Error('Nominatim fetch failed');
    const data = await response.json();
    
    const address = data.address || {};
    
    // Resolve location hierarchically
    const locationName = address.locality || address.village || address.suburb || address.town || address.city_district || address.road || 'Unknown Area';
    const city = address.city || address.town || address.county || address.state_district || 'Unknown City';
    const state = address.state || 'Unknown State';
    
    res.json({
      locationName,
      city,
      state,
      displayName: data.display_name
    });
  } catch (error) {
    console.error('Geocode API error:', error);
    res.status(500).json({ error: 'Failed to reverse geocode' });
  }
});

export default router;
