const { CouchbaseUtil } = require('./utils.js');
const { getAllLearningObjectsWithEmbedMissions } = require('./axiosUtils')
const { CE_COUCHBASE, GE_COUCHBASE } = require('./constants.js');
const contentEngineCouchbase = new CouchbaseUtil();
const gameEngineCouchbase = new CouchbaseUtil();

const initialiseCouchbase = async () => {
    console.log('Initialising Couchbase');
    await contentEngineCouchbase.initialiseConnection(CE_COUCHBASE.url, CE_COUCHBASE.bucket, CE_COUCHBASE.username, CE_COUCHBASE.password);
    await gameEngineCouchbase.initialiseConnection(GE_COUCHBASE.url, GE_COUCHBASE.bucket, GE_COUCHBASE.username, GE_COUCHBASE.password);
    console.log('Couchbase initialised');
}

const getSomething = async (moduleId, cname) => {
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
}

const main = async (moduleId, cname) => {
    try {
        await initialiseCouchbase();
        await getSomething(moduleId, cname);
    } catch (e) {
        console.log('Got Error: ', e);
    }
}

main('1646517315774284791', '1158975533368761751');
