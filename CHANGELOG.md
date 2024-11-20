## release_v1.0.0 - Initial release

## release_v1.0.1 2024-11-19
* Refactored error handler
* Refactor csv parser class
* Transfer all logic related to csv parsing to the parser class
* Modify the line processor so it returns a processed line instead of directly taking in the writeStream as an argument
* Modify the line processor so that it does not take any options as an argument
* Implement heuristic delimiter detector
* Implement detection of characters equalling the delimiter in the data itself, and handling it correctly
* Refactor line processor to not use the built-in JSON methods, and instead process the csv lines recursively and return the processed line directly to improve performance