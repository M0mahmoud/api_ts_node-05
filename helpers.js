export function isValidFacebookProfileLink(link) {
  // Basic check for Facebook profile link format
  const facebookRegex =
    /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._]+(\?[^#\s]*)?$/;
  return facebookRegex.test(link);
}
export async function getFacebookId(link) {
  const res = await fetch(
    "https://aloneperson.pythonanywhere.com/get_facebook_id",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: link,
        api_key: "IDFINDER_FJg1NtDfqNrrTEX4zznDEJDaBJU9hR",
      }),
    }
  );
  const data = await res.json();

  return data.facebook_id;
}
