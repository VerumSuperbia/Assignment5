//const { query } = require('express');
var path=require('path');
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const Port = 8000;
const app = express();
app.set('views', path.join(process.cwd() + '/views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(process.cwd() + '/public')));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const uri = "mongodb+srv://admin_user:eeoWSNyjemf0vSvC@cluster0.ryobh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const collection = client.db("test").collection("items");
//const counter = client.db('test').collection('counter');
client.connect(err =>{
    if(err){console.error(err); return;}
    console.log("Connected Successfully.")
    //client.db('test').createCollection("counter"); 
    /*counter.count(function (err, count) {
        if (!err && count === 0) {
            counter.insertOne( {_id: "item_id", sequence_value:0}, (err)=>{
                if (err) {
                    console.error(err)
                return;
                }
            });
        }
        else{
            counter.findOneAndUpdate({_id: 'item_id'}, {$set: {sequence_value:0}});
        }
    });*/
});
/*async function getNextSequence(sequenceName){
    counter.findOneAndUpdate(
        {_id: sequenceName}, {$inc:{sequence_value:1}}, {returnNewDocument: true, upsert : true}
        );
    let i = await counter.findOne({_id:sequenceName});
    let ic = i.sequence_value.toString();
    return ic;
};*/
app.get('/', (req, res)=>{
    res.redirect('/task');
})
app.get('/task',(req,res)=>{
    collection.find().toArray((err, items)=>{
        if (err) {
            console.error(err);
            res.status(500).json({ err: err });
            return;
        }
        res.status(200).render(__dirname + '\\index.ejs', {collection:items});
    });
});
app.post('/task',(req,res)=>{
    async function gen(){
        try{
            const item = req.body;
            collection.insertOne({
                id: await ObjectId().toString(),//getNextSequence('item_id'),
                description: item.description,
                isComplete: false
            })
            res.redirect('/task');
            console.log('Insertion completed');
        }catch(err){
            console.log(err);
            res.redirect('/task');
            return;
        }
    }
    gen();
});
//delete was't working since html doesn't support it, it only woked via postman, so I changed it to post.
//I chose this method over method override as it still works fine like this.
app.post('/task/:id',(req,res)=>{
    collection.deleteOne({id:req.params.id}, function(err, result) {
        if (err) throw err;
        console.log("1 document deleted");
        res.redirect('/task');
    });
});
app.get('/task/toogle', (req, res)=>{
    res.status(200).redirect('/task');
})
//put was't working since html doesn't support it, it only woked via postman, so I changed it to post.
app.post('/task/toggle/:id',(req,res)=>{
    collection.findOneAndUpdate({id:req.params.id, isComplete: true}, {$set: {"isComplete": false}});
    collection.findOneAndUpdate({id:req.params.id, isComplete: false}, {$set: {"isComplete": true}});
    res.redirect('/task');
});
app.listen(process.env.PORT || Port, () => {
    console.log(`Server Started at ${Port}`)
})
//Overall, the application is a bit slow, and sometimes it doesn't refresh properly meaning that one of the new entries may 
//not be displayed till it is refreshed manually by the user. Still, it works fine for most of the time.
//The biggest problem though was the isComplete field, it was really slow in execution, which led to results not being displayed
//properly after clicking on the button to change it. I tried to make an async function to make it so that I could use an
//if statement so that I may only need to use one query, but it became even worse so I changed it back to what it currently is.
//Another thing is that I tried to make an auto incremental id, but it had some bugs in case the connection was slow, 
//so I decided to use ObjectIds instead.
