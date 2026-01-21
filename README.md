# M3U8 Sniffer

A lightweight Chrome Extension designed to automatically detect and collect `.m3u8` (HLS) streaming URLs from network requests as you browse and play videos.

## Features

- 🕵️ **Automatic Detection**: Passive background listener that captures `.m3u8` requests in real-time.
- 📋 **One-Click Copy**: Easily copy captured URLs to your clipboard.
- 🧹 **History Management**: Simple list view with a "Clear History" button.
- 🚀 **Minimalist UI**: Clean, distraction-free popup interface.
- 🔒 **Privacy Focused**: No external analytics, no HTML crawling, and runs entirely locally.

## Installation

Since this is a developer extension (not yet on the Chrome Web Store), you need to install it in "Developer Mode".

1.  Clone or download this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Toggle **Developer mode** in the top right corner.
4.  Click the **Load unpacked** button.
5.  Select the `m3u8_collector` folder from this repository.
6.  The extension icon should appear in your browser toolbar.

## Usage

1.  **Pin the Extension**: Pin the "M3U8 Sniffer" icon to your toolbar for easy access.
2.  **Play a Video**: Navigate to a website and play a video that uses HLS streaming (e.g., live streams, VODs).
3.  **Check the List**: Click the extension icon. If an `.m3u8` request was made, it will appear in the list.
4.  **Copy URL**: Click on any URL in the list to copy it to your clipboard.

## Permissions Explained

-   **`webRequest`**: Required to listen to network traffic in the background to identify requests ending in `.m3u8`.
-   **`storage`**: Used to save the list of captured URLs locally so they persist when you close the popup.
-   **`host_permissions` (`<all_urls>`)**: Necessary to allow the `webRequest` API to function across all websites where you might play a video.

## Disclaimer

This tool is for educational and testing purposes only. It does not bypass DRM, decrypt protected content, or perform any illegal activities. It simply logs public network requests made by your browser.
