# Turf Town Backend ranking-system

## Overview:

This is the backend service for the Turf Town app. It provides an API to get a ranked list of venues with ads inserted at specific positions.

## Setups to run the project:

1. Clone the code using:

    git clone https://github.com/Bikash01293/ranking-system.git

2. install the required dependencies:

    yarn install or npm install

3. Follow Postman documentation link:

    https://documenter.getpostman.com/view/29208251/2sA3s7iotf

4. Use postnman to hit the url:

    url: http://localhost:3000/api/venues?userId=64e1e8c7f1b2c4e7c9f23456&longitude=-0.1278&latitude=51.5074

    Method: GET

    Response:

    [   
        {
            "location": {
                "type": "Point",
                "coordinates": [
                    -0.1278,
                    51.5074
                ]
            },
            "_id": "64e1e8c7f1b2c4e7c9f23456",
            "name": "London Cycling Hub",
            "availableSports": [
                "Cycling",
                "Hiking"
            ],
            "rating": 4.3
        },
        {
            "adContent": "Discount on cycling gear this week!"
        }
    ]

5. For running the test cases:

    yarn test
        or
    yarn test <test_filename>
    ex: yarn test venueController.test.js

    # Alternatively using npm

    npm test
        or
    npm test <test_filename>
    ex: npm test venueController.test.js


# ------------------------------------------------------------------------------------------------------------------------------
