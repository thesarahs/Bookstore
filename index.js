// import necessary libraries
const express = require('express');
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ejs = require('ejs');
const app = express();
const router = express.Router();

// to handle the _method field for DELETE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// to parse JSON requests
app.use(express.json());

// sets variable to directory/views
const path = __dirname + '/views/';
const port = 8080;

// allows for file access and routing
app.use(express.static(path));
app.use('/', router);

// for EJS rendering
module.exports = router;

// displays HTTP method called in terminal
router.use(function (req,res,next) {
    console.log('/' + req.method);
    next();
});


// databases
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
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    purchasedBooks: ['The Catcher in the Rye','1984']
  },
  {
    id: '2',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    purchasedBooks: ['To Kill a Mockingbird']
  },
  {
    id: '3',
    name: 'Bob Smith',
    email: 'bob@example.com',
    purchasedBooks: ['1984','To Kill a Mockingbird']
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    purchasedBooks: ['The Great Gatsby']
  }];

let admins = [ {
    username: 'admin',
    password: 'admin'
}]


// ============ HOME PAGE ============
router.get('/', function(req,res){
    res.status(200).sendFile(path + 'index.html');
});

// ============ BOOKS PAGE ============
// Create a new book
router.post('/books', function(req,res){
    const bookExists = books.some(book => book.isbn === req.body.isbn);
    if (bookExists) return res.status(409).send('Book already exists');
    books.push(req.body);
    res.status(201).redirect('/books');
});
// Read/View entire collection
router.get('/books', function(req,res){
    res.render('books', { books });
});
// Update just one book
router.put('/books/:title', function(req,res){
    const requestedBook = books.find(book => book.title === req.params.title);
    if (!requestedBook) return res.status(404).send('Book not found');
    requestedBook.title = req.body.title || requestedBook.title;
    requestedBook.author = req.body.author || requestedBook.author;
    requestedBook.pubdate = req.body.pubdate || requestedBook.pubdate;
    requestedBook.isbn = req.body.isbn || requestedBook.isbn;
    res.status(200).redirect('/books');
});
// Delete just one book
router.delete('/books/:title', function(req,res){
    const i = books.findIndex(book => book.title === req.params.title);
    if (!books[i]) return res.status(404).send('Book not found');
    books.splice(i,1);
    res.status(200).redirect('/books');
});

// ============ AUTHORS PAGE ============
// Create a new author
router.post('/authors', function(req,res){
    const authorExists = authors.some(author => author.name === req.body.name);
    if (authorExists) return res.status(409).send('Author already exists');
    authors.push(req.body);
    res.status(201).redirect('/authors');
});

// Read/View entire collection
router.get('/authors', function(req,res){
    res.render('authors', { authors });
});

// Update just one author
router.put('/authors/:name', function(req,res){
    const requestedAuthor = authors.find(author => author.name === req.params.name);
    if (!requestedAuthor) return res.status(404).send('Author not found');
    requestedAuthor.name = req.body.name || requestedAuthor.name;
    requestedAuthor.booklist.push(req.body.booklist);
    requestedAuthor.biography = req.body.biography || requestedAuthor.biography;
    res.status(200).redirect('/authors');
});

// Delete just one author
router.delete('/authors/:name', function(req,res){
    const i = authors.findIndex(author => author.name === req.params.name);
    if (!authors[i]) return res.status(404).send('Author not found');
    authors.splice(i,1);
    res.status(200).redirect('/authors');
});

// ============ USERS PAGE ============
// Create a new user
router.post('/users', function(req,res){
    const userExists = users.some(user => user.email === req.body.email);
    if (userExists) return res.status(409).send('User already exists');
    const highestId = Math.max(...users.map(user => parseInt(user.id))) + 1;
    const newUserId = highestId.toString();
    const newUser = {
        id: newUserId,
        name: req.body.name,
        email: req.body.email,
      };
    users.push(newUser);
    res.status(201).send('New user created!');
});

// Login to read/view entire collection 
router.get('/login', function(req,res){
    res.status(200).render('login', { admins });
});

// for signing JWT tokens
const secretKey = crypto.randomBytes(32).toString('hex');

// Send login and receive JWT
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = admins.find(admin => admin.username === username && admin.password === password);
    if (user) {
        const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
        res.redirect(`/users?token=${token}`);
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.query.token;
    if (!token) return res.status(401).redirect('/login.html');
    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).redirect('/login.html');
        req.user = user;
        next();
    });
};

// View users page securely
router.get('/users', authenticateToken, function(req,res){
    const token = req.query.token;
    res.status(200).render('users', { users, token });
});
// Update just one user securely
router.put('/users/:id', authenticateToken, function(req,res){
    const token = req.query.token;
    const requestedUser = users.find(user => user.id === req.params.id);
    if (!requestedUser) return res.status(404).send('User not found');
    requestedUser.name = req.body.name || requestedUser.name;
    requestedUser.email = req.body.email || requestedUser.email;
    requestedUser.purchasedBooks.push(req.body.purchasedBooks);
    res.status(200).redirect(`/users?token=${token}`);
});
// Delete just one user securely
router.delete('/users/:id', authenticateToken, function(req,res){
    const token = req.query.token;
    const i = users.findIndex(user => user.id === req.params.id);
    if (!users[i]) return res.status(404).send('User not found');
    users.splice(i,1);
    res.status(200).redirect(`/users?token=${token}`);
});

// connect!
app.listen(port, function () {
    console.log('The bookstore is running on port 8080!')
})