const puppeteer = require("puppeteer");
const fs = require("fs-extra");
var player = require("play-sound")((opts = {}));

let base = "https://www.drsirin.com/blog";

let awesoem = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--start-fullscreen"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto("https://www.drsirin.com/blog", {
    waitUntil: "networkidle2",
  });

  await page.waitForSelector("#archives-3");
  let { blogLink } = await page.evaluate(() => {
    let items =
      document.querySelector("#archives-3").children[0].children[1].children;

    let blogLink = [];

    for (let i = 0; i < items.length; i++) {
      blogLink.push(items[i].children[0].getAttribute("href"));
    }
    return { blogLink };
  });
  // let links = []
  let completeLinks = [];
  for (let i = 0; i < blogLink.length; i++) {
    await page.goto(blogLink[i], {
      waitUntil: "networkidle2",
    });
    await page.waitForSelector("article");
    let { links } = await page.evaluate(() => {
      let links = [];
      let items = document.querySelectorAll("article");
      for (let i = 0; i < items.length; i++) {
        links.push(
          items[i].children[0].children[0].children[0].getAttribute("href")
        );
      }
      return { links };
    });

    completeLinks = completeLinks.concat(links);
  }
  // console.log(completeLinks);
  let info = [];
  // let threeOrFours = [];
  for (let k = 0; k < completeLinks.length; k++) {
    // let noname = {
    //   old: "",
    //   new: "",
    // };
    // noname.old = completeLinks[k].replace("https://www.drsirin.com", "");
    // threeOrFours.push(noname);
    /*                               CONTENT SCRAPPER */
    await page.goto(completeLinks[k], {
      waitUntil: "networkidle2",
    });
    await page.waitForSelector("article");
    let { infobox } = await page.evaluate(() => {
      let title =
        document.querySelector("article").children[0].children[0].innerText;
      let datepublished =
        document.querySelector("article").children[0].children[1].innerText;
      let content1 = document
        .querySelector("article")
        .children[1].innerHTML.replace(
          /src="(\/)/gm,
          'src="https://www.drsirin.com/'
        );
      let content2 = content1.replace(/alt=".*logo.*">/gm, 'alt=""');
      let content3 = content2.replace(/src=".*.gif"/gm, 'src=""');
      let content4 = content3.replace(/<noscript>.*<\/noscript>/gm, "");
      let content5 = content4.replace(/img .* src="data.*?">.*?>/gm, "");
      let content = content5.replace(/&nbsp;/gm, "");
      let nobody = {
        seoDescription: "",
        seoTitle: "",
      };
      try {
        nobody.seoTitle = document
          .querySelectorAll("title")[0]
          .innerHTML.replace(/(\r\n|\n|\r)/gm, "");
        nobody.seoDescription = document
          .querySelectorAll('[name="description"]')[0]
          .getAttribute("content");
      } catch {}
      let infobox = {
        content: "",
        title: "",
        datepublished: "",
        seoTitle: "",
        seoDescription: "",
      };

      infobox.content = content;
      infobox.datepublished = datepublished;
      infobox.title = title;
      infobox.seoTitle = nobody.seoTitle;
      infobox.seoDescription = nobody.seoDescription;

      return { infobox };
    });
    infobox.slug =
      completeLinks[k].split("/")[completeLinks[k].split("/").length - 2];
    info.push(infobox);
  }

  browser.close();
  player.play("female-im-done.mp3", function (err) {
    if (err) throw err;
  });
  return { info };
};
awesoem();
// awesoem().then(({ info }) => {
//   // convert JSON object to a string
//   const servicesData = JSON.stringify(info);
//   // const threeOrFoursData = JSON.stringify(threeOrFours);
//   // write file to disk
//   fs.writeFile("./sirin-blogs.json", servicesData, "utf8", (err) => {
//     if (err) {
//       console.log(`Error writing file: ${err}`);
//     } else {
//       console.log(`File for service page has written successfully!`);
//     }
//   });
//   fs.writeFile("./sirin-blog-304.json", threeOrFoursData, "utf8", (err) => {
//     if (err) {
//       console.log(`Error writing file: ${err}`);
//     } else {
//       console.log(`File 304 has written successfully!`);
//     }
//   });
// });
