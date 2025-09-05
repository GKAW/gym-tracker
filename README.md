# Workout Tracker

A comprehensive workout tracking plugin for Obsidian that helps you log workouts, track progress, and visualize your fitness journey directly within your notes.

## Features

### 🏋️ Workout Logging
- **Quick Workout Tables**: Create structured workout tables with exercise name, reps, weight, and historical data
- **Auto-fill Previous Data**: Automatically populate your last recorded reps, weight, and date when you enter an exercise name
- **Real-time Tracking**: Exercise data is automatically saved as you type in workout tables
- **Individual Exercise Entry**: Add single exercises via modal dialog with auto-fill from previous data

### 📋 Workout Templates
- **Pre-built Templates**: Includes Leg Day, Push Day, and Pull Day templates with common exercises
- **Custom Templates**: Create your own workout templates with specific exercises
- **Template Management**: Add, edit, and delete templates through the settings panel
- **Quick Template Access**: Use templates to instantly generate workout tables with your favorite exercises pre-populated

### 📊 Progress Dashboard
- **Visual Charts**: Interactive line charts showing your progress over time for each exercise (requires chart plugin)
- **Automatic Updates**: Dashboard refreshes with your latest workout data via clickable update link
- **Max Weight Tracking**: Tracks your maximum weight lifted for each exercise per day
- **Multi-exercise Comparison**: View progress for multiple exercises on a single chart
- **Persistent Notes**: Add personal observations in Notes section that won't be overwritten during updates

### 🎯 Smart Features
- **Exercise History**: Comprehensive tracking of all your workouts with automatic date stamps
- **Weight Parsing**: Supports various weight formats including progressive sets (e.g., "20/25/30" takes max value)
- **Multiple Access Methods**: Ribbon buttons, command palette, and modal dialogs
- **Mobile Compatible**: Full functionality on both desktop and mobile versions of Obsidian
- **Custom Icons**: Distinctive dumbbell icons for regular workouts and template-based workouts

## Requirements

### Chart Plugin (Required for Progress Dashboard)
To view the progress charts in the dashboard, you'll need a chart rendering plugin. We recommend:
- **Obsidian Charts** plugin (search for "Charts" in Community Plugins)
- Alternatively: **Advanced Charts** or any plugin that supports the ```chart code block syntax

The workout tracking functionality works without a chart plugin, but progress visualization requires one.

## Installation

### From Obsidian Community Plugins
1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Workout Tracker"
4. Install and enable the plugin
5. **Optional but recommended**: Install a chart plugin (e.g., "Charts") for progress visualization

### Manual Installation
1. Download the latest release from GitHub
2. Extract the files to your vault's `.obsidian/plugins/workout-tracker/` folder
3. Reload Obsidian and enable the plugin in Settings > Community Plugins
4. **Optional but recommended**: Install a chart plugin for progress visualization

## Usage

### Creating Workouts

#### Quick Workout
1. Click the dumbbell icon in the ribbon or use `Ctrl/Cmd + P` → "Add workout table"
2. A workout table will be inserted at your cursor position
3. Start typing exercise names - previous data will auto-populate in the last 3 columns
4. Enter your reps and weight for each exercise - data is saved automatically as you type

#### Template-Based Workouts
1. Click the dumbbell-plus icon in the ribbon or use `Ctrl/Cmd + P` → "Add workout from template"
2. Select from available templates (Leg Day, Push Day, Pull Day, or your custom templates)
3. A pre-populated workout table will be created with your template exercises and their historical data

#### Individual Exercise Entry
1. Use `Ctrl/Cmd + P` → "Add exercise" 
2. A modal dialog opens where you can enter exercise name, reps, and weight
3. Previous data for the exercise will auto-populate in the form
4. The exercise will be added as a table row at your cursor position

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
2. The dashboard file "_Workout Dashboard.md" will be created/updated with your latest workout data
3. Click the "Update Data" link in the dashboard to refresh with latest workouts
4. View interactive charts showing your progress over time (requires chart plugin)
5. Add personal notes in the Notes section (won't be overwritten during updates)

### Managing Templates
1. Go to Settings → Workout Tracker
2. Scroll to the "Workout Templates" section
3. Create new templates or edit existing ones
4. Each template can include any exercises you want

## Settings

### Exercise History
- View the total number of tracked exercises in the settings panel
- Clear all history if needed (use with caution - this cannot be undone!)
- Exercise data is stored per exercise name (case-insensitive)

### Workout Templates
- **Default Templates**: 
  - **Leg Day**: Squats, Good Mornings, Split Squat, Pull Ups, Chin Ups
  - **Push Day**: Bench Press, Overhead Press, Dips, Push Ups  
  - **Pull Day**: Pull Ups, Chin Ups, Rows, Deadlifts
- **Custom Templates**: Create templates with your preferred exercises
- **Template Format**: Enter one exercise per line when creating templates
- **Template Actions**: Edit or delete existing templates through the settings interface

## Data Format

### Weight Input
The plugin supports flexible weight formats:
- **Simple weights**: `80`, `75.5` (any numeric value)
- **Progressive sets**: `20/25/30` (for increasing weight across sets - dashboard uses maximum value)
- **Decimal weights**: Supports half-weights like `22.5` for precise tracking
- **Units**: Plugin is unit-agnostic (kg, lbs, etc. - specify in your exercise names if needed)

### Exercise Names
- **Case-insensitive matching**: "bench press" matches "Bench Press" for auto-fill
- **Flexible naming**: Use any exercise names you prefer
- **Historical data**: Matched by exercise name, so consistent naming improves auto-fill
- **Special characters**: Exercise names can include spaces, hyphens, etc.

## Tips & Best Practices

### Workout Organization
- Create separate notes for different workout types or use daily notes
- Use consistent exercise naming for better auto-fill (e.g., always "Bench Press" not "bench press" or "BP")
- The plugin works in any note - no special file structure required
- Date and time are automatically added to workout headers

### Progress Tracking
- Click the "Update Data" link in the dashboard to refresh with latest workouts
- Use the Notes section in the dashboard for observations, goals, and program changes
- Review historical data by looking at the "Last" columns in your workout tables
- Dashboard charts show maximum weight per exercise per day for progress visualization

### Template Usage
- Start with the default templates and customize them for your routine
- Create templates for your regular workout splits (e.g., Upper/Lower, Push/Pull/Legs)
- Include compound movements in your templates for better progress tracking
- Edit templates as your routine evolves - changes apply to future workouts only

### Data Entry
- Fill out exercise tables from left to right - auto-fill happens when you enter the exercise name
- Use the individual exercise modal for adding exercises to existing workouts
- Progressive set notation (20/25/30) automatically tracks your highest set for progress

## Troubleshooting

### Auto-fill Not Working
- Ensure you're typing in a properly formatted workout table
- Check that the exercise name matches previous entries (case-insensitive)
- Verify the table has all required columns

### Dashboard Not Updating
- Use the "Update Data" link in the dashboard
- Ensure your workout tables follow the correct format
- Check that exercise data has been saved (reps and weight columns filled)

### Charts Not Displaying
- Install a chart plugin (e.g., "Obsidian Charts" or "Advanced Charts")
- Ensure the chart plugin supports ```chart code blocks
- Reload Obsidian after installing the chart plugin

### Templates Not Appearing
- Verify templates are created in Settings → Workout Tracker
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

