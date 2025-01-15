const axios = require('axios');

/**
 * Get personalized recommendations for a user.
 */
async function getMessage(req, res) {
  try {
    const userId = req.params.userId;

    // Fetch user details from User Service
    const userResponse = await axios.get(`http://user-service:3001/user/${userId}`);
    const user = userResponse.data;

    // Fetch books from Book Service
    const booksResponse = await axios.get('http://book-service:3002/books');
    const books = booksResponse.data;

    // Example recommendation logic: recommend books of the "Fantasy" genre
    const recommendations = books.filter(book => book.genre === 'Fantasy');

    res.status(200).json({
      user,
      recommendations,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
};
module.exports={
    getMessage
}