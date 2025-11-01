const SHOP_SUFFIX = '.myshopify.com'
const SHOP_REGEX = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/

export function normalizeShopDomain(shop: string | null | undefined) {
  if (!shop) return null

  const trimmed = shop.trim().toLowerCase()
  if (!trimmed) return null

  const value = trimmed.endsWith(SHOP_SUFFIX)
    ? trimmed
    : `${trimmed}${SHOP_SUFFIX}`

  if (!SHOP_REGEX.test(value)) {
    return null
  }

  return value
}
