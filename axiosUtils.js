const axios = require('axios');
const { CE_ROUTE, UM_ROUTE, GE_ROUTE } = require("./constants");

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

exports.getInviteLearners = async (moduleId, companyId, orgId) => {
    try {
        const response = await axios.post(`${UM_ROUTE.url}`,
            UM_ROUTE.getBodyListAllModules(moduleId),
            { headers: UM_ROUTE.getHeaders(companyId, orgId) }
        );
        const data = response.data && response.data.data;
        if(data && data.userGroup &&
            data.userGroup.listModuleUsers &&
            data.userGroup.listModuleUsers.invitations &&
            Array.isArray(data.userGroup.listModuleUsers.invitations)) {
            return data.userGroup.listModuleUsers.invitations.map((item) => item.user && item.user.userId);
        }
        return [];
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

exports.updateAssociatedLo = async (moduleId, companyId, userId, loId) => {
    try {
        const response = await axios.get(`${GE_ROUTE.url}${GE_ROUTE.updateAssociatedLo(moduleId, userId, loId, companyId)}`);
        const data = response.data;
        console.log(`Updated LO for user: ${userId}, module: ${moduleId}, loId: ${loId}`, data);
    } catch (e) {
        console.error(`Error updating LO for user: ${userId}, module: ${moduleId}, loId: ${loId}`, error);
    }
}