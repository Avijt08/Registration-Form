import { v2 as cloudinary } from 'cloudinary';

(async function () {
    try {
        // Cloudinary configuration
        cloudinary.config({
            cloud_name: "dfl7exztb",
            api_key: "229896612154869",
            api_secret: "CfuGkcYcP0h0WjXMnY3Z7IcrYJM",
            secure: true
        });

        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload('./image.png', {
            public_id: "image"
        });

        console.log("Upload Result:", uploadResult);

        // Generate optimized URL
        const optimizeURL = cloudinary.url("image", {
            fetch_format: 'auto',
            quality: 'auto'
        });

        console.log("Optimized URL:", optimizeURL);

        // Generate auto-cropped URL
        const autoCropURL = cloudinary.url("image", {
            crop: 'auto',
            gravity: 'auto',
            width: 500,
            height: 500,
        });

        console.log("Auto-Crop URL:", autoCropURL);
    } catch (error) {
        console.error("Error:", error);
    }
})();