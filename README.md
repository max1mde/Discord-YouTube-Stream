# Discord-YouTube-Stream

## Fork of https://github.com/dank074/Discord-video-stream

### Features
 - Look at https://github.com/dank074/Discord-video-stream for all features of the original bot
 
### Features I have implemented/changed:
 - Playing YouTube videos and livestreams (Not every video works)
 - 1 Command argument instead of 2 (because the bot joins now the voice channel in wich you are)
 
 **New commands**
 - $play <video-name/link>
 - $live <video-name/link>
 - $site <url (website)>
 - $leave
 - $help
 
 ![image](https://github.com/JavaDevMC/images/blob/main/Bild_2023-03-27_112031511.png?raw=true)
 
### Installation 
 
**Replace API key, bot token and acceptedAuthors ID** 
 
 `StreamBot/src/config.json`:
```json
"token": "SELF BOT ACCOUNT TOKEN HERE",
"youtube_api_key": "YOUR YOUTUBE API KEY HERE",
"acceptedAuthors": ["USER_ID_HERE"],
```

**Install packages** 
 
```
npm install -g typescript
npm install @dank074/discord-video-stream
npm install ytdl
npm install googleapis 
```
 
 
**Build and run bot** 
 
```
npm run build 
npm run start 
```

-----------------------------------------------------------------------------------------

**All features can be accessed by anyone!**
**Except the $site command wich can only be used by the config.acceptedAuthors users!**

To change that remove that code part from the index.ts file or move it wherever you want
```typescript
if (!config.acceptedAuthors.includes(msg.author.id)) {
  await msg.channel.send("This feature is currently not available!");
  return;
} 
```

-----------------------------------------------------------------------------------------

