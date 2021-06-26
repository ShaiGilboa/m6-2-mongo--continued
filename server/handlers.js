'use strict';
const {
  startClient,
  arrayToObject,
  seatAlreadyBooked,
  bookSeatDB,
  getBookedSeatsDB,
  removeSeatFromSeats,
  removeSeatFromClients,
} = require('./db.js')

const getSeats = async (req, res) => {
  const client = await startClient()
  try {
    console.log('sdf');
    await client.connect();
    console.log('connected! - getSeats');
    const db = await client.db('ticket_widget');
    const seatsArray = await db.collection('seats').find().toArray();
    const seats = arrayToObject(seatsArray);
    // console.log('seats',seats)
    res.status(200).json({
      seats,
      numOfRows: 8,
      seatsPerRow: 12,
    })
    client.close()
    console.log('disconnected! - getSeats');
  } catch (err) {
    console.log('err',err)
  }
};

const bookSeat = async (req, res) => {
  const {seatId, creditCard, expiration, fullName, email } = req.body;
  if (!creditCard || !expiration) {
    res.status(400).json({
      status: 400,
      message: 'There is a problem with the credit card information',
    })
  } else if(!fullName || !email){
    res.status(400).json({
      status: 400,
      message: 'There is a problem with your personal information',
    })
  } else {
    try {
      const response = await seatAlreadyBooked(seatId)
      if(response) return res.status(400).json({
        status: 400,
        message: 'We\'re sorry. It seems that this seat is no longer available',
      });
      return await bookSeatDB(seatId, fullName, email)
        ? res.status(200).json({
          status: 200,
          success: true,
        })
        : res.status(500).json({
          status: 500,
          success: false,
        })
    } catch (err) {
    console.log('err',err)
  }
  } 
}

const getBookedSeats = async (req, res) => {
  const bookedSeatsArr = await getBookedSeatsDB();
  bookedSeatsArr.length
    ? res.status(200).json({
      status: 200,
      bookedSeats: bookedSeatsArr,
    })
    : res.status(404).json({
      status: 404,
    })
}

const removeBookingBySeat = async (req, res) => {
  const { seatId } = req.body;
  const removeSeatFromSeatsResponse = await removeSeatFromSeats(seatId);
  const removeSeatFromClientsResponse = await removeSeatFromClients(seatId);
  if (removeSeatFromClientsResponse && removeSeatFromSeatsResponse) {
    res.status(204).json({
      status: 204,
    })
  } else {
    res.status(404).json({
      status: 404,
      removeSeatFromSeats: removeSeatFromSeatsResponse,
      removeSeatFromClients: removeSeatFromClientsResponse,
    })
  }
}

module.exports = {
  getSeats,
  bookSeat,
  getBookedSeats,
  removeBookingBySeat,
  };
