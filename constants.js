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

exports.UM_ROUTE = {
    url: 'http://umg-svc-gqls.internal.prod.mindtickle.com/graphql',
    getBodyListAllModules: (moduleId) => ({
        "operationName": "ListUserModules",
        "variables": {},
        "query": `query ListUserModules {\n  userGroup {\n    listModuleUsers(entityId: "${moduleId}", listModuleUsersFilter: {completionStatus: [IN_PROGRESS, COMPLETED], sortField: INVITED_ON, from: 0, size: 1000}) {\n      invitations {\n        moduleId\n        user {\n          userId\n        }\n      }\n    }\n  }\n}\n`
    }),
    getHeaders: (cname, orgId) => ({
        "org_id": orgId,
        "company_id": cname,
        "req_id": "script_correction"
    })
}