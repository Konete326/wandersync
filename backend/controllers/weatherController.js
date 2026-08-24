import axios from 'axios';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getWeatherForecast = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return sendError(res, 'Latitude and longitude are required', 400);
    }

    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lng,
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: 'auto'
      }
    });

    return sendSuccess(res, 'Weather forecast fetched', response.data);
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch weather forecast', 500);
  }
};
