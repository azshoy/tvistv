
const api_url = "http://0.0.0.0:5000";

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


