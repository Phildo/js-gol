function GameOfLife(params)
{
  var self = this;

  if(params.debug) this.debug = params.debug; else this.debug = false;
  if(!(this.parentContainer = params.parentContainer))
  {
    this.parentContainer = document.createElement('div');
    this.parentContainer.width  = 100;
    this.parentContainer.height = 100;
  }
  if(params.width)    this.width    = params.width;    else this.width    = 0;
  if(params.height)   this.height   = params.height;   else this.height   = 0;
  if(params.size)     this.size     = params.size;     else this.size     = 0;
  if(params.padding)  this.padding  = params.padding;  else this.padding  = Math.floor(this.size*0.2);
  if(params.xlen)     this.xlen     = params.xlen;     else this.xlen     = 0;
  if(params.ylen)     this.ylen     = params.ylen;     else this.ylen     = 0;
  if(params.color)    this.color    = params.color;    else this.color    = "#000000";
  if(params.bgcolor)  this.bgcolor  = params.bgcolor;  else this.bgcolor  = "#FFFFFF";
  if(params.speed)    this.speed    = params.speed;    else this.speed    = 60;//ticks per minute
  if(params.callback) this.callback = params.callback; else this.callback = function(gol){};

  //Special cases of inferring certain defaults
  if(!this.xlen && !this.ylen)
  {
    if(!this.size) this.size = 10;
    if(!this.width)  this.width  = this.parentContainer.offsetWidth;
    if(!this.height) this.height = this.parentContainer.offsetHeight;
    this.xlen = Math.floor(this.width/this.size);
    this.ylen = Math.floor(this.height/this.size);
  }
  if(!this.width && !this.height)
  {
    if(!this.size) this.size = 10;
    this.width  = this.size*this.xlen;
    this.height = this.size*this.ylen;
  }

  if(params.startingGrid && params.startingGrid.length == this.xlen*this.ylen) this.startingGrid = params.startingGrid;

  var nodes = [];
  var ticker = null;

  var Node = function(x,y)
  {
      this.x = x;
      this.y = y;
      this.state = 0;
      this.next = 0;

      this.neighbors = [];
      this.findNeighbors = function(nodes, xlen, ylen)
      {
        this.neighbors = [];
        if(this.x > 0        && this.y > 0       ) this.neighbors.push(nodes[(this.y-1)*xlen+(this.x-1)]);
        if(this.x > 0                            ) this.neighbors.push(nodes[(this.y  )*xlen+(this.x-1)]);
        if(this.x > 0        && this.y < (ylen-1)) this.neighbors.push(nodes[(this.y+1)*xlen+(this.x-1)]);
        if(                     this.y > 0       ) this.neighbors.push(nodes[(this.y-1)*xlen+(this.x  )]);
        if(                     this.y < (ylen-1)) this.neighbors.push(nodes[(this.y+1)*xlen+(this.x  )]);
        if(this.x < (xlen-1) && this.y > 0       ) this.neighbors.push(nodes[(this.y-1)*xlen+(this.x+1)]);
        if(this.x < (xlen-1)                     ) this.neighbors.push(nodes[(this.y  )*xlen+(this.x+1)]);
        if(this.x < (xlen-1) && this.y < (ylen-1)) this.neighbors.push(nodes[(this.y+1)*xlen+(this.x+1)]);
      };

      this.decide = function()
      {
        var count = 0;
        for(var i = 0; i < this.neighbors.length; i++)
          count += this.neighbors[i].state;

        switch(count)
        {
          case 0:
          case 1: //fewer than two- underpopulation
            this.next = 0;
            break;
          case 2: //stability
            break;
          case 3: //reproduction- either stays living or is born
            this.next = 1;
            break;
          case 4:
          case 5:
          case 6:
          case 7:
          case 8: //more than three- overpopulation
            this.next = 0;
            break;
        }
      }
      this.commit = function(){ this.state = this.next; }
  };

  var generateAllNodes = function()
  {
    for(var x = 0; x < self.xlen; x++)
      for(var y = 0; y < self.ylen; y++)
        nodes[y*self.xlen+x] = new Node(x,y);
    findAllNeighbors();
  }

  var findAllNeighbors = function()
  {
    for(var x = 0; x < self.xlen; x++)
      for(var y = 0; y < self.ylen; y++)
        nodes[y*self.xlen+x].findNeighbors(nodes, self.xlen, self.ylen);
  }

  var decideAllNodes = function()
  {
    for(var x = 0; x < self.xlen; x++)
      for(var y = 0; y < self.ylen; y++)
        nodes[y*self.xlen+x].decide();
  }

  var commitAllNodes = function()
  {
    for(var x = 0; x < self.xlen; x++)
      for(var y = 0; y < self.ylen; y++)
        nodes[y*self.xlen+x].commit();
  }

  var drawAllNodes = function()
  {
    self.canvas.context.fillStyle = self.bgcolor;
    self.canvas.context.fillRect(0, 0, self.width, self.height);

    for(var x = 0; x < self.xlen; x++)
      for(var y = 0; y < self.ylen; y++)
        drawNode(nodes[y*self.xlen+x]);
  }

  var drawNode = function(node)
  {
    if(node.state == 1)
    {
      self.canvas.context.fillStyle = self.color;
      self.canvas.context.fillRect(node.x*self.size+self.padding/2,node.y*self.size+self.padding/2,self.size-self.padding,self.size-self.padding);
    }
  }

  var tick = function()
  {
    commitAllNodes();
    drawAllNodes();
    decideAllNodes();
    self.callback(self);
  };

  this.play  = function(){ if(!ticker) { tick(); ticker = setInterval(tick,Math.round(60000/this.speed)); } };
  this.pause = function(){ if(ticker)  ticker = clearInterval(ticker); }

  this.clear = function()
  {
    for(var x = 0; x < this.xlen; x++)
      for(var y = 0; y < this.ylen; y++)
        nodes[y*this.xlen+x].next = 0;
  };
  this.randomize = function()
  {
    for(var x = 0; x < this.xlen; x++)
      for(var y = 0; y < this.ylen; y++)
        nodes[y*this.xlen+x].next = Math.round(Math.random());
  };
  this.setPattern = function(pattern)
  {
    for(var y = 0; y < this.ylen; y++)
      for(var x = 0; x < this.xlen; x++)
        nodes[y*this.xlen+x].next = pattern[y*this.xlen+x];
  };
  this.getPattern = function()
  {
    var pattern = [];
    for(var y = 0; y < this.ylen; y++)
      for(var x = 0; x < this.xlen; x++)
        pattern[y*this.xlen+x] = nodes[y*this.xlen+x].state;
    return pattern;
  };
  this.setNode = function(x,y)
  {
    nodes[y*this.xlen+x].next = 1;
  };
  this.clearNode = function(x,y)
  {
    nodes[y*this.xlen+x].next = 0;
  };

  this.canvas = document.createElement('canvas');
  this.canvas.context = this.canvas.getContext('2d');
  this.canvas.width  = this.width;
  this.canvas.height = this.height;
  this.canvas.context.imageSmoothingEnabled = false;
  this.canvas.context.webkitImageSmoothingEnabled = false;
  this.parentContainer.appendChild(this.canvas);

  generateAllNodes();
  if(this.startingGrid) this.setPattern(this.startingGrid);
  this.play();
};
