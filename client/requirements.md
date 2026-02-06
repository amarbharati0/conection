## Packages
framer-motion | Complex page transitions and polished micro-interactions
recharts | Visualizing candidate progress and attendance stats
react-webcam | Capturing live photos for attendance verification
date-fns | Formatting timestamps for tasks and attendance

## Notes
- The "Live Photo" feature for attendance requires camera permissions (handled by react-webcam).
- File uploads for task proof (photo/video) will simulate an upload process and return ObjectURLs for the MVP since a specific file upload endpoint wasn't detailed in the schema beyond string URLs.
- Admin login is hardcoded to specific credentials in the requirements, but will flow through the standard auth API which is expected to validate it.
