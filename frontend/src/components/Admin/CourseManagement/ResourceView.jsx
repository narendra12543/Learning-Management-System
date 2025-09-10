import React from "react";
import {
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  File as FileIcon, // rename to avoid confusion with the global File type
} from "lucide-react";

const getFileIcon = (fileUrl) => {
  if (!fileUrl) return <FileIcon className="text-gray-400" size={20} />;
  const ext = fileUrl.split(".").pop().toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext))
    return <FileImage className="text-blue-500" size={20} />;
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext))
    return <FileVideo className="text-red-500" size={20} />;
  if (["pdf", "doc", "docx", "txt", "ppt", "pptx"].includes(ext))
    return <FileText className="text-green-500" size={20} />;
  if (["zip", "rar", "7z"].includes(ext))
    return <FileArchive className="text-yellow-500" size={20} />;

  return <FileIcon className="text-gray-400" size={20} />;
};

const ResourceView = ({ course }) => {
  const resources = Array.isArray(course?.resources) ? course.resources : [];

  return (
    <div className="p-4">
      <h4 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        📂 Course Resources
      </h4>

      {resources.length > 0 ? (
        // Fixed/Responsive height + scrolling regardless of parent
        <div className="relative">
          <div
            className="h-64 md:max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar"
            // fallback in case arbitrary values aren't working in your Tailwind build:
            style={{ maxHeight: "50vh" }}
          >
            <ul className="space-y-4">
              {resources.map((res, idx) => (
                <li
                  key={res._id || idx}
                  className="flex items-start gap-3 p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition"
                >
                  <div className="flex-shrink-0">{getFileIcon(res.fileUrl)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {res.title || "Untitled Resource"}
                    </p>

                    {res.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
                        {res.description}
                      </p>
                    )}

                    {res.fileUrl && (
                      <a
                        href={`${import.meta.env.VITE_API_URL}${res.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
                      >
                        View File
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          No resources available for this course.
        </p>
      )}
    </div>
  );
};

export default ResourceView;
