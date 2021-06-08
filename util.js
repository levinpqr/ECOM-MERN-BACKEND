const get = require("lodash/get");

exports.parseFilters = (req) => {
    let where = {};
    let limit = 100000000000000000;
    let skip = 0;
    let sort = {};
    let fields = {};
    try {
        let filter = JSON.parse(get(req, "query.filter", "{}"));
        where = get(filter, "where", {});
        limit = get(filter, "limit", 100000000000000000);
        skip = get(filter, "skip", 0);
        sort = get(filter, "sort", {});
        fields = get(filter, "fields", {});
    } catch (e) {
        console.log(e);
    }
    return { where, limit, skip, sort, fields };
};

exports.isNonEmptyArray = (arr) => {
    return Boolean(arr && Array.isArray(arr) && arr.length);
};
