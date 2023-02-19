let express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
let app = express();
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
require('./passport/passport');
const saltRounds = 10;
const passport = require('passport');
const session = require('express-session');
//var methodOverride = require('method-override');
const MongoStore = require('connect-mongo')
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
let Post = require('./models/post.model').Post;
let User = require('./models/post.model').User;
let Call = require('./models/post.model').call;
let mongoose = require('mongoose');
mongoose.connect('mongodb+srv://srijan:abcd@cluster0.531lfxk.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.set('strictQuery', false);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
            mongoUrl: 'mongodb+srv://srijan:abcd@cluster0.531lfxk.mongodb.net/?retryWrites=true&w=majority',
            collectionNmae: "sessions",
        })
        //cookie: { secure: true }
}))

app.use(passport.initialize());
app.use(passport.session());
app.get('/', async(req, res) => {
    try {
        let flag = false;
        if (req.isAuthenticated()) {
            flag = true;
        }
        let posts = await Post.find({});
        res.render('home.ejs', { posts, flag });
    } catch (error) {
        console.log(error);
    }

})
app.get('/admin', async(req, res) => {
    try {
        let posts = await Post.find({});
        let calls = await Call.find({});
        res.render('index.ejs', { posts, calls });
    } catch (error) {
        console.log(error);
    }
})

app.get('/login', (req, res) => {
    try {
        res.render('login.ejs');
    } catch (error) {
        console.log(error);
    }
})

app.get('/register', (req, res) => {
    try {
        res.render('register.ejs');
    } catch (error) {
        console.log(error);
    }
})


app.get('/delete/:id', async(req, res) => {
    try {
        let id = req.params.id;
        await Post.findByIdAndDelete(id);
        let posts = await Post.find({});
        let calls = await Call.find({});
        res.render('index.ejs', { posts, calls });
    } catch (error) {
        console.log(error);
    }

})

app.post('/login', urlencodedParser, passport.authenticate('local', { successRedirect: '/admin', failureRedirect: '/login' }));


app.post('/register', urlencodedParser, async(req, res) => {
    try {
        console.log('hello');
        console.log(req.body);
        let user = await User.findOne({ username: req.body.username });

        let newuser = new User({
            username: req.body.username,
            password: req.body.password
        });
        await newuser.save();
        res.redirect('/login');;



    } catch (error) {
        console.log(error);
    }

});

app.get('/logout', (req, res) => {
    try {
        req.logout((err) => {
            if (err) {
                nextTick(err);
            }
            res.redirect('/');
        });
    } catch (error) {
        res.send(500).send(error.message);
    }
})


app.get('/edit/:id', async(req, res) => {
    try {
        let id = req.params.id;
        let posts = await Post.findById(id);
        res.render('edit.ejs', { posts });
    } catch (error) {
        console.log(error);
    }

})

app.get('/addpost', (req, res) => {
    try { res.render('add.ejs'); } catch (error) {
        console.log(error);
    }
})

app.post('/admin', urlencodedParser, async(req, res) => {
    try {
        let newpost = new Post(req.body);
        newpost.date = new Date();
        await newpost.save();
        let posts = await Post.find({});
        let calls = await Call.find({});
        res.render('index.ejs', { posts, calls });
    } catch (error) {
        console.log(error);
    }
})

app.post('/admin/:id', urlencodedParser, async(req, res) => {
    try {
        let id = req.params.id;
        await Post.findByIdAndUpdate(id, req.body);
        let posts = await Post.find({});
        let calls = await Call.find({});
        res.render('index.ejs', { posts, calls });
    } catch (error) {
        console.log(error);
    }
})


app.post('/contact', urlencodedParser, async(req, res) => {
    try {
        console.log(req.body);
        let newcontact = new Call(req.body);
        await newcontact.save();
        res.redirect('/');
    } catch (error) {
        console.log(error);
    }
})

app.get('/:id/enquiry', async(req, res) => {

    let msg = await Call.findById(req.params.id);
    res.render('enquiry.ejs', { msg });



})

app.listen(3000, () => {
    console.log("listening 3000");
});