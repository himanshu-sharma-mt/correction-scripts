const { CouchbaseUtil } = require('./cbUtils.js');
const { getAllLearningObjectsWithEmbedMissions, getInviteLearners } = require('./axiosUtils')
const { CE_COUCHBASE, GE_COUCHBASE } = require('./constants.js');
const contentEngineCouchbase = new CouchbaseUtil();
const gameEngineCouchbase = new CouchbaseUtil();

const initialiseCouchbase = async () => {
    console.log('Initialising Couchbase');
    await contentEngineCouchbase.initialiseConnection(CE_COUCHBASE.url, CE_COUCHBASE.bucket, CE_COUCHBASE.username, CE_COUCHBASE.password);
    await gameEngineCouchbase.initialiseConnection(GE_COUCHBASE.url, GE_COUCHBASE.bucket, GE_COUCHBASE.username, GE_COUCHBASE.password);
    console.log('Couchbase initialised');
}

const correctEmbedLoMappings = async (moduleId, embedLoMappings) => {
    for (const missionId of Object.keys(embedLoMappings)) {
       //Fetch embedMappings.mission.<embedLo> doc
       const embedMappingDoc = await contentEngineCouchbase.get(`embedMappings.mission.${missionId}`);
       console.log(`embedMappingDoc for embed LO: ${missionId}: `, embedMappingDoc);
       const embedDocLoMapping = embedMappingDoc['loMapping'];
       if(Array.isArray(embedDocLoMapping) && Array.isArray(embedLoMappings[missionId])) {
           let transformedEmbedDocLoMapping = {...embedMappingDoc};
           let doesDocNeedToBeUpdated = false;
           embedLoMappings[missionId].forEach(lo => {
               //If Lo doesn't exist in embed mapping doc then add an entry in the doc
               if(!embedDocLoMapping.find(embedLo => embedLo === lo)){
                   doesDocNeedToBeUpdated = true
                   transformedEmbedDocLoMapping['loMapping'].push(lo);
                   transformedEmbedDocLoMapping['entityMapping'].push(moduleId);
               }
           })
           console.log(`transformed EmbedDocLoMapping for ${missionId}:`, transformedEmbedDocLoMapping);
           console.log('doesDocNeedToBeUpdated', doesDocNeedToBeUpdated);
           // if(doesDocNeedToBeUpdated) {
           //     //Update embed mission doc
           //     await contentEngineCouchbase.upsert(`embedMappings.mission.${missionId}`, transformedEmbedDocLoMapping);
           // }
       }
    }
}

const getEmbedLoMappings = async (moduleId, cname) => {
    //Get module document from CE
    const moduleDocument = await contentEngineCouchbase.get(moduleId);
    const versionsList = Object.keys(moduleDocument['mapPublishHistory']);
    console.log('versionsList', versionsList);
    let embedLoMappings = {};
    //Make embed Lo map
    for(const version of versionsList) {
        //Getting embed missions LO
        const embedLOs = await getAllLearningObjectsWithEmbedMissions(moduleId, version, cname);
        embedLOs.forEach(embedLO => {
            if(!!embedLO.embedEntityId && !embedLoMappings[embedLO.embedEntityId]) {
                embedLoMappings[embedLO.embedEntityId] = [embedLO.id]
            } else if (!!embedLO.embedEntityId && !!embedLoMappings[embedLO.embedEntityId]) {
                const loMappings = embedLoMappings[embedLO.embedEntityId];
                if(!loMappings.find(lo => lo === embedLO.id)) {
                    embedLoMappings[embedLO.embedEntityId] = [...embedLoMappings[embedLO.embedEntityId], embedLO.id];
                }
            }
        })
    }
    console.log('embedLoMappings', embedLoMappings);
    return embedLoMappings;
}

const correctInvitedLearnersData = async (moduleId, cname, orgId) => {
    const usersList = await getInviteLearners(moduleId, cname, orgId);
    console.log('usersList', usersList);
}

const main = async (moduleId, cname, orgId) => {
    try {
        await initialiseCouchbase();
        // const embedLoMappings = await getEmbedLoMappings(moduleId, cname);
        // await correctEmbedLoMappings(moduleId, embedLoMappings);
        await correctInvitedLearnersData(moduleId, cname, orgId);
    } catch (e) {
        console.log('Got Error: ', e);
    }
}

main('1646517315774284791', '1158975533368761751', '1139071814572614460');
