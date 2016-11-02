var google = require('googleapis');

function googleCalendarManager(mainSpecs) {
    "use strict";
    var auth;
    var adminService = google.admin('directory_v1');

    function getResources(specs) {
        return new Promise(function (resolve, reject) {
            var resources = [];
            var request = {
                auth: auth,
                maxResults: 250
            };

            if (specs.maxResults) {
                specs.maxResults = specs.maxResults;
            }

            if (specs.fields) {
                request.fields = specs.fields;
            }

            function listResources(pageToken) {
                if (pageToken) {
                    request.pageToken = pageToken;
                }
                adminService.files.list(request, function (err, response) {
                    if (err) {
                        reject('The Admin API returned an error: ' + err);
                        return;
                    }
                    resources = resources.concat(response.items);

                    if (resources.length === 0) {
                        resolve(resources);
                        return;
                    }
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

    auth = mainSpecs.auth;
    return {
        getResources: getResources
    };
}

module.exports = googleCalendarManager;