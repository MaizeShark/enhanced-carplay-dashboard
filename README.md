# Enhanced CarPlay Dashboard

A modern, hybrid car dashboard interface built on top of the excellent [node-CarPlay](https://github.com/rhysmorgan134/node-CarPlay) project.

## 🚗 Features

### Modern Hybrid Dashboard
- **Digital displays** instead of traditional gauges
- **Hybrid-specific data**: Battery level, electric range, fuel efficiency
- **Real-time updates**: Live time/date display
- **Static car data**: No distracting random changes
- **Glass-morphism design**: Modern, translucent cards with blur effects

### Smart CarPlay Integration
- **Seamless toggle** between CarPlay and dashboard when connected
- **Beautiful waiting screen** when CarPlay is disconnected
- **Professional connection interface** with status indicators
- **Bottom-right toggle button** for easy access while driving

### Car-Optimized Design
- **Dark theme** perfect for car environments
- **High contrast** for excellent readability
- **Touch-friendly** interface with large buttons
- **Responsive layout** that works on various screen sizes

## 🎨 Dashboard Data

- **Speed**: Current vehicle speed (0 MPH when parked)
- **Gear**: Current transmission gear (P for Park)
- **Fuel Level**: 78% with gradient progress bar
- **Battery**: 85% hybrid battery with visual indicator
- **Engine Temperature**: 92°F monitoring
- **Total Range**: 420 miles (combined gas + electric)
- **Electric Range**: 45 miles on battery alone
- **Average MPG**: 52.3 (typical for hybrid vehicles)
- **Hybrid Mode**: ECO mode indicator
- **System Status**: Real-time status of all car systems

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/kadirgecit/enhanced-carplay-dashboard.git
   cd enhanced-carplay-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd examples/carplay-web-app
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the dashboard

## 🎯 Usage

### When CarPlay is Disconnected
- Beautiful hybrid dashboard with all car data
- "Connect Device" button to initiate CarPlay connection
- Real-time system status indicators

### When CarPlay is Connected
- Toggle button appears in bottom-right corner
- Switch between "🚗 Dashboard" and "📱 CarPlay" views
- Seamless transition between interfaces

## 🛠 Technology Stack

- **React** with TypeScript
- **CSS3** with modern features (backdrop-filter, gradients)
- **SVG** icons for crisp graphics
- **WebRTC** for CarPlay communication (from original project)

## 📱 Perfect for

- **Hybrid vehicles** (Toyota Prius, Honda Accord Hybrid, etc.)
- **Car infotainment systems**
- **Raspberry Pi car computers**
- **Custom automotive displays**

## 🎨 Design Philosophy

- **No traditional gauges**: Modern digital displays only
- **Static data**: Stable information that doesn't distract
- **Hybrid-focused**: Designed specifically for hybrid vehicles
- **Car-optimized**: Easy to use while driving

## 📸 Screenshots

The dashboard features a beautiful dark theme with:
- Animated background particles
- Glass-morphism data cards
- Color-coded information (green for battery, cyan for electric range)
- Professional typography and spacing

## 🙏 Credits

This enhanced dashboard is built upon the excellent work of:

### Original node-CarPlay Project
- **Repository**: [rhysmorgan134/node-CarPlay](https://github.com/rhysmorgan134/node-CarPlay)
- **Creator**: [Rhys Morgan](https://github.com/rhysmorgan134)
- **Description**: The core CarPlay implementation that makes this project possible

### Enhancements by
- **Developer**: Kadir Gecit
- **Email**: gecit.kadir@icloud.com
- **Enhancements**: Modern dashboard UI, hybrid car features, toggle functionality

## 📄 License

This project maintains the same license as the original node-CarPlay project. Please refer to the original repository for licensing details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⭐ Show Your Support

If you find this project useful, please consider:
- Starring this repository
- Starring the [original node-CarPlay repository](https://github.com/rhysmorgan134/node-CarPlay)
- Sharing with others who might benefit from it

---

**Note**: This is an enhanced version of the original node-CarPlay project with a focus on modern hybrid vehicle dashboards. All core CarPlay functionality is provided by the original project.
