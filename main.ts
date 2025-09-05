import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, addIcon } from 'obsidian';

interface ExerciseEntry {
	exercise: string;
	reps: string;
	weight: string;
	date: string;
}

interface WorkoutTemplate {
	name: string;
	exercises: string[];
}

interface TrackerSettings {
	exerciseHistory: Record<string, ExerciseEntry[]>;
	workoutTemplates: WorkoutTemplate[];
}

const DEFAULT_SETTINGS: TrackerSettings = {
	exerciseHistory: {},
	workoutTemplates: [
		{
			name: "Leg Day",
			exercises: ["Squats", "Good Mornings", "Split Squat", "Pull Ups", "Chin Ups"]
		},
		{
			name: "Push Day", 
			exercises: ["Bench Press", "Overhead Press", "Dips", "Push Ups"]
		},
		{
			name: "Pull Day",
			exercises: ["Pull Ups", "Chin Ups", "Rows", "Deadlifts"]
		}
	]
}

export default class TrackerPlugin extends Plugin {
	settings: TrackerSettings;
	isAutoFilling: boolean = false;

	async onload() {
		await this.loadSettings();
		
		// Register custom icon first
		this.addIcon();
		
		// Add ribbon icons
		this.addRibbonIcon('dumbbell-regular', 'Add Workout', () => {
			this.addWorkoutTable();
		});

		this.addRibbonIcon('dumbbell-plus', 'Add Workout from Template', () => {
			this.showTemplateModal();
		});

		this.addCommand({
			id: 'add-workout-table',
			name: 'Add workout table',
			icon: 'dumbbell-regular',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.addWorkoutTable();
			}
		});

		this.addCommand({
			id: 'add-exercise',
			name: 'Add exercise',
			icon: 'dumbbell-regular',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.showExerciseModal();
			}
		});

		this.addCommand({
			id: 'open-dashboard',
			name: 'Open/Update Workout Dashboard',
			icon: 'bar-chart-3',
			callback: () => {
				this.openOrUpdateDashboard();
			}
		});

		this.addCommand({
			id: 'add-workout-template',
			name: 'Add workout from template',
			icon: 'dumbbell-plus',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.showTemplateModal();
			}
		});

		// Listen for editor changes to auto-fill previous data
		this.registerEvent(
			this.app.workspace.on('editor-change', (editor: Editor) => {
				this.handleEditorChange(editor);
			})
		);

		this.addSettingTab(new TrackerSettingTab(this.app, this));
	}

	onunload() {

	}

	handleEditorChange(editor: Editor) {
		// Skip if we're currently auto-filling to prevent cursor jumping
		if (this.isAutoFilling) {
			return;
		}
		
		// Use a timeout to ensure the change has fully processed
		setTimeout(() => {
			if (this.isAutoFilling) {
				return;
			}
			
			const cursor = editor.getCursor();
			const line = editor.getLine(cursor.line);
			
			// Check if we're in a workout table
			if (!this.isWorkoutTableLine(line)) {
				return;
			}
			
			// Parse the table row - don't filter out empty cells, just trim them
			const allCells = line.split('|').map(cell => cell.trim());
			// Remove the first and last empty cells (before first | and after last |)
			const cells = allCells.slice(1, -1);
			
			if (cells.length < 6) {
				return;
			}
			
			const [exercise, reps, weight, lastReps, lastWeight, lastDate] = cells;
			
			// If exercise name was just entered and last columns are empty, auto-fill
			if (exercise && exercise !== 'Exercise' && !lastReps && !lastWeight && !lastDate) {
				this.autoFillPreviousData(editor, cursor.line, exercise);
			}
			
			// If all data is filled, save to history
			if (exercise && reps && weight && exercise !== 'Exercise') {
				this.saveExerciseFromTable(exercise, reps, weight);
			}
		}, 50);
	}

	isWorkoutTableLine(line: string): boolean {
		// Check if line contains table separators
		if (!line.includes('|')) {
			return false;
		}
		
		// Check if it's near a workout table by looking for context
		// Parse cells the same way as in handleEditorChange
		const allCells = line.split('|').map(cell => cell.trim());
		const cells = allCells.slice(1, -1);
		return cells.length >= 6;
	}

	autoFillPreviousData(editor: Editor, lineNum: number, exerciseName: string) {
		const lastData = this.getLastExerciseData(exerciseName);
		if (!lastData) {
			return;
		}
		
		const line = editor.getLine(lineNum);
		const cells = line.split('|');
		
		// Fill the last three columns (indices 4, 5, 6 accounting for empty cells at start/end)
		if (cells.length >= 7) {
			// Store current cursor position
			const cursor = editor.getCursor();
			
			// Set flag to prevent cursor jumping
			this.isAutoFilling = true;
			
			cells[4] = ` ${lastData.reps} `;        // Last Reps
			cells[5] = ` ${lastData.weight} `;      // Last Weight (no kg added)  
			cells[6] = ` ${lastData.date} `;        // Last Date
			
			const newLine = cells.join('|');
			editor.replaceRange(newLine, 
				{ line: lineNum, ch: 0 }, 
				{ line: lineNum, ch: line.length }
			);
			
			// Use setTimeout to restore cursor position after the editor has processed the change
			setTimeout(() => {
				editor.setCursor(cursor);
				this.isAutoFilling = false;
			}, 10);
		}
	}

	saveExerciseFromTable(exercise: string, repsStr: string, weightStr: string) {
		// Keep the full rep and weight strings as entered (e.g., "1/2/3" and "4/5/6")
		if (repsStr.trim() && weightStr.trim()) {
			// Only save if this is new data (avoid duplicate saves)
			const lastData = this.getLastExerciseData(exercise);
			const today = new Date().toISOString().split('T')[0];
			
			if (!lastData || lastData.date !== today || 
				lastData.reps !== repsStr || lastData.weight !== weightStr) {
				this.addExerciseToHistory(exercise, repsStr, weightStr);
			}
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	addIcon() {
		// Register the dumbbell-regular icon using your custom SVG content
		// Using consistent Obsidian icon format to prevent tiny size
		const dumbbellRegularSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
<path d="M21.433 21.433L20.0429 20.0429"/>
<path d="M3.95714 3.95712L2.56702 2.567"/>
<path d="M21.4181 18.61C21.7906 18.2377 21.9999 17.7326 22 17.2059C22.0001 16.9451 21.9487 16.6868 21.849 16.4458C21.7492 16.2049 21.603 15.9859 21.4186 15.8015C21.2342 15.617 21.0153 15.4707 20.7744 15.3709C20.5335 15.271 20.2752 15.2196 20.0144 15.2196C19.7536 15.2195 19.4954 15.2708 19.2544 15.3706C19.0134 15.4704 18.7945 15.6166 18.61 15.801L20.3656 14.0464C20.7381 13.6739 20.9473 13.1687 20.9473 12.6419C20.9473 12.1151 20.7381 11.6099 20.3656 11.2374C19.9931 10.8649 19.4878 10.6556 18.961 10.6556C18.4342 10.6556 17.929 10.8649 17.5565 11.2374L11.2374 17.5565C11.053 17.741 10.9067 17.9599 10.8068 18.2009C10.707 18.4419 10.6556 18.7002 10.6556 18.961C10.6556 19.2219 10.707 19.4802 10.8068 19.7212C10.9067 19.9621 11.053 20.1811 11.2374 20.3656C11.4219 20.55 11.6408 20.6963 11.8818 20.7961C12.1228 20.896 12.3811 20.9473 12.6419 20.9473C12.9028 20.9473 13.1611 20.896 13.4021 20.7961C13.643 20.6963 13.862 20.55 14.0465 20.3656L15.801 18.61C15.4286 18.9825 15.2195 19.4877 15.2196 20.0144C15.2197 20.5411 15.429 21.0462 15.8015 21.4186C16.174 21.7909 16.6792 22.0001 17.2059 22C17.7326 21.9999 18.2377 21.7906 18.61 21.4181L21.4181 18.61Z"/>
<path d="M2.58191 5.38997C2.2094 5.76234 2.00008 6.26744 1.99999 6.79414C1.99994 7.05494 2.05127 7.31319 2.15103 7.55416C2.25079 7.79512 2.39703 8.01408 2.58141 8.19852C2.76579 8.38296 2.98469 8.52929 3.22562 8.62913C3.46655 8.72898 3.72478 8.78039 3.98558 8.78044C4.24638 8.78048 4.50463 8.72916 4.7456 8.6294C4.98656 8.52964 5.20552 8.3834 5.38996 8.19902L3.63443 9.95355C3.26193 10.3261 3.05266 10.8313 3.05266 11.3581C3.05266 11.8849 3.26193 12.3901 3.63443 12.7626C4.00693 13.1351 4.51216 13.3444 5.03895 13.3444C5.56575 13.3444 6.07097 13.1351 6.44348 12.7626L12.7626 6.44349C12.947 6.25904 13.0933 6.04008 13.1932 5.79909C13.293 5.5581 13.3444 5.29981 13.3444 5.03896C13.3444 4.77812 13.293 4.51983 13.1932 4.27884C13.0933 4.03785 12.947 3.81889 12.7626 3.63444C12.5781 3.45 12.3592 3.30369 12.1182 3.20387C11.8772 3.10405 11.6189 3.05267 11.3581 3.05267C11.0972 3.05267 10.8389 3.10405 10.5979 3.20387C10.357 3.30369 10.138 3.45 9.95354 3.63444L8.19901 5.38997C8.57138 5.01747 8.78052 4.5123 8.78043 3.98559C8.78033 3.45889 8.57101 2.95379 8.19851 2.58142C7.82601 2.20905 7.32084 1.99991 6.79413 2C6.26743 2.00009 5.76233 2.20942 5.38996 2.58192L2.58191 5.38997Z"/>
<path d="M14.3831 14.3831L9.61694 9.61691"/>
</svg>`;

		// Register the dumbbell-plus icon using your new SVG content
		// Using consistent Obsidian icon format to prevent tiny size
		const dumbbellPlusSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
<path d="M10.6814 8.52468L6.44349 12.7626C6.25904 12.947 6.04008 13.0933 5.79909 13.1932C5.5581 13.293 5.29981 13.3444 5.03896 13.3444C4.77812 13.3444 4.51983 13.293 4.27884 13.1932C4.03785 13.0933 3.81889 12.947 3.63444 12.7626C3.45 12.5781 3.30369 12.3592 3.20387 12.1182C3.10405 11.8772 3.05267 11.6189 3.05267 11.3581C3.05267 11.0972 3.10405 10.8389 3.20387 10.5979C3.30369 10.357 3.45 10.138 3.63444 9.95354L5.38997 8.19901C5.01747 8.57138 4.5123 8.78052 3.98559 8.78043C3.45889 8.78033 2.95379 8.57101 2.58142 8.19851C2.20905 7.82601 1.99991 7.32084 2 6.79413C2.00009 6.26743 2.20942 5.76233 2.58192 5.38996L5.38997 2.58191C5.57435 2.39746 5.79325 2.25114 6.03418 2.1513C6.27511 2.05145 6.53334 2.00004 6.79414 1.99999C7.05494 1.99994 7.31319 2.05127 7.55416 2.15103C7.79512 2.25079 8.01408 2.39703 8.19852 2.58141C8.38296 2.76579 8.52929 2.98469 8.62913 3.22562C8.72898 3.46655 8.78039 3.72478 8.78044 3.98558C8.78053 4.51229 8.57139 5.01746 8.19902 5.38996L9.95355 3.63443"/>
<path d="M21.433 21.433L20.0429 20.0429"/>
<path d="M3.95714 3.95712L2.56702 2.567"/>
<path d="M21.4181 18.61C21.7906 18.2377 21.9999 17.7326 22 17.2059C22.0001 16.9451 21.9487 16.6868 21.849 16.4458C21.7492 16.2049 21.603 15.9859 21.4186 15.8015C21.2342 15.617 21.0153 15.4707 20.7744 15.3709C20.5335 15.271 20.2752 15.2196 20.0144 15.2196C19.7536 15.2195 19.4954 15.2708 19.2544 15.3706C19.0134 15.4704 18.7945 15.6166 18.61 15.801L20.3656 14.0464C20.7381 13.6739 20.9473 13.1687 20.9473 12.6419C20.9473 12.1151 20.7381 11.6099 20.3656 11.2374C19.9931 10.8649 19.4878 10.6556 18.961 10.6556C18.4342 10.6556 17.929 10.8649 17.5565 11.2374L11.2374 17.5565C11.053 17.741 10.9067 17.9599 10.8068 18.2009C10.707 18.4419 10.6556 18.7002 10.6556 18.961C10.6556 19.2219 10.707 19.4802 10.8068 19.7212C10.9067 19.9621 11.053 20.1811 11.2374 20.3656C11.4219 20.55 11.6408 20.6963 11.8818 20.7961C12.1228 20.896 12.3811 20.9473 12.6419 20.9473C12.9028 20.9473 13.1611 20.896 13.4021 20.7961C13.643 20.6963 13.862 20.55 14.0465 20.3656L15.801 18.61C15.4286 18.9825 15.2195 19.4877 15.2196 20.0144C15.2197 20.5411 15.429 21.0462 15.8015 21.4186C16.174 21.7909 16.6792 22.0001 17.2059 22C17.7326 21.9999 18.2377 21.7906 18.61 21.4181L21.4181 18.61Z"/>
<path d="M14.3831 14.3831L9.61694 9.61691"/>
<path d="M12.993 5.04938H18.9506"/>
<path d="M15.9718 2.07053V8.02821"/>
</svg>`;
		
		addIcon('dumbbell-regular', dumbbellRegularSvg);
		addIcon('dumbbell-plus', dumbbellPlusSvg);
	}

	addWorkoutTable() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			return;
		}

		const editor = activeView.editor;
		const cursor = editor.getCursor();
		
		const now = new Date();
		const date = now.toISOString().split('T')[0];
		const time = now.toTimeString().split(' ')[0].slice(0, 5); // HH:MM format
		
		const workoutTable = `
## 💪 Workout -- ${date}  ${time}

| Exercise | Reps | Weight | Last Reps | Last Weight | Last Date |
|----------|------|--------|-----------|-------------|-----------|
| | | | | | |

`;
		
		editor.replaceRange(workoutTable, cursor);
		// Position cursor in the Exercise cell of the empty row (line 5 from cursor start)
		editor.setCursor(cursor.line + 5, 2);
	}

	addWorkoutTableFromTemplate(template: WorkoutTemplate) {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			return;
		}

		const editor = activeView.editor;
		const cursor = editor.getCursor();
		
		const now = new Date();
		const date = now.toISOString().split('T')[0];
		const time = now.toTimeString().split(' ')[0].slice(0, 5); // HH:MM format
		
		let workoutTable = `
## 💪 ${template.name} -- ${date}  ${time}

| Exercise | Reps | Weight | Last Reps | Last Weight | Last Date |
|----------|------|--------|-----------|-------------|-----------|
`;

		// Add a row for each exercise in the template
		for (const exercise of template.exercises) {
			const lastData = this.getLastExerciseData(exercise);
			const lastReps = lastData ? lastData.reps : '';
			const lastWeight = lastData ? lastData.weight : '';
			const lastDate = lastData ? lastData.date : '';
			
			workoutTable += `| ${exercise} | | | ${lastReps} | ${lastWeight} | ${lastDate} |\n`;
		}
		
		workoutTable += '\n';
		
		editor.replaceRange(workoutTable, cursor);
		// Position cursor in the Reps cell of the first exercise row
		editor.setCursor(cursor.line + 4, 2);
	}

	showExerciseModal() {
		new ExerciseModal(this.app, this).open();
	}

	showTemplateModal() {
		new TemplateModal(this.app, this).open();
	}

	getLastExerciseData(exerciseName: string): ExerciseEntry | null {
		const history = this.settings.exerciseHistory[exerciseName.toLowerCase()];
		if (!history || history.length === 0) {
			return null;
		}
		
		// Simply return the most recent entry overall
		const lastEntry = history[history.length - 1];
		console.log(`Getting last data for ${exerciseName}:`, lastEntry);
		return lastEntry;
	}

	async addExerciseToHistory(exercise: string, reps: string, weight: string) {
		const key = exercise.toLowerCase();
		if (!this.settings.exerciseHistory[key]) {
			this.settings.exerciseHistory[key] = [];
		}
		
		this.settings.exerciseHistory[key].push({
			exercise,
			reps,
			weight,
			date: new Date().toISOString().split('T')[0]
		});
		
		await this.saveSettings();
	}

	async addExerciseRow(exerciseName: string, reps: string, weight: string) {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			return;
		}

		const editor = activeView.editor;
		const lastData = this.getLastExerciseData(exerciseName);
		const lastReps = lastData ? lastData.reps : '';
		const lastWeight = lastData ? lastData.weight : '';
		const lastDate = lastData ? lastData.date : '';
		
		const exerciseRow = `| ${exerciseName} | ${reps} | ${weight} | ${lastReps} | ${lastWeight} | ${lastDate} |\n`;
		
		const cursor = editor.getCursor();
		editor.replaceRange(exerciseRow, cursor);
		
		await this.addExerciseToHistory(exerciseName, reps, weight);
	}

	async openOrUpdateDashboard() {
		const dashboardPath = '_Workout Dashboard.md';
		const dashboardFile = this.app.vault.getAbstractFileByPath(dashboardPath);
		
		if (dashboardFile && dashboardFile instanceof TFile) {
			// Update existing dashboard
			await this.updateDashboard(dashboardFile);
		} else {
			// Create new dashboard
			await this.createDashboard(dashboardPath);
		}
		
		// Open the dashboard
		const file = this.app.vault.getAbstractFileByPath(dashboardPath);
		if (file instanceof TFile) {
			await this.app.workspace.getLeaf().openFile(file);
		}
	}

	async createDashboard(path: string) {
		const content = this.generateDashboardContent();
		await this.app.vault.create(path, content);
	}

	async updateDashboard(file: TFile) {
		const content = await this.app.vault.read(file);
		const updatedContent = this.updateDashboardContent(content);
		await this.app.vault.modify(file, updatedContent);
	}

	generateDashboardContent(): string {
		return `# Workout Dashboard

> [!tip] 🔄 [Update Data](obsidian://advanced-uri?vault=${encodeURIComponent(this.app.vault.getName())}&commandid=tracker%3Aopen-dashboard)
> Click the link above to refresh the dashboard with latest workout data

---
${this.generateDashboardData()}---

## Notes
*Add your personal notes and observations here - this section won't be overwritten when updating data*

`;
	}

	updateDashboardContent(existingContent: string): string {
		// Look for the pattern: button callout followed by --- (start) and --- followed by ## Notes (end)
		const lines = existingContent.split('\n');
		let startIndex = -1;
		let endIndex = -1;
		
		// Find start: line with "---" that comes after the update button
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].trim() === '---' && i > 0) {
				// Check if previous lines contain the update button
				const prevLines = lines.slice(Math.max(0, i-5), i).join('\n');
				if (prevLines.includes('Update Data')) {
					startIndex = i;
					break;
				}
			}
		}
		
		// Find end: line with "---" that comes before ## Notes
		for (let i = startIndex + 1; i < lines.length; i++) {
			if (lines[i].trim() === '---') {
				// Check if next lines contain ## Notes
				const nextLines = lines.slice(i + 1, Math.min(lines.length, i + 5)).join('\n');
				if (nextLines.includes('## Notes')) {
					endIndex = i;
					break;
				}
			}
		}
		
		if (startIndex === -1 || endIndex === -1) {
			// Markers not found, regenerate entire content
			return this.generateDashboardContent();
		}
		
		// Rebuild content: before start marker + new data + after end marker
		const beforeData = lines.slice(0, startIndex + 1);
		const afterData = lines.slice(endIndex);
		
		const newLines = [
			...beforeData,
			...this.generateDashboardData().split('\n').filter(line => line.trim() !== ''),
			...afterData
		];
		
		return newLines.join('\n');
	}

	generateDashboardData(): string {
		const dailyMaxData = this.calculateDailyMaxWeights();
		
		let output = '';
		
		if (Object.keys(dailyMaxData).length === 0) {
			output += '## Progress Charts\n\n*No workout data available yet. Start logging workouts to see your progress here!*\n\n';
			return output;
		}
		
		// Generate single combined chart for all exercises
		const exercises = [...new Set(Object.values(dailyMaxData).flatMap(day => Object.keys(day)))];
		
		output += '## Progress Chart\n\n';
		output += this.generateCombinedChart(exercises, dailyMaxData);
		
		// Future sections can be added here (placeholder removed to avoid rendering)
		
		return output;
	}

	generateCombinedChart(exercises: string[], dailyMaxData: Record<string, Record<string, number>>): string {
		if (exercises.length === 0) {
			return '*No exercises found*\n\n';
		}
		
		// Get all unique dates across all exercises
		const allDates = [...new Set(Object.keys(dailyMaxData))].sort();
		
		if (allDates.length === 0) {
			return '*No workout data available*\n\n';
		}
		
		// Create labels (dates)
		const labels = allDates.map(date => `"${date}"`).join(', ');
		
		// Create series for each exercise
		const seriesData: string[] = [];
		
		for (const exercise of exercises) {
			// For each date, get the weight for this exercise (or null if not performed)
			const exerciseValues: (number | null)[] = [];
			
			for (const date of allDates) {
				const weight = dailyMaxData[date][exercise];
				exerciseValues.push(weight || null);
			}
			
			// Convert to string format, handling null values
			const valuesString = exerciseValues.map(val => val === null ? 'null' : val.toString()).join(', ');
			
			seriesData.push(`  - title: ${exercise}
    data: [${valuesString}]`);
		}
		
		return `\`\`\`chart
type: line
labels: [${labels}]
series:
${seriesData.join('\n')}
tension: 0.2
width: 90%
height: 400px
labelColors: false
fill: false
beginAtZero: false
legendPosition: top
interactive: true
pointStyle: circle
pointRadius: 4
pointHoverRadius: 6
yTitle: Max Weight (kg)
\`\`\`

`;
	}

	generateDataTable(dailyMaxData: Record<string, Record<string, number>>, exercises: string[]): string {
		const dates = Object.keys(dailyMaxData).sort();
		
		// Table header
		let output = '| Date | ' + exercises.join(' | ') + ' |\n';
		output += '|------|' + exercises.map(() => '---').join('|') + '|\n';
		
		// Table rows
		for (const date of dates) {
			const row = [date];
			for (const exercise of exercises) {
				const maxWeight = dailyMaxData[date][exercise] || '-';
				row.push(maxWeight.toString());
			}
			output += '| ' + row.join(' | ') + ' |\n';
		}
		
		output += '\n';
		
		return output;
	}

	calculateDailyMaxWeights(): Record<string, Record<string, number>> {
		const dailyMax: Record<string, Record<string, number>> = {};
		
		for (const [exerciseName, entries] of Object.entries(this.settings.exerciseHistory)) {
			for (const entry of entries) {
				const date = entry.date;
				const maxWeight = this.parseMaxWeight(entry.weight);
				
				if (!dailyMax[date]) {
					dailyMax[date] = {};
				}
				
				const currentMax = dailyMax[date][entry.exercise] || 0;
				dailyMax[date][entry.exercise] = Math.max(currentMax, maxWeight);
			}
		}
		
		return dailyMax;
	}

	parseMaxWeight(weightStr: string | number): number {
		if (!weightStr && weightStr !== 0) {
			return 0;
		}
		
		// Convert to string if it's a number
		const weightString = weightStr.toString().trim();
		
		if (weightString === '') {
			return 0;
		}
		
		// Handle slash-separated values like "20/30/50"
		const weights = weightString.split('/').map(w => parseFloat(w.trim())).filter(w => !isNaN(w));
		
		if (weights.length === 0) {
			return 0;
		}
		
		return Math.max(...weights);
	}
}

class ExerciseModal extends Modal {
	plugin: TrackerPlugin;
	exerciseInput: HTMLInputElement;
	repsInput: HTMLInputElement;
	weightInput: HTMLInputElement;

	constructor(app: App, plugin: TrackerPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Add Exercise' });

		const form = contentEl.createDiv({ cls: 'exercise-form' });
		
		const exerciseDiv = form.createDiv({ cls: 'form-group' });
		exerciseDiv.createEl('label', { text: 'Exercise:', cls: 'form-label' });
		this.exerciseInput = exerciseDiv.createEl('input', { 
			type: 'text', 
			placeholder: 'e.g. Bench Press',
			cls: 'form-input'
		});

		const repsDiv = form.createDiv({ cls: 'form-group' });
		repsDiv.createEl('label', { text: 'Reps:', cls: 'form-label' });
		this.repsInput = repsDiv.createEl('input', { 
			type: 'number', 
			placeholder: '10',
			cls: 'form-input'
		});

		const weightDiv = form.createDiv({ cls: 'form-group' });
		weightDiv.createEl('label', { text: 'Weight (kg):', cls: 'form-label' });
		this.weightInput = weightDiv.createEl('input', { 
			type: 'number', 
			placeholder: '20',
			cls: 'form-input'
		});
		this.weightInput.step = '0.5';

		this.exerciseInput.addEventListener('input', () => {
			this.updatePreviousData();
		});

		const buttonDiv = form.createDiv({ cls: 'form-buttons' });
		const addButton = buttonDiv.createEl('button', { 
			text: 'Add Exercise', 
			cls: 'mod-cta'
		});
		addButton.addEventListener('click', () => {
			this.addExercise();
		});

		const cancelButton = buttonDiv.createDiv().createEl('button', { text: 'Cancel' });
		cancelButton.addEventListener('click', () => {
			this.close();
		});

		this.exerciseInput.focus();
	}

	updatePreviousData() {
		const exerciseName = this.exerciseInput.value.trim();
		if (!exerciseName) return;

		const lastData = this.plugin.getLastExerciseData(exerciseName);
		if (lastData) {
			this.repsInput.value = lastData.reps;
			this.weightInput.value = lastData.weight;
		}
	}

	async addExercise() {
		const exercise = this.exerciseInput.value.trim();
		const reps = this.repsInput.value.trim();
		const weight = this.weightInput.value.trim();

		if (!exercise || !reps || !weight) {
			return;
		}

		await this.plugin.addExerciseRow(exercise, reps, weight);
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class TemplateModal extends Modal {
	plugin: TrackerPlugin;

	constructor(app: App, plugin: TrackerPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Select Workout Template' });

		const templatesDiv = contentEl.createDiv({ cls: 'template-list' });

		for (const template of this.plugin.settings.workoutTemplates) {
			const templateDiv = templatesDiv.createDiv({ cls: 'template-item' });
			
			const titleEl = templateDiv.createEl('h3', { text: template.name, cls: 'template-title' });
			
			const exercisesEl = templateDiv.createEl('p', { 
				text: `Exercises: ${template.exercises.join(', ')}`, 
				cls: 'template-exercises' 
			});

			const selectButton = templateDiv.createEl('button', { 
				text: `Use ${template.name}`, 
				cls: 'mod-cta template-button' 
			});
			
			selectButton.addEventListener('click', () => {
				this.plugin.addWorkoutTableFromTemplate(template);
				this.close();
			});
		}

		const cancelDiv = contentEl.createDiv({ cls: 'modal-button-container' });
		const cancelButton = cancelDiv.createEl('button', { text: 'Cancel' });
		cancelButton.addEventListener('click', () => {
			this.close();
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class TemplateEditModal extends Modal {
	plugin: TrackerPlugin;
	template: WorkoutTemplate | null;
	onSave: () => void;
	nameInput: HTMLInputElement;
	exercisesInput: HTMLTextAreaElement;

	constructor(app: App, plugin: TrackerPlugin, template: WorkoutTemplate | null, onSave: () => void) {
		super(app);
		this.plugin = plugin;
		this.template = template;
		this.onSave = onSave;
	}

	onOpen() {
		const { contentEl } = this;
		const isEditing = this.template !== null;
		contentEl.createEl('h2', { text: isEditing ? 'Edit Workout Template' : 'Create Workout Template' });

		const form = contentEl.createDiv({ cls: 'template-form' });
		
		const nameDiv = form.createDiv({ cls: 'form-group' });
		nameDiv.createEl('label', { text: 'Template Name:', cls: 'form-label' });
		this.nameInput = nameDiv.createEl('input', { 
			type: 'text', 
			placeholder: 'e.g. Leg Day, Push Day',
			cls: 'form-input',
			value: this.template?.name || ''
		});

		const exercisesDiv = form.createDiv({ cls: 'form-group' });
		exercisesDiv.createEl('label', { text: 'Exercises (one per line):', cls: 'form-label' });
		this.exercisesInput = exercisesDiv.createEl('textarea', { 
			placeholder: 'Squats\nGood Mornings\nSplit Squat\nPull Ups\nChin Ups',
			cls: 'form-input'
		});
		this.exercisesInput.rows = 8;
		
		if (this.template) {
			this.exercisesInput.value = this.template.exercises.join('\n');
		}

		const buttonDiv = form.createDiv({ cls: 'form-buttons' });
		const saveButton = buttonDiv.createEl('button', { 
			text: isEditing ? 'Save Changes' : 'Create Template', 
			cls: 'mod-cta'
		});
		saveButton.addEventListener('click', () => {
			this.saveTemplate();
		});

		const cancelButton = buttonDiv.createEl('button', { text: 'Cancel' });
		cancelButton.addEventListener('click', () => {
			this.close();
		});

		this.nameInput.focus();
	}

	async saveTemplate() {
		const name = this.nameInput.value.trim();
		const exercisesText = this.exercisesInput.value.trim();

		if (!name || !exercisesText) {
			new Notice('Please fill in both template name and exercises');
			return;
		}

		const exercises = exercisesText.split('\n')
			.map(line => line.trim())
			.filter(line => line.length > 0);

		if (exercises.length === 0) {
			new Notice('Please add at least one exercise');
			return;
		}

		const newTemplate: WorkoutTemplate = {
			name,
			exercises
		};

		if (this.template) {
			// Edit existing template
			const index = this.plugin.settings.workoutTemplates.findIndex(t => t === this.template);
			if (index !== -1) {
				this.plugin.settings.workoutTemplates[index] = newTemplate;
			}
		} else {
			// Add new template
			this.plugin.settings.workoutTemplates.push(newTemplate);
		}

		await this.plugin.saveSettings();
		new Notice(`Template "${name}" ${this.template ? 'updated' : 'created'}`);
		this.onSave();
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class TrackerSettingTab extends PluginSettingTab {
	plugin: TrackerPlugin;

	constructor(app: App, plugin: TrackerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		
		containerEl.createEl('h2', { text: 'Workout Tracker Settings' });
		
		containerEl.createEl('p', { 
			text: 'Your exercise history is automatically saved. Use the ribbon button or commands to add workouts to your notes.' 
		});

		// Exercise History Section
		const historyDiv = containerEl.createDiv();
		historyDiv.createEl('h3', { text: 'Exercise History' });
		
		const exerciseCount = Object.keys(this.plugin.settings.exerciseHistory).length;
		historyDiv.createEl('p', { text: `Tracked exercises: ${exerciseCount}` });

		if (exerciseCount > 0) {
			const clearButton = historyDiv.createEl('button', { 
				text: 'Clear All History',
				cls: 'mod-warning'
			});
			clearButton.addEventListener('click', async () => {
				this.plugin.settings.exerciseHistory = {};
				await this.plugin.saveSettings();
				new Notice('Exercise history cleared');
				this.display();
			});
		}

		// Workout Templates Section
		const templatesDiv = containerEl.createDiv();
		templatesDiv.createEl('h3', { text: 'Workout Templates' });
		templatesDiv.createEl('p', { text: 'Create and manage workout templates for quick workout setup.' });

		const templatesList = templatesDiv.createDiv({ cls: 'templates-list' });
		
		for (let i = 0; i < this.plugin.settings.workoutTemplates.length; i++) {
			const template = this.plugin.settings.workoutTemplates[i];
			const templateDiv = templatesList.createDiv({ cls: 'template-setting-item' });
			
			templateDiv.createEl('h4', { text: template.name });
			templateDiv.createEl('p', { 
				text: `Exercises: ${template.exercises.join(', ')}`,
				cls: 'template-exercises-preview' 
			});
			
			const deleteButton = templateDiv.createEl('button', {
				text: 'Delete',
				cls: 'mod-warning'
			});
			deleteButton.addEventListener('click', async () => {
				this.plugin.settings.workoutTemplates.splice(i, 1);
				await this.plugin.saveSettings();
				new Notice(`Template "${template.name}" deleted`);
				this.display();
			});
		}

		const addTemplateButton = templatesDiv.createEl('button', {
			text: 'Add New Template',
			cls: 'mod-cta'
		});
		addTemplateButton.addEventListener('click', () => {
			new TemplateEditModal(this.app, this.plugin, null, () => this.display()).open();
		});
	}
}