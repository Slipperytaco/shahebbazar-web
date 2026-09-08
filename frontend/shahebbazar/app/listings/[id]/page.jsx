export default async function ListingPage({ params }) {
  // Fix: unwrap params (it's a Promise in async pages)
  const { id: listingId } = await params;

  console.log("Listing ID:", listingId);
  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

  // Fetch listing data
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${listingId}`);
  const data = await res.json();
  const listing = data.listing;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.photos?.map(p => p.photo_url),
    offers: {
      "@type": "Offer",
      priceCurrency: "AUD",
      price: listing.price,
      availability: "https://schema.org/InStock"
    }
  };
return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />

    <div className="page-center">
      <h1 className="text-2xl font-bold">{listing.title}</h1>
      <p className="text-gray-300 mt-2">{listing.description}</p>

      <div className="mt-6 space-y-2 text-gray-400">
        <p><strong>Price:</strong> ${listing.price}</p>
        <p><strong>Category:</strong> {listing.category}</p>
        <p><strong>Vendor ID:</strong> {listing.vendor_id}</p>
        <p><strong>Listing ID:</strong> {listing.listing_id}</p>
        <p><strong>Created:</strong> {new Date(listing.created_at).toLocaleString()}</p>

      </div>
        {listing.photos?.length > 0 && (
        <div className="mt-6 space-y-4">
            {listing.photos.map((photo, i) => (
            <img
                key={i}
                src={photo.photo_url}
                alt="Listing photo"
                className="rounded-md w-full max-w-lg h-64 object-cover"
            />
            ))}
        </div>
        )}

    </div>
  </>
);
}
