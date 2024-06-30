import cheerio from "cheerio";
import fetch from "node-fetch";

export function isValidFacebookProfileLink(link) {
  // Basic check for Facebook profile link format
  const facebookRegex = /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._]+(\?[^#\s]*)?$/;
  return facebookRegex.test(link);
}
export async function getFacebookId(link) {
  const response = await fetch(link);
  const html = await response.text();
  const $ = cheerio.load(html);
  const profileIdElement = $("meta[property='al:android:url']").attr("content");

  if (profileIdElement) {
    const profileId = profileIdElement.split("/").pop();
    return profileId;
  } else {
    console.log("Can't Get ID");
    return null;
  }
}
