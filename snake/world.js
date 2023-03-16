const Snake = require('./snake')
const Food = require('./food')

module.exports = class World {
  constructor(rows, columns){
    this.score = 0
    this.x = rows
    this.y = columns
    //rows += 2
    //columns += 2


    this.world = []

    for (let row = 0; row < rows; row++) {
      this.world[row] = []
      for (let col = 0; col < columns; col++) {
        this.world[row][col] = ' '
      }
    }

    this.world[0][0] = '+'
    this.world[rows - 1][0] = '+'
    this.world[0][columns - 1] = '+'
    this.world[rows - 1][columns - 1] = '+'

    for (let row = 1; row < rows - 1; row++)
      this.world[row][0] = this.world[row][columns - 1] = '|'
    
    for (let col = 1; col < columns - 1; col++)
      this.world[0][col] = this.world[rows - 1][col] = '-'
    
    this.snake = new Snake(this, 4, 6, 3, 'D')
    this.food = new Food(this)
  }

  isEmpty(x, y) {
    return this.world[x][y] === ' ';
  }
  
  isFood(x, y) {
    return this.world[x][y] === '$';
  }

  toString() {
    let s = ''
    for (let row = 0; row < this.world.length; row++) {
      for (let col = 0; col < this.world[row].length; col++) {
        let snakeSegmentIndex = this.snake.in(row, col)
        if (snakeSegmentIndex < 0 || this.world[row][col] === '*') {
          s += this.world[row][col]
        } else {
          if (snakeSegmentIndex === 0) {
            s += 'O'
          } else {
            s += 'o'
          }
        }
      }
      s += '\n'
    }

    return s
  }

  toNet(){
    //[ DAN STRAIGHT, DAN RIGHT, DAN LEFT,   DIR LEFT, DIR RIGHT, DIR UP, DIR DOWN,   FOOD LEFT, FOOD RIGHT, FOOD UP, FOOD DOWN ]
    let arr = [0, 0, 0,   0, 0, 0, 0,   0, 0, 0, 0]
    let head  = this.snake.snake[0];
  
    for (let row = head[0]; row < this.x; row++) {
      for (let col = head[1]; col < this.y; col++) {
        if(this.world[row][col] == '$'){
          arr[8] = head[1] / col // RIGHT
          arr[10] = head[0] / row // DOWN
          break
        }
      }
    }
    
    // LEFT UP
    for (let row = head[0]; row > 0; row--) {
      for (let col = head[1]; col > 0; col--) {
        if(this.world[row][col] == '$'){
          arr[7] = col / head[1] // LEFT
          arr[9] = row / head[0] // UP
          break
        }
      }
    }
    
    // RIGHT UP
    for (let row = head[0]; row > 0; row--) {
      for (let col = head[1]; col < this.y; col++) {
        if(this.world[row][col] == '$'){
          arr[8] = head[1] / col // RIGHT
          arr[9] = row / head[0] // UP
          break
        }
      }
    }
    
    // LEFT DOWN
    for (let row = head[0]; row < this.x; row++) {
      for (let col = head[1]; col > 0; col--) {
        if(this.world[row][col] == '$'){
          arr[7] = col / head[1] // LEFT
          arr[10] = head[0] / row // DOWN
          break
        }
      }
    }
  
    switch (this.snake.direction.toUpperCase()) {
      // Column movement
      case 'U':
        arr[5] = 1
        if(!this.isEmpty(head[0] - 1, head[1]) && !this.isFood(head[0] - 1, head[1]) || this.snake.in(head[0] - 1, head[1]) > 0)
          arr[0] = 1
        if(!this.isEmpty(head[0], head[1] + 1) && !this.isFood(head[0], head[1] + 1) || this.snake.in(head[0], head[1] + 1) > 0)
          arr[1] = 1
        if(!this.isEmpty(head[0], head[1] - 1) && !this.isFood(head[0], head[1] - 1) || this.snake.in(head[0], head[1] - 1) > 0)
          arr[2] = 1
        break;
      case 'D':
        arr[6] = 1
        if(!this.isEmpty(head[0] + 1, head[1]) && !this.isFood(head[0] + 1, head[1]) || this.snake.in(head[0] + 1, head[1]) > 0)
          arr[0] = 1
        if(!this.isEmpty(head[0], head[1] - 1) && !this.isFood(head[0], head[1] - 1) || this.snake.in(head[0], head[1] - 1) > 0)
          arr[1] = 1
        if(!this.isEmpty(head[0], head[1] + 1) && !this.isFood(head[0], head[1] + 1) || this.snake.in(head[0], head[1] + 1) > 0)
          arr[2] = 1
        break;
      // Row movement
      case 'L':
        arr[3] = 1
        if(!this.isEmpty(head[0], head[1] - 1) && !this.isFood(head[0], head[1] - 1) || this.snake.in(head[0], head[1] - 1) > 0)
          arr[0] = 1
        if(!this.isEmpty(head[0] - 1, head[1]) && !this.isFood(head[0] - 1, head[1]) || this.snake.in(head[0] - 1, head[1]) > 0)
          arr[1] = 1
        if(!this.isEmpty(head[0] + 1, head[1]) && !this.isFood(head[0] + 1, head[1]) || this.snake.in(head[0] + 1, head[1]) > 0)
          arr[2] = 1
        break;
      case 'R':
        arr[4] = 1
        if(!this.isEmpty(head[0], head[1] + 1) && !this.isFood(head[0], head[1] + 1) || this.snake.in(head[0], head[1] + 1) > 0)
          arr[0] = 1
        if(!this.isEmpty(head[0] + 1, head[1]) && !this.isFood(head[0] + 1, head[1]) || this.snake.in(head[0] + 1, head[1]) > 0)
          arr[1] = 1
        if(!this.isEmpty(head[0] - 1, head[1]) && !this.isFood(head[0] - 1, head[1]) || this.snake.in(head[0] - 1, head[1]) > 0)
          arr[2] = 1
        break;
    }
  
    return arr
  }
}