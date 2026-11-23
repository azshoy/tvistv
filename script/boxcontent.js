
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
          let author = ""
          if ((cont.created_by || cont.created_by !== "") && !(cont.text.startsWith("§"))) {
            author = "<div class='author'>~ " + cont.created_by + "</div>"
            if (cont.modified_by && cont.modified_by != "nobody" && cont.modified_by != cont.created_by){
              author = "<div class='author'>~ " + cont.modified_by + "</div>"
            }
          }
          if (cont.text.startsWith("§")){
            cont.text = cont.text.replace("§", "")
          }
          content.push({
            order: cont.order,
            elem: "<div class='" + cont.css_class + "'>" + header +  format_markdown(cont.text) + author + "</div>"
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
function format_markdown(txt){
  var md = ""
  var lines = txt.split("\n")
  var cf = []
  for (var i =0; i < lines.length; i++){
    var {line, header, quote, list} = get_line_format(lines[i])
    line = format_mentions(line)
    var {result, current_format} = get_format_chars(line, cf)
    cf = current_format
    if (header > 0){
      md += "<h"+ header.toString() + ">" + result + "</h" + header.toString() + ">"
    } else if (header < 0) {
      md += "<span class='sub"+ header.toString() + "'>" + result + "</span>"
    } else if (quote) {
      md += "<div class='quote'>" + result + "</div>"
    } else if (list > 0) {
      md += "<ul class='li" + list.toString() + "'><li>" + result + "</li></ul>"
    } else {
      md += result
      if (i < lines.length - 1){
        md += "<br/>"
      }
    }
  }
  if (cf.includes("code_block")) {
    md += "</div>"
  }
  console.log(md)
  return md
}

function format_mentions(line){
  var words = line.split(" ")
  for (let i = 0; i < words.length; i++){
    var w = words[i]
    var end = ""
    if (w.startsWith("@")){
      var {res, txt} = has_format_characters(w)
      if (res === false){
        if (txt.length !== w.length){
          end = w.slice(txt.length)
          w = txt
        }
        words[i] = "<span class='mention'>"+w+"</span>"+end
      }
    }
  }
  return words.join(" ")
}
function has_format_characters(s){
  var specials = ["```", "`", "**", "__", "_", "*", "||"]
  var found = false
  for (var c = 0; c < specials.length; c++){
    if (s.includes(specials[c])) {
      if (s.endsWith(specials[c])){
        var no_end = s.slice(0, -specials[c].length)
        if (!(no_end.includes(specials[c]))){
          return has_format_characters(no_end)
        }
      }
      found = true
    }
  }
  return {res: found, txt: s}

}
function get_line_format(line){
  var header = 0
  var list = 0
  var quote = false
  if (line.startsWith("### ")) {
    line = line.substring(4)
    header = 3
  } else if (line.startsWith("## ")) {
    line = line.substring(3)
    header = 2
  } else if (line.startsWith("# ")) {
    line = line.substring(2)
    header = 1
  } else if (line.startsWith("-# ")) {
    line = line.substring(3)
    header = -1
  } else if (line.startsWith("- ")) {
    line = line.substring(2)
    list = 1
  } else if (line.startsWith("  - ")) {
    line = line.substring(4)
    list = 2
  } else if (line.startsWith("    - ")) {
    line = line.substring(6)
    list = 3
  } else if (line.startsWith("> ")) {
    line = line.substring(2)
    quote = true
  }
  return {line, header, list, quote}
}
function get_format_chars(line, current_format){
  var result = get_line_start_format(current_format)
  var jump = 0
  for (let c = 0; c < line.length; c++){
    if (jump > 0){
      jump -= 1
      continue
    }
    var rest = line.substring(c)
    if (current_format.includes("code_block")){
      if (rest.startsWith("```")){
        result += "</div>"
        current_format = []
        jump = 2
      } else {
        result += line.substring(c, c+1)
      }
    } else {
      if (rest.startsWith("```")) {
        result += get_line_end_format(current_format)
        result += "<div class='code_block'>"
        current_format = ["code_block"]
        jump = 2
      } else if (rest.startsWith("`")) {
        if (current_format.includes("code")) {
          result += "</span>"
          current_format = removeItem(current_format, "code")
        } else {
          result += "<span class='code'>"
          current_format.push("code")
        }
      } else if (rest.startsWith("**")) {
        if (current_format.includes("bold")) {
          result += "</b>"
          current_format = removeItem(current_format, "bold")
        } else {
          result += "<b>"
          current_format.push("bold")
        }
        jump = 1
      } else if (rest.startsWith("__")) {
        if (current_format.includes("underline")) {
          result += "</span>"
          current_format = removeItem(current_format, "underline")
        } else {
          result += "<span class='underline'>"
          current_format.push("underline")
        }
        jump = 1
      } else if (rest.startsWith("||")) {
        if (current_format.includes("spoiler")) {
          result += "</span>"
          current_format = removeItem(current_format, "spoiler")
        } else {
          result += "<span class='spoiler'>"
          current_format.push("spoiler")
        }
        jump = 1
      } else if (rest.startsWith("*") || rest.startsWith("_")) {
        if (current_format.includes("italic")) {
          result += "</i>"
          current_format = removeItem(current_format, "italic")
        } else {
          result += "<i>"
          current_format.push("italic")
        }
      } else {
        result += line.substring(c, c + 1)
      }
    }
  }
  result += get_line_end_format(current_format)
  return {result, current_format}
}

function removeItem(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function get_line_start_format(current_format) {
  var formatElem = ""
  for (let f = 0; f < current_format.length; f++) {
    switch (current_format[f]) {
      case "bold":
        formatElem += "<b>"
        break
      case "italic":
        formatElem += "<i>"
        break
      case "spoiler":
        formatElem += "<span class='spoiler'>"
        break
      case "underline":
        formatElem += "<span class='underline'>"
        break
      case "code":
        formatElem += "<span class='code'>"
        break
    }
  }
  return formatElem
}

function get_line_end_format(current_format) {
  var formatElem = ""

  for (let f = current_format.length-1; f >= 0; f--){
    switch (current_format[f]){
      case "bold":
        formatElem += "</b>"
        break
      case "italic":
        formatElem += "</i>"
        break
      case "spoiler":
        formatElem += "</span>"
        break
      case "underline":
        formatElem += "</span>"
        break
      case "code":
        formatElem += "</span>"
        break
    }
  }
  return formatElem
}

function sorter(a,b){
  return a.order - b.order
}
get_box_contents()
