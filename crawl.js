const jsdom = require("jsdom");

const { JSDOM } = jsdom;

var scrapedUrls = {}    //array to store all the urls scraped from the website
var scrapedUrls2 = []    //array to store all the urls scraped from the website
var alreadyCrawledUrls = []    //array to store all the valid urls scraped from the website
var pages = {}
var recursive = false
var baseURL;

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
// This function should return all urls in the html body

async function crawlPage(baseURL) {

    const mainUrl = new URL(baseURL)

    //removes trailing slash from baseURL
    baseURL= normalizeUrl(baseURL)

    //checks if the url has already been scraped and increments url count if it has already been scraped
    if(scrapedUrls[baseURL] > 0){
        scrapedUrls[baseURL]++
        return scrapedUrls
    }

    scrapedUrls[baseURL] = 1


    // adds url to scrapedUrls

    try {
        const response = await fetch(baseURL);
        // checks if the response is ok
        if (!response.ok) {
            console.error(`HTTP error: ${response.status} ${response.statusText}`);
            return scrapedUrls;
        }
        // checks if the response header,'content-type' includes 'text/html'
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/html')) {
            console.error('Error: Response content-type is not text/html');
            return scrapedUrls;
        }

        // part where the html body is parsed and urls are extracted into scrapedUrls
        const HtmlBody = await response.text();
        const dom = new JSDOM(HtmlBody);
        //loops through all the 'a' tags in the html body

        for (let nodeListOfElement of dom.window.document.querySelectorAll('a')) {

            //adds html links to scrapedUrls if it starts with http
            if (nodeListOfElement.href.startsWith('http') && nodeListOfElement.href.includes(mainUrl.origin) ) {
                scrapedUrls2.push(normalizeUrl(nodeListOfElement.href))
            }
            //adds base url to the href if it starts with a slash
            else if (nodeListOfElement.href.startsWith('/')){
                scrapedUrls2.push(normalizeUrl(mainUrl.origin) + normalizeUrl(nodeListOfElement.href))
            }
        }
        if (recursive === true)
        for (const domElement of scrapedUrls2) {
            crawlPage(domElement).then(()=>{
                scrapedUrls2.splice(domElement,1)
                // if(scrapedUrls2.length > 0){
                //     for (let i = 0; i < scrapedUrls2.length; i++) {
                //         crawlPage(scrapedUrls2[i])
                //     }
                // }
            })
        }
       await printReport(scrapedUrls)
    } catch (error) {
        console.error('Error:', error.message);
        printReport(scrapedUrls)

    }
}




function normalizeUrl(url) {
    //removes trailing slash from url
    return url.replace(/\/$/, '');
}


function printReport(scrapedUrls){
    let sortedUrls = Object.keys(scrapedUrls).sort((a,b)=>{
        return scrapedUrls[b] - scrapedUrls[a]
    })
    // removes duplicate urls from scrapedUrls
    scrapedUrls2 = scrapedUrls2.filter(
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

module.exports = {
    normalizeUrl: normalizeUrl,
    printReport: printReport
}
