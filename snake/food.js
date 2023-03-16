module.exports = class Food {
  constructor(world, x, y){
    if (!x || !y) {
      do {
        x = this.getRandomNumber(2, world.x - 1);
        y = this.getRandomNumber(2, world.y - 1);
      } while (world.isEmpty(x, y) && !world.snake.in(x, y))
    }

    this.x = x
    this.y = y

    world.world[this.x][this.y] = '$'
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
  }
}