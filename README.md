# Complete architecture of the Chat app

*The backend of this app has been developed using express and the frontend is designed using HTML , CSS and JS only. SQL databse has been used.*

## DataBase structure

The database contains total three table -> **logins, contacts, chats**

- **logins** : Itcontains the login information about different users. It has three columns -> *id, username and email*
- **contacts** : It contains a link between two users who had a chat previously. It has three columns -> *id, user1 and user2*. Mutual relationship will be handled in the query on the database.
- **chats** : It constains all the chats between users. It has four columns -> *id, sender, receiver and txt*

## Backend structure

**APIs available** :

- *"/pushData"*(POST) ->  Using this we push data into the database as soon as some user send message to other user. A sample body to be passed in application/json format --
    // SAMPLE BODY
    // {
    //     "txt":"Hey what's up",
    //     "sender":"userName1",
    //      "receiver":"userName2"
    // }
- *"/getData"*(GET) -> Using this we get chats from the last to a certain number of chats. Three query parameters to be passed -- sender, receiver, items. We get a json back containing sender, receiver and txt.
- *"/loadData"*(GET) -> This API is used for lazy loading it is similar to the /getData API. Only difference is that here we have to pass an extra parameter called index which index which indicate from which id the messages are to be extracted. Every time we can check the lenght of the array json returned if it is less than the limit(items) we entered the it indicated that we have reached to the top of the chat.
- *"/newMessage"*(GET) -> It checks for new messages it is used for making the app realtime (ofcourse why not chat apps are real time !). Parameters to be passed are -- sender, rceiver and index. Index indicates that upto what id the messages are displayed.
- *"/getContacts"* -> It checks for contact of a user from the contacs table then it should be used by the frontend to populate the constacts sidebar of the app.
- *"/login"* ->
- *"/verify"* ->

*All APIs are not yet documented.*

## Frontend Sructure

- The frontend gets the username from the backend.
- Few major variables are initialized ->
  - username (the value of which is determined by the backend)
  - p_i (it is the present index of message of the present receiver)
  - f_i (it is the topmost index of message of the current receiver this is used for lazy loading)
  - contacts (array contains all the contacts of the current user)
- Then the first thing which happens is the loading of the contacts by the getContacts() function amd also make an object of all the contacts named contacts_l.
- After that when a user clicks on any one of its contact the changeReceiver() function gets called and the receiver variable is set to the receiver the user clicked on. Then the chat box is emptied(already empty if this is for the first time) and then particular number of chats are loaded. The id of the chat loaded at the end is passed to the variable p_i and the id of the chat at the beginnning is passed to the f_i variable.
**Approach for realtime data fetchig**
- A function called checkNewMessage runs at a definite interval in two forms -
  - First one is for all the contacs except the receiver(50ms)
  - Second is for the receiver(1s)
- The pushData() function is executed when send button is pressed which pushes the message to the database and also runs the checkNewMessages() functions to load that message to the chatBox and also update the p_i.
**Approach for lazy loading**

IN progress....
