Parse.Cloud.afterSave("Groceries", function(request) {
  //Initializing PubNub
  var pubnub = require('cloud/pubnub.js')({
    ssl           : true,  // <- enable TLS Tunneling over TCP
    publish_key   : "pub-c-89b27d6c-7bad-4ad3-b766-fcb999f2585e",
    subscribe_key : "sub-c-f6ccd478-1a84-11e5-a3cf-02ee2ddab7fe"
});
      //Creating Object with the same information Parse used to create an item in its database
     var grocery = request.object.attributes;
     var grocObj = { "name" : grocery.name,
                     "price" : grocery.price,
                     "quantity": grocery.quantity,
                     "objectId": request.object.id
                   }

      //Using PubNub to pass that object to all subscribers as a message           
      pubnub.publish({ 
          channel   : 'jakeb',
          message   : grocObj,
          callback  : function(e) { console.log( "SUCCESS!", e ); },
          error     : function(e) { console.log( "FAILED! RETRY PUBLISH!", e ); }
      });

});

Parse.Cloud.afterDelete("Groceries", function(request) {
  //Initializing PubNub
  var pubnub = require('cloud/pubnub.js')({
    ssl           : true,  // <- enable TLS Tunneling over TCP
    publish_key   : "pub-c-89b27d6c-7bad-4ad3-b766-fcb999f2585e",
    subscribe_key : "sub-c-f6ccd478-1a84-11e5-a3cf-02ee2ddab7fe"
});
     //Declaring attributes of object that be deleted. Name = delete as a flag to let `app.js` know to delete this object
     var grocery = request.object.attributes;
     var grocObj = { "name" : "delete",
                     "price" : grocery.price,
                     "quantity": grocery.quantity,
                     "objectId": request.object.id
                   }
      //Using PubNub to pass that object to all subscribers as a message
      pubnub.publish({ 
          channel   : 'jakeb',
          message   : grocObj,
          callback  : function(e) { console.log( "SUCCESS!", e ); },
          error     : function(e) { console.log( "FAILED! RETRY PUBLISH!", e ); }
      });

});