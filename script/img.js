
async function get_random_image() {
  const result = await APIget("/random-image");
  if (result && result.url) {
    document.getElementById("img").innerHTML = "<img src='" + result.url + "' alt=\"xdd\">";
  }
}

get_random_image()
