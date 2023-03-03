let express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
let app = express();
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
require('./passport/passport');
const { storage } = require('./cloudinary');
const saltRounds = 10;
const passport = require('passport');
require('dotenv').config();
let multer = require('multer');
let upload = multer({ storage });
const session = require('express-session');
//var methodOverride = require('method-override');
const MongoStore = require('connect-mongo')
var bodyParser = require('body-parser');
let Calls = require('./models/post.model').callme;



const parser = multer({ storage: storage });
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
let Post = require('./models/post.model').Post;
let User = require('./models/post.model').User;
let Call = require('./models/post.model').call;
let mongoose = require('mongoose');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxtoken = 'pk.eyJ1Ijoic3JpamFuMiIsImEiOiJjbGVzbDQ3cWIxN2ZoM3JydjMzaWt3bXhoIn0.N3jrZBaG3TjjbPL80K7_1w';
const geocoder = mbxGeocoding({ accessToken: mapboxtoken });
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
        res.render('home.ejs', { posts, flag, success: '' });
    } catch (error) {
        console.log(error);
    }

})
app.get('/admin', async(req, res) => {
    try {
        if (req.isAuthenticated()) {
            let posts = await Post.find({});
            let calls = await Call.find({});
            let callme = await Calls.find({});
            res.render('index.ejs', { posts, calls, callme });
        } else {
            let flag = false;
            if (req.isAuthenticated()) {
                flag = true;
            }
            let posts = await Post.find({});
            res.render('home.ejs', { posts, flag, success: 'mustbeloggedin' });
        }

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
        res.render('register.ejs', { success: '' });
    } catch (error) {
        console.log(error);
    }
})


app.get('/delete/:id', async(req, res) => {
    try {
        let id = req.params.id;
        let callfind = await Calls.findById(id);
        let postfind = await Post.findById(id);

        if (callfind) {
            await Calls.findByIdAndDelete(id);
        } else if (postfind) {
            await Post.findByIdAndDelete(id);
        } else {
            await Call.findByIdAndDelete(id);
        }



        let posts = await Post.find({});
        let calls = await Call.find({});
        let callme = await Calls.find({});

        res.render('index.ejs', { posts, calls, callme });
    } catch (error) {
        console.log(error);
    }

})


app.get('/aboutus', (req, res) => {

    let flag = false;
    if (req.isAuthenticated()) {
        flag = true;
    }

    res.render('aboutus.ejs', { flag });


})

app.get('/contactus', (req, res) => {

    let flag = false;
    if (req.isAuthenticated()) {
        flag = true;
    }

    res.render('contactus.ejs', { flag });


})

app.post('/login', urlencodedParser, passport.authenticate('local', { successRedirect: '/admin', failureRedirect: '/login' }));


app.post('/register', urlencodedParser, async(req, res) => {
    try {
        console.log('hello');
        console.log(req.body);
        let user = await User.findOne({ username: req.body.username });
        let password = await User.findOne({ password: req.body.password });
        let email = await User.findOne({ email: req.body.email });
        if (user) {
            res.render('register.ejs', { success: 'username' });
        } else if (password) {
            res.render('register.ejs', { success: 'password' });
        } else if (email) {
            res.render('register.ejs', { success: 'email' });
        } else {

            let newuser = new User({
                username: req.body.username,
                password: req.body.password,
                email: req.body.email
            });
            await newuser.save();
            res.redirect('/login');;

        }
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

app.get('/addpost', async(req, res) => {
    try {
        if (req.isAuthenticated()) {
            res.render('add.ejs');
        } else {
            let flag = false;
            if (req.isAuthenticated()) {
                flag = true;
            }
            let posts = await Post.find({});
            res.render('home.ejs', { posts, flag, success: 'mustbeloggedin' });
        }


    } catch (error) {
        console.log(error);
    }
})

app.post('/admin', upload.array('image'), urlencodedParser, async(req, res) => {
    try {
        const geoData = await geocoder.forwardGeocode({
            query: req.body.title,
            limit: 1
        }).send();

        //res.send(req.files);
        let newpost = new Post(req.body);
        if (req.files.length > 0) {
            newpost.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        }

        newpost.geometry = geoData.body.features[0].geometry;
        newpost.date = new Date();
        await newpost.save();
        //res.send(newpost);
        let posts = await Post.find({});
        let calls = await Call.find({});
        let callme = await Calls.find({});

        res.render('index.ejs', { posts, calls, callme });
    } catch (error) {
        console.log(error);
    }
})

app.post('/admin/:id', upload.array('image'), urlencodedParser, async(req, res) => {
    // console.log(req.body);
    try {
        const geoData = await geocoder.forwardGeocode({
            query: req.body.title,
            limit: 1
        }).send();
        let id = req.params.id;
        const post = await Post.findByIdAndUpdate(id, req.body);
        if (req.files.length > 0) {
            const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
            post.images.push(...imgs);
        }
        await post.save();
        let posts = await Post.find({});
        let calls = await Call.find({});
        let callme = await Calls.find({});

        return res.render('index.ejs', { posts, calls, callme });
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
    try {
        let msg = await Call.findById(req.params.id);
        res.render('enquiry.ejs', { msg });
    } catch (error) {
        console.log(error);
    }
})


app.get('/:id/details', async(req, res) => {
    try {
        let flag = false;
        if (req.isAuthenticated()) {
            flag = true;
        }
        let id = req.params.id;
        let posts = await Post.findById(id);
        res.render('bigben.ejs', { posts, flag });
    } catch (error) {
        console.log(error);
    }

})

app.post('/calls', urlencodedParser, async(req, res) => {

    try {
        console.log(req.body);
        let newcall = new Calls(req.body);
        await newcall.save();
        res.redirect('/');
    } catch (error) {
        console.log(error);
    }

})

app.listen(3000, () => {
    console.log("listening 3000");
});
