import puppeteer from "puppeteer";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);
const parseDateToStandard = (dateStr) => {
  // Define possible date formats
  const formats = [
    'MMM DD, YYYY', // e.g., Sep 12, 2024
    // 'DD/MM/YYYY',   // e.g., 31/12/2024
    // 'D/M/YYYY',     // e.g., 1/1/2024
    // 'DD/M/YYYY',    // e.g., 01/2/2024
    // 'D/MM/YYYY',    // e.g., 1/12/2024
    // 'DD-MMM-YYYY',  // e.g., 31-Dec-2024
    // 'D-MMM-YYYY',   // e.g., 1-Dec-2024
    // 'DD-MMM',       // e.g., 31-Dec
    // 'D-MMM'         // e.g., 1-Dec
  ];

  for (const format of formats) {
    const dt = dayjs(dateStr, format, false); // true for strict parsing

    if (dt.isValid()) {
      // Return the date in standard format DD-MMM-YYYY
      return dt.format('DD-MMM-YYYY');
    }
  }
console.log("@@## dateStr",dateStr)
  throw new Error('Invalid date format');
};

const getDataFromSite = async (url,extractData,formatData)=>{
  const browser = await puppeteer.launch({ headless: true }); 
  const page = await browser.newPage();
  await page.goto(url);
  const extractedData = await extractData(page)
  await browser.close();
  await browser.close();
  const formattedData = formatData(extractedData)
  return formattedData;
}

export const getDetails = async (type) => {
  if(type === "IPO"){
    const url = "https://www.investorgain.com/report/live-ipo-gmp/331/ipo/"
    const extractData = async (ipoPage) =>{
      return await ipoPage.evaluate(() => {
        const ipoDetails = [];
    
        document.querySelectorAll("tbody tr").forEach((row) => {
          const titleElement = row.querySelector('td[data-label="IPO"] a');
          const title = titleElement
            ? titleElement?.childNodes?.[0]?.nodeValue?.trim()
            : "N/A";
          const status = titleElement
            ? titleElement
                .querySelector(".badge")
                ?.innerText?.split(" ")?.[0]
                ?.trim() || ""
            : "NA";
          const gmp = row
            .querySelector('td[data-label="Est Listing"] b')
            ?.innerText.trim();
          const gmpPerCent = (gmp && gmp?.match(/\(([^)]+)\)/)?.[1]) || "NA";
    
          const openDate =
            row.querySelector('td[data-label="Open"]')?.innerText?.trim() || "NA";
          const closeDate =
            row.querySelector('td[data-label="Close"]')?.innerText?.trim() || "NA";
          const boaDate =
            row.querySelector('td[data-label="BoA Dt"]')?.innerText?.trim() || "NA";
          const listingDate =
            row.querySelector('td[data-label="Listing"]')?.innerText?.trim() ||
            "NA";
    
          // Construct an object for each row and push it to the array
          ipoDetails.push({
            title,
            status,
            gmp,
            gmpPerCent,
            openDate,
            closeDate,
            boaDate,
            listingDate,
          });
        });
    
        return ipoDetails;
      });
    }
    const formatData = (ipoData)=>{
      let formattedText = "";
      let openIpo = `*********Open IPO's**********:\n`;
      let upcommingIpo = `*******Upcomming IPO's*******:\n`;
      ipoData.forEach((detail) => {
        if (["Open", "Upcoming"].includes(detail.status)) {
          if (detail.status === "Open") {
            openIpo += `Name: ${detail.title}\nGMP: ${detail.gmpPerCent}\nDates: ${detail.openDate} to ${detail.closeDate} \nAllotment & Listing: ${detail.boaDate} & ${detail.listingDate} \n\n`;
          } else {
            upcommingIpo += `Name: ${detail.title}\nGMP: ${detail.gmpPerCent}\nDates: ${detail.openDate} to ${detail.closeDate} \nAllotment & Listing: ${detail.boaDate} & ${detail.listingDate} \n\n`;
          }
        }
      });
      formattedText = formattedText + openIpo + upcommingIpo;
      return formattedText;
    }
    const IpoData =  await getDataFromSite(url,extractData,formatData)
    return IpoData
  }else if(type ==="Buyback"){
    const url = "https://www.chittorgarh.com/report/latest-buyback-issues-in-india/80/tender-offer-buyback/"
    const extractData = async (buybackPage) =>{
      return await buybackPage.evaluate(() => {
        const buyBackDetails = [];
        document.querySelectorAll("tbody tr").forEach((row) => {
          const companyName = row.querySelector('td:nth-child(1)')?.innerText || "NA";
          const bbPrice = row.querySelector('td:nth-child(6)')?.innerText || "NA";
          const LTP = row.querySelector('td:nth-child(7)')?.innerText || "NA";
          const startDate = row.querySelector('td:nth-child(3)')?.innerText || "NA";
          const endDate = row.querySelector('td:nth-child(4)')?.innerText || "NA";
          const recordDate = row.querySelector('td:nth-child(2)')?.innerText || "NA";
          buyBackDetails.push({
            companyName,
            bbPrice,
            LTP,
            recordDate,
            startDate,
            endDate,
          });
        });
    
        return buyBackDetails;
      });
    }
    const formatData = (buybackData)=>{
      let buybackText =  `*****Buybacks*****\n`;
      buybackData?.forEach((buyback)=>{
        if(buyback.endDate && buyback.endDate != "NA"){
          const endDate = parseDateToStandard(buyback.endDate)
          const hasEnded = dayjs().isAfter(dayjs(endDate),'d')
          if(!hasEnded){
            buybackText += `Name: ${buyback.companyName}\nRecord date: ${parseDateToStandard(buyback.recordDate)}\nOpen Dates:  ${parseDateToStandard(buyback.endDate)} to ${parseDateToStandard(buyback.endDate)}\nBuy back price:${buyback.bbPrice}\nProfit(approx): ${(buyback.bbPrice - buyback.LTP).toFixed(2)}₹ \n\n`
          }
        }
      })
      return buybackText;
    }
    const buybackData =  await getDataFromSite(url,extractData,formatData)
    return buybackData
  }else if(type === "Right Issue"){
    const url = "https://www.chittorgarh.com/report/latest-rights-issue-in-india/75/"
    const extractData = async (RIPage) =>{
      return await RIPage.evaluate(() => {
        const RIDetails = [];
        document.querySelectorAll("tbody tr").forEach((row) => {
          const companyName = row.querySelector('td:nth-child(1)')?.innerText || "NA";
          const recordDate = row.querySelector('td:nth-child(2)')?.innerText || "NA";
          const startDate = row.querySelector('td:nth-child(3)')?.innerText || "NA";
          const endDate = row.querySelector('td:nth-child(5)')?.innerText || "NA";
          const issuePrice = row.querySelector('td:nth-child(6)')?.innerText || "NA";
          const LTP = row.querySelector('td:nth-child(8)')?.innerText || "NA";
          const RIPrice = row.querySelector('td:nth-child(9)')?.innerText || "NA";
          const ratio = row.querySelector('td:nth-child(10)')?.innerText || "NA";
          RIDetails.push({
            companyName,
            issuePrice,
            LTP,
            recordDate,
            startDate,
            endDate,
            ratio,
            RIPrice
          });
        });
    
        return RIDetails;
      });
    }
    const formatData = (RIData)=>{
      let RIText = `*****Right issues****\n`
      RIData?.forEach((RI)=>{
        if(RI.endDate && RI.endDate !== "NA"){
          const endDate = parseDateToStandard(RI.endDate)
          const hasEnded = dayjs().isAfter(dayjs(endDate),'d')
          if(!hasEnded){
            const ratioArr = RI.ratio === "NA" ? "NA": RI.ratio.split(":")
            RIText += `Name: ${RI.companyName}\nRecord date: ${parseDateToStandard(RI.recordDate)}\nOpen Dates: ${parseDateToStandard(RI.endDate)} to ${parseDateToStandard(RI.endDate)}\nIssue price: ${RI.issuePrice}₹\nStock Price: ${RI.LTP}₹\n`
            RIText += RI.ratio === "NA" ? `Ratio: NA\n`: `Ratio: ${ratioArr[0]} shares on every ${ratioArr[1]} shares\n`
            RIText += RI.RIPrice === "NA" ? "\n\n" : `RE price: ${RI.RIPrice}₹\n\n`
          }
        }
      })
      return RIText
    }
    const RIData = await getDataFromSite(url,extractData,formatData)
    console.log(RIData)
    return RIData
  }
};
