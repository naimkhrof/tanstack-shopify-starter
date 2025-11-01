import { NavMenu } from "@shopify/app-bridge-react";
import { TanStackDevtools } from "@tanstack/react-devtools";

import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import Header from "../components/Header";
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
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<Header />

				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
				<NavMenu>
					<Link to="/" rel="home">
						Home
					</Link>

					<Link to="/demo/start/server-funcs">About</Link>
					<Link to="/demo/start/api-request">About</Link>
					<Link to="/demo/api/names">About</Link>
					<Link to="/demo/start/ssr">About</Link>
					<Link to="/demo/start/ssr/spa-mode">About</Link>
					<Link to="/demo/start/ssr/full-ssr">About</Link>
					<Link to="/demo/start/ssr/data-only">About</Link>
				</NavMenu>
				{children}
			</body>
		</html>
	);
}
