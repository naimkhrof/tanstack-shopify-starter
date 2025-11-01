import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { normalizeShopDomain } from '../../lib/shopify/shop'
import { createState } from '../../lib/shopify/state'

const apiKey = process.env.SHOPIFY_API_KEY ?? process.env.VITE_SHOPIFY_API_KEY
const scopesEnv =
  process.env.SHOPIFY_SCOPES ??
  process.env.SHOPIFY_API_SCOPES ??
  process.env.SHOPIFY_ACCESS_SCOPES ??
  ''


/* 
Cette route est utilisée pour l'authentification Shopify. 

Le shop clique sur “Install” → Shopify déclenche la redirection vers ton backend /auth avec le paramètre shop (id).
	2.	Ton backend /auth → construit l’URL OAuth Shopify avec les scopes et redirige le shop vers Shopify .
	3.	Shopify affiche la page d’autorisation → le marchand accepte les permissions demandées.
	4.	Shopify redirige vers /auth/callback → ton backend récupère le code temporaire.
	5.	Ton backend échange le code contre un offline token → et stocke le shop + token en base.
	6.	Ton frontend React/TanStack Query peut maintenant s’afficher et faire des requêtes vers ton backend, qui utilise le offline token pour appeler l’API Shopify.


  Après ça, toute requête serveur vers l’Admin API se fait avec X-Shopify-
  Access-Token: access_token. Pas de refresh token : si l’app est désinstallée,
  Shopify envoie un webhook, tu supprimes la ligne dans shopify_sessions.

  
*/
export const Route = createFileRoute('/api/auth')({
  server: {
    handlers: {
      GET: ({ request }) => {
        if (!apiKey) {
          return json({ error: 'SHOPIFY_API_KEY must be defined.' }, { status: 500 })
        }

        const url = new URL(request.url)
        const shop = normalizeShopDomain(url.searchParams.get('shop'))

        if (!shop) {
          return json(
            {
              error:
                'Missing or invalid shop parameter. Expected e.g. ?shop=example-shop or example-shop.myshopify.com',
            },
            { status: 400 },
          )
        }

        const redirectUri = `${url.origin}/api/auth/callback`
        const state = createState(shop)

        const authorizeUrl = new URL(`https://${shop}/admin/oauth/authorize`)
        authorizeUrl.searchParams.set('client_id', apiKey)
        authorizeUrl.searchParams.set('scope', scopesEnv)
        authorizeUrl.searchParams.set('redirect_uri', redirectUri)
        authorizeUrl.searchParams.set('state', state)

        const headers = new Headers({ Location: authorizeUrl.toString() })

        return new Response(null, {
          status: 302,
          headers,
        })
      },
    },
  },
})
