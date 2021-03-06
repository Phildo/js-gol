function GameOfLife(params)
{
  var self = this;

  if(!params) params = {};

  if(params.hasOwnProperty('debug')) this.debug = params.debug; else this.debug = false;
  if(!(this.parentContainer = params.parentContainer))
  {
    this.parentContainer = document.createElement('div');
    this.parentContainer.width  = 100;
    this.parentContainer.height = 100;
  }
  if(params.hasOwnProperty('width'))    this.width    = params.width;    else this.width    = 0;
  if(params.hasOwnProperty('height'))   this.height   = params.height;   else this.height   = 0;
  if(params.hasOwnProperty('size'))     this.size     = params.size;     else this.size     = 0;
  if(params.hasOwnProperty('padding'))  this.padding  = params.padding;  else this.padding  = 2;
  if(params.hasOwnProperty('xlen'))     this.xlen     = params.xlen;     else this.xlen     = 0;
  if(params.hasOwnProperty('ylen'))     this.ylen     = params.ylen;     else this.ylen     = 0;
  if(params.hasOwnProperty('color'))    this.color    = params.color;    else this.color    = "#000000";
  if(params.hasOwnProperty('bgcolor'))  this.bgcolor  = params.bgcolor;  else this.bgcolor  = "clear"; //colors also acceptable
  if(params.hasOwnProperty('speed'))    this.speed    = params.speed;    else this.speed    = 60;//ticks per minute
  if(params.hasOwnProperty('edge'))     this.edge     = params.edge;     else this.edge     = "wrap";
  if(params.hasOwnProperty('autoplay')) this.autoplay = params.autoplay; else this.autoplay = false;
  if(params.hasOwnProperty('callback')) this.callback = params.callback; else this.callback = function(gol){};

  //Special cases of inferring certain defaults
  if(!this.xlen && !this.ylen)
  {
    if(!this.size) this.size = 10;
    if(!this.width)  this.width  = this.parentContainer.offsetWidth;  if(!this.width)  this.width  = this.parentContainer.width;
    if(!this.height) this.height = this.parentContainer.offsetHeight; if(!this.height) this.height = this.parentContainer.height;
    this.xlen = Math.floor(this.width/this.size);
    this.ylen = Math.floor(this.height/this.size);
  }
  if(!this.width && !this.height)
  {
    if(!this.size) this.size = 10;
    this.width  = this.size*this.xlen;
    this.height = this.size*this.ylen;
  }

  if(params.hasOwnProperty('startingGrid') && params.startingGrid.length == this.xlen*this.ylen) this.startingGrid = params.startingGrid;

  var Node = function(x,y)
  {
      this.x = x;
      this.y = y;
      this.state = 0;
      this.next = 0;

      this.neighbors = [];
      this.findNeighbors = function(nodes, xlen, ylen, edgePolicy)
      {
        this.neighbors = [];
        if(edgePolicy == "wrap")
        {
          this.neighbors.push(nodes[((this.y-1+ylen)%ylen)*xlen+((this.x-1+xlen)%xlen)]);
          this.neighbors.push(nodes[( this.y             )*xlen+((this.x-1+xlen)%xlen)]);
          this.neighbors.push(nodes[((this.y+1)     %ylen)*xlen+((this.x-1+xlen)%xlen)]);
          this.neighbors.push(nodes[((this.y-1+ylen)%ylen)*xlen+( this.x             )]);
          this.neighbors.push(nodes[((this.y+1)     %ylen)*xlen+( this.x             )]);
          this.neighbors.push(nodes[((this.y-1+ylen)%ylen)*xlen+((this.x+1)     %xlen)]);
          this.neighbors.push(nodes[( this.y             )*xlen+((this.x+1)     %xlen)]);
          this.neighbors.push(nodes[((this.y+1)     %ylen)*xlen+((this.x+1)     %xlen)]);
        }
        else
        {
          var edgeNode;
          if(edgePolicy == "set") edgeNode = setNode;
          else                    edgeNode = clearNode;

          if(this.x == 0        || this.y == 0       ) this.neighbors.push(edgeNode); else this.neighbors.push(nodes[(this.y-1)*xlen+(this.x-1)]);
          if(this.x == 0                             ) this.neighbors.push(edgeNode); else this.neighbors.push(nodes[(this.y  )*xlen+(this.x-1)]);
          if(this.x == 0        || this.y == (ylen-1)) this.neighbors.push(edgeNode); else this.neighbors.push(nodes[(this.y+1)*xlen+(this.x-1)]);
          if(                      this.y == 0       ) this.neighbors.push(edgeNode); else this.neighbors.push(nodes[(this.y-1)*xlen+(this.x  )]);
          if(                      this.y == (ylen-1)) this.neighbors.push(edgeNode); else this.neighbors.push(nodes[(this.y+1)*xlen+(this.x  )]);
          if(this.x == (xlen-1) || this.y == 0       ) this.neighbors.push(edgeNode); else this.neighbors.push(nodes[(this.y-1)*xlen+(this.x+1)]);
          if(this.x == (xlen-1)                      ) this.neighbors.push(edgeNode); else this.neighbors.push(nodes[(this.y  )*xlen+(this.x+1)]);
          if(this.x == (xlen-1) || this.y == (ylen-1)) this.neighbors.push(edgeNode); else this.neighbors.push(nodes[(this.y+1)*xlen+(this.x+1)]);
        }
      };

      var count;
      this.decide = function()
      {
        count = 0;
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

  var nodes = [];
  var setNode   = new Node(-1,-1); setNode.state   = 1;
  var clearNode = new Node(-1,-1); clearNode.state = 0;
  var ticker = null;

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
        nodes[y*self.xlen+x].findNeighbors(nodes, self.xlen, self.ylen, self.edge);
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
    if(self.bgcolor == "clear")
      self.canvas.context.clearRect(0, 0, self.width, self.height);
    else
    {
      self.canvas.context.fillStyle = self.bgcolor;
      self.canvas.context.fillRect(0, 0, self.width, self.height);
    }

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

  this.tick = function()
  {
    commitAllNodes();
    drawAllNodes();
    decideAllNodes();
    self.callback(self);
  };

  this.play  = function(){ if(!ticker) { self.tick(); ticker = setInterval(self.tick,Math.round(60000/self.speed)); } };
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
  this.getNode = function(x,y)
  {
    return nodes[y*this.xlen+x].state;
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
  if(this.autoplay) this.play();
  else this.tick();//do one tick to get startingGrid on board
};
