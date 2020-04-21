const router = require('express').Router();
const {
  createDb,
} = require('./db.js')
const {
  getSeats,
  bookSeat,
  getBookedSeats,
  removeBookingBySeat,
} = require('./handlers')

// Code that is generating the seats.
// ----------------------------------
// // creating the db - 'ticket_widget', collection - 'seats'
// // that holds teh documents of seat: {
// // _id: 'row-seat',
// // price: 225,
// // isBooked: false,
// // }
// createDb(); // done
// ----------------------------------

// client endpoints
router.get('/api/seat-availability',getSeats)
  // I chose to do both: 1. the client info is in the seat document
  // 2. there is a clients collection with the client and all their bookings (based on email as _id)
router.post('/api/book-seat', bookSeat)

// admin endpoints
router.get('/admin/booked-seats', getBookedSeats)
  // expects a body: {
  // "seatId": "LETTER-NUMBER" 
  // }
  // updates both collections
router.put('/admin/remove-booking-by-seat', removeBookingBySeat)

module.exports = router;
