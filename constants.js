exports.CE_COUCHBASE = {
    username: 'CB_USERNAME',
    password: 'CB_PASSWORD',
    url: 'cb-6-node-1.internal.mindtickle.com',
    bucket: 'ce',
}

exports.GE_COUCHBASE = {
    username: 'CB_USERNAME',
    password: 'CB_PASSWORD',
    url: '10.0.3.141',
    bucket: 'gameengine',
};

exports.CE_ROUTE = {
    url: 'http://ce.internal.mindtickle.com',
    getAllLOs: (moduleId, version, companyId) => `/game/${moduleId}/version/${version}/learningObjects?company=${companyId}`
};

exports.GE_ROUTE = {
    url: 'http://ge.internal.mindtickle.com',
    updateAssociatedLo: (moduleId, userId, loId, companyId) => `/user/${userId}/company/${companyId}/ge/${moduleId}/loid/${loId}/update_associated_lo`
};

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
    }),
    getBodyInvitedModulesWithVersion: (moduleId, from) => ({
        "operationName": "ListUserModules",
        "variables": {},
        "query": `query ListUserModules {\n  userGroup {\n    listModuleUsers(entityId: "${moduleId}", listModuleUsersFilter: {completionStatus: [NOT_STARTED, IN_PROGRESS, COMPLETED], sortField: INVITED_ON, from: ${from}, size: 500}) {\n      invitations {\n        moduleId\n        module {\n          version\n        }\n        user {\n          userId\n        }\n      }\n    }\n  }\n}\n`
    })
};

exports.VERSION_DOC_KEY = (moduleId, cname, userId) => `C|${cname}|G|${moduleId}|U|${userId}|V`;
exports.GE_SUMMARY_DOC_KEY = (moduleId, cname, userId, reattemptVersion) => `C|${cname}|G|${moduleId}|U|${userId}|R|${reattemptVersion}|GE`;
exports.LO_DOC_KEY = (moduleId, cname, userId, reattemptVersion, loId) => `C|${cname}|G|${moduleId}|U|${userId}|R|${reattemptVersion}|LO|${loId}`;