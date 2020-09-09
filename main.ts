import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import { ENV_CONFIG, KubeEnvConfig } from './config';
import { SELECTORS } from './constants';

let KUBE_LOGIN_URL;
let KUBE_DASHBOARD_URL;
let KUBECONFIG_PATH;

let sessionGateId: number | NodeJS.Timer;

/**
 * Main automation execution
 */
export async function main(): Promise<void> {
    resolveEnvSetting();

    // Start a browser
    const browser: Browser = await launchBrowser();

    // Get a new page
    const originPage: Page = await browser.newPage();

    // Get login page & do login
    const loginPage: Page = await doLoginPage(originPage);

    // Get dashboard page & open pod log pages
    const dashPage: Page = await openLogPages(loginPage);

    // Wait for all pod log pages to be loaded
    await watchNewPage(browser, originPage, SELECTORS.LOG_PAGE.BUTTON.AUTO_REFRESH_TOGGLE);

    // Find all ready log pages
    const logPages: Page[] = await findLogPages(browser);

    // Tweak all log pages to have nicer log display
    logPages.forEach(async (page: Page) => await trackLogPage(page));

    sessionGateId = maintainSession(originPage);
}

export async function launchBrowser(): Promise<Browser> {
    const browser: Browser = await puppeteer.launch({
        headless: false,
        executablePath: 'C:\\dev-workspace\\dev-tools\\chromium\\chrome-win\\chrome.exe',
        devtools: false,
        defaultViewport: {
            height: 1080,
            width: 1920
        }
    });

    return browser;
}

/**
 * Do login
 * @param page blank page starter
 * @returns login page after login
 */
export async function doLoginPage(page: Page): Promise<Page> {
    await page.goto(KUBE_LOGIN_URL);

    await page.evaluate((hiddenInputSelector: string) => {
        const hiddenKubeConfigElement: HTMLElement = document.querySelector(hiddenInputSelector);
        hiddenKubeConfigElement.setAttribute('style', 'display: block !important');
    }, SELECTORS.LOGIN_PAGE.INPUT.KUBE_CONFIG_HIDDEN);

    await page.waitForSelector(SELECTORS.LOGIN_PAGE.INPUT.KUBE_CONFIG_HIDDEN);
    const visibleKubeConfigInput: ElementHandle<HTMLInputElement> = await page.$(SELECTORS.LOGIN_PAGE.INPUT.KUBE_CONFIG_HIDDEN);
    await visibleKubeConfigInput.uploadFile(KUBECONFIG_PATH);

    const signInButton = await page.$(SELECTORS.LOGIN_PAGE.BUTTON.SIGN_IN);
    await signInButton.click();

    await page.waitForNavigation();

    return page;
}

/**
 * Open logs tabs
 * @param page starter page
 * @returns login page after login
 */
export async function openLogPages(page: Page): Promise<Page> {
    await page.goto(KUBE_DASHBOARD_URL);
    await page.waitForSelector(SELECTORS.OVERVIEW_PAGE.BUTTON.LOG_TOGGLE);
    const logToggleEHs: ElementHandle<HTMLAnchorElement>[] = await page.$$(SELECTORS.OVERVIEW_PAGE.BUTTON.LOG_TOGGLE);
    logToggleEHs.forEach(async (logBtnHdl) => await logBtnHdl.click());
    return page;
}


/**
 * Track & tweak log page
 * and configure page setup
 * @param page log page to setup
 * @returns tweaked page
 */
export async function trackLogPage(page: Page): Promise<Page> {
    page.evaluate((buttonSelectors) => {
        const smallerFontBtn: HTMLButtonElement = document.querySelector(buttonSelectors.SMALLER_FONT_TOGGLE);
        if (smallerFontBtn) {
            smallerFontBtn.click();
        }

        const autoRefreshBtn: HTMLButtonElement = document.querySelector(buttonSelectors.AUTO_REFRESH_TOGGLE);
        if (autoRefreshBtn) {
            autoRefreshBtn.click();
        }

        return;
    }, SELECTORS.LOG_PAGE.BUTTON);

    return page;
}

/**
 * Maintain open kube sessions
 * @param page target page to keep open
 * @param freq update in millis
 */
export function maintainSession(page: Page, freq = 30000): NodeJS.Timer {
    return setInterval(() => page.reload(), freq);
}

/**
 * Do a timeout
 * @param timeout duration in millis
 */
export async function asyncTimeout(timeout: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
}


/**
 * Watch if browser is currently loading pages
 * @param browser to watch new opening pages 
 * @param page opener new pages
 * @param selector that defines if page is loaded
 * @returns promise when finished
 */
export async function watchNewPage(browser: Browser, page: Page, selector: string): Promise<void> {
    const originTarget = page.target();
    let isNewPagePopping = true;
    const poppedUrls = [];

    do {
        const newPageTarget = await browser.waitForTarget(target => target.opener() === originTarget);

        if (newPageTarget && !poppedUrls.includes(newPageTarget.url())) {
            await (await newPageTarget.page()).waitForSelector(selector);
            poppedUrls.push(newPageTarget.url());
        } else {
            isNewPagePopping = false;
        }

        await asyncTimeout(500);
    } while (isNewPagePopping);

    return;
}

/**
 * Get browser opened log pages
 * @param browser to seach log pages for
 * @returns promise over found log pages
 */
export async function findLogPages(browser: Browser): Promise<Page[]> {
    const logPageIndex = [];

    const logPages: Page[] = (await Promise.all(
        (await browser.pages())
            .map(async (page: Page, index: number): Promise<Page> => {
                const pageTitle = await page.title();

                if (pageTitle.includes('Logs')) {
                    logPageIndex.push(index);
                }

                return page;
            })
    )).filter((_, index) => logPageIndex.includes(index));

    return logPages;
}

/**
 * Resolve environment execution configuration
 */
export function resolveEnvSetting(): void {

    const kubeEnvConfig: KubeEnvConfig = resolveEnvConfig();

    const kubeUrl = kubeEnvConfig.KUBE_URL;
    const kubeNamespace = kubeEnvConfig.KUBE_NAMESPACE_NAME;

    KUBE_LOGIN_URL = kubeUrl + ENV_CONFIG.GLOBAL.KUBE.LOGIN_ENDPOINT;
    KUBE_DASHBOARD_URL = kubeUrl + ENV_CONFIG.GLOBAL.KUBE.DASHBOARD_ENDPOINT + kubeNamespace;

    let kubeConfigLocation: string = resolveKubeConfigLocation();
    if (!kubeConfigLocation) {
        kubeConfigLocation = kubeEnvConfig.KUBE_CONFIG_LOCATION;
    }

    KUBECONFIG_PATH = kubeConfigLocation;

    console.log(`Environment setup : CONFIG FILE - ${KUBECONFIG_PATH} | LOGIN - ${KUBE_LOGIN_URL} | DASHBOARD - ${KUBE_DASHBOARD_URL}`)
}

/**
 * Get kubernetes environment config
 * Knowing process
 */
export function resolveEnvConfig(): KubeEnvConfig {
    const runningEnv: string = process.env.NODE_ENV;

    switch (runningEnv) {
        case 'qa':
            return ENV_CONFIG.ENV.QA;
        case 'vabf':
            return ENV_CONFIG.ENV.VABF;
        case 'prd':
            return ENV_CONFIG.ENV.PRD;
        default:
            return ENV_CONFIG.ENV.INT;
    }
}

/**
 * Get kubernetes environment config
 * Knowing process
 */
export function resolveKubeConfigLocation(): string {
    if (process.argv && process.argv['config']) {
        console.log('KubeConfig file location: ' + process.argv['config']);
        return process.argv['config'];
    }

    return null;
}
