//Dependencies
const http = require("http"); //for making request
const fs = require("fs"); //for using the file system
const AdmZip = require("adm-zip"); //for unzipping

(async () => {

  /********** FUNCTIONS ***********/
  const data = [
    {
      kalender_en_uitslagen:
        "http://static.belgianfootball.be/project/publiek/download/braresdownP.zip",
    },
    {
      standen:
        "http://static.belgianfootball.be/project/publiek/download/bracltdownP.zip",
    },
  ];

  //Deletes the file with the given filename on the given path
  const deleteFile = (path, filename) => {
    const fullPath = `${path}/${filename}`;
    try{
      fs.unlinkSync(fullPath);
    }catch(e){
      console.log(`file ${fullPath} not found`);
    }
  };

  // Promises to download a file from the given url, and saving it as the givenfilename.
  // returns the filename where it was saved
  const downloadFile = (filename, url) => {
    return new Promise((resolve, reject) => {
      const savedAs = `${filename}`;
      const request = http.get(url, (response) => {
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(savedAs);
          response.pipe(file);
          file.on("finish", async (cv) => {
            resolve(savedAs);
          });
        } else {
          reject(`Gave status code ${response.statusCode}`);
        }
      });
    });
  };

  //Reads the first file in the zip file
  //returns the value as string
  const unzipFile = (path) => {
    const zip = new AdmZip(path);
    var zipEntries = zip.getEntries();
    return zipEntries[0].getData().toString();
  };

  //reads the csv file as string given as parameter
  //converts the csv file into a list and returns that list.
  const extractCsvStringToReadData = (raw) => {
    const list = raw.split("\n");
    let detailedList = [];
    const headers = list[0].split(";");
    list.splice(0, 1);
    list.forEach((entry) => {
      const rawDetails = entry.split(";");
      let jsonDetails = {};
      headers.forEach((head, index) => {
        jsonDetails[head] = (rawDetails[index]===undefined)?"":rawDetails[index].trim();
      });
      detailedList.push(jsonDetails);
    });
    return detailedList;
  };

  /************ MAIN ***************/

  //kalender_en_uitslagen
  const kalenderFilename = Object.keys(data[0])[0]; //data[0] first entry
  const kalenderUrl = data[0][Object.keys(data[0])];

  //3 . extract csv set as list
  const kalenderCsv = extractCsvStringToReadData(
    //2. unzip file
    unzipFile(
      //1. download file
      await downloadFile(`${kalenderFilename}.zip`, kalenderUrl)
      )
      );
  const kalender = kalenderCsv.filter(search=>search.HOME==="FC.Binkom");
  deleteFile(".",`${kalenderFilename}.json`)
  fs.writeFile(`${kalenderFilename}.json`, JSON.stringify(kalender, null, 2), function (err) {
    if (err) {
      return console.log(err);
    }
  })
  deleteFile(".",`${kalenderFilename}.zip`);
  //standen
  const standenFilename = Object.keys(data[1])[0];
  const standenUrl = data[1][Object.keys(data[1])];
  //3 . extract csv set as list
  const standenCsv = extractCsvStringToReadData(
    //2. unzip file
    unzipFile(
      //1. download file
      await downloadFile(`${standenFilename}.zip`, standenUrl)
      )
      );

  const standenVanFCBinkom = standenCsv.filter(s=>s.TEAM === "FC.Binkom");
  const standen = standenCsv.filter(s=>{
    let foundCorrectDIV = false;
    for(stand of standenVanFCBinkom){
      if(stand.DIV===s.DIV){
        foundCorrectDIV = true;
      }
    }
    return foundCorrectDIV;
  })
  deleteFile(".",`${standenFilename}.json`)
  fs.writeFile(`${standenFilename}.json`, JSON.stringify(standen, null, 2), function (err) {
    if (err) {
      return console.log(err);
    }
  });
  deleteFile(".",`${standenFilename}.zip`)
  return {
    kalender,
    standen
  }
})();
