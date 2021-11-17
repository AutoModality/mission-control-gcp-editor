 
export const shortenFileName = (fileName, maxLength) => {
  maxLength = maxLength || 16;

  var name = fileName.substring(0, fileName.lastIndexOf("."));
  var ext = fileName.substring(fileName.lastIndexOf("."));

  if(name.length <= maxLength) return fileName;
  else {
    var prefix = name.substring(0, 4);
    var postfix = name.substring(name.length-9);
    var newName = prefix + "..." + postfix;
    return newName + ext;
  }
}
