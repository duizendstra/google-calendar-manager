var google = require('googleapis');

function googleCalendarManager(mainSpecs) {
    "use strict";
    var auth;
    var adminService = google.admin('directory_v1');
    var calendarService = google.calendar('v3');

    function getResources(specs) {
        return new Promise(function (resolve, reject) {
            var resources = [];
            var request = {
                auth: auth
            };

            request.maxResults = specs.maxResults || 250;
            request.customer = specs.customer || "my_customer";
            if (specs.fields) {
                request.fields = specs.fields;
            }

            function listResources(pageToken) {
                if (pageToken) {
                    request.pageToken = pageToken;
                }
                adminService.resources.calendars.list(request, function (err, response) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (response.items === 0) {
                        resolve(resources);
                        return;
                    }

                    resources = resources.concat(response.items);

                    if (!response.nextPageToken) {
                        resolve(resources);
                        return;
                    }
                    listResources(response.nextPageToken);
                });
            }
            listResources();
        });
    }

    function getEvents(specs) {
        return new Promise(function (resolve, reject) {
            var events = [];
            var request = {
                auth: auth,
                calendarId: specs.calendarId,
                maxResults: 250
            };

            if (specs.optionalParameters) {
                Object.keys(specs.optionalParameters).forEach(function (parameter) {
                    if (specs.optionalParameters[parameter] !== undefined) {
                        request[parameter] = specs.optionalParameters[parameter];
                    }
                });
            }

            function listEvents(pageToken) {
                if (pageToken) {
                    request.pageToken = pageToken;
                }
                calendarService.events.list(request, function (err, response) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (response.items === 0) {
                        resolve(events);
                        return;
                    }

                    events = events.concat(response.items);


                    if (!response.nextPageToken) {
                        resolve(events);
                        return;
                    }
                    listEvents(response.nextPageToken);
                });
            }
            listEvents();
        });
    }

    auth = mainSpecs.auth;
    return {
        getResources: getResources,
        getEvents: getEvents
    };
}

module.exports = googleCalendarManager;