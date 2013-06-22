function GameOfLife(params)
{
  if(!(this.parentContainer = params.parentContainer))
    this.parentContainer = document.createElement('div');
    this.parentContainer.width  = 100;
    this.parentContainer.height = 100;
  }
  this.width  = this.parentContainer.offsetWidth;
  this.height = this.parentContainer.offsetHeight;
  if(params.width)   this.width   = params.width;
  if(params.height)  this.height  = params.height;
  if(params.size)    this.size    = params.size;    else this.size    = 10;
  if(params.padding) this.padding = params.padding  else this.padding = Math.floor(this.size*0.2);
  if(params.xlen)    this.xlen    = params.xlen;    else this.xlen    = Math.floor(this.width/this.size);
  if(params.ylen)    this.ylen    = params.ylen;    else this.ylen    = Math.floor(this.width/this.size);
  if(params.color)   this.color   = params.color;   else this.color   = "#000000";
  if(params.bgcolor) this.bgcolor = params.bgcolor; else this.bgcolor = "#FFFFFF";
  if(params.speed)   this.speed   = params.speed;   else this.speed   = 60;//ticks per minute
  if(params.startingGrid && params.startingGrid.length == this.xlen*this.ylen)
    this.startingGrid = params.startingGrid;
  else
    this.startingGrid = [];

  if(params.debug) this.debug = params.debug; else this.debug = false;

  this.canvas = document.createElement('canvas');
  this.canvas.context = this.canvas.getContext('2d');
  this.canvas.width  = this.width;
  this.canvas.height = this.height;

  var ticker = null;

  this.play  = function(){ if(!ticker) ticker = setInterval(this.tick,Math.round(6000/this.speed)) };
  this.pause = function(){ if(ticker)  ticker = clearInterval(ticker); }

  this.clear     = function(){ };
  this.randomize = function(){ };

  var Node = function(x,y,next)
  {
      this.x = x;
      this.y = y;
      this.state = 0;
      this.next = state;

      this.commit = function(){ this.state = this.next; }
  };
  var nodes = [];
  for(var x = 0; x < this.width; x++)
    for(var y = 0; y < this.width; y++)
      nodes[x*this.width+y] = new Node(x,y,this.startingGrid[x*this.width+y]);

  var decideNode = function()
  {

  };

  var decideAllNodes = function()
  {
    for(var x = 0; x < this.width; x++)
      for(var y = 0; y < this.width; y++)
        decideNode(nodes[x*this.width+y]);
  };

  var commitAllNodes = function()
  {
    for(var x = 0; x < this.width; x++)
      for(var y = 0; y < this.width; y++)
        nodes[x*this.width+y].commit();
  }

  var drawAllNodes = function()
  {

  }

  this.tick = function()
  {
    commitAllNodes();
    decideAllNodes();
  };
};

/*
      case 0:
      case 1: //fewer than two- underpopulation
        this.clear();
        break;
      case 2: //stability
        break;
      case 3: //reproduction- either stays living or is born
        this.set();
        break;
      case 4:
      case 5:
      case 6:
      case 7:
      case 8: //more than three- overpopulation
        this.clear();
        break;
*/
