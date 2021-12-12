//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
  name: String,
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: 'Welcome to your todolist!',
});

const item2 = new Item({
  name: 'Hit the + button to add a new item',
});

const item3 = new Item({
  name: '<- Hit this to delete an item.',
});

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model('List', listSchema);

app.get("/", function(req, res) {
  itemNameList = []
  Item.find({}, function(err, foundItems){
    if(foundItems.length == 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log('Successfully saved default items to DB.');
        }
      })
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.get('/:param', function(req,res){
  const customListName = req.params.param;
  List.findOne({name: customListName}, function(err, foundItems){
    if(foundItems){
      res.render("list", {listTitle: foundItems.name, newListItems: foundItems.items});
    }else{
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save()
      res.redirect('/' + customListName);
    }
  })
});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list;
  const items = []

  const item1 = new Item({
    name: item
  });

  if(listName === "Today"){
    item1.save();
    res.redirect('/');
  }else{
    List.findOne({ name: listName }, function(err, foundList){
      foundList.items.push(item1);
      foundList.save();
      res.redirect('/' + listName);
    });
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post('/delete', function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === 'Today'){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully deleted checked item.");
        res.redirect('/');
      }
    });
  }else{
    List.findOne({ name: listName }, function(err, foundList){
      deleteItemIndex = foundList.items.indexOf(checkedItemId)
      foundList.items.splice(deleteItemIndex, 1);
      foundList.save();
      res.redirect('/' + listName);
    });
  }
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
