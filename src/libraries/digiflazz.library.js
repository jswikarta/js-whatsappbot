import md5 from "md5";
import axios from "axios";
import "dotenv/config";

export async function DigiBalance() {
  try {
    const response = await axios.post(
      "https://api.digiflazz.com/v1/cek-saldo",
      {
        cmd: "deposit",
        username: process.env.DIGIUSER,
        sign: md5(process.env.DIGIUSER + process.env.DIGIKEY + "depo"),
      }
    );

    return response.data.data.deposit;
  } catch (err) {
    if (err.response) return err.response.data.data;
  }
}

export async function DigiProduct() {
  try {
    const response = await axios.post(
      "https://api.digiflazz.com/v1/price-list",
      {
        cmd: "prepaid",
        username: process.env.DIGIUSER,
        sign: md5(process.env.DIGIUSER + process.env.DIGIKEY + "pricelist"),
      }
    );

    return response.data.data;
  } catch (err) {
    if (err.response) return err.response.data.data;
  }
}

export async function DigiTransaction(trxRef, trxId, trxSku) {
  try {
    const response = await axios.post(
      "https://api.digiflazz.com/v1/transaction",
      {
        ref_id: trxRef,
        customer_no: trxId,
        buyer_sku_code: trxSku,
        username: process.env.DIGIUSER,
        sign: md5(process.env.DIGIUSER + process.env.DIGIKEY + trxRef),
      }
    );

    if (response.data.data.rc === "03") {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      return await DigiTransaction(trxRef, trxId, trxSku);
    } else {
      return response.data.data;
    }
  } catch (err) {
    if (err.response) return err.response.data.data;
  }
}
