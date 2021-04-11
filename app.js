const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname+ "/date.js");


const app = express();
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
//Connet to mongoDB
mongoose.connect("mongodb+srv://admin-tuandat:chuyentoandabest@cluster0.6ghoj.mongodb.net/todolistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.set('useFindAndModify', false);

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Learning English"
});

const item2 = new Item({
    name: "Reading Book"
});

const item3 = new Item({
    name: "Investing and Coding"
});

const defaultItem = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get('/', (req, res) => {

    // const day = date.getDate();

    Item.find({}, function (err, items) {

        if (items.length === 0) {

            Item.insertMany(defaultItem, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully")
                }
            });

            res.redirect("/");

        } else {

            res.render('list', {
                listTitle: "Today",
                newListItem: items
            });
        }
    })



});

app.get("/:customListName", (req, res) => {

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({
        name: customListName
    }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //Create a new List
                const list = new List({
                    name: customListName,
                    items: defaultItem
                });

                list.save();
                res.redirect("/" + customListName);
            } else {
                //Show an existing List
                res.render('list', {
                    listTitle: foundList.name,
                    newListItem: foundList.items
                });
            }
        }
    });

});

app.post('/', (req, res) => {
    const listName = req.body.list
    const item = new Item({
        name: req.body.newItem
    });

    if (listName === "Today") {

        item.save();

        res.redirect('/');
    } else {
        //Find list 
        List.findOne({name: listName}, function (err, foundList) {
            //Add item to listItem
            foundList.items.push(item);   

            foundList.save();
                   
            res.redirect('/' + listName);
                          
        });

    }

});

app.post('/delete', (req, res) => {
    const listName = req.body.listName.trim();
    const checkedItemId = req.body.checkbox.trim();

    if (listName === "Today") {

        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Delete successfully!");
    
                res.redirect('/');
            }
        });

    } else {

        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if (!err) {
                res.redirect('/' +listName);
            }
        })

    }

});

app.get('/favicon.ico', function(req, res) {
    res.status(204);
    res.end();
});



app.get('/about', (req, res) => {

    res.render('about');

});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});