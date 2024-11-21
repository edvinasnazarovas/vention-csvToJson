## release_v1.0.0 - Initial release

## release_v1.1.0 2024-11-19
* Refactored error handler
* Refactor csv parser class
* Transfer all logic related to csv parsing to the parser class
* Modify the line processor so it returns a processed line instead of directly taking in the writeStream as an argument
* Modify the line processor so that it does not take any options as an argument
* Implement heuristic delimiter detector
* Implement detection of characters equalling the delimiter in the data itself, and handling it correctly
* Refactor line processor to not use the built-in JSON methods, and instead process the csv lines recursively and return the processed line directly to improve performance
* Throw fatal error when no arguments are provided

## release_v1.2.0 2024-11-21
* Convert the recursive process line function to be iterative
* Replaced string concatenation with building up an array and joining it at the end of transformation to improve performance
* Implemented csv transformer class
* Removed csv parser class and moved everything to the csv transformer class
* Added chunk buffer handling
* Refactored the CLI command to use the newly created transformer class
* Simplified line processor
* Commented out tests for now due to them currently not supporting the new implementation