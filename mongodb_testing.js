
const {MongoClient} = require('mongodb')

// functions that list databases
async function listDatabases(client)
{
    databaseList = await client.db().admin().listDatabases();

    console.log('Databases:');
    databaseList.databases.forEach(db => console.log(` - ${db.name}`));
}

async function main()
{
    const MONGODB_URI = process.env.MONGODB_TEST_CLUSTER;
    console.log(MONGODB_URI);

    const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });

    try
    {
        await client.connect();
        await listDatabases(client);
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
