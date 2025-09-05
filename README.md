# Fitness Tracker

A comprehensive fitness tracking plugin for Obsidian that helps you log workouts, track progress, and visualize your fitness journey directly within your notes.

## Features

### 🏋️ Workout Logging
- **Quick Workout Tables**: Create structured workout tables with exercise name, reps, weight, and historical data
- **Auto-fill Previous Data**: Automatically populate your last recorded reps, weight, and date when you enter an exercise name
- **Real-time Tracking**: Exercise data is automatically saved as you type in workout tables

### 📋 Workout Templates
- **Pre-built Templates**: Includes Leg Day, Push Day, and Pull Day templates
- **Custom Templates**: Create your own workout templates with specific exercises
- **Template Management**: Add, edit, and delete templates through the settings panel
- **Quick Template Access**: Use templates to instantly generate workout tables with your favorite exercises

### 📊 Progress Dashboard
- **Visual Charts**: Interactive line charts showing your progress over time for each exercise
- **Automatic Updates**: Dashboard refreshes with your latest workout data
- **Max Weight Tracking**: Tracks your maximum weight lifted for each exercise per day
- **Multi-exercise Comparison**: View progress for multiple exercises on a single chart

### 🎯 Smart Features
- **Exercise History**: Comprehensive tracking of all your workouts with date stamps
- **Weight Parsing**: Supports various weight formats including progressive sets (e.g., "20/25/30")
- **Flexible Input**: Works with both the ribbon buttons and command palette
- **Mobile Compatible**: Full functionality on both desktop and mobile versions of Obsidian

## Installation

### From Obsidian Community Plugins
1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Fitness Tracker"
4. Install and enable the plugin

### Manual Installation
1. Download the latest release from GitHub
2. Extract the files to your vault's `.obsidian/plugins/fitness-tracker/` folder
3. Reload Obsidian and enable the plugin in Settings > Community Plugins

## Usage

### Creating Workouts

#### Quick Workout
1. Click the dumbbell icon in the ribbon or use `Ctrl/Cmd + P` → "Add workout table"
2. A workout table will be inserted at your cursor position
3. Start typing exercise names - previous data will auto-populate
4. Enter your reps and weight for each exercise

#### Template-Based Workouts
1. Click the dumbbell-plus icon in the ribbon or use `Ctrl/Cmd + P` → "Add workout from template"
2. Select from available templates (Leg Day, Push Day, Pull Day, or your custom templates)
3. A pre-populated workout table will be created with your template exercises

### Workout Table Format
```markdown
## 💪 Workout -- 2024-01-15  09:30

| Exercise | Reps | Weight | Last Reps | Last Weight | Last Date |
|----------|------|--------|-----------|-------------|-----------|
| Bench Press | 10 | 80 | 8 | 75 | 2024-01-12 |
| Squats | 12 | 100 | 10 | 95 | 2024-01-10 |
```

### Progress Dashboard
1. Use `Ctrl/Cmd + P` → "Open/Update Workout Dashboard" or click the chart icon
2. The dashboard will be created/updated with your latest workout data
3. View interactive charts showing your progress over time
4. Add personal notes in the Notes section (won't be overwritten during updates)

### Managing Templates
1. Go to Settings → Fitness Tracker
2. Scroll to the "Workout Templates" section
3. Create new templates or edit existing ones
4. Each template can include any exercises you want

## Settings

### Exercise History
- View the total number of tracked exercises
- Clear all history if needed (use with caution!)

### Workout Templates
- **Default Templates**: Leg Day, Push Day, Pull Day
- **Custom Templates**: Create templates with your preferred exercises
- **Template Format**: One exercise per line when creating templates

## Data Format

### Weight Input
The plugin supports flexible weight formats:
- Simple weights: `80`, `75.5`
- Progressive sets: `20/25/30` (for increasing weight across sets)
- The dashboard tracks the maximum weight from each workout

### Exercise Names
- Case-insensitive matching for auto-fill
- Supports any exercise names you prefer
- Historical data is matched by exercise name

## Tips & Best Practices

### Workout Organization
- Create separate notes for different workout types
- Use consistent exercise naming for better tracking
- Date your workout notes for easy reference

### Progress Tracking
- Update your dashboard regularly to see progress trends
- Use the Notes section in the dashboard for observations and goals
- Review historical data to plan future workouts

### Template Usage
- Create templates for your regular workout routines
- Include warm-up exercises in your templates
- Adjust templates as your routine evolves

## Troubleshooting

### Auto-fill Not Working
- Ensure you're typing in a properly formatted workout table
- Check that the exercise name matches previous entries (case-insensitive)
- Verify the table has all required columns

### Dashboard Not Updating
- Use the "Update Data" link in the dashboard
- Ensure your workout tables follow the correct format
- Check that exercise data has been saved (reps and weight columns filled)

### Templates Not Appearing
- Verify templates are created in Settings → Fitness Tracker
- Check that template names and exercises are properly formatted
- Try reloading the plugin if templates don't appear

## Support

If you encounter issues or have feature requests:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with details about your problem

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with a clear description

## License

This plugin is licensed under the MIT License. See the LICENSE file for details.

## Changelog

### v1.0.0
- Initial release
- Basic workout table creation
- Exercise history tracking
- Auto-fill previous data
- Progress dashboard with charts
- Workout templates (Leg Day, Push Day, Pull Day)
- Custom template creation
- Mobile support
- Custom icons for ribbon buttons

