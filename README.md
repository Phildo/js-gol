js-gol
======

Javascript library for Conway's Game of Life. (http://en.wikipedia.org/wiki/Conway's_Game_of_Life)

Sample page hosted here- http://www.brokenglider.com/misc/js-gol/sample.html (at least, it WAS hosted there as of Jun 22 2013...)

Easily create instances of CGoL with custom sizes, colors, starting patterns, etc...
Pause, play, set patterns, edit individual node states. Good stuff.

Examples:
======

Create a gol instance:

    var gol = new GameOfLife(params);

Params should be an object with certain properties set to specify details for the construction of the game of life. Any property missing will result in the use of a default value.
If no params are specified, all defaults will be chosen.

Format of the params:

    var params = {
      "width":100,  //width of canvas (pixels)
      "height":100, //height of canvas (pixels)
      "size":10, //width&height of individual nodes (pixels) Note- includes padding
      "padding":2, //space in between nodes (pixels)
      "xlen":10, //width of grid (nodes)
      "ylen":10, //height of grid (nodes)
      "color":"#000000",   //color of filled nodes (hex string)
      "bgcolor":"#FFFFFF", //color of background (hex string)
      "speed":60, //ticks per minute
      "edge":"wrap", //the policy for what to do with nodes just off the grid. options are "wrap", "clear", or "set" (NOTE- set results in some pretty weird shiz)
      "autoplay":false, //whether it should start playing automatically on generation
      "callback":function(gol) {}, //function called on every tick
      "parentContainer":document.getElementById("gol"), //DOM element to which gol canvas will be added
      "startingGrid":[0,0,0,0,0,0,0,0,0,0, //array of 0's and 1's the exact size of the grid (xlen*ylen)
                      0,0,0,0,0,0,0,0,0,0, //NOTE- if array is not exact size of grid, this parameter
                      0,0,0,0,0,0,0,0,0,0, //will be ignored.
                      0,0,0,0,0,0,0,0,0,0,
                      0,0,0,0,0,1,0,0,0,0,
                      0,0,0,0,0,0,1,0,0,0,
                      0,0,0,0,1,1,1,0,0,0,
                      0,0,0,0,0,0,0,0,0,0,
                      0,0,0,0,0,0,0,0,0,0,
                      0,0,0,0,0,0,0,0,0,0]
    }

API:

    gol.play(); //Resumes the computation of the game of life if it is currently paused. If not, does nothing.
    gol.pause(); //Pauses the computation of the game of life if it is currently playing. If not, does nothing.
    gol.tick(); //Manually perform one 'tick' of computation (also will take care of drawing)
    gol.clear(); //Clears all nodes NOTE- takes effect next tick
    gol.randomize(); //Sets all nodes to random values NOTE- takes effect next tick
    gol.setPattern(pattern); //Takes in array of node states (exact same formatting as "startingGrid" property in init params //NOTE- takes effect next tick
    gol.getPattern(); //Returns array of node states reflecting the current state of the grid (exact same formatting as "startingGrid" property in init params
    gol.setNode(x,y); //Sets the node at grid location x,y (top left = 0,0) NOTE- takes effect next tick
    gol.clearNode(x,y); //Clears the node at grid location x,y (top left = 0,0) NOTE- takes effect next tick
