import { StreamerClient, command, streamLivestreamVideo, VoiceUdp, streamOpts } from "@dank074/discord-video-stream";
import { launch, getStream } from 'puppeteer-stream';
import config from "./config.json";
import { Readable } from "stream";
import ytdl from 'ytdl-core';
import { executablePath } from 'puppeteer';
import { google } from "googleapis";


const client = new StreamerClient();

const youtubeApiKey = config.youtube_api_key; 

const youtube = google.youtube({ version: "v3", auth: youtubeApiKey });

streamOpts.bitrateKbps = config.streamOpts.bitrateKbps;
streamOpts.fps = config.streamOpts.fps;
streamOpts.hardware_encoding = config.streamOpts.hardware_acc;
streamOpts.height = config.streamOpts.height;
streamOpts.width = config.streamOpts.width;

// CLIENT READY EVENT
client.on("ready", () => {
    console.log(`--- ${client.user.tag} is ready ---`);
});

// MESSAGE EVENT
client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;



    if (!msg.content) return;

    // PLAY YOUTUBE/VIDEO FILE USING THE CAM
    if (msg.content.startsWith("$play")) {
        const userVoiceChannel = msg.member?.voice.channel;
        const name = msg.author.username;
        if (!userVoiceChannel) {
            await msg.channel.send("You are not in a voice channel");
            return;
        }

        console.log(`Attempting to join voice channel ${userVoiceChannel.guildId}/${userVoiceChannel.id}`);
        const vc = await client.joinVoice(userVoiceChannel.guildId, userVoiceChannel.id);

        client.signalVideo(userVoiceChannel.guildId, userVoiceChannel.id, true);
        const videoUrl = msg.content.replace("$play ", "");
        if (isYoutubeUrl(videoUrl)) {
            const youtubeUrl = await searchYoutubeVideo(videoUrl);
            await msg.channel.send("Playing now YouTube Video " + videoUrl + " by " + name);
            if((await playYoutubeVideo(youtubeUrl, vc)).includes("error")) {
                await msg.channel.send("Cannot play this video!");
            }
        } else if(videoUrl.includes("http") && !isYoutubeUrl(videoUrl)) {
            client.signalVideo(userVoiceChannel.guildId, userVoiceChannel.id, true);
            await msg.channel.send("Playing now " + videoUrl + " by " + name);
            playVideo(videoUrl, vc);
        } else {
            client.signalVideo(userVoiceChannel.guildId, userVoiceChannel.id, true);
            const youtubeUrl = await searchYoutubeVideo(videoUrl);
            await msg.channel.send("Playing now YouTube Video " + youtubeUrl + " by " + name);
            if((await playYoutubeVideo(youtubeUrl, vc)).includes("error")) {
                await msg.channel.send("Cannot play this video!");
            }
        }
        return;
    // SCREENSHARE YOUTUBE/VIDEO FILE    
    }  else if (msg.content.startsWith("$live")) {
        const userVoiceChannel = msg.member?.voice.channel;
        const name = msg.author.username;
        if (!userVoiceChannel) {
            await msg.channel.send("You are not in a voice channel");
            return;
        }

        console.log(`Attempting to join voice channel ${userVoiceChannel.guildId}/${userVoiceChannel.id}`);
        await client.joinVoice(userVoiceChannel.guildId, userVoiceChannel.id);
        
        const streamUdpConn = await client.createStream();

        const videoUrl = msg.content.replace("$live ", "");
        if (isYoutubeUrl(videoUrl)) {
            const youtubeUrl = await searchYoutubeVideo(videoUrl);
            await msg.channel.send("Playing now YouTube Video " + videoUrl + " by " + name);
            if((await playYoutubeVideo(youtubeUrl, streamUdpConn)).includes("error")) {
                await msg.channel.send("Cannot play this video!");
            }
        } else if(videoUrl.includes("http") && !isYoutubeUrl(videoUrl)) {
            client.signalVideo(userVoiceChannel.guildId, userVoiceChannel.id, true);
            await msg.channel.send("Playing now " + videoUrl + " by " + name);
            playVideo(videoUrl, streamUdpConn);
        } else {
            client.signalVideo(userVoiceChannel.guildId, userVoiceChannel.id, true);
            const youtubeUrl = await searchYoutubeVideo(videoUrl);
            await msg.channel.send("Playing now YouTube Video " + youtubeUrl + " by " + name);
            if((await playYoutubeVideo(youtubeUrl, streamUdpConn)).includes("error")) {
                await msg.channel.send("Cannot play this video!");
            }
        }
        return;
    // SCREENSHARE BROWSER
    } else if(msg.content.startsWith("$site")) {

        if (!config.acceptedAuthors.includes(msg.author.id)) {
            await msg.channel.send("This feature is currently not available!");
            return;
        } 

        const userVoiceChannel = msg.member?.voice.channel;
        if (!userVoiceChannel) {
            await msg.channel.send("You are not in a voice channel");
            return;
        }

        console.log(`Attempting to join voice channel ${userVoiceChannel.guildId}/${userVoiceChannel.id}`);
        await client.joinVoice(userVoiceChannel.guildId, userVoiceChannel.id);

        const streamUdpConn = await client.createStream();

        streamPuppeteer(msg.content.replace("$site ", ""), streamUdpConn);

        return;
    // DISCONNECT THE BOT    
    } else if (msg.content.startsWith("$leave")) {
        command?.kill("SIGINT");

        client.leaveVoice();
    //SHOWS ALL COMMANDS    
    } else if (msg.content.startsWith("$help")) {
        await msg.channel.send(">>> **Commands**\n\n- $play <ᴠɪᴅᴇᴏ ʟɪɴᴋ/ɴᴀᴍᴇ>\n- $live <ᴠɪᴅᴇᴏ ʟɪɴᴋ/ɴᴀᴍᴇ>\n- $site <ᴡᴇʙsɪᴛᴇ ʟɪɴᴋ>\n- $leave\n");
    }
});

// BOT LOGIN
client.login(config.token);

// PLAY ANY VIDEO USING A DIRECT LINK
async function playVideo(video: string, udpConn: VoiceUdp) {
    console.log("Started playing video");

    udpConn.voiceConnection.setSpeaking(true);
    udpConn.voiceConnection.setVideoStatus(true);
    try {
        const res = await streamLivestreamVideo(video, udpConn);

        console.log("Finished playing video " + res);
    } catch (e) {
        console.log(e);
    } finally {
        udpConn.voiceConnection.setSpeaking(false);
        udpConn.voiceConnection.setVideoStatus(false);
    }
    command?.kill("SIGINT");

    client.leaveVoice();
}

// SEARCH A YOUTUBE VIDEO USING THE YOUTUBE API
async function searchYoutubeVideo(query: string): Promise<string | null> {
    const response = await youtube.search.list({
      part: ["id"],
      q: query,
      type: ["video"],
    });
    if (response.status !== 200) {
      console.error("YouTube API returned non-200 status code:", response.status);
      return null;
    }
    if (response.data.items?.length === 0) {
      console.error("No videos found on YouTube for query:", query);
      return null;
    }
    return `https://www.youtube.com/watch?v=${response.data.items![0].id!.videoId}`;
  }

// OPEN LINK IN BROWSER FOR SCREENSHARE
async function streamPuppeteer(url: string, udpConn: VoiceUdp) {
    const browser = await launch({
        defaultViewport: {
            width: streamOpts.width,
            height: streamOpts.height,
        },
        executablePath: executablePath()
    });

    const page = await browser.newPage();
    await page.goto(url);

    // node typings are fucked, not sure why
    const stream: any = await getStream(page, { audio: true, video: true, mimeType: "video/webm;codecs=vp8,opus" }); 

    udpConn.voiceConnection.setSpeaking(true);
    udpConn.voiceConnection.setVideoStatus(true);
    try {
        // is there a way to distinguish audio from video chunks so we dont have to use ffmpeg ???
        const res = await streamLivestreamVideo((stream as Readable), udpConn);

        console.log("Finished playing video " + res);
    } catch (e) {
        console.log(e);
    } finally {
        udpConn.voiceConnection.setSpeaking(false);
        udpConn.voiceConnection.setVideoStatus(false);
    }
    command?.kill("SIGINT");

    client.leaveVoice();
}


// PLAY A YOUTUBE VIDEO
async function playYoutubeVideo(videoId: string, udpConn: VoiceUdp) {
    console.log(`Started playing YouTube video ${videoId}`);

    udpConn.voiceConnection.setSpeaking(true);
    udpConn.voiceConnection.setVideoStatus(true);

    try {
        const videoUrl = await ytdl.getInfo(videoId).then(info => {
            const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
            return format.url;
        });

        const res = await streamLivestreamVideo(videoUrl, udpConn);
        console.log("Finished playing video " + res);
    } catch (e) {
        return "error";
        console.log(e);
    } finally {
        udpConn.voiceConnection.setSpeaking(false);
        udpConn.voiceConnection.setVideoStatus(false);
    }

    command?.kill("SIGINT");
    client.leaveVoice();
}

function isTwitchUrl(url: string) {
    if(url.includes("twitch.tv")) {
        return true;
    } else {
        return false;
    }
}

function isYoutubeUrl(url: string) {
    return /^https?:\/\/(www\.)?youtube\.com\/watch\?v=/.test(url);
}

