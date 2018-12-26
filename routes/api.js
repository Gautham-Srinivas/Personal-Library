/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.MONGOLAB_URI;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
    //console.log(req)    
       MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) throw console.log('Database error: '+err);
          var collection = db.collection('books');
            collection.aggregate([{$match:{}},{$project:{_id:true,title:true, commentcount:{$size: "$comments"}}}]).toArray(function(err, result) {
             // console.log(result)
              if (err) throw console.log('Database read err: '+err);;
              res.json(result)
          });
    });  
     
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      var books = {
        title: title,
        comments: []
      }
         if(!title || title == ''){
            res.send('invalid title')
         }else{
          MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
            var collection = db.collection('books');
              collection.insertOne(books,function(err,doc){
                 if (err) throw console.log('Database insert err: '+err);
                //console.log(doc.ops[0])
              res.json(doc.ops[0]);
          });
        });
      }    
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
     MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) throw err;
          var collection = db.collection('books');
             collection.remove({}, function(err, result) {
              if (err) throw console.log('Database read err: '+err);
              res.send('complete delete successful');
          });
    });  
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
  //  console.log(req.params)
     MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
  //     console.log(db)
          if (err) throw console.log('Database read err: '+err);
          var collection = db.collection('books');
  //     console.log(collection)
             collection.findOne({_id:  ObjectId(bookid)}, function (err, result) {
           //  console.log(result)
              if (err) throw console.log('Database read err: '+err);
              if(result == null) res.send('no book exists'); else res.json(result);
          });
    });  
     
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
     try{
        bookid = ObjectId(bookid);
      } catch(err){
        return res.send('invalid _id');
      }
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) throw err;
          var collection = db.collection('books');
             collection.findOneAndUpdate({_id:  bookid},{ $push: { comments: comment }}, function(err, result) {
            //  console.log(result.value)
              if (err) throw console.log('Database read err: '+err);
              res.json(result.value)
          });
    });  
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
     try{
        bookid = ObjectId(bookid);
      } catch(err){
        return res.send('invalid _id');
      }
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) throw err;
          var collection = db.collection('books');
             collection.findOneAndDelete({_id:  bookid}, function(err, result) {
              if (err) throw console.log('Database read err: '+err);
              res.send('delete successful');
          });
    });  
      //if successful response will be 'delete successful'
    });
  
};
