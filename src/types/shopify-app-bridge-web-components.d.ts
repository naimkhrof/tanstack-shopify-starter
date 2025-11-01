type ShopifyAppBridgeElement<T extends Element> = Partial<T> & {
  [key: string]: any
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'app-link': ShopifyAppBridgeElement<HTMLAnchorElement>
      's-app-link': ShopifyAppBridgeElement<HTMLAnchorElement>
      's-app-nav': ShopifyAppBridgeElement<HTMLElement>
      's-link': ShopifyAppBridgeElement<HTMLDivElement>
      's-icon-button': ShopifyAppBridgeElement<HTMLButtonElement>
      // ajoute les autres balises s-* dont tu as besoin
    }
  }
}
