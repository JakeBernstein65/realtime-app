# Realtime Shopping List  
## Overview   
A realtime shopping list created with emphasis on Parse's backend and cloud code, and on Pubnub's Global Data Stream Network.
This application stores the shopping list on Parse's backend, and uses Parse **REST calls** to update the database. Pubnub's **publisher/subscriber model** is used to allow multiple people to subscribe to the same shopping list, and Parse's Cloud Code is used to update every user's local list after the database is updated. Pubnub's **Presence** feature makes it possible to use this realtime application offline and have updates passed on to Parse's backend on reconnection to your network.  

Make sure to update the Pubnub and Parse keys with the keys associated with your own Pubnub and Parse accounts, or this won't work. for you.


## Code Break Down  
### Local-Code  
This folder contains the local code for the application. This is the `HTML`, `CSS`, and `JS` that you keep on your computer.  

### Parse-Cloud-Code  
This is the code that you should place inside of the **Cloud** Folder of your Parse Application Folder  

i.e. `myParseapp/cloud/*`

## Side notes  

An object gets an `objectId` when it is added to Parse and created, but not before. For this reason, if you create an item while offline, you can not delete or edit that specifc item until you regain connection. ObjectIds are required for those actions and that item won't have an objectId yet. You can still preform all other actions while offline.  

You need to be disconnected from your network for at least twenty seconds for the application to recognize a **timeout** and that you are offline. This is based off of `heartbeat:` and `heartbeat_interval:` inside of `app.js`.  Change these values to changes the response time to your timeout.