//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const mongoose = require('mongoose');
// mongoose.connect('mongodb://127.0.0.1:27017/ToDoDB');
mongoose.connect('mongodb+srv://admin:test123@cluster0.zvykidr.mongodb.net/ToDoDB');

const app = express();

const port = process.env.PORT || 8080;


const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item  = mongoose.model("Item", itemsSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const item1 = new Item({
  name: "Buy Food",
});

const item2 = new Item({
  name: "Cook Food",
});

const item3 = new Item({
  name: "Cook Food",
});

const defaultArray = [item1, item2, item3];


const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {

const day = date.getDate();

Item.find().then(items=>{
  if(items.length===0){
    Item.insertMany(defaultArray).then(result=>{
      console.log("Successfully added items to the database");
    });    
    List.create({name:"", items: defaultArray})
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: day, newListItems: items});
  }    

}).catch(err=>{
  console.log("Error in fetching default files",err);
});


});

app.post("/", function(req, res){

  const item = new Item({name: req.body.newItem});
  const listName = (req.body.list == date.getDate()) ? '' : req.body.list;
  console.log(listName);
  //adding to items list
  Item.create(item);

  //adding to Lists 
  List.findOne({name: listName }).then(async list=>{
    list.items.push(item);
    await list.save();
    console.log(list.items);
    res.redirect("/"+listName);
  }).catch(err=>{
    console.log("Error in adding item da");
  });
});

app.post("/delete",function(req,res){

  const checkedItem = req.body.checkbox;
  const listName = (req.body.listName == date.getDate()) ? '' : req.body.listName;

 
  List.findOne({"name": listName}).then(async list=>{
    list.items.pull({_id: checkedItem});
    await list.save();

    // BETTER TO USE THIS
  // List.findByIdAndUpdate({"name": listName}, {"$pull": {"items": {"_id": checkedItem}}} ).then(result=>{
  //   console.log(result);
  // })    


    Item.deleteOne({_id: checkedItem}).then(result=>{
      res.redirect("/"+list.name);
    })
  });
  
});


app.get("/:listName", function(req,res){
  var listName = req.params.listName;
  console.log(listName);

  List.findOne({name: listName}).then(list=>{
    res.render("list", {listTitle: listName, newListItems: list.items});
  }).catch(err=>{
    List.create({name: listName, items: defaultArray});
    res.redirect("/"+listName);
  });


});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port 3000");
});
