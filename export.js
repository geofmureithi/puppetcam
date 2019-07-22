const puppeteer = require('puppeteer');
const path = require('path')
const Xvfb      = require('xvfb');
var xvfb        = new Xvfb({silent: true});
var width       = 1920;
var height      = 1080;
var options     = {
  headless: false,
  args: [
    '--enable-usermedia-screen-capturing',
    '--allow-http-screen-capture',
    '--auto-select-desktop-capture-source=puppetcam',
    '--load-extension=' + __dirname,,
    '--disable-extensions-except=' + __dirname,
    '--disable-infobars',
    `--window-size=${width},${height}`,
  ],
}

async function main() {
    xvfb.startSync()
    var url = process.argv[2], exportname = process.argv[3]
    if(!url){ url = 'file://' + path.resolve('videos/independence/template.html') }
    if(!exportname){ exportname = 'test.webm' }
    const browser = await puppeteer.launch(options)
    const pages = await browser.pages()
    const page = pages[0]
    await page._client.send('Emulation.clearDeviceMetricsOverride')
    await page.goto(url, {waitUntil: 'networkidle2'})
    await page.setBypassCSP(true)
    // await page.type('#search', 'Fleetwood Mac Dreams')
    // await page.click('button#search-icon-legacy')
    // await page.waitForSelector('ytd-thumbnail.ytd-video-renderer')
    // const videos = await page.$$('ytd-thumbnail.ytd-video-renderer')
    // await videos[2].click()
    // await page.waitForSelector('.html5-video-container')

    // Perform any actions that have to be captured in the exported video


    await page.evaluate(filename=>{
        window.postMessage({type: 'SET_EXPORT_PATH', filename: filename}, '*')
        window.postMessage({type: 'REC_STOP'}, '*')
    }, exportname)

    // Wait for download of webm to complete
    await page.waitFor(8000)
    await page.waitForSelector('html.downloadComplete', {timeout: 0})
    await browser.close()
    xvfb.stopSync()
}

main()
