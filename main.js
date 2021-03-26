const http = require("http");
const fs = require("fs");
const AdmZip = require("adm-zip");

(async () => {
  //async init

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

  const deleteFile = (path, filename) => {
    const fullPath = `${path}/${filename}`;
    try{
      fs.unlinkSync(fullPath);
    }catch(e){
      console.log(`file ${fullPath} not found`);
    }
  };

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

  const getHtmlFromUrl = (url) => {
    return new Promise((resolve, reject) => {
        const http      = require('http'),
              https     = require('https');
        let client = http;
        if (url.toString().indexOf("https") === 0) {
            client = https;
        }
        client.get(url, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                resolve(data);
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
  };

  const unzipFile = (path) => {
    const zip = new AdmZip(path);
    var zipEntries = zip.getEntries();
    return zipEntries[0].getData().toString();
  };

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


  //kalender_en_uitslagen
  const kalenderFilename = Object.keys(data[0])[0]; //data[0] first entry
  const kalenderUrl = data[0][Object.keys(data[0])];
  deleteFile(".", `${kalenderFilename}.zip`);
  //3 . extract csv set as list
  const kalenderCsv = extractCsvStringToReadData(
    //2. unzip file
    unzipFile(
      //1. download file
      await downloadFile(`${kalenderFilename}.zip`, kalenderUrl)
      )
      );
  const kalender = kalenderCsv.filter(search=>search.HOME==="FC.Binkom");

  //standen
  const standenFilename = Object.keys(data[1])[0];
  const standenUrl = data[1][Object.keys(data[1])];
  deleteFile(".", `${standenFilename}.zip`);
  //3 . extract csv set as list
  const standenCsv = extractCsvStringToReadData(
    //2. unzip file
    unzipFile(
      //1. download file
      await downloadFile(`${standenFilename}.zip`, standenUrl)
      )
      );
  //console.log(standenCsv);
  const standen = standenCsv.filter(search=>search.TEAM==="FC.Binkom");
  console.log({
    kalender,
    standen
  });
  return {
    kalender,
    standen
  }
})();
