# Cloudinary Configuration & Photo Management Guide

This guide explains how to configure Cloudinary to store and protect your family photographs so that unauthorized users cannot bypass the application and access raw image URLs directly.

---

## 1. Cloudinary Account & API Credentials

1. Log in to your [Cloudinary Console](https://console.cloudinary.com/).
2. From the **Dashboard** (or **Settings > Access Keys**), note down the following credentials:
   - **Cloud Name** (`CLOUDINARY_CLOUD_NAME`)
   - **API Key** (`CLOUDINARY_API_KEY`)
   - **API Secret** (`CLOUDINARY_API_SECRET`)

Keep your API Secret strictly private. It must only be configured in environment variables / Cloudflare secrets on the server.

---

## 2. Preventing Direct Public URL Access (Securing Photographs)

By default in Cloudinary, assets uploaded with the standard `upload` type are accessible through predictable public URLs like `https://res.cloudinary.com/<cloud_name>/image/upload/<public_id>`.

To prevent unauthorized users from discovering or directly loading your private family photographs, configure Cloudinary and this gallery using **Authenticated Asset Delivery**:

### Option A: Authenticated Delivery Type (Recommended)

1. When uploading photos in Cloudinary, set the delivery type to **`authenticated`** (or **`private`**).
   - In Cloudinary Media Library: Select upload options -> Delivery type: **Authenticated**.
   - Or via API: `{ type: "authenticated" }`.
2. When delivery type is `authenticated`:
   - Cloudinary blocks all direct public requests (`401 Unauthorized` / `404 Not Found`).
   - The photo can only be accessed using a cryptographic signature signed by your `CLOUDINARY_API_SECRET` or via authorized API calls.
3. Set in your `.env.local` or Cloudflare Secrets:
   ```env
   CLOUDINARY_DELIVERY_TYPE="authenticated"
   ```
4. Our application automatically handles this:
   - The gallery communicates with Cloudinary using signed requests and basic authentication.
   - Images are delivered to authenticated family members through the secure streaming proxy (`/api/photos/[...id]`).
   - Any external user attempting to access the photo without a valid session cookie is rejected with `401 Unauthorized`.

### Option B: Cloudinary Strict Transformations & URL Signing

1. Go to **Settings > Security** in your Cloudinary console.
2. Under **Restricted media types**, check **Strict transformations**.
3. Enable **Signed URLs only**.
4. This ensures that any attempt to alter transformations or load unauthorized URLs is rejected by Cloudinary.

---

## 3. Managing Family Photos in Cloudinary

### Organizing into Folders

It is recommended to place all family album photos inside a dedicated folder:

1. In the Cloudinary Media Library, create a folder named `family-album` (or your preferred name).
2. Set the folder name in your environment:
   ```env
   CLOUDINARY_FOLDER="family-album"
   ```
3. You can organize subfolders (e.g. `family-album/2024-vacation`, `family-album/birthdays`). The gallery recursively retrieves photos from the folder.

### Adding Captions, Titles, and Metadata

The gallery automatically displays captions and capture dates underneath photos and inside the full-screen lightbox:

1. In the Cloudinary Media Library, click on any image to open its details panel.
2. In the **Context / Metadata** tab:
   - Add a **Caption** or **Title**: This will appear as the caption in the gallery.
   - Add an **Alt** description: Used for screen reader accessibility.
3. EXIF metadata (date taken, dimensions) is automatically preserved by Cloudinary and used to display the photo capture date.

### Uploading New Photos

You can add photographs at any time using:
- **Cloudinary Web Console**: Drag and drop images directly into the `family-album` folder.
- **Cloudinary Mobile App**: Upload photos directly from your phone into Cloudinary.
- **Cloudinary CLI or API**: For batch uploads from local hard drives.

New photos will appear in your gallery within 60 seconds (due to server cache revalidation).
