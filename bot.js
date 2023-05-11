const { Client } = require(".");
const bot = new Client();
const fs = require("fs");
const admin = require("./src/util/firebaseadmin");
const LineType = require("./src/util/typeline");
const bodyParser = require('body-parser')
const express = require("express");
const cors = require("cors");
const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
//const firestore = admin.firestore();
const database = admin.database();

let jsonData = require("./json/token.json");

Array.prototype.randomSite = function () {
  return this[Math.floor(Math.random() * this.length)];
};

bot.on("ready", async () => {
  const botuserid = `${bot.user.id}`;
  const refGroupData = database.ref(botuserid);
  let groups = await bot.groups.fetch();
  await groups.map((group) => {
    const GroupDataRef = refGroupData.child(group.id);
    GroupDataRef.set({
      id: group.id,
      type: group.type,
      picturePath: group.picturePath,
      name: group.name,
      createdTime: group.createdTime,
      groupExtra: group.extra,
      groupExtracreator: group.extra.groupExtra.creator,
      memberMids: group.extra.groupExtra.memberMids,
      inviteeMids: group.extra.groupExtra.inviteeMids,
    });
  });
  console.log("GroupData SAVE-DATA");
});

bot.on("message", async (message) => {
  if (message.author.id == bot.user.id) return;
  if (message.content == "ping") {
    await message.channel.send("pong");
  } 
  // else if (message.content == "@@") {
  //   let group = bot.groups.cache.find((g) => g.name.match(/LINE/));
  //   await group.members.fetch();
  //   let members = group.members.cache.map((member) => {
  //     let user = bot.users.cache.get(member.user.id);
  //     try {
  //       user.send(`READY ${user}`);
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   });
  // } else if (message.content == "@") {
  //   console.log(message);
  // }
});
bot.on("message_read", (message, user) => {
  console.log(`${user.displayName} READ ${message.id} ${message.content}`);
});
bot.on("chat_invite", (group, inviter) => {
  group.accept();
  console.log(
    `group ${group.name}(${group.id}) invite by ${inviter.displayName}`
  );
});
bot.on("chat_join", (channel) => {
  channel.send("Chat Joined");
});
bot.on("raw", (op, data) => {
  if (op == "RECEIVE_MESSAGE") {
    const msgR = {
      type: data?.type,
      param1: data?.param1,
      param2: data?.param2,
      param3: data?.param3,
      message_toType: data?.message?.toType,
      message_id: data?.message?.id,
      message_text: data?.message?.text,
      message_location: data?.message?.location,
      message_contentType: data?.message?.contentType,
      message_contentMetadata: data?.message?.contentMetadata,
      message_sessionId: data?.message?.sessionId,
      from: data?.message?._from,
      to: data?.message?.to,
    };
    //console.log(op, msgR);
  }
});
bot.login(jsonData.accessToken);

const PORT = process.env.PORT || 5430;
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

app.get("/usertag/:idx", async (req, res) => {
  const { idx } = req.params;
  if (jsonData.accessToken) {
  bot.on('ready',()=>{
        console.log(`logged as ${bot.user.displayName} ${bot.user.id}`)
        //mention with user object
        let user = bot.users.cache.get(idx)
        user.send(`hello ${user}`)
    })
    bot.login(jsonData.accessToken)
    res?.status(200).json({ msg: "TAGUSER!" });
  }
});

app.get("/group/:idx", async (req, res) => {
  const { idx } = req.params;
  if (jsonData.accessToken) {
    bot.login(jsonData.accessToken);
    bot.on("ready", async () => {
      let group = bot.groups.cache.find((g) => g.id.match(idx));
      await group.members.fetch();
      let membersingroup = group.members.cache.map((member) => {
        console.log(member.user)
        return {
          userid: member.user.id,
          typeUser: member.user.type,
          relation: member.user.relation,
          displayDataUser: member.user.displayName,
          createdTime: member.user.createdTime,
          pictureStatus: member.user.pictureStatus,
          statusMessage: member.user.statusMessage,
          picturePath: member.user.picturePath,
        };
      });
      
      res?.status(200).json({
        botX: "member in group as " + group.name,
        membersIDX: membersingroup,
      });
    });
  }
});

app.post("/groupkonce", async (req, res) => {
  let dataFirstKick = req.body;
  if (jsonData.accessToken) {
    await bot.login(jsonData.accessToken);
    let group = bot.groups.cache.find((g) => g.id.match(dataFirstKick.gid));
    await group.members.fetch();
    const resCheck = group.members.cache.filter((member) =>
    dataFirstKick.ck.includes(member.user.id)
    );
    let members = resCheck.map((member) => {
     // return member.kick();
    });
    //res?.status(200).json({ memberX: resCheck });
    console.log(dataFirstKick)
    res?.status(200).json(dataFirstKick)
  }
});

app.post("/groupkall", async (req, res) => {
  let dataAllKick = req.body;
  if (jsonData.accessToken) {
    await bot.login(jsonData.accessToken);
    let group = bot.groups.cache.find((g) => g.id.match(dataAllKick.gid));
    await group.members.fetch();
    const resCheck = group.members.cache.filter(
      (member) => !TeamX.includes(member.user.id)
    );
    let members = resCheck.map((member) => {
      //return member.kick();
    });
    res?.status(200).json(resCheck);
  }
});

app.post("/groupkuser", async (req, res) => {
  let dataUserKick = req.body;
  if (jsonData.accessToken) {
    await bot.login(jsonData.accessToken);
    let group = bot.groups.cache.find((g) => g.id.match(dataUserKick.gid));
    await group.members.fetch();
    
    const resCheck = group.members.cache.filter((member) =>
      dataUserKick.uid.includes(member.user.id)
    );
    let members = resCheck.map((member) => {
      //return member.kick();
    });
    res?.status(200).json(dataUserKick);
  }
});

app.listen(PORT, () => console.log(`Serverr is listening on ${PORT}`));
