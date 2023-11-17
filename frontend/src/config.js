const API_URL = import.meta.env.DEV 
  ? '/api' // for development
  : 'https://threads-clone-server.vercel.app/api'; // for production

export { API_URL };