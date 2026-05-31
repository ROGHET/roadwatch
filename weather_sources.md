# Real-Time Weather Sources

## 1. OpenWeather API (Recommended)
- **API Endpoint**: `api.openweathermap.org/data/2.5/weather` / `/forecast`
- **Free Tier Limits**: 1,000 API calls per day (Standard tier), 60 calls/minute.
- **Rainfall Support**: Yes (Precipitation volume over last 1h/3h).
- **Flood Warning Support**: Partial (Severe weather alerts available via OneCall 3.0 API, sometimes requires paid/credit card verification, but historical/forecast rainfall can imply flood risk).
- **District Support**: Yes (By precise coordinates or standard city/district names).
- **Integration Difficulty**: **Low**. Standard REST JSON API, well-documented, SDKs available for Node/Python.

## 2. WeatherAPI.com
- **API Endpoint**: `api.weatherapi.com/v1/current.json` / `/forecast.json`
- **Free Tier Limits**: 1,000,000 API calls per month (~30k/day).
- **Rainfall Support**: Yes (Precipitation in mm).
- **Flood Warning Support**: Yes (Alerts array includes government-issued severe weather warnings where supported).
- **District Support**: Yes (By Lat/Lon or City/Region names).
- **Integration Difficulty**: **Low**. Very robust JSON structure, exceptionally generous free tier.

## 3. IMD Open Data / IMD API
- **API Endpoint**: `api.imd.gov.in` (Requires authorization)
- **Free Tier Limits**: Unknown (Subject to Nodal Officer approval).
- **Rainfall Support**: Yes.
- **Flood Warning Support**: Yes (Official source of Indian flash flood / nowcast warnings).
- **District Support**: Yes (Highly granular for Indian districts).
- **Integration Difficulty**: **High**. Requires formal application for API keys, JSON structures can be complex or undocumented, not suitable for a rapid 48-hour hackathon without pre-existing access.

## 4. Visual Crossing Weather API
- **API Endpoint**: `weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/`
- **Free Tier Limits**: 1,000 records per day.
- **Rainfall Support**: Yes.
- **Flood Warning Support**: Yes (Aggregates global alerts).
- **District Support**: Yes.
- **Integration Difficulty**: **Low-Medium**.

---

## 🚀 Recommendation for 48-Hour Hackathon MVP
**Source Dataset:** OpenWeather API (or WeatherAPI.com)
**Confidence Level:** 95% for rapid integration; 80% for hyper-local Indian accuracy.
**Limitations:** You will not get official government-issued (IMD) "Red/Orange" flood alerts on the free tiers reliably, but you *will* get highly accurate real-time precipitation (mm/hr) data. For a hackathon, integrating a seamless JSON endpoint like OpenWeather is far superior to scraping IMD websites. You can map real-time heavy rainfall directly to road hazard indices.
