# Latency Topology Visualizer

A real-time, interactive 3D world map visualization of cryptocurrency exchange server locations with animated latency connections. Built with Next.js, TypeScript, React, and WebGL rendering.

## Overview

This application provides a comprehensive visualization of cryptocurrency exchange infrastructure, showing server locations across the globe with real-time latency monitoring. Users can explore both 2D and 3D views, analyze historical latency data through interactive charts, and monitor live connection statistics.

## Features

### 🌍 Interactive Globe Visualization
- **3D Globe View**: Interactive WebGL-powered globe using globe.gl library
- **2D Map View**: Traditional flat map projection for detailed analysis
- **Server Markers**: Color-coded markers by cloud provider (AWS, GCP, Azure, Other)
- **Animated Arcs**: Real-time animated connections between selected server pairs
- **Atmospheric Effects**: Night sky background and atmospheric glow

### 📊 Real-time Analytics
- **Mock Latency Generation**: Deterministic seeded random generation for reproducible testing
- **Live Updates**: Polling-based updates every 5-10 seconds
- **Historical Charts**: Time-series visualization with min/max/avg statistics
- **Statistics Dashboard**: Real-time display of active connections and update timestamps

### 🎛️ Control Panel
- **Provider Filtering**: Filter servers by cloud provider
- **Search Functionality**: Full-text search across server names
- **Real-time Toggle**: Enable/disable live updates
- **Low-power Mode**: Reduced animation for mobile/battery-constrained devices

### 📈 Data Visualization
- **Interactive Charts**: Built with recharts for responsive time-series data
- **Server Popups**: Detailed information on hover/click
- **Connection Statistics**: Min/max/avg latency calculations
- **Time Range Controls**: 1h, 24h, 7d, 30d historical views

## Technology Stack

### Frontend Framework
- **Next.js 16.0.0**: React framework with App Router and server-side rendering
- **React 19.2.0**: UI library with hooks and context API
- **TypeScript 5.0**: Type-safe JavaScript with strict type checking

### Visualization Libraries
- **globe.gl**: WebGL-powered 3D globe visualization
- **Three.js**: 3D graphics library (dependency of globe.gl)
- **recharts 2.15.4**: React charting library for time-series data

### State Management & Data Fetching
- **SWR 2.2.5**: React hooks for data fetching and caching
- **React Context**: Global state management for app-wide data

### UI Components & Styling
- **Tailwind CSS 4.1.9**: Utility-first CSS framework
- **Radix UI Components**: Accessible, unstyled UI primitives
- **Lucide React**: Modern icon library
- **Sonner**: Toast notifications

### Development Tools
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing with Tailwind
- **Autoprefixer**: CSS vendor prefixing

## Project Structure

```
/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── latency/
│   │   │   ├── history/route.ts  # Historical data endpoint
│   │   │   ├── recent/route.ts   # Recent samples endpoint
│   │   │   └── stats/route.ts    # Statistics endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main dashboard page
├── components/                   # React components
│   ├── Globe3D.tsx              # 3D globe visualization
│   ├── MapGlobe.tsx             # 2D map visualization
│   ├── HistoricalChart.tsx      # Time-series chart
│   ├── ControlPanel.tsx         # Filtering controls
│   ├── ServerList.tsx           # Server selection list
│   ├── Legend.tsx               # Provider color legend
│   ├── ServerPopup.tsx          # Server information popup
│   ├── AppProvider.tsx          # Global state provider
│   └── ui/                      # Reusable UI components
├── lib/                         # Utility libraries
│   ├── types.ts                 # TypeScript interfaces
│   ├── context.ts               # React context definitions
│   ├── mockLatency.ts           # Mock data generation
│   ├── exchanges.ts             # Exchange server definitions
│   └── api.ts                   # API client functions
├── public/                      # Static assets
└── styles/                      # Additional stylesheets
```

## Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Installation

1. **Clone or download** the repository to your local machine

2. **Navigate to the project directory**:
   ```bash
   cd latency-topology-visualizer
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

   This will install all required packages including:
   - Next.js and React ecosystem
   - globe.gl and Three.js for 3D visualization
   - recharts for data visualization
   - Tailwind CSS and UI component libraries

## Running the Application

### Development Mode

Start the development server with hot reloading:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Code Quality

Run the linter to check code quality:

```bash
npm run lint
```

## Usage Guide

### Getting Started

1. **Launch the application** using `npm run dev`
2. **Choose your view**: Toggle between "3D Globe" and "2D Map" in the top-left corner
3. **Explore servers**: Click on colored markers to select servers
4. **View connections**: Select two servers to see animated latency arcs
5. **Analyze data**: Click "View Chart" to see historical latency trends

### Navigation

- **Globe Rotation**: Click and drag to rotate the 3D globe
- **Zoom**: Use mouse wheel or pinch gestures to zoom in/out
- **Server Selection**: Click markers to select servers for pairing
- **Filtering**: Use the control panel to filter by provider or search by name

### Data Interpretation

- **Marker Colors**:
  - 🟠 Orange: AWS servers
  - 🔵 Blue: GCP servers
  - 🟦 Dark Blue: Azure servers
  - 🟣 Purple: Other providers

- **Arc Colors**: Green arcs indicate active connections between selected servers

- **Chart Statistics**:
  - **Min**: Lowest latency recorded
  - **Max**: Highest latency recorded
  - **Avg**: Average latency across the time range

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# WebSocket URL for real-time updates (placeholder)
NEXT_PUBLIC_WS_URL=ws://localhost:3000/api/latency/stream

# Globe texture URL (placeholder for custom textures)
NEXT_PUBLIC_GLOBE_TEXTURE_URL=PLACEHOLDER_FREE_TEXTURE_OR_PATH
```

### Mock Data Configuration

The application uses deterministic mock data generation. Key settings in `lib/mockLatency.ts`:

- **Update Interval**: 7 seconds (configurable)
- **Sample Retention**: Last 50,000 samples (~25MB memory)
- **Latency Range**: 10-500ms (configurable per exchange pair)

### Performance Tuning

- **Max Arcs**: Limited to 150 simultaneous connections
- **Low-power Mode**: Reduces animations and frame rates
- **Memory Management**: Automatic cleanup of old samples

## API Endpoints

### GET /api/latency/history
Returns historical latency samples for a specific pair.

**Parameters:**
- `from` (string): Source server ID
- `to` (string): Target server ID
- `start` (timestamp): Start time (ISO string)
- `end` (timestamp): End time (ISO string)

**Response:**
```json
{
  "samples": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "rttMs": 45.2,
      "from": "binance-us",
      "to": "bybit-sg"
    }
  ],
  "stats": {
    "min": 12.3,
    "max": 234.5,
    "avg": 67.8,
    "count": 1000
  }
}
```

### GET /api/latency/recent
Returns the most recent samples across all pairs.

### GET /api/latency/stats
Returns aggregated statistics for a server pair.

## Assumptions & Limitations

### Data Assumptions
- **Mock Data**: All latency data is generated using seeded random functions
- **Server Locations**: Exchange server coordinates are approximate
- **Real-time Simulation**: Updates occur every 7 seconds to simulate real-time data

### Technical Assumptions
- **Browser Support**: Modern browsers with WebGL support required for 3D view
- **Network Connectivity**: Stable internet connection for texture loading
- **Memory Usage**: ~25MB for sample storage (configurable)

### Limitations
- **No Real APIs**: No external paid services or real latency measurement
- **Client-side Storage**: All data stored in memory (resets on refresh)
- **Performance**: 3D view may be intensive on low-end devices
- **Accuracy**: Mock data doesn't reflect real network conditions

## Integration with Real Data

To replace mock data with real latency measurements:

1. **Implement Data Ingestion**:
   ```typescript
   // Add POST /api/latency/push endpoint
   // Accept real latency samples from your pingers
   ```

2. **Replace Mock Generation**:
   ```typescript
   // In AppProvider.tsx, replace generateMockSample()
   // with calls to your real data source
   ```

3. **Add Authentication**:
   ```typescript
   // Secure API endpoints for production use
   ```

4. **Configure Real-time Updates**:
   ```typescript
   // Replace polling with WebSocket connections
   // Update NEXT_PUBLIC_WS_URL in .env.local
   ```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add new feature"`
5. Push to your branch: `git push origin feature/new-feature`
6. Create a Pull Request

## Troubleshooting

### Common Issues

**3D Globe not loading:**
- Ensure WebGL is enabled in your browser
- Check browser console for WebGL errors
- Try switching to 2D Map view

**Build failures:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version`
- Verify all dependencies are installed

**Performance issues:**
- Enable Low-power mode in the control panel
- Reduce browser zoom level
- Close other browser tabs

**Data not updating:**
- Check network connectivity
- Verify API endpoints are responding
- Clear browser cache and reload

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **globe.gl**: WebGL globe visualization library
- **Three.js**: 3D graphics library
- **recharts**: React charting library
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

## Support

For questions, issues, or contributions:

- Open an issue on GitHub
- Check the troubleshooting section above
- Review the code comments for implementation details

---

**Built with ❤️ using Next.js, React, and WebGL By Harsh Deo**
