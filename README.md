# csvToJson
A lightweight JavaScript/TypeScript CLI application for converting CSV to JSON.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Development](#development)
- [Testing](#testing)

## Installation
Either download a file from the releases section, or build it yourself.

## Usage
### Arguments
The application takes two arguments: 
* `path` - Path to your csv file.
* `savePath` - Path specifying where to save the converted output.
### Piping the output
You are also able to pipe the input into the converter and output onto a different application.
### Flags
The application takes in the following flags:
* `--help` - Displays available arguments and flags.
* `--log` - Logs the outpout.
* `--db` - Saves the output to the application's internal sqlite3 database.
* `--readDb` - Reads the saved rows from the application's internal sqlite3 database.
* `--d` - Specify the CSV delimeter.

## Examples running in dev mode
### Convert a csv file and save it to another file:
```bash
npm run dev ./csv.csv ./output.json
```
### Convert a csv file and log the output
```bash
npm run dev ./csv.csv --log
```

### Convert a csv file and save it to the application's sqlite3 database
```bash
npm run dev ./csv.csv --db
```

### Convert a csv file and pipe the output
```bash
npm run dev ./csv.csv | someApp
```

### Pipe input and output
```bash
cat csv.csv | npm run dev | grep "header"
```

## Development
If you’d like to contribute or modify the library, follow these steps to set up the development environment.
1. **Clone the repository:**
```bash
git clone https://github.com/edvinasnazarovas/vention-csvToJson.git
cd vention-csvToJson
```
2. **Install dependencies:**
```bash
npm install
```
3. **Build the library:**
This command compiles TypeScript files to JavaScript and outputs them to the `dist` directory.
```bash
npm run build
```
## Testing
This project uses Vitest for testing. You can run tests with the following command: 
```bash
npm run test
```
To run tests in watch mode, use:
```bash
npm run test -- --watch
```

## Performance

### v1.1.0
#### Runtime
![image](https://github.com/user-attachments/assets/513cbbf0-a338-4fd8-93eb-d367357feca3)

#### Total memory usage
![image-1](https://github.com/user-attachments/assets/6cf9c411-c22e-4b21-979e-9e2349bb3b3d)

### v1.2.0
#### Runtime
![image](https://github.com/user-attachments/assets/310a00f9-4c40-476e-a1b8-e18533e12bc0)

#### Total memory usage
![memoryBench](https://github.com/user-attachments/assets/de81c713-5b99-40b4-8b92-277adfe5d256)
