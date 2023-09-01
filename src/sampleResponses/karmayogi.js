/**
 * name : sampleResponses/karmayogi.js
 * Description : Sample responses for karmayogi project.
 */
module.exports = {
    search_api_response : {
        "count": "1",
        "rooms": [
            {
                "bpp": {
                "bpp_id": "https://dev.elevate-apis.shikshalokam.org/bpp",
                "bpp_uri": "https://dev.elevate-apis.shikshalokam.org/bpp"
                },
                "room": {
                "id": "6480d3b262820fd9e6bf0978",
                "name": "Muse's Music Room",
                "state": "state",
                "capacity": "50",
                "facilities": [
                    "ac",
                    "wifi",
                    "smart-class",
                    "catering",
                    "parking"
                ],
                "image": "https://loremflickr.com/640/480/abstract?random=u0ssiug3w2",
                "institute": "FITJEE",
                "description": "lorem"
                },
                "slots": [
                {
                    "item": {
                    "id": "6480d3aca8cc31fe6f2709b4"
                    },
                    "fulfillment": {
                    "id": "ecacbbad-8c9b-47c8-ae6c-35ae2efbbcc5",
                    "startTime": "2023-03-01T03:30:00",
                    "endTime": "2023-03-01T04:30:00",
                    "timeZone": "Asia/Calcutta"
                    }
                },
                {
                    "item": {
                    "id": "6480d3aca8cc31fe6f270d8f"
                    },
                    "fulfillment": {
                    "id": "65675af2-a9ed-4de3-9abe-555ac2476b4b",
                    "startTime": "2023-03-01T04:30:00",
                    "endTime": "2023-03-01T05:30:00",
                    "timeZone": "Asia/Calcutta"
                    }
                }
                ]
            }
        ]
    },
    confirm_api_response : {
        "fulfillment": {
          "id": "0e601a47-9a02-41d5-be21-2065728e0ed2",
          "startTime": "2023-03-02T11:30:00",
          "endTime": "2023-03-02T12:30:00",
          "room": {
            "id": "6480d3b262820fd9e6bf0978",
            "name": "Muse's Music Room",
            "state": "state",
            "capacity": "50",
            "facilities": [
              "ac",
              "wifi",
              "smart-class",
              "catering",
              "parking"
            ],
            "image": "https://loremflickr.com/640/480/abstract?random=u0ssiug3w2",
            "institute": "FITJEE",
            "description": "lorem"
          },
          "orderId": "2cf6d79d-86b0-443e-8901-367da54fae60"
        }
    }
}