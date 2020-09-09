export interface KubeEnvConfig {
    KUBE_URL: string;
    KUBE_CONFIG_LOCATION: string;
    KUBE_NAMESPACE_NAME: string;
}

export const ENV_CONFIG = {
    GLOBAL: {
        KUBE: {
            LOGIN_ENDPOINT: '/login',
            DASHBOARD_ENDPOINT: '/overview?namespace='
        }
    },
    ENV: {
        INT: {
            KUBE_URL: 'https://kubernetes-dashboard-npr.com/#!',
            KUBE_CONFIG_LOCATION: 'assets/example-kubeconfig-int.txt',
            KUBE_NAMESPACE_NAME: 'example-namespace-name-int',
        },
        QA: {
            KUBE_URL: 'https://kubernetes-dashboard-npr.com/#!',
            KUBE_CONFIG_LOCATION: 'assets/example-kubeconfig-qa.txt',
            KUBE_NAMESPACE_NAME: 'example-namespace-name-qa',
        },
        VABF: {
            KUBE_URL: 'https://kubernetes-dashboard-npr.com/#!',
            KUBE_CONFIG_LOCATION: 'assets/example-kubeconfig-vabf.txt',
            KUBE_NAMESPACE_NAME: 'example-namespace-name-vabf',
        },
        PRD: {
            KUBE_URL: 'https://kubernetes-dashboard-prd.com/#!',
            KUBE_CONFIG_LOCATION: 'assets/example-kubeconfig-prd.txt',
            KUBE_NAMESPACE_NAME: 'example-namespace-name-prd',
        }
    }
};
