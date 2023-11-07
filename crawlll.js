const jsdom = require("jsdom");

const { JSDOM } = jsdom;

var scrapedUrls = {}    //array to store all the urls scraped from the website //array to store all the urls scraped from the website
var alreadyCrawledUrls = []    //array to store all the valid urls scraped from the website
var pages = {}
var baseURL;
var recursive = false

async function  main(){
    if (process.argv.length <= 2){
        console.log('no website provided')
    }
    else if (process.argv.length > 4){
        console.log('too many arguments provided')
    }
    else {
        if(process.argv[3] === '-r'){
            recursive = true
        }
        baseURL = process.argv[2]
        const urlOrigin = new URL(baseURL)
        baseURL = urlOrigin.origin

        console.log(`starting crawl of: ${baseURL}...`)
        crawlPage(baseURL).then()
    }
}
main()
async function crawlPage(baseURL) {

    if(scrapedUrls[baseURL] > 0){
        scrapedUrls[baseURL]++
        return scrapedUrls
    }

    scrapedUrls[baseURL] = 1
    try {
        const response = await fetch(baseURL);
        // checks if the response is ok
        if (!response.ok) {
            console.error(`HTTP error: ${response.status} ${response.statusText}`);
            return alreadyCrawledUrls;
        }
        // checks if the response header,'content-type' includes 'text/html'
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/html')) {
            console.error('Error: Response content-type is not text/html');
            return alreadyCrawledUrls;
        }
        const HtmlBody = await response.text();
        // gets all the urls from the html body
      await  getURLsFromHTML(HtmlBody, baseURL)
        if (recursive === true){
            for (const domElement of alreadyCrawledUrls) {
                crawlPage(domElement).then(()=>{
                    alreadyCrawledUrls.splice(domElement,1)
                    // if(alreadyCrawledUrls.length > 0){
                    //     for (let i = 0; i < alreadyCrawledUrls.length; i++) {
                    //         crawlPage(alreadyCrawledUrls[i])
                    //     }
                    // }
                })
            }
            printReport(scrapedUrls)
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// This function should return all urls in the html body
function getURLsFromHTML(htmlBody) {
    const dom = new JSDOM(htmlBody);
    const mainUrl = new URL(baseURL)
    //removes trailing slash from baseURL
    baseURL= baseURL.replace(/\/$/,'')

    //loops through all the 'a' tags in the html body
    for (let nodeListOfElement of dom.window.document.querySelectorAll('a')) {

        //adds html links to scrapedUrls if it starts with http
        if (nodeListOfElement.href.startsWith('http') && nodeListOfElement.href.includes(mainUrl.origin) ) {
            alreadyCrawledUrls.push(normalizeUrl(nodeListOfElement.href))
        }
        //adds base url to the href if it starts with a slash
        else if (nodeListOfElement.href.startsWith('/')){
            alreadyCrawledUrls.push(normalizeUrl(mainUrl.origin) + normalizeUrl(nodeListOfElement.href))
        }
    }

    // checks if page does not have zero links
    if (alreadyCrawledUrls.length !== 0){
        for (const url of alreadyCrawledUrls) {
            console.log(url)
        }
        alreadyCrawledUrls = alreadyCrawledUrls.filter(
            (value, index, self) => self.indexOf(value) === index
        );
        console.log('\n' + alreadyCrawledUrls.length + ` links were found on the website(${baseURL})`)
    }
    else { console.log('This website has zero links to scrape')}


}

function printReport(scrapedUrls){
    let sortedUrls = Object.keys(scrapedUrls).sort((a,b)=>{
        return scrapedUrls[b] - scrapedUrls[a]
    })
    // removes duplicate urls from scrapedUrls
    alreadyCrawledUrls = alreadyCrawledUrls.filter(
        (value, index, self) => self.indexOf(value) === index
    );
    console.log('\n' + sortedUrls.length + ` links were found on the website(${baseURL})`)

    console.log('\n' + '==========')
    console.log('REPORT')
    console.log('==========')
    if (!recursive)
        console.log(scrapedUrls)
    // checks if page does not have zero links
    if (scrapedUrls.length !== 0){
        console.log(Object.keys(scrapedUrls).length)
        for (let i = 0; i < sortedUrls.length; i++) {
            console.log(`${i+1}. ${sortedUrls[i]}: found ${scrapedUrls[sortedUrls[i]]} times`)
        }

    }


}
function normalizeUrl(url) {
    //removes trailing slash from url
    return url.replace(/\/$/, '');
}
// This function should start the recursive crawl loop

async function startRecursiveCrawlLoop(trueScrapedUrls){
        for (const copyOfScrapedUrl of trueScrapedUrls) {
            pages[copyOfScrapedUrl] = 1
        }

        //creates a copy of scrapedUrls
        const copyOfScrapedUrls = [...trueScrapedUrls]

        // console.log(`\n \n starting recursive crawl loop of the ${trueScrapedUrls.length} Links found... `)

        //loops through all the urls in scrapedUrls
        for (let i = 0; i < copyOfScrapedUrls.length; i++) {

                crawlSubLPages(copyOfScrapedUrls[i])

        }
        //crawls the subpages of the url


        // startRecursiveCrawlLoop(validScrapedUrls)

        //     .then(()=>{
        //     return  url = url + 'done' //adds 'done' to the url to indicate that it has been crawled
        // }).then((url) => {console.log('Wait, crawling is not done yet...')})

        //
        // if (new Set(scrapedUrls).size === scrapedUrls.length){
        //     console.log('found some duplicates')
        // }
        // // else return console.log('no duplicates found')

}

// async function crawlSubLPages(foundURL) {
//     const mainUrl = new URL(foundURL)
//     // console.log('non valid links = '+ scrapedUrls.length)
//     // console.log(' valid links = '+ validScrapedUrls.length)
//     // setTimeout(() => {
//     //     console.log(validScrapedUrls.length)
//     //     console.log(scrapedUrls.length)
//     //     // for (const argument of validScrapedUrls) {
//     //     //     console.log(argument)
//     //     // }
//     // },3000)
//     try {
//         const response = await fetch(foundURL);
//
//         if (!response.ok){
//             console.error(`HTTP error: ${response.status} ${response.statusText}`);
//             scrapedUrls = scrapedUrls.filter(url => url !== foundURL);
//             // validScrapedUrls = validScrapedUrls.filter(url => url !== foundURL);
//             return;
//         }
//         else if (!response.headers.get('content-type').includes('text/html')){
//             console.error('Error: Response content-type is not text/html');
//             scrapedUrls = scrapedUrls.filter(url => url !== foundURL);
//             // validScrapedUrls = validScrapedUrls.filter(url => url !== foundURL);
//             return;
//         }
//
//         const HtmlBody =  await response.text();
//         const dom = new JSDOM(HtmlBody);
//
//         //
//         if ( dom.window.document.querySelectorAll('a').length === 0){
//             scrapedUrls = scrapedUrls.filter(url => url !== foundURL);
//             // validScrapedUrls = validScrapedUrls.filter(url => url !== foundURL);
//             return console.log('There are zero links on this url')
//         }
//
//         //loops through all the 'a' tags in the html body
//         else {
//             for await (let nodeListOfElement of dom.window.document.querySelectorAll('a')) {
//
//                 //adds html links to scrapedUrls if it starts with http
//                 if (nodeListOfElement.href.startsWith('http')) {
//                     if (nodeListOfElement.href.includes(mainUrl.hostname)) {
//                         if(response.ok && response.headers.get('content-type').includes('text/html')
//                             && normalizeUrl(nodeListOfElement.href) !== normalizeUrl(baseURL)
//                             && !alreadyCrawledUrls.includes(normalizeUrl(nodeListOfElement.href)) && baseURL.origin === nodeListOfElement.href)
//                         {
//                             let yes = false
//                             for (let i = 0; i < scrapedUrls.length; i++) {
//                                 if (scrapedUrls[i] === normalizeUrl(nodeListOfElement.href)){
//                                     yes = true
//                                 }
//                             }
//                            if (!yes){scrapedUrls.push(normalizeUrl(nodeListOfElement.href))}
//                            else pages[normalizeUrl(nodeListOfElement.href)]++
//
//                         }
//                         // else scrapedUrls = scrapedUrls.filter(url => url !== foundURL);
//                         //  validScrapedUrls = validScrapedUrls.filter(url => url !== foundURL);
//                     }
//                 }
//                 //adds base url to the href if it starts with a slash
//                 else if (nodeListOfElement.href.startsWith('/')) {
//                     if (response.ok && response.headers.get('content-type').includes('text/html')
//                         && !alreadyCrawledUrls.includes(normalizeUrl(nodeListOfElement.href)))
//                     {
//                         // let tap = normalizeUrl(baseURL) + normalizeUrl(nodeListOfElement.href)
//                         // if (scrapedUrls.includes(tap)){
//                         //     pages[normalizeUrl(nodeListOfElement.href)]++
//                         // }
//                         // else {
//                         let yess = false
//                         for (let i = 0; i < scrapedUrls.length; i++) {
//                             if (scrapedUrls[i] === normalizeUrl(nodeListOfElement.href)){
//                                 yess = true
//                             }
//                         }
//                         if (!yess){scrapedUrls.push(normalizeUrl(baseURL) + normalizeUrl(nodeListOfElement.href))}
//                         else pages[normalizeUrl(nodeListOfElement.href)]++
//
//
//                     }
//
//                     // else scrapedUrls = scrapedUrls.filter(url => url !== foundURL);
//                     //  validScrapedUrls = validScrapedUrls.filter(url => url !== foundURL);
//                 }
//             }
//
//         }
//         // // adds 'done' to duplicate urls
//         // if (!checkOccurrences(scrapedUrls, foundURL)){
//         //     for (let i = 0; i < scrapedUrls.length; i++) {
//         //         if (scrapedUrls[i] === foundURL){
//         //             scrapedUrls[i] = foundURL + 'done'
//         //         }
//         //     }
//         //     scrapedUrls[foundURL.indexOf(foundURL)] = foundURL + 'done'
//         // }
//
//     }
//     catch (error){
//         scrapedUrls = scrapedUrls.filter(url => url !== foundURL);
//         // validScrapedUrls = validScrapedUrls.filter(url => url !== foundURL);
//     }
//     scrapedUrls = scrapedUrls.filter(
//         (value, index, self) => self.indexOf(value) === index
//     );
//     alreadyCrawledUrls = alreadyCrawledUrls.filter(
//         (value, index, self) => self.indexOf(value) === index
//     );
//
//     //removes all duplicates from scrapedUrls
//     for (let i = 0; i < scrapedUrls.length; i++) {
//         if (scrapedUrls[i] === foundURL){
//             alreadyCrawledUrls.push(foundURL)
//             scrapedUrls = scrapedUrls.filter(url => url !== foundURL);
//         }
//     }
//     if (scrapedUrls.length === 0){
//        console.log(alreadyCrawledUrls.length)
//         return console.log(alreadyCrawledUrls)
//     }
//
// }

// This function should remove the trailing slash from all urls




// setInterval(() => {
//     console.log(scrapedUrls.length)
//     console.log(alreadyCrawledUrls.length)
//     for (const argument of alreadyCrawledUrls) {
//         console.log(argument)
//     }
//     // for (const argument of scrapedUrls) {
//     //     console.log(argument)
//     // }
//     // for (const argumentsKey in pages) {
//     //     console.log(pages[argumentsKey])
//     // }
//     // console.log(pages)
// },1000)


// You have finished the work. Find a way to break the loop or find a way to create
// new recursive that will eventually break the loop

// module.exports = {
//     normalizeUrl: normalizeUrl,
//     getURLsFromHTML: getURLsFromHTML
// }


