# DTBSR
## Discord Twitch BSR Intergration!

### Why the hell was this made?
I actually made this so i can have my friends be able to send beat saber song requests without them complaining that they have to go to twitch. 

### How does this actually work?
It takes the one command that matters (/request) and sends a message in the twitch chat of YOUR CHOICE and sending the appropate !bsr command. Are there better ways to do this? Absolutly. Am I too lazy to actually do the hard thing to make it nicer? Also yes.

### How do I use this?
Install [Node.js](https://nodejs.org/en/download) 
Download the source code by clicking `Code` at the top and then clicking `Download Zip`  
Extract the folder and go into it  
Rename `template.env` to `.env` and then open it in a text editor, fill out all the credentials.  
- For the `token` and `clientId`, follow a bot creation guide for Discord and do the same things, make sure the bot is in the discord server of your choice.  
- `twitch_channel` and `twitch_nick` will just be your twitch username  
- For `twitch_oauth` go to [this site](https://antiscuff.com/oauth/), login with twitch and use that.  
- `Guild ID` is optional, but is really good for fast command deployment, find how to get the guild ID of your server to find it.  

Open the folder in a terminal and run `npm run deploy-commands` - the Discord bot should start. (Note that after running that for the first time, run `npm start` to start the bot.)  
- It may take upto and *hour* to get the commands running (*psst!! if you want to bypass it make sure to fill out the Guild ID and it'll be instant for that server only*)

Profit!!! Use `/request` to request a song, or run `/request bsr` if you have a specific BSR code.  





