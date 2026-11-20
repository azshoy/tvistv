
async function get_random_image() {
  document.getElementById("img").style.transform = "rotate(" + (Math.random()*6 - 3).toFixed(1) + "deg)"
  const result = await APIget("/random-image");
  if (result && result.url) {
    var fileserver = api_url.replace("/api", "/")
    var url = result.url.replace("../../files/", fileserver)
    document.getElementById("img").innerHTML = "<img src='" + url + "' alt=\"xdd\">";
  }
}

get_random_image()
