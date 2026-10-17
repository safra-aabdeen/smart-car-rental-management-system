import localCars from "../data/Cars";

function extractFilename(pathStr) {
  if (!pathStr || typeof pathStr !== "string") return "";
  return pathStr
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    .trim();
}

/**
 * Returns a valid, resolved image URL for a car in development and production builds.
 * Supports Firestore documents, localCars items, and direct image paths.
 * 
 * @param {Object|string} carOrImageOrName - Car object, image path, or car name
 * @returns {string} Fully resolved image URL
 */
export function getCarImage(carOrImageOrName) {
  if (!carOrImageOrName) return localCars[0]?.image || "/images/Home-image.jpg";

  let carName = "";
  let imageField = "";

  if (typeof carOrImageOrName === "object") {
    carName = carOrImageOrName.name || carOrImageOrName.carName || "";
    imageField = carOrImageOrName.image || carOrImageOrName.carImage || "";
  } else if (typeof carOrImageOrName === "string") {
    if (
      carOrImageOrName.includes("/") ||
      carOrImageOrName.includes("\\") ||
      carOrImageOrName.includes(".") ||
      carOrImageOrName.startsWith("http") ||
      carOrImageOrName.startsWith("data:")
    ) {
      imageField = carOrImageOrName;
    } else {
      carName = carOrImageOrName;
    }
  }

  // 1. External URLs or Data URLs
  if (
    typeof imageField === "string" &&
    (imageField.startsWith("http://") ||
      imageField.startsWith("https://") ||
      imageField.startsWith("data:") ||
      imageField.startsWith("blob:"))
  ) {
    return imageField;
  }

  // 2. Vite Bundled Asset (contains /assets/ or assets/)
  if (
    typeof imageField === "string" &&
    (imageField.startsWith("/assets/") || imageField.includes("assets/"))
  ) {
    return imageField;
  }

  // 3. Match by Car Name in localCars
  if (carName) {
    const normalizedName = carName.trim().toLowerCase();
    const matchedByName = localCars.find(
      (c) => c.name && c.name.trim().toLowerCase() === normalizedName
    );
    if (matchedByName?.image) {
      return matchedByName.image;
    }
  }

  // 4. Match by Filename in localCars
  const filename = extractFilename(imageField);
  if (filename) {
    const matchedByFile = localCars.find((c) => {
      const localFile = extractFilename(c.image);
      return localFile && localFile.toLowerCase() === filename.toLowerCase();
    });
    if (matchedByFile?.image) {
      return matchedByFile.image;
    }

    // Try matching partial name from filename (e.g. Honda-FitzBE -> Honda Fitz)
    const cleanBasename = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").toLowerCase();
    const matchedByBasename = localCars.find((c) => {
      const cNorm = c.name.toLowerCase().replace(/[-_]/g, " ");
      return cleanBasename.includes(cNorm) || cNorm.includes(cleanBasename);
    });
    if (matchedByBasename?.image) {
      return matchedByBasename.image;
    }

    // 5. Fallback to public static copy
    return `/images/${filename}`;
  }

  // 6. Final fallback
  return localCars[0]?.image || "/images/Home-image.jpg";
}

export default getCarImage;
