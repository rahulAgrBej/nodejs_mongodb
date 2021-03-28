
const {MongoClient} = require('mongodb')


// creates a listing in the sample airbnb database (inserts just one listing)
async function createListing(client, newListing)
{
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}`);
}

// creates multiple listings at the same time
// note that insertMany() with ordered true (default) will insert docs/rows ordered, if one fails the ones after won't run
// insertMany() with ordered false will insert docs/rows out of order and will try to insert all even if one fails
async function createMultipleListings(client, newListings)
{
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings);
    console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
    console.log(result.insertedIds);
}

// finds one listing in our collection/table by name
async function findOneListingByName(client, nameOfListing)
{
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({ name: nameOfListing });
    if (result) {
        console.log(`Found a listing in the collection with the name '${nameOfListing}':`);
        console.log(result);
    } else {
        console.log(`No listings found with the name '${nameOfListing}'`);
    }
}

// find all listings with a min bedroom and bathroom and sort by most recent reviews
async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
} = {}) {
    const cursor = client.db("sample_airbnb").collection("listingsAndReviews").find(
                            {
                                bedrooms: { $gte: minimumNumberOfBedrooms },
                                bathrooms: { $gte: minimumNumberOfBathrooms }
                            }
                            ).sort({ last_review: -1 })
                            .limit(maximumNumberOfResults);
    const results = await cursor.toArray();
    if (results.length > 0) {
        console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms:`);
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();
            console.log();
            console.log(`${i + 1}. name: ${result.name}`);
            console.log(`   _id: ${result._id}`);
            console.log(`   bedrooms: ${result.bedrooms}`);
            console.log(`   bathrooms: ${result.bathrooms}`);
            console.log(`   most recent review date: ${new Date(result.last_review).toDateString()}`);
        });
    } else {
        console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
    }
}

// updates the first doc/row that appears in the search results
async function updateListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
                        .updateOne({ name: nameOfListing }, { $set: updatedListing });
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

// upserts - creates a doc/row if one does not exist, if it does exist then updates that doc/row
async function upsertListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
                        .updateOne({ name: nameOfListing },
                                   { $set: updatedListing },
                                   { upsert: true });
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    if (result.upsertedCount > 0) {
        console.log(`One document was inserted with the id ${result.upsertedId._id}`);
    } else {
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
    }
}

// updates multiple docs/rows, in this case updates ALL listings
// in this case updates all docs that do not have a property type and gives them type unknown
async function updateAllListingsToHavePropertyType(client) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
                        .updateMany({ property_type: { $exists: false } },
                                    { $set: { property_type: "Unknown" } });
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

// deletes a doc/row
async function deleteListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
            .deleteOne({ name: nameOfListing });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

// deletes multiple docs/rows that fit a specific criteria,
// in this case those that weren scraped before a specific date
async function deleteListingsScrapedBeforeDate(client, date) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
        .deleteMany({ "last_scraped": { $lt: date } });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function main()
{
    const MONGODB_URI = process.env.MONGODB_TEST_CLUSTER;
    console.log(MONGODB_URI);

    const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });

    try
    {
        await client.connect();
        await deleteListingsScrapedBeforeDate(client, new Date("2019-02-15"));
        /*
        await deleteListingByName(client, "Cozy Cottage");

        await updateAllListingsToHavePropertyType(client);
        
        await upsertListingByName(client, "Cozy Cottage", { name: "Cozy Cottage", bedrooms: 1, bathrooms: 1 });

        await updateListingByName(client, "Infinite Views", { bedrooms: 6, beds: 8 });
        
        await findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
            minimumNumberOfBedrooms: 4,
            minimumNumberOfBathrooms: 2,
            maximumNumberOfResults: 5
        });

        await findOneListingByName(client, "Infinite Views");
        
        await createMultipleListings(
            client,
            [
                {
                    name: "Infinite Views",
                    summary: "Modern home with infinite views from the infinity pool",
                    property_type: "House",
                    bedrooms: 5,
                    bathrooms: 4.5,
                    beds: 5
                },
                {
                    name: "Private room in London",
                    property_type: "Apartment",
                    bedrooms: 1,
                    bathroom: 1
                },
                {
                    name: "Beautiful Beach House",
                    summary: "Enjoy relaxed beach living in this house with a private beach",
                    bedrooms: 4,
                    bathrooms: 2.5,
                    beds: 7,
                    last_review: new Date()
                }
            ]
        );

        await createListing(
            client,
            {
                name: "Lovely Loft",
                summary: "A charming loft in Paris",
                bedrooms: 1,
                bathrooms: 1
            }
        )
        */
    }
    catch (e)
    {
        console.log(e);
    }
    finally
    {
        await client.close();
    }
    
}

main().catch(console.error);
