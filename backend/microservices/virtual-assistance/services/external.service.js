// Import necessary module
const axios = require('axios');

// Extract base URL from environment variables
const TEAM_API_URL = process.env.TEAM_API_URL;

// Function to get all teams
module.exports.getTeams = async () => {
    try {
        const response = await axios.get(`${TEAM_API_URL}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error; // Re-throw the error
    }
}
