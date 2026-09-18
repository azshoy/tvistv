
const api_url = "https://xn--timisto-90a.fi/api";

async function APIget(path) {
  const response = await fetch(api_url + path, {
    method: "GET",
  })
  try {
    if (!response.ok) {
      console.error("viduiks män");
      return null
    }
    return await response.json();
  } catch (error) {
    console.error(error.message);
    return null
  }
}


