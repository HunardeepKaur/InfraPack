import CryptoJS from "crypto-js";

function hashKeyWithSHA256(key) {
  return CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(key));
}

export const decryptAES256 = (encryptedText, key) => {
  try {
    // First, hash the key using SHA-256
    const hashedKey = hashKeyWithSHA256(key);

    // Decode the Base64 string (encryptedText should be in Base64 format)
    const parsedData = CryptoJS.enc.Base64.parse(encryptedText);

    // Extract IV (first 16 bytes) and the encrypted data
    const iv = CryptoJS.lib.WordArray.create(parsedData.words.slice(0, 4), 16); // IV is 16 bytes (AES block size)
    const encrypted = CryptoJS.lib.WordArray.create(
      parsedData.words.slice(4),
      parsedData.sigBytes - 16
    );

    // Decrypt the data using the hashed key
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted },
      hashedKey,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    // Convert decrypted data to a UTF-8 string
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    // Return the decrypted result
    return decryptedText || "Error: Could not decrypt data";
  } catch (error) {
    console.error("Decryption error:", error.message);
    return "Error: Decryption failed";
  }
};

export const GetSessionTokenData = async () => {
  const _tokenData = await JSON.parse(localStorage.getItem("login"));
  return _tokenData;
};

export function convertIsoToDate(isoDateString) {
  // Convert ISO string to Date object
  const isoDate = new Date(isoDateString);

  // Extract the year, month, and date (month is zero-indexed)
  const year = isoDate.getUTCFullYear();
  const month = isoDate.getUTCMonth(); // Month is zero-indexed
  const date = isoDate.getUTCDate();

  // Return a new Date object in the desired format
  return new Date(year, month, date);
}

export function shouldReset(field) {
  // Your logic for determining whether to reset a field (for example, if the field is "year", return true)
  // This can be customized as needed based on the field
  const resetFields = ["year", "month", "day", "hour", "minute", "second"]; // Example of reset fields
  return resetFields.includes(field);
}

export function formatDateForPERTChartTask(date) {
  const newDate = new Date(
    date.getFullYear(),
    shouldReset("year") ? 0 : date.getMonth(),
    shouldReset("month") ? 1 : date.getDate(),
    shouldReset("day") ? 0 : date.getHours(),
    shouldReset("hour") ? 0 : date.getMinutes(),
    shouldReset("minute") ? 0 : date.getSeconds(),
    shouldReset("second") ? 0 : date.getMilliseconds()
  );

  return newDate;
}

export const hexToAscii = (hex) => {
  let ascii = "";
  for (let i = 0; i < hex.length; i += 2) {
    const hexByte = hex.substr(i, 2);
    const charCode = parseInt(hexByte, 16);
    if (!isNaN(charCode)) {
      ascii += String.fromCharCode(charCode);
    }
  }
  return ascii;
};
