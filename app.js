const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(express.static("css"));

mongoose.connect("mongodb+srv://admin-prakhar:prakhar123@cluster0.tn2hq.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your TODOList!!"
})

const item2 = new Item({
    name: "Hit the + button to add a new item."
})

const item3 = new Item({
    name: "<-- Hit this to delete the item."
})

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

let workItems = [];

app.get("/", function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully saved defeault items to server")
                    }
                });
                res.redirect("/");
            }
            else {
                res.render("list", { listTitle: "Today", item: foundItems });
            }
        }
    });
});

app.post("/", function (req, res) {
    const itemName = req.body.newlist;

    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    }
    else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
});

app.post("/delete", function (req, res) {
    const delete_id = req.body.checkbox;

    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(delete_id, function (err) {
            if (err) {
                alert("Unable to delete the item, may be its the required one");
                console.log(err);
            } else {
                console.log("Deleted succefully")
            }
        });
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: delete_id}}}, function(err, foundList){
            if(!err){
                res.redirect("/"+ listName);
            }
        });
    }
})

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //create a new list
                const lis = new List({
                    name: customListName,
                    items: defaultItems
                })

                lis.save();
                res.redirect("/" + customListName)

            }
            else {
                res.render("list", { listTitle: foundList.name, item: foundList.items });
            }
        }
    })


})
app.get("/about", function (req, res) {
    res.render("about");
})
app.listen(process.env.PORT||3000, function () {
    console.log("Server is running on port 3000")
});
