//EXPRESS FORMALITY
const express= require("express");
const app = express();
const port = 3000;


const _=require("lodash");

//DATABASE REQUIREMENT :
const mongoose = require("mongoose")

//TO FETCH THE DATA FROM FORM  AND USE IT 
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));

//TO GET DATE 
const date = require(__dirname+"/date.js")

//TO SEE FOR FILES THROUGH STATIC FOLDER NAMED 'PUBLIC'
app.use(express.static("public"));

//SETTING A VIEW ENGINE FROM HERE TEMPLATES OF CODE CAN BE USED :
app.set("view engine","ejs")
 
//Connecting to database mongoose:
mongoose.set('strictQuery',false);
 
mongoose.connect("mongodb://127.0.0.1:27017/newToDoListDB",{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{console.log("Successfully connected to the new db");})



//Making a new item SChema :
const itemSchema={
    name:String
};

//Making New model 
const Item = mongoose.model("Item",itemSchema);

//Making 3 default items :
const i1 = new Item({
    name:"Welcome to your own To Do List Space"
})
const i2 = new Item({
    name: "Hit + for a new task"
})
const i3 = new Item({
    name: "<-- Hit this checkbox to delete a task"
})

//Makiung an array to save default items:
const defaultArray=[i1,i2,i3];

//Making a new custom list SChema :
const customSchema={
    name:String,
    items:[itemSchema]
}

//Making New model 
const List = mongoose.model("List",customSchema);




//Home Route With if-else inorder to save default items and render them 
app.get("/",function(req,res){

    Item.find(function(err,myItems){
        if(myItems.length === 0){

            //Saving this array in our db:

            Item.insertMany(defaultArray,function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Default items successfully added to db");
                }
            }) 
        }else{
            res.render("home",{
                pageTitle:"Today",
                whichTask:myItems
            })
        }

    })
})

//Rendering New Item Route:
app.post("/",function(req,res){
    const NewTask = req.body.newTask;
    const whichList = req.body.List;
    // tasks.push(NewTask);
    // res.redirect("/")

    const newItem = new Item({
        name:NewTask
    })

    if(whichList==="Today"){
        newItem.save();
        res.redirect("/");
    }else{
        List.findOne({name:whichList},function(err,foundList){
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/"+whichList);
            // res.redirect("/"+customList)
        });
    }
})


//Delete Route:
app.post("/delete",function(req,res){
    const checkItem = req.body.checkBox;
    const whichList = (req.body.listName);

    if(whichList=="Today"){
        Item.findByIdAndDelete(checkItem,function(err){
            if(!err){
                console.log(`Deleted :${checkItem}`);
                res.redirect("/")
            }
        })
    }else{
        List.findOneAndUpdate({name:whichList},{ $pull:{items:{_id:checkItem}}},function(err,foundList){
                if(!err){
                    res.redirect("/"+whichList)
                }
            });
    }
})


//Dynamic Route 
app.get("/new/:customListName",function(req,res){
    const customList = _.capitalize(req.params.customListName)
    // console.log(customList);
    List.findOne({name:customList},function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name:customList,
                    items:defaultArray
                })
                list.save();
                res.redirect("/"+customList)
            }else{
                res.render("home",{
                    pageTitle:foundList.name,
                    whichTask:foundList.items
                })
            }
        }
    })

})


app.get("/contact",function(req,res){
    res.render("contact")
});

//====================================================================
app.listen(port,function(req,res){
    console.log(`listening on http://localhost:${port}`);
}) 
//====================================================================