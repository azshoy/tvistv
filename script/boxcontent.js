
async function get_box_contents() {
  const result = await APIget("/content");
  if (result) {
    const content = []
    if (result.text){
      for (let i = 0; i < result.text.length; i++){
        const cont = result.text[i]
        if (cont.box === "bulletin_board"){
          let header = ""
          if (cont.header !== ""){
            header = "<div class='header'>" + cont.header + "</div>"
          }
          content.push({
            order: cont.order,
            elem: "<div class='" + cont.css_class + "'>" + header +  cont.text + "</div>"
          })
        }
      }
    }
    content.sort(sorter)
    let html = ""
    for (let c = 0; c < content.length; c++){
      html += content[c].elem
    }
    document.getElementById("bboard").innerHTML = html
  }
}
function sorter(a,b){
  return a.order - b.order
}
get_box_contents()
