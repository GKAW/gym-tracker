# Gym Tracker

Track workouts, progress, and visualize your fitness journey directly within Obsidian notes.

## Features

- **Workout Tables**: Auto-fill previous data when typing exercise names
- **Templates**: Pre-built (Leg/Push/Pull Day) and custom workout templates  
- **Progress Charts**: Visual progress tracking (requires chart plugin)
- **Exercise History**: Automatic tracking with date stamps
- **Flexible Input**: Ribbon buttons, commands, and modal dialogs
- **Mobile Support**: Works on desktop and mobile

## Installation

### From Community Plugins
1. Open Settings → Community Plugins → Browse
2. Search for "Gym Tracker" and install
3. **For progress charts**: Also install "Charts" or "Advanced Charts" plugin

### Manual Installation
1. Download from GitHub releases
2. Extract to `.obsidian/plugins/gym-tracker/`
3. Enable in Settings → Community Plugins
4. **For progress charts**: Install a chart plugin that supports ```chart syntax

## Usage

### Quick Start
1. **Workout Table**: Click dumbbell icon or use command "Add workout table"
2. **From Template**: Click dumbbell-plus icon or use "Add workout from template"  
3. **Single Exercise**: Use command "Add exercise" for modal entry

### Workout Format
```markdown
## 💪 Workout -- 2024-01-15  09:30
| Exercise | Reps | Weight | Last Reps | Last Weight | Last Date |
|----------|------|--------|-----------|-------------|-----------|
| Bench Press | 10 | 80 | 8 | 75 | 2024-01-12 |
```

### Progress Dashboard
- Command: "Open/Update Workout Dashboard" creates `_Workout Dashboard.md`
- Click "Update Data" link to refresh charts
- Add notes in Notes section (preserved during updates)

### Templates
- **Default**: Leg Day, Push Day, Pull Day
- **Custom**: Create in Settings → Gym Tracker → Workout Templates

## Data Format

### Weights
- Simple: `80`, `75.5`
- Progressive sets: `20/25/30` (uses max value for charts)
- Any units (kg, lbs, etc.)

### Exercise Names
- Case-insensitive matching for auto-fill
- Use consistent naming for better tracking

## Troubleshooting

- **Auto-fill not working**: Check exercise name consistency and table format
- **Charts not showing**: Install Charts plugin and reload Obsidian  
- **Templates missing**: Create in Settings → Gym Tracker → Workout Templates

## Support

Report issues on [GitHub](https://github.com/gkaw/tracker)

## License

MIT License

