const {
  MongoClient,
} = require('mongodb');
const assert = require('assert');

const MAX_NUM_OF_SEATS_IN_A_ROW = 13

const startClient = async () => {
  return new MongoClient('mongodb://localhost:27017', {
    useUnifiedTopology: true,
  });
}

const checkCollection = async (dbName, collection) => {
  const client = await startClient();
  await client.connect();
  console.log('connected! - check');
  const db = await client.db(dbName);
  const finding = await db.collection(collection).find().toArray();
  client.close()
  console.log('disconnected! - check');
  return finding.length
    ?  true
    : false;
}

const createDb = async () => {
  const client = await startClient();
  await client.connect();
  console.log('connected! - creation');
  const db = await client.db('ticket_widget');
  try {
    const response = await checkCollection('ticket_widget', 'seats')
    if (!response){
      console.log('hi');
      
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      for (let row = 0; row < rows.length; row ++) {
        for (let seat = 1; seat < MAX_NUM_OF_SEATS_IN_A_ROW; seat ++) {
          // console.log('rows[row]',rows[row])
          // console.log('seat',seat)
          await db.collection('seats').insertOne({
            _id: `${rows[row]}-${seat}`,
            price: 225,
            isBooked: false,
          })
        }
      }
    }
    else {
      const finding = await db.collection('seats').find().toArray()
      console.log('already created');
      console.log('finding.length',finding.length);
    }
  client.close()
  console.log('disconnected! - creation');
  } catch (err) {
    console.log('err',err)

  }
}

const arrayToObject = (arr) => {
  const obj = {};
  arr.forEach(index => obj[index._id] = {price: index.price, isBooked: index.isBooked})
  return obj;
}

const seatAlreadyBooked = async (_id) => {
  const client = await startClient();
  try {
    await client.connect()
    console.log('connected! - seatAlreadyBooked');
    const db = await client.db('ticket_widget');
    const finding = await db.collection('seats').findOne({_id})
    client.close()
    console.log('disconnected! - seatAlreadyBooked');
    console.log('finding',finding.isBooked)
    return finding && finding.isBooked;
  } catch (err) {
    console.log('err',err)
  }
}

const insertClientInfo = async (seatId, fullName, email) => {
  const client = await startClient();
  try {
    await client.connect();
    console.log('connected! - insertClientInfo');
    const db = await client.db('ticket_widget');
    const finding= await db.collection('clients').findOne({_id: email})
    finding
      ? await db.collection('clients').updateOne({_id:email}, {$push: {
        seats: seatId
        }
      })
      : await db.collection('clients').insertOne({
        _id: email,
        fullName,
        seats: [
          seatId,
        ],
      })
    client.close()
    console.log('disconnected! - insertClientInfo');
  } catch (err) {
    console.log('err',err)
  }
}

const bookSeatDB = async (_id, fullName, email) => {
  const client = await startClient()
  try {
    await client.connect()
    console.log('connected! - bookSeatDB');
    const db = await client.db('ticket_widget');
    const r = await db.collection('seats').updateOne({_id},{ $set: {isBooked: true, fullName, email}})
    assert.equal(1, r.matchedCount)
    assert.equal(1, r.modifiedCount)

    await insertClientInfo(_id, fullName, email);

    client.close()
    console.log('disconnected! - bookSeatDB');
    return true;
  } catch (err) {
    console.log('err',err)
    return false
  }
}

const getBookedSeatsDB = async () => {
  const client = await startClient();
  try {
    await client.connect();
    console.log('connected! - getBookedSeatsDB');
    const db = await client.db('ticket_widget');

    const findings = await db.collection('seats').find({isBooked: true}).toArray()
    client.close()
    console.log('disconnected! - getBookedSeatsDB');
    return findings
  } catch (err) {
    console.log('err',err)
  }
}

const removeSeatFromSeats = async (_id) => {
  const client = await startClient();
  try {
    await client.connect()
    console.log('connected! - removeSeatFromSeats');
    const db = await client.db('ticket_widget');
    // const finding = await db.collection('seats').findOne({_id})
    const r = await db.collection('seats').updateOne({_id},{
        $unset: {
          fullName: "",
          email: ""
          },
        $set: {
          isBooked: false,
        },
      });
    assert.equal(1, r.matchedCount)
    assert.equal(1, r.modifiedCount)  
    client.close()
    console.log('disconnected! - removeSeatFromSeats');
    return true;
    } catch (err) {
    console.log('err',err);
    return false;
  }
}

const removeSeatFromClients = async (seatId) => {
  const client = await startClient();
  try {
    await client.connect()
    console.log('connected! - removeSeatFromClients');
    const db = await client.db('ticket_widget');
    const r = await db.collection('clients').updateMany({},{ $pull: { seats: {$in:[ seatId] } }})
    
    await clearClientsWithNoSeats();

    client.close()
    console.log('disconnected! - removeSeatFromClients');
    return true;
  } catch (err) {
    console.log('err',err)
    return false;
  }
}

const clearClientsWithNoSeats = async () => {
  const client = await startClient()
  try {
    await client.connect();
    console.log('connected! - clearClientsWithNoSeats');
    const db = await client.db('ticket_widget');
    await db.collection('clients').remove({ seats: { $exists: true, $size: 0 } });

    client.close();
    console.log('disconnected! - clearClientsWithNoSeats');
    
  } catch (err) {
    console.log('err',err)
  }
}

module.exports = {
  createDb,
  startClient,
  arrayToObject,
  seatAlreadyBooked,
  bookSeatDB,
  getBookedSeatsDB,
  removeSeatFromSeats,
  removeSeatFromClients,
}