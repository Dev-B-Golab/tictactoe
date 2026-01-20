# 🎮 Tic Tac Toe

A modern, interactive Tic Tac Toe game built with Vue. js 3, featuring real-time multiplayer capabilities powered by Socket.io.

![Vue.js](https://img.shields.io/badge/Vue.js-3.3.11-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0.11-646CFF?style=flat-square&logo=vite&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7.4-010101? style=flat-square&logo=socket.io&logoColor=white)

## ✨ Features

- 🎯 **Classic Gameplay** - Traditional Tic Tac Toe rules
- 🌐 **Real-time Multiplayer** - Play with friends using Socket.io
- 🎨 **Modern UI** - Clean and responsive design
- ⚡ **Fast Performance** - Built with Vite for optimal speed
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔄 **State Management** - Powered by Vuex for reliable game state

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
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

### Preview Production Build

```bash
npm run preview
```

## 🛠️ Tech Stack

- **Framework**: [Vue.js 3](https://vuejs.org/) - Progressive JavaScript framework
- **Build Tool**: [Vite](https://vitejs.dev/) - Next generation frontend tooling
- **Router**: [Vue Router 4](https://router.vuejs.org/) - Official routing library
- **State Management**: [Vuex 4](https://vuex.vuejs.org/) - State management pattern
- **Real-time Communication**: [Socket.io 4](https://socket.io/) - Bidirectional event-based communication

## 📁 Project Structure

```
tictactoe/
├── public/          # Static assets
├── src/
│   ├── assets/      # Styles, images, and other assets
│   ├── components/  # Vue components
│   ├── router/      # Vue Router configuration
│   ├── views/       # Page components
│   ├── App.vue      # Root component
│   └── main. js      # Application entry point
├── index.html       # HTML template
├── package.json     # Project dependencies
└── vite.config.js   # Vite configuration
```

## 🎮 How to Play

1. Choose to play against a friend (multiplayer mode)
2. Players take turns marking spaces on the 3×3 grid
3. The first player to get three marks in a row (horizontally, vertically, or diagonally) wins
4. If all spaces are filled without a winner, the game ends in a draw

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

