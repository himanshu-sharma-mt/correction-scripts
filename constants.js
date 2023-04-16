exports.CE_COUCHBASE = {
    username: 'mindtickle',
    password: 'd36b98ef7c6696eda2a6ber3',
    url: 'cb-6-node-1.internal.mindtickle.com',
    bucket: 'ce',
}

exports.GE_COUCHBASE = {
    username: 'mindtickle',
    password: 'd36b98ef7c6696eda2a6ber3',
    url: 'cb6-cluster3.prod.mindtickle.com',
    bucket: 'gameengine',
}

exports.CE_ROUTE = {
    url: 'http://ce.internal.mindtickle.com',
    getAllLOs: (moduleId, version, companyId) => `/game/${moduleId}/version/${version}/learningObjects?company=${companyId}`
}