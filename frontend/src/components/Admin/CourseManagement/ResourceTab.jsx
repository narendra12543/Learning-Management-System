import React, { useState } from "react";
import toast from "react-hot-toast";
import { Upload, Trash } from "lucide-react";

const ResourceTab = ({ course, onAdd, onDelete }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || files.length === 0) {
      toast.error("Title and at least one file are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    files.forEach((file) => formData.append("resources", file));

    try {
      await onAdd(course._id, formData);
      toast.success("Resources added successfully");
      setTitle("");
      setDescription("");
      setFiles([]);
    } catch {
      toast.error("Failed to add resources");
    }
  };

  return (
    <div className="p-4">
      <h4 className="text-lg font-semibold mb-3">Course Resources</h4>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="flex flex-col gap-3 mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
      >
        <input
          type="text"
          placeholder="Resource Title"
          className="px-3 py-2 border rounded-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description (optional)"
          className="px-3 py-2 border rounded-lg"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files))}
          className="px-3 py-2 border rounded-lg"
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Upload size={18} /> Upload Resources
        </button>
      </form>

      {/* Existing Resources */}
      {course.resources && course.resources.length > 0 ? (
        <ul className="space-y-3">
          {course.resources.map((res) => (
            <li
              key={res._id}
              className="flex justify-between items-center p-3 border rounded-lg bg-white dark:bg-gray-700"
            >
              <div>
                <p className="font-medium">{res.title}</p>
                {res.description && (
                  <p className="text-sm text-gray-500">{res.description}</p>
                )}
                {res.fileUrl && (
                  <a
                    href={`${import.meta.env.VITE_API_URL}${res.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm"
                  >
                    View File
                  </a>
                )}
              </div>
              <button
                onClick={() => onDelete(course._id, res._id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash size={18} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No resources added yet.</p>
      )}
    </div>
  );
};

export default ResourceTab;
