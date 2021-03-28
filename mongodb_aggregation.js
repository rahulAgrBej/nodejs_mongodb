const { MongoClient } = require('mongodb');

// https://developer.mongodb.com/quickstart/node-aggregation-framework/
async function printCheapestSuburbs(client, country, market, maxNumberToPrint) {
    const pipeline = [
        {
          '$match': {
             'bedrooms': 1,
             'address.country': country,
             'address.market': market,
             'address.suburb': {
               '$exists': 1,
               '$ne': ''
             },
             'room_type': 'Entire home/apt'
           }
        }, {
          '$group': {
             '_id': '$address.suburb',
             'averagePrice': {
               '$avg': '$price'
             }
           }
        }, {
          '$sort': {
            'averagePrice': 1
           }
        }, {
          '$limit': maxNumberToPrint
        }
      ];
    const aggCursor = client.db("sample_airbnb")
                            .collection("listingsAndReviews")
                            .aggregate(pipeline);
    
    await aggCursor.forEach(airbnbListing => {
        console.log(`${airbnbListing._id}: ${airbnbListing.averagePrice}`);
        });
}

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/drivers/node/ for more details
     */
    const uri = process.env.MONGODB_TEST_CLUSTER;
    
    /**
     * The Mongo Client you will use to interact with your database
     * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
     */
    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        await printCheapestSuburbs(client, "Australia", "Sydney", 10);

    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

main().catch(console.error);

// Add functions that make DB calls here