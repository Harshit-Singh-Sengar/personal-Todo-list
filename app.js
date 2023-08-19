//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// connect to the monodb altas as asever
mongoose.connect("mongodb+srv://leon:omi8jqsK7Nd5g48c@cluster0.xu3g0mh.mongodb.net/todolistDB");
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});

// creating Schema 

const itemsSchema = ({
  name : String,
});

//creating model
const Item = mongoose.model("Item",itemsSchema);

//creating new documents/items
const item1 = new Item({
  name : "welcome to your todo list"
});

const item2 = new Item({
  name : "Hit the  + button to creatr a new item"
});

const item3 = new Item({
  name : "<-- HIt this to Delete an item"
});

// array to store the items

const deafultItems = [item1, item2, item3];

// Schema for customItemNames
const listSchema = {
  name : String,
  items: [itemsSchema],
}

// Schem Model for customItemNames
const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

 Item.find({})
.then(function(foundItems) {
   if(foundItems === 0){
     Item.insertMany(deafultItems)
.then(function () {
   console.log("Succesful saved in the database");
 })
 .catch(function(err) {
   console.log(err);
 }); 
 res.redirect("/");

  } else {
     res.render("list", {listTitle: "Today", newListItems: foundItems});
   }

 })
 .catch(function(err){
  console.log(err);
 });


});



app.post("/", function(req, res){

const itemName = req.body.newItem;
const listName = req.body.list;

const item = new Item({
name : itemName,
});

if(listName === "Today"){
item.save();
  res.redirect("/");
} else{
  List.findOne({name: listName})
  .then((foundlist)=>{
foundlist.items.push(item);
foundlist.save();
res.redirect("/" + listName);
  })
  .catch((err)=>{
   console.log("err");
  });
}


});



app.post("/delete",function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  
  if(listName === "Today"){
 Item.findOneAndDelete(checkedItemId)
  .then(() => {

  console.log("remove the item from the database");
  res.redirect("/");

  });
  
  }else{

    List.findOneAndUpdate({name : listName}, {$pull : {items: {_id : checkedItemId}}} )
    .then((foundlist)=>{
          res.redirect("/" + listName);
    });
  }

 

}); 

// express routes parameter meaning custom routes
app.get("/:topics",(req, res)=>{
const customListNames   =_.capitalize(req.params.topics);


List.findOne({ name: customListNames })
.then(function(foundlist){

  if(!foundlist){
    // it creates a new list
    const list = new List({
  name : customListNames,
  items: deafultItems,
    });
list.save();
res.redirect("/" + customListNames);
  }else{
//  it show existred list items
res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
  }

  
 })
 .catch(function(err){
  console.log(err);
 });


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});


