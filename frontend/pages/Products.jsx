import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // GET PRODUCTS
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/products`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load products"
        );
      }

      setProducts(
        Array.isArray(data.products)
          ? data.products
          : []
      );

    } catch (error) {
      console.error(
        "Fetch products error:",
        error
      );

      setError(error.message);

    } finally {
      setLoading(false);
    }
  };


  // LOAD PRODUCTS
  useEffect(() => {
    fetchProducts();
  }, []);


  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };


  // LOADING
  if (loading) {
    return (
      <div className="products-page">
        <h2>Loading products...</h2>
      </div>
    );
  }


  return (
    <div className="products-page">

      <header className="products-header">

        <h1>ProductHub</h1>

        <div>

          <Link to="/upload">
            <button type="button">
              Upload Product
            </button>
          </Link>

          <button
            type="button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ERROR */}

      {error && (
        <p className="error">
          {error}
        </p>
      )}


      {/* NO PRODUCTS */}

      {!error && products.length === 0 && (
        <p>
          No products uploaded yet.
        </p>
      )}


      {/* PRODUCTS */}

      {products.length > 0 && (
        <div className="products-grid">

          {products.map((product) => (

            <div
              className="product-card"
              key={product.Id}
            >

              {/* IMAGE */}

              {product.Image && (
                <img
                  src={product.Image}
                  alt={product.Name}
                />
              )}


              {/* CONTENT */}

              <div className="product-content">

                <h2>
                  {product.Name}
                </h2>

                <p>
                  {product.Description}
                </p>


                {/* PDF */}

                {product.Pdf && (
                  <a
                    href={product.Pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View PDF
                  </a>
                )}

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}