
import { NavMenu,  } from '@shopify/app-bridge-react'
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools} from '@tanstack/react-router-devtools'
import appCss from "../styles.css?url";


const shopifyApiKey = import.meta.env.VITE_SHOPIFY_API_KEY ?? "";

export const Route = createRootRoute({
	head: () => ({
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "preconnect",
				href: "https://cdn.shopify.com",
			},
			{
				rel: "preload",
				href: "https://cdn.shopify.com/shopifycloud/polaris.js",
				as: "script",
			},
		],
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				name: "shopify-api-key",
				content: shopifyApiKey,
			},
			{
				title: "TanStack Start Starter",
			},
		],
		scripts: [
			{
				src: "https://cdn.shopify.com/shopifycloud/app-bridge.js",
			},
			{
				src: "https://cdn.shopify.com/shopifycloud/polaris.js",
			},
		],
	}),
	component: RootComponent,
});


function RootComponent() {
	return (
	  <RootDocument>
		<NavMenu>
		  <Link to="/" rel="home">
			Home
		  </Link>
  
		  <Link to="/about">About</Link>
		</NavMenu>
  
		<Outlet />
	  </RootDocument>
	)
  }

  function RootDocument({ children }: { children: React.ReactNode }) {
	return (
	  <html lang='en' suppressHydrationWarning>
		<head>
		  <HeadContent />
		</head>
  
		<body>
		  {children}
  
		  <TanStackRouterDevtools position="bottom-right" />
		  <Scripts />
		</body>
	  </html>
	)
  }