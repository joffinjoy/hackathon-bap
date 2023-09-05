'use strict'

exports.searchInstituteMessageDTO = (instititionName, filter) => {
	return {
		intent: {
            room: {
                fulfillment: {
                    agent: {
                        person: {
                            state: filter.state ? filter.state : "",
                            tags: [
                                {
                                    name: "facilities",
                                    list: (filter.facilities) ? filter.facilities : []
                                }
                            ]
                        },
                        organization: {
                            descriptor: {
                                name: instititionName
                            }
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
