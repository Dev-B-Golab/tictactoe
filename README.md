# 🎮 Tic Tac Toe

An arcade-style Tic Tac Toe game built with Vue.js 3 — play against a friend on the same device or challenge an AI with four difficulty levels.

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=flat-square&logo=vite&logoColor=white)

## ✨ Features

- 🎯 **Classic Gameplay** - Traditional Tic Tac Toe rules
- 🤖 **VS Computer** - Four AI levels: Easy, Medium, Hard and Impossible (unbeatable minimax)
- 👥 **2 Players** - Local hot-seat mode on one device
- 🔁 **Fair Rounds** - The starting player alternates every round
- 💾 **Saved Progress** - Names, settings and scores survive a page refresh
- 📱 **Mobile First** - Board scales to fit any screen, touch friendly
- ♿ **Accessible** - Keyboard playable, screen-reader labels, respects reduced motion

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher (20+ recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dev-B-Golab/tictactoe.git
   cd tictactoe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📦 Build for Production

```bash
npm run build
```

The optimized production files will be generated in the `dist` folder.

### Run Tests

```bash
npm test
```

### Preview Production Build

```bash
npm run preview
```

## 🛠️ Tech Stack

- **Framework**: [Vue.js 3](https://vuejs.org/) - Progressive JavaScript framework
- **Build Tool**: [Vite](https://vitejs.dev/) - Next generation frontend tooling
- **Router**: [Vue Router 4](https://router.vuejs.org/) - Official routing library
- **State Management**: [Pinia](https://pinia.vuejs.org/) - Official Vue store
- **Testing**: [Vitest](https://vitest.dev/) - Unit tests for the game logic and AI

## 📁 Project Structure

```
tictactoe/
├── public/          # Static assets
├── src/
│   ├── assets/      # Styles, images, and other assets
│   ├── components/  # Vue components
│   ├── game/        # Pure game logic & AI (+ tests)
│   ├── router/      # Vue Router configuration
│   ├── stores/      # Pinia stores (persisted to localStorage)
│   ├── views/       # Page components
│   ├── App.vue      # Root component
│   └── main.js      # Application entry point
├── index.html       # HTML template
├── package.json     # Project dependencies
└── vite.config.js   # Vite configuration
```

## 🎮 How to Play

1. Choose to play against the computer or a friend
2. Enter player names (and pick a difficulty when playing the computer)
3. Players take turns marking spaces on the 3×3 grid
4. The first player to get three marks in a row (horizontally, vertically, or diagonally) wins
5. If all spaces are filled without a winner, the game ends in a draw

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  Feel free to check the [issues page](https://github.com/Dev-B-Golab/tictactoe/issues).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Dev-B-Golab**

- GitHub: [@Dev-B-Golab](https://github.com/Dev-B-Golab)
- Repository: [tictactoe](https://github.com/Dev-B-Golab/tictactoe)

## ⭐ Show your support

Give a ⭐️ if you like this project!

---

<p align="center">Made with ❤️ and Vue.js</p>

