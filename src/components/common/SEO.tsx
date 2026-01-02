interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'game';
  siteName?: string;
  siteUrl?: string;
}

export default function SEO({
  title = 'Kasrah Games - Play Free Online Games',
  description = 'A web games platform hosting playable HTML5 and WebGL games with categories, ratings, and user playlists.',
  image = 'https://kasrahgames.example/images/og-image.jpg',
  type = 'website',
  siteName = 'Kasrah Games',
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kasrahgames.example',
}: SEOProps) {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional tags */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={siteUrl} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </>
  );
}
