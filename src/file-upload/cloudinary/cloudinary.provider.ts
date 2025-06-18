import { v2 as cloudinary } from "cloudinary";

import { ONLY_USE_OUTSIDE_NEST_SERVICE_ENV } from "@/env";

export const CloudinaryProvider = {
  provide: "CLOUDINARY",
  useFactory: () => {
    cloudinary.config({
      cloud_name: ONLY_USE_OUTSIDE_NEST_SERVICE_ENV.CLOUDINARY_CLOUD_NAME,
      api_key: ONLY_USE_OUTSIDE_NEST_SERVICE_ENV.CLOUDINARY_API_KEY,
      api_secret: ONLY_USE_OUTSIDE_NEST_SERVICE_ENV.CLOUDINARY_API_SECRET,
    });

    return cloudinary;
  },
};
