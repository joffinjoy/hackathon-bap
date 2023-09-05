'use strict'

exports.searchRoomMessageDTO = (roomName, filter) => {
	return {
		intent: {
            room : {
                fulfillment: {
                    agent: {
                        person: {
                            name: roomName,
                            state: filter.state ? filter.state : "",
                            tags: [
                                {
                                    name: "facilities",
                                    list: (filter.facilities) ? filter.facilities : []
                                }
                            ]
                        }
                    }
                },
                item: {
                    time: {
                        timestamp: filter.date ? filter.date : ""
                    },
                    quantity: {
                        maximum: {
                            count: filter.capacity ? filter.capacity : ""
                        }
                    }
                }
            }
		},
	}
}


