import { config } from "dotenv";
import express from "express";
import { rateLimit } from "express-rate-limit";
import TelegramBot from "node-telegram-bot-api";
import Call from "./Call.Model.js";
import RecentSearch from "./RecentSearch.Model.js";
import User from "./User.Model.js";
import { getFacebookId, isValidFacebookProfileLink } from "./helpers.js";
import UserDB from "./user.js";

config();
const app = express();
app.use(express.json());

// Enable trust proxy

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 5 requests per window
});

app.use(limiter);

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const message = `Welcome\nTo generate your login code,\nplease click \/generatecode \ncontact us [Here](https://t.me/DataHunterpointsbot)`;
  bot.sendMessage(chatId, message, {
    parse_mode: "MarkdownV2",
  });
});

bot.onText(/\/generatecode/, async (msg) => {
  const chatId = msg.chat.id;
  const randomCode = Math.random().toString(36).substring(2, 12);

  try {
    await UserDB();
    let user = await User.findOne({ id: chatId });
    if (!user) {
      user = new User({ id: msg.from.id, code: randomCode });
      await user.save();
      bot.sendMessage(
        chatId,
        `Hello,\nYour registration code is: \`${randomCode}\` \nLogin Within In Our App`,
        {
          parse_mode: "MarkdownV2",
        }
      );
    } else {
      const oldCode = user.code;
      bot.sendMessage(
        chatId,
        `Hello,\nYour registration code is: \`${oldCode}\`\nLogin Within In Our App`,
        {
          parse_mode: "MarkdownV2",
        }
      );
    }
  } catch (error) {
    console.log("Error generating code:", error);
    bot.sendMessage(chatId, "An error occurred while generating the code.");
  }
});

bot.onText(/\/call/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    await UserDB();
    const isAdmin = await User.findOne({ id: chatId });
    if (!isAdmin) {
      bot.sendMessage(chatId, "User not found");
      return;
    }
    if (
      isAdmin.id !== process.env.ADMIN_05 &&
      isAdmin.id !== process.env.ADMIN_USF
    ) {
      bot.sendMessage(chatId, "Forbidden, Only Admins...");
      return;
    }

    await bot.sendMessage(
      chatId,
      "Plz,Send Code Of The User For Adding More Call Points...",
      {
        allow_sending_without_reply: false,
      }
    );

    bot.once("message", async (msg) => {
      const code = msg.text;
      const user = await Call.findOne({ code });
      if (!user) {
        return bot.sendMessage(chatId, "User not found!");
      }
      bot.sendMessage(chatId, "Enter Number Of Points!");

      bot.once("message", async (msg) => {
        const points = msg.text;
        user.points = Number(points);
        await user.save();
        return bot.sendMessage(
          chatId,
          `Done, ${user.code} has ${user.points} now`
        );
      });
    });
  } catch (error) {
    console.log("Error adding points:", error);
    bot.sendMessage(chatId, "Sorry, an error occurred while adding points!");
  }
});
bot.onText(/\/addpoints/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    await UserDB();

    const isAdmin = await User.findOne({ id: chatId });

    if (!isAdmin) {
      bot.sendMessage(chatId, "User not found");
      return;
    }

    if (
      isAdmin.id !== process.env.ADMIN_05 &&
      isAdmin.id !== process.env.ADMIN_USF
    ) {
      bot.sendMessage(chatId, "Forbidden, Only Admins...");
      return;
    }

    await bot.sendMessage(
      chatId,
      "Plz,Send Code Of The User For Adding More Points...",
      {
        allow_sending_without_reply: false,
      }
    );

    bot.once("message", async (msg) => {
      const code = msg.text;
      const user = await User.findOne({ code });
      if (!user) {
        return bot.sendMessage(chatId, "User not found!");
      }
      bot.sendMessage(chatId, "Enter Number Of Points!");

      bot.once("message", async (msg) => {
        const points = msg.text;
        user.points = Number(points);
        await user.save();
        return bot.sendMessage(
          chatId,
          `Done, ${user.code} has ${user.points} now`
        );
      });
    });
  } catch (error) {
    console.log("Error adding points:", error);
    bot.sendMessage(chatId, "Sorry, an error occurred while adding points!");
  }
});

bot.onText(/\/user/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    await UserDB();
    const isAdmin = await User.findOne({ id: chatId });
    if (!isAdmin) {
      bot.sendMessage(chatId, "User not found");
      return;
    }
    if (
      isAdmin.id !== process.env.ADMIN_05 &&
      isAdmin.id !== process.env.ADMIN_USF
    ) {
      bot.sendMessage(chatId, "Forbidden, Only Admins...");
      return;
    }

    await bot.sendMessage(chatId, "Plz,Send Code Or ID Of The User", {
      allow_sending_without_reply: false,
    });

    bot.once("message", async (msg) => {
      const code = msg.text;
      const user =
        (await User.findOne({ code })) || (await User.findOne({ id: code }));
      if (!user) {
        return bot.sendMessage(chatId, "User not found!");
      }

      const recent = await RecentSearch.findOne({ code: user.code });
      let urls;
      if (recent) {
        urls = recent.key.join("\n");
      }
      // Construct the message
      const message = `
    id: ${user.id}
    code: ${user.code}
    points: ${user.points}\n
    Recent Search:
    ${urls}
    `;
      const MAX_MESSAGE_LENGTH = 4096;
      const messageChunks = [];
      for (let i = 0; i < message.length; i += MAX_MESSAGE_LENGTH) {
        messageChunks.push(message.substring(i, i + MAX_MESSAGE_LENGTH));
      }
      // Send each chunk separately
      for (const chunk of messageChunks) {
        await bot.sendMessage(chatId, chunk, { parse_mode: "HTML" });
      }
    });
  } catch (error) {
    console.log("Error", error);
    bot.sendMessage(chatId, "Sorry,While Searching For User!");
  }
});

bot.onText(/\/details/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    await UserDB();
    const isAdmin = await User.findOne({ id: chatId });
    if (!isAdmin) {
      bot.sendMessage(chatId, "User not found");
      return;
    }
    if (
      isAdmin.id !== process.env.ADMIN_05 &&
      isAdmin.id !== process.env.ADMIN_USF
    ) {
      bot.sendMessage(chatId, "Forbidden, Only Admins...");
      return;
    }

    const allUsers = await User.find({});
    const allCalls = await Call.find({});
    const allRecentSearchs = await RecentSearch.find({});
    const totalUsers = allUsers.length;
    const totalallCalls = allCalls.length;
    const totalallRecentSearchs = allRecentSearchs.length;

    let totalPoints = 10 * totalUsers; // Total points initially set to default points

    allUsers.forEach((user) => {
      totalPoints += user.points - 10; // Subtracting default points and adding user's points
    });

    const averagePoints = totalPoints / totalUsers;

    return bot.sendMessage(
      chatId,
      `<b><i>User Details</i></b>\n<b>Total Users:</b> ${totalUsers}\n<b>Average Points:</b> ${averagePoints.toFixed(
        2
      )}\n<b>Total Calls:</b> ${totalallCalls}\n<b>Total RecentSearchs:</b> ${totalallRecentSearchs}`,
      {
        parse_mode: "HTML",
      }
    );
  } catch (error) {
    console.log("Error", error);
    bot.sendMessage(chatId, "Sorry,While Searching For User!");
  }
});

bot.onText(/\/sendmsg/, async (msg) => {
  const chatId = msg.chat.id;
  let successCount = 0;
  let failCount = 0;
  try {
    await UserDB();

    const isAdmin = await User.findOne({ id: chatId });

    if (!isAdmin) {
      bot.sendMessage(chatId, "User not found");
      return;
    }

    if (
      isAdmin.id !== process.env.ADMIN_05 &&
      isAdmin.id !== process.env.ADMIN_USF
    ) {
      bot.sendMessage(chatId, "Forbidden, Only Admins...");
      return;
    }
    await bot.sendMessage(chatId, "Enter Msg For Users", {
      allow_sending_without_reply: false,
    });

    bot.once("message", async (msg) => {
      const messageToSend = msg.text;
      const allUsers = await User.find({});

      for (const [_index, user] of allUsers.entries()) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 seconds between each message
        await bot
          .sendMessage(user.id, messageToSend)
          .then(() => {
            bot.sendMessage(chatId, `Successfully ${user.id}`);
            successCount++;
          })
          .catch((error) => {
            failCount++;
            if (
              error.response &&
              error.response.body &&
              error.response.body.description &&
              error.response.body.description.includes("blocked")
            ) {
              bot.sendMessage(
                chatId,
                `Failed ${user.id}\nThey have blocked the bot.`
              );
            } else {
              bot.sendMessage(chatId, `Failed ${user.id}\nchat not found`);
            }
          });
      }

      const totalCount = allUsers.length;
      bot.sendMessage(
        chatId,
        `Message sent to all users.\nTotal: ${totalCount}\nSuccess: ${successCount}\nFailed: ${failCount}`
      );
    });
  } catch (error) {
    console.log("Error adding points:", error);
    bot.sendMessage(chatId, "Sorry, while sending the message to all users.");
  }
});

bot.onText(/\/facebookid/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    bot.sendMessage(chatId, `ارسل رابط حساب الفيس بوك`);
    bot.once("message", async (msg) => {
      const link = msg.text;

      if (!isValidFacebookProfileLink(link)) {
        return bot.sendMessage(
          chatId,
          "تأكد من إرسال رابط حساب الفيس بوك بشكل صحيح"
        );
      }

      try {
        const data = await getFacebookId(link);
        console.log("data:", data);
        await bot.sendMessage(chatId, `\`${data}\``, {
          parse_mode: "MarkdownV2",
        });
      } catch (error) {
        console.error("Error fetching Facebook ID:", error);
        await bot.sendMessage(chatId, "حدث خطأ، حاول مجدداً");
      }
    });
  } catch (error) {
    bot.sendMessage(chatId, "Error");
  }
});

app.get("/", (_req, res) => {
  res.json({ msg: "Run" });
});
// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, (_req) => {
  console.log(`Server is running on port ${PORT}`);
});
