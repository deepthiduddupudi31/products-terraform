import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function UploadProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: null,
    pdf: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter product name");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter product description");
      return;
    }

    if (!form.image) {
      setError("Please select a product image");
      return;
    }

    if (!form.pdf) {
      setError("Please select a product PDF");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("image", form.image);
      formData.append("pdf", form.pdf);

      const response = await fetch(
        `${API_URL}/api/products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to upload product"
        );
      }

      alert("Product uploaded successfully!");

      navigate("/products");

    } catch (error) {
      console.error("Upload product error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>Upload Product</h1>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
          />

          <textarea
            name="description"
            placeholder="Product Description"
            value={form.description}
            onChange={handleChange}
            rows="5"
            disabled={loading}
          />

          <label>Product Image</label>

          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            disabled={loading}
          />

          <label>Product PDF</label>

          <input
            type="file"
            name="pdf"
            accept="application/pdf"
            onChange={handleChange}
            disabled={loading}
          />

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Product"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/products")}
            disabled={loading}
          >
            Back to Products
          </button>

        </form>

      </div>
    </div>
  );
}