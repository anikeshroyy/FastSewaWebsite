// config.js
const BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:5000/api"
        : "https://fastsewawebsite-production.up.railway.app/api";

window.API_BASE_URL = BASE_URL;
