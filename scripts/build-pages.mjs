#!/usr/bin/env node
/**
 * Build: inline nav/hero/trust/content/footer into page shells for no-JS crawlability.
 * Source of truth remains content/ + partials/. Re-run after edits.
 */
import fs from 'fs';
import path from 'path';

const root = process.cwd();

const PAGES = [
  { file: 'index.html', page: 'home', hero: 'partials/hero-home.html', trust: 'partials/trust-strip.html', content: 'content/home.html', title: 'St Thomas Shore Excursions | Cruise Port Beaches, Snorkelling & Island Days', description: 'Plan a St Thomas cruise day from Havensight or Crown Bay — beaches, snorkelling, private tours and port tips with a realistic return buffer.', canonical: '/', ogImage: 'images/hero-st-thomas-magens-bay.jpg', schema: 'home' },
  { file: 'best-beaches-in-st-thomas-for-cruise-passengers.html', page: 'beaches', hero: 'partials/hero-best-beaches.html', trust: 'partials/trust-strip.html', content: 'content/best-beaches-in-st-thomas-for-cruise-passengers.html', title: 'Best Beaches in St Thomas for Cruise Passengers | Magens, Sapphire, Coki', description: 'Compare Magens Bay, Sapphire Beach, Coki Beach and Secret Harbour for a St Thomas cruise stop — swimming, snorkelling, facilities and shore-time planning.', canonical: '/best-beaches-in-st-thomas-for-cruise-passengers', ogImage: 'images/magens-bay-beach.jpg', schema: 'beaches' },
  { file: 'one-day-in-st-thomas-from-cruise-ship.html', page: 'oneday', hero: 'partials/hero-one-day.html', trust: 'partials/trust-strip.html', content: 'content/one-day-in-st-thomas-from-cruise-ship.html', title: 'One Day in St Thomas from a Cruise Ship | Realistic Port-Day Plans', description: 'Build a realistic one-day St Thomas cruise itinerary — shorter calls, beach days, sightseeing plus beach, and private options from Havensight or Crown Bay.', canonical: '/one-day-in-st-thomas-from-cruise-ship', ogImage: 'images/hero-st-thomas-magens-bay.jpg', schema: 'oneday' },
  { file: 'st-thomas-cruise-port-guide.html', page: 'port', hero: 'partials/hero-port-guide.html', trust: 'partials/trust-strip.html', content: 'content/st-thomas-cruise-port-guide.html', title: 'St Thomas Cruise Port Guide | Havensight, Crown Bay & Charlotte Amalie', description: 'St Thomas cruise port guide for Havensight and Crown Bay — transport, beaches, excursion departures and return planning for cruise passengers.', canonical: '/st-thomas-cruise-port-guide', ogImage: 'images/cruise-port.jpg', schema: 'port' },
  { file: 'best-st-thomas-shore-excursions.html', page: 'excursions', hero: 'partials/hero-excursions.html', trust: 'partials/trust-strip.html', content: 'content/best-st-thomas-shore-excursions.html', title: 'Best St Thomas Shore Excursions | Beach, Snorkel & Private Tours', description: 'Compare the best St Thomas shore excursions for cruise passengers — beach days, snorkelling, sightseeing and private tours planned around your call.', canonical: '/best-st-thomas-shore-excursions', ogImage: 'images/beach-excursion.jpg', schema: 'hub' },
  { file: 'st-thomas-beach-excursions.html', page: 'beaches', hero: 'partials/hero-beaches.html', trust: 'partials/trust-strip.html', content: 'content/st-thomas-beach-excursions.html', title: 'St Thomas Beach Excursions | Magens Bay & Island Beach Days', description: 'Explore St Thomas beach excursions for cruise passengers — Magens Bay style beach days, resort beach options and how they fit a port call.', canonical: '/st-thomas-beach-excursions', ogImage: 'images/beach-excursion.jpg', schema: 'hub' },
  { file: 'st-thomas-snorkeling-tours.html', page: 'snorkeling', hero: 'partials/hero-snorkeling.html', trust: 'partials/trust-strip.html', content: 'content/st-thomas-snorkeling-tours.html', title: 'St Thomas Snorkelling Tours | Reef, Turtle & Catamaran Days', description: 'Compare St Thomas snorkelling tours for cruise guests — reef stops, turtle sails and kayak combinations with honest wildlife caveats.', canonical: '/st-thomas-snorkeling-tours', ogImage: 'images/snorkeling-tour.jpg', schema: 'hub' },
  { file: 'private-st-thomas-tours.html', page: 'private', hero: 'partials/hero-private.html', trust: 'partials/trust-strip.html', content: 'content/private-st-thomas-tours.html', title: 'Private St Thomas Tours | Flexible Cruise-Day Island Touring', description: 'Private St Thomas tour options for cruise passengers — half-day vehicle, jeep-style touring and Sapphire beach focus with flexible pacing.', canonical: '/private-st-thomas-tours', ogImage: 'images/private-vip-island-tour.jpg', schema: 'hub' },
  { file: 'st-thomas-cruise-excursions-for-families.html', page: 'excursions', hero: 'partials/hero-families.html', trust: 'partials/trust-strip.html', content: 'content/st-thomas-cruise-excursions-for-families.html', title: 'St Thomas Cruise Excursions for Families | Beach & Easy Days', description: 'Family-friendly St Thomas cruise excursion ideas — calm beaches, shorter transfers and realistic pacing for a port day with children.', canonical: '/st-thomas-cruise-excursions-for-families', ogImage: 'images/magens-bay-beach.jpg', schema: 'article' },
  { file: 'st-thomas-shore-excursions-faq.html', page: 'excursions', hero: 'partials/hero-faq.html', trust: 'partials/trust-strip.html', content: 'content/st-thomas-shore-excursions-faq.html', title: 'St Thomas Shore Excursions FAQ | Cruise Passenger Answers', description: 'FAQ for St Thomas shore excursions — piers, timing, beaches, currency and how to plan a comfortable return to your cruise ship.', canonical: '/st-thomas-shore-excursions-faq', ogImage: 'images/cruise-port.jpg', schema: 'faq' },
  { file: 'st-thomas-tour-pages.html', page: 'excursions', hero: 'partials/hero-tour-hub.html', trust: 'partials/trust-strip.html', content: 'content/st-thomas-tour-pages.html', title: 'St Thomas Tour Pages | Compare Excursion Types', description: 'Browse St Thomas tour pages by type — beach, snorkel, private and sightseeing routes for cruise passengers.', canonical: '/st-thomas-tour-pages', ogImage: 'images/private-tour.jpg', schema: 'hub' },
  { file: 'st-thomas-resort-beach-day.html', page: 'beaches', hero: 'partials/hero-resort-beach.html', trust: 'partials/trust-strip.html', content: 'content/st-thomas-resort-beach-day.html', title: 'St Thomas Resort Beach Day | Editorial Cruise Beach Option', description: 'Editorial guide to a St Thomas resort-style beach day for cruise passengers — who it suits, timing and return planning.', canonical: '/st-thomas-resort-beach-day', ogImage: 'images/beach-excursion.jpg', schema: 'product' },
  { file: 'st-thomas-snorkel-with-turtles.html', page: 'snorkeling', hero: 'partials/hero-turtle-snorkel.html', trust: 'partials/trust-strip.html', content: 'content/st-thomas-snorkel-with-turtles.html', title: 'St Thomas Snorkel with Turtles | Editorial Sail Guide', description: 'Editorial guide to turtle snorkel sails from St Thomas — cruise suitability, wildlife honesty and shore-time considerations.', canonical: '/st-thomas-snorkel-with-turtles', ogImage: 'images/turtle-snorkel-st-thomas.jpg', schema: 'product' },
  { file: 'st-thomas-kayak-hike-snorkel-tour.html', page: 'snorkeling', hero: 'partials/hero-kayak-hike-snorkel.html', trust: 'partials/trust-strip.html', content: 'content/st-thomas-kayak-hike-snorkel-tour.html', title: 'St Thomas Kayak, Hike & Snorkel Tour | Editorial Guide', description: 'Editorial overview of a St Thomas kayak, hike and snorkel combination for active cruise passengers.', canonical: '/st-thomas-kayak-hike-snorkel-tour', ogImage: 'images/kayak-hike-snorkel-st-thomas.jpg', schema: 'product' },
  { file: 'st-thomas-kayak-snorkel-adventure.html', page: 'snorkeling', hero: 'partials/hero-kayak-snorkel.html', trust: 'partials/trust-strip.html', content: 'content/st-thomas-kayak-snorkel-adventure.html', title: 'St Thomas Kayak & Snorkel Adventure | Editorial Guide', description: 'Editorial guide to a St Thomas kayak and snorkel adventure for cruise guests who want time on the water.', canonical: '/st-thomas-kayak-snorkel-adventure', ogImage: 'images/kayak-hike-snorkel-st-thomas.jpg', schema: 'product' },
  { file: 'st-thomas-shopping-sightseeing-beach-tour.html', page: 'excursions', hero: 'partials/hero-shopping-sightseeing-beach.html', trust: 'partials/trust-strip.html', content: 'content/st-thomas-shopping-sightseeing-beach-tour.html', title: 'St Thomas Shopping, Sightseeing & Beach Tour | Editorial Guide', description: 'Editorial guide combining Charlotte Amalie sightseeing, shopping and beach time on a St Thomas cruise day.', canonical: '/st-thomas-shopping-sightseeing-beach-tour', ogImage: 'images/cruise-port.jpg', schema: 'product' },
  { file: 'private-st-thomas-half-day-tour.html', page: 'private', hero: 'partials/hero-private-half-day.html', trust: 'partials/trust-strip.html', content: 'content/private-st-thomas-half-day-tour.html', title: 'Private St Thomas Half-Day Tour | Flexible Cruise Option', description: 'Editorial guide to a private half-day St Thomas tour — viewpoints, beaches and flexible pacing for cruise schedules.', canonical: '/private-st-thomas-half-day-tour', ogImage: 'images/private-tour.jpg', schema: 'product' },
  { file: 'private-st-thomas-jeep-tour.html', page: 'private', hero: 'partials/hero-private-jeep.html', trust: 'partials/trust-strip.html', content: 'content/private-st-thomas-jeep-tour.html', title: 'Private St Thomas Jeep Tour | Island Roads & Viewpoints', description: 'Editorial guide to a private jeep-style St Thomas tour for cruise passengers who want island roads and viewpoints.', canonical: '/private-st-thomas-jeep-tour', ogImage: 'images/private-vip-island-tour.jpg', schema: 'product' },
  { file: 'private-sapphire-beach-tour-st-thomas.html', page: 'private', hero: 'partials/hero-private-sapphire.html', trust: 'partials/trust-strip.html', content: 'content/private-sapphire-beach-tour-st-thomas.html', title: 'Private Sapphire Beach Tour St Thomas | Editorial Guide', description: 'Editorial guide to a private Sapphire Beach focused St Thomas day for cruise passengers.', canonical: '/private-sapphire-beach-tour-st-thomas', ogImage: 'images/beach-excursion.jpg', schema: 'product' },
  { file: 'about.html', page: 'about', hero: '', trust: '', content: 'content/about.html', title: 'About | St Thomas Shore Excursions', description: 'About St Thomas Shore Excursions — independent cruise planning guidance for St Thomas, USVI. Not a cruise line or ticket marketplace.', canonical: '/about', ogImage: 'images/cruise-port.jpg', schema: 'about', mainPad: true },
  { file: 'contact.html', page: 'contact', hero: '', trust: '', content: 'content/contact.html', title: 'Contact | St Thomas Shore Excursions', description: 'Contact St Thomas Shore Excursions for independent cruise planning questions. Bookings and payments are not taken on this site.', canonical: '/contact', ogImage: 'images/cruise-port.jpg', schema: 'about', mainPad: true },
  { file: 'privacy.html', page: 'about', hero: '', trust: '', content: 'content/privacy.html', title: 'Privacy | St Thomas Shore Excursions', description: 'Privacy policy for St Thomas Shore Excursions, an editorial cruise planning website.', canonical: '/privacy', ogImage: 'images/cruise-port.jpg', schema: 'about', mainPad: true },
  { file: 'terms.html', page: 'about', hero: '', trust: '', content: 'content/terms.html', title: 'Terms of Use | St Thomas Shore Excursions', description: 'Terms of use for St Thomas Shore Excursions editorial cruise planning content.', canonical: '/terms', ogImage: 'images/cruise-port.jpg', schema: 'about', mainPad: true },
  { file: 'methodology.html', page: 'about', hero: '', trust: '', content: 'content/methodology.html', title: 'Methodology | St Thomas Shore Excursions', description: 'How St Thomas Shore Excursions frames editorial recommendations — no fake ratings, availability or guarantees.', canonical: '/methodology', ogImage: 'images/cruise-port.jpg', schema: 'about', mainPad: true },
];

const DOMAIN = 'https://stthomasshoreexcursion.com';

function read(rel) {
  const p = path.join(root, rel);
  if (!rel || !fs.existsSync(p)) return '';
  return fs.readFileSync(p, 'utf8');
}

function jsonLd(meta) {
  const url = DOMAIN + (meta.canonical === '/' ? '/' : meta.canonical);
  const graph = [
    {
      '@type': 'WebSite',
      name: 'St Thomas Shore Excursions',
      url: DOMAIN + '/',
      description: 'Independent planning guide for St Thomas cruise shore excursions',
    },
    {
      '@type': 'WebPage',
      name: meta.title,
      url,
      description: meta.description,
      isPartOf: { '@type': 'WebSite', name: 'St Thomas Shore Excursions', url: DOMAIN + '/' },
    },
  ];
  if (meta.schema === 'beaches' || meta.schema === 'port' || meta.schema === 'oneday' || meta.schema === 'home') {
    graph.push({
      '@type': 'TouristDestination',
      name: 'St Thomas',
      description: 'US Virgin Islands cruise port with beaches, snorkelling and island sightseeing',
      containedInPlace: { '@type': 'AdministrativeArea', name: 'US Virgin Islands' },
    });
  }
  if (meta.schema === 'faq') {
    // FAQPage only if page has visible FAQ — keep light; full FAQ lives in content
    graph.push({
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Which cruise pier will I use in St Thomas?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most ships use Havensight or Crown Bay. Confirm on your ship’s daily programme; assignments can change.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much shore time do I need for a beach day?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Allow transfer time both ways plus swimming time, and keep a conservative buffer before all aboard. Exact taxi times vary with traffic and pier.',
          },
        },
      ],
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

function shell(meta, parts) {
  const canon = DOMAIN + (meta.canonical === '/' ? '/' : meta.canonical);
  const ogImg = DOMAIN + '/' + meta.ogImage.replace(/^\//, '');
  const mainClass = meta.mainPad ? ' class="pt-16"' : '';
  const heroBlock = meta.hero
    ? `  <div id="page-hero" data-inlined="true">\n${parts.hero}\n  </div>\n`
    : '';
  const trustBlock = meta.trust
    ? `  <div id="page-trust-strip" data-inlined="true">\n${parts.trust}\n  </div>\n`
    : '';

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}" />
  <link rel="canonical" href="${canon}" />
  <link rel="preload" as="image" href="${meta.ogImage}" fetchpriority="high" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canon}" />
  <meta property="og:title" content="${meta.title}" />
  <meta property="og:description" content="${meta.description}" />
  <meta property="og:image" content="${ogImg}" />
  <meta property="og:site_name" content="St Thomas Shore Excursions" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${meta.title}" />
  <meta name="twitter:description" content="${meta.description}" />
  <meta name="twitter:image" content="${ogImg}" />

  <script type="application/ld+json">
${jsonLd(meta)}
  </script>

  <script src="https://cdn.tailwindcss.com"></script>
  <script src="js/tailwind-config.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/site.css" />
</head>
<body
  class="bg-white text-gray-800 antialiased"
  data-page="${meta.page}"
  data-base=""
  data-hero="${meta.hero || ''}"
  data-trust-strip="${meta.trust || ''}"
  data-content="${meta.content}"
>
  <div id="site-nav" data-inlined="true">
${parts.nav}
  </div>
${heroBlock}${trustBlock}  <main id="page-content" data-inlined="true"${mainClass}>
${parts.content}
  </main>
  <div id="site-footer" data-inlined="true">
${parts.footer}
  </div>
  <script src="js/site.js"></script>
</body>
</html>
`;
}

const nav = read('partials/nav.html');
const footer = read('partials/footer.html');

for (const meta of PAGES) {
  const parts = {
    nav,
    footer,
    hero: read(meta.hero),
    trust: read(meta.trust),
    content: read(meta.content),
  };
  if (!parts.content) {
    console.error('Missing content', meta.content);
    process.exit(1);
  }
  fs.writeFileSync(path.join(root, meta.file), shell(meta, parts));
  console.log('built', meta.file);
}

console.log('Build complete:', PAGES.length, 'pages');
