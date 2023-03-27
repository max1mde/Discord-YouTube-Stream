# Discord-YouTube-Stream

## Fork of https://github.com/dank074/Discord-video-stream

### Features
 - Look at https://github.com/dank074/Discord-video-stream for all features
 
### Features I have implemented/changed:
 - Playing YouTube videos (Not every video works)

 - 1 Command argument instead of 2 because the bot joins now the voice channel in wich you are
  - EXAMPLE:
   - **NEW:**
      - $play <video name/link>
   - **OLD:**
      - $play-cam <direct video link> <voice channel name>
 
 - $help command
 - $leave instead of $disconnect, $live instead of $play-live and $site instead of $play-screen
 
 ![image](https://github.com/JavaDevMC/images/blob/main/Bild_2023-03-27_112031511.png?raw=true)
 
### Installation 
 
**Replace API key and token** 
 
 `StreamBot/src/config.json`:
```json
"token": "SELF BOT ACCOUNT TOKEN HERE",
"youtube_api_key": "YOUR YOUTUBE API KEY HERE",
"acceptedAuthors": ["USER_ID_HERE"],
```

**Install packages** 
 
```
npm install @dank074/discord-video-stream
npm install ytdl
npm install
npm install googleapis 
```
 
 
**Build and run bot** 
 
```
npm run build 
npm run start 
```

