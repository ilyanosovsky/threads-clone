const API_URL = import.meta.env.DEV 
  ? '/api' // for development
  : 'https://bella-orion-server.vercel.app/api'; // for production

export { API_URL };