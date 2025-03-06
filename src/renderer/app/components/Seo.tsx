import { Helmet } from 'react-helmet'

export default function Seo({
  title
}) {
  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  )
}