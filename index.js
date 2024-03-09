// import necessary libraries
const express = require('express');
const ejs = require('ejs');
const app = express();
const router = express.Router();

// Set EJS as the view engine
app.set('view engine', 'ejs');
// to parse JSON requests
app.use(express.json());
// sets variable to ...Bookstore/views
const path = __dirname + '/views/';
const port = 8080;

// displays HTTP method called in terminal
router.use(function (req,res,next) {
  console.log('/' + req.method);
  next();
});

// database??
let books = [{
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    pubdate: '1925-04-10',
    isbn: '9780743273565'
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    pubdate: '1960-07-11',
    isbn: '9780061120084'
  },
  {
    title: '1984',
    author: 'George Orwell',
    pubdate: '1949-06-08',
    isbn: '9780451524935'
  },
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    pubdate: '1951-07-16',
    isbn: '9780316769480'
  }];

let authors = [ {
    name: 'F. Scott Fitzgerald',
    booklist: ['The Great Gatsby'],
    biography: 'Francis Scott Key Fitzgerald was an American novelist, widely regarded as one of the greatest American writers of the 20th century.'
  },
  {
    name: 'Harper Lee',
    booklist: ['To Kill a Mockingbird'],
    biography: 'Harper Lee was an American novelist widely known for her 1960 Pulitzer Prize-winning novel "To Kill a Mockingbird."'
  },
  {
    name: 'George Orwell',
    booklist: ['1984'],
    biography: 'George Orwell was an English novelist, essayist, journalist, and critic. His work is marked by keen intelligence and wit, a profound awareness of social injustice, and an intense opposition to totalitarianism.'
  },
  {
    name: 'J.D. Salinger',
    booklist: ['The Catcher in the Rye'],
    biography: 'Jerome David Salinger was an American writer best known for his novel "The Catcher in the Rye," which has become a classic of modern American literature.'
  }];

let users = [ {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    purchasedBooks: ['The Catcher in the Rye','1984']
  },
  {
    id: 2,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    purchasedBooks: ['To Kill a Mockingbird']
  },
  {
    id: 3,
    name: 'Bob Smith',
    email: 'bob@example.com',
    purchasedBooks: ['1984','To Kill a Mockingbird']
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily@example.com',
    purchasedBooks: ['The Great Gatsby']
  }];

// NOTE TO SELF:
// router.method(path,handler)

// ============ HOME PAGE ============
router.get('/', function(req,res){
  res.sendFile(path + 'index.html');
});

// ============ BOOKS PAGE ============
// Create a new book
router.post('/books', function(req,res){
    // const title = req.params.title;
    // console.log(title);

    // Why are these both empty???????
    console.log('Request Params:', req.params);
    console.log('Request Body:', req.body);

    const newBook = {
        title: req.body.title,
        author: req.body.author,
        pubdate: req.body.pubdate,
        isbn: req.body.isbn
    }
    books.push(newBook);
    res.status(201).json(newBook);
});
// Read/View entire collection
router.get('/books', function(req,res){
    // res.json(books);
    // res.sendFile(path + 'books.html');
    res.render('books', { books });
});
// Read/View just one book
router.get('/books/:title', function(req,res){
    const requestedBook = books.find(book => book.title === req.params.title);
    if (!requestedBook) return res.status(404).send('Book not found');
    res.json(requestedBook);
});
// Update just one book
router.put('/books/:title', function(req,res){
    const requestedBook = books.find(book => book.title === req.params.title);
    if (!requestedBook) return res.status(404).send('Book not found');
    requestedBook.title = req.body.title || requestedBook.title;
    requestedBook.author = req.body.author || requestedBook.author;
    requestedBook.pubdate = req.body.pubdate || requestedBook.pubdate;
    requestedBook.isbn = req.body.isbn || requestedBook.isbn;
    res.status(200).send('Book successfully updated!');
});
// Delete entire collection??
router.delete('/books', function(req,res){
    books = [];
    res.status(200).send('All books deleted.');
});
// Delete just one book
router.delete('/books/:title', function(req,res){
    const i = books.findIndex(book => book.title === title);
    if (!books[i]) return res.status(404).send('Book not found');
    books.splice(i,1);
    res.status(200).send('Book successfully deleted!');
});

// ============ AUTHORS PAGE ============
// Create a new author
router.post('/authors', function(req,res){
    authors.push(req.body);
    res.status(201).send('New author created!');
});
// Read/View entire collection
router.get('/authors', function(req,res){
    res.render('authors', { authors });
});
// Read/View just one author
router.get('/authors/:name', function(req,res){
    const i = authors.findIndex(author => authors.name === name);
    res.json(authors[i]);
});
// Update just one author
router.put('/authors/:name', function(req,res){
    const requestedAuthor = authors.find(author => author.name === req.params.name);
    if (!requestedAuthor) return res.status(404).send('Author not found');
    requestedAuthor.name = req.body.name || requestedAuthor.name;
    requestedAuthor.booklist = req.body.booklist || requestedAuthor.booklist;
    requestedAuthor.biography = req.body.biography || requestedAuthor.biography;
    res.status(200).send('Author successfully updated!');
});
// Delete entire collection??
router.delete('/authors', function(req,res){
    authors = [];
    res.status(200).send('All authors deleted.');
});
// Delete just one author
router.delete('/authors/:name', function(req,res){
    const i = authors.findIndex(author => authors.name === name);
    if (!authors[i]) return res.status(404).send('Author not found');
    authors.splice(i,1);
    res.status(200).send('Author successfully deleted!');
});

// ============ USERS PAGE ============
// Create entire collection??
router.post('/users', function(req,res){
    users = req.body;
    res.status(201).send('New collection created!');
});
// Create a new user
router.post('/users/:id', function(req,res){
    users.push(req.body);
    res.status(201).send('New user created!');
});
// Read/View entire collection
router.get('/users', function(req,res){
    res.render('users', { users });
});
// Read/View just one user
router.get('/users/:id', function(req,res){
    const i = users.findIndex(user => users.id === id);
    res.json(users[i]);
});
// Update just one user
router.put('/users/:id', function(req,res){
    const requestedUser = users.find(user => user.id === req.params.id);
    if (!requestedUser) return res.status(404).send('User not found');
    requestedUser.id = req.body.id || requestedUser.id;
    requestedUser.name = req.body.name || requestedUser.name;
    requestedUser.email = req.body.email || requestedUser.email;
    requestedUser.purchasedBooks = req.body.purchasedBooks || requestedUser.purchasedBooks;
    res.status(200).send('User successfully updated!');
});
// Delete entire collection??
router.delete('/users', function(req,res){
    users = [];
    res.status(200).send('All users deleted.');
});
// Delete just one user
router.delete('/users/:id', function(req,res){
    const i = users.findIndex(user => users.id === id);
    if (!users[i]) return res.status(404).send('User not found');
    users.splice(i,1);
    res.status(200).send('User successfully deleted!');
});


// allows for file access and routing
app.use(express.static(path));
app.use('/', router);
// for EJS rendering
module.exports = router;

// connect!
app.listen(port, function () {
  console.log('The bookstore is running on port 8080!')
})