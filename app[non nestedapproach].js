//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ToDoDB');

const app = express();

const itemsSchema = new mongoose.Schema({
  name: String,
  list: String
});

const Item  = mongoose.model("Item", itemsSchema);

const WorkItem = mongoose.model("WorkItem", itemsSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const item1 = new Item({
  name: "Buy Food",
  list: "Default"
});

const item2 = new Item({
  name: "Cook Food",
  list: "Default"
});

const item3 = new Item({
  name: "Cook Food",
  list: "Default"
});


const defaultArray = [item1, item2, item3];




const workItems = [];

app.get("/", function(req, res) {

const day = date.getDate();

Item.find().then(items=>{
  if(items.length===0){
    Item.insertMany(defaultArray).then(result=>{
      console.log("Successfully added items to the database");
    });    
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: day, newListItems: items});
  }    

}).catch(err=>{
  console.log("Error in fetching default files",err);
});


});

app.post("/", async function(req, res){

  const item = {name: req.body.newItem, list: req.body.list};
  console.log(req.body);
  await Item.create(item);
  res.redirect("/"+req.body.list);

  // if (req.body.list === "Work") {
  //   await WorkItem.create(item);
  //   res.redirect("/work");
  // } else {
  //   await Item.create(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const checkedItem = req.body.checkbox;
  

  Item.findOne({_id: checkedItem}).then(item=>{
    Item.deleteOne({_id: checkedItem}).then(result=>{
      if(item.list === "Default"){
        res.redirect("/");
      }else{
        res.redirect("/"+item.list);
      }
    });

  });

  // if (req.body.list === "Work") {
  //   WorkItem.deleteOne({_id: checkedItem}).then(result=>{
  //     res.redirect("/");
  //   });
  // } else {
  //   Item.deleteOne({_id: checkedItem}).then(result=>{
  //     res.redirect("/");
  //   });
  // }


});

// app.get("/work", function(req,res){
//   WorkItem.find().then(workItems=>{
//     res.render("list", {listTitle: "Work List", newListItems: workItems});
//   }).catch(err=>{
//     console.log("Error in fetching default files",err);
//   });

// });

app.get("/:listName", function(req,res){
  const listName = req.params.listName;

  Item.find({list: listName}).then(items=>{
    res.render("list", {listTitle: listName, newListItems: items});
  });
});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(8080, function() {
  console.log("Server started on port 3000");
});
