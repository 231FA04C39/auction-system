import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useCreateAuction } from "../hooks/useAuction.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import {
  getUploadSignature,
  uploadImageToCloudinary,
} from "../services/auction.service.js";

import { Card, CardContent } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";

export const CreateAuction = () => {
  useDocumentTitle("Create Auction");
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");
  const uploadedMetaRef = useRef({
    formId: "",
    public_id: "",
    secure_url: "",
  });

  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const [formData, setFormData] = useState({
    itemName: "",
    itemDescription: "",
    itemCategory: "",
    startingPrice: "",
    duration: "", 
  });

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const { mutate, isPending } = useCreateAuction({
    onSuccess: (data) => {
      setFormData({
        itemName: "",
        itemDescription: "",
        itemCategory: "",
        startingPrice: "",
        duration: "",
      });

      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
      setPreviewUrl("");
      setSelectedFileName("");
      setUploadProgress(0);
      setIsUploading(false);
      uploadedMetaRef.current = { formId: "", public_id: "", secure_url: "" };
      if (fileInputRef.current) fileInputRef.current.value = "";

      setError("");
      navigate(`/auction/${data.newAuction._id}`);
    },
    onError: (err) => setError(err?.response?.data?.message || "Something went wrong"),
  });

  const categories = [
    "Electronics", "Antiques", "Art", "Books", "Clothing", "Collectibles",
    "Home & Garden", "Jewelry", "Musical Instruments", "Sports", "Toys", "Vehicles", "Other"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const clearUploadedImage = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = "";
    setPreviewUrl("");
    setSelectedFileName("");
    setUploadProgress(0);
    setIsUploading(false);

    uploadedMetaRef.current = { formId: "", public_id: "", secure_url: "" };
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size / (1024 * 1024) > 5) {
      setError("File size must be less than 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError("");
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    
    const localPreview = URL.createObjectURL(file);
    previewUrlRef.current = localPreview;
    setPreviewUrl(localPreview);
    setSelectedFileName(file.name);

    uploadedMetaRef.current = { formId: "", public_id: "", secure_url: "" };
    setUploadProgress(0);
    setIsUploading(true);

    try {
      const signatureRes = await getUploadSignature();
      const signatureData = signatureRes?.data;
      if (!signatureData?.formId) throw new Error("Failed to initialize upload session");

      const uploadRes = await uploadImageToCloudinary({
        file,
        signatureData,
        onProgress: (percent) => setUploadProgress(percent),
      });

      if (!uploadRes?.public_id || !uploadRes?.secure_url) throw new Error("Cloud upload failed");

      uploadedMetaRef.current = {
        formId: signatureData.formId,
        public_id: uploadRes.public_id,
        secure_url: uploadRes.secure_url,
      };

      setUploadProgress(100);
    } catch (err) {
      uploadedMetaRef.current = { formId: "", public_id: "", secure_url: "" };
      setError(err?.response?.data?.message || err?.message || "Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const uploadMeta = uploadedMetaRef.current;
    if (!uploadMeta.formId || !uploadMeta.public_id || !uploadMeta.secure_url) {
      setError(isUploading ? "Image upload is in progress. Please wait." : "Please upload an image first.");
      return;
    }

    const dur = parseInt(formData.duration || 60);
    if (dur < 1 || dur > 1440) {
      setError("Duration must be between 1 and 1440 minutes.");
      return;
    }

    mutate({
      ...formData,
      formId: uploadMeta.formId,
      public_id: uploadMeta.public_id,
      secure_url: uploadMeta.secure_url,
    });
  };

  const submitDisabled = isPending || isUploading;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <button onClick={() => navigate(-1)} type="button" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition mb-6 group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Auction</h1>
          <p className="text-sm text-gray-500 mt-1">List an item for bidding</p>
        </div>

        <Card padding="p-6 sm:p-8">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Item Name"
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="e.g. Vintage mechanical watch"
                required
              />

              <div>
                <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  id="itemDescription"
                  name="itemDescription"
                  value={formData.itemDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-lg border bg-white px-4 py-2 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 placeholder:text-gray-400 border-gray-200 resize-vertical"
                  placeholder="Describe condition, features, and any relevant details"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="itemCategory" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <select
                    id="itemCategory"
                    name="itemCategory"
                    value={formData.itemCategory}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border bg-white px-4 py-2 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 placeholder:text-gray-400 border-gray-200"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="relative">
                  <Input
                    label="Starting Price (Rs)"
                    type="number"
                    id="startingPrice"
                    name="startingPrice"
                    value={formData.startingPrice}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                    placeholder="100"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Auction Duration (Minutes)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[1, 5, 10, 60, 1440].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setFormData({ ...formData, duration: mins })}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                        Number(formData.duration) === mins
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {mins === 60 ? "1 hr" : mins === 1440 ? "24 hr" : `${mins} min`}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="Custom duration in minutes (e.g. 120)"
                  min="1"
                  max="1440"
                />
                <p className="text-sm font-medium text-indigo-600 mt-2 bg-indigo-50 px-3 py-2 rounded-lg inline-block">
                  {formData.duration 
                    ? `Auction will end at: ${new Date(Date.now() + formData.duration * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
                    : "Default: 1 hour (Ends at: " + new Date(Date.now() + 60 * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ")"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo</label>
                {!previewUrl ? (
                  <label htmlFor="itemPhoto" className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100/60 hover:border-gray-300 transition-colors">
                    <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-400">Click to upload image</p>
                    <p className="text-xs text-gray-300 mt-1">Max 5 MB</p>
                    <input type="file" id="itemPhoto" name="itemPhoto" onChange={handleFileChange} ref={fileInputRef} accept="image/*" className="hidden" disabled={isUploading} />
                  </label>
                ) : (
                  <div className="relative inline-block">
                    <img src={previewUrl} alt="Preview" className="w-44 h-44 object-cover rounded-2xl border border-gray-200" />
                    <button type="button" onClick={clearUploadedImage} className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-red-50 hover:border-red-200 transition">
                      <svg className="w-4 h-4 text-gray-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

              <div className="pt-4 border-t border-gray-100">
                <Button type="submit" disabled={submitDisabled} size="lg">
                  {isUploading ? "Uploading..." : isPending ? "Creating..." : "Create Auction"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <HelpSection />
      </div>
    </div>
  );
};

export const HelpSection = () => {
  const tips = [
    "Use clear, high-quality photos showing your item from multiple angles",
    "Write detailed descriptions including condition, dimensions, and flaws",
    "Set a reasonable starting price to attract bidders",
    "3-7 day auction duration typically works best",
    "Select the most accurate category to help buyers find your item",
  ];

  return (
    <div className="mt-6 bg-amber-50/60 border border-amber-100 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-amber-800 mb-3">
        Tips for a successful listing
      </h3>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
            <span className="text-amber-400 mt-0.5">&#10148;</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};
