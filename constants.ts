
export const SELECTORS = {
    LOGIN_PAGE: {
        BUTTON: {
            SIGN_IN: 'body > kd-login > form > kd-content-card > div > div > div > kd-content > button'
        },
        INPUT: {
            KUBE_CONFIG_HIDDEN: '#fileInput'
        }
    },
    OVERVIEW_PAGE: {
        BUTTON: {
            LOG_TOGGLE: 'body > kd-chrome > md-content > md-content > div > div > div > div > div:nth-child(3) > kd-content-card:nth-child(4) > div > div > div > kd-content > kd-pod-card-list > kd-resource-card-list > div > div.kd-resource-card-list.kd-resource-card-list-with-statuses > kd-pod-card > kd-resource-card > div > div > ng-transclude.kd-resource-card-columns-slot.flex > kd-resource-card-columns > div > kd-resource-card-column.kd-row-layout-column.kd-icon-column.ng-scope.ng-isolate-scope.kd-column-size-small.kd-column-grow-nogrow > ng-transclude > kd-logs-button > a'
        }
    },
    LOG_PAGE: {
        BUTTON: {
            SMALLER_FONT_TOGGLE: 'body > kd-chrome > md-content > md-content > div > div > div > div > kd-logs > kd-content-card > div > div > h1 > kd-title > div > button:nth-child(2)',
            AUTO_REFRESH_TOGGLE: 'body > kd-chrome > md-content > md-content > div > div > div > div > kd-logs > kd-content-card > div > div > h1 > kd-title > div > button:nth-child(4)',
        }
    }
};

