# Latency Topology Visualizer

A real-time, interactive 3D world map visualization of cryptocurrency exchange server locations with animated latency connections. Built with Next.js, TypeScript, React, and Canvas rendering.

## Features

- **Interactive Globe**: Mercator projection map with pan/zoom controls
- **Real-time Updates**: Mock latency data generation every 5-10 seconds
- **Animated Arcs**: Color-coded connections between servers (green=fast, red=slow)
- **Historical Analytics**: Time-series charts with min/max/avg statistics
- **Server Filtering**: Filter by cloud provider (AWS, GCP, Azure, Other)
- **Search & Discovery**: Full-text search over server names
- **Low-Power Mode**: Reduced animation frame rates for mobile/battery-constrained devices
- **Live Statistics**: Real-time display of active connections and update timestamps

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone or extract the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
/app
  /api
    /latency
      /history/route.ts    - Query historical samples by time range
      /stats/route.ts      - Get min/max/avg statistics for a pair
      /recent/route.ts     - Get recent samples for live dashboard
  /page.tsx                - Main dashboard page
  /layout.tsx              - Root layout with metadata
  /globals.css             - Tailwind styles + theme variables

/components
  /MapGlobe.tsx            - Canvas-based interactive globe renderer
  /Legend.tsx              - Cloud provider color legend
  /ControlPanel.tsx        - Filtering and mode controls
  /ServerList.tsx          - List of available servers with selection
  /HistoricalChart.tsx     - Time-series latency chart
  /LatencyArcs.tsx         - Animated arc connection renderer
  /AppProvider.tsx         - Global state provider with real-time polling
  /RealtimeController.tsx  - Live/Paused mode toggle

/lib
  /types.ts                - TypeScript interfaces for data structures
  /mockLatency.ts          - Seeded mock generator + in-memory store
  /exchanges.ts            - Sample exchange server definitions
  /api.ts                  - API client helper functions
  /context.ts              - React Context for app state

/styles                    - Optional custom CSS modules
\`\`\`

## How It Works

### Mock Data Generation

The app uses a **seeded random number generator** for reproducible mock latency data:
- Every run generates the same sequence of samples (for testing/debugging)
- Samples are generated locally every 7 seconds
- Each sample includes: `{ fromId, toId, timestamp, rttMs }`
- Latency values follow realistic distribution: 50-150ms base + variance

### Real-Time Updates

1. **Polling (default)**: Client polls `/api/latency/recent` every 7 seconds
2. **Local Mock Generation**: Supplements polling by generating samples in the browser
3. **In-Memory Storage**: Samples stored in `mockLatency.ts` with 50k max samples and 30-day retention

### API Endpoints

- `GET /api/latency/recent` - Last 500 samples (for dashboard)
- `GET /api/latency/history?from=ID&to=ID&fromTime=MS&toTime=MS` - Historical range
- `GET /api/latency/stats?from=ID&to=ID&fromTime=MS&toTime=MS` - Statistics only

### Visualization

- **Globe**: Mercator projection, ~20 exchange servers across 4 cloud providers
- **Markers**: Color-coded by provider (AWS=Orange, GCP=Blue, Azure=Dark Blue, Other=Purple)
- **Arcs**: Quadratic curves between servers, color intensity based on latency
- **Animation**: 60 FPS with RAF, pulses on selected connections

## Integration with Real Data

To plug in real latency data (instead of mocks):

1. **Replace mock generation** in `AppProvider.tsx`:
   \`\`\`typescript
   // Remove generateMockSample() interval
   // Call your real latency API instead
   \`\`\`

2. **Add a data ingestion endpoint** (optional):
   \`\`\`typescript
   // POST /api/latency/push
   // Accept { fromId, toId, rttMs } samples from your agents/pingers
   \`\`\`

3. **Use environment variables** for agent configuration:
   \`\`\`
   NEXT_PUBLIC_WS_URL=wss://your-api.com/latency
   NEXT_PUBLIC_PINGER_ENDPOINTS=...
   \`\`\`

## Customization

### Add More Servers
Edit `lib/exchanges.ts` and add to `PROVIDER_COORDS`:
\`\`\`typescript
AWS: [
  { lat: 40.7128, lon: -74.006 }, // Your location
  ...
]
\`\`\`

### Adjust Colors
Update `getProviderColor()` in `MapGlobe.tsx` and `PROVIDER_COLORS` in `Legend.tsx`.

### Change Update Frequency
In `AppProvider.tsx`, modify the interval:
\`\`\`typescript
refreshInterval: state.isRealTimeEnabled ? 7000 : 0  // 7 seconds
\`\`\`

### Performance Tuning
- **Max arcs rendered**: `maxArcs` prop in `MapGlobe` (default: 150)
- **Sample retention**: `MAX_SAMPLES` in `mockLatency.ts` (default: 50k)
- **Low-power mode**: Reduces arcs to 50 and disables fancy animations

## Environment Variables

Create `.env.local` with:
\`\`\`env
# Placeholders for future integration
NEXT_PUBLIC_WS_URL=ws://localhost:3000/api/latency/stream
NEXT_PUBLIC_GLOBE_TEXTURE_URL=PLACEHOLDER_FREE_TEXTURE_OR_PATH
\`\`\`

## Performance Notes

- **Canvas rendering**: ~60 FPS on desktop, capped lower on mobile in low-power mode
- **Memory**: ~50k samples at ~500 bytes each = ~25MB max
- **Network**: Polling every 7s with minimal JSON payload (~2-5KB per request)
- **Bundle size**: ~150KB gzipped (Next.js + React + canvas code)

## Future Enhancements

- [ ] WebSocket real-time instead of polling
- [ ] GeoIP server location auto-discovery
- [ ] Custom server/provider management UI
- [ ] Export data to CSV/JSON
- [ ] Multi-connection tracking (A→B, B→C, etc. dependency graph)
- [ ] Anomaly detection and alerting
- [ ] Integration with Prometheus/InfluxDB

## License

MIT

## Support

For issues or suggestions, please open an issue or contact the maintainers.
