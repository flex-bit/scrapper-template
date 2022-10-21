const puppeteer = require("puppeteer");
const fs = require("fs-extra");

let base = "https://www.superiordentist.com/"; //url

let awesoem = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--start-fullscreen"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(base + "/sitemap.xml", {
    waitUntil: "networkidle2",
  });
  await page.waitForSelector(".folder"); // class that need to load before the script runs
  let services = await page.evaluate(() => {
    let xml = [];
    let temp = {
      path: "",
      targetPath: "",
    };
    let items = document.querySelectorAll(".folder");

    for (let i = 0; i < items.length; i++) {
      if (i > 1) {
        temp.path = items[
          i
        ].children[1].children[0].children[1].innerHTML.replace(
          "https://www.superiordentist.com/",
          ""
        );
        xml.push(temp);
        temp = {
          path: "",
          targetPath: "",
        };
      }
    }
    return xml;
  });
  browser.close();
  return services;
};
// awesoem();

// RUN THIS SECOND FUNCTION WHE WE KNOW THAT THE SCRIPT IS SUCCESSFUL

awesoem().then((file) => {
  // convert JSON object to a string
  const data = JSON.stringify(file);

  // write file to disk
  //CHANGE FILE NAME
  fs.writeFile("./xmlseacher-version2.json", data, "utf8", (err) => {
    if (err) {
      console.log(`Error writing file: ${err}`);
    } else {
      console.log(`File is written successfully!`);
    }
  });
});
