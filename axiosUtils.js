const axios = require('axios');
const {CE_ROUTE} = require("./constants");

exports.getAllLearningObjectsWithEmbedMissions = async (moduleId, version, companyId) => {
    try {
        const response = await axios.get(`${CE_ROUTE.url}${CE_ROUTE.getAllLOs(moduleId, version, companyId)}`); // Replace with your API endpoint
        const data = response.data;
        let result = [];
        if(Array.isArray(data.object)) {
            //Filter out LO's that are of type embed LO's
            result = data.object.filter(item => item.type === 122);
        }
        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}