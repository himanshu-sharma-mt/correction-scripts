const { CouchbaseUtil } = require('./cbUtils.js');
const { getAllLearningObjectsWithEmbedMissions, getInvitedLearners, updateAssociatedLo, getInvitedLearnersWithVersion } = require('./axiosUtils')
const { CE_COUCHBASE, GE_COUCHBASE, VERSION_DOC_KEY, LO_DOC_KEY, GE_SUMMARY_DOC_KEY } = require('./constants.js');
const {writeLog} = require("./writeToFile");
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
           if(doesDocNeedToBeUpdated) {
               //Update embed mission doc
               console.log(`updating embedMappings.mission.${missionId}`);
               await contentEngineCouchbase.upsert(`embedMappings.mission.${missionId}`, transformedEmbedDocLoMapping);
           }
       } else {
           console.log('embedDocLoMapping or embedLoMappings[missionId] is not array');
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

const correctInvitedLearnersData = async (moduleId, cname, orgId, embedLoMappings, forUser) => {
    const usersList = await getInvitedLearners(moduleId, cname, orgId);
    console.log('usersList', usersList);
    const embedMappingDocMap = {};
    for(const missionId of Object.keys(embedLoMappings)) {
        //Fetch embedMappings.mission.<embedLo> doc
        embedMappingDocMap[missionId] = await contentEngineCouchbase.get(`embedMappings.mission.${missionId}`);
    }
    console.log('embedMappingDocMap', embedMappingDocMap);
    for(const userId of usersList) {
        const versionedDoc = await gameEngineCouchbase.get(VERSION_DOC_KEY(moduleId, cname, userId));
        const reattemptVersion = versionedDoc && versionedDoc['reattemptVersion'];
        console.log(`reattemptVersion for user ${userId}:`, reattemptVersion);
        for(const missionId of Object.keys(embedMappingDocMap)) {
            const mappingsDoc = embedMappingDocMap[missionId];
            if(Array.isArray(mappingsDoc['loMapping']) && Array.isArray(mappingsDoc['entityMapping'])) {
                for(let index = 0; index < mappingsDoc['entityMapping'].length; index++) {
                    if(moduleId === mappingsDoc['entityMapping'][index]) {
                        const loId = mappingsDoc['loMapping'][index];
                        if(loId && (forUser == null || forUser === userId)) {
                            try {
                                console.log(`Fetching Lo Doc for user: ${userId} and loId: ${loId}:`);
                                const loDoc = await gameEngineCouchbase.get(LO_DOC_KEY(moduleId, cname, userId, reattemptVersion, loId));
                                console.log(`Lo Doc for user: ${userId} and loId: ${loId}:`, loDoc);
                                if(loDoc && loDoc['embedLoStatus'] && loDoc['embedLoStatus'] === 'AWAIT_REVIEW') {
                                    //If lo state is in awaiting review state then only make update associated LO call
                                    console.log(`Updating Associated LO for user: ${userId} and loId: ${loId}:`);
                                    await updateAssociatedLo(moduleId, cname, userId, loId);
                                }
                            } catch (e) {
                                console.log(`No doc found for user ${userId} and loId: ${loId}`);
                            }
                        }
                    }
                }
            }
        }
    }
}

const checkForVersionMismatchForModule = async (moduleId, cname, orgId) => {
    for(let from = 0; from < 7500; from +=500) {
        const usersList = await getInvitedLearnersWithVersion(moduleId, cname, orgId, from);
        for (const user of usersList) {
            try {
                const versionedDoc = await gameEngineCouchbase.get(VERSION_DOC_KEY(moduleId, cname, user.userId));
                const reattemptVersion = versionedDoc && versionedDoc['reattemptVersion'];
                const geSummaryDoc = await gameEngineCouchbase.get(GE_SUMMARY_DOC_KEY(moduleId, cname, user.userId, reattemptVersion));
                const versionFromGE = geSummaryDoc && geSummaryDoc['version'];
                console.log(`for ${user.userId} ->  ${versionFromGE} : ${user.version}`);
                if (user.version !== versionFromGE) {
                    console.log(`version mismatch for user ${user.userId} b/w GE: ${versionFromGE} and gql: ${user.version}`);
                    writeLog(`version mismatch for user ${user.userId} b/w GE: ${versionFromGE} and gql: ${user.version}`);
                }
            } catch (e) {
                console.log('failed for user', user.userId, e);
            }
        }
    }
}

const checkForVersionMismatch = async (moduleId, cname, orgId) => {
    try {
        await initialiseCouchbase();
        await checkForVersionMismatchForModule(moduleId, cname, orgId);
    } catch (e) {
        console.log('Got Error: ', e);
    }
}


const main = async (moduleId, cname, orgId, forUser) => {
    try {
        await initialiseCouchbase();
        const embedLoMappings = await getEmbedLoMappings(moduleId, cname);
        await correctEmbedLoMappings(moduleId, embedLoMappings);
        await correctInvitedLearnersData(moduleId, cname, orgId, embedLoMappings, forUser);
    } catch (e) {
        console.log('Got Error: ', e);
    }
}

// checkForVersionMismatch('1214978629974262886', '1069834390334531305', '1069834383551410377');
main('1629116201813001066', '1191781057039739045', '1191781047907247281');