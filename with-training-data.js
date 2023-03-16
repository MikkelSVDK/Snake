const clc = require('cli-color')

const Network = require('./network/network')
const World = require('./snake/world')

let topScore = 0

const trainingData = [
  { input: [1, 0, 0,   0, 0, 0, 0,   0, 0, 0, 0], output: [0, 1, 1] },
  { input: [1, 1, 0,   0, 0, 0, 0,   0, 0, 0, 0], output: [0, 0, 1] },
  { input: [1, 0, 1,   0, 0, 0, 0,   0, 0, 0, 0], output: [0, 1, 0] },
  { input: [0, 0, 1,   0, 0, 0, 0,   0, 0, 0, 0], output: [1, 0, 0] },
  { input: [0, 1, 0,   0, 0, 0, 0,   0, 0, 0, 0], output: [1, 0, 0] },

  // FOOD DOWN RIGHT
  { input: [0, 0, 0,   0, 1, 0, 0,   0, 1, 0, 1], output: [1, 0, 0] },
  { input: [0, 0, 0,   0, 1, 0, 0,   1, 1, 0, 1], output: [0, 1, 0] },
  { input: [0, 0, 0,   0, 0, 0, 1,   1, 1, 0, 1], output: [1, 0, 0] },
  
  { input: [0, 0, 0,   0, 0, 1, 0,   0, 1, 0, 1], output: [0, 1, 1] },
  { input: [0, 0, 0,   0, 0, 1, 0,   1, 1, 0, 1], output: [0, 1, 1] },
  
  { input: [0, 0, 0,   0, 0, 0, 1,   0, 1, 0, 1], output: [1, 0, 0] },
  
  { input: [0, 0, 0,   1, 0, 0, 0,   0, 1, 0, 1], output: [0, 1, 1] },

  // FOOD UP RIGHT
  { input: [0, 0, 0,   0, 1, 0, 0,   0, 1, 1, 0], output: [1, 0, 0] },
  { input: [0, 0, 0,   0, 1, 0, 0,   1, 1, 1, 0], output: [0, 0, 1] },
  { input: [0, 0, 0,   0, 0, 1, 0,   1, 1, 1, 0], output: [1, 0, 0] },
  
  { input: [0, 0, 0,   0, 0, 0, 1,   0, 1, 1, 0], output: [0, 1, 1] },
  { input: [0, 0, 0,   0, 0, 0, 1,   1, 1, 1, 0], output: [0, 1, 1] },
  
  { input: [0, 0, 0,   0, 0, 1, 0,   0, 1, 1, 0], output: [1, 0, 0] },
  
  { input: [0, 0, 0,   1, 0, 0, 0,   0, 1, 1, 0], output: [0, 1, 1] },

  // FOOD DOWN LEFT
  { input: [0, 0, 0,   1, 0, 0, 0,   1, 0, 0, 1], output: [1, 0, 0] },
  { input: [0, 0, 0,   1, 0, 0, 0,   1, 1, 0, 1], output: [0, 0, 1] },
  { input: [0, 0, 0,   0, 0, 0, 1,   1, 1, 0, 1], output: [1, 0, 0] },

  // FOOD UP LEFT
  { input: [0, 0, 0,   1, 0, 0, 0,   1, 0, 1, 0], output: [1, 0, 0] },
  { input: [0, 0, 0,   1, 0, 0, 0,   1, 1, 1, 0], output: [0, 1, 0] },
  { input: [0, 0, 0,   0, 0, 1, 0,   1, 1, 1, 0], output: [1, 0, 0] },
  { input: [0, 1, 0,   1, 0, 0, 0,   0, 0, 0, 0], output: [1, 0, -1] },
]

let network = new Network([11, 10, 3])
network.setLearningRate(0.3);

(async () => {
  for(var n = 0; n < 1000; n ++) {
    let nextGen = Date.now() + 30000
    for(var i = 0; i < 500; i ++) {
      const trainingItem = trainingData[Math.floor((Math.random() * trainingData.length))]
      network.train(trainingItem.input, trainingItem.output);
    }
    
    let world = new World(15, 40)
    let worldToNet, netToDirection
    while(!world.snake.dead){
      network.activate(worldToNet = world.toNet())
      world.snake.setDirection(netToDirection = network.run())
      world.snake.move()
      
      console.clear()
      console.log(`top score: ${topScore} | score: ${world.score} | run: ${n + 1} | iterations: ${(n+1) * 500} | next run: ${((nextGen - Date.now()) / 1000).toFixed(1)}`)
      console.log(world.toString())
      
      let netToDirectionBest = netToDirection.indexOf(Math.max.apply(0,netToDirection))
      console.log(`walls:\nstraight: ${worldToNet[0]} | right: ${worldToNet[1]} | left: ${worldToNet[2]}\n\ndirection:\nleft: ${worldToNet[3]} | right: ${worldToNet[4]} | up: ${worldToNet[5]} | down: ${worldToNet[6]}\n\nfood:\nleft: ${worldToNet[7].toFixed(3)} | right: ${worldToNet[8].toFixed(3)} | up: ${worldToNet[9].toFixed(3)} | down: ${worldToNet[10].toFixed(3)}\n\nnet:\nstraight: ${netToDirectionBest == 0 ? clc.greenBright(netToDirection[0].toFixed(3)) : clc.red(netToDirection[0].toFixed(3))} | right: ${netToDirectionBest == 1 ? clc.greenBright(netToDirection[1].toFixed(3)) : clc.red(netToDirection[1].toFixed(3))} | left: ${netToDirectionBest == 2 ? clc.greenBright(netToDirection[2].toFixed(3)) : clc.red(netToDirection[2].toFixed(3))}`)


      if(nextGen < Date.now() || world.snake.lastFood + 4000 < Date.now())
        world.snake.dead = true

      await sleep(10)
    }
    if(world.score > topScore)
      topScore = world.score

    if(nextGen > Date.now() && world.snake.lastFood + 4000 > Date.now()){
      let i = trainingData.findIndex(i => 
        i.input[0] == worldToNet[0] &&
        i.input[1] == worldToNet[1] &&
        i.input[2] == worldToNet[2] &&
        i.input[3] == worldToNet[3] &&
        i.input[4] == worldToNet[4] &&
        i.input[5] == worldToNet[5] &&
        i.input[6] == worldToNet[6]
      )
      if(i == -1)
        trainingData.push({
          input: [
            worldToNet[0],
            worldToNet[1],
            worldToNet[2],
            worldToNet[3],
            worldToNet[4],
            worldToNet[5],
            worldToNet[6],
            0,
            0,
            0,
            0
          ],
          output: [
            1 - worldToNet[0],
            worldToNet[0] == 0 ? 0 : 1 - worldToNet[1],
            worldToNet[0] == 0 ? 0 : 1 - worldToNet[2]
          ]
        })
    }
    
    await sleep(1000)
  }
})()

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}