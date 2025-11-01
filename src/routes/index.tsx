import { createFileRoute } from "@tanstack/react-router"


export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  const loaderData = Route.useLoaderData()

  return (
    <s-page>
		
    </s-page>
  )
}