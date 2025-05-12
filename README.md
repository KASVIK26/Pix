# Pix 📸

Pix is a React Native application built with [Expo](https://expo.dev) that allows users to explore and download high-quality images from the Pixabay API. The app features a clean and responsive UI, filters, categories, and search functionality to enhance the user experience.

---

## Features ✨

- **Search Images**: Search for high-quality images using keywords.
- **Categories**: Browse images by predefined categories.
- **Filters**: Apply filters like orientation, type, and colors to refine your search.
- **Image Grid**: View images in a responsive masonry grid layout.
- **Download & Share**: Download images or share them directly from the app.
- **Responsive Design**: Optimized for phones, tablets, and desktops.
- **Smooth Animations**: Includes animations for a delightful user experience.

---

## Screenshots 📱

> Add screenshots of your app here.

- **Welcome Screen**  
  ![Welcome Screen](placeholder-for-image)

- **Home Screen**  
  ![Home Screen](placeholder-for-image)

- **Filters Modal**  
  ![Filters Modal](placeholder-for-image)

- **Image Details**  
  ![Image Details](placeholder-for-image)

---

## Installation 🛠️

Follow these steps to set up the project locally:

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd Pix
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npx expo start
   ```

4. Open the app on your device using:
   - [Expo Go](https://expo.dev/client) for iOS/Android.
   - Android Emulator or iOS Simulator.

---

## Usage 🚀

1. Launch the app.
2. Use the search bar to find images by keywords.
3. Browse images by categories or apply filters.
4. Tap on an image to view details, download, or share it.

---

## Project Structure 📂

```
Pix/
├── app/                # Main app directory with screens and layouts
│   ├── _layout.js      # Root layout for navigation
│   ├── index.js        # Welcome screen
│   └── home/           # Home screen and related components
├── components/         # Reusable UI components
├── constants/          # App-wide constants (e.g., theme, data)
├── helpers/            # Utility functions
├── api/                # API integration with Pixabay
├── assets/             # Images, fonts, and other static assets
├── scripts/            # Utility scripts (e.g., reset-project.js)
├── android/            # Android-specific files
├── .vscode/            # VSCode settings
├── package.json        # Project metadata and dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

---

## API Integration 🌐

This app uses the [Pixabay API](https://pixabay.com/api/docs/) to fetch images. The API key is stored in the [`api/index.js`](api/index.js) file.

---

## Scripts 🛠️

- **Start the app**: `npm start`
- **Run on Android**: `npm run android`
- **Run on iOS**: `npm run ios`
- **Run on Web**: `npm run web`
- **Reset the project**: `npm run reset-project`

---

## Technologies Used 🛠️

- **React Native**: For building the mobile app.
- **Expo**: For development and deployment.
- **Axios**: For API calls.
- **React Navigation**: For navigation.
- **React Native Reanimated**: For animations.
- **Gorhom Bottom Sheet**: For the filters modal.
- **Shopify FlashList**: For the masonry grid layout.

---

## Customization 🖌️

### Theme
The app's theme is defined in [`constants/theme.js`](constants/theme.js). You can customize colors, font sizes, and other styles here.

### Filters
Filters and categories are defined in [`constants/data.js`](constants/data.js). You can add or modify filters as needed.

---

## Contributing 🤝

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request.

---

## License 📄

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact 📧

For any questions or feedback, feel free to reach out:

- **Email**: [your-email@example.com](mailto:your-email@example.com)
- **GitHub**: [Your GitHub Profile](https://github.com/your-profile)

---

## Acknowledgments 🙏

- [Pixabay](https://pixabay.com) for providing the API.
- [Expo](https://expo.dev) for the development platform.
- [React Native](https://reactnative.dev) for the framework.

---

> Add any additional sections or details as needed.
