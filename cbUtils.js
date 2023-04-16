const couchbase = require('couchbase');

class CouchbaseUtil {
    constructor() {
        this.cluster = null;
        this.bucket = null;
        this.collection = null;
    }

    async initialiseConnection(connectionString, bucketName, username, password) {
        this.cluster = await couchbase.connect(connectionString, {username, password});
        this.bucket = this.cluster.bucket(bucketName);
        this.collection = this.bucket.defaultCollection();
    }

    async get(key) {
        try {
            const result = await this.collection.get(key);
            return result.content;
        } catch (error) {
            console.error(`Failed to get document with key "${key}": ${error}`);
            throw error;
        }
    }

    async upsert(key, value) {
        try {
            return await this.collection.upsert(key, value);
        } catch (error) {
            console.error(`Failed to upsert document with key "${key}": ${error}`);
            throw error;
        }
    }
}

exports.CouchbaseUtil = CouchbaseUtil;
