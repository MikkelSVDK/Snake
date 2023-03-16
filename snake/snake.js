const Food = require('./food')

module.exports = class Snake {
  constructor(world, x, y, length, direction){
    this.dead = false
    this.world = world
    this.x = x
    this.y = y
    this.lastFood = Date.now()

    this.snake = []

    let Br = Number(x)
    let Bc = Number(y)
    this.direction = direction
    for (let body = 0; body < length; body++) {
      switch (direction.toUpperCase()) {
        case 'R':
          Bc--
          break
        case 'L':
          Bc++
          break
        case 'U':
          Br++
          break
        case 'D':
          Br--
          break
      }
      if ((0 < Br) && (Br < world.x - 1) && (0 < Bc) && (Bc < world.y - 1)) {
        this.snake.push([Br, Bc])
      } else
        throw new Error('To long')
    }
  }

  setDirection(direction) {
    let i = direction.indexOf(Math.max.apply(0,direction))
    if(this.direction == 'U'){
      if(i == 1)
        this.direction = 'R'
      else if(i == 2)
        this.direction = 'L'
    }else if(this.direction == 'D'){
      if(i == 1)
        this.direction = 'L'
      else if(i == 2)
        this.direction = 'R'
    }else if(this.direction == 'L'){
      if(i == 1)
        this.direction = 'U'
      else if(i == 2)
        this.direction = 'D'
    }else if(this.direction == 'R'){
      if(i == 1)
        this.direction = 'D'
      else if(i == 2)
        this.direction = 'U'
    }
  }

  in(r, c) {
    for (let snakeSegmentIndex = 0; snakeSegmentIndex < this.snake.length; snakeSegmentIndex++) {
      let snakeSegmentCoordinates = this.snake[snakeSegmentIndex]
      if (snakeSegmentCoordinates[0] === r && snakeSegmentCoordinates[1] === c) {
        return snakeSegmentIndex
      }
    }
    return -1
  }

  move(){
    let head  = this.snake[0]
    switch (this.direction.toUpperCase()) {
      case 'R':
        this.x = head[0]
        this.y = head[1] + 1
        break
      case 'L':
        this.x = head[0]
        this.y = head[1] - 1
        break
      case 'U':
        this.x = head[0] - 1
        this.y = head[1]
        break
      case 'D':
        this.x = head[0] + 1
        this.y = head[1]
        break
    }
    if (this.world.isEmpty(this.x, this.y)) {
      if (this.in(this.x, this.y) < 0) {
        this.snake.unshift([this.x, this.y]);
        this.snake.pop();
      } else {
        this.world.world[this.x][this.y] = '*'
        this.dead = true
      }
    } else if (this.world.isFood(this.x, this.y)) {
      this.world.world[this.x][this.y] = ' '
      this.snake.unshift([this.x, this.y]);
      this.world.food = new Food(this.world)
      this.world.score += 1
      this.lastFood = Date.now()
    } else {
      this.world.world[this.x][this.y] = '*'
      this.dead = true
    }
  }
}