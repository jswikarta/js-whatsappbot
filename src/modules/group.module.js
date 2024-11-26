import { getContentType } from "@whiskeysockets/baileys";
import {
  GetNote,
  GetConfig,
  Fnumber,
  UpdateBalance,
  UpdateGroup,
} from "../libraries/private.library.js";
import {
  DigiBalance,
  DigiProduct,
  DigiTransaction,
} from "../libraries/digiflazz.library.js";
import "dotenv/config";

export async function GroupModule(wbot, message) {
  const messageType = getContentType(message.message);
  const messageMssg = message.message;
  const messageText =
    messageType === "conversation"
      ? messageMssg.conversation
      : messageType === "imageMessage"
      ? messageMssg.imageMessage.caption
      : messageType === "videoMessage"
      ? messageMssg.videoMessage.caption
      : messageType === "extendedTextMessage"
      ? messageMssg.extendedTextMessage.text
      : "";

  const messageRjid = message.key.remoteJid;
  const messageFrom = message.key.participant;
  const messageHead = messageText.split(" ")[0].toLowerCase();
  const messageBody = messageText.split(" ").slice(1).join(" ");

  const botOwner = `${process.env.PHONE}@s.whatsapp.net`;
  const botPhone = wbot.user.id.split(":")[0] + "@s.whatsapp.net";
  const fromOwner = messageFrom === botOwner ? true : false;

  const group = await wbot.groupMetadata(messageRjid);
  const groupId = group.id;
  const groupName = group.subject;
  const groupUser = group.participants;

  const note = GetNote();
  const groupConf = GetConfig(groupId);
  const groupSign = groupConf?.groupSign;
  const groupProfit = groupConf?.groupProfit;
  const groupBalance = groupConf?.groupBalance;
  const groupPayment = groupConf?.groupPayment;
  const groupCategory = groupConf?.groupCategory;
  const groupProduct = groupConf?.groupProduct;

  const groupBalance2 = groupBalance?.filter((i) => i.phone === messageFrom);
  const userBalance = groupBalance2?.length ? groupBalance2[0].balance : 0;

  const botAdmin = !groupUser.filter(
    (i) => i.id === botPhone && i.admin !== null
  ).length
    ? false
    : true;

  const fromAdmin = !groupUser.filter(
    (i) => i.id === messageFrom && i.admin !== null
  ).length
    ? false
    : true;

  const groupAdmin = groupUser.filter(
    (i) => i.admin !== null && i.id !== botPhone
  );

  if (botAdmin)
    switch (messageHead) {
      case `h`:
      case `htag`:
      case `hidetag`:
        {
          if (!fromAdmin) break;
          await wbot.sendMessage(messageRjid, {
            text: messageBody,
            mentions: groupUser.map((i) => i.id),
          });
        }
        break;
      case `config`:
        {
          const configHead = messageBody.split(" ")[0];
          if (configHead === "group") await ReplyConfigGroup();
          else ReplyConfigOther();
        }
        break;
      case `info`:
        if (groupConf && !messageBody) await ReplyInfo();
        break;
      case `menu`:
        if (groupConf && !messageBody) await ReplyMenu();
        break;
      case `pay`:
      case `payment`:
        if (groupConf && !messageBody) await ReplyPay();
        break;
      case `depo`:
      case `deposit`:
        if (groupConf) await ReplyDepo();
        break;
      case `ok`:
      case `terima`:
        if (groupConf) await ReplyTerima();
        break;
      case `order`:
        if (groupConf) await ReplyOrder();
        break;
      default:
        if (groupConf && !messageBody) await ReplyCategory();
        if (groupConf && !messageBody) await ReplyProduct();
        break;
    }
  return messageText;

  /** -------------------------
   * FUNCTION REPLY INFO
  -------------------------- */
  async function ReplyInfo() {
    if (fromAdmin) {
      const digiBalance = await DigiBalance();
      if (digiBalance?.rc === "83")
        return await wbot.sendMessage(messageRjid, {
          text: note.notif4,
        });

      let totalBalance = 0;
      for (let balance of groupBalance) {
        totalBalance = totalBalance + balance.balance;
      }

      let messageSend =
        `*INFO ${groupName.toUpperCase()}*` +
        `\n•───────────────•\n` +
        `\n${groupSign} *Digi Balance :* ${Fnumber(digiBalance)}` +
        `\n${groupSign} *User Balance :* ${Fnumber(totalBalance)}` +
        `\n${groupSign} *Signature :* ${groupSign}` +
        `\n${groupSign} *Profit :* ${groupProfit}` +
        `\n•───────────────•\n` +
        `\n${groupSign} config sign` +
        `\n${groupSign} config digiuser` +
        `\n${groupSign} config digikey` +
        `\n${groupSign} config profit` +
        `\n${groupSign} config payment` +
        `\n${groupSign} config category` +
        `\n${groupSign} config product`;

      await wbot.sendMessage(messageFrom, { text: messageSend });
    }
  }

  /** -------------------------
   * FUNCTION REPLY MENU
  -------------------------- */
  async function ReplyMenu() {
    const userPhone = messageFrom.split("@")[0];

    let messageSend =
      `*MENU ${groupName.toUpperCase()}*\n` +
      `\n${groupSign} *👤 :* ${userPhone}` +
      `\n${groupSign} *💵 :* ${Fnumber(userBalance)}` +
      `\n•───────────────•\n` +
      `\n${groupSign} pay` +
      `\n${groupSign} depo`;

    for (let category of groupCategory) {
      messageSend += `\n${groupSign} ${category}`;
    }

    await wbot.sendMessage(messageRjid, {
      text: messageSend + note.bot1,
      mentions: [messageFrom],
    });
  }

  /** -------------------------
   * FUNCTION REPLY PAYMENT
  -------------------------- */
  async function ReplyPay() {
    let messageSend = `*METODE PEMBAYARAN*\n ${note.top1}`;
    for (let payment of groupPayment) {
      messageSend +=
        `\n\n*Payment ${payment.brand}*` +
        `\n${groupSign} Rekening : ${payment.rekening}` +
        `\n${groupSign} Atas Nama : ${payment.atasnama}`;
    }

    await wbot.sendMessage(messageRjid, {
      text: messageSend + note.bot2,
      mentions: [messageFrom],
    });
  }

  /** -------------------------
   * FUNCTION REPLY DEPOSIT
  -------------------------- */
  async function ReplyDepo() {
    if (messageType !== "imageMessage")
      await wbot.sendMessage(messageRjid, {
        text: note.notif2,
        mentions: [messageFrom],
      });
    else if (!messageBody || isNaN(messageBody))
      await wbot.sendMessage(messageRjid, {
        text: note.notif3,
        mentions: [messageFrom],
      });
    else {
      await wbot.sendMessage(messageRjid, {
        text: note.notif1,
        mentions: [messageFrom],
      });
    }
  }

  /** -------------------------
   * FUNCTION REPLY TERIMA
  -------------------------- */
  async function ReplyTerima() {
    if (!fromAdmin)
      return await wbot.sendMessage(messageRjid, {
        text: note.notif10,
        mentions: [messageFrom],
      });

    const dataTerima = messageMssg.extendedTextMessage.contextInfo;
    const textTerima = dataTerima.quotedMessage.imageMessage.caption;

    const phone = dataTerima.participant;
    const command = textTerima.split(" ")[0].toLowerCase();
    const balance = textTerima.split(" ")[1];

    if (command !== "depo" || command !== "deposit")
      return await wbot.sendMessage(messageRjid, {
        text: note.notif7,
        mentions: [messageFrom],
      });

    UpdateBalance(groupConf, phone, balance);
    const messageSend =
      `*PAYMENT SUCCESS*` +
      `\n•───────────────•\n` +
      `Berhasil Deposit sebesar ${Fnumber(balance)}`;

    await wbot.sendMessage(messageRjid, {
      text: messageSend,
      mentions: [phone],
    });
  }

  /** -------------------------
   * FUNCTION REPLY CATEGORY
  -------------------------- */
  async function ReplyCategory() {
    const category = groupCategory.filter((i) => i === messageHead)[0];

    if (category) {
      let messageSend = `*LIST ${category.toUpperCase()}*\n•───────────────•\n`;
      for (let product of groupProduct) {
        if (product.category === category)
          messageSend +=
            `\n${groupSign} *${product.code}* ` +
            `( _${product.brand.toLowerCase()}_ )`;
      }

      await wbot.sendMessage(messageRjid, {
        text: messageSend + note.bot1,
        mentions: [messageFrom],
      });
    }
  }

  /** -------------------------
   * FUNCTION REPLY PRODUCT
  -------------------------- */
  async function ReplyProduct() {
    const product = groupProduct.filter((i) => i.code === messageHead)[0];

    if (product) {
      const digiProduct = await DigiProduct();
      if (digiProduct?.rc === "83")
        return await wbot.sendMessage(messageRjid, {
          text: note.notif4,
          mentions: [messageFrom],
        });

      const digiProduct2 = digiProduct
        .filter((i) => i.brand.toLowerCase() === product.brand)
        .sort((i, j) => i.price - j.price);

      let productUmum = "";
      let productMember = "";
      for (let i of digiProduct2) {
        const productPrice = ProductPrice(groupProfit, product, i.price);

        if (i.type === "Umum" || i.type === "Customer")
          if (i.seller_product_status)
            productUmum +=
              `\n\n*${i.product_name}*` +
              `\n${groupSign} Harga : ${Fnumber(productPrice)}` +
              `\n${groupSign} Sku : ${i.buyer_sku_code}`;
          else
            productUmum +=
              `\n\n*~${i.product_name}~*` +
              `\n${groupSign} Harga : ${Fnumber(productPrice)}` +
              `\n${groupSign} Sku : ${i.buyer_sku_code}`;
        else if (i.type === "Membership")
          if (i.seller_product_status)
            productMember +=
              `\n\n*${i.product_name}*` +
              `\n${groupSign} Harga : ${Fnumber(productPrice)}` +
              `\n${groupSign} Sku : ${i.buyer_sku_code}`;
          else
            productMember +=
              `\n\n*~${i.product_name}~*` +
              `\n${groupSign} Harga : ${Fnumber(productPrice)}` +
              `\n${groupSign} Sku : ${i.buyer_sku_code}`;
      }

      let messageSend =
        `*MENU ${product.brand.toUpperCase()}*${note.top2}` +
        productUmum +
        productMember;

      await wbot.sendMessage(messageRjid, {
        text: messageSend,
        mentions: [messageFrom],
      });
    }
  }

  /** -------------------------
   * FUNCTION REPLY ORDER
  -------------------------- */
  async function ReplyOrder() {
    const trxFrom = messageFrom.split("@")[0];
    const trxSku = messageBody.split(" ")[0];
    const trxId = messageBody.split(" ")[1];
    const trxRef = TrxRef();

    if (!trxSku || !trxId)
      return await wbot.sendMessage(messageRjid, {
        text: note.format1,
        mentions: [messageFrom],
      });

    const digiProduct = await DigiProduct();
    if (digiProduct?.rc === "83")
      return await wbot.sendMessage(messageRjid, {
        text: note.notif4,
        mentions: [messageFrom],
      });

    const digiProduct2 = digiProduct.filter(
      (i) => i.buyer_sku_code === trxSku
    )[0];

    if (!digiProduct2)
      return await wbot.sendMessage(messageRjid, {
        text: note.notif5,
        mentions: [messageFrom],
      });

    const product = groupProduct.filter(
      (i) => i.brand === digiProduct2.brand.toLowerCase()
    )[0];

    const trxPrice = ProductPrice(groupProfit, product, digiProduct2.price);
    if (!fromAdmin)
      if (trxPrice > userBalance)
        return await wbot.sendMessage(messageRjid, {
          text: note.notif6,
          mentions: [messageFrom],
        });

    await wbot.sendMessage(messageRjid, {
      text:
        `*ORDER ${trxRef} PROCESS*` +
        `\n•───────────────•` +
        `\n_Pesanan anda sedang diproses, dan status akan terupdate otomatis._`,
      mentions: [messageFrom],
    });

    if (!fromAdmin) UpdateBalance(groupConf, messageFrom, trxPrice * -1);
    const trxResult = await DigiTransaction(trxRef, trxId, trxSku);

    let messageSend = "";
    if (trxResult?.rc === "00") {
      messageSend =
        `*ORDER ${trxRef} SUCCESS*` +
        `\n•───────────────•` +
        `\n${groupSign} *Id :* ${trxId}` +
        `\n${groupSign} *Sku :* ${trxSku}` +
        `\n${groupSign} *Harga :* ${Fnumber(trxPrice)}` +
        `\n•───────────────•` +
        `\n_Pesanan anda berhasil diproses, Terimakasih sudah order._`;

      if (
        product.category === "topupvoucher" ||
        product.category === "topuppln"
      ) {
        let messageUser =
          `*KODE VOUCHER ANDA*` +
          `\n•───────────────•` +
          `\n${groupSign} ${trxResult.sn}` +
          `\n•───────────────•` +
          `\n_Pesanan anda berhasil diproses, terimakasih sudah order._`;
        await wbot.sendMessage(messageFrom, { text: messageUser });
      }
    } else {
      messageSend =
        `*ORDER ${trxRef} FAILED*` +
        `\n•───────────────•` +
        `\n${groupSign} *Id :* ${trxId}` +
        `\n${groupSign} *Sku :* ${trxSku}` +
        `\n${groupSign} *Harga :* ${Fnumber(trxPrice)}` +
        `\n•───────────────•` +
        `\n_Pesanan anda gagal, mohon menunggu pengecekan dari admin._`;

      if (!fromAdmin) UpdateBalance(groupConf, messageFrom, trxPrice);
      for (let admin of groupAdmin) {
        await wbot.sendMessage(admin.id, {
          text: `ERROR ${trxRef}: ` + trxResult.message,
        });
      }
    }

    await wbot.sendMessage(messageRjid, {
      text: messageSend,
      mentions: [messageFrom],
    });
  }

  /** -------------------------
   * FUNCTION REPLY CONFIG GROUP
  -------------------------- */
  async function ReplyConfigGroup() {
    if (fromOwner) {
      if (groupConf)
        return await wbot.sendMessage(messageRjid, {
          text: note.notif8,
          mentions: [messageFrom],
        });

      UpdateGroup({
        groupId: groupId,
        groupSign: "❐",
        groupProfit: 1.5,
        groupBalance: [],
        groupPayment: [],
        groupCategory: [],
        groupProduct: [],
      });

      let messageSend = `*GROUP BERHASIL DIDAFTARKAN*` + note.bot3;
      await wbot.sendMessage(messageRjid, {
        text: messageSend,
        mentions: [messageFrom],
      });
    }
  }

  /** -------------------------
   * FUNCTION REPLY CONFIG OTHER
  -------------------------- */
  async function ReplyConfigOther() {
    if (!fromAdmin)
      return await wbot.sendMessage(messageRjid, {
        text: note.notif10,
        mentions: [messageFrom],
      });

    if (!groupConf)
      return await wbot.sendMessage(messageRjid, {
        text: note.notif8,
        mentions: [messageFrom],
      });

    const configHead = messageBody.split(" ")[0];
    const configBody = messageBody.split(" ")[1];

    if (!configBody)
      return await wbot.sendMessage(messageRjid, {
        text: note.format2,
        mentions: [messageFrom],
      });

    if (configHead === "sign") groupConf.groupSign = configBody;
    if (configHead === "profit") groupConf.groupSign = configBody;

    UpdateGroup(groupConf);
    let messageSend = `*GROUP BERHASIL DIUPDATE*` + note.bot3;
    await wbot.sendMessage(messageRjid, {
      text: messageSend,
      mentions: [messageFrom],
    });

    await wbot.sendMessage(messageRjid, {
      delete: message.key,
    });
  }
}

/** -------------------------
 * FUNCTION PRODUCT PRICE
-------------------------- */
function ProductPrice(groupProfit, product, price) {
  let profit;

  if (!product?.profit) profit = (groupProfit / 100) * price;
  else profit = product.profit;

  return Math.ceil(price + profit);
}

/** -------------------------
 * FUNCTION TRX REF
-------------------------- */
function TrxRef() {
  let date = new Date();
  let h = date.getHours();
  let i = date.getMinutes();
  let s = date.getSeconds();
  let d = date.getDate();
  let m = date.getMonth() + 1;
  let y = date.getFullYear();

  return "FGS" + y + m + d + Number(h + i + s);
}
