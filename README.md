# Flurry API client for Node.js and Q

This library supports both Node-style callbacks and [Q promises](https://github.com/kriskowal/q).

If the callback argument is omitted the method will return a promise.

e.x. This...

    Q.when(flurry.getAllApplications(), function(object) {
        console.log(object.applications);
    });

is equivalent to this...

    flurry.getAllApplications(function(err, object) {
        console.log(object.applications);
    });

except with all the awesomeness promises provide, of course!

## API

### FLURRY.createClient(apiAccessCode:String[, options:Object])

Returns a Flurry client object.

By default the client is rate limited to 1 request per second to avoid hitting Flurry's rate limits. Pass in `0` (or another value, in milliseconds) for the `rateLimit` option to disable rate limiting.

### client.getAllApplications([callback:Function])

    {
        companyName: String
        applications: [{
            name: String
            apiKey: String
            platform: String
            createdDate: Date
        }]
        version: String
        generatedDate: Date
    }

http://support.flurry.com/index.php?title=API/Code/AppInfo

### client.getApplication(apiKey:String[, callback:Function])

    {
        name: String
        platform: String
        createdDate: Date
        category: String
        versions: [{
            name: String,
            createdDate: Date
        }]
        version: String
        generatedDate: Date
    }

http://support.flurry.com/index.php?title=API/Code/AppInfo

### client.getAppMetrics(apiKey:String, metric:String, start:Date, end:Date[, callback:Function])

    {
        metric: String
        startDate: Date
        endDate: Date
        days: [{
            value: Number,
            date: Date
        }]
        version: String
        generatedDate: Date
    }

http://support.flurry.com/index.php?title=API/Code

### client.getEventMetrics(apiKey:String, event:String, start:Date, end:Date[, callback:Function])

    {
        type: 'Event'
        eventName: String
        startDate: Date
        endDate: Date
        days: [{
            date: Date
            uniqueUsers: Number
            totalSessions: Number
            totalCount: Number
            parameters: Object
        }]
        version: String
        generatedDate: Date
    }

http://support.flurry.com/index.php?title=API/Code/EventMetrics

### client.getEventMetricsSummary(apiKey:String, start:Date, end:Date[, callback:Function])

    {
        type: 'Summary'
        startDate: Date
        endDate: Date
        events: [{
            eventName: String,
            usersLastWeek: Number
            usersLastMonth: Number
            usersLastDay: Number
            totalSessions: Number
            totalCount: Number
            avgUsersLastWeek: Number
            avgUsersLastMonth: Number
            avgUsersLastDay: Number
        }]
        version: String
        generatedDate: Date
    }

http://support.flurry.com/index.php?title=API/Code/EventMetrics

