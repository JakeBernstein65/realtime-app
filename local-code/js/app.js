angular.module('firstApp', []) //take out angular.service and angular scripts in index.html if i don't use them

.controller('mainController', function($http, $q, $scope, PARSE_CREDENTIALS) {

// bind this to vm (view-model)
var vm = this;	
// define a basic variable
// define a list of items for our page (we are populating it with parse)
vm.shoppingList = [];

vm.user = {};
vm.user.requests = [];
vm.user.timeout = false; //for testing, turn this to true and disable if statement that changes timeout to false on reconnect
//initialize pubnub
var pubnub = PUBNUB.init({
          publish_key: 'pub-c-89b27d6c-7bad-4ad3-b766-fcb999f2585e',
          subscribe_key: 'sub-c-f6ccd478-1a84-11e5-a3cf-02ee2ddab7fe',
          //feel free to experiment with different heartbeats and heartbeat_intervals
          heartbeat: 20, //if a heartbeat is not received in this time period, the user will be considered timedout
          heartbeat_interval: 8 //a heartbeat is sent every 12 seconds or whatever the number is
        });

  vm.create = function(){
    if(vm.groceryList.name === undefined || vm.groceryList.name ===""){
     alert("Name must be filled out"); 
     return false;
    }

    if(vm.groceryList.price === undefined || vm.groceryList.price ===""){
     alert("Price must be filled out"); 
     return false;
    }

    if(vm.groceryList.quantity === undefined || vm.groceryList.quantity ===""){
     alert("Quantity must be filled out"); 
     return false;
    }

   var grocery = {
     "name": vm.groceryList.name,
     "price":vm.groceryList.price,
     "quantity":JSON.stringify(vm.groceryList.quantity), //have to stringify quantity since its a number and not a string
     "type": "push"
   }

   if (vm.user.timeout === true){
    //add to list of rest calls
    vm.user.requests.push(grocery);
    console.log(vm.user.requests);
    //add to pageview
    vm.shoppingList.push(grocery);    
   }

   else if(vm.user.timeout === false){
   return $http.post('https://api.parse.com/1/classes/Groceries',grocery,{
    headers:{
      'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
      'X-Parse-REST-API-Key': PARSE_CREDENTIALS.REST_API_KEY,
      'Content-Type':'application/json'
    }
   });    
  }
};

vm.delete = function(grocery){

  if(vm.user.timeout === true){
    var groc = {
     "name": grocery.name,
     "price": grocery.price,
     "quantity": grocery.quantity,
     "objectId": grocery.objectId,
     "type": "delete"
   }
   vm.user.requests.push(groc);
    for(var i = 0; i < vm.shoppingList.length; i++){
      if(vm.shoppingList[i].objectId === grocery.objectId){
          vm.shoppingList.splice(i, 1);  
        }
      }

  }

  else if(vm.user.timeout === false){
   return $http.delete('https://api.parse.com/1/classes/Groceries/' + grocery.objectId,{
    headers:{
      'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
      'X-Parse-REST-API-Key': PARSE_CREDENTIALS.REST_API_KEY,
      'Content-Type':'application/json'
    }
   }); 
  }     
};

vm.edit = function(grocery){
  //find what row the grocery is
  var row = 0;
  for(var i = 0; i<vm.shoppingList.length; i++){
    if(vm.shoppingList[i].objectId === grocery.objectId){
      row = i +1;
    }
  }

  // DOM manipulation
  var myTable = document.getElementById('myTable');
  myTable.rows[row].contentEditable="true";
  myTable.rows[row].cells[3].contentEditable="false";
  myTable.rows[row].style.backgroundColor="#FFFF7F";

  //hide buttons
  var editButton = document.getElementById('edit ' + grocery.objectId);
  var deleteButton = document.getElementById('delete ' + grocery.objectId);
  editButton.style.display = "none";
  deleteButton.style.display = "none";
  //show save button
  document.getElementById("save " + grocery.objectId).style.display = "inline";     
};

vm.editSave = function(grocery){
  //find what row the grocery is
  var row = 0;
  for(var i = 0; i<vm.shoppingList.length; i++){
    if(vm.shoppingList[i].objectId === grocery.objectId){
      row = i +1;
    }
  }
  
  // DOM manipulation back to normal view
  var myTable = document.getElementById('myTable');
  myTable.rows[row].contentEditable="false";
  myTable.rows[row].style.backgroundColor="";

   //show hidden buttons, hide save button
  var editButton = document.getElementById('edit ' + grocery.objectId);
  var deleteButton = document.getElementById('delete ' + grocery.objectId);
  editButton.style.display = "inline";
  deleteButton.style.display = "inline";
   //show save button
  document.getElementById("save " + grocery.objectId).style.display = "none";

    if(vm.user.timeout === true){
      var editedObj =  JSON.parse(JSON.stringify({
     "name":  myTable.rows[row].cells[0].innerText,
     "price": myTable.rows[row].cells[1].innerText,
     "quantity": myTable.rows[row].cells[2].innerText,
     "objectId": grocery.objectId,
     "type": "edit"
      })); 
 
      vm.user.requests.push(editedObj);
    }

    else if(vm.user.timeout === false){ 

      var editedObj = JSON.stringify({
     "name":  myTable.rows[row].cells[0].innerText,
     "price": myTable.rows[row].cells[1].innerText,
     "quantity": myTable.rows[row].cells[2].innerText,
     "objectId": grocery.objectId,
     "type": "edit"
      }); 

     return $http.put('https://api.parse.com/1/classes/Groceries/' + grocery.objectId, editedObj,{
    headers:{
      'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
      'X-Parse-REST-API-Key': PARSE_CREDENTIALS.REST_API_KEY,
      'Content-Type':'application/json'
    }
  });
     myTable.rows[row].style.display="none"; //makes old row disappear so new row can take its place
 }
}

     vm.getAll = function(){
      //retrieve database
      return $http.get('https://api.parse.com/1/classes/Groceries',{
        headers:{
          'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
          'X-Parse-REST-API-Key': PARSE_CREDENTIALS.REST_API_KEY
        }
      }).then(function(response) {
        if (typeof response.data === 'object') {
          var data = response.data;                 
                          //parse database
                           // Var to store result string:
                           var result = " ";

                        // We now step through all the returned records and add each to result string:
                        for(var i = 0; i < data.results.length; i++) {

                        //add each item to our shopping list
                        vm.shoppingList.push({
                          name: data.results[i].name,
                          price: data.results[i].price,
                          quantity: data.results[i].quantity,
                          objectId: data.results[i].objectId
                        });
                      }
                      
                    } else {
                          // invalid response
                          return $q.reject(response.data);
                        }
                      }, function(response) {
                      // something went wrong
                      return $q.reject(response.data);
                    });
};
  //have device subscribe to channel on load
 vm.subscribeToList = function(){
        pubnub.subscribe({
          channel: 'jakeb',
          presence: function(m){
            console.log(m);
        
            if(vm.user.timeout === true) //change action to join or timedin when using in real application
            {
              vm.getAll();
              console.log("objects to be added");
                console.log(vm.user.requests);
              //now send all the previously queued requests
              for(var i = 0; i < vm.user.requests.length; i++){
                console.log("vm.user.requests");
                console.log(vm.user.requests);
                console.log("i = " +i);

                console.log("applying rest request to following object");
                console.log(vm.user.requests[i]);
                var grocery = vm.user.requests[i];

                
                    if (grocery.type === "push"){
                    console.log("pushing right now...");
                     console.log(vm.user.requests[i]);
                         $http.post('https://api.parse.com/1/classes/Groceries',grocery,{
                          headers:{
                            'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                            'X-Parse-REST-API-Key': PARSE_CREDENTIALS.REST_API_KEY,
                            'Content-Type':'application/json'
                          }
                         });
                        
                        }

                 else if (grocery.type === "edit"){
                    console.log("editing right now...");
                    console.log(grocery);
                        var editedObj = JSON.stringify({
                       "name":  grocery.name,
                       "price": grocery.price,
                       "quantity": grocery.quantity,
                        }); 
                      

                        $http.put('https://api.parse.com/1/classes/Groceries/' + grocery.objectId, editedObj,{
                      headers:{
                        'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                        'X-Parse-REST-API-Key': PARSE_CREDENTIALS.REST_API_KEY,
                        'Content-Type':'application/json'
                        }
                      });  
                    }

                   else if (grocery.type === "delete"){
                    console.log("deleting right now...");
                    console.log(grocery);
                         $http.delete('https://api.parse.com/1/classes/Groceries/' + grocery.objectId,{
                          headers:{
                            'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                            'X-Parse-REST-API-Key': PARSE_CREDENTIALS.REST_API_KEY,
                            'Content-Type':'application/json'
                          }
                         }); 
                      }          
              }
                vm.user.requests = {};
            } 
          },
          message: function(m){
            //only add to list if we didn't add to list during timeout
            if(vm.user.timeout === false){
            //changes to list shown
            var contains = false;
            //if we sent a delete request
            if(m.name === "delete"){
            for(var i = 0; i < vm.shoppingList.length; i++){
              if(vm.shoppingList[i].objectId === m.objectId){
                console.log("pulling from list");
                contains = true;
                  if (i > -1) {
                    vm.shoppingList.splice(i, 1);
                    }
                  }
                }
              }
              //means that we are not deleting anything and mught be editing something
              else {
            for(var i = 0; i < vm.shoppingList.length; i++){
              if(vm.shoppingList[i].objectId === m.objectId){
                console.log("object was edited");
                contains = true;
                  if (i > -1) {
                    vm.shoppingList.splice(i, 1, m);
                    }
                  }
                }
              }
              //if we simply added something to list
              if (contains === false){
                console.log("pushing to list");
                vm.shoppingList.push(m);
              }
              $scope.$apply();
          }
              if(vm.user.requests.length === 0){
              vm.user.timeout = false;
            }
        },
        error : function(m){
          console.log("error occured timing out");
          vm.user.timeout = true;
        }
        });
 }
}).value('PARSE_CREDENTIALS',{
APP_ID: 'XXXXXXXXXXXXXXXXXXXXXXXXXXX',
REST_API_KEY:'YYYYYYYYYYYYYYYYYYYYYY',
MASTER_KEY: 'ZZZZZZZZZZZZZZZZZZZZZZZ'
});