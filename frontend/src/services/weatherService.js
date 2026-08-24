import api from './api';

export const fetchWeatherForecast = async (lat, lng) => {
  const response = await api.get('/weather/forecast', {
    params: { lat, lng }
  });
  return response.data;
};
