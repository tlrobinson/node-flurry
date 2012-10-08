var FLURRY = require("./flurry");

// var FLURRY_ACCESS_KEY = "";

var flurry = FLURRY.createClient(FLURRY_ACCESS_KEY);

flurry.getAllApplications(function(err, object) {
    console.log(err, object);
    var key = object.applications[0].apiKey;
    var start = FLURRY.daysAgo(7);
    var end = FLURRY.daysAgo(1);

    flurry.getApplication(key, console.log);
    flurry.getAppMetrics(key, "ActiveUsers", start, end, console.log);
    flurry.getEventMetrics(key, 'EVENT_NAME', start, end, console.log);
    flurry.getEventMetricsSummary(key, start, end, console.log);
});
