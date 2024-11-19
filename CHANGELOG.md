## release_v1.0.0 - Initial release

## release_v1.0.1 2024-11-19
* Refactored error handler
* Refactor csv parser class
* Transfer all logic related to csv parsing to the parser class
* Modify the line processor so it returns a processed line instead of directly taking in the writeStream as an argument
* Modify the line processor so that it does not take any options as an argument