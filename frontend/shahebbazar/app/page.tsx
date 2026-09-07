export default function HomePage() {
  return (
    <div className="page-center">
      <div className="form-card">
        <h2 className="form-title">Welcome</h2>
        <p className="text-gray-400 text-sm mt-2">
          Choose an option below to continue.
        </p>

        <div className="flex flex-col gap-3 mt-6">
          <a href="/vendors/register" className="form-button-primary text-center">
            Register Vendor
          </a>

          <a href="/vendors" className="form-button-primary text-center">
            View Vendors
          </a>

          <a href="/search" className="form-button-primary text-center">
            Search Vendors
          </a>
        </div>
      </div>
    </div>
  );
}
