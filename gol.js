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
  this.width  = this.parentContainer.offsetWidth;
  this.height = this.parentContainer.offsetHeight;
  if(params.width)   this.width   = params.width;
  if(params.height)  this.height  = params.height;
  if(params.size)    this.size    = params.size;    else this.size    = 10;
  if(params.padding) this.padding = params.padding; else this.padding = Math.floor(this.size*0.2);
  if(params.xlen)    this.xlen    = params.xlen;    else this.xlen    = Math.floor(this.width/this.size);
  if(params.ylen)    this.ylen    = params.ylen;    else this.ylen    = Math.floor(this.height/this.size);
  if(params.color)   this.color   = params.color;   else this.color   = "#000000";
  if(params.bgcolor) this.bgcolor = params.bgcolor; else this.bgcolor = "#FFFFFF";
  if(params.speed)   this.speed   = params.speed;   else this.speed   = 60;//ticks per minute
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
        if(nodes[(this.y-1)*ylen+(this.x-1)]) this.neighbors.push(nodes[(this.y-1)*ylen+(this.x-1)]);
        if(nodes[(this.y  )*ylen+(this.x-1)]) this.neighbors.push(nodes[(this.y  )*ylen+(this.x-1)]);
        if(nodes[(this.y+1)*ylen+(this.x-1)]) this.neighbors.push(nodes[(this.y+1)*ylen+(this.x-1)]);
        if(nodes[(this.y-1)*ylen+(this.x  )]) this.neighbors.push(nodes[(this.y-1)*ylen+(this.x  )]);
        if(nodes[(this.y+1)*ylen+(this.x  )]) this.neighbors.push(nodes[(this.y+1)*ylen+(this.x  )]);
        if(nodes[(this.y-1)*ylen+(this.x+1)]) this.neighbors.push(nodes[(this.y-1)*ylen+(this.x+1)]);
        if(nodes[(this.y  )*ylen+(this.x+1)]) this.neighbors.push(nodes[(this.y  )*ylen+(this.x+1)]);
        if(nodes[(this.y+1)*ylen+(this.x+1)]) this.neighbors.push(nodes[(this.y+1)*ylen+(this.x+1)]);
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
        nodes[y*self.ylen+x] = new Node(x,y);
    findAllNeighbors();
  }

  var findAllNeighbors = function()
  {
    for(var x = 0; x < self.xlen; x++)
      for(var y = 0; y < self.ylen; y++)
        nodes[y*self.ylen+x].findNeighbors(nodes, self.xlen, self.ylen);
  }

  var decideAllNodes = function()
  {
    for(var x = 0; x < self.xlen; x++)
      for(var y = 0; y < self.ylen; y++)
        nodes[y*self.ylen+x].decide();
  }

  var commitAllNodes = function()
  {
    for(var x = 0; x < self.xlen; x++)
      for(var y = 0; y < self.ylen; y++)
        nodes[y*self.ylen+x].commit();
  }

  var drawAllNodes = function()
  {
    self.canvas.context.fillStyle = self.bgcolor;
    self.canvas.context.fillRect(0, 0, self.width, self.height);

    for(var x = 0; x < self.xlen; x++)
      for(var y = 0; y < self.ylen; y++)
        drawNode(nodes[y*self.ylen+x]);
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
  };

  this.play  = function(){ if(!ticker) ticker = setInterval(tick,Math.round(60000/this.speed)) };
  this.pause = function(){ if(ticker)  ticker = clearInterval(ticker); }

  this.clear = function()
  {
    for(var x = 0; x < this.xlen; x++)
      for(var y = 0; y < this.ylen; y++)
        nodes[y*this.ylen+x].next = 0;
  };
  this.randomize = function()
  {
    for(var x = 0; x < this.xlen; x++)
      for(var y = 0; y < this.ylen; y++)
        nodes[y*this.ylen+x].next = Math.round(Math.random());
  };
  this.setPattern = function(pattern)
  {
    for(var x = 0; x < this.xlen; x++)
      for(var y = 0; y < this.ylen; y++)
        nodes[y*this.ylen+x].next = pattern[y*this.ylen+x];
  };

  this.canvas = document.createElement('canvas');
  this.canvas.context = this.canvas.getContext('2d');
  this.canvas.width  = this.width;
  this.canvas.height = this.height;
  this.parentContainer.appendChild(this.canvas);

  generateAllNodes();
  if(this.startingGrid) this.setPattern(this.startingGrid);
  this.play();
};
